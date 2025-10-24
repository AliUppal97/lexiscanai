import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdateProfileDto } from './dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        timezone: true,
        locale: true,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        passwordChangedAt: true,
        isDeleted: true,
        deletedAt: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        internalId: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        avatar: dto.avatar,
        timezone: dto.timezone,
        locale: dto.locale,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        timezone: true,
        locale: true,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        passwordChangedAt: true,
        isDeleted: true,
        deletedAt: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        internalId: true,
      },
    });

    this.logger.log(`Profile updated for user: ${userId}`);

    return updated;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Invalid user');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        passwordChangedAt: new Date(),
      },
    });

    this.logger.log(`Password changed for user: ${userId}`);
  }

  async uploadAvatar(
    userId: string,
    avatarUrl: string,
  ): Promise<Omit<User, 'passwordHash'>> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        timezone: true,
        locale: true,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        passwordChangedAt: true,
        isDeleted: true,
        deletedAt: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        internalId: true,
      },
    });

    this.logger.log(`Avatar uploaded for user: ${userId}`);

    return updated;
  }
}

