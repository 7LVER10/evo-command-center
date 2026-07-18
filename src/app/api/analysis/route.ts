import { NextRequest, NextResponse } from 'next/server';
import { runAnalysis } from '@/lib/evo/data';
import { logger } from '@/lib/evo/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query = '', country = 'all', niche = 'all', stage = 'all' } = body;
    logger.info('api/analysis', 'POST:start', { query, country, niche, stage });
    const result = runAnalysis(query, country, niche, stage);
    logger.info('api/analysis', 'POST:success', { items: result.items.length });
    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (err) {
    logger.error('api/analysis', 'POST:failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
