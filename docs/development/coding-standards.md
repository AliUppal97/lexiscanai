# Coding Standards

## Overview

This document outlines the coding standards and best practices for LexiScan AI development. These standards ensure code quality, consistency, and maintainability across the entire codebase.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [React/Next.js Standards](#reactnextjs-standards)
- [NestJS Standards](#nestjs-standards)
- [Database Standards](#database-standards)
- [Testing Standards](#testing-standards)
- [Documentation Standards](#documentation-standards)
- [Git Standards](#git-standards)
- [Code Review Standards](#code-review-standards)

## General Principles

### 1. Code Quality

- **Readability**: Code should be self-documenting and easy to understand
- **Maintainability**: Code should be easy to modify and extend
- **Performance**: Code should be efficient and optimized
- **Security**: Code should follow security best practices
- **Testing**: All code should be thoroughly tested

### 2. Consistency

- Follow established patterns and conventions
- Use consistent naming conventions
- Maintain consistent code structure
- Use consistent formatting and style

### 3. Documentation

- Document complex logic and business rules
- Use meaningful variable and function names
- Include JSDoc comments for functions
- Maintain up-to-date README files

## TypeScript Standards

### 1. Type Definitions

```typescript
// ✅ Good: Explicit types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Good: Union types
type UserRole = 'ADMIN' | 'USER' | 'VIEWER';
type DocumentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// ❌ Bad: Any types
function processUser(user: any): any {
  return user;
}

// ✅ Good: Specific types
function processUser(user: User): ProcessedUser {
  return {
    ...user,
    processedAt: new Date(),
  };
}
```

### 2. Interface vs Type

```typescript
// ✅ Use interfaces for object shapes
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  pagination?: Pagination;
}

// ✅ Use types for unions and computed types
type Status = 'loading' | 'success' | 'error';
type UserKeys = keyof User;
type PartialUser = Partial<User>;
```

### 3. Generic Types

```typescript
// ✅ Good: Generic API response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ✅ Good: Generic repository
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// ✅ Good: Generic service
class BaseService<T> {
  constructor(private repository: Repository<T>) {}
  
  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }
}
```

### 4. Error Handling

```typescript
// ✅ Good: Custom error classes
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// ✅ Good: Error handling with types
async function getUser(id: string): Promise<User | null> {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error('Failed to fetch user');
  }
}
```

## React/Next.js Standards

### 1. Component Structure

```typescript
// ✅ Good: Functional component with proper typing
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  className?: string;
}

export function UserCard({ user, onEdit, onDelete, className }: UserCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEdit = useCallback(() => {
    onEdit?.(user);
  }, [user, onEdit]);
  
  const handleDelete = useCallback(async () => {
    setIsLoading(true);
    try {
      await onDelete?.(user.id);
    } finally {
      setIsLoading(false);
    }
  }, [user.id, onDelete]);
  
  return (
    <div className={cn('user-card', className)}>
      <h3>{user.firstName} {user.lastName}</h3>
      <p>{user.email}</p>
      <div className="actions">
        <Button onClick={handleEdit} variant="outline">
          Edit
        </Button>
        <Button 
          onClick={handleDelete} 
          variant="destructive"
          disabled={isLoading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
```

### 2. Hooks Usage

```typescript
// ✅ Good: Custom hook with proper typing
interface UseUserOptions {
  userId: string;
  enabled?: boolean;
}

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useUser({ userId, enabled = true }: UseUserOptions): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchUser = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await api.getUser(userId);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, enabled]);
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
  };
}
```

### 3. State Management

```typescript
// ✅ Good: Context with proper typing
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  isLoading: boolean;
}

interface AppContextType {
  state: AppState;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    theme: 'light',
    isLoading: false,
  });
  
  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user }));
  }, []);
  
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, theme }));
  }, []);
  
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);
  
  const value = useMemo(() => ({
    state,
    setUser,
    setTheme,
    setLoading,
  }), [state, setUser, setTheme, setLoading]);
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
```

### 4. Form Handling

```typescript
// ✅ Good: Form with validation
interface LoginFormData {
  email: string;
  password: string;
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.login(data);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          {...form.register('email')}
          type="email"
          className="w-full p-2 border rounded"
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          {...form.register('password')}
          type="password"
          className="w-full p-2 border rounded"
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## NestJS Standards

### 1. Controller Structure

```typescript
// ✅ Good: Controller with proper decorators and validation
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @TenantId() tenantId: string,
  ): Promise<ApiResponse<User>> {
    const user = await this.usersService.create(createUserDto, tenantId);
    return {
      success: true,
      data: user,
    };
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ): Promise<ApiResponse<User>> {
    const user = await this.usersService.findOne(id, tenantId);
    return {
      success: true,
      data: user,
    };
  }
}
```

### 2. Service Structure

```typescript
// ✅ Good: Service with proper error handling
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
  ) {}
  
  async create(createUserDto: CreateUserDto, tenantId: string): Promise<User> {
    try {
      // Validate email uniqueness
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: createUserDto.email,
          organizationId: tenantId,
        },
      });
      
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      // Create user
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          organizationId: tenantId,
        },
      });
      
      // Send welcome email
      await this.emailService.sendWelcomeEmail(user.email, user.firstName);
      
      // Log audit event
      await this.auditService.log({
        action: 'USER_CREATED',
        userId: user.id,
        organizationId: tenantId,
        metadata: { email: user.email },
      });
      
      return user;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}
```

### 3. DTO Validation

```typescript
// ✅ Good: DTO with proper validation
export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;
  
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50, { message: 'First name must be less than 50 characters' })
  firstName: string;
  
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name must be less than 50 characters' })
  lastName: string;
  
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;
}
```

### 4. Exception Handling

```typescript
// ✅ Good: Custom exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.handlePrismaError(exception);
    } else if (exception instanceof Error) {
      message = exception.message;
    }
    
    const errorResponse = {
      success: false,
      error: {
        code: exception.constructor.name,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };
    
    this.logger.error(
      `Exception: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );
    
    response.status(status).json(errorResponse);
  }
  
  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError): string {
    switch (exception.code) {
      case 'P2002':
        return 'Unique constraint violation';
      case 'P2025':
        return 'Record not found';
      default:
        return 'Database error';
    }
  }
}
```

## Database Standards

### 1. Prisma Schema

```prisma
// ✅ Good: Well-structured Prisma schema
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  firstName     String
  lastName      String
  role          UserRole  @default(USER)
  isActive      Boolean   @default(true)
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  documents     Document[]
  auditLogs     AuditLog[]
  
  @@map("users")
  @@index([email])
  @@index([organizationId])
  @@index([createdAt])
}

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  status      OrgStatus @default(ACTIVE)
  ownerId     String
  owner       User     @relation("OrganizationOwner", fields: [ownerId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  users       User[]
  documents   Document[]
  
  @@map("organizations")
  @@index([slug])
  @@index([status])
}
```

### 2. Database Queries

```typescript
// ✅ Good: Efficient database queries
export class UsersService {
  async findMany(
    tenantId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      role?: UserRole;
    } = {},
  ): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 20, search, role } = options;
    const skip = (page - 1) * limit;
    
    const where: Prisma.UserWhereInput = {
      organizationId: tenantId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role }),
    };
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    
    return { users, total };
  }
}
```

### 3. Transactions

```typescript
// ✅ Good: Database transactions
export class DocumentsService {
  async createWithAnalysis(
    createDocumentDto: CreateDocumentDto,
    tenantId: string,
    userId: string,
  ): Promise<Document> {
    return this.prisma.$transaction(async (tx) => {
      // Create document
      const document = await tx.document.create({
        data: {
          ...createDocumentDto,
          organizationId: tenantId,
          userId,
        },
      });
      
      // Create analysis job
      await tx.analysisJob.create({
        data: {
          documentId: document.id,
          status: 'PENDING',
          type: 'CONTRACT_REVIEW',
        },
      });
      
      // Log audit event
      await tx.auditLog.create({
        data: {
          action: 'DOCUMENT_CREATED',
          userId,
          organizationId: tenantId,
          resourceType: 'Document',
          resourceId: document.id,
        },
      });
      
      return document;
    });
  }
}
```

## Testing Standards

### 1. Unit Tests

```typescript
// ✅ Good: Comprehensive unit tests
describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let emailService: EmailService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();
    
    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
  });
  
  describe('create', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      const tenantId = 'tenant-123';
      const hashedPassword = 'hashed-password';
      
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);
      jest.spyOn(emailService, 'sendWelcomeEmail').mockResolvedValue(undefined);
      
      // Act
      const result = await service.create(createUserDto, tenantId);
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: hashedPassword,
          organizationId: tenantId,
        },
      });
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
      );
    });
    
    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      const tenantId = 'tenant-123';
      
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);
      
      // Act & Assert
      await expect(service.create(createUserDto, tenantId)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
```

### 2. Integration Tests

```typescript
// ✅ Good: Integration tests
describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  beforeEach(async () => {
    await prismaService.user.deleteMany();
    await prismaService.organization.deleteMany();
  });
  
  describe('POST /users', () => {
    it('should create a user', async () => {
      // Arrange
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      
      // Act
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);
      
      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(createUserDto.email);
      
      const user = await prismaService.user.findUnique({
        where: { email: createUserDto.email },
      });
      expect(user).toBeTruthy();
    });
  });
});
```

### 3. E2E Tests

```typescript
// ✅ Good: E2E tests
describe('User Management (E2E)', () => {
  let app: INestApplication;
  let authToken: string;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@lexiscan.ai',
        password: 'admin123',
      });
    
    authToken = loginResponse.body.data.token;
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  it('should create, read, update, and delete a user', async () => {
    // Create user
    const createResponse = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      })
      .expect(201);
    
    const userId = createResponse.body.data.id;
    
    // Read user
    const getResponse = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(getResponse.body.data.email).toBe('test@example.com');
    
    // Update user
    const updateResponse = await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Jane',
      })
      .expect(200);
    
    expect(updateResponse.body.data.firstName).toBe('Jane');
    
    // Delete user
    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    // Verify deletion
    await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});
```

## Documentation Standards

### 1. Code Comments

```typescript
// ✅ Good: Meaningful comments
/**
 * Calculates the risk score for a document based on various factors
 * @param document - The document to analyze
 * @param factors - Risk factors to consider
 * @returns A risk score between 0 and 100
 */
export function calculateRiskScore(
  document: Document,
  factors: RiskFactor[],
): number {
  // Start with base risk score
  let score = 0;
  
  // Apply factor weights
  for (const factor of factors) {
    score += factor.weight * factor.value;
  }
  
  // Normalize to 0-100 range
  return Math.min(100, Math.max(0, score));
}
```

### 2. API Documentation

```typescript
// ✅ Good: Comprehensive API documentation
@Controller('documents')
@ApiTags('Documents')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DocumentsController {
  /**
   * Upload a new document for analysis
   * @param file - The document file to upload
   * @param metadata - Document metadata
   * @param tenantId - Tenant ID from JWT token
   * @returns The created document
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload document',
    description: 'Upload a new document for AI analysis and processing',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
          description: 'Document title',
        },
        description: {
          type: 'string',
          description: 'Document description',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    type: Document,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or metadata',
  })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: DocumentMetadataDto,
    @TenantId() tenantId: string,
  ): Promise<ApiResponse<Document>> {
    // Implementation
  }
}
```

### 3. README Files

```markdown
# Users Module

## Overview

The Users module handles user management, authentication, and authorization within the LexiScan AI platform.

## Features

- User registration and authentication
- Role-based access control
- User profile management
- Password reset functionality
- Audit logging

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users` | Create a new user | Yes (Admin) |
| GET | `/users` | List all users | Yes |
| GET | `/users/:id` | Get user by ID | Yes |
| PUT | `/users/:id` | Update user | Yes |
| DELETE | `/users/:id` | Delete user | Yes (Admin) |

## Usage

```typescript
// Create a new user
const user = await usersService.create({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
}, tenantId);

// Find user by ID
const user = await usersService.findById(userId, tenantId);
```

## Testing

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```
```

## Git Standards

### 1. Commit Messages

```bash
# ✅ Good: Conventional commits
feat: add user authentication system
fix: resolve database connection timeout
docs: update API documentation
test: add unit tests for user service
refactor: improve error handling in auth controller
perf: optimize database queries
chore: update dependencies

# ❌ Bad: Unclear commit messages
fix stuff
update
changes
```

### 2. Branch Naming

```bash
# ✅ Good: Descriptive branch names
feature/user-authentication
feature/document-upload
bugfix/login-validation-error
hotfix/security-vulnerability
chore/update-dependencies
docs/api-documentation

# ❌ Bad: Unclear branch names
feature1
fix
update
test
```

### 3. Pull Request Template

```markdown
## Description

Brief description of the changes made.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows the project's coding standards
- [ ] Self-review of code completed
- [ ] Code is properly commented
- [ ] Documentation updated
- [ ] No breaking changes (or breaking changes are documented)
```

## Code Review Standards

### 1. Review Checklist

- [ ] **Functionality**: Does the code work as intended?
- [ ] **Performance**: Are there any performance issues?
- [ ] **Security**: Are there any security vulnerabilities?
- [ ] **Testing**: Are there adequate tests?
- [ ] **Documentation**: Is the code properly documented?
- [ ] **Standards**: Does the code follow project standards?
- [ ] **Maintainability**: Is the code maintainable?

### 2. Review Process

1. **Self-Review**: Author reviews their own code first
2. **Peer Review**: At least one peer reviews the code
3. **Senior Review**: Complex changes require senior developer review
4. **Testing**: All tests must pass before merge
5. **Documentation**: Documentation must be updated

### 3. Review Guidelines

```markdown
## Code Review Guidelines

### What to Look For

1. **Correctness**: Does the code do what it's supposed to do?
2. **Readability**: Is the code easy to understand?
3. **Maintainability**: Will this code be easy to modify in the future?
4. **Performance**: Are there any performance concerns?
5. **Security**: Are there any security issues?

### How to Review

1. **Read the code**: Understand what it does
2. **Test the logic**: Walk through the code mentally
3. **Check for edge cases**: Are all scenarios handled?
4. **Verify tests**: Do the tests cover the functionality?
5. **Provide feedback**: Be constructive and specific

### Review Comments

- Be specific about issues
- Suggest improvements
- Ask questions if unclear
- Acknowledge good practices
- Be respectful and professional
```

## Support

For coding standards questions:

- **Email**: dev-standards@lexiscan.ai
- **Documentation**: https://docs.lexiscan.ai/development/standards
- **Slack**: #dev-standards
- **Emergency**: dev@lexiscan.ai

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial coding standards |
| 1.1.0 | 2024-01-20 | Added testing standards |
| 1.2.0 | 2024-01-25 | Enhanced documentation standards |
| 1.3.0 | 2024-02-01 | Added code review standards |
