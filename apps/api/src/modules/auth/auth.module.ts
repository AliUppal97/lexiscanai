import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController, UserManagementController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserManagementService } from './user-management.service';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from './auth.guard';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, UserManagementController],
  providers: [
    AuthService,
    UserManagementService,
    JwtAuthGuard,
    PermissionsGuard,
    RolesGuard,
    PrismaService,
  ],
  exports: [AuthService, UserManagementService, JwtAuthGuard, PermissionsGuard, RolesGuard],
})
export class AuthModule {}

