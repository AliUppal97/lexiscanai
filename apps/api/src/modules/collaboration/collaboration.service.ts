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
   * Apply document change with conflict resolution
   */
  async applyChange(
    documentId: string,
    userId: string,
    changeType: DocumentChangeType,
    position: number,
    content?: string,
  ): Promise<any> {
    // Get current document version
    const lastChange = await this.prisma.documentChange.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (lastChange?.version || 0) + 1;

    // Create change record
    const change = await this.prisma.documentChange.create({
      data: {
        documentId,
        userId,
        changeType,
        position,
        content,
        version: newVersion,
      },
    });

    return change;
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

