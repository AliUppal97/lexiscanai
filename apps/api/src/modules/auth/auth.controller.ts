import { Controller, Post, Body, UseGuards, Get, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, LoginCredentials } from './auth.service';
import { UserManagementService, CreateUserDto, CreateTenantDto, AssignRoleDto } from './user-management.service';
import { JwtAuthGuard, RequirePermissions, RequireRoles } from './auth.guard';
import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsUUID } from 'class-validator';

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

export class CreateUserRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}

export class AssignRoleRequestDto {
  @IsUUID('4')
  userId: string;

  @IsUUID('4')
  roleId: string;

  @IsOptional()
  expiresAt?: Date;

  @IsUUID('4')
  assignedBy: string;
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req) {
    const sessionId = req.headers['x-session-id']; // Extract from header
    await this.authService.logout(sessionId);
    return { message: 'Logout successful' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ status: 200, description: 'Logout from all devices successful' })
  async logoutAll(@Request() req) {
    await this.authService.logoutAll(req.user.id, req.tenantId);
    return { message: 'Logout from all devices successful' };
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
      tenantSlug: req.tenantSlug,
      roles: req.userRoles,
      permissions: req.userPermissions,
    };
  }

  @Get('permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  async getPermissions(@Request() req) {
    const permissions = await this.authService.getUserPermissions(req.user.id, req.tenantId);
    return { permissions };
  }
}

@ApiTags('User Management')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserManagementController {
  constructor(private userManagementService: UserManagementService) {}

  @Post('tenants')
  @RequirePermissions(['admin.manage'])
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

  @Post()
  @RequirePermissions(['users.create'])
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists in tenant' })
  async createUser(@Body() createUserDto: CreateUserRequestDto, @Request() req) {
    const dto: CreateUserDto = {
      email: createUserDto.email,
      password: createUserDto.password,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      roleIds: createUserDto.roleIds,
      tenantId: req.tenantId,
    };

    return await this.userManagementService.createUser(dto);
  }

  @Get()
  @RequirePermissions(['users.read'])
  @ApiOperation({ summary: 'Get tenant users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(@Request() req) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    return await this.userManagementService.getTenantUsers(req.tenantId, page, limit);
  }

  @Get('roles')
  @RequirePermissions(['roles.read'])
  @ApiOperation({ summary: 'Get tenant roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async getRoles(@Request() req) {
    return await this.userManagementService.getTenantRoles(req.tenantId);
  }

  @Get('permissions')
  @RequirePermissions(['roles.read'])
  @ApiOperation({ summary: 'Get tenant permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  async getPermissions(@Request() req) {
    return await this.userManagementService.getTenantPermissions(req.tenantId);
  }

  @Post('assign-role')
  @RequirePermissions(['roles.assign'])
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 409, description: 'User already has this role' })
  async assignRole(@Body() assignRoleDto: AssignRoleRequestDto, @Request() req) {
    const dto: AssignRoleDto = {
      userId: assignRoleDto.userId,
      roleId: assignRoleDto.roleId,
      expiresAt: assignRoleDto.expiresAt,
      assignedBy: req.user.id,
    };

    await this.userManagementService.assignRole(dto);
    return { message: 'Role assigned successfully' };
  }

  @Post(':userId/revoke-role/:roleId')
  @RequirePermissions(['roles.assign'])
  @ApiOperation({ summary: 'Revoke role from user' })
  @ApiResponse({ status: 200, description: 'Role revoked successfully' })
  async revokeRole(
    @Request() req,
    @Request() params: { userId: string; roleId: string }
  ) {
    await this.userManagementService.revokeRole(params.userId, params.roleId, req.user.id);
    return { message: 'Role revoked successfully' };
  }

  @Post(':userId/delete')
  @RequirePermissions(['users.delete'])
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Request() req, @Request() params: { userId: string }) {
    await this.userManagementService.softDeleteUser(params.userId, req.user.id);
    return { message: 'User deleted successfully' };
  }
}

