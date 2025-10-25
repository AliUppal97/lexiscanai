# Core Services Documentation

## Overview

This document provides comprehensive documentation for all 10 core services in the LexiScan AI backend.

---

## 1. Email Service

**File:** `src/services/email.service.ts`

### Features
- SMTP-based email delivery via nodemailer
- Pre-built HTML email templates
- Bulk email support with rate limiting
- Attachment support

### Pre-built Templates
- Welcome email
- Password reset
- Email verification
- Document processed notification
- Invoice notification
- Subscription expiring alert
- Team invitation

### Usage Example
```typescript
import { EmailService } from './services';

// Inject via dependency injection
constructor(private emailService: EmailService) {}

// Send welcome email
await this.emailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);

// Send custom email
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Important Update',
  html: '<h1>Hello World</h1>',
});
```

---

## 2. Storage Service

**File:** `src/services/storage.service.ts`

### Features
- Multi-cloud abstraction (AWS S3, Azure Blob, GCS, Local)
- Upload/Download/Delete operations
- Signed URLs for temporary access
- File listing and metadata

### Usage Example
```typescript
import { StorageService } from './services';

constructor(private storageService: StorageService) {}

// Upload file
const result = await this.storageService.upload(
  fileBuffer,
  'documents/report.pdf'
);

// Generate signed URL (1 hour expiry)
const url = await this.storageService.getSignedUrl(
  'documents/report.pdf',
  3600
);

// Download file
const fileBuffer = await this.storageService.download('documents/report.pdf');
```

---

## 3. Cache Service

**File:** `src/services/cache.service.ts`

### Features
- Redis-based caching
- String, Set, Hash, List operations
- TTL (Time To Live) support
- Cache-aside pattern helper

### Usage Example
```typescript
import { CacheService } from './services';

constructor(private cacheService: CacheService) {}

// Set cache with TTL
await this.cacheService.set('user:123', userData, 3600);

// Get cache
const user = await this.cacheService.get<User>('user:123');

// Cache-aside pattern
const data = await this.cacheService.remember(
  'expensive-query',
  3600,
  async () => {
    return await this.performExpensiveQuery();
  }
);

// Delete cache
await this.cacheService.delete('user:123');
```

---

## 4. Queue Service

**File:** `src/services/queue.service.ts`

### Features
- BullMQ/Redis job queue
- Automatic retry with exponential backoff
- Worker management
- Job status tracking

### Pre-configured Queues
- Document processing
- Email delivery
- Notifications
- Analytics tracking
- Webhook delivery

### Usage Example
```typescript
import { QueueService } from './services';

constructor(private queueService: QueueService) {}

// Add job to queue
const result = await this.queueService.addDocumentProcessingJob(
  'doc-123',
  'tenant-456'
);

// Create worker
this.queueService.createWorker(
  'document-processing',
  async (job) => {
    const { documentId, tenantId } = job.data;
    // Process document
    return { success: true };
  }
);

// Get job status
const counts = await this.queueService.getJobCounts('document-processing');
```

---

## 5. Notification Service

**File:** `src/services/notification.service.ts`

### Features
- Multi-channel delivery (in-app, email, push, SMS, webhook)
- Bulk notifications
- Unread count tracking
- Notification preferences

### Usage Example
```typescript
import { NotificationService, NotificationType, NotificationChannel } from './services';

constructor(private notificationService: NotificationService) {}

// Send notification
await this.notificationService.send({
  userId: 'user-123',
  tenantId: 'tenant-456',
  title: 'Document Ready',
  message: 'Your document has been processed',
  type: NotificationType.DOCUMENT_PROCESSED,
  channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
});

// Get unread count
const count = await this.notificationService.getUnreadCount(
  'user-123',
  'tenant-456'
);
```

---

## 6. Webhook Service

**File:** `src/services/webhook.service.ts`

### Features
- Reliable webhook delivery
- Automatic retry (up to 5 attempts)
- HMAC signature verification
- Webhook endpoint management

### Usage Example
```typescript
import { WebhookService } from './services';

constructor(private webhookService: WebhookService) {}

// Create webhook endpoint
const endpoint = await this.webhookService.createEndpoint(
  'tenant-123',
  'https://example.com/webhook',
  ['document.processed', 'invoice.generated']
);

// Broadcast event
await this.webhookService.broadcast(
  'tenant-123',
  'document.processed',
  { documentId: 'doc-123', status: 'completed' }
);

// Verify signature
const isValid = this.webhookService.verifySignature(
  payload,
  signature,
  secret
);
```

---

## 7. Audit Service

**File:** `src/services/audit.service.ts`

### Features
- Comprehensive audit logging
- Query by user, resource, action, date
- Security event monitoring
- Export to JSON/CSV

### Predefined Actions
- Authentication (login, logout, password reset)
- Documents (created, viewed, updated, deleted)
- Users (created, updated, deleted, invited)
- Billing (subscription, payment)
- Security (access denied, rate limit exceeded)

### Usage Example
```typescript
import { AuditService, AuditAction } from './services';

constructor(private auditService: AuditService) {}

// Log audit event
await this.auditService.log({
  tenantId: 'tenant-123',
  userId: 'user-456',
  action: AuditAction.DOCUMENT_CREATED,
  resource: 'document',
  resourceId: 'doc-789',
  status: 'success',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

// Query audit logs
const { logs, total } = await this.auditService.query({
  tenantId: 'tenant-123',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  limit: 100,
});

// Get security events
const securityEvents = await this.auditService.getSecurityEvents(
  'tenant-123'
);
```

---

## 8. Encryption Service

**File:** `src/services/encryption.service.ts`

### Features
- AES-256-GCM symmetric encryption
- RSA-4096 asymmetric encryption
- Bcrypt password hashing
- PII encryption
- Data masking utilities

### Usage Example
```typescript
import { EncryptionService } from './services';

constructor(private encryptionService: EncryptionService) {}

// Encrypt/Decrypt string
const encrypted = this.encryptionService.encryptString('sensitive data');
const decrypted = this.encryptionService.decryptString(encrypted);

// Hash password
const hashedPassword = await this.encryptionService.hashPassword('password123');
const isValid = await this.encryptionService.verifyPassword(
  'password123',
  hashedPassword
);

// Generate API key
const apiKey = this.encryptionService.generateAPIKey('lxs');

// Mask email
const masked = this.encryptionService.maskEmail('user@example.com');
// Output: u**@example.com
```

---

## 9. Rate Limit Service

**File:** `src/services/rate-limit.service.ts`

### Features
- Multi-tier rate limiting (free, basic, premium, enterprise)
- Sliding window algorithm
- IP blocking/whitelisting
- Custom rate limits

### Default Tiers
- **Free:** 100 requests/hour
- **Basic:** 1,000 requests/hour
- **Premium:** 10,000 requests/hour
- **Enterprise:** 100,000 requests/hour

### Usage Example
```typescript
import { RateLimitService } from './services';

constructor(private rateLimitService: RateLimitService) {}

// Check rate limit
const result = await this.rateLimitService.consume(
  req.ip,
  'premium',
  1 // cost
);

if (!result.allowed) {
  throw new TooManyRequestsException(
    `Rate limit exceeded. Retry after ${result.retryAfter}s`
  );
}

// Whitelist IP
await this.rateLimitService.whitelist('192.168.1.1');

// Custom rate limit
await this.rateLimitService.consumeCustom(
  'upload-endpoint',
  { points: 10, duration: 60 }, // 10 uploads per minute
  'uploads'
);
```

---

## 10. Analytics Service

**File:** `src/services/analytics.service.ts`

### Features
- Event tracking with categories
- Real-time metrics
- Time-series analytics
- Funnel analysis
- Cohort retention
- Feature usage tracking

### Event Categories
- User
- Document
- Billing
- API
- Feature
- Performance
- Error
- System

### Usage Example
```typescript
import { AnalyticsService, AnalyticsCategory } from './services';

constructor(private analyticsService: AnalyticsService) {}

// Track event
await this.analyticsService.track({
  tenantId: 'tenant-123',
  userId: 'user-456',
  event: 'document_uploaded',
  category: AnalyticsCategory.DOCUMENT,
  properties: {
    documentId: 'doc-789',
    fileSize: 1024000,
    mimeType: 'application/pdf',
  },
});

// Get real-time metrics
const metrics = await this.analyticsService.getRealTimeMetrics('tenant-123');

// Get funnel analytics
const funnel = await this.analyticsService.getFunnelAnalytics(
  'tenant-123',
  ['signup', 'email_verified', 'first_upload', 'first_payment']
);

// Export analytics data
const csv = await this.analyticsService.exportData(
  'tenant-123',
  new Date('2024-01-01'),
  new Date('2024-12-31'),
  'csv'
);
```

---

## Integration in NestJS Modules

All services can be easily integrated into any NestJS module:

```typescript
import { Module } from '@nestjs/common';
import {
  EmailService,
  StorageService,
  CacheService,
  QueueService,
  NotificationService,
  WebhookService,
  AuditService,
  EncryptionService,
  RateLimitService,
  AnalyticsService,
} from '../services';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [
    PrismaService,
    EmailService,
    StorageService,
    CacheService,
    QueueService,
    NotificationService,
    WebhookService,
    AuditService,
    EncryptionService,
    RateLimitService,
    AnalyticsService,
  ],
  exports: [
    EmailService,
    StorageService,
    CacheService,
    QueueService,
    NotificationService,
    WebhookService,
    AuditService,
    EncryptionService,
    RateLimitService,
    AnalyticsService,
  ],
})
export class ServicesModule {}
```

---

## Testing

Each service includes mock implementations for testing:

```typescript
import { Test } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              // Mock config values
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

---

## Performance Considerations

1. **Caching:** Use CacheService for frequently accessed data
2. **Queue:** Use QueueService for heavy operations
3. **Rate Limiting:** Protect endpoints with RateLimitService
4. **Analytics:** Use batch tracking for high-volume events
5. **Audit:** Consider async logging for performance

---

## Security Best Practices

1. **Encryption:** Always encrypt PII data
2. **Audit:** Log all security-sensitive operations
3. **Rate Limiting:** Implement on all public endpoints
4. **API Keys:** Use scoped permissions
5. **Webhooks:** Always verify HMAC signatures

---

## Monitoring and Observability

All services include comprehensive logging:

```typescript
// Each service logs important operations
this.logger.log('Operation completed successfully');
this.logger.error('Operation failed', error.stack);
this.logger.warn('Potential issue detected');
```

Integrate with your monitoring stack (e.g., DataDog, New Relic, Sentry).

