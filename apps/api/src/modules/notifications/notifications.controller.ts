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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantId, UserId } from '../auth/auth.service';
import { NotificationService } from '../../services/notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.notificationService.getUserNotifications(userId, tenantId, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('unread-count')
  async getUnreadCount(@TenantId() tenantId: string, @UserId() userId: string) {
    const count = await this.notificationService.getUnreadCount(userId, tenantId);
    return { count };
  }

  @Put(':notificationId/read')
  async markAsRead(
    @UserId() userId: string,
    @Param('notificationId') notificationId: string,
  ) {
    await this.notificationService.markAsRead(notificationId, userId);
    return { success: true };
  }

  @Put('mark-all-read')
  async markAllAsRead(@TenantId() tenantId: string, @UserId() userId: string) {
    const count = await this.notificationService.markAllAsRead(userId, tenantId);
    return { count };
  }

  @Delete(':notificationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(
    @UserId() userId: string,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.deleteNotification(notificationId, userId);
  }

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  async sendNotification(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body()
    body: {
      title: string;
      message: string;
      type: string;
      targetUserId?: string;
      data?: any;
      channels?: string[];
    },
  ) {
    return this.notificationService.send({
      userId: body.targetUserId || userId,
      tenantId,
      title: body.title,
      message: body.message,
      type: body.type as any,
      data: body.data,
      channels: body.channels as any,
    });
  }
}

