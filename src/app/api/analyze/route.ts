import { NextRequest, NextResponse } from 'next/server';
import { getFilteredProjects } from '@/lib/evo/data';
import { runAgentStack, generateSignals } from '@/lib/evo/agent-engine';
import { logger } from '@/lib/evo/logger';
import type { Locale } from '@/lib/evo/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const start = Date.now();
  try {
    const body = await request.json();
    const { query = '', country = 'all', niche = 'all', stage = 'all', locale = 'en' } = body;

    logger.info('api/analyze', 'start', { query, country, niche, stage, locale });

    const items = getFilteredProjects(query, country, niche, stage);
    const enriched = items.map((project) => {
      const agentResult = runAgentStack(project, locale as Locale);
      return { ...project, ...agentResult };
    });

    const signals = generateSignals(items, enriched);
    const durationMs = Date.now() - start;

    logger.info('api/analyze', 'success', { items: items.length, enriched: enriched.length, signals: signals.length, durationMs });

    return NextResponse.json({ enrichedProjects: enriched, signals }, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (err) {
    const durationMs = Date.now() - start;
    logger.error('api/analyze', 'failed', { error: err instanceof Error ? err.message : String(err), durationMs });
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
