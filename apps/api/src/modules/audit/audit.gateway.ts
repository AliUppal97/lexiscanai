import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: 'audit', cors: true })
export class AuditGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AuditGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to audit: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from audit: ${client.id}`);
  }

  @SubscribeMessage('subscribeToTenant')
  handleSubscribe(client: Socket, tenantId: string) {
    client.join(`tenant:${tenantId}`);
    this.logger.log(`Client ${client.id} subscribed to tenant: ${tenantId}`);
  }

  emitAuditEvent(tenantId: string, event: any) {
    this.server.to(`tenant:${tenantId}`).emit('auditEvent', event);
  }
}

