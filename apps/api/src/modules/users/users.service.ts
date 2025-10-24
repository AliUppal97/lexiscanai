import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    dto: CreateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: {
        email_tenantId: {
          email: dto.email,
          tenantId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        timezone: dto.timezone || 'UTC',
        locale: dto.locale || 'en-US',
        tenantId,
      },
    });

    this.logger.log(`User created: ${user.id}`);

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(
    tenantId: string,
    query: QueryUsersDto,
  ): Promise<{
    users: Omit<User, 'passwordHash'>[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = { tenantId, isDeleted: false };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
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
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(
    tenantId: string,
    userId: string,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        isDeleted: false,
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    tenantId: string,
    userId: string,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    // Verify user exists
    await this.findOne(tenantId, userId);

    // Update user
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        avatar: dto.avatar,
        timezone: dto.timezone,
        locale: dto.locale,
        isActive: dto.isActive,
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

    this.logger.log(`User updated: ${userId}`);

    return updated;
  }

  async remove(tenantId: string, userId: string): Promise<void> {
    // Verify user exists
    await this.findOne(tenantId, userId);

    // Soft delete
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });

    this.logger.log(`User deleted: ${userId}`);
  }
}

