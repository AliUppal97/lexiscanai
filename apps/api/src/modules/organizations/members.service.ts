import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdateMemberDto } from './dto';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get all members of an organization
   */
  async findAll(
    organizationId: string,
    options?: {
      role?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ members: any[]; total: number }> {
    // In production:
    // const where: any = { organizationId, isActive: true };
    //
    // if (options?.role) {
    //   where.role = options.role;
    // }
    //
    // if (options?.search) {
    //   where.user = {
    //     OR: [
    //       { email: { contains: options.search, mode: 'insensitive' } },
    //       { firstName: { contains: options.search, mode: 'insensitive' } },
    //       { lastName: { contains: options.search, mode: 'insensitive' } },
    //     ],
    //   };
    // }
    //
    // const [members, total] = await Promise.all([
    //   this.prisma.organizationMember.findMany({
    //     where,
    //     include: {
    //       user: {
    //         select: {
    //           id: true,
    //           email: true,
    //           firstName: true,
    //           lastName: true,
    //           avatar: true,
    //         },
    //       },
    //     },
    //     orderBy: { createdAt: 'desc' },
    //     skip: ((options?.page || 1) - 1) * (options?.limit || 20),
    //     take: options?.limit || 20,
    //   }),
    //   this.prisma.organizationMember.count({ where }),
    // ]);

    return {
      members: [],
      total: 0,
    };
  }

  /**
   * Get a specific member
   */
  async findOne(organizationId: string, memberId: string): Promise<any> {
    // In production:
    // const member = await this.prisma.organizationMember.findFirst({
    //   where: {
    //     id: memberId,
    //     organizationId,
    //   },
    //   include: {
    //     user: {
    //       select: {
    //         id: true,
    //         email: true,
    //         firstName: true,
    //         lastName: true,
    //         avatar: true,
    //         createdAt: true,
    //       },
    //     },
    //   },
    // });
    //
    // if (!member) {
    //   throw new NotFoundException('Member not found');
    // }

    return {
      id: memberId,
      organizationId,
      role: 'member',
    };
  }

  /**
   * Update member role and permissions
   */
  async update(
    organizationId: string,
    memberId: string,
    dto: UpdateMemberDto,
    updatedBy: string,
  ): Promise<any> {
    // Verify updater has permission
    // const updater = await this.getMember(organizationId, updatedBy);
    // if (!['owner', 'admin'].includes(updater.role)) {
    //   throw new ForbiddenException('Insufficient permissions');
    // }

    // Prevent demoting the only owner
    if (dto.role && dto.role !== 'owner') {
      const ownerCount = await this.countByRole(organizationId, 'owner');
      if (ownerCount <= 1) {
        const member = await this.findOne(organizationId, memberId);
        if (member.role === 'owner') {
          throw new ConflictException('Cannot demote the only owner');
        }
      }
    }

    // In production:
    // return await this.prisma.organizationMember.update({
    //   where: {
    //     id: memberId,
    //     organizationId,
    //   },
    //   data: dto,
    // });

    this.logger.log(`Member ${memberId} updated in organization ${organizationId}`);

    return {
      id: memberId,
      ...dto,
      updatedAt: new Date(),
    };
  }

  /**
   * Remove member from organization
   */
  async remove(
    organizationId: string,
    memberId: string,
    removedBy: string,
  ): Promise<void> {
    // Verify remover has permission
    // const remover = await this.getMember(organizationId, removedBy);
    // if (!['owner', 'admin'].includes(remover.role)) {
    //   throw new ForbiddenException('Insufficient permissions');
    // }

    // Get member to be removed
    const member = await this.findOne(organizationId, memberId);

    // Prevent removing the only owner
    if (member.role === 'owner') {
      const ownerCount = await this.countByRole(organizationId, 'owner');
      if (ownerCount <= 1) {
        throw new ConflictException('Cannot remove the only owner');
      }
    }

    // In production:
    // await this.prisma.organizationMember.delete({
    //   where: {
    //     id: memberId,
    //     organizationId,
    //   },
    // });

    this.logger.log(`Member ${memberId} removed from organization ${organizationId}`);
  }

  /**
   * Leave organization (self-removal)
   */
  async leave(organizationId: string, userId: string): Promise<void> {
    // Get member
    // const member = await this.getMember(organizationId, userId);

    // Prevent owner from leaving if they're the only owner
    // if (member.role === 'owner') {
    //   const ownerCount = await this.countByRole(organizationId, 'owner');
    //   if (ownerCount <= 1) {
    //     throw new ConflictException(
    //       'Transfer ownership before leaving as the only owner',
    //     );
    //   }
    // }

    // In production:
    // await this.prisma.organizationMember.delete({
    //   where: {
    //     organizationId_userId: {
    //       organizationId,
    //       userId,
    //     },
    //   },
    // });

    this.logger.log(`User ${userId} left organization ${organizationId}`);
  }

  /**
   * Get member by user ID
   */
  async getMember(organizationId: string, userId: string): Promise<any> {
    // In production:
    // const member = await this.prisma.organizationMember.findFirst({
    //   where: {
    //     organizationId,
    //     userId,
    //     isActive: true,
    //   },
    // });
    //
    // if (!member) {
    //   throw new NotFoundException('Member not found');
    // }

    return {
      organizationId,
      userId,
      role: 'member',
    };
  }

  /**
   * Count members by role
   */
  async countByRole(organizationId: string, role: string): Promise<number> {
    // In production:
    // return await this.prisma.organizationMember.count({
    //   where: {
    //     organizationId,
    //     role,
    //     isActive: true,
    //   },
    // });

    return 1; // Mock
  }

  /**
   * Get member statistics
   */
  async getStatistics(organizationId: string): Promise<{
    total: number;
    byRole: Record<string, number>;
    active: number;
    recentJoins: number;
  }> {
    // In production:
    // const [total, roles, recentJoins] = await Promise.all([
    //   this.prisma.organizationMember.count({
    //     where: { organizationId, isActive: true },
    //   }),
    //   this.prisma.organizationMember.groupBy({
    //     by: ['role'],
    //     where: { organizationId, isActive: true },
    //     _count: true,
    //   }),
    //   this.prisma.organizationMember.count({
    //     where: {
    //       organizationId,
    //       isActive: true,
    //       createdAt: {
    //         gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    //       },
    //     },
    //   }),
    // ]);
    //
    // const byRole = roles.reduce((acc, { role, _count }) => {
    //   acc[role] = _count;
    //   return acc;
    // }, {} as Record<string, number>);

    return {
      total: 0,
      byRole: {},
      active: 0,
      recentJoins: 0,
    };
  }

  /**
   * Check if user has permission
   */
  async hasPermission(
    organizationId: string,
    userId: string,
    permission: string,
  ): Promise<boolean> {
    // In production:
    // const member = await this.getMember(organizationId, userId);
    //
    // // Owners have all permissions
    // if (member.role === 'owner') {
    //   return true;
    // }
    //
    // // Check if member has wildcard permission
    // if (member.permissions?.includes('*')) {
    //   return true;
    // }
    //
    // // Check specific permission
    // return member.permissions?.includes(permission) || false;

    return true; // Mock
  }
}

