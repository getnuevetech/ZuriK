import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
        port: Number(this.configService.get<string>('SMTP_PORT')) || 587,
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
      });
    }
  }

  async sendEmail(to: string, subject: string, htmlBody: string, textBody?: string): Promise<void> {
    const fromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'African Fashion';
    const fromAddress =
      this.configService.get<string>('EMAIL_FROM_ADDRESS') ||
      this.configService.get<string>('SMTP_USER') ||
      'noreply@africanfashion.com';

    if (!this.transporter) {
      this.logger.warn(`Email not sent (SMTP not configured): "${subject}" to ${to}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to,
        subject,
        html: htmlBody,
        text: textBody,
      });
      this.logger.log(`Email sent: "${subject}" to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
    }
  }

  private baseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#312e81;padding:24px 32px;">
          <span style="color:#fbbf24;font-size:20px;font-weight:bold;">✦ African Fashion</span>
        </td></tr>
        <tr><td style="padding:32px;">${content}</td></tr>
        <tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">© African Fashion Platform. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  async sendWelcomeEmail(user: { email: string; firstName?: string }): Promise<void> {
    const name = user.firstName || 'Valued Customer';
    await this.sendEmail(
      user.email,
      'Welcome to African Fashion!',
      this.baseTemplate(`
        <h2 style="color:#312e81;margin-top:0;">Welcome, ${name}! 🎉</h2>
        <p style="color:#374151;">Thank you for joining the African Fashion platform. Discover authentic African designs and fabrics from talented designers across the continent.</p>
        <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/products"
           style="display:inline-block;background:#312e81;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px;">
          Start Shopping
        </a>
      `),
    );
  }

  async sendOrderConfirmation(order: any, customerEmail: string): Promise<void> {
    await this.sendEmail(
      customerEmail,
      `Order Confirmation – ${order.orderNumber}`,
      this.baseTemplate(`
        <h2 style="color:#312e81;margin-top:0;">Order Confirmed! 📦</h2>
        <p style="color:#374151;">Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;margin:16px 0;">
          <tr style="background:#f9fafb;">
            <td style="color:#6b7280;font-size:13px;">Order Number</td>
            <td style="font-weight:bold;">${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:13px;">Order Type</td>
            <td>${order.orderType || '—'}</td>
          </tr>
          <tr style="background:#f9fafb;">
            <td style="color:#6b7280;font-size:13px;">Total</td>
            <td style="font-weight:bold;color:#312e81;">$${Number(order.totalPrice || 0).toFixed(2)}</td>
          </tr>
        </table>
        <p style="color:#374151;">We'll keep you updated as your order progresses.</p>
      `),
    );
  }

  async sendPaymentConfirmation(order: any, customerEmail: string): Promise<void> {
    await this.sendEmail(
      customerEmail,
      `Payment Confirmed – ${order.orderNumber}`,
      this.baseTemplate(`
        <h2 style="color:#312e81;margin-top:0;">Payment Received! 💳</h2>
        <p style="color:#374151;">We've received your payment for order <strong>${order.orderNumber}</strong>.</p>
        <p style="color:#374151;">Amount: <strong style="color:#312e81;">$${Number(order.totalPrice || 0).toFixed(2)}</strong></p>
        <p style="color:#374151;">Your order is now being processed.</p>
      `),
    );
  }

  async sendOrderStatusUpdate(
    order: any,
    newStatus: string,
    recipientEmail: string,
  ): Promise<void> {
    const statusLabel = newStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    await this.sendEmail(
      recipientEmail,
      `Order Status Update – ${order.orderNumber}`,
      this.baseTemplate(`
        <h2 style="color:#312e81;margin-top:0;">Order Status Updated</h2>
        <p style="color:#374151;">Your order <strong>${order.orderNumber}</strong> status has been updated to:</p>
        <div style="background:#ede9fe;border-left:4px solid #312e81;padding:12px 16px;border-radius:4px;margin:16px 0;">
          <strong style="color:#312e81;">${statusLabel}</strong>
        </div>
        ${order.qaComments ? `<p style="color:#374151;"><strong>Comments:</strong> ${order.qaComments}</p>` : ''}
      `),
    );
  }

  async sendPayoutNotification(payout: any, sellerEmail: string): Promise<void> {
    await this.sendEmail(
      sellerEmail,
      'Payout Processed',
      this.baseTemplate(`
        <h2 style="color:#312e81;margin-top:0;">Payout Processed! 💰</h2>
        <p style="color:#374151;">Your payout of <strong style="color:#312e81;">$${Number(payout.amount || 0).toFixed(2)}</strong> has been processed.</p>
        <p style="color:#374151;">It should reflect in your account within 2–5 business days.</p>
      `),
    );
  }

  async sendPasswordResetEmail(user: { email: string; firstName?: string }, resetToken: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    await this.sendEmail(
      user.email,
      'Reset Your Password',
      this.baseTemplate(`
        <h2 style="color:#312e81;margin-top:0;">Password Reset Request</h2>
        <p style="color:#374151;">Hi ${user.firstName || 'there'}, we received a request to reset your password.</p>
        <a href="${resetLink}"
           style="display:inline-block;background:#312e81;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#9ca3af;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      `),
    );
  }
}
