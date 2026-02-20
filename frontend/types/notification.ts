export interface Notification {
  id: string;
  type: 'ORDER_UPDATE' | 'PAYMENT' | 'SYSTEM' | 'PAYOUT';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: { orderId?: string; link?: string; [key: string]: any };
  createdAt: string;
}
