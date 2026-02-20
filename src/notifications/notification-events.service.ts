import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationEventsService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  async onOrderCreated(order: any, customer: any, designer?: any, fabricSeller?: any): Promise<void> {
    await this.notificationsService.createNotification(
      customer.id,
      NotificationType.NEW_ORDER,
      'Order Placed',
      `Your order ${order.orderNumber} has been placed and is awaiting payment.`,
      { orderId: order.id, orderNumber: order.orderNumber },
    );
    await this.emailService.orderConfirmation(order, customer);

    if (designer) {
      await this.notificationsService.createNotification(
        designer.id,
        NotificationType.ORDER_ASSIGNED,
        'New Order Assigned',
        `Order ${order.orderNumber} has been assigned to you.`,
        { orderId: order.id, orderNumber: order.orderNumber },
      );
      await this.emailService.orderAssigned(order, designer);
    }

    if (fabricSeller) {
      await this.notificationsService.createNotification(
        fabricSeller.id,
        NotificationType.ORDER_ASSIGNED,
        'New Fabric Order',
        `A fabric order for ${order.orderNumber} requires your fulfillment.`,
        { orderId: order.id, orderNumber: order.orderNumber },
      );
      await this.emailService.orderAssigned(order, fabricSeller);
    }
  }

  async onPaymentReceived(order: any, customer: any): Promise<void> {
    await this.notificationsService.createNotification(
      customer.id,
      NotificationType.PAYMENT_RECEIVED,
      'Payment Confirmed',
      `Payment for order ${order.orderNumber} has been confirmed.`,
      { orderId: order.id, orderNumber: order.orderNumber },
    );
    await this.emailService.paymentReceived(order, customer);
  }

  async onPaymentFailed(order: any, customer: any): Promise<void> {
    await this.notificationsService.createNotification(
      customer.id,
      NotificationType.PAYMENT_FAILED,
      'Payment Failed',
      `Your payment for order ${order.orderNumber} failed. Please retry.`,
      { orderId: order.id, orderNumber: order.orderNumber },
    );
    await this.emailService.paymentFailed(order, customer);
  }

  async onOrderStatusChanged(order: any, oldStatus: string, newStatus: string, customer: any): Promise<void> {
    await this.notificationsService.createNotification(
      customer.id,
      NotificationType.ORDER_STATUS_CHANGE,
      'Order Status Updated',
      `Your order ${order.orderNumber} status changed to ${newStatus.replace(/_/g, ' ')}.`,
      { orderId: order.id, orderNumber: order.orderNumber, oldStatus, newStatus },
    );
    await this.emailService.orderStatusUpdate(order, oldStatus, newStatus, customer);
  }

  async onQaResult(order: any, passed: boolean, comments: string, customer: any, designer?: any): Promise<void> {
    await this.notificationsService.createNotification(
      customer.id,
      NotificationType.QA_RESULT,
      passed ? 'QA Inspection Passed' : 'QA Inspection Failed',
      passed
        ? `Your order ${order.orderNumber} passed QA and will be shipped soon.`
        : `QA inspection for order ${order.orderNumber} did not pass. It is being reviewed.`,
      { orderId: order.id, orderNumber: order.orderNumber, passed, comments },
    );
    await this.emailService.qaResult(order, passed, comments, customer);

    if (designer) {
      await this.notificationsService.createNotification(
        designer.id,
        NotificationType.QA_RESULT,
        passed ? 'QA Approved' : 'QA Rejected – Action Required',
        passed
          ? `Order ${order.orderNumber} passed QA inspection.`
          : `Order ${order.orderNumber} was rejected by QA. Please review comments.`,
        { orderId: order.id, orderNumber: order.orderNumber, passed, comments },
      );
      await this.emailService.qaResult(order, passed, comments, designer);
    }
  }

  async onPayoutCompleted(amount: number, user: any): Promise<void> {
    await this.notificationsService.createNotification(
      user.id,
      NotificationType.PAYOUT_COMPLETED,
      'Payout Sent',
      `A payout of $${amount.toFixed(2)} has been sent to your account.`,
      { amount },
    );
    await this.emailService.payoutCompleted(amount, user);
  }

  async onUserRegistered(user: any): Promise<void> {
    await this.notificationsService.createNotification(
      user.id,
      NotificationType.SYSTEM_ANNOUNCEMENT,
      'Welcome to African Fashion!',
      'Your account has been created. Start exploring our collection.',
      {},
    );
    await this.emailService.welcomeEmail(user);
  }
}
