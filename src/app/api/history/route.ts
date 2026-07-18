import { NextRequest, NextResponse } from 'next/server';
import { getHistoryEntries, insertHistoryEntry, clearHistoryEntries } from '@/lib/evo/db';
import { logger } from '@/lib/evo/logger';
import { assertOwnerToken } from '@/lib/evo/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = assertOwnerToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const entries = getHistoryEntries(100);
    logger.info('api/history', 'GET:success', { count: entries.length });
    return NextResponse.json(entries, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (err) {
    logger.error('api/history', 'GET:failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = assertOwnerToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    insertHistoryEntry(body);
    logger.info('api/history', 'POST:success');
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('api/history', 'POST:failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = assertOwnerToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    clearHistoryEntries();
    logger.info('api/history', 'DELETE:success');
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('api/history', 'DELETE:failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}
