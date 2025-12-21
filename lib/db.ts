/**
 * Database connection and utilities
 * 
 * This file now uses Prisma ORM for database access.
 * The legacy mysql2 functions are kept for reference but should not be used.
 */

import { prisma } from './prisma';

// Export prisma instance for direct use
export { prisma };

// Export Prisma types
export type { Prisma } from './prisma';

/**
 * @deprecated Use prisma directly instead
 * Legacy mysql2/promise imports - kept for reference during migration
 */
import mysql from 'mysql2/promise';

// Connection configuration (legacy)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'translations',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool (legacy)
let pool: mysql.Pool | null = null;

/**
 * @deprecated Use prisma directly instead
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * @deprecated Use prisma queries instead
 */
export async function query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

/**
 * @deprecated Use prisma queries instead
 */
export async function queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * @deprecated Use prisma queries instead
 */
export async function execute(sql: string, params?: unknown[]): Promise<mysql.ResultSetHeader> {
  const pool = getPool();
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

/**
 * Close pool on app shutdown
 * @deprecated Use prisma.$disconnect() instead
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
  await prisma.$disconnect();
}

