import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { NotificationType } from './entities/notification.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class NotificationEventsService {
  private readonly logger = new Logger(NotificationEventsService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async onOrderStatusChanged(orderId: string, newStatus: OrderStatus): Promise<void> {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderId },
        relations: ['customer', 'design', 'design.designer', 'fabric', 'fabric.seller'],
      });
      if (!order) return;

      const customer = order.customer;

      switch (newStatus) {
        case OrderStatus.PAID: {
          // Notify customer
          await this.notificationsService.create(
            customer.id,
            NotificationType.PAYMENT,
            'Payment Received',
            `We've confirmed your payment for order ${order.orderNumber}. Your order is being processed.`,
            { orderId: order.id },
          );
          this.emailService.sendPaymentSuccess(
            customer.email,
            order.orderNumber,
            `$${order.totalPrice}`,
            'Payment Gateway',
          ).catch((e) => this.logger.error(e.message));

          // Notify designer
          const designer = order.design?.designer;
          if (designer) {
            await this.notificationsService.create(
              designer.id,
              NotificationType.ORDER_UPDATE,
              'New Order Received',
              `You have a new order ${order.orderNumber} ready for production.`,
              { orderId: order.id },
            );
            this.emailService.sendNewOrderNotification(designer.email, order.orderNumber, 'designer')
              .catch((e) => this.logger.error(e.message));
          }

          // Notify fabric seller
          const seller = order.fabric?.seller;
          if (seller) {
            await this.notificationsService.create(
              seller.id,
              NotificationType.ORDER_UPDATE,
              'New Fabric Order',
              `Order ${order.orderNumber} requires you to ship fabric to the designer.`,
              { orderId: order.id },
            );
            this.emailService.sendNewOrderNotification(seller.email, order.orderNumber, 'fabric_seller')
              .catch((e) => this.logger.error(e.message));
          }
          break;
        }

        case OrderStatus.IN_PRODUCTION: {
          await this.notificationsService.create(
            customer.id,
            NotificationType.ORDER_UPDATE,
            'Your Item is Being Crafted',
            `Great news! The designer has started crafting your order ${order.orderNumber}.`,
            { orderId: order.id },
          );
          this.emailService.sendOrderStatusUpdate(
            customer.email,
            order.orderNumber,
            'In Production',
            'Your item is now being crafted by our designer.',
          ).catch((e) => this.logger.error(e.message));
          break;
        }

        case OrderStatus.SHIPPED_TO_QA: {
          const qaUsers = await this.userRepo.find({ where: { role: UserRole.QA, isActive: true } });
          for (const qaUser of qaUsers) {
            await this.notificationsService.create(
              qaUser.id,
              NotificationType.ORDER_UPDATE,
              'New Item for Inspection',
              `Order ${order.orderNumber} has arrived and is ready for QA inspection.`,
              { orderId: order.id },
            );
          }
          break;
        }

        case OrderStatus.QA_APPROVED: {
          await this.notificationsService.create(
            customer.id,
            NotificationType.ORDER_UPDATE,
            'Quality Check Passed! ✅',
            `Your order ${order.orderNumber} has passed our quality inspection and will be shipped soon.`,
            { orderId: order.id },
          );
          this.emailService.sendOrderStatusUpdate(
            customer.email,
            order.orderNumber,
            'QA Approved',
            'Your item has passed our quality check and will be shipped to you shortly.',
          ).catch((e) => this.logger.error(e.message));
          break;
        }

        case OrderStatus.QA_REJECTED: {
          const designerForRejection = order.design?.designer;
          if (designerForRejection) {
            await this.notificationsService.create(
              designerForRejection.id,
              NotificationType.ORDER_UPDATE,
              'QA Rejected – Rework Needed',
              `Order ${order.orderNumber} has been rejected by QA. Please review the QA comments and rework the item.`,
              { orderId: order.id },
            );
            this.emailService.sendOrderStatusUpdate(
              designerForRejection.email,
              order.orderNumber,
              'QA Rejected',
              `The item for order ${order.orderNumber} did not pass QA inspection. Please check the QA comments and rework the item.`,
            ).catch((e) => this.logger.error(e.message));
          }
          break;
        }

        case OrderStatus.SHIPPED_TO_CUSTOMER: {
          const tracking = order.qaToCustomerTracking || 'N/A';
          await this.notificationsService.create(
            customer.id,
            NotificationType.ORDER_UPDATE,
            'Your Order Has Shipped! 🚚',
            `Your order ${order.orderNumber} is on its way! Tracking: ${tracking}`,
            { orderId: order.id, trackingNumber: tracking },
          );
          this.emailService.sendOrderStatusUpdate(
            customer.email,
            order.orderNumber,
            'Shipped',
            `Your order is on its way! Tracking number: ${tracking}`,
          ).catch((e) => this.logger.error(e.message));
          break;
        }

        case OrderStatus.DELIVERED: {
          await this.notificationsService.create(
            customer.id,
            NotificationType.ORDER_UPDATE,
            'Order Delivered! 🎉',
            `Your order ${order.orderNumber} has been delivered. We hope you love it!`,
            { orderId: order.id },
          );
          this.emailService.sendOrderStatusUpdate(
            customer.email,
            order.orderNumber,
            'Delivered',
            'Your order has been delivered. Thank you for shopping with African Fashion!',
          ).catch((e) => this.logger.error(e.message));

          // Notify admin for payout processing
          const admins = await this.userRepo.find({ where: { role: UserRole.ADMIN, isActive: true } });
          for (const admin of admins) {
            await this.notificationsService.create(
              admin.id,
              NotificationType.PAYOUT,
              'Process Payout',
              `Order ${order.orderNumber} has been delivered. Please process payouts for designers and sellers.`,
              { orderId: order.id },
            );
          }
          break;
        }

        default:
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to handle notification for order ${orderId}: ${error.message}`);
    }
  }
}
