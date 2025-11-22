import { Module } from '@nestjs/common';
import { CollaborationController } from './collaboration.controller';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from './collaboration.service';
import { PresenceService } from './presence.service';
import { ConflictResolutionService } from './conflict-resolution.service';
import { CommentService } from './comment.service';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CollaborationController],
  providers: [
    CollaborationGateway,
    CollaborationService,
    PresenceService,
    ConflictResolutionService,
    CommentService,
    PrismaService,
  ],
  exports: [CollaborationService, PresenceService],
})
export class CollaborationModule {}

