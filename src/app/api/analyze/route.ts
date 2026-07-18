import { NextRequest, NextResponse } from 'next/server';
import { getFilteredProjects } from '@/lib/evo/data';
import { runAgentStack, generateSignals } from '@/lib/evo/agent-engine';
import { logger } from '@/lib/evo/logger';
import { MemoryCache, buildCacheKey } from '@/lib/evo/cache';
import type { Locale } from '@/lib/evo/types';

export const dynamic = 'force-dynamic';

const analysisCache = new MemoryCache(5 * 60 * 1000);

export async function POST(request: NextRequest) {
  const start = Date.now();
  try {
    const body = await request.json();
    const { query = '', country = 'all', niche = 'all', stage = 'all', locale = 'en' } = body;

    const cacheKey = buildCacheKey({ query, country, niche, stage, locale });

    const cached = analysisCache.get(cacheKey);
    if (cached) {
      const durationMs = Date.now() - start;
      logger.info('api/analyze', 'cache_hit', { cacheKey, durationMs });
      return NextResponse.json(cached, {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    logger.info('api/analyze', 'start', { query, country, niche, stage, locale });

    const items = getFilteredProjects(query, country, niche, stage);
    const enriched = items.map((project) => {
      const agentResult = runAgentStack(project, locale as Locale);
      return { ...project, ...agentResult };
    });

    const signals = generateSignals(items, enriched);
    const result = { enrichedProjects: enriched, signals };

    analysisCache.set(cacheKey, result);

    const durationMs = Date.now() - start;
    logger.info('api/analyze', 'cache_miss', { items: items.length, enriched: enriched.length, signals: signals.length, durationMs });

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (err) {
    const durationMs = Date.now() - start;
    logger.error('api/analyze', 'failed', { error: err instanceof Error ? err.message : String(err), durationMs });
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
