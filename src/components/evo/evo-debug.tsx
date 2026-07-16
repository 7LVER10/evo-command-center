'use client';

import { useState } from 'react';
import { useEvoStore } from '@/lib/evo/store';
import { t } from '@/lib/evo/i18n';
import { Bug, Copy, Check } from 'lucide-react';

export default function EvoDebug() {
  const { locale, projects, enrichedProjects, analysisHistory } = useEvoStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'enriched' | 'history'>('projects');

  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">{t(locale, 'debugView')}</h1>
          <p className="text-sm text-slate-500">Debug view is only available in development mode</p>
        </div>
      </div>
    );
  }

  const data = activeTab === 'projects' ? projects : activeTab === 'enriched' ? enrichedProjects : analysisHistory;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{t(locale, 'debugView')}</h1>
          <p className="text-sm text-slate-500">Raw data inspection and debugging</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['projects', 'enriched', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="ml-2 text-xs text-slate-500">
              ({tab === 'projects' ? projects.length : tab === 'enriched' ? enrichedProjects.length : analysisHistory.length})
            </span>
          </button>
        ))}
      </div>

      {/* JSON Viewer */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-white/6 flex items-center gap-2">
          <Bug className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500">{t(locale, 'rawPayload')}</span>
          <span className="text-xs text-slate-600">· {data.length} items</span>
        </div>
        <pre className="p-4 text-[11px] text-slate-400 overflow-auto max-h-[600px] font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
