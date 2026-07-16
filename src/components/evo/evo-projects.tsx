'use client';

import { useMemo } from 'react';
import { useEvoStore } from '@/lib/evo/store';
import { t } from '@/lib/evo/i18n';
import { Locale } from '@/lib/evo/types';
import { EnrichedProject, ExportFormat } from '@/lib/evo/vnext-types';
import {
  Download, Copy, Target, AlertTriangle, TrendingUp,
  ChevronRight, Shield, Zap, X, FileText
} from 'lucide-react';

const exportFormats: { key: ExportFormat; labelKey: string }[] = [
  { key: 'brief', labelKey: 'exportBrief' },
  { key: 'sales_brief', labelKey: 'exportSales' },
  { key: 'crm_note', labelKey: 'exportCRM' },
  { key: 'telegram', labelKey: 'exportTelegram' },
  { key: 'json', labelKey: 'exportJSON' },
];

export default function EvoProjects() {
  const {
    locale, projects, enrichedProjects, searchQuery,
    filterGeo, filterNiche, filterStage,
    setFilterGeo, setFilterNiche, setFilterStage,
    selectedProject, setSelectedProject, showDetail, setShowDetail,
    exportEnriched, copyExport
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
          <p className="text-sm text-slate-500">{filtered.length} of {projects.length} projects</p>
        </div>
      </div>

      {/* Filters */}
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
          {[...new Set(projects.map(p => p.niche))].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
        >
          <option value="all">{t(locale, 'allStages')}</option>
          <option value="intake">Intake</option>
          <option value="enrichment">Enrichment</option>
          <option value="scoring">Scoring</option>
          <option value="synthesis">Synthesis</option>
          <option value="review">Review</option>
          <option value="export-ready">Export Ready</option>
        </select>
        <span className="text-xs text-slate-500">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6 text-xs text-slate-500 uppercase">
              <th className="text-left px-4 py-3">Project</th>
              <th className="text-left px-4 py-3">Geo</th>
              <th className="text-left px-4 py-3">Niche</th>
              <th className="text-left px-4 py-3">Stage</th>
              <th className="text-left px-4 py-3">Opportunity</th>
              <th className="text-left px-4 py-3">Risk</th>
              <th className="text-left px-4 py-3">Margin</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const enriched = getEnriched(p.id);
              const opp = enriched?.scores?.opportunity?.value || Math.round(p.relevance * 100);
              const risk = enriched?.scores?.risk?.value || Math.round((1 - p.relevance) * 100);
              const margin = enriched?.scores?.margin?.value || Math.round(p.relevance * 85 + (p.id % 15));

              return (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className="border-b border-white/4 hover:bg-cyan-400/3 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.grp} · {p.country}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{p.country}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{p.niche}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-cyan-400/10 text-cyan-300">
                      {p.stage}
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
                      <span className="text-xs text-cyan-400">{margin}</span>
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
  exportEnriched: (project: EnrichedProject, format: ExportFormat) => void;
  copyExport: (project: EnrichedProject, format: ExportFormat) => Promise<void>;
}) {
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
              <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-cyan-400/10 text-cyan-300">{project.stage}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{project.id} · {project.grp} · {project.country}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4 text-slate-400" /></button>
        </div>

        <div className="p-5 space-y-5">
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

          {/* Context */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">{t(locale, 'contextIntelligence')}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 rounded bg-white/3">
                <span className="text-slate-500">{t(locale, 'aiCountry')}</span>
                <span className="text-white">{project.country}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-white/3">
                <span className="text-slate-500">{t(locale, 'aiNiche')}</span>
                <span className="text-white">{project.niche}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-white/3">
                <span className="text-slate-500">{t(locale, 'aiGroup')}</span>
                <span className="text-white">{project.grp}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-white/3">
                <span className="text-slate-500">{t(locale, 'aiConfidence')}</span>
                <span className="text-white">{enriched?.synthesis?.confidence ? `${(enriched.synthesis.confidence * 100).toFixed(1)}%` : 'N/A'}</span>
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
              <div className="grid grid-cols-5 gap-2">
                {exportFormats.map((fmt) => (
                  <div key={fmt.key} className="flex gap-1">
                    <button
                      onClick={() => exportEnriched(enriched, fmt.key)}
                      className="flex-1 px-2 py-1.5 text-[10px] font-medium rounded bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 transition"
                    >
                      {t(locale, fmt.labelKey)}
                    </button>
                    <button
                      onClick={() => copyExport(enriched, fmt.key)}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 transition"
                    >
                      <Copy className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Payload */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">{t(locale, 'rawPayload')}</h3>
            <pre className="p-3 rounded-lg bg-black/40 text-[10px] text-slate-400 overflow-x-auto max-h-40">
              {JSON.stringify(enriched || project, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
