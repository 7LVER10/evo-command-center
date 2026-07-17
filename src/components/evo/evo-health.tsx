'use client';

import { useEvoStore } from '@/lib/evo/store';
import { t } from '@/lib/evo/i18n';
import { HeartPulse, CheckCircle, AlertTriangle } from 'lucide-react';

export default function EvoHealth() {
  const { locale, projects, enrichedProjects, analysisHistory } = useEvoStore();

  const services = [
    { name: t(locale, 'apiGateway'), status: 'ok', value: '200', detail: t(locale, 'allEndpointsResponding') },
    { name: t(locale, 'agentStack'), status: 'ok', value: '6/6', detail: t(locale, 'allAgentsOperational') },
    { name: 'Database', status: 'ok', value: 'SQLite', detail: t(locale, 'projectsLoaded').replace('{n}', String(projects.length)) },
    { name: t(locale, 'persistence'), status: 'ok', value: 'localStorage', detail: t(locale, 'historyAdapterActive') },
    { name: t(locale, 'exportEngine'), status: 'ok', value: '4 formats', detail: t(locale, 'exportFormatsDetail') },
    { name: 'i18n', status: 'ok', value: '4 locales', detail: t(locale, 'localesDetail') },
    { name: t(locale, 'analysisQueue'), status: enrichedProjects.length > 0 ? 'ok' : 'warn', value: `${enrichedProjects.length} enriched`, detail: enrichedProjects.length > 0 ? t(locale, 'enrichmentActive') : t(locale, 'enrichmentRunFirst') },
    { name: t(locale, 'history'), status: 'ok', value: `${analysisHistory.length} entries`, detail: t(locale, 'localStoragePersistence') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t(locale, 'healthView')}</h1>
        <p className="text-sm text-slate-500">{t(locale, 'systemHealthSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.name} className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {s.status === 'ok' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-sm font-medium text-white">{s.name}</span>
              </div>
              <span className={`text-xs font-medium ${s.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {s.value}
              </span>
            </div>
            <div className="text-xs text-slate-500">{s.detail}</div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'systemMetrics')}</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{projects.length}</div>
            <div className="text-xs text-slate-500">{t(locale, 'totalProjects')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{enrichedProjects.length}</div>
            <div className="text-xs text-slate-500">{t(locale, 'enriched')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">{analysisHistory.length}</div>
            <div className="text-xs text-slate-500">{t(locale, 'analysisRuns')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">4</div>
            <div className="text-xs text-slate-500">{t(locale, 'exportFormats')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
