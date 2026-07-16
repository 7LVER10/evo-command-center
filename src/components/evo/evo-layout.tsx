'use client';

import { useEvoStore } from '@/lib/evo/store';
import { t } from '@/lib/evo/i18n';
import {
  LayoutDashboard, FolderOpen, GitBranch, Radio, Clock,
  Download, HeartPulse, Bug, Search, Bell, ChevronRight,
  Globe, Zap
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { id: 'projects', icon: FolderOpen, labelKey: 'projectsView' },
  { id: 'pipeline', icon: GitBranch, labelKey: 'pipeline' },
  { id: 'signals', icon: Radio, labelKey: 'signals' },
  { id: 'history', icon: Clock, labelKey: 'history' },
  { id: 'exports', icon: Download, labelKey: 'exports' },
  { id: 'health', icon: HeartPulse, labelKey: 'systemHealth' },
  { id: 'debug', icon: Bug, labelKey: 'debug' },
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
  const { locale, setLocale, searchQuery, setSearchQuery, runAnalysis, analysisStatus, projects } = useEvoStore();

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
          <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">System</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Agent Stack</span>
              <span className="text-emerald-400">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Projects</span>
              <span className="text-cyan-400">{projects.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Persistence</span>
              <span className="text-emerald-400">OK</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-[#0a0c12]/80 backdrop-blur-xl border-b border-white/6 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
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
            <button
              onClick={runAnalysis}
              disabled={analysisStatus === 'loading'}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                analysisStatus === 'loading'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:shadow-lg hover:shadow-cyan-500/20'
              }`}
            >
              {analysisStatus === 'loading' ? t(locale, 'running') : t(locale, 'runAnalysis')}
            </button>
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
