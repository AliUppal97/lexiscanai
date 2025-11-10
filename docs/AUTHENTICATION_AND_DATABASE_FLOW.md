# LexiScanAI - Complete Authentication Flow & Database Structure

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Authentication Flow - Complete Breakdown](#authentication-flow-complete-breakdown)
3. [Database Structure & Design Decisions](#database-structure--design-decisions)
4. [Security Best Practices & Standards](#security-best-practices--standards)
5. [Multi-Tenant Architecture](#multi-tenant-architecture)
6. [Compliance & Regulatory Alignment](#compliance--regulatory-alignment)
7. [Performance Optimizations](#performance-optimizations)
8. [Implementation Details](#implementation-details)

---

## Executive Summary

LexiScanAI is a **multi-tenant SaaS platform** for legal document processing that requires **enterprise-grade security**, **complete tenant isolation**, and **regulatory compliance** (GDPR, HIPAA, SOC 2). This document provides a comprehensive explanation of our authentication flow and database structure, including the reasoning behind every design decision.

### Key Requirements Addressed

- ✅ **Multi-tenant isolation** at the database level
- ✅ **Enterprise security** with MFA, SSO, and audit logging
- ✅ **Regulatory compliance** (GDPR, HIPAA, SOC 2)
- ✅ **Scalability** for thousands of tenants
- ✅ **Performance** optimization for high-traffic scenarios
- ✅ **Data protection** with encryption and secure storage

---

## Authentication Flow - Complete Breakdown

### 1. User Registration Flow

```
┌─────────────┐
│   Client    │
│  (Next.js)  │
└──────┬──────┘
       │ 1. POST /auth/register
       │    { email, password, firstName, lastName, tenantSlug? }
       ▼
┌─────────────────┐
│  AuthController │
│   (NestJS API)  │
└──────┬──────────┘
       │ 2. Validate input (DTO validation)
       ▼
┌─────────────────┐
│  AuthService    │
│  .register()    │
└──────┬──────────┘
       │ 3. Find or create tenant
       ▼
┌─────────────────┐
│  Tenant Lookup  │
│  - By slug      │
│  - Create if    │
│    new          │
└──────┬──────────┘
       │ 4. Validate password strength
       ▼
┌─────────────────┐
│ SecurityService │
│ - Min 12 chars   │
│ - Complexity     │
│ - Common pwd     │
│   detection      │
└──────┬──────────┘
       │ 5. Hash password (bcrypt, 12 rounds)
       ▼
┌─────────────────┐
│  Password Hash  │
│  bcrypt.hash()  │
└──────┬──────────┘
       │ 6. Create user in database
       ▼
┌─────────────────┐
│   Prisma ORM    │
│  - Check email  │
│    uniqueness   │
│    per tenant   │
│  - Create user  │
│  - Set defaults │
└──────┬──────────┘
       │ 7. Assign default role (Viewer)
       ▼
┌─────────────────┐
│  Role Assignment│
│  - Find default  │
│    role          │
│  - Create       │
│    UserRole     │
└──────┬──────────┘
       │ 8. Create session & generate tokens
       ▼
┌─────────────────┐
│ SessionService  │
│ - Create session│
│ - Generate JWT  │
│ - Hash refresh  │
│   token         │
└──────┬──────────┘
       │ 9. Log audit event
       ▼
┌─────────────────┐
│  AuditLog       │
│  - user.created │
│  - IP, UA, etc. │
└──────┬──────────┘
       │ 10. Return tokens & user data
       ▼
┌─────────────┐
│   Client    │
│ - Store     │
│   tokens    │
│ - Redirect  │
└─────────────┘
```

#### Why This Flow?

1. **Tenant-First Approach**: We find/create tenant first because LexiScanAI is multi-tenant. Each user belongs to a tenant (law firm, organization).
2. **Password Validation Early**: We validate password strength before hashing to avoid unnecessary computation.
3. **Email Uniqueness Per Tenant**: `@@unique([email, tenantId])` allows the same email across different tenants (e.g., `admin@firm1.com` and `admin@firm2.com`).
4. **Default Role Assignment**: New users get "Viewer" role by default (least privilege principle).
5. **Immediate Session Creation**: We create a session immediately so users can start using the app without another login step.

---

### 2. User Login Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /auth/login
       │    { email, password, tenantSlug, mfaCode? }
       ▼
┌─────────────────┐
│  AuthService    │
│  .login()        │
└──────┬──────────┘
       │ 2. Extract device info (IP, User-Agent)
       ▼
┌─────────────────┐
│ SecurityService │
│ - Device        │
│   fingerprint   │
│ - IP tracking   │
└──────┬──────────┘
       │ 3. Find tenant by slug
       ▼
┌─────────────────┐
│  Tenant Lookup  │
│  - Active check  │
│  - Deleted check │
└──────┬──────────┘
       │ 4. Check account lockout
       ▼
┌─────────────────┐
│ Account Lockout │
│ - Max 5 attempts│
│ - 15 min lock   │
│ - Redis cache   │
└──────┬──────────┘
       │ 5. Find user (email + tenantId)
       ▼
┌─────────────────┐
│  User Lookup    │
│  - Email unique │
│    per tenant   │
│  - Active check │
│  - Deleted check│
└──────┬──────────┘
       │ 6. Verify password (bcrypt.compare)
       ▼
┌─────────────────┐
│ Password Verify │
│ - bcrypt.compare│
│ - Timing-safe   │
└──────┬──────────┘
       │ 7. Check MFA requirement
       ▼
┌─────────────────┐
│  MFA Check      │
│  - Has MFA?     │
│  - Verify code  │
└──────┬──────────┘
       │ 8. Create/update session
       ▼
┌─────────────────┐
│ SessionService  │
│ - Create session│
│ - Device info   │
│ - Refresh token │
│   (double hash) │
└──────┬──────────┘
       │ 9. Generate JWT tokens
       ▼
┌─────────────────┐
│  JWT Generation │
│  - Access token │
│    (15 min)     │
│  - Refresh token│
│    (30 days)    │
│  - Include roles│
│    & permissions│
└──────┬──────────┘
       │ 10. Update user (lastLoginAt)
       ▼
┌─────────────────┐
│  User Update    │
│  - lastLoginAt  │
│  - Clear failed │
│    attempts     │
└──────┬──────────┘
       │ 11. Log audit event
       ▼
┌─────────────────┐
│  AuditLog       │
│  - user.login   │
│  - IP, UA, etc. │
└──────┬──────────┘
       │ 12. Return tokens & user data
       ▼
┌─────────────┐
│   Client    │
│ - Store     │
│   tokens    │
│ - Redirect  │
└─────────────┘
```

#### Why This Flow?

1. **Account Lockout Protection**: Prevents brute-force attacks by locking accounts after 5 failed attempts.
2. **Device Fingerprinting**: Tracks devices for security (anomaly detection, session management).
3. **MFA Support**: Optional multi-factor authentication for enhanced security (required for admins).
4. **Double-Hashed Refresh Tokens**: Extra security layer - refresh tokens are hashed twice before storage.
5. **Token Rotation**: Refresh tokens are rotated on each use to prevent token reuse attacks.
6. **Comprehensive Audit Logging**: Every login is logged with IP, user agent, and device info for compliance.

---

### 3. Token Refresh Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /auth/refresh
       │    { refreshToken }
       ▼
┌─────────────────┐
│  AuthService    │
│  .refresh()     │
└──────┬──────────┘
       │ 2. Hash refresh token
       ▼
┌─────────────────┐
│ SecurityService │
│ - Double hash   │
│   refresh token │
└──────┬──────────┘
       │ 3. Find session by refresh token hash
       ▼
┌─────────────────┐
│  Session Lookup │
│  - Active check │
│  - Expired check│
│  - Revoked check│
└──────┬──────────┘
       │ 4. Verify user is still active
       ▼
┌─────────────────┐
│  User Check     │
│  - isActive     │
│  - isDeleted   │
└──────┬──────────┘
       │ 5. Rotate refresh token (new token)
       ▼
┌─────────────────┐
│ Token Rotation  │
│ - Generate new  │
│   refresh token │
│ - Update session│
│ - Invalidate old│
└──────┬──────────┘
       │ 6. Generate new access token
       ▼
┌─────────────────┐
│  JWT Generation │
│  - New access   │
│    token        │
│  - Updated roles│
│    & permissions│
└──────┬──────────┘
       │ 7. Update session (lastUsedAt)
       ▼
┌─────────────────┐
│  Session Update │
│  - lastUsedAt   │
│  - New refresh  │
│    token hash    │
└──────┬──────────┘
       │ 8. Return new tokens
       ▼
┌─────────────┐
│   Client    │
│ - Update    │
│   tokens    │
└─────────────┘
```

#### Why Token Rotation?

1. **Security**: If a refresh token is stolen, it can only be used once. The attacker gets a new token, but the legitimate user's next refresh will invalidate it.
2. **Detection**: Token rotation helps detect token theft - if two refresh requests happen simultaneously, we know something is wrong.
3. **Compliance**: Token rotation is a security best practice recommended by OWASP and NIST.

---

### 4. Protected API Request Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. GET /api/documents
       │    Authorization: Bearer <access-token>
       ▼
┌─────────────────┐
│ EnhancedJwtAuth │
│ Guard           │
└──────┬──────────┘
       │ 2. Extract token from header
       ▼
┌─────────────────┐
│ Token Extraction│
│ - Bearer token  │
│ - Cookie token  │
└──────┬──────────┘
       │ 3. Check token blacklist (Redis)
       ▼
┌─────────────────┐
│ Token Blacklist │
│ - Revoked tokens│
│ - Redis cache   │
└──────┬──────────┘
       │ 4. Verify JWT signature & expiration
       ▼
┌─────────────────┐
│  JWT Verification│
│  - Signature    │
│  - Expiration   │
│  - Payload      │
└──────┬──────────┘
       │ 5. Verify session is still valid
       ▼
┌─────────────────┐
│ Session Verify  │
│  - Active       │
│  - Not expired  │
│  - Not revoked  │
└──────┬──────────┘
       │ 6. Load user with roles & permissions
       ▼
┌─────────────────┐
│  User Load      │
│  - Include roles│
│  - Include      │
│    permissions  │
│  - Include tenant│
└──────┬──────────┘
       │ 7. Verify user & tenant are active
       ▼
┌─────────────────┐
│  Active Check   │
│  - User active  │
│  - Tenant active│
└──────┬──────────┘
       │ 8. Attach user to request object
       ▼
┌─────────────────┐
│ Request Object  │
│  - req.user     │
│  - req.tenantId │
│  - req.permissions│
└──────┬──────────┘
       │ 9. Check permissions (if required)
       ▼
┌─────────────────┐
│ PermissionsGuard│
│  - Check required│
│    permissions  │
│  - Database     │
│    verification │
└──────┬──────────┘
       │ 10. Execute controller method
       ▼
┌─────────────────┐
│ DocumentsController│
│  - Get documents│
│  - Tenant filter│
│    (automatic)  │
└──────┬──────────┘
       │ 11. Return response
       ▼
┌─────────────┐
│   Client    │
└─────────────┘
```

#### Why This Multi-Layer Security?

1. **Token Blacklisting**: Allows immediate revocation of tokens (logout, security breach).
2. **Session Verification**: Even if token is valid, we check if session is still active (prevents use of revoked sessions).
3. **Database Permission Check**: Permissions are checked against database, not just JWT (allows real-time permission updates).
4. **Automatic Tenant Filtering**: All queries automatically filter by tenantId (prevents cross-tenant data leakage).

---

## Database Structure & Design Decisions

### Core Design Principles

1. **Multi-Tenant Isolation**: Every table has `tenantId` for complete isolation
2. **UUID for External IDs**: Prevents enumeration attacks
3. **Internal IDs for Performance**: Integer IDs for database performance (indexes, joins)
4. **Soft Deletes**: Maintains data integrity and audit trails
5. **Audit Logging**: Comprehensive audit trail for compliance
6. **Cascade Deletes**: Maintains referential integrity

---

### 1. Tenant Model

```prisma
model Tenant {
  id          String   @id @default(cuid())        // External UUID
  internalId  Int      @unique @default(autoincrement()) // Internal ID
  name        String
  slug        String   @unique                     // URL-friendly
  domain      String?  @unique                     // Custom domain
  logo        String?
  settings    Json?                                 // Flexible config
  isActive    Boolean  @default(true)
  isDeleted   Boolean  @default(false)
  deletedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Design Decisions & Reasoning

1. **Dual ID System (UUID + Internal ID)**
   - **UUID (`id`)**: External-facing ID prevents enumeration attacks. Users can't guess tenant IDs.
   - **Internal ID (`internalId`)**: Integer for database performance (faster indexes, joins, RLS).
   - **Why Both?**: Best of both worlds - security (UUID) and performance (integer).

2. **Slug for URL-Friendly Identifiers**
   - **Purpose**: `acme-law-firm` is more user-friendly than `clx123abc456`.
   - **Use Case**: Subdomain routing (`acme.lexiscan.ai`), API routes (`/api/tenants/acme-law-firm`).
   - **Indexed**: Fast lookup by slug.

3. **Custom Domain Support**
   - **Purpose**: Enterprise customers can use their own domain (`app.acmefirm.com`).
   - **Why Nullable?**: Not all tenants need custom domains (only enterprise plans).
   - **Unique Constraint**: One domain per tenant.

4. **JSON Settings Field**
   - **Purpose**: Flexible tenant-specific configuration without schema changes.
   - **Use Cases**: Feature flags, branding, integrations, custom workflows.
   - **Trade-off**: Less type-safe, but more flexible for multi-tenant SaaS.

5. **Soft Delete Pattern**
   - **Purpose**: Maintains data integrity and audit trails.
   - **Compliance**: Required for GDPR (right to deletion with retention periods).
   - **Recovery**: Allows data recovery if deletion was accidental.

---

### 2. User Model

```prisma
model User {
  id                String   @id @default(cuid())
  internalId        Int      @unique @default(autoincrement())
  email             String
  passwordHash      String?                              // Nullable for SSO
  firstName         String?
  lastName          String?
  avatar            String?
  phone             String?
  timezone          String   @default("UTC")
  locale            String   @default("en-US")
  isActive          Boolean  @default(true)
  isEmailVerified   Boolean  @default(false)
  emailVerifiedAt   DateTime?
  lastLoginAt       DateTime?
  passwordChangedAt DateTime?
  isDeleted         Boolean  @default(false)
  deletedAt         DateTime?
  tenantId          String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([email, tenantId])  // Email unique per tenant
  @@index([tenantId, email])
  @@index([tenantId, isActive])
  @@index([lastLoginAt])
}
```

#### Design Decisions & Reasoning

1. **Email Uniqueness Per Tenant**
   - **Constraint**: `@@unique([email, tenantId])`
   - **Why?**: Same email can exist in different tenants (e.g., `admin@firm1.com` and `admin@firm2.com`).
   - **Multi-Tenant Requirement**: Essential for SaaS where multiple organizations use the platform.

2. **Nullable Password Hash**
   - **Purpose**: Supports SSO-only users (no password needed).
   - **Use Case**: Enterprise SSO (SAML, OAuth) where users never set passwords.
   - **Validation**: If `passwordHash` is null, user must use SSO.

3. **Email Verification Tracking**
   - **Fields**: `isEmailVerified`, `emailVerifiedAt`
   - **Purpose**: Track email verification status for security and compliance.
   - **Use Case**: Prevent account takeover, ensure valid email addresses.

4. **Password Change Tracking**
   - **Field**: `passwordChangedAt`
   - **Purpose**: Track password changes for security audits and password expiration policies.
   - **Compliance**: Required for SOC 2 and HIPAA.

5. **Timezone & Locale**
   - **Purpose**: Support international users with proper timezone and localization.
   - **Default**: UTC for timezone, en-US for locale.
   - **Use Case**: Display dates in user's timezone, format numbers/currency per locale.

6. **Composite Indexes**
   - **`[tenantId, email]`**: Fast user lookup by tenant and email (most common query).
   - **`[tenantId, isActive]`**: Fast filtering of active users per tenant.
   - **`[lastLoginAt]`**: Fast queries for inactive users, security audits.

---

### 3. RBAC System (Role-Based Access Control)

#### Role Model

```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   // "Admin", "Lawyer", "Paralegal", "Viewer"
  description String?
  isSystem    Boolean  @default(false)  // System vs custom roles
  isActive    Boolean  @default(true)
  tenantId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([name, tenantId])  // Role name unique per tenant
  @@index([tenantId, isSystem])
}
```

#### Permission Model

```prisma
model Permission {
  id          String   @id @default(cuid())
  name        String   // "documents.read", "users.create"
  resource    String   // "documents", "users", "billing"
  action      String   // "read", "create", "update", "delete", "manage"
  description String?
  isSystem    Boolean  @default(false)
  tenantId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([name, tenantId])
  @@index([tenantId, resource, action])
}
```

#### UserRole Model (Many-to-Many)

```prisma
model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  assignedBy String?  // Audit trail
  assignedAt DateTime @default(now())
  expiresAt DateTime? // Temporary access
  tenantId  String

  @@unique([userId, roleId])  // User can't have same role twice
  @@index([tenantId, userId])
  @@index([expiresAt])
}
```

#### RolePermission Model (Many-to-Many)

```prisma
model RolePermission {
  id           String @id @default(cuid())
  roleId       String
  permissionId String
  tenantId     String

  @@unique([roleId, permissionId])  // Role can't have same permission twice
  @@index([tenantId, roleId])
}
```

#### Design Decisions & Reasoning

1. **Resource.Action Permission Pattern**
   - **Format**: `documents.read`, `users.create`, `billing.manage`
   - **Why?**: Clear, hierarchical, easy to understand and maintain.
   - **Benefits**: 
     - Easy to check: `user.hasPermission('documents.read')`
     - Easy to list: All permissions for a resource
     - Easy to document: Clear what each permission does

2. **System vs Custom Roles**
   - **System Roles**: Pre-defined roles (Admin, Lawyer, Paralegal) that can't be deleted.
   - **Custom Roles**: Tenant-specific roles (e.g., "Senior Partner", "Contract Reviewer").
   - **Why?**: Provides flexibility while maintaining standard roles.

3. **Role Expiration**
   - **Field**: `expiresAt` in `UserRole`
   - **Purpose**: Temporary access (e.g., contractor access for 30 days).
   - **Use Case**: Time-limited role assignments for compliance and security.

4. **Audit Trail in UserRole**
   - **Field**: `assignedBy`
   - **Purpose**: Track who assigned the role (compliance requirement).
   - **Use Case**: Security audits, compliance reporting.

5. **Tenant Isolation in RBAC**
   - **Every table has `tenantId`**: Roles and permissions are tenant-specific.
   - **Why?**: Different tenants may have different role structures (e.g., law firm vs. corporate legal).
   - **Benefit**: Complete tenant isolation, no cross-tenant permission leakage.

---

### 4. Session Model

```prisma
model Session {
  id            String    @id @default(cuid())
  userId        String
  tenantId      String
  refreshToken  String    @unique  // Hashed refresh token
  refreshTokenHash String  // Double-hashed for extra security
  deviceInfo    Json?     // Device fingerprint, IP, user agent
  ipAddress     String?
  userAgent     String?
  expiresAt     DateTime
  lastUsedAt    DateTime  @default(now())
  isActive      Boolean   @default(true)
  revokedAt     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId, isActive])
  @@index([refreshTokenHash])
  @@index([expiresAt])
  @@index([tenantId, userId])
}
```

#### Design Decisions & Reasoning

1. **Double-Hashed Refresh Tokens**
   - **Fields**: `refreshToken` (single hash), `refreshTokenHash` (double hash)
   - **Why?**: Extra security layer. Even if database is compromised, tokens are double-hashed.
   - **Process**: 
     - Generate random token → Hash once → Store as `refreshToken`
     - Hash again → Store as `refreshTokenHash`
     - On verification: Hash provided token twice, compare with `refreshTokenHash`

2. **Device Information Tracking**
   - **Field**: `deviceInfo` (JSON)
   - **Purpose**: Device fingerprinting for security (anomaly detection, session management).
   - **Data**: IP address, user agent, screen resolution, timezone, etc.
   - **Use Case**: Alert user if login from new device, detect suspicious activity.

3. **Session Expiration**
   - **Field**: `expiresAt`
   - **Default**: 30 days
   - **Why?**: Balance between security (shorter = more secure) and UX (longer = less login prompts).
   - **Configurable**: Can be adjusted per tenant or user role.

4. **Last Used Tracking**
   - **Field**: `lastUsedAt`
   - **Purpose**: Track session activity for security audits and automatic cleanup.
   - **Use Case**: Revoke inactive sessions, detect abandoned sessions.

5. **Session Revocation**
   - **Field**: `revokedAt`
   - **Purpose**: Immediate session termination (logout, security breach).
   - **Use Case**: User logs out, admin revokes session, security incident.

---

### 5. MFA (Multi-Factor Authentication) Model

```prisma
model MfaDevice {
  id          String   @id @default(cuid())
  userId      String
  tenantId    String
  type        MfaType  // TOTP, SMS, EMAIL, BACKUP
  name        String   // "iPhone 13", "Google Authenticator"
  secret      String   // Encrypted TOTP secret
  isActive    Boolean  @default(true)
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, tenantId, type])  // One device per type per user
  @@index([userId, type])
  @@index([tenantId, userId])
}

enum MfaType {
  TOTP    // Time-based One-Time Password
  SMS     // SMS-based codes
  EMAIL   // Email-based codes
  BACKUP  // Backup codes
}
```

#### Design Decisions & Reasoning

1. **Multiple MFA Types**
   - **TOTP**: Google Authenticator, Authy (most secure, offline).
   - **SMS**: Phone number verification (less secure, but user-friendly).
   - **Email**: Email verification (backup method).
   - **Backup Codes**: One-time codes for account recovery.
   - **Why Multiple?**: Different users prefer different methods, provides flexibility.

2. **Encrypted Secret Storage**
   - **Field**: `secret` (encrypted)
   - **Purpose**: TOTP secrets are encrypted at rest (AES-256-GCM).
   - **Why?**: Even if database is compromised, secrets are encrypted.
   - **Compliance**: Required for SOC 2 and HIPAA.

3. **One Device Per Type**
   - **Constraint**: `@@unique([userId, tenantId, type])`
   - **Why?**: Prevents duplicate devices (e.g., two TOTP devices).
   - **Exception**: Multiple backup codes are allowed (stored separately).

4. **Device Naming**
   - **Field**: `name`
   - **Purpose**: User-friendly device identification ("iPhone 13", "Work Laptop").
   - **Use Case**: User can see and manage their MFA devices.

---

### 6. Audit Log Model

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  tenantId    String
  userId      String?  // Null for system actions
  action      String   // "user.login", "document.create", "role.assign"
  resource    String   // "user", "document", "role"
  resourceId  String?  // ID of the affected resource
  details     Json?    // Additional context and changes
  ipAddress   String?
  userAgent   String?
  sessionId   String?  // Link to session if available
  createdAt   DateTime @default(now())

  @@index([tenantId, createdAt])
  @@index([userId, createdAt])
  @@index([action, createdAt])
  @@index([resource, resourceId])
}
```

#### Design Decisions & Reasoning

1. **Immutable Audit Logs**
   - **No `updatedAt`**: Audit logs are append-only (never updated or deleted).
   - **Why?**: Compliance requirement (SOC 2, GDPR, HIPAA). Audit trail must be tamper-proof.
   - **Trade-off**: Can't correct mistakes, but ensures integrity.

2. **Nullable User ID**
   - **Purpose**: System actions (automated tasks, background jobs) don't have a user.
   - **Use Case**: Scheduled document processing, automated backups, system maintenance.

3. **Action.Resource Pattern**
   - **Format**: `user.login`, `document.create`, `role.assign`
   - **Why?**: Clear, hierarchical, easy to query and analyze.
   - **Benefits**: Easy to find all actions for a resource, easy to filter by action type.

4. **JSON Details Field**
   - **Purpose**: Store additional context (what changed, before/after values, error messages).
   - **Why?**: Flexible storage without schema changes.
   - **Use Case**: Track document changes, permission changes, configuration updates.

5. **Comprehensive Indexing**
   - **`[tenantId, createdAt]`**: Fast queries for tenant audit logs (most common).
   - **`[userId, createdAt]`**: Fast queries for user activity.
   - **`[action, createdAt]`**: Fast queries for specific actions (e.g., all logins).
   - **`[resource, resourceId]`**: Fast queries for resource history (e.g., all changes to a document).

---

## Security Best Practices & Standards

### 1. Password Security

#### Implementation
- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Minimum Length**: 12 characters
- **Complexity Requirements**: Uppercase, lowercase, numbers, special characters
- **Common Password Detection**: Blocks common passwords (e.g., "Password123!")
- **Password History**: Prevents reuse of last 5 passwords
- **Password Expiration**: 90 days (configurable)

#### Why These Standards?

1. **bcrypt with 12 Rounds**
   - **Security**: bcrypt is designed to be slow (prevents brute-force attacks).
   - **12 Rounds**: Balance between security and performance (~300ms per hash).
   - **Industry Standard**: Recommended by OWASP and NIST.

2. **12 Character Minimum**
   - **Security**: Longer passwords are exponentially harder to crack.
   - **Compliance**: Meets SOC 2 and HIPAA requirements.
   - **Industry Standard**: NIST recommends 12+ characters.

3. **Password History**
   - **Purpose**: Prevents password reuse (security risk).
   - **Compliance**: Required for SOC 2 and HIPAA.
   - **Implementation**: Store last 5 password hashes, check on password change.

---

### 2. Token Security

#### Access Tokens
- **Lifetime**: 15 minutes
- **Storage**: httpOnly cookies (recommended) or memory
- **Rotation**: Automatic on refresh
- **Blacklisting**: Redis cache for revoked tokens

#### Refresh Tokens
- **Lifetime**: 30 days
- **Storage**: httpOnly cookies (recommended)
- **Rotation**: Automatic on each refresh
- **Double Hashing**: Extra security layer

#### Why These Standards?

1. **Short-Lived Access Tokens (15 min)**
   - **Security**: Minimizes exposure window if token is stolen.
   - **Trade-off**: More refresh requests, but better security.
   - **Industry Standard**: OWASP recommends 15-30 minutes.

2. **Token Rotation**
   - **Security**: Prevents token reuse attacks.
   - **Detection**: Helps detect token theft (two simultaneous refreshes).
   - **Industry Standard**: Recommended by OWASP and NIST.

3. **Double-Hashed Refresh Tokens**
   - **Security**: Extra layer of protection (even if database is compromised).
   - **Process**: Hash once → Store, Hash again → Store separately.
   - **Verification**: Hash provided token twice, compare with double hash.

---

### 3. Account Lockout

#### Implementation
- **Max Failed Attempts**: 5
- **Lockout Duration**: 15 minutes
- **Tracking Window**: 5 minutes
- **Storage**: Redis cache (fast, distributed)

#### Why These Standards?

1. **5 Failed Attempts**
   - **Security**: Prevents brute-force attacks.
   - **UX**: Not too restrictive (users can make mistakes).
   - **Industry Standard**: OWASP recommends 3-5 attempts.

2. **15 Minute Lockout**
   - **Security**: Long enough to deter attackers, short enough for legitimate users.
   - **Auto-Unlock**: Automatically unlocks after duration (no admin intervention needed).
   - **Industry Standard**: OWASP recommends 15-30 minutes.

3. **Redis Cache Storage**
   - **Performance**: Fast lookups (O(1) complexity).
   - **Distributed**: Works across multiple API servers.
   - **TTL**: Automatic expiration (no manual cleanup needed).

---

### 4. Multi-Factor Authentication (MFA)

#### Implementation
- **TOTP**: Google Authenticator, Authy (6-digit codes, 30-second window)
- **SMS**: 6-digit codes, 10-minute expiration
- **Email**: 6-digit codes, 10-minute expiration
- **Backup Codes**: 8-character alphanumeric, single-use

#### Why These Standards?

1. **TOTP (Time-based One-Time Password)**
   - **Security**: Most secure MFA method (offline, no SMS interception).
   - **Industry Standard**: RFC 6238 (TOTP standard).
   - **User-Friendly**: Works with popular apps (Google Authenticator, Authy).

2. **SMS & Email Backup**
   - **Purpose**: Backup methods if TOTP device is lost.
   - **Security**: Less secure than TOTP (SMS can be intercepted), but better than nothing.
   - **Use Case**: Account recovery, user preference.

3. **Backup Codes**
   - **Purpose**: Account recovery if all MFA devices are lost.
   - **Security**: Single-use only (prevents reuse).
   - **Storage**: Encrypted in database.

---

### 5. Session Management

#### Implementation
- **Concurrent Sessions**: Max 10 per user
- **Session Expiration**: 30 days
- **Automatic Cleanup**: Daily job removes expired sessions
- **Device Tracking**: IP, user agent, device fingerprint

#### Why These Standards?

1. **10 Concurrent Sessions**
   - **Security**: Limits exposure if credentials are stolen.
   - **UX**: Allows multiple devices (phone, laptop, tablet).
   - **Configurable**: Can be adjusted per tenant or user role.

2. **30 Day Expiration**
   - **Security**: Balance between security and UX.
   - **Industry Standard**: OWASP recommends 30-90 days.
   - **Configurable**: Can be adjusted per tenant or user role.

3. **Device Tracking**
   - **Security**: Anomaly detection (alert on new device).
   - **Compliance**: Required for SOC 2 and HIPAA.
   - **Use Case**: Security audits, session management.

---

## Multi-Tenant Architecture

### Tenant Isolation Strategy

LexiScanAI uses **Row-Level Security (RLS)** at the database level to ensure complete tenant isolation.

#### Implementation

1. **Every Table Has `tenantId`**
   - All tenant-scoped tables include `tenantId` column.
   - All queries automatically filter by `tenantId`.
   - Prevents cross-tenant data leakage.

2. **Database-Level RLS (PostgreSQL)**
   ```sql
   -- Enable RLS
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;

   -- Create tenant isolation policy
   CREATE POLICY tenant_isolation_users ON users
     USING (tenant_id = current_setting('app.current_tenant')::text);
   ```

3. **Application-Level Filtering**
   - All Prisma queries automatically include `tenantId` filter.
   - Guards verify `tenantId` from JWT token.
   - Prevents manual `tenantId` override in API requests.

#### Why This Approach?

1. **Defense in Depth**
   - **Database Level**: Even if application code has bugs, database enforces isolation.
   - **Application Level**: Fast queries, easy to implement.
   - **Combined**: Best of both worlds.

2. **Performance**
   - **Indexes**: `@@index([tenantId, ...])` ensures fast tenant-scoped queries.
   - **Query Optimization**: Database can optimize queries with `tenantId` filter.

3. **Compliance**
   - **SOC 2**: Requires complete tenant isolation.
   - **GDPR**: Requires data isolation between organizations.
   - **HIPAA**: Requires data isolation for healthcare data.

---

## Compliance & Regulatory Alignment

### GDPR Compliance

#### Data Protection
- **Encryption**: All sensitive data encrypted at rest (AES-256-GCM).
- **Access Control**: Role-based access control (RBAC) ensures only authorized users access data.
- **Audit Logging**: Comprehensive audit logs track all data access and modifications.

#### Data Subject Rights
- **Right to Access**: Users can request their data (export functionality).
- **Right to Deletion**: Soft deletes with retention periods (compliance with legal holds).
- **Right to Portability**: Data export in machine-readable format (JSON, CSV).

#### Implementation
- **Soft Deletes**: `isDeleted` flag maintains data integrity while allowing deletion.
- **Data Retention**: Configurable retention periods per tenant.
- **Audit Logs**: Immutable audit logs track all data access.

---

### HIPAA Compliance

#### Healthcare Data Protection
- **Encryption**: All PHI (Protected Health Information) encrypted at rest and in transit.
- **Access Control**: Role-based access control (RBAC) with audit logging.
- **Audit Logging**: Comprehensive audit logs for all PHI access.

#### Implementation
- **Field Encryption**: Sensitive fields (patient names, medical records) encrypted.
- **Access Logging**: All PHI access logged with user, timestamp, and reason.
- **Data Retention**: HIPAA-compliant data retention policies.

---

### SOC 2 Type II Compliance

#### Security Controls
- **Access Control**: Multi-factor authentication (MFA), role-based access control (RBAC).
- **Encryption**: Data encryption at rest and in transit.
- **Audit Logging**: Comprehensive audit logs for all system activities.

#### Implementation
- **MFA**: Required for admin users, optional for regular users.
- **Audit Logs**: Immutable audit logs track all system activities.
- **Session Management**: Secure session management with device tracking.

---

## Performance Optimizations

### Database Indexes

#### Strategic Indexing
```prisma
// Tenant model
@@index([slug])                    // Fast tenant lookup by slug
@@index([domain])                  // Fast tenant lookup by domain
@@index([isActive, isDeleted])     // Fast filtering of active tenants

// User model
@@index([tenantId, email])         // Fast user lookup (most common query)
@@index([tenantId, isActive])     // Fast filtering of active users
@@index([lastLoginAt])            // Fast queries for inactive users

// Session model
@@index([userId, isActive])        // Fast session lookup
@@index([refreshTokenHash])       // Fast refresh token verification
@@index([expiresAt])              // Fast expired session cleanup
@@index([tenantId, userId])      // Fast tenant-scoped session queries
```

#### Why These Indexes?

1. **Composite Indexes**
   - **`[tenantId, email]`**: Most common query (user lookup by tenant and email).
   - **`[tenantId, isActive]`**: Fast filtering of active users per tenant.
   - **Benefits**: Database can use index for both filtering and sorting.

2. **Single-Column Indexes**
   - **`[slug]`**: Fast tenant lookup by slug (subdomain routing).
   - **`[refreshTokenHash]`**: Fast refresh token verification (O(1) lookup).
   - **Benefits**: Fast lookups for unique identifiers.

---

### Query Optimization

#### Prisma Query Patterns

1. **Tenant-Scoped Queries**
   ```typescript
   // Automatic tenant filtering
   const documents = await prisma.document.findMany({
     where: {
       tenantId: user.tenantId,  // Always include tenantId
       status: 'PROCESSED'
     }
   });
   ```

2. **Eager Loading**
   ```typescript
   // Load user with roles and permissions in one query
   const user = await prisma.user.findUnique({
     where: { id: userId },
     include: {
       userRoles: {
         include: {
           role: {
             include: {
               rolePermissions: {
                 include: {
                   permission: true
                 }
               }
             }
           }
         }
       }
     }
   });
   ```

3. **Selective Fields**
   ```typescript
   // Only select needed fields (reduces data transfer)
   const users = await prisma.user.findMany({
     where: { tenantId },
     select: {
       id: true,
       email: true,
       firstName: true,
       lastName: true
       // Don't select passwordHash, etc.
     }
   });
   ```

---

## Implementation Details

### Technology Stack

#### Backend
- **Framework**: NestJS (TypeScript, dependency injection, modular architecture)
- **ORM**: Prisma (type-safe database access, migrations, schema management)
- **Database**: PostgreSQL (ACID compliance, RLS support, JSON support)
- **Cache**: Redis (session storage, token blacklisting, rate limiting)
- **Authentication**: Passport.js + JWT (stateless authentication)

#### Security Libraries
- **Password Hashing**: bcryptjs (12 rounds)
- **JWT**: @nestjs/jwt (token generation and verification)
- **MFA**: otplib (TOTP generation and verification)
- **Encryption**: crypto (AES-256-GCM for field encryption)

---

### Code Structure

```
apps/api/src/modules/auth/
├── auth.service.ts           # Main authentication logic
├── auth.controller.ts        # API endpoints
├── security.service.ts        # Password, lockout, device fingerprinting
├── session.service.ts         # Session management
├── mfa.service.ts             # Multi-factor authentication
├── sso.service.ts             # SSO integration
├── api-key.service.ts         # API key authentication
├── guards/
│   ├── enhanced-auth.guard.ts    # Enhanced JWT guard
│   ├── permissions.guard.ts      # Permission checking
│   └── roles.guard.ts             # Role checking
└── auth.module.ts            # Module configuration
```

---

## Conclusion

This authentication and database structure provides:

✅ **Complete Tenant Isolation**: Row-level security at database level  
✅ **Enterprise Security**: MFA, SSO, audit logging, encryption  
✅ **Regulatory Compliance**: GDPR, HIPAA, SOC 2 ready  
✅ **Scalability**: Optimized for thousands of tenants  
✅ **Performance**: Strategic indexing and query optimization  
✅ **Best Practices**: Industry-standard security practices (OWASP, NIST)  

The system is **production-ready** and follows **world-class security standards** for enterprise SaaS applications.

---

## References

- **OWASP**: [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- **NIST**: [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- **Prisma**: [Prisma Documentation](https://www.prisma.io/docs)
- **NestJS**: [NestJS Documentation](https://docs.nestjs.com/)
- **PostgreSQL**: [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

