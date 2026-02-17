import { format } from 'date-fns';
import { CURRENCY_SYMBOL } from './constants';

/**
 * Format price with currency symbol
 */
export function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL}${price.toFixed(2)}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Generate random ID (for mock data)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(amount: number, percentage: number): number {
  return (amount * percentage) / 100;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get country flag emoji
 */
export function getCountryFlag(country: string): string {
  const countryFlags: Record<string, string> = {
    Nigeria: '🇳🇬',
    Kenya: '🇰🇪',
    Ghana: '🇬🇭',
    'South Africa': '🇿🇦',
    Ethiopia: '🇪🇹',
    Tanzania: '🇹🇿',
    Uganda: '🇺🇬',
    Senegal: '🇸🇳',
    Mali: '🇲🇱',
    "Côte d'Ivoire": '🇨🇮',
    Morocco: '🇲🇦',
    Egypt: '🇪🇬',
    Rwanda: '🇷🇼',
    Cameroon: '🇨🇲',
    Zimbabwe: '🇿🇼',
  };
  return countryFlags[country] || '🌍';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}
