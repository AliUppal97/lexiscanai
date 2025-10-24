import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { MembersService } from './members.service';
import { InvitationsService } from './invitations.service';
import { PrismaService } from '../../common/prisma.service';
import { EmailService } from '../../services/email.service';
import { EncryptionService } from '../../services/encryption.service';

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
  controllers: [OrganizationsController],
  providers: [
    PrismaService,
    OrganizationsService,
    MembersService,
    InvitationsService,
    EmailService,
    EncryptionService,
  ],
  exports: [OrganizationsService, MembersService, InvitationsService],
})
export class OrganizationsModule {}

