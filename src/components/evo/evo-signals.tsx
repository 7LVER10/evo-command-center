'use client';

import { useEvoStore } from '@/lib/evo/store';
import { t } from '@/lib/evo/i18n';
import { Radio, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

export default function EvoSignals() {
  const { locale, signals } = useEvoStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t(locale, 'signalsIntel')}</h1>
        <p className="text-sm text-slate-500">
          {signals.length > 0
            ? t(locale, 'signalsCount').replace('{n}', String(signals.length))
            : t(locale, 'signalsEmptyHint')}
        </p>
      </div>

      {signals.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {signals.map((signal) => (
            <div key={signal.id} className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">{signal.label}</span>
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
                  <span className="text-slate-400 capitalize">{signal.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
