import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { OrganizationsService } from './organizations.service';
import { MembersService } from './members.service';
import { InvitationsService } from './invitations.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  InviteMemberDto,
  UpdateMemberDto,
} from './dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
    private membersService: MembersService,
    private invitationsService: InvitationsService,
  ) {}

  // ===== Organization Management =====

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(@Request() req, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(req.user.userId, dto);
  }

  @Get()
  async getOrganizations(@Request() req) {
    return this.organizationsService.findAll(req.user.userId);
  }

  @Get(':organizationId')
  async getOrganization(@Request() req, @Param('organizationId') organizationId: string) {
    return this.organizationsService.findOne(organizationId, req.user.userId);
  }

  @Put(':organizationId')
  async updateOrganization(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(organizationId, req.user.userId, dto);
  }

  @Delete(':organizationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrganization(@Request() req, @Param('organizationId') organizationId: string) {
    return this.organizationsService.delete(organizationId, req.user.userId);
  }

  @Get(':organizationId/statistics')
  async getStatistics(@Request() req, @Param('organizationId') organizationId: string) {
    return this.organizationsService.getStatistics(organizationId, req.user.userId);
  }

  @Post(':organizationId/transfer-ownership')
  async transferOwnership(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Body('newOwnerId') newOwnerId: string,
  ) {
    await this.organizationsService.transferOwnership(
      organizationId,
      req.user.userId,
      newOwnerId,
    );
    return { message: 'Ownership transferred successfully' };
  }

  // ===== Member Management =====

  @Get(':organizationId/members')
  async getMembers(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    await this.organizationsService.verifyMembership(organizationId, req.user.userId);

    return this.membersService.findAll(organizationId, {
      role,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':organizationId/members/:memberId')
  async getMember(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Param('memberId') memberId: string,
  ) {
    await this.organizationsService.verifyMembership(organizationId, req.user.userId);
    return this.membersService.findOne(organizationId, memberId);
  }

  @Put(':organizationId/members/:memberId')
  async updateMember(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.update(organizationId, memberId, dto, req.user.userId);
  }

  @Delete(':organizationId/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.membersService.remove(organizationId, memberId, req.user.userId);
  }

  @Post(':organizationId/members/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveOrganization(
    @Request() req,
    @Param('organizationId') organizationId: string,
  ) {
    return this.membersService.leave(organizationId, req.user.userId);
  }

  @Get(':organizationId/members-statistics')
  async getMemberStatistics(
    @Request() req,
    @Param('organizationId') organizationId: string,
  ) {
    await this.organizationsService.verifyMembership(organizationId, req.user.userId);
    return this.membersService.getStatistics(organizationId);
  }

  // ===== Invitation Management =====

  @Post(':organizationId/invitations')
  @HttpCode(HttpStatus.CREATED)
  async inviteMember(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.invitationsService.create(organizationId, req.user.userId, dto);
  }

  @Get(':organizationId/invitations')
  async getInvitations(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Query('status') status?: 'pending' | 'accepted' | 'rejected' | 'expired',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    await this.organizationsService.verifyMembership(organizationId, req.user.userId);

    return this.invitationsService.findAll(organizationId, {
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Post('invitations/:token/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(@Request() req, @Param('token') token: string) {
    await this.invitationsService.accept(token, req.user.userId);
    return { message: 'Invitation accepted successfully' };
  }

  @Post('invitations/:token/reject')
  @HttpCode(HttpStatus.OK)
  async rejectInvitation(@Param('token') token: string) {
    await this.invitationsService.reject(token);
    return { message: 'Invitation rejected' };
  }

  @Delete(':organizationId/invitations/:invitationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelInvitation(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Param('invitationId') invitationId: string,
  ) {
    await this.organizationsService.verifyPermission(organizationId, req.user.userId, [
      'owner',
      'admin',
    ]);
    return this.invitationsService.cancel(invitationId, organizationId);
  }

  @Post(':organizationId/invitations/:invitationId/resend')
  async resendInvitation(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Param('invitationId') invitationId: string,
  ) {
    await this.organizationsService.verifyPermission(organizationId, req.user.userId, [
      'owner',
      'admin',
    ]);
    await this.invitationsService.resend(invitationId, organizationId);
    return { message: 'Invitation resent successfully' };
  }

  @Get(':organizationId/invitations-statistics')
  async getInvitationStatistics(
    @Request() req,
    @Param('organizationId') organizationId: string,
  ) {
    await this.organizationsService.verifyMembership(organizationId, req.user.userId);
    return this.invitationsService.getStatistics(organizationId);
  }
}

