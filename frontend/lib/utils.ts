import type { User } from '../types/user';

/**
 * Get the display name for a user from their profile fields.
 */
export function getUserDisplayName(user: Pick<User, 'firstName' | 'lastName' | 'email'>): string {
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email;
}
