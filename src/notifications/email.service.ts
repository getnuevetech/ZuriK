import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

const BRAND_COLOR = '#7C3AED';
const ACCENT_COLOR = '#D97706';

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>African Fashion</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:${BRAND_COLOR};padding:24px 32px;text-align:center;">
            <span style="color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:1px;">✦ African Fashion</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 24px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#faf7ff;padding:20px 32px;border-top:1px solid #ede9fe;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} African Fashion. All rights reserved.<br/>
              <a href="#" style="color:${ACCENT_COLOR};text-decoration:none;">Unsubscribe</a> from these emails.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private enabled: boolean;

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<string>('EMAIL_ENABLED') !== 'false';
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: Number(this.configService.get<string>('SMTP_PORT')) || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private async send(to: string, subject: string, html: string, text: string): Promise<void> {
    if (!this.enabled) return;
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    if (!smtpUser || !smtpPass) {
      this.logger.warn(`Email not sent (SMTP not configured): "${subject}" to ${to}`);
      return;
    }
    const from = this.configService.get<string>('SMTP_FROM') || `"African Fashion" <${smtpUser}>`;
    try {
      await this.transporter.sendMail({ from, to, subject, html, text });
      this.logger.log(`Email sent: "${subject}" to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
    }
  }

  async orderConfirmation(order: any, user: any): Promise<void> {
    const subject = `Order Confirmation – ${order.orderNumber}`;
    const html = emailLayout(`
      <h2 style="color:#1f2937;margin:0 0 16px;">🎉 Order Placed Successfully!</h2>
      <p style="color:#4b5563;">Hi ${user.firstName || user.email},</p>
      <p style="color:#4b5563;">Your order <strong>${order.orderNumber}</strong> has been placed and is awaiting payment.</p>
      <table width="100%" style="background:#faf7ff;border-radius:8px;padding:16px;margin:16px 0;" cellpadding="8">
        <tr><td style="color:#6b7280;font-size:14px;">Order Number</td><td style="font-weight:bold;">${order.orderNumber}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Total</td><td style="font-weight:bold;color:${BRAND_COLOR};">$${Number(order.totalPrice).toFixed(2)}</td></tr>
      </table>
      <p style="color:#4b5563;">Thank you for shopping with African Fashion!</p>
    `);
    const text = `Order Confirmed: ${order.orderNumber}. Total: $${Number(order.totalPrice).toFixed(2)}.`;
    await this.send(user.email, subject, html, text);
  }

  async paymentReceived(order: any, user: any): Promise<void> {
    const subject = `Payment Confirmed – ${order.orderNumber}`;
    const html = emailLayout(`
      <h2 style="color:#1f2937;margin:0 0 16px;">💳 Payment Confirmed</h2>
      <p style="color:#4b5563;">Hi ${user.firstName || user.email},</p>
      <p style="color:#4b5563;">We have received your payment for order <strong>${order.orderNumber}</strong>. Your order is now being processed.</p>
      <p style="color:#4b5563;">We will notify you when your order status changes.</p>
    `);
    const text = `Payment confirmed for order ${order.orderNumber}.`;
    await this.send(user.email, subject, html, text);
  }

  async paymentFailed(order: any, user: any): Promise<void> {
    const subject = `Payment Failed – ${order.orderNumber}`;
    const html = emailLayout(`
      <h2 style="color:#dc2626;margin:0 0 16px;">❌ Payment Failed</h2>
      <p style="color:#4b5563;">Hi ${user.firstName || user.email},</p>
      <p style="color:#4b5563;">Unfortunately your payment for order <strong>${order.orderNumber}</strong> could not be processed. Please retry or use a different payment method.</p>
    `);
    const text = `Payment failed for order ${order.orderNumber}. Please retry.`;
    await this.send(user.email, subject, html, text);
  }

  async orderStatusUpdate(order: any, oldStatus: string, newStatus: string, user: any): Promise<void> {
    const subject = `Order Status Update – ${order.orderNumber}`;
    const html = emailLayout(`
      <h2 style="color:#1f2937;margin:0 0 16px;">📦 Order Status Updated</h2>
      <p style="color:#4b5563;">Hi ${user.firstName || user.email},</p>
      <p style="color:#4b5563;">Your order <strong>${order.orderNumber}</strong> status has been updated.</p>
      <table width="100%" style="background:#faf7ff;border-radius:8px;padding:16px;margin:16px 0;" cellpadding="8">
        <tr><td style="color:#6b7280;font-size:14px;">Previous Status</td><td>${oldStatus.replace(/_/g, ' ')}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">New Status</td><td style="font-weight:bold;color:${BRAND_COLOR};">${newStatus.replace(/_/g, ' ')}</td></tr>
      </table>
    `);
    const text = `Your order ${order.orderNumber} status changed from ${oldStatus} to ${newStatus}.`;
    await this.send(user.email, subject, html, text);
  }

  async orderAssigned(order: any, assignee: any): Promise<void> {
    const subject = `New Order Assigned – ${order.orderNumber}`;
    const html = emailLayout(`
      <h2 style="color:#1f2937;margin:0 0 16px;">📋 New Order Assigned to You</h2>
      <p style="color:#4b5563;">Hi ${assignee.firstName || assignee.email},</p>
      <p style="color:#4b5563;">Order <strong>${order.orderNumber}</strong> has been assigned to you. Please log in to view the details.</p>
    `);
    const text = `New order ${order.orderNumber} has been assigned to you.`;
    await this.send(assignee.email, subject, html, text);
  }

  async qaResult(order: any, passed: boolean, comments: string, notifyUser: any): Promise<void> {
    const subject = passed
      ? `QA Approved – ${order.orderNumber}`
      : `QA Rejected – ${order.orderNumber}`;
    const html = emailLayout(`
      <h2 style="color:${passed ? '#16a34a' : '#dc2626'};margin:0 0 16px;">${passed ? '✅ QA Inspection Passed' : '❌ QA Inspection Failed'}</h2>
      <p style="color:#4b5563;">Hi ${notifyUser.firstName || notifyUser.email},</p>
      <p style="color:#4b5563;">The QA inspection for order <strong>${order.orderNumber}</strong> has ${passed ? 'passed' : 'failed'}.</p>
      ${comments ? `<p style="color:#4b5563;"><strong>Comments:</strong> ${comments}</p>` : ''}
    `);
    const text = `QA ${passed ? 'approved' : 'rejected'} order ${order.orderNumber}. ${comments}`;
    await this.send(notifyUser.email, subject, html, text);
  }

  async payoutCompleted(amount: number, user: any): Promise<void> {
    const subject = `Payout Sent – $${amount.toFixed(2)}`;
    const html = emailLayout(`
      <h2 style="color:#1f2937;margin:0 0 16px;">💰 Payout Sent!</h2>
      <p style="color:#4b5563;">Hi ${user.firstName || user.email},</p>
      <p style="color:#4b5563;">A payout of <strong>$${amount.toFixed(2)}</strong> has been sent to your account. It may take 1–3 business days to appear.</p>
    `);
    const text = `Payout of $${amount.toFixed(2)} has been sent.`;
    await this.send(user.email, subject, html, text);
  }

  async welcomeEmail(user: any): Promise<void> {
    const subject = 'Welcome to African Fashion! 🌍';
    const html = emailLayout(`
      <h2 style="color:#1f2937;margin:0 0 16px;">Welcome to African Fashion! 🌍</h2>
      <p style="color:#4b5563;">Hi ${user.firstName || user.email},</p>
      <p style="color:#4b5563;">Thank you for joining African Fashion — your destination for authentic African designs, premium fabrics, and renowned designers.</p>
      <p style="color:#4b5563;">Start exploring our collection and find your perfect style today!</p>
      <div style="margin:24px 0;">
        <a href="#" style="background:${BRAND_COLOR};color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Browse Collection</a>
      </div>
    `);
    const text = `Welcome to African Fashion, ${user.firstName || user.email}! Start browsing our collection.`;
    await this.send(user.email, subject, html, text);
  }
}
