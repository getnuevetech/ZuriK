export type NotificationType =
  | 'ORDER_STATUS_CHANGE'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'NEW_ORDER'
  | 'PAYOUT_COMPLETED'
  | 'QA_RESULT'
  | 'SYSTEM_ANNOUNCEMENT';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
}
