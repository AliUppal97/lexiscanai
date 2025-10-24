import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EmailService } from '../../services/email.service';
import { EncryptionService } from '../../services/encryption.service';
import { InviteMemberDto } from './dto';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Invite a new member to organization
   */
  async create(
    organizationId: string,
    invitedBy: string,
    dto: InviteMemberDto,
  ): Promise<any> {
    // Check if user is already a member
    // const existingMember = await this.prisma.organizationMember.findFirst({
    //   where: {
    //     organizationId,
    //     user: { email: dto.email },
    //   },
    // });
    //
    // if (existingMember) {
    //   throw new ConflictException('User is already a member');
    // }

    // Check for pending invitation
    // const existingInvitation = await this.prisma.organizationInvitation.findFirst({
    //   where: {
    //     organizationId,
    //     email: dto.email,
    //     status: 'pending',
    //   },
    // });
    //
    // if (existingInvitation) {
    //   throw new ConflictException('Invitation already sent');
    // }

    // Generate invitation token
    const token = this.encryptionService.generateToken(32);

    // In production:
    // const invitation = await this.prisma.organizationInvitation.create({
    //   data: {
    //     organizationId,
    //     email: dto.email,
    //     role: dto.role,
    //     permissions: dto.permissions,
    //     token,
    //     invitedBy,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    //   },
    //   include: {
    //     organization: true,
    //     inviter: {
    //       select: {
    //         firstName: true,
    //         lastName: true,
    //       },
    //     },
    //   },
    // });

    // Send invitation email
    try {
      await this.emailService.sendTeamInvitationEmail(
        dto.email,
        'Inviter Name', // invitation.inviter.firstName
        'Organization Name', // invitation.organization.name
        token,
      );
    } catch (error) {
      this.logger.error(`Failed to send invitation email: ${error.message}`);
    }

    this.logger.log(`Invitation sent to ${dto.email} for organization ${organizationId}`);

    return {
      id: 'inv_mock_id',
      email: dto.email,
      role: dto.role,
      status: 'pending',
      token,
      createdAt: new Date(),
    };
  }

  /**
   * Get all invitations for an organization
   */
  async findAll(
    organizationId: string,
    options?: {
      status?: 'pending' | 'accepted' | 'rejected' | 'expired';
      page?: number;
      limit?: number;
    },
  ): Promise<{ invitations: any[]; total: number }> {
    // In production:
    // const where: any = { organizationId };
    //
    // if (options?.status) {
    //   where.status = options.status;
    // }
    //
    // const [invitations, total] = await Promise.all([
    //   this.prisma.organizationInvitation.findMany({
    //     where,
    //     include: {
    //       inviter: {
    //         select: {
    //           id: true,
    //           firstName: true,
    //           lastName: true,
    //           email: true,
    //         },
    //       },
    //     },
    //     orderBy: { createdAt: 'desc' },
    //     skip: ((options?.page || 1) - 1) * (options?.limit || 20),
    //     take: options?.limit || 20,
    //   }),
    //   this.prisma.organizationInvitation.count({ where }),
    // ]);

    return {
      invitations: [],
      total: 0,
    };
  }

  /**
   * Get invitation by token
   */
  async findByToken(token: string): Promise<any> {
    // In production:
    // const invitation = await this.prisma.organizationInvitation.findFirst({
    //   where: {
    //     token,
    //     status: 'pending',
    //     expiresAt: {
    //       gt: new Date(),
    //     },
    //   },
    //   include: {
    //     organization: true,
    //     inviter: {
    //       select: {
    //         firstName: true,
    //         lastName: true,
    //       },
    //     },
    //   },
    // });
    //
    // if (!invitation) {
    //   throw new NotFoundException('Invalid or expired invitation');
    // }

    return {
      id: 'inv_mock_id',
      token,
      email: 'user@example.com',
      role: 'member',
      status: 'pending',
    };
  }

  /**
   * Accept invitation
   */
  async accept(token: string, userId: string): Promise<void> {
    const invitation = await this.findByToken(token);

    // Verify email matches (if user is logged in)
    // const user = await this.prisma.user.findUnique({ where: { id: userId } });
    // if (user.email !== invitation.email) {
    //   throw new BadRequestException('Email does not match invitation');
    // }

    // In production, use transaction:
    // await this.prisma.$transaction([
    //   // Create organization member
    //   this.prisma.organizationMember.create({
    //     data: {
    //       organizationId: invitation.organizationId,
    //       userId,
    //       role: invitation.role,
    //       permissions: invitation.permissions,
    //     },
    //   }),
    //   // Update invitation status
    //   this.prisma.organizationInvitation.update({
    //     where: { id: invitation.id },
    //     data: {
    //       status: 'accepted',
    //       acceptedAt: new Date(),
    //     },
    //   }),
    // ]);

    this.logger.log(`Invitation ${invitation.id} accepted by user ${userId}`);
  }

  /**
   * Reject invitation
   */
  async reject(token: string): Promise<void> {
    const invitation = await this.findByToken(token);

    // In production:
    // await this.prisma.organizationInvitation.update({
    //   where: { id: invitation.id },
    //   data: {
    //     status: 'rejected',
    //     rejectedAt: new Date(),
    //   },
    // });

    this.logger.log(`Invitation ${invitation.id} rejected`);
  }

  /**
   * Cancel invitation
   */
  async cancel(invitationId: string, organizationId: string): Promise<void> {
    // In production:
    // const invitation = await this.prisma.organizationInvitation.findFirst({
    //   where: {
    //     id: invitationId,
    //     organizationId,
    //     status: 'pending',
    //   },
    // });
    //
    // if (!invitation) {
    //   throw new NotFoundException('Invitation not found');
    // }
    //
    // await this.prisma.organizationInvitation.delete({
    //   where: { id: invitationId },
    // });

    this.logger.log(`Invitation ${invitationId} cancelled`);
  }

  /**
   * Resend invitation
   */
  async resend(invitationId: string, organizationId: string): Promise<void> {
    // In production:
    // const invitation = await this.prisma.organizationInvitation.findFirst({
    //   where: {
    //     id: invitationId,
    //     organizationId,
    //     status: 'pending',
    //   },
    //   include: {
    //     organization: true,
    //     inviter: {
    //       select: {
    //         firstName: true,
    //         lastName: true,
    //       },
    //     },
    //   },
    // });
    //
    // if (!invitation) {
    //   throw new NotFoundException('Invitation not found');
    // }

    // Generate new token
    const newToken = this.encryptionService.generateToken(32);

    // In production:
    // await this.prisma.organizationInvitation.update({
    //   where: { id: invitationId },
    //   data: {
    //     token: newToken,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    //   },
    // });

    // Resend email
    try {
      await this.emailService.sendTeamInvitationEmail(
        'user@example.com', // invitation.email
        'Inviter Name',
        'Organization Name',
        newToken,
      );
    } catch (error) {
      this.logger.error(`Failed to resend invitation email: ${error.message}`);
    }

    this.logger.log(`Invitation ${invitationId} resent`);
  }

  /**
   * Clean up expired invitations
   */
  async cleanupExpired(): Promise<number> {
    // In production:
    // const result = await this.prisma.organizationInvitation.updateMany({
    //   where: {
    //     status: 'pending',
    //     expiresAt: {
    //       lt: new Date(),
    //     },
    //   },
    //   data: {
    //     status: 'expired',
    //   },
    // });
    //
    // this.logger.log(`Marked ${result.count} invitations as expired`);
    // return result.count;

    return 0;
  }

  /**
   * Get invitation statistics
   */
  async getStatistics(organizationId: string): Promise<{
    pending: number;
    accepted: number;
    rejected: number;
    expired: number;
  }> {
    // In production:
    // const stats = await this.prisma.organizationInvitation.groupBy({
    //   by: ['status'],
    //   where: { organizationId },
    //   _count: true,
    // });
    //
    // return stats.reduce(
    //   (acc, { status, _count }) => {
    //     acc[status] = _count;
    //     return acc;
    //   },
    //   { pending: 0, accepted: 0, rejected: 0, expired: 0 },
    // );

    return {
      pending: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
    };
  }
}

