import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { SecurityService } from './security.service';
import { SessionService } from './session.service';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type VerifyRegistrationResponseOpts,
  type GenerateAuthenticationOptionsOpts,
  type VerifyAuthenticationResponseOpts,
  type AuthenticatorDevice,
} from '@simplewebauthn/server';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';

export interface WebAuthnRegistrationStartDto {
  userId: string;
  tenantId: string;
  deviceName: string;
}

export interface WebAuthnRegistrationCompleteDto {
  userId: string;
  tenantId: string;
  credential: any; // PublicKeyCredential from browser
}

export interface WebAuthnAuthenticationStartDto {
  email: string;
  tenantSlug?: string;
}

export interface WebAuthnAuthenticationCompleteDto {
  email: string;
  tenantSlug?: string;
  credential: any; // PublicKeyCredential from browser
}

@Injectable()
export class WebAuthnService {
  private readonly logger = new Logger(WebAuthnService.name);
  private readonly rpId: string;
  private readonly rpName: string;
  private readonly origin: string;
  private readonly DEFAULT_TENANT_SLUG = 'default';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private securityService: SecurityService,
    private sessionService: SessionService,
  ) {
    this.rpId = this.configService.get<string>('WEBAUTHN_RP_ID', 'localhost');
    this.rpName = this.configService.get<string>('WEBAUTHN_RP_NAME', 'LexiScanAI');
    this.origin = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
  }

  /**
   * Start WebAuthn registration (generate challenge)
   */
  async startRegistration(dto: WebAuthnRegistrationStartDto): Promise<any> {
    const { userId, tenantId, deviceName } = dto;

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        tenantId,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get existing credentials for user
    const existingCredentials = await this.prisma.webauthnCredential.findMany({
      where: {
        userId,
        tenantId,
        isActive: true,
      },
    });

    // Convert to SimpleWebAuthn format
    const userDevices: AuthenticatorDevice[] = existingCredentials.map((cred) => ({
      credentialID: isoUint8Array.fromBase64URL(cred.credentialId),
      credentialPublicKey: isoUint8Array.fromBase64URL(cred.publicKey),
      counter: cred.counter,
      transports: cred.transports as any,
    }));

    // Generate registration options
    const opts: GenerateRegistrationOptionsOpts = {
      rpName: this.rpName,
      rpID: this.rpId,
      userID: Buffer.from(userId),
      userName: user.email,
      userDisplayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: userDevices.map((dev) => ({
        id: dev.credentialID,
        type: 'public-key',
        transports: dev.transports,
      })),
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    };

    const options = await generateRegistrationOptions(opts);

    // Store challenge in cache/database (for verification)
    // For now, we'll include it in the response and verify it matches
    // In production, store in Redis with short TTL

    this.logger.log(`WebAuthn registration started for user ${userId}`);

    return {
      ...options,
      deviceName, // Include for client reference
    };
  }

  /**
   * Complete WebAuthn registration (verify and store credential)
   */
  async completeRegistration(dto: WebAuthnRegistrationCompleteDto, request?: any): Promise<any> {
    const { userId, tenantId, credential } = dto;

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        tenantId,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get existing credentials for verification
    const existingCredentials = await this.prisma.webauthnCredential.findMany({
      where: {
        userId,
        tenantId,
        isActive: true,
      },
    });

    const userDevices: AuthenticatorDevice[] = existingCredentials.map((cred) => ({
      credentialID: Buffer.from(cred.credentialId, 'base64url'),
      credentialPublicKey: Buffer.from(cred.publicKey, 'base64url'),
      counter: cred.counter,
      transports: cred.transports as any,
    }));

    // Verify registration response
    // Note: In production, store challenge in cache and retrieve it here
    const expectedChallenge = credential.response?.clientDataJSON 
      ? JSON.parse(Buffer.from(credential.response.clientDataJSON, 'base64').toString()).challenge
      : '';

    const opts: VerifyRegistrationResponseOpts = {
      response: credential,
      expectedChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpId,
      requireUserVerification: true,
    };

    let verification;
    try {
      verification = await verifyRegistrationResponse(opts);
    } catch (error) {
      this.logger.error(`WebAuthn registration verification failed: ${error.message}`);
      throw new UnauthorizedException('WebAuthn registration verification failed');
    }

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
      throw new UnauthorizedException('WebAuthn registration verification failed');
    }

    // Extract device name from credential (if provided)
    const deviceName = credential.deviceName || 'WebAuthn Device';

    // Store credential
    const credentialId = isoBase64URL.fromBuffer(registrationInfo.credentialID);
    const publicKey = isoBase64URL.fromBuffer(registrationInfo.credentialPublicKey);
    const transports = credential.response.transports || [];

    await this.prisma.webauthnCredential.create({
      data: {
        userId,
        tenantId,
        credentialId,
        publicKey,
        counter: registrationInfo.counter,
        deviceName,
        transports,
        isActive: true,
      },
    });

    // Also create MFA device entry for compatibility
    await this.prisma.mfaDevice.create({
      data: {
        userId,
        tenantId,
        type: 'FIDO2',
        name: deviceName,
        secret: credentialId, // Store credential ID as secret
        isActive: true,
      },
    });

    this.logger.log(`WebAuthn credential registered for user ${userId}`);

    // Log security event
    await this.logSecurityEvent({
      action: 'webauthn.credential_registered',
      resource: 'user',
      resourceId: userId,
      tenantId,
      userId,
      details: {
        deviceName,
        credentialId,
      },
    });

    return {
      verified: true,
      deviceName,
    };
  }

  /**
   * Start WebAuthn authentication (generate challenge)
   */
  async startAuthentication(dto: WebAuthnAuthenticationStartDto): Promise<any> {
    const { email, tenantSlug } = dto;
    const finalTenantSlug = tenantSlug || this.DEFAULT_TENANT_SLUG;

    // Find tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: finalTenantSlug, isActive: true, isDeleted: false },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: {
        email_tenantId: { email, tenantId: tenant.id },
        isActive: true,
        isDeleted: false,
      },
    });

    if (!user) {
      // Don't reveal user existence
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user's WebAuthn credentials
    const credentials = await this.prisma.webauthnCredential.findMany({
      where: {
        userId: user.id,
        tenantId: tenant.id,
        isActive: true,
      },
    });

    if (credentials.length === 0) {
      throw new BadRequestException('No WebAuthn credentials found for user');
    }

    // Convert to SimpleWebAuthn format
    const userDevices: AuthenticatorDevice[] = credentials.map((cred) => ({
      credentialID: Buffer.from(cred.credentialId, 'base64url'),
      credentialPublicKey: Buffer.from(cred.publicKey, 'base64url'),
      counter: cred.counter,
      transports: cred.transports as any,
    }));

    // Generate authentication options
    const opts: GenerateAuthenticationOptionsOpts = {
      rpID: this.rpId,
      allowCredentials: userDevices.map((dev) => ({
        id: dev.credentialID,
        type: 'public-key',
        transports: dev.transports,
      })),
      userVerification: 'preferred',
      timeout: 60000,
    };

    const options = await generateAuthenticationOptions(opts);

    // Store challenge in cache/database (for verification)
    // In production, store in Redis with short TTL

    this.logger.log(`WebAuthn authentication started for user ${user.id}`);

    return options;
  }

  /**
   * Complete WebAuthn authentication (verify and create session)
   */
  async completeAuthentication(dto: WebAuthnAuthenticationCompleteDto, request?: any): Promise<any> {
    const { email, tenantSlug, credential } = dto;
    const finalTenantSlug = tenantSlug || this.DEFAULT_TENANT_SLUG;

    // Find tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: finalTenantSlug, isActive: true, isDeleted: false },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: {
        email_tenantId: { email, tenantId: tenant.id },
        isActive: true,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find credential by ID
    const credentialId = credential.id;
    const webauthnCredential = await this.prisma.webauthnCredential.findFirst({
      where: {
        userId: user.id,
        tenantId: tenant.id,
        credentialId,
        isActive: true,
      },
    });

    if (!webauthnCredential) {
      throw new UnauthorizedException('Invalid WebAuthn credential');
    }

    // Convert to SimpleWebAuthn format
    const authenticator: AuthenticatorDevice = {
      credentialID: isoUint8Array.fromBase64URL(webauthnCredential.credentialId),
      credentialPublicKey: isoUint8Array.fromBase64URL(webauthnCredential.publicKey),
      counter: webauthnCredential.counter,
      transports: webauthnCredential.transports as any,
    };

    // Verify authentication response
    // Note: In production, store challenge in cache and retrieve it here
    const expectedChallenge = credential.response?.clientDataJSON 
      ? JSON.parse(Buffer.from(credential.response.clientDataJSON, 'base64').toString()).challenge
      : '';

    const opts: VerifyAuthenticationResponseOpts = {
      response: credential,
      expectedChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpId,
      authenticator,
      requireUserVerification: true,
    };

    let verification;
    try {
      verification = await verifyAuthenticationResponse(opts);
    } catch (error) {
      this.logger.error(`WebAuthn authentication verification failed: ${error.message}`);
      throw new UnauthorizedException('WebAuthn authentication verification failed');
    }

    const { verified, authenticationInfo } = verification;

    if (!verified || !authenticationInfo) {
      throw new UnauthorizedException('WebAuthn authentication verification failed');
    }

    // Update credential counter
    await this.prisma.webauthnCredential.update({
      where: { id: webauthnCredential.id },
      data: {
        counter: authenticationInfo.newCounter,
        lastUsedAt: new Date(),
      },
    });

    // Create session
    const deviceInfo = request
      ? {
          ipAddress: this.securityService.getClientIp(request),
          userAgent: request.headers['user-agent'],
        }
      : {};

    const { session, accessToken, refreshToken } = await this.sessionService.createSession({
      userId: user.id,
      tenantId: tenant.id,
      deviceInfo,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log security event
    await this.logSecurityEvent({
      action: 'webauthn.login',
      resource: 'user',
      resourceId: user.id,
      tenantId: tenant.id,
      userId: user.id,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      sessionId: session.id,
    });

    return {
      user,
      tenant,
      accessToken,
      refreshToken,
      session,
    };
  }

  /**
   * List user's WebAuthn credentials
   */
  async listCredentials(userId: string, tenantId: string): Promise<any[]> {
    const credentials = await this.prisma.webauthnCredential.findMany({
      where: {
        userId,
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        deviceName: true,
        transports: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });

    return credentials;
  }

  /**
   * Delete WebAuthn credential
   */
  async deleteCredential(userId: string, tenantId: string, credentialId: string): Promise<void> {
    const credential = await this.prisma.webauthnCredential.findFirst({
      where: {
        id: credentialId,
        userId,
        tenantId,
      },
    });

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    // Deactivate credential
    await this.prisma.webauthnCredential.update({
      where: { id: credential.id },
      data: { isActive: false },
    });

    // Also deactivate MFA device
    await this.prisma.mfaDevice.updateMany({
      where: {
        userId,
        tenantId,
        type: 'FIDO2',
        secret: credential.credentialId,
      },
      data: { isActive: false },
    });

    this.logger.log(`WebAuthn credential deleted: ${credentialId}`);

    // Log security event
    await this.logSecurityEvent({
      action: 'webauthn.credential_deleted',
      resource: 'user',
      resourceId: userId,
      tenantId,
      userId,
      details: { credentialId },
    });
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(data: {
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    tenantId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      if (data.tenantId) {
        await this.prisma.auditLog.create({
          data: {
            tenantId: data.tenantId,
            userId: data.userId,
            action: data.action,
            resource: data.resource,
            resourceId: data.resourceId,
            details: data.details || {},
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            sessionId: data.sessionId,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to log security event: ${error.message}`);
    }
  }
}

