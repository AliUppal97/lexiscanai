import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnhancedJwtAuthGuard } from '../auth/enhanced-auth.guard';
import { CollaborationService } from './collaboration.service';
import { PresenceService } from './presence.service';

@ApiTags('Collaboration')
@ApiBearerAuth()
@Controller('documents/:documentId/collaboration')
@UseGuards(EnhancedJwtAuthGuard)
export class CollaborationController {
  constructor(
    private collaborationService: CollaborationService,
    private presenceService: PresenceService,
  ) {}

  @Get('collaborators')
  @ApiOperation({ summary: 'Get active collaborators' })
  @ApiResponse({ status: 200, description: 'List of active collaborators' })
  async getCollaborators(@Param('documentId') documentId: string): Promise<any> {
    const activeUsers = await this.collaborationService.getActiveUsers(documentId);
    const presence = await this.presenceService.getPresence(documentId);
    return { activeUsers, presence };
  }

  @Get('changes')
  @ApiOperation({ summary: 'Get change history' })
  @ApiResponse({ status: 200, description: 'Change history' })
  async getChanges(@Param('documentId') documentId: string): Promise<any[]> {
    return this.collaborationService.getChangeHistory(documentId);
  }
}

