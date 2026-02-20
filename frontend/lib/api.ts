import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  Product, Fabric, Order, OrderStatus,
  CreateCustomDesignOrderDto, CreateReadyToWearOrderDto, CreateFabricOnlyOrderDto,
  User, PlatformSettings, HeroBanner, AnalyticsOverview,
  Payment, Payout, PaymentInitiateResponse, PaymentProvider,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// --- Types ---
export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { email: string; password: string; firstName: string; lastName: string; role?: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; user: UserProfile; }
export interface UserProfile { id: string; email: string; firstName: string; lastName: string; role: string; }
export interface RefreshResponse { accessToken: string; refreshToken: string; }

export interface ProductFilters {
  category?: string;
  country?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface FabricFilters {
  material?: string;
  color?: string;
  country?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  pattern?: string;
  inStock?: boolean;
}

export interface OrderFilters {
  status?: string;
  orderType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
}

// --- Axios instance ---
const api: AxiosInstance = axios.create({ baseURL: API_URL });

// Request interceptor: attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else if (token !== null) {
      p.resolve(token);
    } else {
      p.reject(new Error('No token available'));
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post<RefreshResponse>(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth API ---
export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload).then((r) => r.data),
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload).then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post<RefreshResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),
  getProfile: () =>
    api.get<UserProfile>('/auth/profile').then((r) => r.data),
};

// --- Products API ---
export const productsApi = {
  list: (filters?: ProductFilters): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.country) params.set('country', filters.country);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters?.sort) params.set('sort', filters.sort);
    const query = params.toString();
    return api.get<Product[]>(`/products${query ? `?${query}` : ''}`).then((r) => r.data);
  },
  get: (id: string): Promise<Product> => api.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (data: Partial<Product>): Promise<Product> =>
    api.post<Product>('/products', data).then((r) => r.data),
  update: (id: string, data: Partial<Product>): Promise<Product> =>
    api.patch<Product>(`/products/${id}`, data).then((r) => r.data),
  delete: (id: string): Promise<void> =>
    api.delete(`/products/${id}`).then(() => undefined),
  toggleActive: (id: string): Promise<Product> =>
    api.patch<Product>(`/products/${id}/toggle-active`).then((r) => r.data),
};

// --- Fabrics API ---
export const fabricsApi = {
  list: (filters?: FabricFilters): Promise<Fabric[]> => {
    const params = new URLSearchParams();
    if (filters?.material) params.set('material', filters.material);
    if (filters?.color) params.set('color', filters.color);
    if (filters?.country) params.set('country', filters.country);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters?.pattern) params.set('pattern', filters.pattern);
    const query = params.toString();
    return api.get<Fabric[]>(`/fabrics${query ? `?${query}` : ''}`).then((r) => r.data);
  },
  get: (id: string): Promise<Fabric> => api.get<Fabric>(`/fabrics/${id}`).then((r) => r.data),
  create: (data: Partial<Fabric>): Promise<Fabric> =>
    api.post<Fabric>('/fabrics', data).then((r) => r.data),
  update: (id: string, data: Partial<Fabric>): Promise<Fabric> =>
    api.patch<Fabric>(`/fabrics/${id}`, data).then((r) => r.data),
  delete: (id: string): Promise<void> =>
    api.delete(`/fabrics/${id}`).then(() => undefined),
  updateStock: (id: string, stock: number): Promise<Fabric> =>
    api.patch<Fabric>(`/fabrics/${id}`, { stock }).then((r) => r.data),
};

// --- Designers API ---
export const designersApi = {
  list: () => api.get('/users?role=designer').then((r) => r.data),
};

// --- Users API ---
export const usersApi = {
  list: (filters?: UserFilters): Promise<User[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
    const query = params.toString();
    return api.get<User[]>(`/users${query ? `?${query}` : ''}`).then((r) => r.data);
  },
  getById: (id: string): Promise<User> => api.get<User>(`/users/${id}`).then((r) => r.data),
  update: (id: string, data: Partial<User>): Promise<User> =>
    api.patch<User>(`/users/${id}`, data).then((r) => r.data),
  delete: (id: string): Promise<void> =>
    api.delete(`/users/${id}`).then(() => undefined),
  changeRole: (id: string, role: string): Promise<User> =>
    api.patch<User>(`/users/${id}`, { role }).then((r) => r.data),
  toggleActive: (id: string, isActive: boolean): Promise<User> =>
    api.patch<User>(`/users/${id}`, { isActive }).then((r) => r.data),
  create: (data: Partial<User> & { password: string }): Promise<User> =>
    api.post<User>('/users', data).then((r) => r.data),
};

// --- Orders API ---
export const ordersApi = {
  createCustomDesign: (data: CreateCustomDesignOrderDto): Promise<Order> =>
    api.post<Order>('/orders/custom-design', data).then((r) => r.data),
  createReadyToWear: (data: CreateReadyToWearOrderDto): Promise<Order> =>
    api.post<Order>('/orders/ready-to-wear', data).then((r) => r.data),
  createFabricOnly: (data: CreateFabricOnlyOrderDto): Promise<Order> =>
    api.post<Order>('/orders/fabric-only', data).then((r) => r.data),
  getMyOrders: (): Promise<Order[]> => api.get<Order[]>('/orders').then((r) => r.data),
  getOrder: (id: string): Promise<Order> => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  listAll: (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.orderType) params.set('orderType', filters.orderType);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    const query = params.toString();
    return api.get<Order[]>(`/orders/all${query ? `?${query}` : ''}`).then((r) => r.data);
  },
  updateStatus: (id: string, status: OrderStatus, notes?: string): Promise<Order> =>
    api.patch<Order>(`/orders/${id}/status`, { status, notes }).then((r) => r.data),
};

// --- Hero Banners API ---
export const heroBannersApi = {
  listActive: (): Promise<HeroBanner[]> =>
    api.get<HeroBanner[]>('/hero-banners').then((r) => r.data),
  list: (): Promise<HeroBanner[]> =>
    api.get<HeroBanner[]>('/hero-banners/all').then((r) => r.data),
  create: (data: Partial<HeroBanner>): Promise<HeroBanner> =>
    api.post<HeroBanner>('/hero-banners', data).then((r) => r.data),
  update: (id: string, data: Partial<HeroBanner>): Promise<HeroBanner> =>
    api.patch<HeroBanner>(`/hero-banners/${id}`, data).then((r) => r.data),
  delete: (id: string): Promise<void> =>
    api.delete(`/hero-banners/${id}`).then(() => undefined),
};

// --- Settings API ---
export const settingsApi = {
  get: (): Promise<PlatformSettings> =>
    api.get<PlatformSettings>('/settings').then((r) => r.data),
  update: (data: Partial<PlatformSettings>): Promise<PlatformSettings> =>
    api.patch<PlatformSettings>('/settings', data).then((r) => r.data),
};

// --- Upload API ---
export const uploadApi = {
  uploadImage: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};

// --- Analytics API ---
export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const [users, orders, products, fabrics] = await Promise.all([
      usersApi.list().catch(() => [] as User[]),
      ordersApi.listAll().catch(() => [] as Order[]),
      productsApi.list().catch(() => [] as Product[]),
      fabricsApi.list().catch(() => [] as Fabric[]),
    ]);
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalPrice: o.totalPrice,
        createdAt: o.createdAt,
      }));
    return {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue,
      activeProducts: products.filter((p) => p.isActive).length,
      activeFabrics: fabrics.filter((f) => f.stock > 0).length,
      recentOrders,
    };
  },
};

// Re-export HeroBanner type to support existing imports from this module
export type { HeroBanner } from '../types';

// --- Reviews API ---
export const reviewsApi = {
  getProductReviews: (productId: string, params?: { page?: number; limit?: number; sort?: string }) =>
    api.get(`/products/${productId}/reviews`, { params }),
  getRatingSummary: (productId: string) =>
    api.get(`/products/${productId}/reviews/summary`),
  createReview: (productId: string, data: { rating: number; title?: string; comment: string; images?: string[] }) =>
    api.post(`/products/${productId}/reviews`, data),
  updateReview: (reviewId: string, data: Partial<{ rating: number; title: string; comment: string; images: string[] }>) =>
    api.patch(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId: string) =>
    api.delete(`/reviews/${reviewId}`),
  markHelpful: (reviewId: string) =>
    api.post(`/reviews/${reviewId}/helpful`),
  getMyReviews: (params?: { page?: number; limit?: number }) =>
    api.get('/reviews/my', { params }),
  adminGetReviews: (params?: { status?: string; productId?: string; userId?: string; page?: number; limit?: number }) =>
    api.get('/admin/reviews', { params }),
  adminModerateReview: (reviewId: string, data: { status: string; adminNote?: string }) =>
    api.patch(`/admin/reviews/${reviewId}/moderate`, data),
};

// --- Payments API ---
export const paymentsApi = {
  initiate: (orderId: string, provider: PaymentProvider, callbackUrl?: string): Promise<PaymentInitiateResponse> =>
    api.post<PaymentInitiateResponse>('/payments/initiate', { orderId, provider, callbackUrl }).then((r) => r.data),
  verify: (paymentId: string): Promise<Payment> =>
    api.get<Payment>(`/payments/verify/${paymentId}`).then((r) => r.data),
  getByOrder: (orderId: string): Promise<Payment[]> =>
    api.get<Payment[]>(`/payments/order/${orderId}`).then((r) => r.data),
  getMyPayouts: (): Promise<Payout[]> =>
    api.get<Payout[]>('/payments/payouts').then((r) => r.data),
  adminGetPayouts: (): Promise<Payout[]> =>
    api.get<Payout[]>('/admin/payments/payouts').then((r) => r.data),
  adminInitiatePayout: (orderId: string): Promise<Payout[]> =>
    api.post<Payout[]>(`/admin/payments/payouts/${orderId}`).then((r) => r.data),
};

// --- Notifications API ---
export const notificationsApi = {  list: (params?: { page?: number; limit?: number; unread?: boolean }) =>
    api.get('/notifications', { params }).then((r) => r.data),
  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
  delete: (id: string) =>
    api.delete(`/notifications/${id}`).then((r) => r.data),
};

// --- Admin API ---
export const adminApi = {
  // Analytics
  getOverview: () => api.get('/admin/analytics/overview').then((r) => r.data),
  getRevenueAnalytics: () => api.get('/admin/analytics/revenue').then((r) => r.data),
  getOrderAnalytics: () => api.get('/admin/analytics/orders').then((r) => r.data),
  getUserAnalytics: () => api.get('/admin/analytics/users').then((r) => r.data),

  // Users
  getUsers: (params?: Record<string, string | number>) =>
    api.get('/admin/users', { params }).then((r) => r.data),
  getUser: (id: string) => api.get(`/admin/users/${id}`).then((r) => r.data),
  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  updateUserStatus: (id: string, isActive: boolean) =>
    api.patch(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),
  getPendingApprovals: () => api.get('/admin/users/pending-approvals').then((r) => r.data),

  // Orders
  getOrders: (params?: Record<string, string | number>) =>
    api.get('/admin/orders', { params }).then((r) => r.data),
  getOrder: (id: string) => api.get(`/admin/orders/${id}`).then((r) => r.data),
  updateOrderStatus: (id: string, status: string, reason?: string) =>
    api.patch(`/admin/orders/${id}/status`, { status, reason }).then((r) => r.data),
  refundOrder: (id: string) =>
    api.post(`/admin/orders/${id}/refund`, {}).then((r) => r.data),

  // Settings (using existing endpoints)
  getSettings: () => api.get('/admin/settings').then((r) => r.data),
  updateSettings: (data: Record<string, unknown>) =>
    api.patch('/admin/settings', data).then((r) => r.data),

  // Gateways (using existing endpoints)
  getGateways: () => api.get('/admin/payments/gateways').then((r) => r.data),
  createGateway: (data: Record<string, unknown>) =>
    api.post('/admin/payments/gateways', data).then((r) => r.data),
  updateGateway: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/payments/gateways/${id}`, data).then((r) => r.data),
};

export default api;

