import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { Reflector } from '@nestjs/core';
import { TokenPayload } from './auth.service';

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';

export const RequirePermissions = (permissions: string[]) => 
  Reflector.createDecorator<string[]>(PERMISSIONS_KEY)(permissions);

export const RequireRoles = (roles: string[]) => 
  Reflector.createDecorator<string[]>(ROLES_KEY)(roles);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Set tenant context for RLS
      await this.prisma.$executeRaw`SELECT set_current_tenant(${payload.tenantId})`;

      // Verify user is still active
      const user = await this.prisma.user.findUnique({
        where: { 
          id: payload.sub,
          isActive: true,
          isDeleted: false,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Attach user and tenant info to request
      request.user = user;
      request.tenantId = payload.tenantId;
      request.tenantSlug = payload.tenantSlug;
      request.userRoles = payload.roles;
      request.userPermissions = payload.permissions;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.tenantId;

    if (!user || !tenantId) {
      return false;
    }

    // Check if user has all required permissions
    for (const permission of requiredPermissions) {
      const hasPermission = await this.prisma.$queryRaw<[{user_has_permission: boolean}]>`
        SELECT user_has_permission(${user.id}, ${permission}) as user_has_permission
      `;
      
      if (!hasPermission[0]?.user_has_permission) {
        return false;
      }
    }

    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRoles = request.userRoles || [];

    return requiredRoles.some(role => userRoles.includes(role));
  }
}

