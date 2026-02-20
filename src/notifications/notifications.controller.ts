import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { RequestWithUser } from '../auth/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(
    @Request() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getNotificationsForUser(
      req.user.id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get('unread-count')
  async unreadCount(@Request() req: RequestWithUser) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: RequestWithUser) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true };
  }

  @Patch(':id/read')
  markAsRead(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Delete(':id')
  async deleteNotification(@Request() req: RequestWithUser, @Param('id') id: string) {
    await this.notificationsService.deleteNotification(id, req.user.id);
    return { success: true };
  }
}
