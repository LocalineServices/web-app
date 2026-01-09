/**
 * Configuration API endpoint
 * GET /api/config
 */

import { NextResponse } from 'next/server';
import { areSignupsEnabled } from '@/lib/auth';

export async function GET() {
  return NextResponse.json({
    signupsEnabled: areSignupsEnabled(),
  });
}
