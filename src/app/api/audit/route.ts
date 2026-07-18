import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/evo/db';
import { logger } from '@/lib/evo/logger';
import { assertOwnerToken } from '@/lib/evo/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = assertOwnerToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM analysis_audits ORDER BY id DESC LIMIT 50').all();
    logger.info('api/audit', 'GET:success', { count: rows.length });
    return NextResponse.json(rows, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (err) {
    logger.error('api/audit', 'GET:failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Failed to load audit trail' }, { status: 500 });
  }
}
