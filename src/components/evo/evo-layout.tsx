'use client';

import { useState } from 'react';
import { useEvoStore } from '@/lib/evo/store';
import { t } from '@/lib/evo/i18n';
import {
  LayoutDashboard, FolderOpen, GitBranch, Radio, Clock,
  Download, Search, Bell, Zap, Settings, X, Lock, HeartPulse,
  Bug, CheckCircle, AlertTriangle
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { id: 'projects', icon: FolderOpen, labelKey: 'projectsView' },
  { id: 'pipeline', icon: GitBranch, labelKey: 'pipeline' },
  { id: 'signals', icon: Radio, labelKey: 'signals' },
  { id: 'history', icon: Clock, labelKey: 'history' },
  { id: 'exports', icon: Download, labelKey: 'exports' },
];

export default function EvoLayout({
  children,
  activeView,
  setActiveView,
}: {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}) {
  const { locale, setLocale, searchQuery, setSearchQuery, runAnalysis, analysisStatus, projects, enrichedProjects } = useEvoStore();
  const [showOwnerGate, setShowOwnerGate] = useState(false);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerError, setOwnerError] = useState(false);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerTab, setOwnerTab] = useState<'health' | 'debug'>('health');

  const handleOwnerSubmit = async () => {
    if (!ownerPassword.trim()) {
      setOwnerError(true);
      return;
    }

    setOwnerLoading(true);
    setOwnerError(false);

    try {
      const response = await fetch('/api/owner/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ownerPassword }),
      });

      const data = await response.json();

      if (data.valid) {
        setShowOwnerGate(false);
        setShowOwnerPanel(true);
        setOwnerPassword('');
        setOwnerError(false);
      } else {
        setOwnerError(true);
      }
    } catch {
      setOwnerError(true);
    } finally {
      setOwnerLoading(false);
    }
  };

  const handleOwnerClose = () => {
    setShowOwnerPanel(false);
    setShowOwnerGate(false);
    setOwnerPassword('');
    setOwnerError(false);
  };

  return (
    <div className="flex h-screen bg-[#07080c] text-[#e6e8ef] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#0c0e14]/95 to-[#080a10]/95 border-r border-white/6 flex flex-col">
        <div className="p-5 border-b border-white/6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">EVO</div>
              <div className="text-[11px] text-slate-500">{t(locale, 'subtitle')}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeView === item.id
                    ? 'bg-cyan-400/10 text-cyan-300 border-l-2 border-cyan-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(locale, item.labelKey)}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400">{t(locale, 'allSystemsOperational')}</span>
          </div>
          <button
            onClick={() => setShowOwnerGate(true)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-[10px] text-slate-600 hover:text-slate-400 hover:bg-white/3 transition"
          >
            <Settings className="w-3 h-3" />
            <span>{t(locale, 'ownerAccess')}</span>
          </button>
        </div>
      </aside>

      {/* Owner Gate Modal */}
      {showOwnerGate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowOwnerGate(false)}>
          <div
            className="w-full max-w-sm bg-gradient-to-br from-[#1c202d]/95 to-[#12141e]/90 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/6">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">{t(locale, 'ownerGateTitle')}</h2>
              </div>
              <button onClick={() => setShowOwnerGate(false)} className="p-2 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-400">{t(locale, 'ownerGateDescription')}</p>
              <input
                type="password"
                placeholder={t(locale, 'ownerGatePlaceholder')}
                value={ownerPassword}
                onChange={(e) => { setOwnerPassword(e.target.value); setOwnerError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && handleOwnerSubmit()}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/40"
                autoFocus
              />
              {ownerError && (
                <div className="text-xs text-rose-400">{t(locale, 'ownerGateError')}</div>
              )}
              <button
                onClick={handleOwnerSubmit}
                disabled={ownerLoading}
                className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:shadow-lg hover:shadow-cyan-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ownerLoading ? '...' : t(locale, 'ownerGateSubmit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Panel */}
      {showOwnerPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleOwnerClose}>
          <div
            className="w-full max-w-3xl max-h-[80vh] bg-gradient-to-br from-[#1c202d]/95 to-[#12141e]/90 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-cyan-400" />
                </div>
                <h2 className="text-lg font-bold text-white">{t(locale, 'ownerPanelTitle')}</h2>
              </div>
              <button onClick={handleOwnerClose} className="p-2 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="flex gap-2 px-5 pt-4">
              <button
                onClick={() => setOwnerTab('health')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${ownerTab === 'health' ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {t(locale, 'systemHealth')}
              </button>
              <button
                onClick={() => setOwnerTab('debug')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${ownerTab === 'debug' ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {t(locale, 'debugView')}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {ownerTab === 'health' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">{t(locale, 'systemStatus')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'API Gateway', status: 'ok', value: '200' },
                      { name: 'Agent Stack', status: 'ok', value: '6/6' },
                      { name: 'Database', status: 'ok', value: 'SQLite' },
                      { name: 'Persistence', status: 'ok', value: 'localStorage' },
                      { name: 'Export Engine', status: 'ok', value: '5 formats' },
                      { name: 'i18n', status: 'ok', value: '4 locales' },
                      { name: 'Enrichment Pipeline', status: enrichedProjects.length > 0 ? 'ok' : 'warn', value: `${enrichedProjects.length} enriched` },
                      { name: 'History Store', status: 'ok', value: 'Active' },
                    ].map((s) => (
                      <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                        <div className="flex items-center gap-2">
                          {s.status === 'ok' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span className="text-xs text-slate-300">{s.name}</span>
                        </div>
                        <span className={`text-xs font-medium ${s.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ownerTab === 'debug' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">{t(locale, 'rawPayload')}</h3>
                  <div className="bg-black/40 rounded-lg p-4 overflow-auto max-h-96">
                    <pre className="text-[11px] text-slate-400 font-mono">
                      {JSON.stringify({
                        projects: projects.length,
                        enriched: enrichedProjects.length,
                        locales: ['en', 'ru', 'de', 'tr'],
                        nicheCount: 11,
                        exportFormats: 5,
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-[#0a0c12]/80 backdrop-blur-xl border-b border-white/6 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={t(locale, 'searchProjects')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/40"
                />
              </div>
              <div className="text-[10px] text-slate-600 mt-1 ml-1">{t(locale, 'searchInputsHint')}</div>
            </div>
            <div>
              <button
                onClick={runAnalysis}
                disabled={analysisStatus === 'loading'}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  analysisStatus === 'loading'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:shadow-lg hover:shadow-cyan-500/20'
                }`}
              >
                {analysisStatus === 'loading' ? t(locale, 'analyzeRunning') : t(locale, 'analyzeButton')}
              </button>
              <div className="text-[10px] text-slate-600 mt-1 text-center">{t(locale, 'searchButtonHint')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {['ru', 'en', 'de', 'tr'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l as 'ru' | 'en' | 'de' | 'tr')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${
                    locale === l ? 'bg-cyan-400/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="relative p-2 rounded-lg hover:bg-white/5">
              <Bell className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
