import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);

  constructor(private readonly configService: ConfigService) {}

  private get secretKey(): string {
    return this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
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
    const { data } = response.data;
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
    paidAt: string;
    metadata: object;
  }> {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      { headers: this.headers },
    );
    const { data } = response.data;
    return {
      status: data.status,
      amount: data.amount / 100,
      currency: data.currency,
      reference: data.reference,
      paidAt: data.paid_at,
      metadata: data.metadata,
    };
  }

  async createTransferRecipient(
    name: string,
    accountNumber: string,
    bankCode: string,
  ): Promise<string> {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      {
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      },
      { headers: this.headers },
    );
    return response.data.data.recipient_code;
  }

  async initiateTransfer(
    amount: number,
    recipientCode: string,
    reason: string,
    reference: string,
  ): Promise<{ transferCode: string; status: string }> {
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
    const { data } = response.data;
    return { transferCode: data.transfer_code, status: data.status };
  }
}
