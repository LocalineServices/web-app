/**
 * Gravatar utility functions
 */

import md5 from 'md5';

/**
 * Generate Gravatar URL from email
 * @param email User email address
 * @param size Avatar size in pixels (default: 80)
 * @returns Gravatar URL
 */
export function getGravatarUrl(email: string, size: number = 80): string {
  const cleanEmail = email.toLowerCase().trim();
  const hash = md5(cleanEmail);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

/**
 * Get user initials from name
 * @param name Full name
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || '?';
}
