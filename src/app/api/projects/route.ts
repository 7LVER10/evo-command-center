import { NextResponse } from 'next/server';
import { getAllProjects } from '@/lib/evo/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const projects = getAllProjects();
  return NextResponse.json(projects, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
