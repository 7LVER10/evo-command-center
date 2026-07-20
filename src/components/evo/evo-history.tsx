'use client';

import { useEvoStore } from '@/lib/evo/store';
import { t, nicheLabel } from '@/lib/evo/i18n';
import { Clock, CheckCircle } from 'lucide-react';

export default function EvoHistory() {
  const { locale, analysisHistory } = useEvoStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t(locale, 'analysisHistory')}</h1>
        <p className="text-sm text-slate-500">{t(locale, 'pastAnalysisRuns')}</p>
      </div>

      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl overflow-hidden">
        {analysisHistory.length > 0 ? (
          <div className="divide-y divide-white/4">
            {analysisHistory.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-4 hover:bg-white/2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{h.query || t(locale, 'allProjects')}</div>
                    <div className="text-xs text-slate-500">
                      {h.geo !== 'all' ? h.geo : t(locale, 'allGeosLower')} · {h.niche !== 'all' ? nicheLabel(locale, h.niche) : t(locale, 'allNichesLower')} · {h.result_count} {t(locale, 'projects')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-400">{t(locale, 'oppShort')}:{h.avg_opportunity}</span>
                    <span className="text-rose-400">{t(locale, 'riskShort')}:{h.avg_risk}</span>
                    <span className="text-cyan-400">{t(locale, 'marginShort')}:{h.avg_margin}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <div className="text-sm text-slate-500">{t(locale, 'noHistoryYet')}</div>
            <div className="text-xs text-slate-600 mt-1">{t(locale, 'runAnalysisToSeeHistory')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
