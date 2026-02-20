import type { User } from '../types/user';
import type { Notification } from '../types/notification';

/**
 * Get the display name for a user from their profile fields.
 */
export function getUserDisplayName(user: Pick<User, 'firstName' | 'lastName' | 'email'>): string {
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email;
}

/**
 * Resolve the navigation link for a notification (or null if there is none).
 */
export function getNotificationLink(notification: Notification): string | null {
  if (notification.data?.link) return notification.data.link;
  if (notification.data?.orderId) return `/orders/${notification.data.orderId}`;
  return null;
}
