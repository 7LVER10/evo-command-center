import { NextRequest, NextResponse } from 'next/server';
import { updateProjectStatus } from '@/lib/evo/data';

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
      updateProjectStatus(projectId, body.status);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
