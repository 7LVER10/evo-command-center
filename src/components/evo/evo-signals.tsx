'use client';

import { useEvoStore } from '@/lib/evo/store';
import { t, nicheLabel } from '@/lib/evo/i18n';
import { Radio, TrendingUp, TrendingDown, Minus, AlertCircle, Target, Shield, Zap, Eye } from 'lucide-react';
import { MarketSignal } from '@/lib/evo/types';

function getSignalLabel(locale: string, signal: MarketSignal): string {
  const typeLabel = signal.type === 'geo' ? (locale === 'ru' ? 'Рынок' : locale === 'de' ? 'Markt' : locale === 'tr' ? 'Pazar' : 'Market')
    : signal.type === 'niche' ? (locale === 'ru' ? 'Рост' : locale === 'de' ? 'Wachstum' : locale === 'tr' ? 'Büyüme' : 'Growth')
    : (locale === 'ru' ? 'Конкуренция' : locale === 'de' ? 'Wettbewerb' : locale === 'tr' ? 'Rekabet' : 'Competition');
  return `${signal.label.split(' ').slice(0, -1).join(' ')} ${typeLabel}`;
}

function getSignalTypeLabel(locale: string, type: string): string {
  if (type === 'geo') return locale === 'ru' ? 'География' : locale === 'de' ? 'Geografie' : locale === 'tr' ? 'Coğrafya' : 'Geography';
  if (type === 'niche') return locale === 'ru' ? 'Ниша' : locale === 'de' ? 'Nische' : locale === 'tr' ? 'Niş' : 'Niche';
  return locale === 'ru' ? 'Конкуренты' : locale === 'de' ? 'Wettbewerb' : locale === 'tr' ? 'Rekabet' : 'Competition';
}

function getShortName(signal: MarketSignal): string {
  return signal.label.split(' ').slice(0, -1).join(' ');
}

function getDeltaNum(signal: MarketSignal): number {
  return parseInt(signal.delta.replace(/[^0-9-]/g, ''), 10) || 0;
}

export default function EvoSignals() {
  const { locale, signals, enrichedProjects, filterGeo, filterNiche, filterStage, searchQuery } = useEvoStore();

  const geoSignals = signals.filter(s => s.type === 'geo');
  const nicheSignals = signals.filter(s => s.type === 'niche');
  const competitorSignals = signals.filter(s => s.type === 'competitor');

  const positiveSignals = signals.filter(s => s.direction === 'up');
  const cautionSignals = signals.filter(s => s.direction === 'down');
  const stableSignals = signals.filter(s => s.direction === 'stable');

  // Find strongest positive signal (highest delta)
  const strongestPositive = positiveSignals.length > 0
    ? positiveSignals.reduce((best, s) => getDeltaNum(s) > getDeltaNum(best) ? s : best)
    : null;

  // Find strongest caution signal (highest absolute delta)
  const strongestCaution = cautionSignals.length > 0
    ? cautionSignals.reduce((best, s) => getDeltaNum(s) < getDeltaNum(best) ? s : best)
    : null;

  const avgConfidence = signals.length > 0
    ? signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
    : 0;

  // Determine actual current focus from filter context
  const hasGeoFilter = filterGeo !== 'all';
  const hasNicheFilter = filterNiche !== 'all';
  const hasStageFilter = filterStage !== 'all';
  const hasSearchQuery = searchQuery.trim().length > 0;
  const isBroadFocus = !hasGeoFilter && !hasNicheFilter && !hasStageFilter && !hasSearchQuery;

  // Get display values for active filters
  const activeGeo = hasGeoFilter ? filterGeo : null;
  const activeNiche = hasNicheFilter ? nicheLabel(locale, filterNiche) : null;
  const activeStage = hasStageFilter ? filterStage : null;

  // Get unique values from enriched projects as fallback context
  const countries = [...new Set(enrichedProjects.map(p => p.country))];
  const niches = [...new Set(enrichedProjects.map(p => p.niche))];

  // Build specific signal summary sentences
  const signalSummaryItems: { text: string; color: 'emerald' | 'amber' | 'cyan' | 'slate' }[] = [];

  if (strongestPositive) {
    const name = getShortName(strongestPositive);
    const typeLabel = getSignalTypeLabel(locale, strongestPositive.type).toLowerCase();
    if (locale === 'ru') {
      signalSummaryItems.push({ text: `Сильнейший позитивный сигнал: ${name} (${typeLabel}) с показателем ${strongestPositive.delta}`, color: 'emerald' });
    } else if (locale === 'de') {
      signalSummaryItems.push({ text: `Stärkstes positives Signal: ${name} (${typeLabel}) mit ${strongestPositive.delta}`, color: 'emerald' });
    } else if (locale === 'tr') {
      signalSummaryItems.push({ text: `En güçlü pozitif sinyal: ${name} (${typeLabel}) ${strongestPositive.delta} ile`, color: 'emerald' });
    } else {
      signalSummaryItems.push({ text: `Strongest positive signal: ${name} (${typeLabel}) at ${strongestPositive.delta}`, color: 'emerald' });
    }
  }

  if (strongestCaution) {
    const name = getShortName(strongestCaution);
    const typeLabel = getSignalTypeLabel(locale, strongestCaution.type).toLowerCase();
    if (locale === 'ru') {
      signalSummaryItems.push({ text: `Главный сигнал осторожности: ${name} (${typeLabel}) с показателем ${strongestCaution.delta}`, color: 'amber' });
    } else if (locale === 'de') {
      signalSummaryItems.push({ text: `Hauptvorsichtssignal: ${name} (${typeLabel}) mit ${strongestCaution.delta}`, color: 'amber' });
    } else if (locale === 'tr') {
      signalSummaryItems.push({ text: `Ana uyarı sinyali: ${name} (${typeLabel}) ${strongestCaution.delta} ile`, color: 'amber' });
    } else {
      signalSummaryItems.push({ text: `Top caution signal: ${name} (${typeLabel}) at ${strongestCaution.delta}`, color: 'amber' });
    }
  }

  if (positiveSignals.length > 0 && cautionSignals.length > 0) {
    if (locale === 'ru') {
      signalSummaryItems.push({ text: `${positiveSignals.length} позитивных и ${cautionSignals.length} сигналов осторожности из ${signals.length} всего`, color: 'cyan' });
    } else if (locale === 'de') {
      signalSummaryItems.push({ text: `${positiveSignals.length} positive und ${cautionSignals.length} Vorsichtssignale von ${signals.length} gesamt`, color: 'cyan' });
    } else if (locale === 'tr') {
      signalSummaryItems.push({ text: `${signals.length} toplam sinyalden ${positiveSignals.length} pozitif ve ${cautionSignals.length} uyarı`, color: 'cyan' });
    } else {
      signalSummaryItems.push({ text: `${positiveSignals.length} positive and ${cautionSignals.length} caution signals out of ${signals.length} total`, color: 'cyan' });
    }
  } else if (positiveSignals.length > 0) {
    if (locale === 'ru') {
      signalSummaryItems.push({ text: `${positiveSignals.length} из ${signals.length} сигналов показывают позитивную динамику`, color: 'emerald' });
    } else if (locale === 'de') {
      signalSummaryItems.push({ text: `${positiveSignals.length} von ${signals.length} Signalen zeigen positive Dynamik`, color: 'emerald' });
    } else if (locale === 'tr') {
      signalSummaryItems.push({ text: `${signals.length} sinyalden ${positiveSignals.length} tanesi pozitif eğilim gösteriyor`, color: 'emerald' });
    } else {
      signalSummaryItems.push({ text: `${positiveSignals.length} of ${signals.length} signals show positive momentum`, color: 'emerald' });
    }
  } else if (cautionSignals.length > 0) {
    if (locale === 'ru') {
      signalSummaryItems.push({ text: `${cautionSignals.length} из ${signals.length} сигналов показывают повышенные риски`, color: 'amber' });
    } else if (locale === 'de') {
      signalSummaryItems.push({ text: `${cautionSignals.length} von ${signals.length} Signalen zeigen erhöhte Risiken`, color: 'amber' });
    } else if (locale === 'tr') {
      signalSummaryItems.push({ text: `${signals.length} sinyalden ${cautionSignals.length} tanesi artan risk gösteriyor`, color: 'amber' });
    } else {
      signalSummaryItems.push({ text: `${cautionSignals.length} of ${signals.length} signals indicate elevated risk`, color: 'amber' });
    }
  }

  if (competitorSignals.length > 0) {
    const avgCompConf = competitorSignals.reduce((s, c) => s + c.confidence, 0) / competitorSignals.length;
    if (locale === 'ru') {
      signalSummaryItems.push({ text: `${competitorSignals.length} конкурентных сигнала с достоверностью ${(avgCompConf * 100).toFixed(0)}%`, color: 'slate' });
    } else if (locale === 'de') {
      signalSummaryItems.push({ text: `${competitorSignals.length} Wettbewerbssignale mit ${(avgCompConf * 100).toFixed(0)}% Vertrauen`, color: 'slate' });
    } else if (locale === 'tr') {
      signalSummaryItems.push({ text: `${competitorSignals.length} rekabet sinyali, güven oranı ${(avgCompConf * 100).toFixed(0)}%`, color: 'slate' });
    } else {
      signalSummaryItems.push({ text: `${competitorSignals.length} competitor signals with ${(avgCompConf * 100).toFixed(0)}% confidence`, color: 'slate' });
    }
  }

  // Build specific recommendation
  const recommendationItems: { text: string; color: 'emerald' | 'amber' | 'cyan' }[] = [];

  if (strongestPositive) {
    const name = getShortName(strongestPositive);
    const typeLabel = getSignalTypeLabel(locale, strongestPositive.type).toLowerCase();
    if (locale === 'ru') {
      recommendationItems.push({ text: `Приоритет: развивать ${name} (${typeLabel}) — strongest позитивный сигнал с показателем ${strongestPositive.delta}`, color: 'emerald' });
    } else if (locale === 'de') {
      recommendationItems.push({ text: `Priorität: ${name} (${typeLabel}) ausbauen — stärkstes positives Signal mit ${strongestPositive.delta}`, color: 'emerald' });
    } else if (locale === 'tr') {
      recommendationItems.push({ text: `Öncelik: ${name} (${typeLabel}) geliştirmek — en güçlü pozitif sinyal, ${strongestPositive.delta}`, color: 'emerald' });
    } else {
      recommendationItems.push({ text: `Prioritize: develop ${name} (${typeLabel}) — strongest positive signal at ${strongestPositive.delta}`, color: 'emerald' });
    }
  }

  if (strongestCaution) {
    const name = getShortName(strongestCaution);
    const typeLabel = getSignalTypeLabel(locale, strongestCaution.type).toLowerCase();
    if (locale === 'ru') {
      recommendationItems.push({ text: `Риск: проверить ${name} (${typeLabel}) перед расширением — показатель ${strongestCaution.delta}`, color: 'amber' });
    } else if (locale === 'de') {
      recommendationItems.push({ text: `Risiko: ${name} (${typeLabel}) vor Erweiterung prüfen — Signal bei ${strongestCaution.delta}`, color: 'amber' });
    } else if (locale === 'tr') {
      recommendationItems.push({ text: `Risk: ${name} (${typeLabel}) genişleme öncesi kontrol edin — sinyal ${strongestCaution.delta}`, color: 'amber' });
    } else {
      recommendationItems.push({ text: `Risk: review ${name} (${typeLabel}) before expansion — signal at ${strongestCaution.delta}`, color: 'amber' });
    }
  }

  if (!strongestPositive && !strongestCaution && signals.length > 0) {
    if (locale === 'ru') {
      recommendationItems.push({ text: 'Все сигналы стабильны — рекомендуется мониторинг текущего состояния', color: 'cyan' });
    } else if (locale === 'de') {
      recommendationItems.push({ text: 'Alle Signale stabil — aktuelle Überwachung empfohlen', color: 'cyan' });
    } else if (locale === 'tr') {
      recommendationItems.push({ text: 'Tüm sinyaller stabil — mevcut durumun izlenmesi önerilir', color: 'cyan' });
    } else {
      recommendationItems.push({ text: 'All signals stable — monitor current state', color: 'cyan' });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">{t(locale, 'signalsIntel')}</h1>
        <p className="text-sm text-slate-500">
          {signals.length > 0
            ? t(locale, 'signalsCount').replace('{n}', String(signals.length))
            : t(locale, 'signalsEmptyHint')}
        </p>
      </div>

      {signals.length > 0 ? (
        <>
          {/* Market Focus — bound to actual current filter context */}
          <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">{t(locale, 'marketFocus')}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t(locale, 'marketFocusDesc')}</p>
            {isBroadFocus ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 rounded bg-white/3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span className="text-xs text-slate-300">
                    {locale === 'ru' ? 'Текущий фокус: полный портфель — без узких фильтров по рынку или нише'
                      : locale === 'de' ? 'Aktueller Fokus: gesamtes Portfolio — keine spezifischen Markt- oder Nischenfilter'
                      : locale === 'tr' ? 'Mevcut odak: tam portföy — pazar veya niş filtresi uygulanmadı'
                      : 'Current focus: full portfolio — no specific market or niche filter applied'}
                  </span>
                </div>
                {countries.length > 0 && (
                  <div className="flex items-start gap-2 p-2 rounded bg-white/3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-slate-300">
                      {locale === 'ru' ? `Географии в анализе: ${countries.join(', ')}`
                        : locale === 'de' ? `Geografien in Analyse: ${countries.join(', ')}`
                        : locale === 'tr' ? `Analizdeki coğrafyalar: ${countries.join(', ')}`
                        : `Geographies in analysis: ${countries.join(', ')}`}
                    </span>
                  </div>
                )}
                {niches.length > 0 && (
                  <div className="flex items-start gap-2 p-2 rounded bg-white/3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-slate-300">
                      {locale === 'ru' ? `Ниши в анализе: ${niches.map(n => nicheLabel(locale, n)).join(', ')}`
                        : locale === 'de' ? `Nischen in Analyse: ${niches.map(n => nicheLabel(locale, n)).join(', ')}`
                        : locale === 'tr' ? `Analizdeki nişler: ${niches.map(n => nicheLabel(locale, n)).join(', ')}`
                        : `Niches in analysis: ${niches.map(n => nicheLabel(locale, n)).join(', ')}`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {activeGeo && (
                  <div className="flex items-start gap-2 p-2 rounded bg-cyan-400/5 border border-cyan-400/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-cyan-300">
                      {locale === 'ru' ? `Рынок: ${activeGeo}`
                        : locale === 'de' ? `Markt: ${activeGeo}`
                        : locale === 'tr' ? `Pazar: ${activeGeo}`
                        : `Market: ${activeGeo}`}
                    </span>
                  </div>
                )}
                {activeNiche && (
                  <div className="flex items-start gap-2 p-2 rounded bg-cyan-400/5 border border-cyan-400/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-cyan-300">
                      {locale === 'ru' ? `Ниша: ${activeNiche}`
                        : locale === 'de' ? `Nische: ${activeNiche}`
                        : locale === 'tr' ? `Niş: ${activeNiche}`
                        : `Niche: ${activeNiche}`}
                    </span>
                  </div>
                )}
                {activeStage && (
                  <div className="flex items-start gap-2 p-2 rounded bg-cyan-400/5 border border-cyan-400/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-cyan-300">
                      {locale === 'ru' ? `Этап: ${activeStage}`
                        : locale === 'de' ? `Phase: ${activeStage}`
                        : locale === 'tr' ? `Aşama: ${activeStage}`
                        : `Stage: ${activeStage}`}
                    </span>
                  </div>
                )}
                {hasSearchQuery && (
                  <div className="flex items-start gap-2 p-2 rounded bg-cyan-400/5 border border-cyan-400/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-cyan-300">
                      {locale === 'ru' ? `Фильтр: "${searchQuery}"`
                        : locale === 'de' ? `Filter: "${searchQuery}"`
                        : locale === 'tr' ? `Filtre: "${searchQuery}"`
                        : `Filter: "${searchQuery}"`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Signal Summary — specific, data-backed */}
          <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">{t(locale, 'signalSummary')}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t(locale, 'signalSummaryDesc')}</p>
            <div className="space-y-2">
              {signalSummaryItems.map((item, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded ${
                  item.color === 'emerald' ? 'bg-emerald-400/5 border border-emerald-400/10' :
                  item.color === 'amber' ? 'bg-amber-400/5 border border-amber-400/10' :
                  item.color === 'cyan' ? 'bg-cyan-400/5 border border-cyan-400/10' :
                  'bg-white/3'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    item.color === 'emerald' ? 'bg-emerald-400' :
                    item.color === 'amber' ? 'bg-amber-400' :
                    item.color === 'cyan' ? 'bg-cyan-400' :
                    'bg-slate-400'
                  }`} />
                  <span className={`text-xs ${
                    item.color === 'emerald' ? 'text-emerald-300' :
                    item.color === 'amber' ? 'text-amber-300' :
                    item.color === 'cyan' ? 'text-cyan-300' :
                    'text-slate-300'
                  }`}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunity View */}
          <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">{t(locale, 'opportunityView')}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t(locale, 'opportunityViewDesc')}</p>
            <div className="grid grid-cols-2 gap-3">
              {positiveSignals.slice(0, 4).map(signal => (
                <div key={signal.id} className="p-3 rounded-lg bg-emerald-400/5 border border-emerald-400/10">
                  <div className="text-xs font-medium text-emerald-400">{getSignalLabel(locale, signal)}</div>
                  <div className="text-lg font-bold text-emerald-300 mt-1">{signal.delta}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{getSignalTypeLabel(locale, signal.type)}</div>
                </div>
              ))}
              {positiveSignals.length === 0 && (
                <div className="col-span-2 text-xs text-slate-500 text-center py-2">—</div>
              )}
            </div>
          </div>

          {/* Risk View */}
          <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-semibold text-white">{t(locale, 'riskView')}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t(locale, 'riskViewDesc')}</p>
            <div className="grid grid-cols-2 gap-3">
              {cautionSignals.slice(0, 4).map(signal => (
                <div key={signal.id} className="p-3 rounded-lg bg-rose-400/5 border border-rose-400/10">
                  <div className="text-xs font-medium text-rose-400">{getSignalLabel(locale, signal)}</div>
                  <div className="text-lg font-bold text-rose-300 mt-1">{signal.delta}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{getSignalTypeLabel(locale, signal.type)}</div>
                </div>
              ))}
              {cautionSignals.length === 0 && (
                <div className="col-span-2 text-xs text-slate-500 text-center py-2">—</div>
              )}
            </div>
          </div>

          {/* Confidence & Basis */}
          <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">{t(locale, 'confidenceBasis')}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t(locale, 'confidenceBasisDesc')}</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 rounded bg-white/3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span className="text-xs text-slate-300">{t(locale, 'syntheticProjectAnalysis')}</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded bg-amber-400/5 border border-amber-400/10">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span className="text-xs text-amber-300">{t(locale, 'noLiveMarketFeeds')}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white/3">
                <span className="text-xs text-slate-500">{t(locale, 'confidence')}</span>
                <span className="text-sm font-medium text-white">{(avgConfidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Recommended Direction — specific, evidence-linked */}
          <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">{t(locale, 'recommendedDirection')}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t(locale, 'recommendedDirectionDesc')}</p>
            <div className="space-y-2">
              {recommendationItems.map((item, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded ${
                  item.color === 'emerald' ? 'bg-emerald-400/5 border border-emerald-400/10' :
                  item.color === 'amber' ? 'bg-amber-400/5 border border-amber-400/10' :
                  'bg-cyan-400/5 border border-cyan-400/10'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    item.color === 'emerald' ? 'bg-emerald-400' :
                    item.color === 'amber' ? 'bg-amber-400' :
                    'bg-cyan-400'
                  }`} />
                  <span className={`text-xs ${
                    item.color === 'emerald' ? 'text-emerald-300' :
                    item.color === 'amber' ? 'text-amber-300' :
                    'text-cyan-300'
                  }`}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signal Detail Grid */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">{t(locale, 'signalsCount').replace('{n}', String(signals.length))}</h3>
            <div className="grid grid-cols-2 gap-4">
              {signals.map((signal) => (
                <div key={signal.id} className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-white">{getSignalLabel(locale, signal)}</span>
                    </div>
                    <span className={`text-xs ${signal.direction === 'up' ? 'text-emerald-400' : signal.direction === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
                      {signal.delta}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{t(locale, 'velocity')}</span>
                      <span className="text-white">{(signal.velocity * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        style={{ width: `${signal.velocity * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{t(locale, 'confidence')}</span>
                      <span className="text-white">{(signal.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {signal.direction === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                      {signal.direction === 'down' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                      {signal.direction === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
                      <span className="text-slate-400">{getSignalTypeLabel(locale, signal.type)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <div className="text-sm text-slate-500">{t(locale, 'signalsEmpty')}</div>
          <div className="text-xs text-slate-600 mt-1">{t(locale, 'signalsEmptyHint')}</div>
        </div>
      )}
    </div>
  );
}
