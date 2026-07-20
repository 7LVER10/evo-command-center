'use client';

import { useEvoStore } from '@/lib/evo/store';
import { t } from '@/lib/evo/i18n';
import { FileText, Star, Crown, Check, X as XIcon } from 'lucide-react';
import { SUBSCRIPTION_TIERS, getRemainingAnalyses, getRemainingReports, SubscriptionTier } from '@/lib/evo/subscriptions';
import type { ExportTier } from '@/lib/evo/vnext-types';

const tierIcons: Record<ExportTier, typeof FileText> = { minimal: FileText, standard: Star, premium: Crown };
const tierColors: Record<ExportTier, string> = { minimal: 'slate', standard: 'cyan', premium: 'amber' };

export default function EvoPlans() {
  const { locale, subscription, setSubscriptionTier } = useEvoStore();
  const remainingAnalyses = getRemainingAnalyses(subscription);
  const remainingReports = getRemainingReports(subscription);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t(locale, 'plansTitle')}</h1>
        <p className="text-sm text-slate-500">{t(locale, 'plansSubtitle')}</p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">{t(locale, 'currentPlan')}</div>
            <div className="text-lg font-bold text-white">{SUBSCRIPTION_TIERS[subscription.currentTier].name}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">{remainingAnalyses} {t(locale, 'analysesRemaining')}</div>
            <div className="text-xs text-slate-500">{remainingReports} {t(locale, 'reportsRemaining')}</div>
          </div>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.values(SUBSCRIPTION_TIERS) as SubscriptionTier[]).map((tier) => {
          const Icon = tierIcons[tier.id];
          const color = tierColors[tier.id];
          const isActive = subscription.currentTier === tier.id;
          return (
            <div
              key={tier.id}
              className={`rounded-xl border p-5 transition-all ${
                isActive
                  ? `border-${color}-400/40 bg-${color}-400/5`
                  : 'border-white/6 bg-white/3 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 text-${color}-400`} />
                <h3 className="text-base font-bold text-white">{tier.name}</h3>
                {isActive && <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300">{t(locale, 'currentPlan')}</span>}
              </div>
              <p className="text-xs text-slate-500 mb-3">{tier.tagline}</p>
              <div className="mb-3">
                <span className="text-2xl font-bold text-white">{tier.price}</span>
                <span className="text-xs text-slate-500">{tier.priceNote}</span>
              </div>
              <div className="space-y-1.5 mb-4">
                {tier.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              {tier.lockedFeatures.length > 0 && (
                <div className="space-y-1.5 mb-4 border-t border-white/5 pt-3">
                  {tier.lockedFeatures.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <XIcon className="w-3 h-3 text-slate-600 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-[10px] text-slate-600 mb-3">
                {tier.limits.projects} {t(locale, 'planProjects')} · {tier.limits.analysesPerMonth} {t(locale, 'planAnalyses')}/mo · {tier.limits.clientReportsPerMonth} {t(locale, 'planReports')}/mo
              </div>
              {!isActive && (
                <button
                  onClick={() => setSubscriptionTier(tier.id)}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition ${
                    tier.id === 'premium'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {t(locale, 'planSelect')}
                </button>
              )}
              {isActive && (
                <div className={`w-full py-2 rounded-lg text-xs font-semibold text-center bg-${color}-400/10 text-${color}-400`}>
                  {t(locale, 'planActive')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage Limits Detail */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'usageLimits')}</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{subscription.analysesUsed}</div>
            <div className="text-xs text-slate-500">{t(locale, 'analysesUsed')} / {SUBSCRIPTION_TIERS[subscription.currentTier].limits.analysesPerMonth}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{subscription.reportsUsed}</div>
            <div className="text-xs text-slate-500">{t(locale, 'reportsUsed')} / {SUBSCRIPTION_TIERS[subscription.currentTier].limits.clientReportsPerMonth}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{subscription.projectsViewed}</div>
            <div className="text-xs text-slate-500">{t(locale, 'projectsViewed')} / {SUBSCRIPTION_TIERS[subscription.currentTier].limits.projects}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
