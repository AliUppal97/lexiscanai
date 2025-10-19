import { Controller, Post, Body, UseGuards, Get, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, LoginCredentials } from './auth.service';
import { UserManagementService, CreateTenantDto } from './user-management.service';
import { JwtAuthGuard } from './auth.guard';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

// DTOs
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  tenantSlug: string;
}

export class CreateTenantRequestDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(8)
  adminPassword: string;

  @IsOptional()
  @IsString()
  adminFirstName?: string;

  @IsOptional()
  @IsString()
  adminLastName?: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userManagementService: UserManagementService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const credentials: LoginCredentials = {
      email: loginDto.email,
      password: loginDto.password,
      tenantSlug: loginDto.tenantSlug,
    };

    return await this.authService.login(credentials);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req) {
    return {
      user: req.user,
      tenantId: req.tenantId,
    };
  }
}

@ApiTags('User Management')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserManagementController {
  constructor(private userManagementService: UserManagementService) {}

  @Post('tenants')
  @ApiOperation({ summary: 'Create new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 409, description: 'Tenant slug or domain already exists' })
  async createTenant(@Body() createTenantDto: CreateTenantRequestDto) {
    const dto: CreateTenantDto = {
      name: createTenantDto.name,
      slug: createTenantDto.slug,
      domain: createTenantDto.domain,
      adminEmail: createTenantDto.adminEmail,
      adminPassword: createTenantDto.adminPassword,
      adminFirstName: createTenantDto.adminFirstName,
      adminLastName: createTenantDto.adminLastName,
    };

    return await this.userManagementService.createTenant(dto);
  }
}