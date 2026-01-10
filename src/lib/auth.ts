/**
 * Authentication utilities
 * Handles password hashing, JWT token generation, and session management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

// Warn if JWT_SECRET is not set
if (!JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set. Using default secret. Set JWT_SECRET environment variable for production!');
}

const ACTUAL_JWT_SECRET = JWT_SECRET || 'default-dev-secret-please-change-in-production-min-32-chars';
const SALT_ROUNDS = 10;
const TOKEN_COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Check if signups are enabled
 * Defaults to true if not set
 */
export function areSignupsEnabled(): boolean {
  const signupsEnabled = process.env.SIGNUPS_ENABLED;
  // Default to true if not set, or if set to anything other than 'false'
  return signupsEnabled !== 'false';
}

export interface JWTPayload {
  userId: string;
  email: string;
  pwdSig?: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, ACTUAL_JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Create a signature from password hash (first 16 chars)
 * This allows us to invalidate tokens when password changes
 */
export function createPasswordSignature(passwordHash: string): string {
  return passwordHash.substring(0, 16);
}

/**
 * Verify and decode a JWT token, checking if password has changed since token was issued
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  let payload: JWTPayload;
  try {
    payload = jwt.verify(token, ACTUAL_JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }

  // If token has no password signature, it's an old token - still valid for backwards compatibility
  if (!payload.pwdSig) return payload;

  // Check if password hash still matches the signature in the token
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { passwordHash: true },
  });

  if (!user) return null;

  const currentSig = createPasswordSignature(user.passwordHash);
  if (currentSig !== payload.pwdSig) {
    // Password has changed - invalidate token
    return null;
  }

  return payload;
}

/**
 * Set authentication cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Get authentication token from cookie
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TOKEN_COOKIE_NAME);
  return cookie?.value || null;
}

/**
 * Remove authentication cookie
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}

/**
 * Get current user from token
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Generate a random API key
 */
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'tk_'; // prefix for translations key
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * Hash an API key for storage
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, SALT_ROUNDS);
}

/**
 * Verify an API key against a hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  return bcrypt.compare(apiKey, hash);
}
