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
import { AuthService } from './auth.service';
import { SsoType } from '@prisma/client';
import * as crypto from 'crypto';

export interface CreateSsoProviderDto {
  tenantId: string;
  provider: SsoType;
  name: string;
  config: {
    clientId: string;
    clientSecret: string;
    authorizationURL?: string;
    tokenURL?: string;
    userInfoURL?: string;
    issuerURL?: string; // For OIDC
    domain?: string; // For Microsoft domain restriction
    scopes?: string[];
    callbackURL?: string;
  };
  isDefault?: boolean;
}

export interface SsoProviderInfo {
  id: string;
  name: string;
  provider: SsoType;
  isActive: boolean;
  isDefault: boolean;
  config?: any; // Masked config (no secrets)
}

export interface SsoCallbackData {
  code: string;
  state: string;
  provider: SsoType;
  tenantId?: string;
}

export interface OAuth2Profile {
  id: string;
  email: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  picture?: string;
  provider: string;
  providerId: string;
}

@Injectable()
export class SsoService {
  private readonly logger = new Logger(SsoService.name);
  private readonly baseUrl: string;
  private readonly stateStore = new Map<string, { tenantId: string; provider: SsoType; timestamp: number }>();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private securityService: SecurityService,
    private sessionService: SessionService,
    private authService: AuthService,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
    
    // Clean up expired states periodically (every 10 minutes)
    setInterval(() => {
      this.cleanupExpiredStates();
    }, 10 * 60 * 1000);
  }

  /**
   * Create or update SSO provider
   */
  async createSsoProvider(dto: CreateSsoProviderDto): Promise<SsoProviderInfo> {
    const { tenantId, provider, name, config, isDefault = false } = dto;

    // Validate tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId, isActive: true, isDeleted: false },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Validate provider configuration
    this.validateProviderConfig(provider, config);

    // Encrypt client secret before storing
    const encryptedSecret = this.encryptSecret(config.clientSecret);

    // Prepare config for storage (encrypt sensitive data)
    const storageConfig = {
      ...config,
      clientSecret: encryptedSecret,
    };

    // Create or update SSO provider
    const ssoProvider = await this.prisma.ssoProvider.upsert({
      where: {
        tenantId_provider: {
          tenantId,
          provider,
        },
      },
      create: {
        tenantId,
        provider,
        name,
        config: storageConfig as any,
        isActive: true,
        isDefault,
      },
      update: {
        name,
        config: storageConfig as any,
        isActive: true,
        isDefault,
      },
    });

    // If this is set as default, unset other defaults
    if (isDefault) {
      await this.prisma.ssoProvider.updateMany({
        where: {
          tenantId,
          provider: { not: provider },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    this.logger.log(`SSO provider ${provider} created/updated for tenant ${tenantId}`);

    return {
      id: ssoProvider.id,
      name: ssoProvider.name,
      provider: ssoProvider.provider,
      isActive: ssoProvider.isActive,
      isDefault: ssoProvider.isDefault,
    };
  }

  /**
   * Get SSO providers for tenant
   */
  async getSsoProviders(tenantId: string): Promise<SsoProviderInfo[]> {
    const providers = await this.prisma.ssoProvider.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });

    return providers.map((p) => ({
      id: p.id,
      name: p.name,
      provider: p.provider,
      isActive: p.isActive,
      isDefault: p.isDefault,
      config: this.maskConfig(p.config as any),
    }));
  }

  /**
   * Get SSO authorization URL
   */
  async getAuthorizationUrl(
    tenantId: string,
    provider: SsoType,
    redirectUri?: string,
  ): Promise<{ url: string; state: string }> {
    // Find SSO provider
    const ssoProvider = await this.prisma.ssoProvider.findUnique({
      where: {
        tenantId_provider: {
          tenantId,
          provider,
        },
        isActive: true,
      },
    });

    if (!ssoProvider) {
      throw new NotFoundException(`SSO provider ${provider} not found or inactive`);
    }

    const config = ssoProvider.config as any;
    const decryptedSecret = this.decryptSecret(config.clientSecret);
    const fullConfig = { ...config, clientSecret: decryptedSecret };

    // Generate state for CSRF protection
    const state = this.generateState(tenantId, provider);

    // Build authorization URL based on provider type
    const authUrl = this.buildAuthorizationUrl(provider, fullConfig, state, redirectUri);

    this.logger.log(`Generated authorization URL for ${provider} (tenant: ${tenantId})`);

    return {
      url: authUrl,
      state,
    };
  }

  /**
   * Handle OAuth2/OIDC callback
   */
  async handleCallback(data: SsoCallbackData, request?: any): Promise<any> {
    const { code, state, provider, tenantId } = data;

    // Validate state
    const stateData = this.validateState(state);
    if (!stateData) {
      throw new UnauthorizedException('Invalid or expired state parameter');
    }

    const finalTenantId = tenantId || stateData.tenantId;

    // Find SSO provider
    const ssoProvider = await this.prisma.ssoProvider.findUnique({
      where: {
        tenantId_provider: {
          tenantId: finalTenantId,
          provider: stateData.provider || provider,
        },
        isActive: true,
      },
    });

    if (!ssoProvider) {
      throw new NotFoundException('SSO provider not found');
    }

    const config = ssoProvider.config as any;
    const decryptedSecret = this.decryptSecret(config.clientSecret);
    const fullConfig = { ...config, clientSecret: decryptedSecret };

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(provider, fullConfig, code, state);

    // Get user profile from provider
    const profile = await this.getUserProfile(provider, fullConfig, tokens);

    // Find or create user
    const user = await this.findOrCreateUser(finalTenantId, profile);

    // Create session
    const deviceInfo = request
      ? {
          ipAddress: this.securityService.getClientIp(request),
          userAgent: request.headers['user-agent'],
        }
      : {};

    const { session, accessToken, refreshToken } = await this.sessionService.createSession({
      userId: user.id,
      tenantId: finalTenantId,
      deviceInfo,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
    });

    // Log security event
    await this.logSecurityEvent({
      action: 'user.sso_login',
      resource: 'user',
      resourceId: user.id,
      tenantId: finalTenantId,
      userId: user.id,
      details: {
        provider,
        email: profile.email,
      },
    });

    // Clean up state
    this.stateStore.delete(state);

    return {
      user,
      tenant: await this.prisma.tenant.findUnique({ where: { id: finalTenantId } }),
      accessToken,
      refreshToken,
      session,
    };
  }

  /**
   * Disable SSO provider
   */
  async disableSsoProvider(tenantId: string, provider: SsoType): Promise<void> {
    await this.prisma.ssoProvider.updateMany({
      where: {
        tenantId,
        provider,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    this.logger.log(`SSO provider ${provider} disabled for tenant ${tenantId}`);
  }

  /**
   * Delete SSO provider
   */
  async deleteSsoProvider(tenantId: string, provider: SsoType): Promise<void> {
    await this.prisma.ssoProvider.delete({
      where: {
        tenantId_provider: {
          tenantId,
          provider,
        },
      },
    });

    this.logger.log(`SSO provider ${provider} deleted for tenant ${tenantId}`);
  }

  /**
   * Build authorization URL based on provider
   */
  private buildAuthorizationUrl(
    provider: SsoType,
    config: any,
    state: string,
    redirectUri?: string,
  ): string {
    const callbackUrl = redirectUri || config.callbackURL || `${this.baseUrl}/auth/sso/callback`;
    const scopes = config.scopes || this.getDefaultScopes(provider);

    switch (provider) {
      case 'GOOGLE':
        return this.buildGoogleAuthUrl(config, state, callbackUrl, scopes);
      case 'MICROSOFT':
        return this.buildMicrosoftAuthUrl(config, state, callbackUrl, scopes);
      case 'OAUTH2':
        return this.buildOAuth2AuthUrl(config, state, callbackUrl, scopes);
      case 'SAML':
        throw new BadRequestException('SAML requires separate endpoint (not OAuth2/OIDC)');
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Build Google OAuth2 authorization URL
   */
  private buildGoogleAuthUrl(config: any, state: string, callbackUrl: string, scopes: string[]): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: scopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Build Microsoft OAuth2/OIDC authorization URL
   */
  private buildMicrosoftAuthUrl(config: any, state: string, callbackUrl: string, scopes: string[]): string {
    const tenant = config.domain ? 'common' : 'common';
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: scopes.join(' '),
      state,
      response_mode: 'query',
    });

    const issuer = config.issuerURL || `https://login.microsoftonline.com/${tenant}/oauth2/v2.0`;
    return `${issuer}/authorize?${params.toString()}`;
  }

  /**
   * Build generic OAuth2 authorization URL
   */
  private buildOAuth2AuthUrl(config: any, state: string, callbackUrl: string, scopes: string[]): string {
    if (!config.authorizationURL) {
      throw new BadRequestException('authorizationURL required for OAuth2 provider');
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: scopes.join(' '),
      state,
    });

    return `${config.authorizationURL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(
    provider: SsoType,
    config: any,
    code: string,
    state: string,
  ): Promise<any> {
    const callbackUrl = config.callbackURL || `${this.baseUrl}/auth/sso/callback`;

    switch (provider) {
      case 'GOOGLE':
        return this.exchangeGoogleTokens(config, code, callbackUrl);
      case 'MICROSOFT':
        return this.exchangeMicrosoftTokens(config, code, callbackUrl);
      case 'OAUTH2':
        return this.exchangeOAuth2Tokens(config, code, callbackUrl);
      default:
        throw new BadRequestException(`Token exchange not implemented for ${provider}`);
    }
  }

  /**
   * Exchange Google OAuth2 code for tokens
   */
  private async exchangeGoogleTokens(config: any, code: string, callbackUrl: string): Promise<any> {
    const axios = require('axios');
    const tokenUrl = config.tokenURL || 'https://oauth2.googleapis.com/token';

    const response = await axios.post(
      tokenUrl,
      {
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return response.data;
  }

  /**
   * Exchange Microsoft OAuth2/OIDC code for tokens
   */
  private async exchangeMicrosoftTokens(config: any, code: string, callbackUrl: string): Promise<any> {
    const axios = require('axios');
    const tenant = config.domain ? 'common' : 'common';
    const tokenUrl =
      config.tokenURL || `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

    const response = await axios.post(
      tokenUrl,
      {
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
        scope: config.scopes?.join(' ') || 'openid profile email',
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return response.data;
  }

  /**
   * Exchange generic OAuth2 code for tokens
   */
  private async exchangeOAuth2Tokens(config: any, code: string, callbackUrl: string): Promise<any> {
    if (!config.tokenURL) {
      throw new BadRequestException('tokenURL required for OAuth2 provider');
    }

    const axios = require('axios');

    const response = await axios.post(
      config.tokenURL,
      {
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return response.data;
  }

  /**
   * Get user profile from provider
   */
  private async getUserProfile(provider: SsoType, config: any, tokens: any): Promise<OAuth2Profile> {
    switch (provider) {
      case 'GOOGLE':
        return this.getGoogleProfile(config, tokens);
      case 'MICROSOFT':
        return this.getMicrosoftProfile(config, tokens);
      case 'OAUTH2':
        return this.getOAuth2Profile(config, tokens);
      default:
        throw new BadRequestException(`Profile retrieval not implemented for ${provider}`);
    }
  }

  /**
   * Get Google user profile
   */
  private async getGoogleProfile(config: any, tokens: any): Promise<OAuth2Profile> {
    const axios = require('axios');
    const userInfoUrl = config.userInfoURL || 'https://www.googleapis.com/oauth2/v2/userinfo';

    const response = await axios.get(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const data = response.data;

    return {
      id: data.id,
      email: data.email,
      emailVerified: data.verified_email || false,
      firstName: data.given_name,
      lastName: data.family_name,
      displayName: data.name,
      picture: data.picture,
      provider: 'GOOGLE',
      providerId: data.id,
    };
  }

  /**
   * Get Microsoft user profile
   */
  private async getMicrosoftProfile(config: any, tokens: any): Promise<OAuth2Profile> {
    const axios = require('axios');
    const userInfoUrl = config.userInfoURL || 'https://graph.microsoft.com/v1.0/me';

    const response = await axios.get(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const data = response.data;

    return {
      id: data.id,
      email: data.mail || data.userPrincipalName,
      emailVerified: true, // Microsoft accounts are verified
      firstName: data.givenName,
      lastName: data.surname,
      displayName: data.displayName,
      picture: null,
      provider: 'MICROSOFT',
      providerId: data.id,
    };
  }

  /**
   * Get generic OAuth2 user profile
   */
  private async getOAuth2Profile(config: any, tokens: any): Promise<OAuth2Profile> {
    if (!config.userInfoURL) {
      throw new BadRequestException('userInfoURL required for OAuth2 provider');
    }

    const axios = require('axios');

    const response = await axios.get(config.userInfoURL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const data = response.data;

    return {
      id: data.id || data.sub || data.user_id,
      email: data.email || data.email_address,
      emailVerified: data.email_verified || data.verified || false,
      firstName: data.given_name || data.first_name || data.firstName,
      lastName: data.family_name || data.last_name || data.lastName,
      displayName: data.name || data.display_name || data.displayName,
      picture: data.picture || data.avatar_url || data.avatar,
      provider: 'OAUTH2',
      providerId: data.id || data.sub || data.user_id,
    };
  }

  /**
   * Find or create user from SSO profile
   */
  private async findOrCreateUser(tenantId: string, profile: OAuth2Profile): Promise<any> {
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
          isEmailVerified: profile.emailVerified || user.isEmailVerified,
        },
      });

      return user;
    }

    // Create new user (SSO-only, no password)
    user = await this.prisma.user.create({
      data: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.picture,
        tenantId,
        isEmailVerified: profile.emailVerified || false,
        passwordHash: null, // SSO-only user
      },
    });

    this.logger.log(`Created new user from SSO: ${profile.email} (tenant: ${tenantId})`);

    return user;
  }

  /**
   * Get default scopes for provider
   */
  private getDefaultScopes(provider: SsoType): string[] {
    switch (provider) {
      case 'GOOGLE':
        return ['openid', 'profile', 'email'];
      case 'MICROSOFT':
        return ['openid', 'profile', 'email'];
      case 'OAUTH2':
        return ['openid', 'profile', 'email'];
      default:
        return ['openid', 'profile', 'email'];
    }
  }

  /**
   * Validate provider configuration
   */
  private validateProviderConfig(provider: SsoType, config: any): void {
    if (!config.clientId) {
      throw new BadRequestException('clientId is required');
    }

    if (!config.clientSecret) {
      throw new BadRequestException('clientSecret is required');
    }

    if (provider === 'OAUTH2') {
      if (!config.authorizationURL) {
        throw new BadRequestException('authorizationURL is required for OAuth2 provider');
      }

      if (!config.tokenURL) {
        throw new BadRequestException('tokenURL is required for OAuth2 provider');
      }

      if (!config.userInfoURL) {
        throw new BadRequestException('userInfoURL is required for OAuth2 provider');
      }
    }
  }

  /**
   * Generate state for CSRF protection
   */
  private generateState(tenantId: string, provider: SsoType): string {
    const state = crypto.randomBytes(32).toString('hex');
    this.stateStore.set(state, {
      tenantId,
      provider,
      timestamp: Date.now(),
    });

    return state;
  }

  /**
   * Validate state
   */
  private validateState(state: string): { tenantId: string; provider: SsoType } | null {
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
   * Mask config (remove secrets for display)
   */
  private maskConfig(config: any): any {
    const masked = { ...config };
    if (masked.clientSecret) {
      masked.clientSecret = '***masked***';
    }
    return masked;
  }

  /**
   * Encrypt secret
   */
  private encryptSecret(secret: string): string {
    // In production, use proper encryption (AES-256-GCM)
    // For now, use base64 encoding (NOT secure for production!)
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
