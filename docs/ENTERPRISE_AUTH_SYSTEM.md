# Enterprise Authentication & Authorization System

## Overview

This document describes the comprehensive enterprise-grade authentication and authorization system implemented for LexiScanAI. The system follows industry best practices and is designed for scalability, security, and maintainability.

## Table of Contents

- [Architecture](#architecture)
- [Authentication Methods](#authentication-methods)
- [Authorization System](#authorization-system)
- [Security Features](#security-features)
- [Session Management](#session-management)
- [Multi-Factor Authentication](#multi-factor-authentication)
- [API Key Authentication](#api-key-authentication)
- [Password Management](#password-management)
- [Security Policies](#security-policies)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## Architecture

### Core Components

1. **AuthService**: Handles user registration, login, password management
2. **SecurityService**: Password validation, account lockout, device fingerprinting
3. **SessionService**: Session management, refresh tokens, token rotation
4. **MfaService**: Multi-factor authentication (TOTP, SMS, Email)
5. **ApiKeyService**: Server-to-server authentication
6. **Enhanced Guards**: JWT validation, token blacklisting, permission checks

### Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /auth/login
       ▼
┌─────────────────┐
│   AuthService   │
│  - Validate     │
│  - Check lockout│
│  - Verify pwd   │
└──────┬──────────┘
       │ 2. Check MFA
       ▼
┌─────────────────┐      ┌──────────────┐
│   MfaService    │◄─────┤ MFA Enabled? │
└──────┬──────────┘      └──────────────┘
       │ 3. Verify MFA Code
       ▼
┌─────────────────┐
│  SessionService │
│  - Create session│
│  - Generate     │
│    tokens       │
└──────┬───────────┘
       │ 4. Return tokens
       ▼
┌─────────────┐
│   Client    │
│  - Access   │
│  - Refresh  │
└─────────────┘
```

## Authentication Methods

### 1. JWT Token Authentication (Primary)

**Access Token:**
- **Lifetime**: 15 minutes (configurable)
- **Purpose**: API authentication
- **Storage**: Secure, httpOnly cookies (recommended) or memory
- **Rotation**: Automatic on refresh

**Refresh Token:**
- **Lifetime**: 30 days (configurable)
- **Purpose**: Obtain new access tokens
- **Storage**: Secure, httpOnly cookies (recommended)
- **Rotation**: Automatic on refresh for security

**Token Structure:**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "tenantId": "tenant-id",
  "tenantSlug": "tenant-slug",
  "roles": ["admin", "lawyer"],
  "permissions": ["documents.read", "documents.write"],
  "sessionId": "session-id",
  "iat": 1642234567,
  "exp": 1642839367
}
```

### 2. Session-Based Authentication

- **Database-backed sessions** for complete control
- **Device fingerprinting** for security
- **Concurrent session limits** (default: 10 per user)
- **Session revocation** capabilities
- **Automatic cleanup** of expired sessions

### 3. API Key Authentication (Server-to-Server)

- **Scoped permissions** per API key
- **Expiration dates** support
- **Last used tracking**
- **Revocation** capabilities

### 4. Multi-Factor Authentication

- **TOTP** (Google Authenticator, Authy)
- **SMS** verification codes
- **Email** verification codes
- **Backup codes** for account recovery

## Authorization System

### Role-Based Access Control (RBAC)

**Roles:**
- Hierarchical role system
- Per-tenant roles
- System roles vs custom roles
- Role expiration support

**Permissions:**
- Granular permissions (resource.action pattern)
- Permission inheritance through roles
- Wildcard permissions support

**Example Permissions:**
- `documents.read`
- `documents.write`
- `documents.delete`
- `users.manage`
- `billing.manage`

### Permission Checking

```typescript
// Guard-based authorization
@UseGuards(EnhancedJwtAuthGuard, PermissionsGuard)
@RequirePermissions('documents.delete')
@Delete(':id')
deleteDocument() { ... }

// Role-based authorization
@UseGuards(EnhancedJwtAuthGuard, RolesGuard)
@Roles('admin', 'lawyer')
@Get('sensitive-data')
getSensitiveData() { ... }
```

## Security Features

### 1. Password Security

- **Strong password requirements**:
  - Minimum 12 characters
  - Uppercase letters required
  - Lowercase letters required
  - Numbers required
  - Special characters required
  - Common password detection

- **Password hashing**: bcrypt with 12 rounds
- **Password history**: Prevents reuse of recent passwords
- **Password expiration**: Configurable (default: 90 days)

### 2. Account Lockout

- **Max attempts**: 5 failed attempts (configurable)
- **Lockout duration**: 15 minutes (configurable)
- **Window duration**: 5 minutes tracking window
- **Automatic unlock** after duration

### 3. Token Security

- **Token blacklisting**: Revoked tokens cannot be reused
- **Token rotation**: Automatic refresh token rotation
- **Short-lived access tokens**: 15 minutes
- **Session validation**: Database-backed session checks

### 4. Device Fingerprinting

- **Device identification**: IP, User-Agent, Accept-Language
- **Anomaly detection**: Unusual device notifications
- **Session tracking**: Per-device session management

### 5. Security Headers

- **Content Security Policy**: XSS protection
- **X-Frame-Options**: Clickjacking protection
- **Strict Transport Security**: HTTPS enforcement
- **X-Content-Type-Options**: MIME type protection

### 6. Audit Logging

- **Comprehensive logging**: All security events
- **Immutable logs**: Append-only audit trail
- **Context tracking**: IP, User-Agent, Session ID
- **Compliance ready**: GDPR, SOC 2 compatible

## Session Management

### Session Features

- **Concurrent session limits**: Max 10 active sessions per user
- **Session viewing**: Users can see all active sessions
- **Session revocation**: Revoke individual or all sessions
- **Automatic cleanup**: Expired session removal
- **Device tracking**: Per-device session management

### Session Lifecycle

1. **Creation**: On successful login with device info
2. **Usage**: Tracked with `lastUsedAt` timestamp
3. **Refresh**: Automatic token rotation on refresh
4. **Expiration**: 30 days default
5. **Revocation**: Manual or automatic cleanup

### API Endpoints

```typescript
GET  /auth/sessions              // Get all active sessions
POST /auth/logout                // Logout current session
POST /auth/logout-all            // Logout all sessions
DELETE /auth/sessions/:id       // Revoke specific session
```

## Multi-Factor Authentication

### Setup Flow

1. **Setup TOTP**: `POST /auth/mfa/setup-totp`
   - Generate secret
   - Generate QR code
   - Generate backup codes
   - Store encrypted secret

2. **Verify Setup**: User scans QR code and verifies code
3. **Enable MFA**: MFA now required for login

### Authentication Flow

1. User logs in with email/password
2. If MFA enabled, return MFA challenge
3. User provides MFA code (TOTP/SMS/Email/Backup)
4. Verify code and complete login

### MFA Methods

**TOTP (Time-based One-Time Password):**
- Google Authenticator compatible
- 6-digit codes, 30-second window
- Encrypted secret storage

**SMS:**
- 6-digit numeric codes
- 10-minute expiration
- Rate limited

**Email:**
- 6-digit numeric codes
- 10-minute expiration
- Rate limited

**Backup Codes:**
- 8-character alphanumeric
- Single-use only
- Regenerable

### API Endpoints

```typescript
POST /auth/mfa/setup-totp                    // Setup TOTP
POST /auth/mfa/verify-totp                    // Verify TOTP code
POST /auth/mfa/send-sms                      // Send SMS code
POST /auth/mfa/send-email                    // Send email code
GET  /auth/mfa/status                        // Get MFA status
POST /auth/mfa/disable?type=TOTP             // Disable MFA
POST /auth/mfa/regenerate-backup-codes       // Regenerate backup codes
```

## API Key Authentication

### Creating API Keys

```typescript
POST /auth/api-keys
{
  "name": "Production Integration",
  "description": "Production API access",
  "scopes": ["documents.read", "documents.write"],
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

### Usage

```bash
curl -H "X-API-Key: lexiscan_<key>" \
     https://api.lexiscan.ai/documents
```

### API Key Management

- **Scoped permissions**: Granular access control
- **Expiration dates**: Time-limited access
- **Usage tracking**: Last used timestamp
- **Revocation**: Instant key invalidation

## Password Management

### Password Requirements

- **Minimum length**: 12 characters
- **Complexity**: Must include uppercase, lowercase, numbers, special chars
- **Common passwords**: Blocked
- **Strength score**: 0-100 calculated

### Password Change

```typescript
PUT /auth/change-password
{
  "currentPassword": "current-password",
  "newPassword": "new-secure-password"
}
```

### Password Reset Flow

1. **Request Reset**: `POST /auth/forgot-password`
   - Generates secure token
   - Stores in cache (1 hour expiry)
   - Sends email (if configured)

2. **Reset Password**: `POST /auth/reset-password`
   - Validates token
   - Validates new password
   - Updates password
   - Revokes all sessions

### Password Strength Check

```typescript
GET /auth/password-strength?password=<password>
{
  "valid": true,
  "errors": [],
  "strength": 85,
  "strengthLabel": "Strong"
}
```

## Security Policies

### Account Lockout Policy

- **Max failed attempts**: 5
- **Lockout duration**: 15 minutes
- **Tracking window**: 5 minutes
- **Auto-unlock**: Yes, after duration

### Password Policy

- **Minimum length**: 12 characters
- **Complexity requirements**: Yes
- **Password history**: 5 previous passwords
- **Password expiration**: 90 days
- **Password change required**: On expiration

### Session Policy

- **Max concurrent sessions**: 10 per user
- **Access token lifetime**: 15 minutes
- **Refresh token lifetime**: 30 days
- **Token rotation**: Yes, on refresh
- **Session cleanup**: Automatic, daily

### MFA Policy

- **Required for admins**: Configurable
- **Required for sensitive operations**: Configurable
- **Backup codes**: Always generated
- **Code expiration**: 10 minutes (SMS/Email)

## Best Practices

### 1. Token Storage

✅ **Recommended**:
- Use httpOnly cookies for tokens
- Set secure flag in production
- Use SameSite=Strict for CSRF protection

❌ **Not Recommended**:
- localStorage (XSS vulnerable)
- sessionStorage (less secure than cookies)
- Exposed in URLs

### 2. Token Transmission

✅ **Always**:
- Use HTTPS for all API calls
- Include tokens in Authorization header
- Validate tokens on every request

❌ **Never**:
- Send tokens over HTTP
- Include tokens in URLs
- Log tokens in production

### 3. Password Handling

✅ **Best Practices**:
- Never log passwords
- Hash passwords before storage
- Use strong password requirements
- Implement password history

❌ **Anti-patterns**:
- Storing plaintext passwords
- Weak password requirements
- Allowing password reuse

### 4. MFA Implementation

✅ **Best Practices**:
- Encrypt MFA secrets
- Generate secure backup codes
- Implement rate limiting
- Support multiple MFA methods

### 5. Session Management

✅ **Best Practices**:
- Limit concurrent sessions
- Track device information
- Implement session revocation
- Automatic cleanup

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | User registration | None |
| POST | `/auth/login` | User login | None |
| POST | `/auth/refresh` | Refresh access token | None |
| POST | `/auth/logout` | Logout current session | JWT |
| POST | `/auth/logout-all` | Logout all sessions | JWT |
| GET | `/auth/me` | Get current user | JWT |
| GET | `/auth/sessions` | Get active sessions | JWT |

### Password Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/forgot-password` | Request password reset | None |
| POST | `/auth/reset-password` | Reset password | None |
| PUT | `/auth/change-password` | Change password | JWT |
| GET | `/auth/password-strength` | Check password strength | None |

### MFA Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/mfa/setup-totp` | Setup TOTP | JWT |
| POST | `/auth/mfa/verify-totp` | Verify TOTP | JWT |
| POST | `/auth/mfa/send-sms` | Send SMS code | JWT |
| POST | `/auth/mfa/send-email` | Send email code | JWT |
| GET | `/auth/mfa/status` | Get MFA status | JWT |
| POST | `/auth/mfa/disable` | Disable MFA | JWT |
| POST | `/auth/mfa/regenerate-backup-codes` | Regenerate backup codes | JWT |

### Session Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/auth/sessions` | Get all sessions | JWT |
| DELETE | `/auth/sessions/:id` | Revoke session | JWT |

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
JWT_REFRESH_SECRET=optional-separate-refresh-secret

# Password Policy
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=true
PASSWORD_MAX_AGE_DAYS=90
PASSWORD_HISTORY_LIMIT=5

# Account Lockout
AUTH_MAX_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=900
AUTH_WINDOW_DURATION=300

# Session Configuration
MAX_SESSIONS_PER_USER=10

# MFA Configuration
MFA_ISSUER_NAME=LexiScanAI
MFA_ENCRYPTION_KEY=your-encryption-key
```

## Security Considerations

### 1. Token Security

- **Short-lived access tokens**: Minimize exposure window
- **Token rotation**: Automatic refresh token rotation
- **Token blacklisting**: Immediate revocation support
- **Secure storage**: httpOnly cookies recommended

### 2. Password Security

- **Strong hashing**: bcrypt with 12 rounds
- **Password policies**: Enforced complexity
- **Password history**: Prevents reuse
- **Rate limiting**: Prevents brute force

### 3. Session Security

- **Device tracking**: Fingerprinting for security
- **Session limits**: Prevent abuse
- **Revocation**: Immediate session termination
- **Automatic cleanup**: Expired session removal

### 4. MFA Security

- **Encrypted secrets**: TOTP secrets encrypted at rest
- **Code expiration**: Short-lived codes
- **Rate limiting**: Prevents code guessing
- **Backup codes**: Secure account recovery

### 5. Audit & Compliance

- **Comprehensive logging**: All security events logged
- **Immutable audit trail**: Append-only logs
- **Context tracking**: Full request context
- **Compliance ready**: GDPR, SOC 2 compatible

## Troubleshooting

### Common Issues

1. **"Invalid token" errors**
   - Check token expiration
   - Verify token hasn't been revoked
   - Check token format

2. **"Account locked" errors**
   - Wait for lockout duration
   - Contact admin to unlock
   - Check failed attempt count

3. **"MFA required" errors**
   - Setup MFA first
   - Verify MFA code
   - Use backup codes if device lost

4. **"Session expired" errors**
   - Refresh token using refresh endpoint
   - Re-authenticate if refresh expired
   - Check session status

## Support

For authentication issues:
- **Email**: auth-support@lexiscan.ai
- **Documentation**: https://docs.lexiscan.ai/auth
- **Security Issues**: security@lexiscan.ai

## Conclusion

This enterprise authentication and authorization system provides:

✅ **World-class security** with industry best practices  
✅ **Scalable architecture** designed for growth  
✅ **Comprehensive features** for enterprise needs  
✅ **Easy maintenance** with clean code structure  
✅ **Compliance ready** with audit logging  
✅ **Developer friendly** with clear APIs  

The system is production-ready and follows OWASP security guidelines and industry standards.
