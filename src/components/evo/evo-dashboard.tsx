'use client';

import { useMemo, useState, useEffect } from 'react';
import { useEvoStore } from '@/lib/evo/store';
import { t, nicheLabel } from '@/lib/evo/i18n';
import { STAGE_COLORS, PRIORITY_COLORS } from '@/lib/evo/constants';
import { SUBSCRIPTION_TIERS, getRemainingAnalyses, getRemainingReports } from '@/lib/evo/subscriptions';
import {
  TrendingUp, AlertTriangle, CheckCircle,
  BarChart3, Activity, Zap, Target, ArrowRight, FileText, Radio
} from 'lucide-react';

export default function EvoDashboard() {
  const { locale, projects, enrichedProjects, analysisHistory, analyzedCount, analyzedAt, setActiveView, subscription } = useEvoStore();

  const hasAnalysis = analyzedCount > 0;
  const hasEnriched = enrichedProjects.length > 0;
  const tierDef = SUBSCRIPTION_TIERS[subscription.currentTier];
  const remainingAnalyses = getRemainingAnalyses(subscription);
  const remainingReports = getRemainingReports(subscription);

  const stats = useMemo(() => {
    if (!projects.length) return { total: 0, highOpportunity: 0, flaggedRisks: 0, avgMargin: 0, avgRelevance: 0 };
    return {
      total: projects.length,
      highOpportunity: projects.filter(p => p.relevance > 0.8).length,
      flaggedRisks: projects.filter(p => p.relevance < 0.7).length,
      avgMargin: Math.round(projects.reduce((s, p) => s + Math.round(p.relevance * 85 + (p.id % 15)), 0) / projects.length),
      avgRelevance: Math.round(projects.reduce((s, p) => s + Math.round(p.relevance * 100), 0) / projects.length),
    };
  }, [projects]);

  const topProjects = useMemo(() => {
    return [...projects].sort((a, b) => b.relevance - a.relevance).slice(0, 5).map(p => ({
      ...p,
      margin: Math.round(p.relevance * 85 + (p.id % 15)),
    }));
  }, [projects]);

  // Agent status summary
  const agentSummary = useMemo(() => {
    if (!enrichedProjects.length) return null;
    const avgOpp = Math.round(enrichedProjects.reduce((a, e) => a + (e.scores?.opportunity?.value || 0), 0) / enrichedProjects.length);
    const avgRisk = Math.round(enrichedProjects.reduce((a, e) => a + (e.scores?.risk?.value || 0), 0) / enrichedProjects.length);
    const avgConf = Math.round(enrichedProjects.reduce((a, e) => a + (e.synthesis?.confidence || 0), 0) / enrichedProjects.length * 100);
    return { avgOpp, avgRisk, avgConf, count: enrichedProjects.length };
  }, [enrichedProjects]);

  // Signal summary
  const signalSummary = useMemo(() => {
    if (!enrichedProjects.length) return null;
    const signals = enrichedProjects.flatMap(e => e.actions || []);
    const opportunities = signals.filter(s => s.type === 'opportunity').length;
    const risks = signals.filter(s => s.type === 'risk').length;
    return { opportunities, risks, total: signals.length };
  }, [enrichedProjects]);

  return (
    <div className="space-y-6">
      {/* Welcome + Plan Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{t(locale, 'commandOverview')}</h1>
          <p className="text-sm text-slate-500">{t(locale, 'realTimeIntel')}</p>
        </div>
        <div className="flex items-center gap-3">
          {hasAnalysis && analyzedAt && (
            <div className="text-[10px] text-cyan-400/80 bg-cyan-400/5 border border-cyan-400/10 rounded px-2 py-1">
              {t(locale, 'analyzeTimestamp')
                .replace('{n}', String(analyzedCount))
                .replace('{time}', new Date(analyzedAt).toLocaleTimeString(locale === 'ru' ? 'ru-RU' : locale === 'de' ? 'de-DE' : locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' }))}
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/6 text-xs">
            <span className="text-slate-400">{t(locale, 'currentPlan')}:</span>
            <span className="text-cyan-400 font-semibold">{tierDef.name}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">{remainingAnalyses} {t(locale, 'planAnalyses')} {t(locale, 'planRemaining')}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
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
          <div className="text-2xl font-bold text-amber-400">{analyzedCount}</div>
          <div className="text-xs text-slate-500">{t(locale, 'analyzedLabel')}</div>
        </div>
      </div>

      {/* Status Banner */}
      {!hasAnalysis ? (
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-400/20"><Zap className="w-5 h-5 text-cyan-400" /></div>
            <div>
              <div className="text-sm font-semibold text-white">
                {locale === 'ru' ? `${projects.length} проектов готовы к анализу`
                  : locale === 'de' ? `${projects.length} Projekte bereit zur Analyse`
                  : locale === 'tr' ? `${projects.length} proje analiz için hazır`
                  : `${projects.length} projects ready for analysis`}
              </div>
              <div className="text-xs text-slate-400">
                {locale === 'ru' ? 'Запустите анализ для получения оценок и рекомендаций'
                  : locale === 'de' ? 'Starten Sie die Analyse für Bewertungen und Empfehlungen'
                  : locale === 'tr' ? 'Değerlendirmeler ve öneriler için analizi başlatın'
                  : 'Run analysis to get scores and recommendations'}
              </div>
            </div>
          </div>
        </div>
      ) : hasEnriched ? (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-400/20"><CheckCircle className="w-5 h-5 text-emerald-400" /></div>
            <div>
              <div className="text-sm font-semibold text-white">
                {locale === 'ru' ? `${analyzedCount} проектов обогащено — ${topProjects[0]?.name || ''}`
                  : locale === 'de' ? `${analyzedCount} Projekte angereichert — ${topProjects[0]?.name || ''}`
                  : locale === 'tr' ? `${analyzedCount} proje zenginleştirildi — ${topProjects[0]?.name || ''}`
                  : `${analyzedCount} projects enriched — top: ${topProjects[0]?.name || 'none'}`}
              </div>
              <div className="text-xs text-slate-400">
                {locale === 'ru' ? 'Откройте проекты для просмотра оценок и экспорта'
                  : locale === 'de' ? 'Öffnen Sie Projekte für Bewertungen und Export'
                  : locale === 'tr' ? 'Değerlendirmeler ve dışa aktarma için projeleri açın'
                  : 'Open projects to view scores and export'}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Top Projects */}
        <div className="col-span-2 bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">{t(locale, 'topProjects')}</h3>
            <button onClick={() => setActiveView('projects')} className="text-[10px] text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1">
              {locale === 'ru' ? 'Показать все' : locale === 'de' ? 'Alle anzeigen' : locale === 'tr' ? 'Tümünü Gör' : 'View all'}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {topProjects.length > 0 ? (
            <div className="space-y-1.5">
              {topProjects.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/3 hover:bg-white/5 transition">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/10 flex items-center justify-center text-[10px] font-bold text-cyan-400">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500">{p.country} · {nicheLabel(locale, p.niche)}</div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-emerald-400">{t(locale, 'oppShort')}:{Math.round(p.relevance * 100)}</span>
                    <span className="text-cyan-400">{t(locale, 'marginShort')}:{p.margin}%</span>
                  </div>
                  <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded ${PRIORITY_COLORS[p.priority]}`}>
                    {p.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6"><div className="text-sm text-slate-500">{t(locale, 'loadingProjects')}</div></div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Agent Summary */}
          {agentSummary && (
            <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">{t(locale, 'agentSummary')}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-500">{t(locale, 'analyzedLabel')}</span><span className="text-white">{agentSummary.count}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">{t(locale, 'oppShort')}</span><span className="text-emerald-400">{agentSummary.avgOpp}/100</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">{t(locale, 'riskShort')}</span><span className="text-rose-400">{agentSummary.avgRisk}/100</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">{t(locale, 'confidence')}</span><span className="text-cyan-400">{agentSummary.avgConf}%</span></div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'quickActions')}</h3>
            <div className="space-y-2">
              <button onClick={() => setActiveView('projects')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 hover:bg-white/5 transition text-left">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-300">{t(locale, 'viewProjects')}</span>
              </button>
              <button onClick={() => setActiveView('exports')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 hover:bg-white/5 transition text-left">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300">{t(locale, 'viewReports')}</span>
              </button>
              <button onClick={() => setActiveView('plans')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 hover:bg-white/5 transition text-left">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300">{t(locale, 'viewPlans')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {analysisHistory.length > 0 && (
        <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">{t(locale, 'recentActivity')}</h3>
            <button onClick={() => setActiveView('history')} className="text-[10px] text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1">
              {locale === 'ru' ? 'Вся история' : locale === 'de' ? 'Gesamtverlauf' : locale === 'tr' ? 'Tüm Geçmiş' : 'Full history'}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1.5">
            {analysisHistory.slice(0, 3).map((h) => (
              <div key={h.id} className="flex items-center justify-between py-1.5 border-b border-white/4 last:border-0">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <div className="text-xs text-slate-300">{h.query || t(locale, 'allProjects')} · {h.result_count} {t(locale, 'projects')}</div>
                </div>
                <div className="text-[10px] text-slate-500">{new Date(h.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
