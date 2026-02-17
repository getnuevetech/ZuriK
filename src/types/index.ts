// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'designer' | 'admin';
  country?: string;
  phoneNumber?: string;
  profileImage?: string;
  bio?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Design Types
export interface Design {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  tags: string[];
  designer: Designer;
  country: string;
  fabricType?: string;
  customizable: boolean;
  inStock: boolean;
  featured: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Designer {
  id: string;
  name: string;
  bio: string;
  country: string;
  profileImage?: string;
  coverImage?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  rating?: number;
  designCount?: number;
}

// Fabric Types
export interface Fabric {
  id: string;
  name: string;
  description: string;
  type: string;
  origin: string;
  price: number;
  currency: string;
  images: string[];
  inStock: boolean;
  colors: string[];
  pattern?: string;
  designer?: Designer;
  createdAt: string;
}

// Order Types
export interface OrderItem {
  id: string;
  designId: string;
  design: Design;
  quantity: number;
  price: number;
  customizations?: Record<string, any>;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

// Filter Types
export interface DesignFilters {
  category?: string;
  country?: string;
  designer?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  tags?: string[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
