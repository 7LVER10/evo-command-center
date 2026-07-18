import { NextRequest, NextResponse } from 'next/server';
import { getFilteredProjects } from '@/lib/evo/data';
import { runAgentStack, generateSignals } from '@/lib/evo/agent-engine';
import { logger } from '@/lib/evo/logger';
import { MemoryCache, buildCacheKey } from '@/lib/evo/cache';
import { insertAnalysisAudit } from '@/lib/evo/db';
import type { Locale } from '@/lib/evo/types';
import type { EnrichedProject } from '@/lib/evo/vnext-types';
import type { MarketSignal } from '@/lib/evo/types';

export const dynamic = 'force-dynamic';

interface AnalysisResult {
  enrichedProjects: EnrichedProject[];
  signals: MarketSignal[];
}

const analysisCache = new MemoryCache<AnalysisResult>(5 * 60 * 1000);

export async function POST(request: NextRequest) {
  const start = Date.now();
  let cacheStatus = 'miss';
  let projectCount = 0;
  let signalCount = 0;
  let status = 'success';
  let errorSummary: string | undefined;

  try {
    const body = await request.json();
    const { query = '', country = 'all', niche = 'all', stage = 'all', locale = 'en' } = body;
    const filtersSummary = JSON.stringify({ query, country, niche, stage });

    const cacheKey = buildCacheKey({ query, country, niche, stage, locale });

    const cached = analysisCache.get(cacheKey);
    if (cached) {
      cacheStatus = 'hit';
      projectCount = cached.enrichedProjects.length;
      signalCount = cached.signals.length;
      const durationMs = Date.now() - start;
      logger.info('api/analyze', 'cache_hit', { cacheKey, durationMs });
      insertAnalysisAudit({ filtersSummary, locale, cacheStatus, projectCount, signalCount, status: 'success', durationMs });
      return NextResponse.json(cached, {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    logger.info('api/analyze', 'start', { query, country, niche, stage, locale });

    const items = getFilteredProjects(query, country, niche, stage);
    projectCount = items.length;
    const enriched = items.map((project) => {
      const agentResult = runAgentStack(project, locale as Locale);
      return { ...project, ...agentResult };
    });

    const signals = generateSignals(items, enriched);
    signalCount = signals.length;
    const result = { enrichedProjects: enriched, signals };

    analysisCache.set(cacheKey, result);

    const durationMs = Date.now() - start;
    logger.info('api/analyze', 'cache_miss', { items: items.length, enriched: enriched.length, signals: signals.length, durationMs });
    insertAnalysisAudit({ filtersSummary, locale, cacheStatus, projectCount, signalCount, status: 'success', durationMs });

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (err) {
    status = 'failure';
    errorSummary = err instanceof Error ? err.message : String(err);
    const durationMs = Date.now() - start;
    logger.error('api/analyze', 'failed', { error: errorSummary, durationMs });
    insertAnalysisAudit({ filtersSummary: '{}', locale: 'en', cacheStatus, projectCount, signalCount, status, durationMs, errorSummary });
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
