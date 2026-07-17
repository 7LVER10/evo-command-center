'use client';

import { useEvoStore } from '@/lib/evo/store';
import { t, nicheLabel } from '@/lib/evo/i18n';
import { Radio, TrendingUp, TrendingDown, Minus, AlertCircle, Target, Shield, Zap, Eye } from 'lucide-react';
import { MarketSignal } from '@/lib/evo/agent-engine';

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

export default function EvoSignals() {
  const { locale, signals, enrichedProjects } = useEvoStore();

  const geoSignals = signals.filter(s => s.type === 'geo');
  const nicheSignals = signals.filter(s => s.type === 'niche');
  const competitorSignals = signals.filter(s => s.type === 'competitor');

  const hasPositiveGeo = geoSignals.some(s => s.direction === 'up');
  const hasCautionGeo = geoSignals.some(s => s.direction === 'down');
  const hasPositiveNiche = nicheSignals.some(s => s.direction === 'up');
  const hasCautionNiche = nicheSignals.some(s => s.direction === 'down');

  const avgConfidence = signals.length > 0
    ? signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
    : 0;

  const countries = [...new Set(enrichedProjects.map(p => p.country))];
  const niches = [...new Set(enrichedProjects.map(p => p.niche))];

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
          {/* Market Focus */}
          <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">{t(locale, 'marketFocus')}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t(locale, 'marketFocusDesc')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/3">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{t(locale, 'geo')}</div>
                <div className="text-sm text-white">{countries.length > 0 ? countries.join(', ') : '—'}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/3">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{t(locale, 'niche')}</div>
                <div className="text-sm text-white">{niches.length > 0 ? niches.map(n => nicheLabel(locale, n)).join(', ') : '—'}</div>
              </div>
            </div>
          </div>

          {/* Signal Summary */}
          <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">{t(locale, 'signalSummary')}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t(locale, 'signalSummaryDesc')}</p>
            <div className="space-y-2">
              {geoSignals.length > 0 && (
                <div className={`flex items-start gap-2 p-2 rounded ${hasPositiveGeo && !hasCautionGeo ? 'bg-emerald-400/5 border border-emerald-400/10' : hasCautionGeo ? 'bg-amber-400/5 border border-amber-400/10' : 'bg-white/3'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${hasPositiveGeo && !hasCautionGeo ? 'bg-emerald-400' : hasCautionGeo ? 'bg-amber-400' : 'bg-slate-400'}`} />
                  <span className="text-xs text-slate-300">{hasPositiveGeo && !hasCautionGeo ? t(locale, 'geoSignalsPositive') : hasCautionGeo ? t(locale, 'geoSignalsCaution') : t(locale, 'geoSignalsPositive')}</span>
                </div>
              )}
              {nicheSignals.length > 0 && (
                <div className={`flex items-start gap-2 p-2 rounded ${hasPositiveNiche && !hasCautionNiche ? 'bg-emerald-400/5 border border-emerald-400/10' : hasCautionNiche ? 'bg-amber-400/5 border border-amber-400/10' : 'bg-white/3'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${hasPositiveNiche && !hasCautionNiche ? 'bg-emerald-400' : hasCautionNiche ? 'bg-amber-400' : 'bg-slate-400'}`} />
                  <span className="text-xs text-slate-300">{hasPositiveNiche && !hasCautionNiche ? t(locale, 'nicheSignalsPositive') : hasCautionNiche ? t(locale, 'nicheSignalsCaution') : t(locale, 'nicheSignalsPositive')}</span>
                </div>
              )}
              {competitorSignals.length > 0 && (
                <div className="flex items-start gap-2 p-2 rounded bg-white/3">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="text-xs text-slate-300">{t(locale, 'competitorContextNote')}</span>
                </div>
              )}
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
              {signals.filter(s => s.direction === 'up').slice(0, 4).map(signal => (
                <div key={signal.id} className="p-3 rounded-lg bg-emerald-400/5 border border-emerald-400/10">
                  <div className="text-xs font-medium text-emerald-400">{getSignalLabel(locale, signal)}</div>
                  <div className="text-lg font-bold text-emerald-300 mt-1">{signal.delta}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{getSignalTypeLabel(locale, signal.type)}</div>
                </div>
              ))}
              {signals.filter(s => s.direction === 'up').length === 0 && (
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
              {signals.filter(s => s.direction === 'down').slice(0, 4).map(signal => (
                <div key={signal.id} className="p-3 rounded-lg bg-rose-400/5 border border-rose-400/10">
                  <div className="text-xs font-medium text-rose-400">{getSignalLabel(locale, signal)}</div>
                  <div className="text-lg font-bold text-rose-300 mt-1">{signal.delta}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{getSignalTypeLabel(locale, signal.type)}</div>
                </div>
              ))}
              {signals.filter(s => s.direction === 'down').length === 0 && (
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

          {/* Recommended Direction */}
          <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">{t(locale, 'recommendedDirection')}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t(locale, 'recommendedDirectionDesc')}</p>
            <div className="space-y-2">
              {hasPositiveGeo || hasPositiveNiche ? (
                <div className="flex items-start gap-2 p-2 rounded bg-emerald-400/5 border border-emerald-400/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="text-xs text-emerald-300">{t(locale, 'actionableInsight')}</span>
                </div>
              ) : null}
              {hasCautionGeo || hasCautionNiche ? (
                <div className="flex items-start gap-2 p-2 rounded bg-amber-400/5 border border-amber-400/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span className="text-xs text-amber-300">{t(locale, 'reviewRiskSegments')}</span>
                </div>
              ) : null}
              {!hasPositiveGeo && !hasPositiveNiche && !hasCautionGeo && !hasCautionNiche && (
                <div className="flex items-start gap-2 p-2 rounded bg-white/3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span className="text-xs text-slate-300">{t(locale, 'actionableInsight')}</span>
                </div>
              )}
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
