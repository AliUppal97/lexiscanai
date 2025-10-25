# Required NPM Dependencies for Core Services

## Install All Dependencies

Run this command in `apps/api/` directory:

```bash
npm install nodemailer redis ioredis bullmq bcrypt uuid
npm install --save-dev @types/nodemailer @types/bcrypt @types/uuid
```

## Service-Specific Dependencies

### Email Service
- `nodemailer` - SMTP email delivery
- `@types/nodemailer` - TypeScript definitions

### Storage Service
- `uuid` - Unique file key generation
- `@types/uuid` - TypeScript definitions

### Cache Service
- `redis` - Redis client for caching
- Node.js 16+ native `crypto` module

### Queue Service
- `bullmq` - Job queue management
- `ioredis` - Redis client for BullMQ

### Encryption Service
- `bcrypt` - Password hashing
- `@types/bcrypt` - TypeScript definitions
- Node.js native `crypto` module

### Other Services
- All other services use native Node.js modules or existing dependencies

## Optional: AWS SDK (for S3 storage)
```bash
npm install @aws-sdk/client-s3
```

## Optional: Firebase (for push notifications)
```bash
npm install firebase-admin
```

## Optional: Twilio (for SMS)
```bash
npm install twilio
```

## Environment Variables Required

Create `.env` file in `apps/api/`:

```env
# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@lexiscan.ai
FROM_NAME=LexiScan AI

# Redis (Cache & Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_QUEUE_DB=1

# Storage
STORAGE_TYPE=local  # or 's3', 'azure', 'gcs'
STORAGE_BUCKET=lexiscan-storage
STORAGE_PATH=./storage
STORAGE_PUBLIC_URL=http://localhost:3001/files

# AWS S3 (if using S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here
KEY_ROTATION_ENABLED=false

# Rate Limiting
RATE_LIMIT_ENABLED=true
CACHE_TTL=3600
CACHE_PREFIX=lexiscan:

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_REALTIME_ENABLED=true

# Audit
AUDIT_ENABLED=true
AUDIT_RETENTION_DAYS=365

# Webhooks
WEBHOOK_MAX_ATTEMPTS=5
WEBHOOK_TIMEOUT=10000

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

