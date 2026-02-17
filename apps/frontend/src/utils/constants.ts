import { OrderStatus, UserRole } from '@/types';

// African Countries
export const AFRICAN_COUNTRIES = [
  'Nigeria',
  'Kenya',
  'Ghana',
  'South Africa',
  'Ethiopia',
  'Tanzania',
  'Uganda',
  'Senegal',
  'Mali',
  "Côte d'Ivoire",
  'Morocco',
  'Egypt',
  'Rwanda',
  'Cameroon',
  'Zimbabwe',
] as const;

// Design Categories
export const DESIGN_CATEGORIES = [
  'Dresses',
  'Shirts',
  'Pants',
  'Skirts',
  'Suits',
  'Traditional Wear',
  'Accessories',
  'Footwear',
] as const;

// Fabric Types
export const FABRIC_TYPES = [
  'Ankara',
  'Kente',
  'Dashiki',
  'Kitenge',
  'Mudcloth',
  'Adire',
  'Batik',
  'Silk',
  'Cotton',
  'Linen',
  'Velvet',
] as const;

// Order Status Labels
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending Payment',
  [OrderStatus.PAID]: 'Paid',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
};

// User Role Labels
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Customer',
  [UserRole.DESIGNER]: 'Designer',
  [UserRole.FABRIC_SELLER]: 'Fabric Seller',
  [UserRole.ADMIN]: 'Admin',
};

// Order Status Colors (Tailwind classes)
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.PAID]: 'bg-blue-100 text-blue-800',
  [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
  [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

// Role Badge Colors
export const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'bg-gray-100 text-gray-800',
  [UserRole.DESIGNER]: 'bg-gold text-dark',
  [UserRole.FABRIC_SELLER]: 'bg-blue-100 text-blue-800',
  [UserRole.ADMIN]: 'bg-accent text-white',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

// Currency
export const CURRENCY_SYMBOL = '$';
export const CURRENCY_CODE = 'USD';

// Platform Fee (percentage)
export const PLATFORM_FEE_PERCENTAGE = 10;
