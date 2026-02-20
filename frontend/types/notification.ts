export type NotificationType = 'ORDER_STATUS' | 'PAYMENT' | 'PAYOUT' | 'SYSTEM' | 'QA_RESULT' | 'NEW_ORDER';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: { orderId?: string; link?: string; [key: string]: any };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}
