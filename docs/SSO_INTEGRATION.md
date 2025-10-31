# SSO (Single Sign-On) Integration Guide

## Overview

This guide covers the enterprise SSO integration system that supports OAuth2/OIDC providers including Google, Microsoft, and generic OAuth2 providers. The system enables seamless single sign-on authentication for enterprise customers.

## Supported Providers

1. **Google** - OAuth2/OIDC via Google Accounts
2. **Microsoft** - OAuth2/OIDC via Azure AD / Microsoft 365
3. **Generic OAuth2** - Any OAuth2/OIDC-compliant provider
4. **SAML** - Planned for future implementation

## Architecture

### SSO Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. GET /auth/sso/authorize
       ▼
┌─────────────────┐
│   SsoService    │
│  - Generate     │
│    state token  │
│  - Build auth   │
│    URL          │
└──────┬──────────┘
       │ 2. Redirect to provider
       ▼
┌─────────────────┐
│  SSO Provider   │
│  (Google/MS/etc)│
└──────┬──────────┘
       │ 3. User authenticates
       │ 4. Redirect with code
       ▼
┌─────────────────┐
│  Callback URL   │
│  /auth/sso/     │
│  callback       │
└──────┬──────────┘
       │ 5. Exchange code for tokens
       ▼
┌─────────────────┐
│   SsoService    │
│  - Exchange     │
│    code         │
│  - Get profile  │
│  - Create user  │
│  - Create       │
│    session      │
└──────┬──────────┘
       │ 6. Return tokens
       ▼
┌─────────────┐
│   Client    │
│  Logged in  │
└─────────────┘
```

## Setup

### 1. Configure SSO Provider

#### Create Google SSO Provider

```typescript
POST /auth/sso/providers
Authorization: Bearer <admin-token>
{
  "provider": "GOOGLE",
  "name": "Google Workspace",
  "clientId": "your-google-client-id",
  "clientSecret": "your-google-client-secret",
  "callbackURL": "https://app.lexiscan.ai/auth/sso/callback",
  "isDefault": true
}
```

#### Create Microsoft SSO Provider

```typescript
POST /auth/sso/providers
Authorization: Bearer <admin-token>
{
  "provider": "MICROSOFT",
  "name": "Azure AD",
  "clientId": "your-azure-app-id",
  "clientSecret": "your-azure-secret",
  "issuerURL": "https://login.microsoftonline.com/tenant-id/v2.0",
  "domain": "company.com", // Optional: restrict to domain
  "callbackURL": "https://app.lexiscan.ai/auth/sso/callback",
  "isDefault": false
}
```

#### Create Generic OAuth2 Provider

```typescript
POST /auth/sso/providers
Authorization: Bearer <admin-token>
{
  "provider": "OAUTH2",
  "name": "Custom OAuth2 Provider",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "authorizationURL": "https://provider.com/oauth/authorize",
  "tokenURL": "https://provider.com/oauth/token",
  "userInfoURL": "https://provider.com/oauth/userinfo",
  "scopes": ["openid", "profile", "email"],
  "callbackURL": "https://app.lexiscan.ai/auth/sso/callback",
  "isDefault": false
}
```

### 2. OAuth2 Provider Configuration

#### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API or Google Identity API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://app.lexiscan.ai/auth/sso/callback`
6. Copy Client ID and Client Secret

**Required Scopes:**
- `openid`
- `profile`
- `email`

#### Microsoft Azure AD Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory → App registrations
3. Create new registration
4. Add redirect URI: `https://app.lexiscan.ai/auth/sso/callback`
5. Create client secret
6. Copy Application (client) ID and secret

**Required Scopes:**
- `openid`
- `profile`
- `email`

**Optional:** Configure domain restriction in `domain` field.

## Usage

### 1. Get Authorization URL

```typescript
GET /auth/sso/authorize?tenantId=<tenant-id>&provider=GOOGLE

Response:
{
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "state": "csrf-protection-token"
}
```

### 2. Redirect User to Authorization URL

```javascript
// Client-side redirect
window.location.href = authorizationUrl;
```

### 3. Handle Callback

The OAuth2 provider will redirect to:
```
https://app.lexiscan.ai/auth/sso/callback?code=<auth-code>&state=<state-token>
```

**GET Callback:**
```typescript
GET /auth/sso/callback?code=<code>&state=<state>&provider=GOOGLE&tenantId=<tenant-id>

Response:
{
  "user": { ... },
  "tenant": { ... },
  "accessToken": "...",
  "refreshToken": "...",
  "session": { ... }
}
```

**POST Callback:**
```typescript
POST /auth/sso/callback
{
  "code": "<auth-code>",
  "state": "<state-token>",
  "provider": "GOOGLE",
  "tenantId": "<tenant-id>"
}

Response:
{
  "user": { ... },
  "tenant": { ... },
  "accessToken": "...",
  "refreshToken": "...",
  "session": { ... }
}
```

## API Reference

### SSO Provider Management

#### Get SSO Providers

```typescript
GET /auth/sso/providers
Authorization: Bearer <token>

Response: [
  {
    "id": "provider-id",
    "name": "Google Workspace",
    "provider": "GOOGLE",
    "isActive": true,
    "isDefault": true,
    "config": {
      "clientId": "masked",
      "clientSecret": "***masked***"
    }
  }
]
```

#### Create/Update SSO Provider

```typescript
POST /auth/sso/providers
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "GOOGLE",
  "name": "Google Workspace",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "callbackURL": "https://app.lexiscan.ai/auth/sso/callback",
  "isDefault": true
}

Response: {
  "id": "provider-id",
  "name": "Google Workspace",
  "provider": "GOOGLE",
  "isActive": true,
  "isDefault": true
}
```

#### Delete SSO Provider

```typescript
DELETE /auth/sso/providers/GOOGLE
Authorization: Bearer <token>

Response: {
  "message": "SSO provider deleted successfully"
}
```

#### Disable SSO Provider

```typescript
PUT /auth/sso/providers/GOOGLE/disable
Authorization: Bearer <token>

Response: {
  "message": "SSO provider disabled successfully"
}
```

### SSO Authentication

#### Get Authorization URL

```typescript
GET /auth/sso/authorize?tenantId=<tenant-id>&provider=GOOGLE&redirectUri=<optional-redirect>

Response: {
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "state": "csrf-protection-token"
}
```

**Query Parameters:**
- `tenantId` (required): Tenant identifier
- `provider` (required): Provider type (GOOGLE, MICROSOFT, OAUTH2)
- `redirectUri` (optional): Custom redirect URI

#### Handle Callback

```typescript
GET /auth/sso/callback?code=<code>&state=<state>&provider=GOOGLE&tenantId=<tenant-id>

POST /auth/sso/callback
{
  "code": "<auth-code>",
  "state": "<state-token>",
  "provider": "GOOGLE",
  "tenantId": "<tenant-id>"
}
```

## Security Features

### 1. State Token Protection

- **CSRF Protection**: State token prevents CSRF attacks
- **10-minute expiration**: State tokens expire after 10 minutes
- **Per-tenant isolation**: State tokens are tenant-specific

### 2. Secret Encryption

- **Encrypted storage**: Client secrets encrypted in database
- **Secure transmission**: HTTPS required for all SSO flows
- **No secret exposure**: Secrets never returned in API responses

### 3. User Account Linking

- **Email matching**: SSO users linked by email address
- **Auto-verification**: Email automatically verified from SSO provider
- **Account creation**: New users created if email doesn't exist

### 4. Session Management

- **Secure sessions**: Sessions created with device tracking
- **Token rotation**: Refresh tokens rotated on use
- **Session revocation**: Support for session management

## Implementation Example

### Frontend Integration

```typescript
// 1. Get authorization URL
const response = await fetch(
  `/api/auth/sso/authorize?tenantId=${tenantId}&provider=GOOGLE`
);
const { authorizationUrl, state } = await response.json();

// 2. Store state for verification
localStorage.setItem('sso_state', state);

// 3. Redirect to provider
window.location.href = authorizationUrl;

// 4. Handle callback (on callback page)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');
const provider = urlParams.get('provider');

// 5. Verify state matches
const storedState = localStorage.getItem('sso_state');
if (state !== storedState) {
  throw new Error('Invalid state parameter');
}

// 6. Exchange code for tokens
const callbackResponse = await fetch('/api/auth/sso/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code, state, provider, tenantId }),
});

const { accessToken, refreshToken, user } = await callbackResponse.json();

// 7. Store tokens and redirect to app
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
window.location.href = '/dashboard';
```

## Configuration

### Environment Variables

```bash
# SSO Configuration
BASE_URL=https://app.lexiscan.ai
SSO_ENCRYPTION_KEY=your-encryption-key-32-characters-minimum

# For production, use proper encryption
SSO_ENCRYPTION_KEY=<generate-strong-key>
```

### Provider-Specific Configuration

#### Google OAuth2

**Default Scopes:**
- `openid`
- `profile`
- `email`

**Authorization URL:** `https://accounts.google.com/o/oauth2/v2/auth`
**Token URL:** `https://oauth2.googleapis.com/token`
**UserInfo URL:** `https://www.googleapis.com/oauth2/v2/userinfo`

#### Microsoft OAuth2/OIDC

**Default Scopes:**
- `openid`
- `profile`
- `email`

**Issuer URL:** `https://login.microsoftonline.com/{tenant-id}/v2.0`
**Authorization URL:** `{issuer}/authorize`
**Token URL:** `{issuer}/token`
**UserInfo URL:** `https://graph.microsoft.com/v1.0/me`

**Domain Restriction:**
- Use `domain` field to restrict to specific organization domain
- Example: `"domain": "company.com"` restricts to @company.com emails

## Troubleshooting

### Common Issues

1. **"Invalid state parameter"**
   - State token expired (10 minutes)
   - State mismatch between request and callback
   - Solution: Re-initiate SSO flow

2. **"SSO provider not found"**
   - Provider not configured for tenant
   - Provider disabled
   - Solution: Verify provider configuration

3. **"Invalid client credentials"**
   - Client ID or secret incorrect
   - Provider credentials expired
   - Solution: Update provider credentials

4. **"Email mismatch"**
   - User email from provider doesn't match tenant domain
   - Domain restriction configured
   - Solution: Check domain restrictions

5. **"User not found"**
   - User doesn't exist in tenant
   - Solution: User will be auto-created (if SSO-only)

## Best Practices

### 1. Provider Configuration

✅ **Recommended:**
- Use strong client secrets
- Enable HTTPS for all callbacks
- Set appropriate scopes (least privilege)
- Configure domain restrictions for Microsoft
- Use separate providers for different environments

❌ **Not Recommended:**
- Sharing client secrets
- Using HTTP for callbacks
- Requesting unnecessary scopes
- Storing secrets in code

### 2. Error Handling

- Always handle OAuth2 errors gracefully
- Provide clear error messages to users
- Log security events for failed SSO attempts
- Implement retry logic with backoff

### 3. Security

- Always use HTTPS in production
- Validate state tokens on every callback
- Encrypt client secrets at rest
- Implement rate limiting on SSO endpoints
- Monitor for suspicious SSO activity

### 4. User Experience

- Show clear SSO provider options
- Handle provider errors gracefully
- Provide fallback to password login
- Auto-create users from SSO (optional)

## Advanced Features

### Domain Restriction (Microsoft)

```typescript
{
  "provider": "MICROSOFT",
  "name": "Company Azure AD",
  "domain": "company.com", // Only @company.com emails allowed
  "clientId": "...",
  "clientSecret": "..."
}
```

### Custom Scopes

```typescript
{
  "provider": "GOOGLE",
  "scopes": ["openid", "profile", "email", "https://www.googleapis.com/auth/calendar.readonly"]
}
```

### Multiple Providers

- Configure multiple SSO providers per tenant
- Set one as default
- Users can choose provider on login

### SSO-Only Users

- Users created via SSO don't need passwords
- Can link SSO to existing password-based accounts
- Support passwordless authentication

## Compliance

The SSO implementation supports:

- **OAuth2/OIDC Standards**: RFC 6749, OpenID Connect Core 1.0
- **Security Best Practices**: OWASP guidelines
- **Enterprise Requirements**: SAML support planned
- **GDPR Compliance**: User data handling compliant
- **SOC 2**: Audit logging included

## Support

For SSO integration issues:

- **Email**: sso-support@lexiscan.ai
- **Documentation**: https://docs.lexiscan.ai/sso
- **Security Issues**: security@lexiscan.ai

## Conclusion

The SSO integration provides enterprise-grade single sign-on capabilities with support for:

✅ **Multiple Providers**: Google, Microsoft, Generic OAuth2  
✅ **Security**: State token protection, secret encryption  
✅ **User Management**: Auto-creation, account linking  
✅ **Session Management**: Secure token handling  
✅ **Compliance**: OAuth2/OIDC standards, audit logging  

The system is production-ready and follows industry best practices for SSO implementation.
