'use client';

import { useMemo } from 'react';
import { useEvoStore } from '@/lib/evo/store';
import { t } from '@/lib/evo/i18n';
import { GitBranch, ChevronRight } from 'lucide-react';

const STAGES = ['intake', 'enrichment', 'scoring', 'synthesis', 'review', 'export-ready'];
const STAGE_KEYS: Record<string, string> = {
  'intake': 'stageIntake',
  'enrichment': 'stageEnrichment',
  'scoring': 'stageScoring',
  'synthesis': 'stageSynthesis',
  'review': 'stageReview',
  'export-ready': 'stageExportReady',
};
const STAGE_COLORS: Record<string, string> = {
  'intake': '#94a3b8',
  'enrichment': '#60a5fa',
  'scoring': '#a78bfa',
  'synthesis': '#fbbf24',
  'review': '#f97316',
  'export-ready': '#10b981',
};

export default function EvoPipeline() {
  const { locale, projects } = useEvoStore();

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STAGES.forEach(s => counts[s] = 0);
    projects.forEach(p => counts[p.stage]++);
    return counts;
  }, [projects]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t(locale, 'pipeline')}</h1>
        <p className="text-sm text-slate-500">{t(locale, 'pipelineFlow')}</p>
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-6">
        <div className="flex items-center gap-2">
          {STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-24 h-24 rounded-xl flex flex-col items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${STAGE_COLORS[stage]}10` }}
                >
                  <GitBranch className="w-5 h-5 mb-1" style={{ color: STAGE_COLORS[stage] }} />
                  <div className="text-lg font-bold text-white">{stageCounts[stage]}</div>
                  <div className="text-[10px] text-slate-400">{t(locale, STAGE_KEYS[stage])}</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {((stageCounts[stage] / Math.max(projects.length, 1)) * 100).toFixed(0)}%
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <ChevronRight className="w-5 h-5 text-slate-600 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Items */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/6">
          <h3 className="text-sm font-semibold text-white">{t(locale, 'pipelineItems')}</h3>
          <p className="text-xs text-slate-500">{projects.length} {t(locale, 'items')}</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6 text-xs text-slate-500 uppercase">
              <th className="text-left px-4 py-2">{t(locale, 'project')}</th>
              <th className="text-left px-4 py-2">{t(locale, 'geo')}</th>
              <th className="text-left px-4 py-2">{t(locale, 'niche')}</th>
              <th className="text-left px-4 py-2">{t(locale, 'stage')}</th>
            </tr>
          </thead>
          <tbody>
            {projects.slice(0, 10).map((p) => (
              <tr key={p.id} className="border-b border-white/4 hover:bg-white/2">
                <td className="px-4 py-2 text-sm text-white">{p.name}</td>
                <td className="px-4 py-2 text-sm text-slate-300">{p.country}</td>
                <td className="px-4 py-2 text-sm text-slate-300">{p.niche}</td>
                <td className="px-4 py-2">
                  <span
                    className="px-2 py-0.5 text-[10px] font-medium rounded"
                    style={{ backgroundColor: `${STAGE_COLORS[p.stage]}15`, color: STAGE_COLORS[p.stage] }}
                  >
                    {t(locale, STAGE_KEYS[p.stage])}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
