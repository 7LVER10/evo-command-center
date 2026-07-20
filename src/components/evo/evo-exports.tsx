'use client';

import { useState } from 'react';
import { useEvoStore } from '@/lib/evo/store';
import { t, nicheLabel } from '@/lib/evo/i18n';
import { Printer, Copy, FileText, Star, Crown } from 'lucide-react';
import type { ExportTier } from '@/lib/evo/vnext-types';

const tiers: { key: ExportTier; labelKey: string; icon: typeof Printer; color: string; desc: string }[] = [
  { key: 'minimal', labelKey: 'tierMinimal', icon: FileText, color: 'text-slate-300', desc: 'tierMinimalDesc' },
  { key: 'standard', labelKey: 'tierStandard', icon: Star, color: 'text-cyan-300', desc: 'tierStandardDesc' },
  { key: 'premium', labelKey: 'tierPremium', icon: Crown, color: 'text-amber-300', desc: 'tierPremiumDesc' },
];

export default function EvoExports() {
  const { locale, enrichedProjects, exportEnriched, copyExport } = useEvoStore();
  const [selectedTier, setSelectedTier] = useState<ExportTier>('standard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t(locale, 'exportsView')}</h1>
        <p className="text-sm text-slate-500">{t(locale, 'exportTierDesc')}</p>
      </div>

      {/* Tier Selector */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'exportSelectTier')}</h3>
        <div className="grid grid-cols-3 gap-3">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isActive = selectedTier === tier.key;
            return (
              <button
                key={tier.key}
                onClick={() => setSelectedTier(tier.key)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-cyan-400/40 bg-cyan-400/10'
                    : 'border-white/6 bg-white/3 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : tier.color}`} />
                  <span className={`text-sm font-semibold ${isActive ? 'text-cyan-300' : 'text-white'}`}>
                    {t(locale, tier.labelKey)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{t(locale, tier.desc)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'enrichedProjectsAvailable')}</h3>
        {enrichedProjects.length > 0 ? (
          <div className="space-y-2">
            {enrichedProjects.slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded bg-white/3">
                <div>
                  <div className="text-sm text-white">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.country} · {nicheLabel(locale, p.niche)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400">{t(locale, 'oppShort')}:{p.scores?.opportunity?.value}</span>
                  <button
                    onClick={() => exportEnriched(p, 'html_report', selectedTier)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 transition"
                    title={t(locale, 'exportHtmlReport')}
                  >
                    <Printer className="w-3 h-3" />
                    {t(locale, 'exportHtmlReport')}
                  </button>
                  <button
                    onClick={() => copyExport(p, 'brief')}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-white/5 text-slate-400 hover:bg-white/10 transition"
                    title={t(locale, 'copyBrief')}
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center py-4">{t(locale, 'runAnalysisFirst')}</div>
        )}
      </div>
    </div>
  );
}
