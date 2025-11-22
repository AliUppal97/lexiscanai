import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';
import { PresenceService } from './presence.service';
import { ConflictResolutionService } from './conflict-resolution.service';
import { DocumentChangeType } from '@prisma/client';

@WebSocketGateway({
  namespace: '/collaboration',
  cors: {
    origin: '*',
  },
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);
  private readonly rooms = new Map<string, Set<string>>(); // documentId -> Set of socketIds

  constructor(
    private collaborationService: CollaborationService,
    private presenceService: PresenceService,
    private conflictResolutionService: ConflictResolutionService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnection(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from all rooms
    for (const [documentId, sockets] of this.rooms.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        const userId = (client as any).userId;
        if (userId) {
          await this.collaborationService.leaveDocument(userId, documentId);
          // Notify others
          client.to(documentId).emit('userLeft', { userId });
        }
      }
    }
  }

  @SubscribeMessage('joinDocument')
  async handleDocumentJoin(
    @MessageBody() data: { documentId: string; userId: string; tenantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { documentId, userId, tenantId } = data;

    // Join room
    await client.join(documentId);
    (client as any).userId = userId;
    (client as any).documentId = documentId;

    // Track room membership
    if (!this.rooms.has(documentId)) {
      this.rooms.set(documentId, new Set());
    }
    this.rooms.get(documentId)!.add(client.id);

    // Join collaboration session
    await this.collaborationService.joinDocument(userId, documentId, tenantId);

    // Get active users
    const activeUsers = await this.collaborationService.getActiveUsers(documentId);

    // Notify others
    client.to(documentId).emit('userJoined', { userId, activeUsers });

    // Send current presence to client
    const presence = await this.presenceService.getPresence(documentId);
    client.emit('presenceUpdate', { presence });

    return { success: true, activeUsers };
  }

  @SubscribeMessage('leaveDocument')
  async handleDocumentLeave(
    @MessageBody() data: { documentId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { documentId, userId } = data;

    // Leave room
    await client.leave(documentId);
    if (this.rooms.has(documentId)) {
      this.rooms.get(documentId)!.delete(client.id);
    }

    // Leave collaboration session
    await this.collaborationService.leaveDocument(userId, documentId);

    // Notify others
    client.to(documentId).emit('userLeft', { userId });

    return { success: true };
  }

  @SubscribeMessage('cursorUpdate')
  async handleCursorUpdate(
    @MessageBody() data: { documentId: string; userId: string; cursor: any; selection?: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { documentId, userId, cursor, selection } = data;

    // Update presence
    await this.presenceService.updatePresence(documentId, userId, cursor, selection);

    // Broadcast to others in room
    client.to(documentId).emit('cursorUpdate', { userId, cursor, selection });

    return { success: true };
  }

  @SubscribeMessage('documentChange')
  async handleChange(
    @MessageBody()
    data: {
      documentId: string;
      userId: string;
      changeType: DocumentChangeType;
      position: number;
      content?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { documentId, userId, changeType, position, content } = data;

    // Get change history for conflict resolution
    const history = await this.collaborationService.getChangeHistory(documentId, 10);

    // Apply conflict resolution
    const resolvedChange = await this.conflictResolutionService.useOperationalTransform(
      { type: changeType, position, content },
      history,
    );

    // Apply change
    const change = await this.collaborationService.applyChange(
      documentId,
      userId,
      resolvedChange.type,
      resolvedChange.position,
      resolvedChange.content,
    );

    // Broadcast to others in room
    client.to(documentId).emit('documentChange', {
      id: change.id,
      userId,
      changeType,
      position: resolvedChange.position,
      content: resolvedChange.content,
      version: change.version,
      timestamp: change.timestamp,
    });

    return { success: true, change };
  }

  @SubscribeMessage('comment')
  async handleComment(
    @MessageBody() data: { documentId: string; userId: string; content: string; position?: any; threadId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { documentId, userId, content, position, threadId } = data;

    // Create comment (would use CommentService in production)
    const comment = {
      id: `comment-${Date.now()}`,
      documentId,
      userId,
      content,
      position,
      threadId,
      createdAt: new Date(),
    };

    // Broadcast to all in room
    this.server.to(documentId).emit('comment', comment);

    return { success: true, comment };
  }
}

