import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationTriggersService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onOrderCreated(order: any, customer: User): Promise<void> {
    await this.notificationsService.create(
      customer.id,
      NotificationType.ORDER_STATUS_CHANGE,
      'Order Placed Successfully',
      `Order #${order.orderNumber} has been placed. Awaiting payment.`,
      { orderId: order.id, orderNumber: order.orderNumber },
    );
    await this.emailService.sendOrderConfirmation(customer, order);
  }

  async onPaymentReceived(order: any, customer: User): Promise<void> {
    await this.notificationsService.create(
      customer.id,
      NotificationType.PAYMENT_RECEIVED,
      'Payment Confirmed',
      `Payment confirmed for order #${order.orderNumber}.`,
      { orderId: order.id, orderNumber: order.orderNumber },
    );

    // Notify designer if present
    if (order.design?.designer) {
      const designer = order.design.designer as User;
      await this.notificationsService.create(
        designer.id,
        NotificationType.NEW_ORDER,
        'New Order Received',
        `New order #${order.orderNumber} requires your attention.`,
        { orderId: order.id, orderNumber: order.orderNumber },
      );
    }

    // Notify fabric sellers
    if (order.fabric?.seller) {
      const seller = order.fabric.seller as User;
      await this.notificationsService.create(
        seller.id,
        NotificationType.NEW_ORDER,
        'New Fabric Order',
        `New fabric order #${order.orderNumber} received.`,
        { orderId: order.id, orderNumber: order.orderNumber },
      );
    }
  }

  async onPaymentFailed(order: any, customer: User): Promise<void> {
    await this.notificationsService.create(
      customer.id,
      NotificationType.PAYMENT_FAILED,
      'Payment Failed',
      `Payment failed for order #${order.orderNumber}. Please try again.`,
      { orderId: order.id, orderNumber: order.orderNumber },
    );
  }

  async onShippedToQA(order: any): Promise<void> {
    const qaUsers = await this.userRepo.find({ where: { role: UserRole.QA, isActive: true } });
    for (const qa of qaUsers) {
      await this.notificationsService.create(
        qa.id,
        NotificationType.ORDER_STATUS_CHANGE,
        'Order Ready for Inspection',
        `Order #${order.orderNumber} is ready for QA inspection.`,
        { orderId: order.id, orderNumber: order.orderNumber },
      );
    }
  }

  async onQAApproved(order: any, customer: User, designer?: User): Promise<void> {
    await this.notificationsService.create(
      customer.id,
      NotificationType.QA_RESULT,
      'Quality Check Passed',
      `Order #${order.orderNumber} passed quality inspection.`,
      { orderId: order.id, orderNumber: order.orderNumber, passed: true },
    );
    await this.emailService.sendQAResult(customer, order, true);

    if (designer) {
      await this.notificationsService.create(
        designer.id,
        NotificationType.QA_RESULT,
        'Order Approved by QA',
        `Order #${order.orderNumber} passed quality inspection.`,
        { orderId: order.id, orderNumber: order.orderNumber, passed: true },
      );
    }
  }

  async onQARejected(order: any, designer?: User): Promise<void> {
    if (designer) {
      await this.notificationsService.create(
        designer.id,
        NotificationType.QA_RESULT,
        'QA Action Required',
        `Order #${order.orderNumber} failed QA — action needed.`,
        { orderId: order.id, orderNumber: order.orderNumber, passed: false },
      );
      await this.emailService.sendQAResult(designer, order, false);
    }
  }

  async onShippedToCustomer(order: any, customer: User, trackingNumber?: string): Promise<void> {
    await this.notificationsService.create(
      customer.id,
      NotificationType.ORDER_STATUS_CHANGE,
      'Order Shipped!',
      `Order #${order.orderNumber} is on its way!`,
      { orderId: order.id, orderNumber: order.orderNumber, trackingNumber },
    );
    await this.emailService.sendShippingNotification(customer, order, trackingNumber);
  }

  async onDelivered(order: any, customer: User): Promise<void> {
    await this.notificationsService.create(
      customer.id,
      NotificationType.ORDER_STATUS_CHANGE,
      'Order Delivered',
      `Order #${order.orderNumber} has been delivered.`,
      { orderId: order.id, orderNumber: order.orderNumber },
    );
    await this.emailService.sendOrderDelivered(customer, order);
  }

  async onPayoutCompleted(userId: string, user: User, amount: number, orderNumber?: string): Promise<void> {
    await this.notificationsService.create(
      userId,
      NotificationType.PAYOUT_COMPLETED,
      'Payout Processed',
      `Payout of $${Number(amount).toFixed(2)} has been processed.`,
      { amount, orderNumber },
    );
    await this.emailService.sendPayoutNotification(user, { amount, orderNumber });
  }
}
