# Authentication Guide

## Overview

LexiScan AI uses JWT (JSON Web Tokens) for authentication and authorization. This guide covers all aspects of authentication, including token management, security best practices, and multi-tenant access control.

## Table of Contents

- [Authentication Methods](#authentication-methods)
- [Token Management](#token-management)
- [Multi-Tenant Security](#multi-tenant-security)
- [API Key Authentication](#api-key-authentication)
- [Security Best Practices](#security-best-practices)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Authentication Methods

### 1. JWT Token Authentication (Primary)

**Header Format:**
```
Authorization: Bearer <jwt-token>
```

**Token Structure:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "tenantId": "tenant-uuid",
  "role": "admin",
  "permissions": ["documents:read", "documents:write"],
  "iat": 1642234567,
  "exp": 1642839367
}
```

### 2. API Key Authentication (Secondary)

**Header Format:**
```
X-API-Key: <api-key>
```

**Use Cases:**
- Server-to-server communication
- Webhook endpoints
- Third-party integrations
- Automated scripts

## Token Management

### Token Lifecycle

1. **Login** → Receive JWT token
2. **Use Token** → Include in API requests
3. **Refresh** → Use refresh token before expiration
4. **Logout** → Invalidate token

### Token Expiration

| Token Type | Default Expiration | Refreshable |
|------------|-------------------|-------------|
| Access Token | 7 days | Yes |
| Refresh Token | 30 days | Yes |
| API Key | 1 year | Yes |

### Refresh Token Flow

```javascript
// 1. Login to get tokens
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { accessToken, refreshToken } = await loginResponse.json();

// 2. Use access token for API calls
const apiResponse = await fetch('/api/documents', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// 3. Refresh token when access token expires
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
```

## Multi-Tenant Security

### Tenant Isolation

All API requests are automatically scoped to the user's tenant:

```javascript
// User belongs to "acme-law-firm" tenant
// All requests automatically include tenant context
const documents = await fetch('/api/documents', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
// Returns only documents from "acme-law-firm" tenant
```

### Tenant Context

The tenant context is determined from the JWT token and cannot be overridden:

```javascript
// ❌ This will NOT work - tenant cannot be changed
const documents = await fetch('/api/documents?tenantId=other-tenant', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// ✅ This works - tenant is from token
const documents = await fetch('/api/documents', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## API Key Authentication

### Creating API Keys

```javascript
// Create API key
const apiKeyResponse = await fetch('/api/api-keys', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Production Integration',
    scopes: ['documents:read', 'documents:write'],
    expiresAt: '2025-12-31T23:59:59Z'
  })
});

const { apiKey } = await apiKeyResponse.json();
```

### Using API Keys

```javascript
// Use API key for authentication
const documents = await fetch('/api/documents', {
  headers: {
    'X-API-Key': apiKey
  }
});
```

### API Key Scopes

| Scope | Description | Endpoints |
|-------|-------------|-----------|
| `documents:read` | Read document data | `GET /documents`, `GET /documents/{id}` |
| `documents:write` | Create/update documents | `POST /documents`, `PUT /documents/{id}` |
| `documents:delete` | Delete documents | `DELETE /documents/{id}` |
| `analysis:read` | Read analysis results | `GET /analysis/{id}` |
| `analysis:create` | Start analysis | `POST /documents/{id}/analyze` |
| `billing:read` | Read billing info | `GET /billing/subscriptions` |
| `webhooks:manage` | Manage webhooks | `POST /webhooks`, `PUT /webhooks/{id}` |

## Security Best Practices

### 1. Token Storage

**✅ Secure Storage:**
```javascript
// Store in httpOnly cookies (recommended)
document.cookie = `token=${jwtToken}; httpOnly; secure; sameSite=strict`;

// Or in secure memory (for SPAs)
const token = sessionStorage.getItem('token'); // Only for development
```

**❌ Insecure Storage:**
```javascript
// Never store in localStorage for production
localStorage.setItem('token', jwtToken); // Vulnerable to XSS
```

### 2. Token Transmission

**✅ Secure Transmission:**
```javascript
// Always use HTTPS
const response = await fetch('https://api.lexiscan.ai/documents', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**❌ Insecure Transmission:**
```javascript
// Never send tokens over HTTP
const response = await fetch('http://api.lexiscan.ai/documents'); // Insecure
```

### 3. Token Validation

```javascript
// Validate token before use
function isValidToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

// Use token only if valid
if (isValidToken(token)) {
  const response = await fetch('/api/documents', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}
```

### 4. Automatic Token Refresh

```javascript
class ApiClient {
  constructor() {
    this.token = null;
    this.refreshToken = null;
  }

  async makeRequest(url, options = {}) {
    try {
      return await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          ...options.headers
        }
      });
    } catch (error) {
      if (error.status === 401) {
        await this.refreshAccessToken();
        return this.makeRequest(url, options);
      }
      throw error;
    }
  }

  async refreshAccessToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });
    
    const { accessToken } = await response.json();
    this.token = accessToken;
  }
}
```

## Error Handling

### Common Authentication Errors

| Error Code | HTTP Status | Description | Solution |
|------------|-------------|-------------|----------|
| `UNAUTHORIZED` | 401 | Invalid or missing token | Re-authenticate |
| `TOKEN_EXPIRED` | 401 | Token has expired | Refresh token |
| `INVALID_TOKEN` | 401 | Malformed token | Check token format |
| `TENANT_MISMATCH` | 403 | Token tenant mismatch | Use correct tenant token |
| `INSUFFICIENT_PERMISSIONS` | 403 | Missing required permissions | Check user role/permissions |
| `API_KEY_INVALID` | 401 | Invalid API key | Regenerate API key |
| `API_KEY_EXPIRED` | 401 | API key has expired | Create new API key |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": {
      "reason": "Missing or invalid token",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Handling Authentication Errors

```javascript
async function handleApiRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      // Token expired or invalid
      await refreshToken();
      return fetch(url, options); // Retry with new token
    }
    
    if (response.status === 403) {
      // Insufficient permissions
      throw new Error('Access denied. Contact your administrator.');
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

## Examples

### Complete Authentication Flow

```javascript
class LexiScanAuth {
  constructor() {
    this.baseUrl = 'https://api.lexiscan.ai';
    this.token = null;
    this.refreshToken = null;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.token = data.data.token;
    this.refreshToken = data.data.refreshToken;
    
    return data.data.user;
  }

  async logout() {
    if (this.token) {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
    }
    
    this.token = null;
    this.refreshToken = null;
  }

  async makeAuthenticatedRequest(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      await this.refreshToken();
      return this.makeAuthenticatedRequest(endpoint, options);
    }

    return response;
  }

  async refreshToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.token = data.data.token;
  }
}

// Usage
const auth = new LexiScanAuth();

// Login
await auth.login('user@example.com', 'password123');

// Make authenticated requests
const documents = await auth.makeAuthenticatedRequest('/documents');
const analysis = await auth.makeAuthenticatedRequest('/documents/123/analyze', {
  method: 'POST',
  body: JSON.stringify({ analysisType: 'contract_review' })
});

// Logout
await auth.logout();
```

### API Key Usage

```javascript
class LexiScanApiClient {
  constructor(apiKey) {
    this.baseUrl = 'https://api.lexiscan.ai';
    this.apiKey = apiKey;
  }

  async makeRequest(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  async getDocuments() {
    return this.makeRequest('/documents');
  }

  async uploadDocument(file, title) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    return this.makeRequest('/documents', {
      method: 'POST',
      body: formData,
      headers: {} // Don't set Content-Type for FormData
    });
  }
}

// Usage
const client = new LexiScanApiClient('your-api-key-here');
const documents = await client.getDocuments();
```

## Security Considerations

### 1. Token Security

- **Never log tokens** in production
- **Use HTTPS** for all API communications
- **Implement token rotation** for long-lived sessions
- **Monitor token usage** for suspicious activity

### 2. API Key Security

- **Rotate API keys** regularly
- **Use least privilege** principle for scopes
- **Monitor API key usage** and set up alerts
- **Store API keys securely** in environment variables

### 3. Multi-Tenant Security

- **Validate tenant context** on every request
- **Implement tenant isolation** at the database level
- **Audit cross-tenant access** attempts
- **Use tenant-specific encryption** for sensitive data

### 4. Rate Limiting

- **Implement rate limiting** per user/tenant
- **Use exponential backoff** for retries
- **Monitor for abuse** patterns
- **Implement circuit breakers** for failing services

## Troubleshooting

### Common Issues

1. **"Invalid token" errors**
   - Check token format and expiration
   - Verify token hasn't been tampered with
   - Ensure token is properly encoded

2. **"Tenant mismatch" errors**
   - Verify user belongs to correct tenant
   - Check tenant ID in token payload
   - Ensure tenant is active

3. **"Insufficient permissions" errors**
   - Check user role and permissions
   - Verify API key scopes
   - Contact administrator for role updates

4. **Token refresh failures**
   - Check refresh token validity
   - Verify refresh token hasn't expired
   - Implement proper error handling

### Debug Mode

Enable debug logging for authentication issues:

```javascript
// Enable debug mode
localStorage.setItem('debug', 'lexiscan:auth');

// Check token payload
function debugToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Expires at:', new Date(payload.exp * 1000));
    console.log('Time until expiry:', (payload.exp * 1000) - Date.now(), 'ms');
  } catch (error) {
    console.error('Invalid token format:', error);
  }
}
```

## Support

For authentication issues:

- **Email**: auth-support@lexiscan.ai
- **Documentation**: https://docs.lexiscan.ai/auth
- **Status Page**: https://status.lexiscan.ai
- **Emergency**: security@lexiscan.ai

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial authentication system |
| 1.1.0 | 2024-01-20 | Added API key authentication |
| 1.2.0 | 2024-01-25 | Enhanced multi-tenant security |
| 1.3.0 | 2024-02-01 | Added token refresh mechanism |
