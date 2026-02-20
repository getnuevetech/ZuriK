import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    const notification = this.notificationRepo.create({
      user: { id: userId },
      type,
      title,
      message,
      metadata: metadata ?? null,
      isRead: false,
      readAt: null,
    });
    return this.notificationRepo.save(notification);
  }

  async getNotificationsForUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ notifications: Notification[]; total: number; page: number; limit: number }> {
    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { notifications, total, page, limit };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { user: { id: userId }, isRead: false },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId },
      relations: ['user'],
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.user.id !== userId) throw new ForbiddenException('Access denied');
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.notificationRepo.save(notification);
    }
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where('"userId" = :userId AND "isRead" = false', { userId })
      .execute();
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId },
      relations: ['user'],
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.user.id !== userId) throw new ForbiddenException('Access denied');
    await this.notificationRepo.remove(notification);
  }
}
