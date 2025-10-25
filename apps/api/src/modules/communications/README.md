# LexiScan AI - Communications Module

This module provides comprehensive communication capabilities for the LexiScan AI platform, enabling multi-channel messaging, notifications, and webhook integrations.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Email System](#email-system)
- [Notification System](#notification-system)
- [Webhook System](#webhook-system)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## 🎯 Overview

The Communications module provides:

- **Email Services**: Template-based email sending with queue processing
- **Multi-Channel Notifications**: In-app, push, and SMS notifications
- **Webhook Integration**: Reliable webhook delivery with retry mechanisms
- **Real-time Communication**: WebSocket support for instant notifications
- **Enterprise Features**: Rate limiting, analytics, and monitoring

## 🏗️ Architecture

```
apps/api/src/modules/communications/
├── dto/                          # Data Transfer Objects
│   ├── email.dto.ts             # Email DTOs and validation
│   ├── notifications.dto.ts     # Notification DTOs
│   ├── webhooks.dto.ts          # Webhook DTOs
│   └── index.ts                 # DTO exports
├── email/                       # Email Services
│   ├── templates/               # Email Templates
│   │   ├── welcome.html         # Welcome email template
│   │   ├── invitation.html      # Team invitation template
│   │   ├── password-reset.html  # Password reset template
│   │   ├── billing-notification.html # Billing notifications
│   │   └── document-processed.html   # Document processing notifications
│   ├── email.service.ts         # Core email service
│   └── email.queue.ts           # Email queue processing
├── notifications/               # Notification Services
│   ├── in-app.service.ts        # In-app notifications
│   ├── push.service.ts          # Push notifications (FCM, APNs, Web Push)
│   └── sms.service.ts           # SMS notifications (Twilio, AWS SNS)
├── webhooks/                    # Webhook Services
│   ├── webhook.service.ts       # Webhook delivery service
│   └── webhook-retry.service.ts # Webhook retry mechanisms
├── communications.module.ts     # Module configuration
└── README.md                    # This documentation
```

## 🔧 Services

### 1. Email Services

#### EmailService
**Purpose**: Core email functionality with template support and tracking.

**Key Features**:
- Template-based email generation using Handlebars
- Multi-format support (HTML, text, attachments)
- Email tracking (opens, clicks)
- Bulk email processing with rate limiting
- Multi-tenant support

**Methods**:
- `sendEmail()`: Send single email with template support
- `sendBulkEmails()`: Process bulk emails with rate limiting
- `processTemplate()`: Render email templates with data
- `addTracking()`: Add tracking pixels and links
- `getEmailStats()`: Retrieve email analytics

#### EmailQueueService
**Purpose**: Queue-based email processing for high-volume sending.

**Key Features**:
- Background email processing
- Priority-based queue management
- Retry mechanisms for failed emails
- Rate limiting and throttling
- Dead letter queue for failed emails

**Methods**:
- `addEmailToQueue()`: Queue single email for processing
- `addBulkEmailsToQueue()`: Queue bulk emails
- `addTemplateEmailToQueue()`: Queue template-based emails
- `addScheduledEmailToQueue()`: Schedule emails for future delivery

### 2. Notification Services

#### InAppNotificationService
**Purpose**: In-app notification management and delivery.

**Key Features**:
- Real-time notification delivery
- Notification persistence and history
- User preference management
- Notification categorization
- Read/unread status tracking

**Methods**:
- `createNotification()`: Create new in-app notification
- `markAsRead()`: Mark notification as read
- `getUserNotifications()`: Retrieve user notifications
- `getNotificationStats()`: Get notification analytics

#### PushNotificationService
**Purpose**: Push notification delivery across platforms.

**Key Features**:
- Firebase Cloud Messaging (FCM) integration
- Apple Push Notification Service (APNs) support
- Web Push API for browsers
- Device token management
- Multi-platform support

**Methods**:
- `sendPushNotification()`: Send push to single device
- `sendBulkPushNotifications()`: Send to multiple devices
- `registerDeviceToken()`: Register device for push notifications
- `unregisterDeviceToken()`: Remove device registration

#### SmsNotificationService
**Purpose**: SMS notification delivery and management.

**Key Features**:
- Twilio integration for SMS delivery
- AWS SNS support for SMS
- International SMS support
- Message template management
- Delivery status tracking

**Methods**:
- `sendSmsNotification()`: Send SMS to single number
- `sendBulkSmsNotifications()`: Send bulk SMS
- `getSmsStats()`: Retrieve SMS analytics

### 3. Webhook Services

#### WebhookService
**Purpose**: Reliable webhook delivery and management.

**Key Features**:
- HMAC signature verification for security
- Event filtering and transformation
- Delivery status tracking
- Rate limiting and throttling
- Multi-tenant webhook management

**Methods**:
- `createWebhook()`: Create new webhook endpoint
- `sendWebhookEvent()`: Send event to webhooks
- `processWebhookDelivery()`: Process webhook delivery job
- `testWebhook()`: Test webhook endpoint

#### WebhookRetryService
**Purpose**: Webhook retry mechanisms and dead letter queue.

**Key Features**:
- Automatic retry of failed deliveries
- Exponential backoff for retry delays
- Dead letter queue for permanent failures
- Retry scheduling and management
- Performance optimization

**Methods**:
- `processFailedDeliveries()`: Process failed deliveries for retry
- `moveToDeadLetterQueue()`: Move expired deliveries to dead letter
- `manualRetry()`: Manually retry specific delivery
- `reprocessDeadLetterItem()`: Reprocess dead letter items

## 📧 Email System

### Email Templates

The system includes pre-built email templates:

1. **Welcome Email** (`welcome.html`)
   - New user onboarding
   - Feature highlights
   - Getting started guide

2. **Team Invitation** (`invitation.html`)
   - Organization invitations
   - Role assignments
   - Security information

3. **Password Reset** (`password-reset.html`)
   - Secure password reset links
   - Security warnings
   - Account protection tips

4. **Billing Notifications** (`billing-notification.html`)
   - Invoice notifications
   - Payment reminders
   - Subscription updates

5. **Document Processed** (`document-processed.html`)
   - AI processing results
   - Document insights
   - Next steps guidance

### Email Queue Processing

```typescript
// Queue single email
await emailQueueService.addEmailToQueue(tenantId, {
  recipients: [{ email: 'user@example.com', name: 'John Doe', type: 'to' }],
  subject: 'Welcome to LexiScan AI',
  template: 'welcome',
  templateData: { firstName: 'John', dashboardUrl: 'https://app.lexiscan.ai' },
}, {
  priority: 1,
  delay: 0,
  attempts: 3,
});

// Queue bulk emails
await emailQueueService.addBulkEmailsToQueue(tenantId, {
  emails: bulkEmailData,
  batchSize: 10,
  delayBetweenBatches: 1000,
});
```

## 🔔 Notification System

### In-App Notifications

```typescript
// Create in-app notification
await inAppService.createNotification(tenantId, {
  recipients: [{ userId: 'user123' }],
  title: 'Document Processed',
  message: 'Your document has been successfully processed.',
  type: NotificationType.DOCUMENT_PROCESSED,
  channels: [NotificationChannel.IN_APP],
  data: { documentId: 'doc123', confidence: 0.95 },
  actionUrl: '/documents/doc123',
  actionText: 'View Results',
});
```

### Push Notifications

```typescript
// Send push notification
await pushService.sendPushNotification(tenantId, notificationData, deviceToken, 'ios');

// Register device for push notifications
await pushService.registerDeviceToken(tenantId, userId, deviceToken, 'ios', {
  deviceId: 'device123',
  appVersion: '1.0.0',
  osVersion: 'iOS 15.0',
});
```

### SMS Notifications

```typescript
// Send SMS notification
await smsService.sendSmsNotification(tenantId, notificationData, '+1234567890', 'twilio');

// Send bulk SMS
await smsService.sendBulkSmsNotifications(tenantId, notificationData, [
  { phoneNumber: '+1234567890', userId: 'user1' },
  { phoneNumber: '+0987654321', userId: 'user2' },
], 'twilio');
```

## 🔗 Webhook System

### Webhook Management

```typescript
// Create webhook
await webhookService.createWebhook(tenantId, {
  name: 'Document Processing Webhook',
  url: 'https://client.example.com/webhooks/lexiscan',
  events: [WebhookEvent.DOCUMENT_PROCESSED, WebhookEvent.DOCUMENT_FAILED],
  secret: 'webhook_secret_key',
  headers: [
    { name: 'X-Custom-Header', value: 'custom-value' }
  ],
  isActive: true,
  timeout: 30000,
  retryAttempts: 3,
});

// Send webhook event
await webhookService.sendWebhookEvent(tenantId, WebhookEvent.DOCUMENT_PROCESSED, {
  documentId: 'doc123',
  status: 'completed',
  confidence: 0.95,
  processingTime: 45.2,
});
```

### Webhook Security

All webhooks include HMAC signature verification:

```typescript
// Webhook payload includes signature
{
  "id": "delivery_123",
  "event": "document.processed",
  "data": { /* payload data */ },
  "timestamp": "2024-01-15T10:30:00Z",
  "tenantId": "tenant_123"
}

// Headers include security information
{
  "X-Webhook-Signature": "sha256=abc123...",
  "X-Webhook-Event": "document.processed",
  "X-Webhook-Delivery": "delivery_123"
}
```

## ⚙️ Configuration

### Environment Variables

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@lexiscan.ai
FROM_NAME=LexiScan AI

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key
APNS_KEY_ID=your-apns-key-id
APNS_TEAM_ID=your-apns-team-id
APNS_KEY_PATH=./apns-key.p8
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Webhook Configuration
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_DELAY=5000
WEBHOOK_TIMEOUT=30000

# Tracking Configuration
TRACKING_BASE_URL=https://api.lexiscan.ai/track
```

### Service Configuration

```typescript
// Email Service Configuration
const emailConfig = {
  rateLimit: 10, // emails per second
  batchSize: 100,
  maxRetries: 3,
  retryDelay: 5000,
};

// Push Notification Configuration
const pushConfig = {
  fcmEnabled: true,
  apnsEnabled: true,
  webPushEnabled: true,
  maxDevicesPerUser: 5,
};

// SMS Configuration
const smsConfig = {
  twilioEnabled: true,
  awsSnsEnabled: true,
  maxSmsPerDay: 1000,
  costLimit: 50.00,
};

// Webhook Configuration
const webhookConfig = {
  maxRetries: 3,
  retryDelay: 5000,
  maxRetryDelay: 300000,
  timeout: 30000,
};
```

## 📊 Usage Examples

### Send Welcome Email

```typescript
import { EmailService } from './email/email.service';

// Send welcome email with template
await emailService.sendEmail(tenantId, {
  recipients: [{ email: 'user@example.com', name: 'John Doe', type: 'to' }],
  subject: 'Welcome to LexiScan AI',
  template: 'welcome',
  templateData: {
    firstName: 'John',
    dashboardUrl: 'https://app.lexiscan.ai/dashboard',
    supportUrl: 'https://lexiscan.ai/support',
  },
}, {
  trackOpens: true,
  trackClicks: true,
  priority: EmailPriority.HIGH,
});
```

### Create Multi-Channel Notification

```typescript
import { InAppNotificationService, PushNotificationService, SmsNotificationService } from './notifications';

// Create in-app notification
await inAppService.createNotification(tenantId, {
  recipients: [{ userId: 'user123' }],
  title: 'Document Analysis Complete',
  message: 'Your contract analysis is ready for review.',
  type: NotificationType.DOCUMENT_PROCESSED,
  channels: [NotificationChannel.IN_APP],
  data: { documentId: 'doc123', confidence: 0.95 },
  actionUrl: '/documents/doc123',
  actionText: 'Review Results',
});

// Send push notification
await pushService.sendPushNotification(tenantId, notificationData, deviceToken, 'ios');

// Send SMS for urgent notifications
await smsService.sendSmsNotification(tenantId, notificationData, '+1234567890', 'twilio');
```

### Set Up Webhook Integration

```typescript
import { WebhookService } from './webhooks/webhook.service';

// Create webhook endpoint
await webhookService.createWebhook(tenantId, {
  name: 'Client Integration',
  url: 'https://client.example.com/webhooks/lexiscan',
  events: [
    WebhookEvent.DOCUMENT_PROCESSED,
    WebhookEvent.DOCUMENT_FAILED,
    WebhookEvent.INVOICE_GENERATED,
  ],
  secret: 'secure_webhook_secret',
  headers: [
    { name: 'X-Client-ID', value: 'client_123' }
  ],
  isActive: true,
  timeout: 30000,
  retryAttempts: 3,
});

// Send webhook event
await webhookService.sendWebhookEvent(tenantId, WebhookEvent.DOCUMENT_PROCESSED, {
  documentId: 'doc123',
  status: 'completed',
  confidence: 0.95,
  processingTime: 45.2,
  insights: {
    keyClauses: 12,
    riskLevel: 'medium',
    recommendations: 5,
  },
});
```

## 🎯 Best Practices

### Performance Optimization

1. **Queue Processing**: Use queues for high-volume email sending
2. **Rate Limiting**: Implement proper rate limiting for external services
3. **Caching**: Cache frequently accessed data (user preferences, templates)
4. **Batch Processing**: Process notifications in batches for efficiency

### Security

1. **HMAC Signatures**: Always verify webhook signatures
2. **Rate Limiting**: Implement rate limiting for all endpoints
3. **Input Validation**: Validate all incoming data
4. **Secret Management**: Use secure secret management for API keys

### Monitoring

1. **Delivery Tracking**: Monitor email and notification delivery rates
2. **Error Handling**: Implement comprehensive error handling and logging
3. **Analytics**: Track communication metrics and user engagement
4. **Alerting**: Set up alerts for failed deliveries and system issues

### Scalability

1. **Horizontal Scaling**: Design for horizontal scaling
2. **Database Optimization**: Optimize database queries and indexing
3. **Caching Strategy**: Implement multi-level caching
4. **Load Balancing**: Use load balancing for high availability

## 🔧 Troubleshooting

### Common Issues

1. **Email Delivery Failures**: Check SMTP configuration and credentials
2. **Push Notification Issues**: Verify device tokens and platform certificates
3. **SMS Delivery Problems**: Check provider configuration and rate limits
4. **Webhook Failures**: Monitor retry mechanisms and dead letter queue

### Debugging

1. **Enable Debug Logging**: Set log level to debug for detailed information
2. **Check Service Health**: Monitor service health and performance
3. **Verify Configuration**: Ensure all environment variables are set correctly
4. **Test Endpoints**: Use testing tools to verify webhook endpoints

## 📚 Additional Resources

- [Email Service Documentation](./email/README.md)
- [Notification Service Documentation](./notifications/README.md)
- [Webhook Service Documentation](./webhooks/README.md)
- [Template Development Guide](./templates/README.md)
- [API Reference](./API_REFERENCE.md)

---

For more information about the communications module, contact the development team or refer to the individual service documentation.
