import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: Number(this.configService.get('SMTP_PORT')) || 587,
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const from = this.configService.get('SMTP_USER') || 'noreply@africanfashion.com';
      if (!from || !this.configService.get('SMTP_PASS')) {
        this.logger.warn(`Email not sent (SMTP not configured): ${subject} to ${to}`);
        return;
      }
      await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Email sent: ${subject} to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  async sendOrderConfirmation(order: any, customer: any): Promise<void> {
    await this.sendEmail(
      customer.email,
      `Order Confirmation - ${order.orderNumber}`,
      `<h2>Order Confirmed!</h2><p>Your order ${order.orderNumber} has been placed successfully.</p><p>Total: $${order.totalAmount}</p>`,
    );
  }

  async notifyDesigner(order: any, designer: any): Promise<void> {
    await this.sendEmail(
      designer.email,
      `New Order - ${order.orderNumber}`,
      `<h2>New Order Received</h2><p>Order ${order.orderNumber} requires your attention.</p>`,
    );
  }

  async notifyFabricSeller(order: any, seller: any): Promise<void> {
    await this.sendEmail(
      seller.email,
      `New Fabric Order - ${order.orderNumber}`,
      `<h2>New Fabric Order</h2><p>Order ${order.orderNumber} requires your fabric.</p>`,
    );
  }

  async notifyQA(order: any, qaUser: any): Promise<void> {
    await this.sendEmail(
      qaUser.email,
      `QA Inspection Required - ${order.orderNumber}`,
      `<h2>QA Inspection Required</h2><p>Order ${order.orderNumber} is ready for QA inspection.</p>`,
    );
  }

  async sendQAApproval(order: any, customer: any): Promise<void> {
    await this.sendEmail(
      customer.email,
      `Order Approved - ${order.orderNumber}`,
      `<h2>Great News!</h2><p>Your order ${order.orderNumber} has passed QA inspection and will be shipped soon.</p>`,
    );
  }

  async sendQARejection(order: any, designer: any, seller: any, reason: string): Promise<void> {
    const html = `<h2>Order Rejected</h2><p>Order ${order.orderNumber} has been rejected by QA.</p><p>Reason: ${reason}</p>`;
    if (designer) await this.sendEmail(designer.email, `Order Rejected - ${order.orderNumber}`, html);
    if (seller) await this.sendEmail(seller.email, `Order Rejected - ${order.orderNumber}`, html);
  }

  async sendShippingNotification(order: any, customer: any, tracking: string): Promise<void> {
    await this.sendEmail(
      customer.email,
      `Order Shipped - ${order.orderNumber}`,
      `<h2>Your Order is on its Way!</h2><p>Order ${order.orderNumber} has been shipped.</p><p>Tracking: ${tracking}</p>`,
    );
  }

  async sendDeliveryConfirmation(order: any, customer: any): Promise<void> {
    await this.sendEmail(
      customer.email,
      `Order Delivered - ${order.orderNumber}`,
      `<h2>Order Delivered!</h2><p>Your order ${order.orderNumber} has been delivered.</p>`,
    );
  }
}
