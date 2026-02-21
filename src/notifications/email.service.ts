import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
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
      const from = this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER') || 'noreply@africanfashion.com';
      if (!this.configService.get('SMTP_USER') || !this.configService.get('SMTP_PASS')) {
        this.logger.warn(`Email not sent (SMTP not configured): ${subject} to ${to}`);
        return;
      }
      await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Email sent: ${subject} to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  private baseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>African Fashion Marketplace</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1e1b4b; padding: 24px 32px; text-align: center; }
    .header h1 { margin: 0; color: #fbbf24; font-size: 22px; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0; color: #c7d2fe; font-size: 13px; }
    .body { padding: 32px; color: #374151; }
    .body h2 { margin-top: 0; color: #1e1b4b; }
    .highlight { background: #fef3c7; border-left: 4px solid #fbbf24; padding: 12px 16px; border-radius: 4px; margin: 16px 0; }
    .btn { display: inline-block; background: #1e1b4b; color: #fff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { background: #f9fafb; padding: 16px 32px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>✦ African Fashion Marketplace</h1>
      <p>Authentic African fashion, crafted with love</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} African Fashion Marketplace. All rights reserved.</p>
      <p>You received this email because you have an account with us.</p>
    </div>
  </div>
</body>
</html>`;
  }

  async sendOrderConfirmation(user: any, order: any): Promise<void> {
    const content = `
      <h2>🎉 Order Confirmed!</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <p>Your order has been placed successfully. We'll start working on it right away!</p>
      <div class="highlight">
        <strong>Order Number:</strong> ${order.orderNumber}<br/>
        <strong>Total:</strong> $${Number(order.totalPrice).toFixed(2)}
      </div>
      <p>You can track your order status in your account dashboard.</p>`;
    await this.sendEmail(user.email, `Order Confirmation — ${order.orderNumber}`, this.baseTemplate(content));
  }

  async sendPaymentReceipt(user: any, payment: any): Promise<void> {
    const content = `
      <h2>💳 Payment Received</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <p>We've received your payment. Your order is now being processed.</p>
      <div class="highlight">
        <strong>Order Number:</strong> ${payment.orderNumber || payment.order?.orderNumber || 'N/A'}<br/>
        <strong>Amount:</strong> $${Number(payment.amount || 0).toFixed(2)}
      </div>`;
    await this.sendEmail(user.email, `Payment Confirmed — ${payment.orderNumber || ''}`, this.baseTemplate(content));
  }

  async sendShippingNotification(user: any, order: any, trackingNumber?: string): Promise<void> {
    const content = `
      <h2>📦 Your Order is on its Way!</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <p>Great news! Your order has been shipped and is on its way to you.</p>
      <div class="highlight">
        <strong>Order Number:</strong> ${order.orderNumber}<br/>
        ${trackingNumber ? `<strong>Tracking Number:</strong> ${trackingNumber}` : ''}
      </div>`;
    await this.sendEmail(user.email, `Order Shipped — ${order.orderNumber}`, this.baseTemplate(content));
  }

  async sendQAResult(user: any, order: any, passed: boolean): Promise<void> {
    const content = passed
      ? `<h2>✅ Quality Check Passed!</h2>
         <p>Hi ${user.firstName || user.email},</p>
         <p>Your order has passed quality inspection and will be shipped to you soon.</p>
         <div class="highlight"><strong>Order Number:</strong> ${order.orderNumber}</div>`
      : `<h2>⚠️ Quality Check — Action Required</h2>
         <p>Hi ${user.firstName || user.email},</p>
         <p>Your order requires attention after quality inspection. Please log in to review the details.</p>
         <div class="highlight"><strong>Order Number:</strong> ${order.orderNumber}${order.qaComments ? `<br/><strong>Comments:</strong> ${order.qaComments}` : ''}</div>`;
    const subject = passed
      ? `QA Approved — ${order.orderNumber}`
      : `QA Review Needed — ${order.orderNumber}`;
    await this.sendEmail(user.email, subject, this.baseTemplate(content));
  }

  async sendPayoutNotification(user: any, payout: any): Promise<void> {
    const content = `
      <h2>💰 Payout Processed!</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <p>Your payout has been processed and should arrive in your account soon.</p>
      <div class="highlight">
        <strong>Amount:</strong> $${Number(payout.amount || 0).toFixed(2)}
        ${payout.orderNumber ? `<br/><strong>Order:</strong> ${payout.orderNumber}` : ''}
      </div>`;
    await this.sendEmail(user.email, 'Payout Processed', this.baseTemplate(content));
  }

  async sendOrderDelivered(user: any, order: any): Promise<void> {
    const content = `
      <h2>🎊 Order Delivered!</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <p>Your order has been delivered. We hope you love it!</p>
      <div class="highlight"><strong>Order Number:</strong> ${order.orderNumber}</div>
      <p>If you have any questions or issues, please don't hesitate to contact us.</p>`;
    await this.sendEmail(user.email, `Order Delivered — ${order.orderNumber}`, this.baseTemplate(content));
  }

  async sendPasswordReset(user: User, resetUrl: string): Promise<void> {
    const html = this.baseTemplate(`
      <h2>Reset Your Password</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p style="color: #9ca3af; font-size: 14px; margin-top: 16px;">
        This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
    `);
    await this.sendEmail(user.email, 'Reset Your Password — African Fashion', html);
  }

  async sendEmailVerification(user: User, verifyUrl: string): Promise<void> {
    const html = this.baseTemplate(`
      <h2>Verify Your Email</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <p>Welcome to African Fashion! Please verify your email address to unlock all features:</p>
      <a href="${verifyUrl}" class="btn">Verify Email</a>
      <p style="color: #9ca3af; font-size: 14px; margin-top: 16px;">
        This link will expire in 24 hours.
      </p>
    `);
    await this.sendEmail(user.email, 'Verify Your Email — African Fashion', html);
  }

  async sendAccountLockout(user: User): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const html = this.baseTemplate(`
      <h2>Account Security Alert</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <div class="highlight">
        <strong>⚠️ Your account has been temporarily locked</strong> due to multiple failed login attempts.
      </div>
      <p>Your account will automatically unlock in 15 minutes. If you didn't attempt to log in, we recommend resetting your password immediately.</p>
      <a href="${frontendUrl}/forgot-password" class="btn">Reset Password</a>
    `);
    await this.sendEmail(user.email, '⚠️ Account Security Alert — African Fashion', html);
  }

  async sendAbandonedCartReminder(user: any, cart: { items: any[]; totalValue: number }): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const itemsHtml = cart.items
      .map((item: any) => `<li>${item.name ?? 'Item'} × ${item.quantity ?? 1} — $${Number(item.price ?? 0).toFixed(2)}</li>`)
      .join('');
    const content = `
      <h2>🛒 You left something behind!</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <p>You have items waiting in your cart. Don't let them slip away!</p>
      <div class="highlight">
        <ul style="margin:0;padding-left:18px;">${itemsHtml}</ul>
        <strong>Total:</strong> $${Number(cart.totalValue).toFixed(2)}
      </div>
      <a href="${frontendUrl}/cart" class="btn">Return to Cart</a>`;
    await this.sendEmail(user.email, "You left something behind! 🛒", this.baseTemplate(content));
  }

  async sendReviewRequest(user: any, product: any, order: any): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const content = `
      <h2>⭐ How was your order?</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <p>You recently received <strong>${product.name ?? 'your order'}</strong>. We'd love to hear what you think!</p>
      <div class="highlight"><strong>Order:</strong> ${order.orderNumber ?? ''}</div>
      <a href="${frontendUrl}/products/${product.id}#reviews" class="btn">Leave a Review</a>`;
    await this.sendEmail(user.email, "How was your order? Leave a review! ⭐", this.baseTemplate(content));
  }

  async sendBackInStockAlert(user: any, productName: string, productUrl: string): Promise<void> {
    const content = `
      <h2>🎉 Good news!</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <p><strong>${productName}</strong> is back in stock. Grab it before it sells out again!</p>
      <a href="${productUrl}" class="btn">Shop Now</a>`;
    await this.sendEmail(user.email, `Good news! ${productName} is back in stock 🎉`, this.baseTemplate(content));
  }

  async sendLoyaltyPointsEarned(user: any, points: number, description: string, newBalance: number): Promise<void> {
    const content = `
      <h2>🌟 You earned loyalty points!</h2>
      <p>Hi ${user.firstName || user.email},</p>
      <p>${description}</p>
      <div class="highlight">
        <strong>Points Earned:</strong> +${points}<br/>
        <strong>New Balance:</strong> ${newBalance} points
      </div>`;
    await this.sendEmail(user.email, `You earned ${points} loyalty points! 🌟`, this.baseTemplate(content));
  }
}
