# LexiScan AI - Communication Module Dependencies

This document outlines the required dependencies and configuration for the Communication module to function properly.

## 📦 Required NPM Packages

### Core Dependencies

```bash
# Email Services
npm install nodemailer @types/nodemailer
npm install handlebars @types/handlebars

# Push Notifications
npm install firebase-admin
npm install apn @types/apn
npm install web-push @types/web-push

# SMS Services
npm install twilio @types/twilio
npm install aws-sdk @types/aws-sdk

# HTTP Requests
npm install node-fetch @types/node-fetch

# Queue Processing
npm install bull @types/bull
npm install ioredis @types/ioredis

# Scheduling
npm install @nestjs/schedule

# File Upload
npm install @nestjs/platform-express multer @types/multer
```

### Development Dependencies

```bash
# Testing
npm install --save-dev @types/jest
npm install --save-dev jest-mock-extended

# TypeScript
npm install --save-dev @types/node
```

## 🔧 Environment Variables

### Email Configuration

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Settings
FROM_EMAIL=noreply@lexiscan.ai
FROM_NAME=LexiScan AI

# Tracking
TRACKING_BASE_URL=https://api.lexiscan.ai/track
```

### Push Notifications

```bash
# Firebase Cloud Messaging
FCM_SERVER_KEY=your-fcm-server-key
FCM_PROJECT_ID=your-fcm-project-id

# Apple Push Notification Service
APNS_KEY_ID=your-apns-key-id
APNS_TEAM_ID=your-apns-team-id
APNS_KEY_PATH=./apns-key.p8
APNS_BUNDLE_ID=com.lexiscan.ai

# Web Push (VAPID)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@lexiscan.ai
```

### SMS Services

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# AWS SNS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
```

### Webhook Configuration

```bash
# Webhook Settings
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_DELAY=5000
WEBHOOK_TIMEOUT=30000
WEBHOOK_SECRET_LENGTH=32
```

### Queue Configuration

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Queue Settings
QUEUE_CONCURRENCY=5
QUEUE_MAX_ATTEMPTS=3
QUEUE_BACKOFF_DELAY=2000
```

## 🗄️ Database Setup

### Prisma Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Deploy to production
npx prisma migrate deploy
```

### Database Indexes

The communication module requires several database indexes for optimal performance:

```sql
-- Email indexes
CREATE INDEX CONCURRENTLY idx_emails_tenant_status ON emails(tenant_id, status);
CREATE INDEX CONCURRENTLY idx_emails_tenant_sent_at ON emails(tenant_id, sent_at);
CREATE INDEX CONCURRENTLY idx_emails_message_id ON emails(message_id);

-- Notification indexes
CREATE INDEX CONCURRENTLY idx_notifications_tenant_user_status ON notifications(tenant_id, user_id, status);
CREATE INDEX CONCURRENTLY idx_notifications_tenant_type ON notifications(tenant_id, type);
CREATE INDEX CONCURRENTLY idx_notifications_user_read_at ON notifications(user_id, read_at);

-- Webhook indexes
CREATE INDEX CONCURRENTLY idx_webhook_deliveries_status_retry ON webhook_deliveries(status, next_retry_at);
CREATE INDEX CONCURRENTLY idx_webhook_deliveries_webhook_status ON webhook_deliveries(webhook_id, status);
```

## 🔐 Security Configuration

### API Keys and Certificates

1. **Firebase Service Account**
   - Download service account key from Firebase Console
   - Store securely in environment variables or secret management

2. **Apple Push Notification Certificate**
   - Generate APNs key in Apple Developer Console
   - Download .p8 file and store securely
   - Set proper file permissions (600)

3. **Twilio Credentials**
   - Get Account SID and Auth Token from Twilio Console
   - Store in environment variables

4. **AWS Credentials**
   - Create IAM user with SNS permissions
   - Generate access keys
   - Store securely

### Rate Limiting

```typescript
// Email rate limiting
EMAIL_RATE_LIMIT=10 // emails per second
EMAIL_BURST_LIMIT=100 // burst capacity

// SMS rate limiting
SMS_RATE_LIMIT=5 // SMS per second
SMS_DAILY_LIMIT=1000 // per user per day

// Webhook rate limiting
WEBHOOK_RATE_LIMIT=20 // webhooks per second
WEBHOOK_BURST_LIMIT=200 // burst capacity
```

## 📊 Monitoring and Analytics

### Metrics Collection

```typescript
// Email metrics
EMAIL_DELIVERY_RATE
EMAIL_OPEN_RATE
EMAIL_CLICK_RATE
EMAIL_BOUNCE_RATE

// Notification metrics
NOTIFICATION_DELIVERY_RATE
NOTIFICATION_READ_RATE
PUSH_DELIVERY_RATE
SMS_DELIVERY_RATE

// Webhook metrics
WEBHOOK_SUCCESS_RATE
WEBHOOK_RETRY_RATE
WEBHOOK_DEAD_LETTER_RATE
```

### Health Checks

```typescript
// Service health endpoints
GET /health/email
GET /health/push
GET /health/sms
GET /health/webhooks
GET /health/queue
```

## 🚀 Deployment Configuration

### Docker Configuration

```dockerfile
# Add to Dockerfile
RUN npm install nodemailer handlebars firebase-admin apn web-push twilio aws-sdk node-fetch bull ioredis

# Environment variables
ENV SMTP_HOST=smtp.gmail.com
ENV SMTP_PORT=587
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
```

### Kubernetes Configuration

```yaml
# ConfigMap for communication settings
apiVersion: v1
kind: ConfigMap
metadata:
  name: communication-config
data:
  SMTP_HOST: "smtp.gmail.com"
  SMTP_PORT: "587"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
```

### Environment-Specific Settings

```bash
# Development
NODE_ENV=development
LOG_LEVEL=debug
EMAIL_DRY_RUN=true

# Staging
NODE_ENV=staging
LOG_LEVEL=info
EMAIL_DRY_RUN=false

# Production
NODE_ENV=production
LOG_LEVEL=warn
EMAIL_DRY_RUN=false
```

## 🔧 Service Configuration

### Email Service Setup

```typescript
// Email service configuration
const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  from: {
    email: process.env.FROM_EMAIL,
    name: process.env.FROM_NAME,
  },
  tracking: {
    enabled: true,
    baseUrl: process.env.TRACKING_BASE_URL,
  },
};
```

### Push Notification Setup

```typescript
// Firebase configuration
const firebaseConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FCM_PROJECT_ID,
    clientEmail: process.env.FCM_CLIENT_EMAIL,
    privateKey: process.env.FCM_PRIVATE_KEY,
  }),
};

// APNs configuration
const apnsConfig = {
  token: {
    key: process.env.APNS_KEY_PATH,
    keyId: process.env.APNS_KEY_ID,
    teamId: process.env.APNS_TEAM_ID,
  },
  production: process.env.NODE_ENV === 'production',
};
```

### SMS Service Setup

```typescript
// Twilio configuration
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
};

// AWS SNS configuration
const snsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};
```

## 📋 Testing Configuration

### Unit Tests

```typescript
// Mock external services
jest.mock('nodemailer');
jest.mock('firebase-admin');
jest.mock('twilio');
jest.mock('aws-sdk');
```

### Integration Tests

```typescript
// Test database setup
beforeAll(async () => {
  await prisma.$connect();
  await prisma.email.deleteMany();
  await prisma.notification.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Load Testing

```typescript
// Email load testing
const emailLoadTest = {
  concurrent: 100,
  duration: '5m',
  rate: 10, // emails per second
};

// Webhook load testing
const webhookLoadTest = {
  concurrent: 50,
  duration: '3m',
  rate: 20, // webhooks per second
};
```

## 🛠️ Troubleshooting

### Common Issues

1. **Email Delivery Failures**
   - Check SMTP credentials
   - Verify DNS settings
   - Check spam filters

2. **Push Notification Issues**
   - Verify device tokens
   - Check certificate validity
   - Test with development certificates

3. **SMS Delivery Problems**
   - Check provider configuration
   - Verify phone number format
   - Check rate limits

4. **Webhook Failures**
   - Verify endpoint URLs
   - Check SSL certificates
   - Monitor retry mechanisms

### Debug Mode

```bash
# Enable debug logging
DEBUG=communication:*
LOG_LEVEL=debug

# Email debugging
DEBUG=nodemailer:*

# Queue debugging
DEBUG=bull:*
```

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)

---

For more information about the communication module setup, contact the development team.
