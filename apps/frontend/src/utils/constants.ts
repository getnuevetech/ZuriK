// African Countries
export const AFRICAN_COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Ethiopia',
  'Egypt',
  'Morocco',
  'Tanzania',
  'Uganda',
  'Senegal',
  'Ivory Coast',
  'Cameroon',
  'Mali',
  'Rwanda',
  'Benin',
  'Burkina Faso',
  'Zimbabwe',
  'Botswana',
  'Namibia',
  'Zambia',
] as const;

// Design Categories
export const DESIGN_CATEGORIES = [
  'Traditional Wear',
  'Contemporary Fashion',
  'Accessories',
  'Jewelry',
  'Footwear',
  'Bags & Purses',
  'Textiles',
  'Home Decor',
  'Wedding Attire',
  'Ceremonial Wear',
] as const;

// Fabric Types
export const FABRIC_TYPES = [
  'Ankara',
  'Kente',
  'Dashiki',
  'Mudcloth',
  'Batik',
  'Adire',
  'Aso Oke',
  'Shweshwe',
  'Kitenge',
  'Bogolanfini',
] as const;

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
} as const;

// Order Status Colors (Tailwind classes)
export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
} as const;

// Currency symbols
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  GHS: '₵',
  KES: 'KSh',
  ZAR: 'R',
  EGP: 'E£',
} as const;

// Price ranges for filtering
export const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: '$200 - $500', min: 200, max: 500 },
  { label: 'Over $500', min: 500, max: Infinity },
] as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000,
  ITEMS_PER_PAGE: 12,
} as const;

// Image placeholders
export const PLACEHOLDER_IMAGES = {
  design: '/images/placeholder-design.jpg',
  fabric: '/images/placeholder-fabric.jpg',
  profile: '/images/placeholder-profile.jpg',
  pattern: '/images/patterns/african-texture.svg',
} as const;

// Social media platforms
export const SOCIAL_PLATFORMS = [
  { name: 'Instagram', icon: 'instagram', baseUrl: 'https://instagram.com/' },
  { name: 'Facebook', icon: 'facebook', baseUrl: 'https://facebook.com/' },
  { name: 'Website', icon: 'globe', baseUrl: '' },
] as const;
