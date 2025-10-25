# Local Development Setup

## Overview

This guide covers setting up LexiScan AI for local development. It includes environment configuration, database setup, service dependencies, and development workflows.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Service Dependencies](#service-dependencies)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Debugging](#debugging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.x+ | JavaScript runtime |
| **npm** | 9.x+ | Package manager |
| **Docker** | 20.x+ | Container runtime |
| **Docker Compose** | 2.x+ | Multi-container orchestration |
| **Git** | 2.x+ | Version control |
| **PostgreSQL** | 15.x+ | Database (optional, Docker preferred) |
| **Redis** | 7.x+ | Cache (optional, Docker preferred) |

### Development Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| **VS Code** | Code editor | [Download](https://code.visualstudio.com/) |
| **Postman** | API testing | [Download](https://www.postman.com/) |
| **DBeaver** | Database management | [Download](https://dbeaver.io/) |
| **RedisInsight** | Redis management | [Download](https://redis.com/redis-enterprise/redis-insight/) |

### VS Code Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-kubernetes-tools.vscode-kubernetes-tools",
    "ms-azuretools.vscode-docker"
  ]
}
```

## Environment Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/lexiscan-ai.git
cd lexiscan-ai

# Install dependencies
npm install
```

### 2. Environment Variables

Create environment files for each application:

#### Root Environment (.env)

```bash
# .env
NODE_ENV=development
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://lexiscan:lexiscan_password@localhost:5432/lexiscan

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# External Services
OPENAI_API_KEY=your-openai-api-key
PINECONE_API_KEY=your-pinecone-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET=lexiscan-documents

# Monitoring
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831
ELASTICSEARCH_URL=http://localhost:9200
```

#### Web App Environment (.env.local)

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

#### API Environment

```bash
# apps/api/.env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://lexiscan:lexiscan_password@localhost:5432/lexiscan
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:3000
```

### 3. Docker Compose Setup

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: lexiscan
      POSTGRES_USER: lexiscan
      POSTGRES_PASSWORD: lexiscan_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lexiscan"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Elasticsearch for logging
  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Kibana for log visualization
  kibana:
    image: kibana:8.8.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      elasticsearch:
        condition: service_healthy

  # Jaeger for tracing
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

  # Prometheus for metrics
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  # Grafana for dashboards
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
  prometheus_data:
  grafana_data:
```

## Database Setup

### 1. Start Database Services

```bash
# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for services to be ready
docker-compose -f docker-compose.dev.yml ps
```

### 2. Database Migration

```bash
# Navigate to API directory
cd apps/api

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed
```

### 3. Database Schema

```sql
-- scripts/init-db.sql
-- Create database and user
CREATE DATABASE lexiscan;
CREATE USER lexiscan WITH PASSWORD 'lexiscan_password';
GRANT ALL PRIVILEGES ON DATABASE lexiscan TO lexiscan;

-- Create extensions
\c lexiscan;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
```

### 4. Database Seeding

```typescript
// apps/api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@lexiscan.ai',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Create test organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Test Law Firm',
      slug: 'test-law-firm',
      ownerId: admin.id,
      status: 'ACTIVE',
    },
  });

  // Create test documents
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        title: 'Sample Contract',
        content: 'This is a sample contract for testing purposes.',
        status: 'COMPLETED',
        userId: admin.id,
        organizationId: organization.id,
      },
    }),
    prisma.document.create({
      data: {
        title: 'Legal Brief',
        content: 'This is a sample legal brief for testing purposes.',
        status: 'PROCESSING',
        userId: admin.id,
        organizationId: organization.id,
      },
    }),
  ]);

  console.log('Database seeded successfully!');
  console.log('Admin user:', admin.email);
  console.log('Organization:', organization.name);
  console.log('Documents created:', documents.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Service Dependencies

### 1. Start All Services

```bash
# Start all development services
docker-compose -f docker-compose.dev.yml up -d

# Check service status
docker-compose -f docker-compose.dev.yml ps
```

### 2. Service Health Checks

```bash
# Check PostgreSQL
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U lexiscan

# Check Redis
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping

# Check Elasticsearch
curl http://localhost:9200/_cluster/health

# Check Jaeger
curl http://localhost:16686/api/services

# Check Prometheus
curl http://localhost:9090/api/v1/query?query=up

# Check Grafana
curl http://localhost:3001/api/health
```

### 3. Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Web App** | http://localhost:3000 | Frontend application |
| **API** | http://localhost:3001 | Backend API |
| **Database** | localhost:5432 | PostgreSQL |
| **Redis** | localhost:6379 | Cache |
| **Elasticsearch** | http://localhost:9200 | Log storage |
| **Kibana** | http://localhost:5601 | Log visualization |
| **Jaeger** | http://localhost:16686 | Distributed tracing |
| **Prometheus** | http://localhost:9090 | Metrics |
| **Grafana** | http://localhost:3001 | Dashboards |

## Development Workflow

### 1. Start Development Servers

```bash
# Terminal 1: Start web app
cd apps/web
npm run dev

# Terminal 2: Start API server
cd apps/api
npm run start:dev

# Terminal 3: Start worker (optional)
cd services/ai-worker
python main.py

# Terminal 4: Start monitoring (optional)
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Development Scripts

```json
// package.json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:web\" \"npm run dev:api\"",
    "dev:web": "cd apps/web && npm run dev",
    "dev:api": "cd apps/api && npm run start:dev",
    "dev:worker": "cd services/ai-worker && python main.py",
    "dev:monitoring": "docker-compose -f docker-compose.dev.yml up -d",
    "build": "npm run build:web && npm run build:api",
    "build:web": "cd apps/web && npm run build",
    "build:api": "cd apps/api && npm run build",
    "test": "npm run test:web && npm run test:api",
    "test:web": "cd apps/web && npm run test",
    "test:api": "cd apps/api && npm run test",
    "lint": "npm run lint:web && npm run lint:api",
    "lint:web": "cd apps/web && npm run lint",
    "lint:api": "cd apps/api && npm run lint",
    "format": "prettier --write .",
    "db:migrate": "cd apps/api && npx prisma migrate dev",
    "db:seed": "cd apps/api && npx prisma db seed",
    "db:reset": "cd apps/api && npx prisma migrate reset",
    "db:studio": "cd apps/api && npx prisma studio"
  }
}
```

### 3. Hot Reloading

#### Web App (Next.js)

```javascript
// apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

#### API Server (NestJS)

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for development
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  
  // Enable hot reloading
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      next();
    });
  }
  
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
```

### 4. Code Quality

#### ESLint Configuration

```json
// apps/web/.eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "prefer-const": "error",
    "no-unused-vars": "error"
  }
}
```

#### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### TypeScript Configuration

```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Testing

### 1. Unit Tests

```bash
# Run web app tests
cd apps/web
npm run test

# Run API tests
cd apps/api
npm run test

# Run all tests
npm run test
```

### 2. Integration Tests

```bash
# Run integration tests
cd apps/api
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### 3. Test Configuration

```javascript
// apps/api/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};
```

### 4. Test Database

```typescript
// apps/api/src/test/setup.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/lexiscan_test',
    },
  },
});

beforeAll(async () => {
  // Reset database
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
  
  // Run migrations
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

## Debugging

### 1. VS Code Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Web App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/web/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/apps/web",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Debug API Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/api/src/main.ts",
      "cwd": "${workspaceFolder}/apps/api",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/api/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "cwd": "${workspaceFolder}/apps/api",
      "console": "integratedTerminal"
    }
  ]
}
```

### 2. Database Debugging

```bash
# Open Prisma Studio
cd apps/api
npx prisma studio

# Check database connection
npx prisma db pull

# View database schema
npx prisma db push --preview-feature
```

### 3. API Debugging

```bash
# Start API with debug logs
cd apps/api
DEBUG=* npm run start:dev

# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lexiscan.ai","password":"admin123"}'
```

### 4. Frontend Debugging

```bash
# Start web app with debug logs
cd apps/web
DEBUG=* npm run dev

# Check browser console
# Open http://localhost:3000
# Press F12 to open developer tools
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000
   lsof -i :3001
   
   # Kill process
   kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   docker-compose -f docker-compose.dev.yml ps postgres
   
   # Check database logs
   docker-compose -f docker-compose.dev.yml logs postgres
   
   # Reset database
   cd apps/api
   npx prisma migrate reset
   ```

3. **Redis Connection Issues**
   ```bash
   # Check Redis status
   docker-compose -f docker-compose.dev.yml ps redis
   
   # Test Redis connection
   docker-compose -f docker-compose.dev.yml exec redis redis-cli ping
   ```

4. **Node Modules Issues**
   ```bash
   # Clear node modules
   rm -rf node_modules package-lock.json
   npm install
   
   # Clear npm cache
   npm cache clean --force
   ```

5. **Docker Issues**
   ```bash
   # Stop all containers
   docker-compose -f docker-compose.dev.yml down
   
   # Remove volumes
   docker-compose -f docker-compose.dev.yml down -v
   
   # Rebuild containers
   docker-compose -f docker-compose.dev.yml up --build
   ```

### Performance Issues

1. **Slow Database Queries**
   ```bash
   # Enable query logging
   cd apps/api
   npx prisma studio
   
   # Check slow queries
   docker-compose -f docker-compose.dev.yml exec postgres psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
   ```

2. **Memory Issues**
   ```bash
   # Check memory usage
   docker stats
   
   # Increase memory limits
   # Edit docker-compose.dev.yml
   ```

3. **Hot Reload Issues**
   ```bash
   # Increase file watcher limits
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### Development Tips

1. **Use Docker for Dependencies**
   - Always use Docker for PostgreSQL, Redis, etc.
   - Avoid installing these services locally

2. **Environment Variables**
   - Use `.env.local` for local overrides
   - Never commit sensitive environment variables

3. **Database Management**
   - Use Prisma Studio for database inspection
   - Use migrations for schema changes
   - Use seeds for test data

4. **Code Quality**
   - Run linting before commits
   - Use Prettier for code formatting
   - Write tests for new features

5. **Performance**
   - Use Redis for caching
   - Optimize database queries
   - Monitor memory usage

## Support

For local development issues:

- **Email**: dev-support@lexiscan.ai
- **Documentation**: https://docs.lexiscan.ai/development
- **Slack**: #dev-support
- **Emergency**: dev@lexiscan.ai

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial local setup guide |
| 1.1.0 | 2024-01-20 | Added Docker Compose setup |
| 1.2.0 | 2024-01-25 | Enhanced debugging |
| 1.3.0 | 2024-02-01 | Added monitoring setup |
