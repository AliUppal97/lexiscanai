import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DocumentChangeType, CollaborationSession } from '@prisma/client';

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Join document collaboration session
   */
  async joinDocument(userId: string, documentId: string, tenantId: string): Promise<CollaborationSession> {
    let session = await this.prisma.collaborationSession.findUnique({
      where: { documentId },
    });

    if (!session) {
      session = await this.prisma.collaborationSession.create({
        data: {
          documentId,
          tenantId,
          activeUsers: [userId],
        },
      });
    } else {
      // Add user to active users if not already present
      const activeUsers = (session.activeUsers as string[]) || [];
      if (!activeUsers.includes(userId)) {
        activeUsers.push(userId);
        session = await this.prisma.collaborationSession.update({
          where: { documentId },
          data: { activeUsers },
        });
      }
    }

    return session;
  }

  /**
   * Leave document collaboration session
   */
  async leaveDocument(userId: string, documentId: string): Promise<void> {
    const session = await this.prisma.collaborationSession.findUnique({
      where: { documentId },
    });

    if (session) {
      const activeUsers = ((session.activeUsers as string[]) || []).filter((id) => id !== userId);
      await this.prisma.collaborationSession.update({
        where: { documentId },
        data: { activeUsers },
      });
    }
  }

  /**
   * Apply document change with Operational Transform
   */
  async applyChange(
    documentId: string,
    userId: string,
    changeType: DocumentChangeType,
    position: number,
    content?: string,
    metadata?: any,
  ): Promise<any> {
    // Get recent changes for OT
    const recentChanges = await this.prisma.documentChange.findMany({
      where: { documentId },
      orderBy: { version: 'desc' },
      take: 10, // Last 10 changes for OT
    });

    // Transform change using OT
    const { ConflictResolutionService } = await import('./conflict-resolution.service');
    const conflictService = new ConflictResolutionService();
    let transformedChange = { type: changeType, position, content };

    for (const historicalChange of recentChanges.reverse()) {
      transformedChange = await conflictService.useOperationalTransform(
        transformedChange,
        [historicalChange],
      );
    }

    // Get current document version
    const lastChange = recentChanges[0];
    const newVersion = (lastChange?.version || 0) + 1;

    // Create change record
    const change = await this.prisma.documentChange.create({
      data: {
        documentId,
        userId,
        changeType: transformedChange.type,
        position: transformedChange.position,
        content: transformedChange.content || content,
        version: newVersion,
        metadata: metadata || {},
      },
    });

    return change;
  }

  /**
   * Get change history with version range
   */
  async getChangeHistory(
    documentId: string,
    startVersion?: number,
    endVersion?: number,
  ): Promise<any[]> {
    const where: any = { documentId };
    if (startVersion !== undefined || endVersion !== undefined) {
      where.version = {};
      if (startVersion !== undefined) {
        where.version.gte = startVersion;
      }
      if (endVersion !== undefined) {
        where.version.lte = endVersion;
      }
    }

    return this.prisma.documentChange.findMany({
      where,
      orderBy: { version: 'asc' },
    });
  }

  /**
   * Replay changes to reconstruct document state
   */
  async replayChanges(
    documentId: string,
    fromVersion: number,
    toVersion: number,
  ): Promise<Array<{ version: number; change: any }>> {
    const changes = await this.getChangeHistory(documentId, fromVersion, toVersion);
    return changes.map((change) => ({
      version: change.version,
      change: {
        type: change.changeType,
        position: change.position,
        content: change.content,
        timestamp: change.timestamp,
      },
    }));
  }

  /**
   * Resolve conflict between two changes
   */
  async resolveConflict(
    documentId: string,
    change1: { type: DocumentChangeType; position: number; content?: string },
    change2: { type: DocumentChangeType; position: number; content?: string },
  ): Promise<{ change1: any; change2: any }> {
    const { ConflictResolutionService } = await import('./conflict-resolution.service');
    const conflictService = new ConflictResolutionService();

    // Get current document state
    const document = await this.getDocumentState(documentId);

    return conflictService.resolveConflict(document, change1, change2);
  }

  /**
   * Get current document state
   */
  private async getDocumentState(documentId: string): Promise<string> {
    // In production, would fetch actual document content
    // For now, return empty string as placeholder
    return '';
  }

  /**
   * Get active users in document
   */
  async getActiveUsers(documentId: string): Promise<string[]> {
    const session = await this.prisma.collaborationSession.findUnique({
      where: { documentId },
    });

    return (session?.activeUsers as string[]) || [];
  }

  /**
   * Broadcast change to all users
   */
  async broadcastChange(documentId: string, change: any): Promise<void> {
    // This will be handled by the WebSocket gateway
    this.logger.debug(`Broadcasting change for document ${documentId}`);
  }

  /**
   * Get change history
   */
  async getChangeHistory(documentId: string, limit: number = 100): Promise<any[]> {
    return this.prisma.documentChange.findMany({
      where: { documentId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}

