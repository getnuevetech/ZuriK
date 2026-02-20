export type PaymentProvider = 'PAYSTACK' | 'STRIPE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  providerTransactionId?: string;
  providerReference?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitiateResponse {
  paymentId: string;
  paymentUrl: string;
  provider: PaymentProvider;
}

export interface PaymentVerifyResponse {
  success: boolean;
  payment: Payment;
}

export interface Payout {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  provider?: string;
  providerPayoutId?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}
