import { NextRequest, NextResponse } from 'next/server';
import { getHistoryEntries, insertHistoryEntry, clearHistoryEntries } from '@/lib/evo/db';
import { logger } from '@/lib/evo/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
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

export async function DELETE() {
  try {
    clearHistoryEntries();
    logger.info('api/history', 'DELETE:success');
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('api/history', 'DELETE:failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}
