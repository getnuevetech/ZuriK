import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  Product, Fabric, Order, OrderStatus,
  CreateCustomDesignOrderDto, CreateReadyToWearOrderDto, CreateFabricOnlyOrderDto,
  User, PlatformSettings, HeroBanner, AnalyticsOverview,
  Payment, Payout, PaymentInitiateResponse, PaymentProvider,
} from '../types';
import { config } from './config';

const API_URL = config.apiUrl;

// --- Types ---
export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { email: string; password: string; firstName: string; lastName: string; role?: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; user: UserProfile; }
export interface UserProfile { id: string; email: string; firstName: string; lastName: string; role: string; avatarUrl?: string; provider?: string; isEmailVerified?: boolean; }
export interface RefreshResponse { accessToken: string; refreshToken: string; }

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: string;
  country?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  minRating?: number;
  tags?: string;
  designerId?: string;
  page?: number;
  limit?: number;
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
  sort?: string;
  page?: number;
  limit?: number;
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
          const url = originalRequest?.url || '';
          const isAuthEndpoint = /\/auth\/(login|register|refresh)$/.test(url);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth_user');
          if (!isAuthEndpoint) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// --- Error utility ---
/**
 * Extracts a user-friendly error message from an unknown error value.
 *
 * Handles the following cases in priority order:
 * - No response (network/CORS/offline): returns a connectivity message.
 * - HTTP 429 (rate-limited): returns a rate-limit message.
 * - Backend error response with a `message` field (string or string[]): returns that message.
 * - Everything else: returns the provided `fallback` string.
 *
 * @param err     - The caught error value (typically an Axios error).
 * @param fallback - Message to display when no specific message can be extracted.
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const axiosErr = err as { response?: { status?: number; data?: { message?: string | string[] } }; message?: string };
    if (!axiosErr.response) {
      // Network error or no response from server
      return 'Unable to connect to server. Please check your connection.';
    }
    if (axiosErr.response.status === 429) {
      return 'Too many attempts. Please wait a moment before trying again.';
    }
    const msg = axiosErr.response.data?.message;
    if (msg) {
      return Array.isArray(msg) ? msg[0] : msg;
    }
  }
  return fallback;
}

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
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/reset-password', { token, newPassword }).then((r) => r.data),
  verifyEmail: (token: string) =>
    api.post<{ message: string }>('/auth/verify-email', { token }).then((r) => r.data),
  resendVerification: () =>
    api.post<{ message: string }>('/auth/resend-verification').then((r) => r.data),
};

// --- Products API ---
export const productsApi = {
  list: (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.country) params.set('country', filters.country);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters?.sort) params.set('sort', filters.sort);
    if (filters?.minRating !== undefined) params.set('minRating', String(filters.minRating));
    if (filters?.tags) params.set('tags', filters.tags);
    if (filters?.designerId) params.set('designerId', filters.designerId);
    if (filters?.page !== undefined) params.set('page', String(filters.page));
    if (filters?.limit !== undefined) params.set('limit', String(filters.limit));
    const query = params.toString();
    return api.get<PaginatedResponse<Product>>(`/products${query ? `?${query}` : ''}`).then((r) => r.data);
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
  updateStock: (id: string, quantity: number): Promise<Product> =>
    api.patch<Product>(`/products/${id}/stock`, { quantity }).then((r) => r.data),
  getLowStock: (): Promise<Product[]> =>
    api.get<Product[]>('/products/low-stock').then((r) => r.data),
};

// --- Fabrics API ---
export const fabricsApi = {
  list: (filters?: FabricFilters): Promise<PaginatedResponse<Fabric>> => {
    const params = new URLSearchParams();
    if (filters?.material) params.set('material', filters.material);
    if (filters?.color) params.set('color', filters.color);
    if (filters?.country) params.set('country', filters.country);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters?.pattern) params.set('pattern', filters.pattern);
    if (filters?.inStock !== undefined) params.set('inStock', String(filters.inStock));
    if (filters?.sort) params.set('sort', filters.sort);
    if (filters?.page !== undefined) params.set('page', String(filters.page));
    if (filters?.limit !== undefined) params.set('limit', String(filters.limit));
    const query = params.toString();
    return api.get<PaginatedResponse<Fabric>>(`/fabrics${query ? `?${query}` : ''}`).then((r) => r.data);
  },
  get: (id: string): Promise<Fabric> => api.get<Fabric>(`/fabrics/${id}`).then((r) => r.data),
  create: (data: Partial<Fabric>): Promise<Fabric> =>
    api.post<Fabric>('/fabrics', data).then((r) => r.data),
  update: (id: string, data: Partial<Fabric>): Promise<Fabric> =>
    api.patch<Fabric>(`/fabrics/${id}`, data).then((r) => r.data),
  delete: (id: string): Promise<void> =>
    api.delete(`/fabrics/${id}`).then(() => undefined),
  updateStock: (id: string, stock: number): Promise<Fabric> =>
    api.patch<Fabric>(`/fabrics/${id}/stock`, { quantity: stock }).then((r) => r.data),
  getLowStock: (): Promise<Fabric[]> =>
    api.get<Fabric[]>('/fabrics/low-stock').then((r) => r.data),
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
  toggle: (id: string): Promise<HeroBanner> =>
    api.patch<HeroBanner>(`/hero-banners/${id}/toggle`).then((r) => r.data),
  reorder: (orders: { id: string; sortOrder: number }[]): Promise<void> =>
    api.patch<void>('/hero-banners/reorder', orders).then(() => undefined),
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
  uploadHeroBannerMedia: (file: File): Promise<{ url: string; mediaType: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string; mediaType: string }>('/upload/hero-banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};

// --- Analytics API ---
export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const [users, orders, productsRes, fabricsRes] = await Promise.all([
      usersApi.list().catch(() => [] as User[]),
      ordersApi.listAll().catch(() => [] as Order[]),
      productsApi.list().catch(() => ({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 } as PaginatedResponse<Product>)),
      fabricsApi.list().catch(() => ({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 } as PaginatedResponse<Fabric>)),
    ]);
    const products = productsRes.items;
    const fabrics = fabricsRes.items;
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

// --- Homepage API ---
export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaText: string | null;
  ctaLink: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const homepageApi = {
  // Public endpoints
  getHomepage: () => api.get('/homepage').then((r) => r.data),
  getTheme: () => api.get('/homepage/theme').then((r) => r.data),
  getFeatured: () => api.get('/homepage/featured').then((r) => r.data),
  getFeaturedProducts: (): Promise<{ section: { id: string; title: string }; products: Product[] }[]> =>
    api.get('/homepage/featured').then((r) => r.data),
  getCountries: () => api.get('/homepage/countries').then((r) => r.data),
  getCollections: () => api.get('/homepage/collections').then((r) => r.data),
  getPromoBanners: (): Promise<PromoBanner[]> =>
    api.get('/homepage/promo-banners').then((r) => r.data),

  // Admin — Featured Sections
  adminGetFeatured: () => api.get('/homepage/admin/featured').then((r) => r.data),
  adminCreateFeatured: (data: Record<string, unknown>) =>
    api.post('/homepage/admin/featured', data).then((r) => r.data),
  adminUpdateFeatured: (id: string, data: Record<string, unknown>) =>
    api.patch(`/homepage/admin/featured/${id}`, data).then((r) => r.data),
  adminDeleteFeatured: (id: string) =>
    api.delete(`/homepage/admin/featured/${id}`).then((r) => r.data),

  // Admin — Country Heroes
  adminGetCountries: () => api.get('/homepage/admin/countries').then((r) => r.data),
  adminCreateCountry: (data: Record<string, unknown>) =>
    api.post('/homepage/admin/countries', data).then((r) => r.data),
  adminUpdateCountry: (id: string, data: Record<string, unknown>) =>
    api.patch(`/homepage/admin/countries/${id}`, data).then((r) => r.data),
  adminDeleteCountry: (id: string) =>
    api.delete(`/homepage/admin/countries/${id}`).then((r) => r.data),

  // Admin — Collections
  adminGetCollections: () => api.get('/homepage/admin/collections').then((r) => r.data),
  adminCreateCollection: (data: Record<string, unknown>) =>
    api.post('/homepage/admin/collections', data).then((r) => r.data),
  adminUpdateCollection: (id: string, data: Record<string, unknown>) =>
    api.patch(`/homepage/admin/collections/${id}`, data).then((r) => r.data),
  adminDeleteCollection: (id: string) =>
    api.delete(`/homepage/admin/collections/${id}`).then((r) => r.data),

  // Admin — Theme
  adminGetTheme: () => api.get('/homepage/admin/theme').then((r) => r.data),
  adminUpdateTheme: (data: { activeTheme: string }) =>
    api.patch('/homepage/admin/theme', data).then((r) => r.data),
  adminGetThemePresets: () => api.get('/homepage/admin/theme/presets').then((r) => r.data),

  // Admin — Layout
  adminGetLayout: () => api.get('/homepage/admin/layout').then((r) => r.data),
  adminUpdateLayout: (sections: Record<string, unknown>[]) =>
    api.put('/homepage/admin/layout', { sections }).then((r) => r.data),

  // Admin — Promo Banners
  adminGetPromoBanners: () => api.get('/homepage/admin/promo-banners').then((r) => r.data),
  adminCreatePromoBanner: (data: Record<string, unknown>) =>
    api.post('/homepage/admin/promo-banners', data).then((r) => r.data),
  adminUpdatePromoBanner: (id: string, data: Record<string, unknown>) =>
    api.patch(`/homepage/admin/promo-banners/${id}`, data).then((r) => r.data),
  adminDeletePromoBanner: (id: string) =>
    api.delete(`/homepage/admin/promo-banners/${id}`).then((r) => r.data),

  // Public — Shop by Country / Trending
  getShopByCountry: () => api.get('/homepage/shop-by-country').then((r) => r.data),
  getTrending: (limit?: number) =>
    api.get('/homepage/trending', { params: { limit } }).then((r) => r.data),

  // Public — Collection Posts
  getCollectionPosts: () => api.get('/homepage/collection-posts').then((r) => r.data),

  // Public — Heritage Stories
  getHeritageStories: () => api.get('/homepage/heritage-stories').then((r) => r.data),

  // Admin — Collection Posts
  adminGetCollectionPosts: () => api.get('/homepage/admin/collection-posts').then((r) => r.data),
  adminCreateCollectionPost: (data: Record<string, unknown>) =>
    api.post('/homepage/admin/collection-posts', data).then((r) => r.data),
  adminUpdateCollectionPost: (id: string, data: Record<string, unknown>) =>
    api.patch(`/homepage/admin/collection-posts/${id}`, data).then((r) => r.data),
  adminDeleteCollectionPost: (id: string) =>
    api.delete(`/homepage/admin/collection-posts/${id}`).then((r) => r.data),

  // Admin — Heritage Stories
  adminGetHeritageStories: () => api.get('/homepage/admin/heritage-stories').then((r) => r.data),
  adminCreateHeritageStory: (data: Record<string, unknown>) =>
    api.post('/homepage/admin/heritage-stories', data).then((r) => r.data),
  adminUpdateHeritageStory: (id: string, data: Record<string, unknown>) =>
    api.patch(`/homepage/admin/heritage-stories/${id}`, data).then((r) => r.data),
  adminDeleteHeritageStory: (id: string) =>
    api.delete(`/homepage/admin/heritage-stories/${id}`).then((r) => r.data),
};

// --- Wishlist API ---
export const wishlistApi = {
  getWishlist: (params?: { page?: number; limit?: number }) =>
    api.get('/wishlist', { params }).then((r) => r.data),
  getWishlistIds: (): Promise<string[]> =>
    api.get<string[]>('/wishlist/ids').then((r) => r.data),
  getWishlistCount: (): Promise<{ count: number }> =>
    api.get<{ count: number }>('/wishlist/count').then((r) => r.data),
  addToWishlist: (productId: string) =>
    api.post(`/wishlist/${productId}`).then((r) => r.data),
  removeFromWishlist: (productId: string) =>
    api.delete(`/wishlist/${productId}`).then((r) => r.data),
  toggleWishlist: (productId: string): Promise<{ added: boolean }> =>
    api.post<{ added: boolean }>(`/wishlist/${productId}/toggle`).then((r) => r.data),
  clearWishlist: () =>
    api.delete('/wishlist').then((r) => r.data),
};

// --- Search API ---
export const searchApi = {
  search: (q: string, type?: 'all' | 'products' | 'fabrics', limit?: number) => {
    const params = new URLSearchParams({ q });
    if (type) params.set('type', type);
    if (limit !== undefined) params.set('limit', String(limit));
    return api.get<{ products: Product[]; fabrics: Fabric[]; total: number }>(`/search?${params.toString()}`).then((r) => r.data);
  },
};

// --- Recently Viewed API ---
export const recentlyViewedApi = {
  list: (limit?: number): Promise<Product[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<Product[]>(`/recently-viewed${params}`).then((r) => r.data);
  },
  track: (productId: string): Promise<void> =>
    api.post(`/recently-viewed/${productId}`).then(() => undefined),
  clear: (): Promise<void> =>
    api.delete('/recently-viewed').then(() => undefined),
  remove: (productId: string): Promise<void> =>
    api.delete(`/recently-viewed/${productId}`).then(() => undefined),
};

// --- Comparison API ---
export const comparisonApi = {
  compare: (productIds: string[]): Promise<Product[]> =>
    api.post<Product[]>('/comparisons/products', { productIds }).then((r) => r.data),
};

// --- Coupons ---
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number | null;
  maximumDiscount: number | null;
  startDate: string | null;
  expiryDate: string | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number | null;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message?: string;
}

export const couponsApi = {
  // Admin
  create: (data: Partial<Coupon>): Promise<Coupon> =>
    api.post<Coupon>('/coupons', data).then((r) => r.data),
  list: (params?: Record<string, string>): Promise<{ data: Coupon[]; total: number }> =>
    api.get('/coupons', { params }).then((r) => r.data),
  getOne: (id: string): Promise<Coupon> =>
    api.get<Coupon>(`/coupons/${id}`).then((r) => r.data),
  update: (id: string, data: Partial<Coupon>): Promise<Coupon> =>
    api.patch<Coupon>(`/coupons/${id}`, data).then((r) => r.data),
  remove: (id: string): Promise<void> =>
    api.delete(`/coupons/${id}`).then(() => undefined),
  getUsage: (id: string): Promise<unknown> =>
    api.get(`/coupons/${id}/usage`).then((r) => r.data),

  // Customer
  validate: (code: string, orderTotal: number): Promise<CouponValidationResult> =>
    api.post<CouponValidationResult>('/coupons/validate', { code, orderTotal }).then((r) => r.data),
  apply: (code: string, orderId: string, orderTotal: number): Promise<{ discountAmount: number }> =>
    api.post('/coupons/apply', { code, orderId, orderTotal }).then((r) => r.data),
};

// --- Shipping ---
export interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  freeShippingThreshold: number | null;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  supportedCountries: string[] | null;
  isActive: boolean;
  sortOrder: number;
  effectiveCost?: number;
}

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string | null;
  timestamp: string;
}

export interface ShipmentTracking {
  id: string;
  orderId: string;
  shippingMethod: ShippingMethod;
  trackingNumber: string | null;
  carrier: string | null;
  carrierTrackingUrl: string | null;
  status: string;
  shippingCost: number;
  shippingAddress: string | null;
  estimatedDeliveryDate: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  events?: TrackingEvent[];
}

export const shippingApi = {
  // Customer
  getAvailableMethods: (country?: string, orderTotal?: number): Promise<ShippingMethod[]> => {
    const params = new URLSearchParams();
    if (country) params.append('country', country);
    if (orderTotal !== undefined) params.append('orderTotal', orderTotal.toString());
    return api.get<ShippingMethod[]>(`/shipping/available?${params}`).then((r) => r.data);
  },
  getOrderTracking: (orderId: string): Promise<ShipmentTracking> =>
    api.get<ShipmentTracking>(`/shipping/orders/${orderId}/tracking`).then((r) => r.data),

  // Admin
  createMethod: (data: Partial<ShippingMethod>): Promise<ShippingMethod> =>
    api.post<ShippingMethod>('/shipping/methods', data).then((r) => r.data),
  listMethods: (): Promise<ShippingMethod[]> =>
    api.get<ShippingMethod[]>('/shipping/methods').then((r) => r.data),
  updateMethod: (id: string, data: Partial<ShippingMethod>): Promise<ShippingMethod> =>
    api.patch<ShippingMethod>(`/shipping/methods/${id}`, data).then((r) => r.data),
  deleteMethod: (id: string): Promise<void> =>
    api.delete(`/shipping/methods/${id}`).then(() => undefined),
  createShipment: (data: { orderId: string; shippingMethodId: string; shippingCost: number; shippingAddress?: string }): Promise<ShipmentTracking> =>
    api.post<ShipmentTracking>('/shipping/shipments', data).then((r) => r.data),
  updateShipmentStatus: (id: string, data: { status: string; description: string; location?: string }): Promise<ShipmentTracking> =>
    api.patch<ShipmentTracking>(`/shipping/shipments/${id}/status`, data).then((r) => r.data),
  assignTracking: (id: string, data: { trackingNumber: string; carrier: string; carrierTrackingUrl?: string }): Promise<ShipmentTracking> =>
    api.patch<ShipmentTracking>(`/shipping/shipments/${id}/tracking`, data).then((r) => r.data),
  listShipments: (page = 1, limit = 20, status?: string): Promise<{ items: ShipmentTracking[]; total: number }> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    return api.get<{ items: ShipmentTracking[]; total: number }>(`/shipping/shipments?${params}`).then((r) => r.data);
  },
};

export default api;

// --- Seller Applications API ---
export interface SellerApplication {
  id: string;
  applicantId: string;
  applicant?: { id: string; firstName: string; lastName: string; email: string };
  requestedRole: 'designer' | 'fabric_seller';
  status: 'pending' | 'approved' | 'rejected';
  businessName: string;
  businessDescription: string;
  portfolioUrl?: string;
  experience?: string;
  adminNotes?: string;
  reviewedById?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSellerApplicationPayload {
  requestedRole: 'designer' | 'fabric_seller';
  businessName: string;
  businessDescription: string;
  portfolioUrl?: string;
  experience?: string;
}

export interface ReviewSellerApplicationPayload {
  status: 'approved' | 'rejected';
  adminNotes?: string;
}

export const sellerApplicationsApi = {
  apply: (dto: CreateSellerApplicationPayload): Promise<SellerApplication> =>
    api.post<SellerApplication>('/seller-applications', dto).then((r) => r.data),
  getMyApplications: (): Promise<SellerApplication[]> =>
    api.get<SellerApplication[]>('/seller-applications/my').then((r) => r.data),
  getAll: (status?: string): Promise<SellerApplication[]> => {
    const params = status ? `?status=${status}` : '';
    return api.get<SellerApplication[]>(`/seller-applications${params}`).then((r) => r.data);
  },
  getById: (id: string): Promise<SellerApplication> =>
    api.get<SellerApplication>(`/seller-applications/${id}`).then((r) => r.data),
  review: (id: string, dto: ReviewSellerApplicationPayload): Promise<SellerApplication> =>
    api.patch<SellerApplication>(`/seller-applications/${id}/review`, dto).then((r) => r.data),
};

// --- Cart API ---
export interface ServerCartItem {
  id: string;
  type: 'ready-to-wear' | 'fabric-only';
  quantity: number;
  productId?: string;
  fabricId?: string;
  name: string | null;
  price: number;
  image: string | null;
  inStock: boolean;
}

export interface CartSummary {
  items: ServerCartItem[];
  subtotal: number;
  itemCount: number;
}

export interface AddToCartPayload {
  productId?: string;
  fabricId?: string;
  type: 'ready-to-wear' | 'fabric-only';
  quantity?: number;
}

export const cartApi = {
  getCart: (): Promise<ServerCartItem[]> =>
    api.get<ServerCartItem[]>('/cart').then((r) => r.data),
  getCartSummary: (): Promise<CartSummary> =>
    api.get<CartSummary>('/cart/summary').then((r) => r.data),
  addToCart: (dto: AddToCartPayload): Promise<ServerCartItem> =>
    api.post<ServerCartItem>('/cart', dto).then((r) => r.data),
  updateItem: (id: string, quantity: number): Promise<ServerCartItem> =>
    api.patch<ServerCartItem>(`/cart/${id}`, { quantity }).then((r) => r.data),
  removeItem: (id: string): Promise<void> =>
    api.delete(`/cart/${id}`).then(() => undefined),
  clearCart: (): Promise<void> =>
    api.delete('/cart').then(() => undefined),
  sync: (items: AddToCartPayload[]): Promise<ServerCartItem[]> =>
    api.post<ServerCartItem[]>('/cart/sync', { items }).then((r) => r.data),
};

// --- Addresses API ---
export interface Address {
  id: string;
  userId: string;
  label: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  label?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isDefault?: boolean;
}

export const addressesApi = {
  getAll: (): Promise<Address[]> =>
    api.get<Address[]>('/addresses').then((r) => r.data),
  getById: (id: string): Promise<Address> =>
    api.get<Address>(`/addresses/${id}`).then((r) => r.data),
  create: (dto: CreateAddressPayload): Promise<Address> =>
    api.post<Address>('/addresses', dto).then((r) => r.data),
  update: (id: string, dto: Partial<CreateAddressPayload>): Promise<Address> =>
    api.patch<Address>(`/addresses/${id}`, dto).then((r) => r.data),
  delete: (id: string): Promise<void> =>
    api.delete(`/addresses/${id}`).then(() => undefined),
  setDefault: (id: string): Promise<Address> =>
    api.patch<Address>(`/addresses/${id}/default`, {}).then((r) => r.data),
};



// --- Stock Alerts API ---
export type StockAlertProductType = 'product' | 'fabric';

export interface StockAlert {
  id: string;
  userId: string;
  productId: string;
  productType: StockAlertProductType;
  notifiedAt: string | null;
  status: 'active' | 'notified' | 'cancelled';
  createdAt: string;
}

export const stockAlertsApi = {
  subscribe: (productId: string, productType: StockAlertProductType): Promise<StockAlert> =>
    api.post<StockAlert>('/stock-alerts', { productId, productType }).then((r) => r.data),
  unsubscribe: (productId: string): Promise<void> =>
    api.delete(`/stock-alerts/${productId}`).then(() => undefined),
  getMyAlerts: (): Promise<StockAlert[]> =>
    api.get<StockAlert[]>('/stock-alerts').then((r) => r.data),
  adminNotify: (productId: string, productType: StockAlertProductType, productName: string): Promise<{ message: string }> =>
    api.post(`/stock-alerts/admin/${productId}/notify`, { productType, productName }).then((r) => r.data),
};

// --- Loyalty API ---
export interface LoyaltyBalance {
  points: number;
  dollarValue: number;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  points: number;
  type: string;
  description: string;
  referenceId: string | null;
  createdAt: string;
}

export interface LoyaltyHistoryResponse {
  transactions: LoyaltyTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const loyaltyApi = {
  getBalance: (): Promise<LoyaltyBalance> =>
    api.get<LoyaltyBalance>('/loyalty/balance').then((r) => r.data),
  getHistory: (page = 1, limit = 20): Promise<LoyaltyHistoryResponse> =>
    api.get<LoyaltyHistoryResponse>(`/loyalty/history?page=${page}&limit=${limit}`).then((r) => r.data),
  redeem: (points: number): Promise<LoyaltyTransaction> =>
    api.post<LoyaltyTransaction>('/loyalty/redeem', { points }).then((r) => r.data),
};

// --- Review Prompts API ---
export interface ReviewPrompt {
  id: string;
  userId: string;
  orderId: string;
  productId: string;
  emailSentAt: string | null;
  reviewedAt: string | null;
  status: 'pending' | 'email_sent' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export const reviewPromptsApi = {
  getMyPrompts: (): Promise<ReviewPrompt[]> =>
    api.get<ReviewPrompt[]>('/review-prompts').then((r) => r.data),
  dismiss: (id: string): Promise<void> =>
    api.patch(`/review-prompts/${id}/dismiss`, {}).then(() => undefined),
};

// --- Abandoned Carts Admin API ---
export interface AbandonedCartStats {
  totalAbandoned: number;
  recovered: number;
  recoveryRate: number;
  totalRecoveredRevenue: number;
}

export const abandonedCartsAdminApi = {
  getStats: (): Promise<AbandonedCartStats> =>
    api.get<AbandonedCartStats>('/admin/abandoned-carts/stats').then((r) => r.data),
  getAll: (page = 1, limit = 20) =>
    api.get(`/admin/abandoned-carts?page=${page}&limit=${limit}`).then((r) => r.data),
};
