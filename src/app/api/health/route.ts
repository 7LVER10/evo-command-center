import { NextResponse } from 'next/server';
import { getDb } from '@/lib/evo/db';
import { logger } from '@/lib/evo/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, 'ok' | 'fail'> = {};

  // SQLite check
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    checks.sqlite = 'ok';
  } catch (err) {
    checks.sqlite = 'fail';
    logger.error('health', 'sqlite_check_failed', { error: err instanceof Error ? err.message : String(err) });
  }

  // Determine overall status
  const allOk = Object.values(checks).every(v => v === 'ok');
  const anyFail = Object.values(checks).some(v => v === 'fail');
  const status = allOk ? 'ok' : anyFail ? 'down' : 'degraded';

  const response = {
    status,
    checks,
    timestamp: new Date().toISOString(),
  };

  logger.info('health', 'check', { status, checks });

  return NextResponse.json(response, {
    status: status === 'down' ? 503 : 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
