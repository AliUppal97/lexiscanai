import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  HttpStatus,
  Put,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService, LoginCredentials } from './auth.service';
import { UserManagementService, CreateTenantDto } from './user-management.service';
import { SecurityService } from './security.service';
import { SessionService } from './session.service';
import { MfaService } from './mfa.service';
import { SsoService, CreateSsoProviderDto } from './sso.service';
import { SamlService } from './saml.service';
import { PasswordlessService } from './passwordless.service';
import { WebAuthnService } from './webauthn.service';
import { AbacService } from './abac.service';
import { SessionAnomalyService } from './session-anomaly.service';
import { EnhancedJwtAuthGuard } from './enhanced-auth.guard';
import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsObject } from 'class-validator';

// DTOs
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  tenantSlug?: string;

  @IsOptional()
  @IsString()
  mfaCode?: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  tenantSlug?: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class PasswordResetRequestDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  tenantSlug?: string;
}

export class PasswordResetDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class SetupTotpDto {
  @IsString()
  deviceName: string;
}

export class VerifyMfaDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  type?: 'TOTP' | 'SMS' | 'EMAIL';
}

export class SendSmsCodeDto {
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class CreateSsoProviderRequestDto {
  @IsString()
  provider: 'GOOGLE' | 'MICROSOFT' | 'OAUTH2' | 'SAML';

  @IsString()
  name: string;

  @IsString()
  clientId: string;

  @IsString()
  clientSecret: string;

  @IsOptional()
  @IsString()
  authorizationURL?: string;

  @IsOptional()
  @IsString()
  tokenURL?: string;

  @IsOptional()
  @IsString()
  userInfoURL?: string;

  @IsOptional()
  @IsString()
  issuerURL?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsArray()
  scopes?: string[];

  @IsOptional()
  @IsString()
  callbackURL?: string;

  @IsOptional()
  isDefault?: boolean;
}

export class CreateTenantRequestDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(8)
  adminPassword: string;

  @IsOptional()
  @IsString()
  adminFirstName?: string;

  @IsOptional()
  @IsString()
  adminLastName?: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userManagementService: UserManagementService,
    private sessionService: SessionService,
    private mfaService: MfaService,
    private securityService: SecurityService,
    private ssoService: SsoService,
    private samlService: SamlService,
    private passwordlessService: PasswordlessService,
    private webauthnService: WebAuthnService,
    private abacService: AbacService,
    private sessionAnomalyService: SessionAnomalyService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'Email already exists in tenant' })
  @ApiResponse({ status: 400, description: 'Password validation failed' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      tenantSlug: dto.tenantSlug,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login with optional MFA' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked' })
  @ApiResponse({ status: 200, description: 'MFA required' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const credentials: LoginCredentials = {
      email: loginDto.email,
      password: loginDto.password,
      tenantSlug: loginDto.tenantSlug,
      mfaCode: loginDto.mfaCode,
      deviceInfo: {
        ipAddress: this.securityService.getClientIp(req),
        userAgent: req.headers['user-agent'],
      },
    };

    const result = await this.authService.login(credentials, req);

    // If MFA is required, return challenge
    if ('requiresMfa' in result && result.requiresMfa && 'mfaTypes' in result) {
      return {
        requiresMfa: true,
        mfaTypes: result.mfaTypes,
        message: 'Multi-factor authentication required',
      };
    }

    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req) {
    await this.authService.logout(req.sessionId, req.userId, req.tenantId);
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout all sessions for current user' })
  @ApiResponse({ status: 200, description: 'All sessions logged out successfully' })
  async logoutAll(@Request() req) {
    await this.authService.logoutAll(req.userId, req.tenantId, req.sessionId);
    return { message: 'All sessions logged out successfully' };
  }

  @Get('sessions')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active sessions for current user' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getSessions(@Request() req) {
    return this.authService.getUserSessions(req.userId, req.tenantId);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  async revokeSession(@Param('sessionId') sessionId: string, @Request() req) {
    // Verify session belongs to user
    const sessions = await this.authService.getUserSessions(req.userId, req.tenantId);
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    await this.sessionService.revokeSession(sessionId);
    return { message: 'Session revoked successfully' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent if account exists' })
  async forgotPassword(@Body() body: PasswordResetRequestDto) {
    await this.authService.requestPasswordReset({
      email: body.email,
      tenantSlug: body.tenantSlug,
    });
    return { message: 'If the account exists, a reset email has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid token or password validation failed' })
  async resetPassword(@Body() body: PasswordResetDto) {
    await this.authService.resetPassword({
      token: body.token,
      newPassword: body.newPassword,
    });
    return { message: 'Password has been reset successfully' };
  }

  @Put('change-password')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password (authenticated user)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password incorrect' })
  @ApiResponse({ status: 400, description: 'Password validation failed' })
  async changePassword(@Body() body: ChangePasswordDto, @Request() req) {
    await this.authService.changePassword(
      req.userId,
      req.tenantId,
      body.currentPassword,
      body.newPassword,
    );
    return { message: 'Password changed successfully' };
  }

  @Get('me')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req) {
    // User is already attached to request by EnhancedJwtAuthGuard
    const { passwordHash, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
  }

  // MFA Endpoints
  @Post('mfa/setup-totp')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup TOTP for MFA' })
  @ApiResponse({ status: 201, description: 'TOTP setup successful' })
  async setupTotp(@Body() dto: SetupTotpDto, @Request() req) {
    return this.mfaService.setupTotp(req.userId, req.tenantId, dto.deviceName);
  }

  @Post('mfa/verify-totp')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify TOTP code' })
  @ApiResponse({ status: 200, description: 'TOTP verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid TOTP code' })
  async verifyTotp(@Body() dto: VerifyMfaDto, @Request() req) {
    const isValid = await this.mfaService.verifyTotp({
      code: dto.code,
      userId: req.userId,
      tenantId: req.tenantId,
    });
    return { verified: isValid };
  }

  @Post('mfa/send-sms')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send SMS verification code' })
  @ApiResponse({ status: 200, description: 'SMS code sent' })
  async sendSmsCode(@Body() dto: SendSmsCodeDto, @Request() req) {
    await this.mfaService.sendSmsCode(req.userId, req.tenantId);
    return { message: 'SMS code sent' };
  }

  @Post('mfa/send-email')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send email verification code' })
  @ApiResponse({ status: 200, description: 'Email code sent' })
  async sendEmailCode(@Request() req) {
    await this.mfaService.sendEmailCode(req.userId, req.tenantId);
    return { message: 'Email code sent' };
  }

  @Get('mfa/status')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get MFA status for current user' })
  @ApiResponse({ status: 200, description: 'MFA status retrieved' })
  async getMfaStatus(@Request() req) {
    return this.mfaService.getMfaStatus(req.userId, req.tenantId);
  }

  @Post('mfa/disable')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable MFA for current user' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  @ApiQuery({ name: 'type', required: false, enum: ['TOTP', 'SMS', 'EMAIL'] })
  async disableMfa(@Query('type') type: 'TOTP' | 'SMS' | 'EMAIL', @Request() req) {
    await this.mfaService.disableMfa(req.userId, req.tenantId, type);
    return { message: 'MFA disabled successfully' };
  }

  @Post('mfa/regenerate-backup-codes')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiResponse({ status: 201, description: 'Backup codes regenerated' })
  async regenerateBackupCodes(@Request() req) {
    const codes = await this.mfaService.regenerateBackupCodes(req.userId, req.tenantId);
    return { backupCodes: codes };
  }

  @Get('password-strength')
  @ApiOperation({ summary: 'Check password strength' })
  @ApiResponse({ status: 200, description: 'Password strength calculated' })
  @ApiQuery({ name: 'password', required: true })
  async checkPasswordStrength(@Query('password') password: string) {
    const validation = this.securityService.validatePassword(password);
    const strength = this.securityService.calculatePasswordStrength(password);
    return {
      valid: validation.valid,
      errors: validation.errors,
      strength,
      strengthLabel: this.getStrengthLabel(strength),
    };
  }

  private getStrengthLabel(strength: number): string {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  }

  // SSO Endpoints
  @Get('sso/providers')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SSO providers for current tenant' })
  @ApiResponse({ status: 200, description: 'SSO providers retrieved' })
  async getSsoProviders(@Request() req) {
    return this.ssoService.getSsoProviders(req.tenantId);
  }

  @Post('sso/providers')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update SSO provider' })
  @ApiResponse({ status: 201, description: 'SSO provider created/updated' })
  @ApiResponse({ status: 400, description: 'Invalid provider configuration' })
  async createSsoProvider(@Body() dto: CreateSsoProviderRequestDto, @Request() req) {
    const ssoDto: CreateSsoProviderDto = {
      tenantId: req.tenantId,
      provider: dto.provider as any,
      name: dto.name,
      config: {
        clientId: dto.clientId,
        clientSecret: dto.clientSecret,
        authorizationURL: dto.authorizationURL,
        tokenURL: dto.tokenURL,
        userInfoURL: dto.userInfoURL,
        issuerURL: dto.issuerURL,
        domain: dto.domain,
        scopes: dto.scopes,
        callbackURL: dto.callbackURL,
      },
      isDefault: dto.isDefault,
    };

    return this.ssoService.createSsoProvider(ssoDto);
  }

  @Get('sso/authorize')
  @ApiOperation({ summary: 'Get SSO authorization URL' })
  @ApiResponse({ status: 200, description: 'Authorization URL generated' })
  @ApiQuery({ name: 'tenantId', required: true })
  @ApiQuery({ name: 'provider', required: true, enum: ['GOOGLE', 'MICROSOFT', 'OAUTH2'] })
  @ApiQuery({ name: 'redirectUri', required: false })
  async getSsoAuthorizationUrl(
    @Query('tenantId') tenantId: string,
    @Query('provider') provider: string,
    @Query('redirectUri') redirectUri?: string,
  ) {
    const result = await this.ssoService.getAuthorizationUrl(
      tenantId,
      provider as any,
      redirectUri,
    );
    return {
      authorizationUrl: result.url,
      state: result.state,
    };
  }

  @Post('sso/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle SSO OAuth2/OIDC callback' })
  @ApiResponse({ status: 200, description: 'SSO authentication successful' })
  @ApiResponse({ status: 401, description: 'SSO authentication failed' })
  async ssoCallback(@Body() body: { code: string; state: string; provider: string; tenantId?: string }, @Request() req) {
    return this.ssoService.handleCallback(
      {
        code: body.code,
        state: body.state,
        provider: body.provider as any,
        tenantId: body.tenantId,
      },
      req,
    );
  }

  @Get('sso/callback')
  @ApiOperation({ summary: 'Handle SSO OAuth2/OIDC callback (GET)' })
  @ApiResponse({ status: 200, description: 'SSO authentication successful' })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'state', required: true })
  @ApiQuery({ name: 'provider', required: false })
  @ApiQuery({ name: 'tenantId', required: false })
  async ssoCallbackGet(
    @Query('code') code: string,
    @Query('state') state: string,
    @Request() req: any,
    @Query('provider') provider?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.ssoService.handleCallback(
      {
        code,
        state,
        provider: (provider as any) || 'GOOGLE',
        tenantId,
      },
      req,
    );
  }

  @Delete('sso/providers/:provider')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete SSO provider' })
  @ApiResponse({ status: 200, description: 'SSO provider deleted' })
  async deleteSsoProvider(@Param('provider') provider: string, @Request() req) {
    await this.ssoService.deleteSsoProvider(req.tenantId, provider as any);
    return { message: 'SSO provider deleted successfully' };
  }

  @Put('sso/providers/:provider/disable')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable SSO provider' })
  @ApiResponse({ status: 200, description: 'SSO provider disabled' })
  async disableSsoProvider(@Param('provider') provider: string, @Request() req) {
    await this.ssoService.disableSsoProvider(req.tenantId, provider as any);
    return { message: 'SSO provider disabled successfully' };
  }

  // ============================================================================
  // SAML 2.0 Endpoints
  // ============================================================================

  @Post('saml/configure')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Configure SAML 2.0 provider' })
  @ApiResponse({ status: 200, description: 'SAML provider configured' })
  async configureSaml(@Body() body: any, @Request() req) {
    await this.samlService.createSamlProvider(req.tenantId, body.name, body.config);
    return { message: 'SAML provider configured successfully' };
  }

  @Get('saml/authorize')
  @ApiOperation({ summary: 'Get SAML AuthnRequest URL (SP-initiated SSO)' })
  @ApiResponse({ status: 200, description: 'SAML AuthnRequest URL generated' })
  @ApiQuery({ name: 'tenantId', required: true })
  @ApiQuery({ name: 'relayState', required: false })
  async getSamlAuthnRequest(
    @Query('tenantId') tenantId: string,
    @Query('relayState') relayState?: string,
  ) {
    const result = await this.samlService.generateAuthnRequest({ tenantId, relayState });
    return {
      url: result.url,
      relayState: result.relayState,
    };
  }

  @Post('saml/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle SAML Response (ACS callback)' })
  @ApiResponse({ status: 200, description: 'SAML authentication successful' })
  @ApiResponse({ status: 401, description: 'SAML authentication failed' })
  async samlCallback(@Body() body: { SAMLResponse: string; RelayState?: string }, @Request() req) {
    return this.samlService.handleSamlResponse(
      {
        SAMLResponse: body.SAMLResponse,
        RelayState: body.RelayState,
      },
      req,
    );
  }

  // ============================================================================
  // Passwordless Authentication (Magic Links)
  // ============================================================================

  @Post('passwordless/send-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send magic link for passwordless authentication' })
  @ApiResponse({ status: 200, description: 'Magic link sent (if user exists)' })
  async sendMagicLink(@Body() body: { email: string; tenantSlug?: string; redirectUrl?: string }, @Request() req) {
    await this.passwordlessService.sendMagicLink(
      {
        email: body.email,
        tenantSlug: body.tenantSlug,
        redirectUrl: body.redirectUrl,
      },
      req,
    );
    return { message: 'If the email exists, a magic link has been sent' };
  }

  @Get('passwordless/verify')
  @ApiOperation({ summary: 'Verify magic link token' })
  @ApiResponse({ status: 200, description: 'Magic link verified, session created' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @ApiQuery({ name: 'token', required: true })
  @ApiQuery({ name: 'tenantSlug', required: false })
  async verifyMagicLink(
    @Query('token') token: string,
    @Query('tenantSlug') tenantSlug?: string,
    @Request() req?: any,
  ) {
    return this.passwordlessService.verifyMagicLink({ token, tenantSlug }, req);
  }

  // ============================================================================
  // WebAuthn/FIDO2 Endpoints
  // ============================================================================

  @Post('webauthn/registration/start')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start WebAuthn registration (generate challenge)' })
  @ApiResponse({ status: 200, description: 'Registration challenge generated' })
  async startWebAuthnRegistration(@Body() body: { deviceName: string }, @Request() req) {
    return this.webauthnService.startRegistration({
      userId: req.userId,
      tenantId: req.tenantId,
      deviceName: body.deviceName,
    });
  }

  @Post('webauthn/registration/complete')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete WebAuthn registration (verify and store credential)' })
  @ApiResponse({ status: 200, description: 'Credential registered successfully' })
  async completeWebAuthnRegistration(@Body() body: { deviceName: string; credential: any }, @Request() req) {
    return this.webauthnService.completeRegistration(
      {
        userId: req.userId,
        tenantId: req.tenantId,
        credential: body.credential,
      },
      req,
    );
  }

  @Post('webauthn/authentication/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start WebAuthn authentication (generate challenge)' })
  @ApiResponse({ status: 200, description: 'Authentication challenge generated' })
  async startWebAuthnAuthentication(@Body() body: { email: string; tenantSlug?: string }) {
    return this.webauthnService.startAuthentication({
      email: body.email,
      tenantSlug: body.tenantSlug,
    });
  }

  @Post('webauthn/authentication/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete WebAuthn authentication (verify and create session)' })
  @ApiResponse({ status: 200, description: 'Authentication successful, session created' })
  async completeWebAuthnAuthentication(@Body() body: { email: string; tenantSlug?: string; credential: any }, @Request() req) {
    return this.webauthnService.completeAuthentication(
      {
        email: body.email,
        tenantSlug: body.tenantSlug,
        credential: body.credential,
      },
      req,
    );
  }

  @Get('webauthn/credentials')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List user WebAuthn credentials' })
  @ApiResponse({ status: 200, description: 'Credentials retrieved successfully' })
  async listWebAuthnCredentials(@Request() req) {
    return this.webauthnService.listCredentials(req.userId, req.tenantId);
  }

  @Delete('webauthn/credentials/:credentialId')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete WebAuthn credential' })
  @ApiResponse({ status: 200, description: 'Credential deleted successfully' })
  async deleteWebAuthnCredential(@Param('credentialId') credentialId: string, @Request() req) {
    await this.webauthnService.deleteCredential(req.userId, req.tenantId, credentialId);
    return { message: 'Credential deleted successfully' };
  }

  // ============================================================================
  // ABAC (Attribute-Based Access Control) Endpoints
  // ============================================================================

  @Post('abac/policies')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create ABAC policy' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  async createAbacPolicy(@Body() body: any, @Request() req) {
    return this.abacService.createPolicy(
      req.tenantId,
      body.name,
      body.resource,
      body.action,
      body.conditions,
      body.description,
      body.priority,
    );
  }

  @Get('abac/policies')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List ABAC policies' })
  @ApiResponse({ status: 200, description: 'Policies retrieved successfully' })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'action', required: false })
  async listAbacPolicies(
    @Query('resource') resource?: string,
    @Query('action') action?: string,
    @Request() req?: any,
  ) {
    return this.abacService.listPolicies(req.tenantId, resource, action);
  }

  @Put('abac/policies/:policyId')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update ABAC policy' })
  @ApiResponse({ status: 200, description: 'Policy updated successfully' })
  async updateAbacPolicy(@Param('policyId') policyId: string, @Body() body: any, @Request() req) {
    return this.abacService.updatePolicy(policyId, req.tenantId, body);
  }

  @Delete('abac/policies/:policyId')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete ABAC policy' })
  @ApiResponse({ status: 200, description: 'Policy deleted successfully' })
  async deleteAbacPolicy(@Param('policyId') policyId: string, @Request() req) {
    await this.abacService.deletePolicy(policyId, req.tenantId);
    return { message: 'Policy deleted successfully' };
  }

  // ============================================================================
  // Session Anomaly Detection Endpoints
  // ============================================================================

  @Get('sessions/:sessionId/anomalies')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get session anomalies' })
  @ApiResponse({ status: 200, description: 'Anomalies retrieved successfully' })
  async getSessionAnomalies(@Param('sessionId') sessionId: string, @Request() req) {
    return this.sessionAnomalyService.getSessionAnomalies(sessionId);
  }

  @Put('sessions/:sessionId/anomalies/:anomalyId/resolve')
  @UseGuards(EnhancedJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve session anomaly' })
  @ApiResponse({ status: 200, description: 'Anomaly resolved successfully' })
  async resolveAnomaly(@Param('anomalyId') anomalyId: string, @Request() req) {
    await this.sessionAnomalyService.resolveAnomaly(anomalyId, req.userId, req.tenantId);
    return { message: 'Anomaly resolved successfully' };
  }
}

@ApiTags('User Management')
@Controller('users')
@UseGuards(EnhancedJwtAuthGuard)
@ApiBearerAuth()
export class UserManagementController {
  constructor(private userManagementService: UserManagementService) {}

  @Post('tenants')
  @ApiOperation({ summary: 'Create new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 409, description: 'Tenant slug or domain already exists' })
  async createTenant(@Body() createTenantDto: CreateTenantRequestDto) {
    const dto: CreateTenantDto = {
      name: createTenantDto.name,
      slug: createTenantDto.slug,
      domain: createTenantDto.domain,
      adminEmail: createTenantDto.adminEmail,
      adminPassword: createTenantDto.adminPassword,
      adminFirstName: createTenantDto.adminFirstName,
      adminLastName: createTenantDto.adminLastName,
    };

    return await this.userManagementService.createTenant(dto);
  }
}