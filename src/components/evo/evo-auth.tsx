'use client';

import { useState } from 'react';
import { useEvoStore } from '@/lib/evo/store';
import { t } from '@/lib/evo/i18n';
import { Mail, Lock, X, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EvoAuth({ isOpen, onClose }: AuthModalProps) {
  const { locale, setOwnerToken } = useEvoStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, provider: 'email' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      setOwnerToken(data.sessionId);
      onClose();
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    // OAuth providers would redirect to their auth pages
    // For now, show a placeholder message
    setError(`${provider} authentication requires OAuth configuration. Contact admin to set up ${provider} provider.`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-gradient-to-br from-[#1c202d]/95 to-[#12141e]/90 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/6">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">{mode === 'login' ? t(locale, 'authLogin') : t(locale, 'authRegister')}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <input
                type="text"
                placeholder={t(locale, 'authDisplayName')}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/40"
              />
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder={t(locale, 'authEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/40"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder={t(locale, 'authPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/40"
                required
              />
            </div>
            {error && <div className="text-xs text-rose-400">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:shadow-lg hover:shadow-cyan-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? '...' : mode === 'login' ? t(locale, 'authLoginBtn') : t(locale, 'authRegisterBtn')}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              {mode === 'login' ? t(locale, 'authSwitchToRegister') : t(locale, 'authSwitchToLogin')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
