import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnhancedJwtAuthGuard } from '../auth/enhanced-auth.guard';
import { CollaborationService } from './collaboration.service';
import { PresenceService } from './presence.service';
import { CommentService } from './comment.service';
import { CommentService } from './comment.service';

@ApiTags('Collaboration')
@ApiBearerAuth()
@Controller('documents/:documentId/collaboration')
@UseGuards(EnhancedJwtAuthGuard)
export class CollaborationController {
  constructor(
    private collaborationService: CollaborationService,
    private presenceService: PresenceService,
    private commentService: CommentService,
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
  async getChanges(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ): Promise<any[]> {
    return this.collaborationService.getChangeHistory(documentId);
  }

  @Post('changes')
  @ApiOperation({ summary: 'Apply document change with OT' })
  async applyChange(
    @Request() req: any,
    @Param('documentId') documentId: string,
    @Body() dto: { changeType: string; position: number; content?: string; metadata?: any },
  ): Promise<any> {
    const userId = req.user.id;
    return this.collaborationService.applyChange(
      documentId,
      userId,
      dto.changeType as any,
      dto.position,
      dto.content,
      dto.metadata,
    );
  }

  @Get('changes/replay')
  @ApiOperation({ summary: 'Replay changes' })
  async replayChanges(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ): Promise<any[]> {
    const fromVersion = req.query.fromVersion ? parseInt(req.query.fromVersion) : 1;
    const toVersion = req.query.toVersion ? parseInt(req.query.toVersion) : undefined;
    return this.collaborationService.replayChanges(documentId, fromVersion, toVersion || fromVersion + 10);
  }

  @Post('comments')
  @ApiOperation({ summary: 'Create comment' })
  async createComment(
    @Request() req: any,
    @Param('documentId') documentId: string,
    @Body() dto: { content: string; position?: any; threadId?: string },
  ): Promise<any> {
    const userId = req.user.id;
    return this.commentService.createComment(documentId, userId, dto.content, dto.position, dto.threadId);
  }

  @Get('comments')
  @ApiOperation({ summary: 'Get comments' })
  async getComments(@Param('documentId') documentId: string): Promise<any[]> {
    return this.commentService.getComments(documentId);
  }

  @Get('comments/:threadId')
  @ApiOperation({ summary: 'Get comment thread' })
  async getCommentThread(
    @Param('documentId') documentId: string,
    @Param('threadId') threadId: string,
  ): Promise<any> {
    const comments = await this.commentService.getCommentThread(documentId, threadId);
    return { threadId, comments };
  }

  @Put('comments/:commentId/resolve')
  @ApiOperation({ summary: 'Resolve comment' })
  async resolveComment(
    @Param('documentId') documentId: string,
    @Param('commentId') commentId: string,
  ): Promise<any> {
    return this.commentService.resolveComment(commentId);
  }
}

