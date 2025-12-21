/**
 * Database connection and utilities
 * 
 * This file now uses Prisma ORM for database access.
 */

import { prisma } from './prisma';

// Export prisma instance for direct use
export { prisma };

// Export Prisma types
export type { Prisma } from './prisma';