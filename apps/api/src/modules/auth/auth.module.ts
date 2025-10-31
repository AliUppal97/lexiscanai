import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController, UserManagementController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserManagementService } from './user-management.service';
import { SecurityService } from './security.service';
import { SessionService } from './session.service';
import { MfaService } from './mfa.service';
import { ApiKeyService } from './api-key.service';
import { SsoService } from './sso.service';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from './auth.guard';
import { EnhancedJwtAuthGuard, ApiKeyAuthGuard, OptionalAuthGuard } from './enhanced-auth.guard';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, UserManagementController],
  providers: [
    // Services
    AuthService,
    UserManagementService,
    SecurityService,
    SessionService,
    MfaService,
    ApiKeyService,
    SsoService,
    
    // Guards (backward compatibility)
    JwtAuthGuard,
    PermissionsGuard,
    RolesGuard,
    
    // Enhanced Guards
    EnhancedJwtAuthGuard,
    ApiKeyAuthGuard,
    OptionalAuthGuard,
    
    // Infrastructure
    PrismaService,
    CacheService,
  ],
  exports: [
    // Services
    AuthService,
    UserManagementService,
    SecurityService,
    SessionService,
    MfaService,
    ApiKeyService,
    SsoService,
    
    // Guards
    JwtAuthGuard,
    PermissionsGuard,
    RolesGuard,
    EnhancedJwtAuthGuard,
    ApiKeyAuthGuard,
    OptionalAuthGuard,
  ],
})
export class AuthModule {}