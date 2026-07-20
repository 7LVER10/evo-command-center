'use client';

import { useMemo, useState } from 'react';
import { useEvoStore } from '@/lib/evo/store';
import { t, nicheLabel } from '@/lib/evo/i18n';
import { Locale } from '@/lib/evo/types';
import { EnrichedProject, ExportFormat, ExportTier } from '@/lib/evo/vnext-types';
import { STAGE_COLORS, STAGE_KEYS, PRIORITY_COLORS } from '@/lib/evo/constants';
import {
  Copy, ChevronRight, Zap, X, Printer, FileText, Star, Crown
} from 'lucide-react';

const clientExportFormats: { key: ExportFormat; labelKey: string; hintKey: string }[] = [
  { key: 'brief', labelKey: 'exportBrief', hintKey: 'exportBriefHint' },
  { key: 'sales_brief', labelKey: 'exportSales', hintKey: 'exportSalesHint' },
  { key: 'crm_note', labelKey: 'exportCRM', hintKey: 'exportCRMHint' },
  { key: 'telegram', labelKey: 'exportTelegram', hintKey: 'exportTelegramHint' },
];

export default function EvoProjects() {
  const {
    locale, projects, enrichedProjects, searchQuery,
    filterGeo, filterNiche, filterStage,
    setFilterGeo, setFilterNiche, setFilterStage,
    selectedProject, setSelectedProject, showDetail, setShowDetail,
    exportEnriched, copyExport, runAnalysis, analysisStatus,
    analyzedCount, analyzedAt
  } = useEvoStore();

  const enrichedMap = useMemo(() => {
    const map = new Map(enrichedProjects.map(e => [e.id, e]));
    return map;
  }, [enrichedProjects]);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.country.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterGeo !== 'all' && p.country !== filterGeo) return false;
      if (filterNiche !== 'all' && p.niche !== filterNiche) return false;
      if (filterStage !== 'all' && p.stage !== filterStage) return false;
      return true;
    });
  }, [projects, searchQuery, filterGeo, filterNiche, filterStage]);

  const getEnriched = (id: number): EnrichedProject | undefined => enrichedMap.get(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{t(locale, 'projectsRegistry')}</h1>
          <p className="text-sm text-slate-500">{filtered.length} of {projects.length} {t(locale, 'projects')}</p>
        </div>
      </div>

      {/* Filters + Analyze */}
      <div className="flex items-center gap-3">
        <select
          value={filterGeo}
          onChange={(e) => setFilterGeo(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
        >
          <option value="all">{t(locale, 'allGeos')}</option>
          {[...new Set(projects.map(p => p.country))].map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={filterNiche}
          onChange={(e) => setFilterNiche(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
        >
          <option value="all">{t(locale, 'allNiches')}</option>
          {[...new Set(projects.map(p => p.niche))].map(n => <option key={n} value={n}>{nicheLabel(locale, n)}</option>)}
        </select>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
        >
          <option value="all">{t(locale, 'allStages')}</option>
          <option value="intake">{t(locale, 'stageIntake')}</option>
          <option value="enrichment">{t(locale, 'stageEnrichment')}</option>
          <option value="scoring">{t(locale, 'stageScoring')}</option>
          <option value="synthesis">{t(locale, 'stageSynthesis')}</option>
          <option value="review">{t(locale, 'stageReview')}</option>
          <option value="export-ready">{t(locale, 'stageExportReady')}</option>
        </select>
        <span className="text-xs text-slate-500">{t(locale, 'resultsCount').replace('{n}', String(filtered.length))}</span>
        <div className="flex-1" />
        {analyzedCount > 0 && analyzedAt && (
          <div className="text-[10px] text-cyan-400/80 bg-cyan-400/5 border border-cyan-400/10 rounded px-2 py-1">
            {t(locale, 'analyzeTimestamp')
              .replace('{n}', String(analyzedCount))
              .replace('{time}', new Date(analyzedAt).toLocaleTimeString(locale === 'ru' ? 'ru-RU' : locale === 'de' ? 'de-DE' : locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' }))}
          </div>
        )}
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
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6 text-xs text-slate-500 uppercase">
              <th className="text-left px-4 py-3">{t(locale, 'project')}</th>
              <th className="text-left px-4 py-3">{t(locale, 'geo')}</th>
              <th className="text-left px-4 py-3">{t(locale, 'niche')}</th>
              <th className="text-left px-4 py-3">{t(locale, 'stage')}</th>
              <th className="text-left px-4 py-3">{t(locale, 'priority')}</th>
              <th className="text-left px-4 py-3">{t(locale, 'opportunity')}</th>
              <th className="text-left px-4 py-3">{t(locale, 'risk')}</th>
              <th className="text-left px-4 py-3">{t(locale, 'margin')}</th>
              <th className="text-left px-4 py-3">{t(locale, 'action')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const enriched = getEnriched(p.id);
              const opp = enriched?.scores?.opportunity?.value || Math.round(p.relevance * 100);
              const risk = enriched?.scores?.risk?.value || Math.round((1 - p.relevance) * 100);
              const margin = enriched?.scores?.margin?.value || Math.round(p.relevance * 85 + (p.id % 15));
              const summary = locale === 'ru' ? p.summary_ru : locale === 'de' ? p.summary_de : locale === 'tr' ? p.summary_tr : p.summary_en;

              return (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className="border-b border-white/4 hover:bg-cyan-400/3 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{summary}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{p.country}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{nicheLabel(locale, p.niche)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded" style={{ backgroundColor: `${STAGE_COLORS[p.stage]}15`, color: STAGE_COLORS[p.stage] }}>
                      {t(locale, STAGE_KEYS[p.stage])}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${PRIORITY_COLORS[p.priority]}`}>
                      {p.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${opp}%` }} />
                      </div>
                      <span className="text-xs text-emerald-400">{opp}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${risk}%` }} />
                      </div>
                      <span className={`text-xs ${risk > 60 ? 'text-rose-400' : 'text-amber-400'}`}>{risk}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${margin}%` }} />
                      </div>
                      <span className="text-xs text-cyan-400">{margin}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                      {t(locale, 'inspect')} <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedProject && (
        <ProjectDetail
          project={selectedProject}
          enriched={getEnriched(selectedProject.id)}
          locale={locale}
          onClose={() => { setShowDetail(false); setSelectedProject(null); }}
          exportEnriched={exportEnriched}
          copyExport={copyExport}
        />
      )}
    </div>
  );
}

function ProjectDetail({
  project,
  enriched,
  locale,
  onClose,
  exportEnriched,
  copyExport,
}: {
  project: any;
  enriched?: EnrichedProject;
  locale: Locale;
  onClose: () => void;
  exportEnriched: (project: EnrichedProject, format: ExportFormat, tier?: ExportTier) => void;
  copyExport: (project: EnrichedProject, format: ExportFormat) => Promise<void>;
}) {
  const [selectedTier, setSelectedTier] = useState<ExportTier>('standard');
  const opp = enriched?.scores?.opportunity?.value || Math.round(project.relevance * 100);
  const risk = enriched?.scores?.risk?.value || Math.round((1 - project.relevance) * 100);
  const margin = enriched?.scores?.margin?.value || Math.round(project.relevance * 85 + (project.id % 15));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-gradient-to-br from-[#1c202d]/95 to-[#12141e]/90 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{project.name}</h2>
              <span className="px-2 py-0.5 text-[10px] font-medium rounded" style={{ backgroundColor: `${STAGE_COLORS[project.stage]}15`, color: STAGE_COLORS[project.stage] }}>{t(locale, STAGE_KEYS[project.stage])}</span>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${PRIORITY_COLORS[project.priority]}`}>{project.priority.toUpperCase()}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{project.country} · {nicheLabel(locale, project.niche)} · {project.grp}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4 text-slate-400" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Source Data */}
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <div className="px-4 py-3 bg-white/3 border-b border-white/6">
              <div className="text-sm font-semibold text-white">{t(locale, 'sourceData')}</div>
              <div className="text-xs text-slate-500">{t(locale, 'sourceDataSubtitle')}</div>
            </div>
            <div className="p-4 space-y-4">
              {/* Project Identification */}
              <div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">{t(locale, 'projectIdentification')}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between p-2 rounded bg-white/3">
                    <span className="text-slate-500">{t(locale, 'project')}</span>
                    <span className="text-white font-medium">{project.name}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white/3">
                    <span className="text-slate-500">{t(locale, 'niche')}</span>
                    <span className="text-white">{nicheLabel(locale, project.niche)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white/3">
                    <span className="text-slate-500">{t(locale, 'geo')}</span>
                    <span className="text-white">{project.country}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white/3">
                    <span className="text-slate-500">{t(locale, 'aiGroup')}</span>
                    <span className="text-white">{project.grp}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white/3">
                    <span className="text-slate-500">{t(locale, 'priority')}</span>
                    <span className={`font-medium ${project.priority === 'high' ? 'text-rose-400' : project.priority === 'medium' ? 'text-amber-400' : 'text-slate-400'}`}>
                      {project.priority === 'high' ? t(locale, 'priorityHigh') : project.priority === 'medium' ? t(locale, 'priorityMedium') : t(locale, 'priorityLow')}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white/3">
                    <span className="text-slate-500">{t(locale, 'stage')}</span>
                    <span className="text-white">{t(locale, STAGE_KEYS[project.stage])}</span>
                  </div>
                </div>
              </div>

              {/* Data Source Basis */}
              <div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">{t(locale, 'dataSourceBasis')}</div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 p-2 rounded bg-white/3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-slate-300">{t(locale, 'basedOnProjectProfile')}</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded bg-white/3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-slate-300">{t(locale, 'basedOnAgentAnalysis')}</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded bg-amber-400/5 border border-amber-400/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-amber-300">{t(locale, 'noLiveExternalIntel')}</span>
                  </div>
                </div>
              </div>

              {/* Data Scope & Freshness */}
              <div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">{t(locale, 'dataScopeFreshness')}</div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 p-2 rounded bg-white/3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-slate-300">{t(locale, 'syntheticDataNote')}</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded bg-white/3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-slate-300">{t(locale, 'snapshotBasis')}</span>
                  </div>
                  {project.updated_at && (
                    <div className="flex items-start gap-2 p-2 rounded bg-cyan-400/5 border border-cyan-400/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span className="text-xs text-cyan-300">
                        {t(locale, 'analysisSnapshotTime')} {new Date(project.updated_at).toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'de' ? 'de-DE' : locale === 'tr' ? 'tr-TR' : 'en-US')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Known Limits */}
              <div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">{t(locale, 'knownLimits')}</div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 p-2 rounded bg-rose-400/5 border border-rose-400/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-rose-300">{t(locale, 'limitedToInputs')}</span>
                  </div>
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="pt-2 border-t border-white/6">
                <div className="text-xs text-slate-400 leading-relaxed">
                  {locale === 'ru' ? project.summary_ru : locale === 'de' ? project.summary_de : locale === 'tr' ? project.summary_tr : project.summary_en}
                </div>
              </div>
            </div>
          </div>

          {/* Scores */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">{t(locale, 'scoreBreakdown')}</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white/3">
                <div className="text-xs text-slate-500">{t(locale, 'opportunity')}</div>
                <div className="text-xl font-bold text-emerald-400">{opp}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/3">
                <div className="text-xs text-slate-500">{t(locale, 'risk')}</div>
                <div className="text-xl font-bold text-rose-400">{risk}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/3">
                <div className="text-xs text-slate-500">{t(locale, 'margin')}</div>
                <div className="text-xl font-bold text-cyan-400">{margin}%</div>
              </div>
            </div>
          </div>

          {/* Synthesis */}
          {enriched?.synthesis && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">{t(locale, 'aiAnalysis')}</h3>
              <div className="p-3 rounded-lg bg-white/3 text-sm text-slate-300">
                {enriched.synthesis.summary}
              </div>
              <div className="mt-2 p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/10 text-sm text-cyan-300">
                <strong>{t(locale, 'recommendation')}:</strong> {enriched.synthesis.recommendation}
              </div>
            </div>
          )}

          {/* Next Step */}
          {enriched?.actions && enriched.actions.find(a => a.type === 'next_step') && (
            <div className="p-3 rounded-lg bg-emerald-400/5 border border-emerald-400/10">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">{t(locale, 'nextStep')}</span>
              </div>
              <div className="text-sm text-emerald-300">
                {enriched.actions.find(a => a.type === 'next_step')?.description}
              </div>
            </div>
          )}

          {/* Actions */}
          {enriched?.actions && enriched.actions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">{t(locale, 'recommendedActions')} ({enriched.actions.length})</h3>
              <div className="space-y-2">
                {enriched.actions.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/3">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-sm text-white">{a.label}</div>
                      <div className="text-xs text-slate-500">{a.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export */}
          {enriched && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">{t(locale, 'exportHandoff')}</h3>

              {/* Tier Selector */}
              <div className="flex gap-2 mb-3">
                {[
                  { key: 'minimal' as ExportTier, icon: FileText, labelKey: 'tierMinimal' },
                  { key: 'standard' as ExportTier, icon: Star, labelKey: 'tierStandard' },
                  { key: 'premium' as ExportTier, icon: Crown, labelKey: 'tierPremium' },
                ].map((tier) => {
                  const Icon = tier.icon;
                  const isActive = selectedTier === tier.key;
                  return (
                    <button
                      key={tier.key}
                      onClick={() => setSelectedTier(tier.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-400/15 border border-cyan-400/30 text-cyan-300'
                          : 'bg-white/5 border border-white/6 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {t(locale, tier.labelKey)}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => exportEnriched(enriched, 'html_report', selectedTier)}
                className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:shadow-lg hover:shadow-cyan-500/20 transition"
              >
                <Printer className="w-4 h-4" />
                {t(locale, 'exportHtmlReport')}
              </button>
              <div className="grid grid-cols-2 gap-2">
                {clientExportFormats.map((fmt) => (
                  <div key={fmt.key} className="flex gap-1">
                    <button
                      onClick={() => exportEnriched(enriched, fmt.key)}
                      title={t(locale, fmt.hintKey)}
                      className="flex-1 px-3 py-2 text-[11px] font-medium rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition text-left"
                    >
                      {t(locale, fmt.labelKey)}
                    </button>
                    <button
                      onClick={() => copyExport(enriched, fmt.key)}
                      title={t(locale, 'copyToClipboard')}
                      className="px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                    >
                      <Copy className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 mt-2">{t(locale, 'exportCopyHint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
