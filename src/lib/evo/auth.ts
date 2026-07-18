import { NextRequest } from 'next/server';
import { logger } from './logger';

export function assertOwnerToken(request: NextRequest): { ok: boolean; error?: string; status?: number } {
  const expected = process.env.EVO_OWNER_TOKEN;

  if (!expected) {
    logger.warn('auth', 'token_check:env_missing', { note: 'EVO_OWNER_TOKEN not set — allowing access in dev mode' });
    return { ok: true };
  }

  const provided = request.headers.get('x-evo-token');

  if (!provided || provided !== expected) {
    logger.warn('auth', 'token_check:denied', { note: 'missing or invalid token' });
    return { ok: false, error: 'Unauthorized', status: 401 };
  }

  return { ok: true };
}
