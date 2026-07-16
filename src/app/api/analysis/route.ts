import { NextRequest, NextResponse } from 'next/server';
import { runAnalysis } from '@/lib/evo/data';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query = '', country = 'all', niche = 'all', stage = 'all' } = body;
    const result = runAnalysis(query, country, niche, stage);
    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
