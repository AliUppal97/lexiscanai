import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [RolesController],
  providers: [PrismaService, RolesService, PermissionsService],
  exports: [RolesService, PermissionsService],
})
export class RolesModule {}

