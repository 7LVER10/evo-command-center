'use client';

import { useState } from 'react';
import { useEvoStore } from '@/lib/evo/store';
import { t, nicheLabel } from '@/lib/evo/i18n';
import { Printer, Copy, FileText, Star, Crown, Lock } from 'lucide-react';
import { SUBSCRIPTION_TIERS, canExportReport, canUseExportFormat } from '@/lib/evo/subscriptions';
import type { ExportTier } from '@/lib/evo/vnext-types';

const tiers: { key: ExportTier; labelKey: string; icon: typeof Printer; color: string; desc: string }[] = [
  { key: 'minimal', labelKey: 'tierMinimal', icon: FileText, color: 'text-slate-300', desc: 'tierMinimalDesc' },
  { key: 'standard', labelKey: 'tierStandard', icon: Star, color: 'text-cyan-300', desc: 'tierStandardDesc' },
  { key: 'premium', labelKey: 'tierPremium', icon: Crown, color: 'text-amber-300', desc: 'tierPremiumDesc' },
];

export default function EvoExports() {
  const { locale, enrichedProjects, exportEnriched, copyExport, subscription } = useEvoStore();
  const [selectedTier, setSelectedTier] = useState<ExportTier>('standard');
  const tierDef = SUBSCRIPTION_TIERS[subscription.currentTier];
  const isPremiumTier = selectedTier === 'premium' && subscription.currentTier !== 'premium';
  const isStandardTier = selectedTier === 'standard' && subscription.currentTier === 'minimal';
  const canExport = canExportReport(subscription, selectedTier);

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
            const isLocked = (tier.key === 'premium' && subscription.currentTier !== 'premium') ||
                             (tier.key === 'standard' && subscription.currentTier === 'minimal');
            return (
              <button
                key={tier.key}
                onClick={() => !isLocked && setSelectedTier(tier.key)}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isActive
                    ? 'border-cyan-400/40 bg-cyan-400/10'
                    : isLocked
                      ? 'border-white/4 bg-white/2 opacity-60'
                      : 'border-white/6 bg-white/3 hover:bg-white/5'
                }`}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-3 h-3 text-slate-500" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : tier.color}`} />
                  <span className={`text-sm font-semibold ${isActive ? 'text-cyan-300' : 'text-white'}`}>
                    {t(locale, tier.labelKey)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{t(locale, tier.desc)}</p>
                {isLocked && (
                  <p className="text-[10px] text-amber-400 mt-1">{t(locale, 'tierLocked')}</p>
                )}
              </button>
            );
          })}
        </div>
        {isPremiumTier && (
          <div className="mt-3 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
            {t(locale, 'upgradeToPremium')}
          </div>
        )}
        {isStandardTier && (
          <div className="mt-3 text-xs text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-lg px-3 py-2">
            {t(locale, 'upgradeToStandard')}
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">{t(locale, 'enrichedProjectsAvailable')}</h3>
          <span className="text-[10px] text-slate-500">
            {subscription.reportsUsed}/{tierDef.limits.clientReportsPerMonth} {t(locale, 'planReports')} {t(locale, 'planRemaining')}
          </span>
        </div>
        {enrichedProjects.length > 0 ? (
          <div className="space-y-2">
            {enrichedProjects.slice(0, Math.min(enrichedProjects.length, tierDef.limits.projects)).map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded bg-white/3">
                <div>
                  <div className="text-sm text-white">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.country} · {nicheLabel(locale, p.niche)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400">{t(locale, 'oppShort')}:{p.scores?.opportunity?.value}</span>
                  <button
                    onClick={() => { if (canExport) { exportEnriched(p, 'html_report', selectedTier); } }}
                    disabled={!canExport}
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition ${
                      canExport
                        ? 'bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20'
                        : 'bg-white/5 text-slate-600 cursor-not-allowed'
                    }`}
                    title={canExport ? t(locale, 'exportHtmlReport') : t(locale, 'reportLimitReached')}
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
            {enrichedProjects.length > tierDef.limits.projects && (
              <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
                {t(locale, 'projectLimitReached').replace('{n}', String(tierDef.limits.projects))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center py-4">{t(locale, 'runAnalysisFirst')}</div>
        )}
      </div>
    </div>
  );
}
