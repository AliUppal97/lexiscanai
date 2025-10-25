# Common Module - Infrastructure Components

This directory contains all reusable infrastructure components for the API.

## 📂 Directory Structure

```
apps/api/src/common/
├── guards/                     # Access control
│   ├── roles.guard.ts         # Role-based access (admin, user, etc.)
│   ├── permissions.guard.ts   # Granular permissions
│   ├── tenant.guard.ts        # Multi-tenant data isolation
│   ├── throttle.guard.ts      # Rate limiting
│   └── index.ts
│
├── interceptors/              # Request/response processing
│   ├── logging.interceptor.ts # Request/response logging
│   ├── transform.interceptor.ts # Response standardization
│   ├── timeout.interceptor.ts  # Request timeout
│   ├── cache.interceptor.ts    # Response caching
│   └── index.ts
│
├── filters/                   # Error handling
│   ├── http-exception.filter.ts # HTTP errors
│   ├── prisma-exception.filter.ts # Database errors
│   ├── validation.filter.ts     # Validation errors
│   └── index.ts
│
├── pipes/                     # Data validation & transformation
│   ├── validation.pipe.ts     # DTO validation
│   ├── transform.pipe.ts      # Data transformation
│   └── index.ts
│
├── prisma.service.ts          # Prisma ORM service
├── index.ts                   # Central exports
└── README.md                  # This file
```

---

## 🛡️ Guards

Guards determine whether a request will be handled by the route handler.

### **RolesGuard**
Enforces role-based access control.

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'owner')
@Get('sensitive-data')
getSensitiveData() { ... }
```

### **PermissionsGuard**
Enforces granular permission-based access.

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('documents:delete')
@Delete(':id')
deleteDocument() { ... }
```

### **TenantGuard**
Enforces multi-tenant data isolation.

```typescript
@UseGuards(JwtAuthGuard, TenantGuard)
@Get('organizations/:tenantId/documents')
getDocuments() { ... }
```

### **ThrottleGuard**
Prevents API abuse with rate limiting.

```typescript
@UseGuards(ThrottleGuard)
@Throttle({ points: 5, duration: 60 }) // 5 requests per minute
@Post('login')
login() { ... }
```

---

## 🔄 Interceptors

Interceptors bind extra logic before/after method execution.

### **LoggingInterceptor**
Logs all HTTP requests and responses.

```typescript
// Global usage
app.useGlobalInterceptors(new LoggingInterceptor());

// Logs:
// → POST /api/users | User: user-123 | Tenant: tenant-456 | IP: 192.168.1.1
// ← POST /api/users 201 45ms | User: user-123 | Tenant: tenant-456
```

### **TransformInterceptor**
Standardizes all API responses.

```typescript
// Transforms:
{ id: 1, name: 'John' }

// Into:
{
  success: true,
  statusCode: 200,
  message: "Resource retrieved successfully",
  data: { id: 1, name: 'John' },
  timestamp: "2024-01-01T00:00:00.000Z",
  path: "/api/users/1"
}
```

### **TimeoutInterceptor**
Prevents long-running requests.

```typescript
@Timeout(60000) // 60 seconds
@Post('heavy-operation')
heavyOperation() { ... }
```

### **CacheInterceptor**
Caches GET request responses.

```typescript
@UseInterceptors(CacheInterceptor)
@CacheTTL(300) // 5 minutes
@Get('users')
getUsers() { ... }
```

---

## 🚨 Filters

Exception filters handle errors and format responses.

### **HttpExceptionFilter**
Handles all HTTP exceptions.

```typescript
// Transforms any HttpException into:
{
  success: false,
  statusCode: 404,
  error: "Not Found",
  message: "User with ID 123 not found",
  timestamp: "2024-01-01T00:00:00.000Z",
  path: "/api/users/123"
}
```

### **PrismaExceptionFilter**
Handles Prisma database errors.

```typescript
// Converts Prisma errors into user-friendly messages:
// P2002 (unique constraint) → "A user with this email already exists"
// P2025 (record not found) → "The requested record was not found"
// P2003 (foreign key) → "Related record not found or already in use"
```

### **ValidationExceptionFilter**
Handles DTO validation errors.

```typescript
// Formats validation errors:
{
  success: false,
  statusCode: 400,
  error: "Validation Error",
  message: "Validation failed",
  errors: {
    "email": ["email must be a valid email address"],
    "password": ["password must be at least 8 characters"]
  }
}
```

---

## 🔧 Pipes

Pipes transform and validate input data.

### **ValidationPipe**
Validates DTOs using class-validator.

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

### **TransformPipe**
Transforms incoming data (trim, case conversion, etc.).

```typescript
@Post()
create(@Body(TransformPipe) data: CreateDto) { ... }
```

### **ParseIntPipe**
Parses string to integer.

```typescript
@Get(':id')
getById(@Param('id', ParseIntPipe) id: number) { ... }
```

### **TrimPipe**
Trims whitespace from strings.

```typescript
@Post()
create(@Body('name', TrimPipe) name: string) { ... }
```

---

## 🎯 Global Setup (main.ts)

```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import {
  RolesGuard,
  PermissionsGuard,
  TenantGuard,
  ThrottleGuard,
  LoggingInterceptor,
  TransformInterceptor,
  TimeoutInterceptor,
  CacheInterceptor,
  HttpExceptionFilter,
  PrismaExceptionFilter,
  ValidationExceptionFilter,
  ValidationPipe,
} from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get services
  const reflector = app.get(Reflector);
  const cacheService = app.get(CacheService);
  const auditService = app.get(AuditService);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(reflector),
    new CacheInterceptor(cacheService, reflector),
  );

  // Global filters
  app.useGlobalFilters(
    new HttpExceptionFilter(auditService),
    new PrismaExceptionFilter(),
    new ValidationExceptionFilter(),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();
```

---

## 🔒 Security Best Practices

1. **Always use guards in this order:**
   ```typescript
   @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, PermissionsGuard, ThrottleGuard)
   ```

2. **Sanitize logs** - LoggingInterceptor automatically redacts sensitive fields

3. **Rate limiting** - Apply ThrottleGuard to authentication and public endpoints

4. **Tenant isolation** - Always use TenantGuard for multi-tenant routes

5. **Error handling** - Never expose internal errors in production

---

## 📊 Performance Tips

1. **Caching** - Use CacheInterceptor for read-heavy operations
2. **Timeouts** - Set appropriate timeouts to prevent hanging requests
3. **Validation** - Enable `whitelist` to strip unknown properties
4. **Logging** - Use appropriate log levels (debug in dev, warn/error in prod)

---

## 🧪 Testing

Each component can be tested independently:

```typescript
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access for matching role', async () => {
    // Test implementation
  });
});
```

---

## 📝 Notes

- All components are **production-ready**
- All components include **comprehensive error handling**
- All components are **fully typed with TypeScript**
- All components follow **NestJS best practices**
- All components are **documented with JSDoc comments**

