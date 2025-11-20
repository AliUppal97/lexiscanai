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
import * as crypto from 'crypto';
import * as xml2js from 'xml2js';

export interface SamlConfig {
  entryPoint: string; // IdP SSO URL
  issuer: string; // SP entity ID
  cert: string; // IdP certificate
  callbackUrl: string; // ACS (Assertion Consumer Service) URL
  logoutUrl?: string; // SLO (Single Logout) URL
  identifierFormat?: string; // NameID format
  wantAssertionsSigned?: boolean;
  wantMessageSigned?: boolean;
  signatureAlgorithm?: string;
  digestAlgorithm?: string;
  acceptedClockSkewMs?: number;
}

export interface SamlAuthnRequest {
  tenantId: string;
  relayState?: string;
}

export interface SamlResponse {
  SAMLResponse: string;
  RelayState?: string;
}

@Injectable()
export class SamlService {
  private readonly logger = new Logger(SamlService.name);
  private readonly baseUrl: string;
  private readonly stateStore = new Map<string, { tenantId: string; timestamp: number }>();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private securityService: SecurityService,
    private sessionService: SessionService,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');

    // Clean up expired states periodically
    setInterval(() => {
      this.cleanupExpiredStates();
    }, 10 * 60 * 1000);
  }

  /**
   * Create or update SAML provider configuration
   */
  async createSamlProvider(
    tenantId: string,
    name: string,
    config: SamlConfig,
  ): Promise<void> {
    // Validate tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId, isActive: true, isDeleted: false },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Validate SAML configuration
    this.validateSamlConfig(config);

    // Encrypt certificate before storing
    const encryptedCert = this.encryptSecret(config.cert);

    // Prepare config for storage
    const storageConfig = {
      ...config,
      cert: encryptedCert,
    };

    // Create or update SAML provider
    await this.prisma.ssoProvider.upsert({
      where: {
        tenantId_provider: {
          tenantId,
          provider: 'SAML',
        },
      },
      create: {
        tenantId,
        provider: 'SAML',
        name,
        config: storageConfig as any,
        isActive: true,
        isDefault: false,
      },
      update: {
        name,
        config: storageConfig as any,
        isActive: true,
      },
    });

    this.logger.log(`SAML provider created/updated for tenant ${tenantId}`);
  }

  /**
   * Generate SAML AuthnRequest (SP-initiated SSO)
   */
  async generateAuthnRequest(data: SamlAuthnRequest): Promise<{ url: string; relayState: string }> {
    const { tenantId, relayState } = data;

    // Find SAML provider
    const ssoProvider = await this.prisma.ssoProvider.findUnique({
      where: {
        tenantId_provider: {
          tenantId,
          provider: 'SAML',
        },
        isActive: true,
      },
    });

    if (!ssoProvider) {
      throw new NotFoundException('SAML provider not found or inactive');
    }

    const config = ssoProvider.config as any;
    const decryptedCert = this.decryptSecret(config.cert);
    const fullConfig = { ...config, cert: decryptedCert };

    // Generate relay state for CSRF protection
    const state = this.generateState(tenantId);
    const finalRelayState = relayState || state;

    // Generate AuthnRequest XML directly

    // Build redirect URL with AuthnRequest
    const authnRequestXml = this.buildAuthnRequest(fullConfig, finalRelayState);
    const encodedRequest = Buffer.from(authnRequestXml).toString('base64');
    const encodedRelayState = Buffer.from(finalRelayState).toString('base64');

    const url = `${fullConfig.entryPoint}?SAMLRequest=${encodeURIComponent(encodedRequest)}&RelayState=${encodeURIComponent(encodedRelayState)}`;

    this.logger.log(`Generated SAML AuthnRequest for tenant ${tenantId}`);

    return {
      url,
      relayState: finalRelayState,
    };
  }

  /**
   * Handle SAML Response (ACS callback)
   */
  async handleSamlResponse(
    data: SamlResponse,
    request?: any,
  ): Promise<any> {
    const { SAMLResponse, RelayState } = data;

    if (!SAMLResponse) {
      throw new BadRequestException('SAMLResponse parameter is required');
    }

    // Validate relay state
    const stateData = this.validateState(RelayState || '');
    if (!stateData) {
      throw new UnauthorizedException('Invalid or expired relay state');
    }

    const tenantId = stateData.tenantId;

    // Find SAML provider
    const ssoProvider = await this.prisma.ssoProvider.findUnique({
      where: {
        tenantId_provider: {
          tenantId,
          provider: 'SAML',
        },
        isActive: true,
      },
    });

    if (!ssoProvider) {
      throw new NotFoundException('SAML provider not found');
    }

    const config = ssoProvider.config as any;
    const decryptedCert = this.decryptSecret(config.cert);
    const fullConfig = { ...config, cert: decryptedCert };

    // Decode SAML response
    const samlResponseXml = Buffer.from(SAMLResponse, 'base64').toString('utf-8');

    // Parse and validate SAML response
    const profile = await this.parseAndValidateSamlResponse(samlResponseXml, fullConfig);

    // Find or create user
    const user = await this.findOrCreateUser(tenantId, profile);

    // Create session
    const deviceInfo = request
      ? {
          ipAddress: this.securityService.getClientIp(request),
          userAgent: request.headers['user-agent'],
        }
      : {};

    const { session, accessToken, refreshToken } = await this.sessionService.createSession({
      userId: user.id,
      tenantId,
      deviceInfo,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
    });

    // Log security event
    await this.logSecurityEvent({
      action: 'user.saml_login',
      resource: 'user',
      resourceId: user.id,
      tenantId,
      userId: user.id,
      details: {
        provider: 'SAML',
        email: profile.email,
        nameId: profile.nameId,
      },
    });

    // Clean up state
    if (RelayState) {
      this.stateStore.delete(RelayState);
    }

    return {
      user,
      tenant: await this.prisma.tenant.findUnique({ where: { id: tenantId } }),
      accessToken,
      refreshToken,
      session,
    };
  }

  /**
   * Build SAML AuthnRequest XML
   */
  private buildAuthnRequest(config: SamlConfig, relayState: string): string {
    const id = `_${crypto.randomBytes(20).toString('hex')}`;
    const issueInstant = new Date().toISOString();

    return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                     xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                     ID="${id}"
                     Version="2.0"
                     IssueInstant="${issueInstant}"
                     Destination="${config.entryPoint}"
                     AssertionConsumerServiceURL="${config.callbackUrl}"
                     ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
  <saml:Issuer>${config.issuer}</saml:Issuer>
  <samlp:NameIDPolicy Format="${config.identifierFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'}"
                      AllowCreate="true"/>
</samlp:AuthnRequest>`;
  }

  /**
   * Parse and validate SAML response
   */
  private async parseAndValidateSamlResponse(
    samlResponseXml: string,
    config: SamlConfig,
  ): Promise<{
    nameId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    attributes: Record<string, any>;
  }> {
    return new Promise((resolve, reject) => {
      xml2js.parseString(samlResponseXml, async (err, result) => {
        if (err) {
          reject(new UnauthorizedException('Invalid SAML response XML'));
          return;
        }

        try {
          // Extract assertion
          const assertion = result['samlp:Response']?.['saml:Assertion']?.[0];
          if (!assertion) {
            throw new UnauthorizedException('SAML assertion not found');
          }

          // Extract NameID
          const subject = assertion['saml:Subject']?.[0];
          const nameId = subject?.['saml:NameID']?.[0]?._ || subject?.['saml:NameID']?.[0];

          if (!nameId) {
            throw new UnauthorizedException('NameID not found in SAML response');
          }

          // Extract attributes
          const attributeStatement = assertion['saml:AttributeStatement']?.[0];
          const attributes: Record<string, any> = {};

          if (attributeStatement?.['saml:Attribute']) {
            for (const attr of attributeStatement['saml:Attribute']) {
              const name = attr.$.Name;
              const value = attr['saml:AttributeValue']?.[0]?._ || attr['saml:AttributeValue']?.[0];
              if (name && value) {
                attributes[name] = value;
              }
            }
          }

          // Extract email from attributes or NameID
          const email = attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                       attributes['email'] ||
                       attributes['mail'] ||
                       (nameId.includes('@') ? nameId : null);

          if (!email) {
            throw new UnauthorizedException('Email not found in SAML response');
          }

          // Extract name
          const firstName = attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ||
                           attributes['givenName'] ||
                           attributes['firstname'];
          const lastName = attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] ||
                          attributes['surname'] ||
                          attributes['lastname'];

          // TODO: Validate SAML signature (requires xml-crypto)
          // For now, we trust the IdP certificate validation

          resolve({
            nameId,
            email,
            firstName,
            lastName,
            attributes,
          });
        } catch (error) {
          reject(new UnauthorizedException(`SAML validation failed: ${error.message}`));
        }
      });
    });
  }

  /**
   * Find or create user from SAML profile
   */
  private async findOrCreateUser(
    tenantId: string,
    profile: {
      nameId: string;
      email: string;
      firstName?: string;
      lastName?: string;
      attributes: Record<string, any>;
    },
  ): Promise<any> {
    // Try to find existing user by email in tenant
    let user = await this.prisma.user.findUnique({
      where: {
        email_tenantId: {
          email: profile.email,
          tenantId,
        },
      },
    });

    if (user) {
      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          isEmailVerified: true, // SAML users are verified
        },
      });

      return user;
    }

    // Create new user (SAML-only, no password)
    user = await this.prisma.user.create({
      data: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        tenantId,
        isEmailVerified: true,
        passwordHash: null, // SAML-only user
      },
    });

    this.logger.log(`Created new user from SAML: ${profile.email} (tenant: ${tenantId})`);

    return user;
  }

  /**
   * Validate SAML configuration
   */
  private validateSamlConfig(config: SamlConfig): void {
    if (!config.entryPoint) {
      throw new BadRequestException('entryPoint is required');
    }

    if (!config.issuer) {
      throw new BadRequestException('issuer is required');
    }

    if (!config.cert) {
      throw new BadRequestException('cert (IdP certificate) is required');
    }

    if (!config.callbackUrl) {
      throw new BadRequestException('callbackUrl is required');
    }
  }

  /**
   * Generate state for CSRF protection
   */
  private generateState(tenantId: string): string {
    const state = crypto.randomBytes(32).toString('hex');
    this.stateStore.set(state, {
      tenantId,
      timestamp: Date.now(),
    });

    return state;
  }

  /**
   * Validate state
   */
  private validateState(state: string): { tenantId: string } | null {
    if (!state) return null;

    const stateData = this.stateStore.get(state);

    if (!stateData) {
      return null;
    }

    // State expires after 10 minutes
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      this.stateStore.delete(state);
      return null;
    }

    return stateData;
  }

  /**
   * Clean up expired states
   */
  private cleanupExpiredStates(): void {
    const now = Date.now();
    const expiry = 10 * 60 * 1000; // 10 minutes

    for (const [state, data] of this.stateStore.entries()) {
      if (now - data.timestamp > expiry) {
        this.stateStore.delete(state);
      }
    }
  }

  /**
   * Encrypt secret
   */
  private encryptSecret(secret: string): string {
    // In production, use proper encryption (AES-256-GCM)
    const encryptionKey = this.configService.get<string>('SSO_ENCRYPTION_KEY') || 'change-me-in-production';
    // TODO: Implement proper encryption
    return Buffer.from(secret).toString('base64');
  }

  /**
   * Decrypt secret
   */
  private decryptSecret(encrypted: string): string {
    // TODO: Implement proper decryption
    return Buffer.from(encrypted, 'base64').toString('utf-8');
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
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to log security event: ${error.message}`);
    }
  }
}

