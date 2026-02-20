import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);

  private get secretKey(): string {
    return process.env.PAYSTACK_SECRET_KEY || '';
  }

  private get headers() {
    return { Authorization: `Bearer ${this.secretKey}` };
  }

  async initializeTransaction(
    email: string,
    amount: number,
    currency: string,
    reference: string,
    callbackUrl: string,
    metadata?: object,
  ): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: Math.round(amount * 100), // kobo
        currency,
        reference,
        callback_url: callbackUrl,
        metadata,
      },
      { headers: this.headers },
    );
    const data = response.data.data;
    return {
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference: data.reference,
    };
  }

  async verifyTransaction(reference: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    reference: string;
    gatewayResponse: string;
    data: object;
  }> {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      { headers: this.headers },
    );
    const data = response.data.data;
    return {
      status: data.status,
      amount: data.amount / 100,
      currency: data.currency,
      reference: data.reference,
      gatewayResponse: data.gateway_response,
      data,
    };
  }

  async createTransferRecipient(
    name: string,
    accountNumber: string,
    bankCode: string,
  ): Promise<{ recipientCode: string; data: object }> {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      { type: 'nuban', name, account_number: accountNumber, bank_code: bankCode, currency: 'NGN' },
      { headers: this.headers },
    );
    const data = response.data.data;
    return { recipientCode: data.recipient_code, data };
  }

  async initiateTransfer(
    amount: number,
    recipientCode: string,
    reason: string,
    reference: string,
  ): Promise<{ transferCode: string; data: object }> {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: 'balance',
        amount: Math.round(amount * 100),
        recipient: recipientCode,
        reason,
        reference,
      },
      { headers: this.headers },
    );
    const data = response.data.data;
    return { transferCode: data.transfer_code, data };
  }

  verifyWebhookSignature(body: Buffer, signature: string): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
    return hash === signature;
  }
}
