import { NextResponse } from 'next/server';
import { getAllProjects } from '@/lib/evo/data';
import { logger } from '@/lib/evo/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = getAllProjects();
    logger.info('api/projects', 'GET:success', { count: projects.length });
    return NextResponse.json(projects, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (err) {
    logger.error('api/projects', 'GET:failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
  }
}
