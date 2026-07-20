import { getDb } from './db';
import { logger } from './logger';
import crypto from 'crypto';

export interface User {
  id: number;
  email: string;
  display_name: string;
  avatar_url: string | null;
  auth_provider: string;
  subscription_tier: string;
  password_hash: string | null;
  created_at: string;
  last_login: string;
}

export function initUserSchema(db: ReturnType<typeof getDb>) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      avatar_url TEXT,
      auth_provider TEXT NOT NULL DEFAULT 'email',
      subscription_tier TEXT NOT NULL DEFAULT 'minimal',
      password_hash TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

export function createUser(email: string, displayName: string, passwordHash: string | null, provider: string): User | null {
  try {
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO users (email, display_name, auth_provider, password_hash) VALUES (?, ?, ?, ?)'
    ).run(email, displayName, provider, passwordHash);
    return getUserById(result.lastInsertRowid as number);
  } catch (err) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return getUserByEmail(email);
    }
    logger.error('auth', 'createUser:failed', { error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export function getUserByEmail(email: string): User | null {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | null;
  } catch {
    return null;
  }
}

export function getUserById(id: number): User | null {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | null;
  } catch {
    return null;
  }
}

export function createSession(userId: number): string {
  const db = getDb();
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO user_sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(sessionId, userId, expiresAt);
  db.prepare('UPDATE users SET last_login = datetime(\'now\') WHERE id = ?').run(userId);
  return sessionId;
}

export function getSessionUser(sessionId: string): User | null {
  try {
    const db = getDb();
    const session = db.prepare(
      'SELECT u.* FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime(\'now\')'
    ).get(sessionId) as User | undefined;
    return session || null;
  } catch {
    return null;
  }
}

export function deleteSession(sessionId: string) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM user_sessions WHERE id = ?').run(sessionId);
  } catch {}
}

export function updateUserTier(userId: number, tier: string) {
  try {
    const db = getDb();
    db.prepare('UPDATE users SET subscription_tier = ? WHERE id = ?').run(tier, userId);
  } catch (err) {
    logger.error('auth', 'updateUserTier:failed', { error: err instanceof Error ? err.message : String(err) });
  }
}
