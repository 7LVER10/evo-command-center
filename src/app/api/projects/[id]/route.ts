import { NextRequest, NextResponse } from 'next/server';
import { updateProjectStatus } from '@/lib/evo/data';
import { logger } from '@/lib/evo/logger';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = ['active', 'pending', 'completed', 'archived'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    if (body.status && !ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    if (body.status) {
      logger.info('api/projects/[id]', 'PATCH:status_change', { projectId, newStatus: body.status, actor: 'owner' });
      updateProjectStatus(projectId, body.status);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('api/projects/[id]', 'PATCH:failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
