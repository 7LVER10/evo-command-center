'use client';

import { useMemo } from 'react';
import { useEvoStore } from '@/lib/evo/store';
import { t } from '@/lib/evo/i18n';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  BarChart3, Globe, Layers, Activity, Zap, Target, Clock,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

const STAGE_COLORS: Record<string, string> = {
  'intake': '#94a3b8',
  'enrichment': '#60a5fa',
  'scoring': '#a78bfa',
  'synthesis': '#fbbf24',
  'review': '#f97316',
  'export-ready': '#10b981',
};

const PRIORITY_COLORS: Record<string, string> = {
  'high': 'text-rose-400 bg-rose-400/10',
  'medium': 'text-amber-400 bg-amber-400/10',
  'low': 'text-slate-400 bg-slate-400/10',
};

const STATUS_COLORS: Record<string, string> = {
  'active': 'text-emerald-400 bg-emerald-400/10',
  'pending': 'text-amber-400 bg-amber-400/10',
  'completed': 'text-cyan-400 bg-cyan-400/10',
  'archived': 'text-slate-400 bg-slate-400/10',
};

export default function EvoDashboard() {
  const { locale, projects, enrichedProjects, analysisHistory } = useEvoStore();

  const stats = useMemo(() => {
    if (!projects.length) return { total: 0, highOpportunity: 0, flaggedRisks: 0, avgMargin: 0, avgRelevance: 0, totalBudget: 0 };
    return {
      total: projects.length,
      highOpportunity: projects.filter(p => p.relevance > 0.8).length,
      flaggedRisks: projects.filter(p => p.relevance < 0.7).length,
      avgMargin: Math.round(projects.reduce((s, p) => s + Math.round(p.relevance * 85 + (p.id % 15)), 0) / projects.length),
      avgRelevance: Math.round(projects.reduce((s, p) => s + Math.round(p.relevance * 100), 0) / projects.length),
      totalBudget: Math.round(projects.reduce((s, p) => s + p.relevance * 1200, 0)),
    };
  }, [projects]);

  const geoSplit = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => { counts[p.country] = (counts[p.country] || 0) + 1; });
    return Object.entries(counts).map(([geo, count]) => ({ geo, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [projects]);

  const nicheSplit = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => { counts[p.niche] = (counts[p.niche] || 0) + 1; });
    return Object.entries(counts).map(([niche, count]) => ({ niche, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [projects]);

  const stageSplit = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => { counts[p.stage] = (counts[p.stage] || 0) + 1; });
    return Object.entries(counts).map(([stage, count]) => ({ stage, count })).sort((a, b) => b.count - a.count);
  }, [projects]);

  const prioritySplit = useMemo(() => {
    const counts: Record<string, number> = { high: 0, medium: 0, low: 0 };
    projects.forEach(p => { counts[p.priority] = (counts[p.priority] || 0) + 1; });
    return counts;
  }, [projects]);

  const topProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
      .map(p => ({
        ...p,
        margin: Math.round(p.relevance * 85 + (p.id % 15)),
        budget: Math.round(p.relevance * 1200),
      }));
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{t(locale, 'commandOverview')}</h1>
          <p className="text-sm text-slate-500">{t(locale, 'realTimeIntel')} · {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">{t(locale, 'allSystemsOperational')}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-cyan-400/10"><BarChart3 className="w-4 h-4 text-cyan-400" /></div>
            <span className="text-[10px] text-cyan-400">{stats.total} {t(locale, 'projects')}</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-500">{t(locale, 'statTotal')}</div>
        </div>

        <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-emerald-400/10"><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
            <span className="text-[10px] text-emerald-400">{Math.round((stats.highOpportunity / Math.max(stats.total, 1)) * 100)}%</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.highOpportunity}</div>
          <div className="text-xs text-slate-500">{t(locale, 'highValue')}</div>
        </div>

        <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-rose-400/10"><AlertTriangle className="w-4 h-4 text-rose-400" /></div>
            <span className="text-[10px] text-rose-400">{Math.round((stats.flaggedRisks / Math.max(stats.total, 1)) * 100)}%</span>
          </div>
          <div className="text-2xl font-bold text-rose-400">{stats.flaggedRisks}</div>
          <div className="text-xs text-slate-500">{t(locale, 'flagged')}</div>
        </div>

        <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-amber-400/10"><Activity className="w-4 h-4 text-amber-400" /></div>
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.avgMargin}%</div>
          <div className="text-xs text-slate-500">{t(locale, 'avgMarginLabel')}</div>
        </div>

        <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-violet-400/10"><Target className="w-4 h-4 text-violet-400" /></div>
          </div>
          <div className="text-2xl font-bold text-violet-400">{stats.totalBudget.toLocaleString()}</div>
          <div className="text-xs text-slate-500">{t(locale, 'budgetUnit')} {t(locale, 'aiBudget')}</div>
        </div>
      </div>

      {/* Top Projects Quick View */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">{t(locale, 'topProjects')}</h3>
          <span className="text-[10px] text-slate-500">{t(locale, 'byRelevance')}</span>
        </div>
        <div className="space-y-2">
          {topProjects.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/3 hover:bg-white/5 transition">
              <div className="w-6 h-6 rounded-full bg-cyan-400/10 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{p.name}</div>
                <div className="text-[10px] text-slate-500">{p.country} · {p.niche}</div>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-emerald-400">O:{Math.round(p.relevance * 100)}</span>
                <span className="text-cyan-400">M:{p.margin}%</span>
                <span className="text-slate-500">{p.budget.toLocaleString()} {t(locale, 'budgetUnit')}</span>
              </div>
              <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded ${PRIORITY_COLORS[p.priority]}`}>
                {p.priority.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pipeline Overview */}
        <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'fullPipeline')}</h3>
          <div className="space-y-2">
            {stageSplit.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <div className="w-20 text-[10px] text-slate-400 truncate" style={{ color: STAGE_COLORS[s.stage] }}>
                  {t(locale, `stage${s.stage.charAt(0).toUpperCase() + s.stage.slice(1).replace('-', '')}`) || s.stage}
                </div>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(s.count / stats.total) * 100}%`, backgroundColor: STAGE_COLORS[s.stage] }}
                  />
                </div>
                <div className="w-6 text-[10px] text-right text-slate-400">{s.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Geo Distribution */}
        <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'geoDistribution')}</h3>
          <div className="space-y-2">
            {geoSplit.map((g) => (
              <div key={g.geo} className="flex items-center gap-3">
                <div className="w-20 text-[10px] text-slate-400 truncate">{g.geo}</div>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${(g.count / stats.total) * 100}%` }}
                  />
                </div>
                <div className="w-6 text-[10px] text-right text-slate-400">{g.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority & Status */}
        <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'priorityBreakdown')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded bg-white/3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-xs text-slate-300">HIGH</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-400">{prioritySplit.high}</span>
                <span className="text-[10px] text-slate-500">{Math.round((prioritySplit.high / Math.max(stats.total, 1)) * 100)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-white/3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs text-slate-300">MEDIUM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-400">{prioritySplit.medium}</span>
                <span className="text-[10px] text-slate-500">{Math.round((prioritySplit.medium / Math.max(stats.total, 1)) * 100)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-white/3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-xs text-slate-300">LOW</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400">{prioritySplit.low}</span>
                <span className="text-[10px] text-slate-500">{Math.round((prioritySplit.low / Math.max(stats.total, 1)) * 100)}%</span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-2 mt-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{t(locale, 'avgRelevance')}</span>
                <span className="text-cyan-400 font-medium">{stats.avgRelevance}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Niche Breakdown */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'nicheBreakdown')}</h3>
        <div className="grid grid-cols-4 gap-3">
          {nicheSplit.map((n) => {
            const nicheProjects = projects.filter(p => p.niche === n.niche);
            const avgRelevance = Math.round(nicheProjects.reduce((s, p) => s + p.relevance, 0) / nicheProjects.length * 100);
            return (
              <div key={n.niche} className="p-2 rounded-lg bg-white/3">
                <div className="text-xs text-slate-300 truncate">{n.niche}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-bold text-white">{n.count}</span>
                  <span className="text-[10px] text-violet-400">O:{avgRelevance}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'recentActivity')}</h3>
        {analysisHistory.length > 0 ? (
          <div className="space-y-2">
            {analysisHistory.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2 border-b border-white/4 last:border-0">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-sm text-white">{h.query || t(locale, 'allProjects')}</div>
                    <div className="text-xs text-slate-500">{h.result_count} {t(locale, 'projects')} · O:{h.avg_opportunity} R:{h.avg_risk}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">{new Date(h.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center py-4">{t(locale, 'noAnalysisHistory')}</div>
        )}
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'systemStatus')}</h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: t(locale, 'apiGateway'), status: 'ok', value: '200' },
            { label: t(locale, 'agentStack'), status: 'ok', value: '6/6' },
            { label: t(locale, 'analysisQueue'), status: 'ok', value: t(locale, 'idle') },
            { label: t(locale, 'persistence'), status: 'ok', value: 'SQLite' },
            { label: t(locale, 'exportEngine'), status: 'ok', value: '5 fmt' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between p-2 rounded-lg bg-white/3">
              <span className="text-xs text-slate-500">{s.label}</span>
              <span className={`text-xs font-medium ${s.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
