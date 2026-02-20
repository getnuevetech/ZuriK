import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly emailService: EmailService,
  ) {}

  // ── In-app notification CRUD ──────────────────────────────────────────────

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<Notification> {
    const notification = this.notificationRepo.create({
      user: { id: userId },
      type,
      title,
      message,
      data: data ?? null,
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
      return this.notificationRepo.save(notification);
    }
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update(
      { user: { id: userId }, isRead: false },
      { isRead: true, readAt: new Date() },
    );
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

  // ── Email helpers (delegate to EmailService) ─────────────────────────────

  async sendOrderConfirmation(order: any, customer: any): Promise<void> {
    await this.emailService.sendOrderConfirmation(order, customer.email);
  }

  async notifyDesigner(order: any, designer: any): Promise<void> {
    if (designer?.id) {
      await this.createNotification(
        designer.id,
        NotificationType.NEW_ORDER,
        'New Order Received',
        `Order ${order.orderNumber} requires your attention.`,
        { orderId: order.id },
      );
    }
  }

  async notifyFabricSeller(order: any, seller: any): Promise<void> {
    if (seller?.id) {
      await this.createNotification(
        seller.id,
        NotificationType.NEW_ORDER,
        'New Fabric Order',
        `Order ${order.orderNumber} requires your fabric.`,
        { orderId: order.id },
      );
    }
  }

  async notifyQA(order: any, qaUser: any): Promise<void> {
    if (qaUser?.id) {
      await this.createNotification(
        qaUser.id,
        NotificationType.QA_RESULT,
        'QA Inspection Required',
        `Order ${order.orderNumber} is ready for QA inspection.`,
        { orderId: order.id },
      );
    }
  }

  async sendQAApproval(order: any, customer: any): Promise<void> {
    if (customer?.id) {
      await this.createNotification(
        customer.id,
        NotificationType.QA_RESULT,
        'Order Passed QA',
        `Your order ${order.orderNumber} has passed QA inspection and will be shipped soon.`,
        { orderId: order.id },
      );
    }
    if (customer?.email) {
      await this.emailService.sendOrderStatusUpdate(order, 'QA_APPROVED', customer.email);
    }
  }

  async sendQARejection(order: any, designer: any, seller: any, reason: string): Promise<void> {
    const message = `Order ${order.orderNumber} has been rejected by QA. Reason: ${reason}`;
    if (designer?.id) {
      await this.createNotification(designer.id, NotificationType.QA_RESULT, 'Order Rejected by QA', message, { orderId: order.id });
    }
    if (seller?.id) {
      await this.createNotification(seller.id, NotificationType.QA_RESULT, 'Order Rejected by QA', message, { orderId: order.id });
    }
  }

  async sendShippingNotification(order: any, customer: any, tracking: string): Promise<void> {
    if (customer?.id) {
      await this.createNotification(
        customer.id,
        NotificationType.ORDER_STATUS,
        'Order Shipped',
        `Your order ${order.orderNumber} has been shipped. Tracking: ${tracking}`,
        { orderId: order.id, tracking },
      );
    }
    if (customer?.email) {
      await this.emailService.sendOrderStatusUpdate(order, 'SHIPPED_TO_CUSTOMER', customer.email);
    }
  }

  async sendDeliveryConfirmation(order: any, customer: any): Promise<void> {
    if (customer?.id) {
      await this.createNotification(
        customer.id,
        NotificationType.ORDER_STATUS,
        'Order Delivered',
        `Your order ${order.orderNumber} has been delivered!`,
        { orderId: order.id },
      );
    }
    if (customer?.email) {
      await this.emailService.sendOrderStatusUpdate(order, 'DELIVERED', customer.email);
    }
  }

  // Delegate welcome/password-reset email methods
  async sendWelcomeEmail(user: { email: string; firstName?: string }): Promise<void> {
    await this.emailService.sendWelcomeEmail(user);
  }

  async sendPasswordResetEmail(user: { email: string; firstName?: string }, resetToken: string): Promise<void> {
    await this.emailService.sendPasswordResetEmail(user, resetToken);
  }
}
