import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create comment
   */
  async createComment(
    documentId: string,
    userId: string,
    content: string,
    position?: any,
    threadId?: string,
  ): Promise<Comment> {
    const comment = await this.prisma.comment.create({
      data: {
        documentId,
        userId,
        content,
        position: position || null,
        threadId: threadId || null,
        resolved: false,
      },
    });

    return comment;
  }

  /**
   * Get comments for document
   */
  async getComments(documentId: string): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: {
        documentId,
        resolved: false, // Only show unresolved comments by default
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get comment thread
   */
  async getCommentThread(documentId: string, threadId: string): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: {
        documentId,
        threadId,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Resolve comment
   */
  async resolveComment(commentId: string): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { resolved: true },
    });
  }

  /**
   * Get comment by ID
   */
  async getComment(commentId: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
      where: { id: commentId },
    });
  }
}

