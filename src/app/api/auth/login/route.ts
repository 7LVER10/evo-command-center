import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, createSession } from '@/lib/evo/auth-user';
import { logger } from '@/lib/evo/logger';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName, provider } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    let user = getUserByEmail(normalizedEmail);

    if (provider === 'google' || provider === 'github') {
      // OAuth flow: create or link user
      if (!user) {
        user = createUser(normalizedEmail, displayName || normalizedEmail.split('@')[0], null, provider);
      }
    } else if (provider === 'email') {
      // Email/password flow
      if (!password || typeof password !== 'string') {
        return NextResponse.json({ error: 'Password required' }, { status: 400 });
      }
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

      if (!user) {
        user = createUser(normalizedEmail, displayName || normalizedEmail.split('@')[0], passwordHash, 'email');
      }

      if (user && user.password_hash && user.password_hash !== passwordHash) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    } else if (provider === 'wallet') {
      // Web3 wallet flow
      if (!user) {
        user = createUser(normalizedEmail, displayName || 'Wallet User', null, 'wallet');
      }
    } else {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    const sessionId = createSession(user.id);
    logger.info('auth', 'login:success', { userId: user.id, provider: provider || 'email' });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, displayName: user.display_name, tier: user.subscription_tier },
      sessionId,
    });
    response.cookies.set('evo_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    logger.error('auth', 'login:failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
