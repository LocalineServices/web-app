/**
 * Prisma Client Singleton
 * Ensures a single Prisma Client instance is used throughout the application
 */

import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseHost = process.env.DATABASE_HOST;
const databasePort = process.env.DATABASE_PORT;
const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD;
const databaseName = process.env.DATABASE_NAME;

// Create Prisma client factory
function createPrismaClient(): PrismaClient | undefined {
  if (!databaseHost || !databasePort || !databaseUser || !databasePassword || !databaseName) {
    return undefined;
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    adapter: new PrismaMariaDb({ host: databaseHost, port: Number(databasePort), user: databaseUser, password: databasePassword, database: databaseName })
  });
}

export const prisma = (globalForPrisma.prisma ?? createPrismaClient()) as PrismaClient;

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

// Export Prisma types for convenience
export type { Prisma } from '@prisma/client';
