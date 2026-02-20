import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  Product, Fabric, Order,
  CreateCustomDesignOrderDto, CreateReadyToWearOrderDto, CreateFabricOnlyOrderDto,
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
};

// --- Designers API ---
export const designersApi = {
  list: () => api.get('/users?role=designer').then((r) => r.data),
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
};

export default api;
