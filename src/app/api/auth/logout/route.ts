// Auth logout endpoint — clears session
import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/evo/auth-user';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('evo_session')?.value;

  if (sessionId) {
    deleteSession(sessionId);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('evo_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' });

  return response;
}
