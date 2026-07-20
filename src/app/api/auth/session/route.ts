import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/evo/auth-user';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('evo_session')?.value;

  if (!sessionId) {
    return NextResponse.json({ authenticated: false });
  }

  const user = getSessionUser(sessionId);

  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: { id: user.id, email: user.email, displayName: user.display_name, tier: user.subscription_tier, avatarUrl: user.avatar_url },
  });
}
