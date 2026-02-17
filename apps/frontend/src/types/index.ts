// User Types
export enum UserRole {
  CUSTOMER = 'customer',
  DESIGNER = 'designer',
  FABRIC_SELLER = 'fabric_seller',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  country: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  instagramHandle?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Design Types
export interface Design {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  designer: User;
  designerId: string;
  compatibleFabrics: Fabric[];
  country: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Fabric Types
export interface Fabric {
  id: string;
  name: string;
  description: string;
  pricePerMeter: number;
  stockQuantity: number;
  images: string[];
  colors: string[];
  fabricType: string;
  seller: User;
  sellerId: string;
  country: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Measurement Types
export interface Measurements {
  id: string;
  userId: string;
  bust?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  armLength?: number;
  inseam?: number;
  neck?: number;
  chest?: number;
  notes?: string;
  unit: 'cm' | 'inch';
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  id: string;
  designId: string;
  design: Design;
  fabricId: string;
  fabric: Fabric;
  quantity: number;
  fabricMeters: number;
  designPrice: number;
  fabricPrice: number;
  totalPrice: number;
  measurements?: Measurements;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user: User;
  items: OrderItem[];
  subtotal: number;
  platformFee: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  paymentIntentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  country: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Filter Types
export interface DesignFilters {
  category?: string;
  country?: string;
  designerId?: string;
  fabricType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  page?: number;
  perPage?: number;
}

export interface FabricFilters {
  fabricType?: string;
  country?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  inStock?: boolean;
  sortBy?: 'price' | 'newest';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  page?: number;
  perPage?: number;
}
