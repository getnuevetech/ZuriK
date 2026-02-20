export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'PAYSTACK' | 'STRIPE';
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  order?: { id: string; orderNumber?: string };
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerTransactionId?: string;
  providerReference?: string;
  status: PaymentStatus;
  metadata?: object;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  user?: { id: string; firstName?: string; lastName?: string; email?: string };
  order?: { id: string; orderNumber?: string };
  amount: number;
  currency: string;
  status: PayoutStatus;
  provider?: string;
  providerPayoutId?: string;
  metadata?: object;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitiateResponse {
  paymentUrl: string;
  paymentId: string;
}

export interface PaymentVerifyResponse extends Payment {}
