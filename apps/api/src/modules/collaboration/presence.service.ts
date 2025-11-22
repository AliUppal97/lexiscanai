import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Update user presence
   */
  async updatePresence(
    documentId: string,
    userId: string,
    cursorPosition?: { line: number; column: number },
    selection?: { start: number; end: number },
  ): Promise<void> {
    await this.prisma.presence.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId,
        },
      },
      update: {
        cursorPosition: cursorPosition || null,
        selection: selection || null,
        lastSeenAt: new Date(),
      },
      create: {
        documentId,
        userId,
        cursorPosition: cursorPosition || null,
        selection: selection || null,
      },
    });
  }

  /**
   * Get all presence for document
   */
  async getPresence(documentId: string): Promise<any[]> {
    return this.prisma.presence.findMany({
      where: { documentId },
    });
  }

  /**
   * Cleanup stale presence (users inactive for > 5 minutes)
   */
  async cleanupStalePresence(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await this.prisma.presence.deleteMany({
      where: {
        lastSeenAt: {
          lt: fiveMinutesAgo,
        },
      },
    });
  }
}

