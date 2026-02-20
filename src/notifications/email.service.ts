import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      const from = this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER');
      if (!from || !this.configService.get('SMTP_PASS')) {
        this.logger.warn(`Email not sent (SMTP not configured): "${subject}" to ${to}`);
        return;
      }
      await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Email sent: "${subject}" to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  private button(label: string, url: string): string {
    return `<p style="text-align:center;margin:24px 0"><a href="${url}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">${label}</a></p>`;
  }

  private layout(body: string): string {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0">
<div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
  <div style="background:#4f46e5;padding:24px 32px;text-align:center">
    <h1 style="color:#fbbf24;margin:0;font-size:22px">✦ African Fashion</h1>
  </div>
  <div style="padding:32px">${body}</div>
  <div style="background:#f3f4f6;padding:16px 32px;text-align:center;font-size:12px;color:#6b7280">
    <p style="margin:0">© ${new Date().getFullYear()} African Fashion. All rights reserved.</p>
    <p style="margin:4px 0 0"><a href="${frontendUrl}" style="color:#4f46e5">Visit our store</a> &nbsp;·&nbsp; <a href="${frontendUrl}/notifications" style="color:#4f46e5">Manage notifications</a></p>
  </div>
</div></body></html>`;
  }

  async sendOrderConfirmation(email: string, orderNumber: string, items: string, total: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const body = `<h2 style="color:#1f2937">🎉 Order Confirmed!</h2>
<p>Hi there! Your order <strong>${orderNumber}</strong> has been placed successfully.</p>
<p><strong>Items:</strong> ${items}</p>
<p><strong>Total:</strong> ${total}</p>
${this.button('View Order', `${frontendUrl}/orders`)}`;
    await this.send(email, `Order Confirmation – ${orderNumber}`, this.layout(body));
  }

  async sendPaymentSuccess(email: string, orderNumber: string, amount: string, provider: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const body = `<h2 style="color:#1f2937">💳 Payment Successful</h2>
<p>We've received your payment of <strong>${amount}</strong> via <strong>${provider}</strong> for order <strong>${orderNumber}</strong>.</p>
${this.button('View Order', `${frontendUrl}/orders`)}`;
    await this.send(email, `Payment Received – ${orderNumber}`, this.layout(body));
  }

  async sendPaymentFailed(email: string, orderNumber: string, retryUrl: string): Promise<void> {
    const body = `<h2 style="color:#dc2626">⚠️ Payment Failed</h2>
<p>Unfortunately, your payment for order <strong>${orderNumber}</strong> could not be processed.</p>
<p>Please retry your payment to complete the order.</p>
${this.button('Retry Payment', retryUrl)}`;
    await this.send(email, `Payment Failed – ${orderNumber}`, this.layout(body));
  }

  async sendOrderStatusUpdate(email: string, orderNumber: string, newStatus: string, message: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const body = `<h2 style="color:#1f2937">📦 Order Update</h2>
<p>Your order <strong>${orderNumber}</strong> status has been updated to <strong>${newStatus}</strong>.</p>
<p>${message}</p>
${this.button('View Order', `${frontendUrl}/orders`)}`;
    await this.send(email, `Order Update – ${orderNumber}`, this.layout(body));
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const body = `<h2 style="color:#1f2937">👋 Welcome to African Fashion, ${firstName}!</h2>
<p>We're thrilled to have you join our community of African fashion lovers.</p>
<p>Discover authentic designs, premium fabrics, and custom tailoring from talented African designers.</p>
${this.button('Start Shopping', frontendUrl)}`;
    await this.send(email, 'Welcome to African Fashion!', this.layout(body));
  }

  async sendNewOrderNotification(email: string, orderNumber: string, role: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const dashboardPath = role === 'designer' ? '/dashboard/designer' : role === 'fabric_seller' ? '/dashboard/fabric-seller' : '/dashboard';
    const body = `<h2 style="color:#1f2937">🛍️ New Order Received</h2>
<p>You have a new order <strong>${orderNumber}</strong> that requires your attention.</p>
${this.button('View Dashboard', `${frontendUrl}${dashboardPath}`)}`;
    await this.send(email, `New Order – ${orderNumber}`, this.layout(body));
  }

  async sendPayoutNotification(email: string, amount: string, orderNumber: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const body = `<h2 style="color:#1f2937">💰 Payout Processed</h2>
<p>Your payout of <strong>${amount}</strong> for order <strong>${orderNumber}</strong> has been processed.</p>
${this.button('View Dashboard', `${frontendUrl}/dashboard`)}`;
    await this.send(email, `Payout Processed – ${orderNumber}`, this.layout(body));
  }
}
