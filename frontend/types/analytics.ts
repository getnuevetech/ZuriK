export interface AnalyticsOverview {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  activeFabrics: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalPrice: number;
    createdAt: string;
  }>;
}
