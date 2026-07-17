'use client';

import { useEvoStore } from '@/lib/evo/store';
import { t, nicheLabel } from '@/lib/evo/i18n';
import { Download, FileText, Printer } from 'lucide-react';

export default function EvoExports() {
  const { locale, enrichedProjects, exportEnriched } = useEvoStore();

  const formats = ['brief', 'sales_brief', 'crm_note', 'telegram', 'json'];
  const locales = ['en', 'ru', 'de', 'tr'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t(locale, 'exportsView')}</h1>
        <p className="text-sm text-slate-500">{t(locale, 'exportMatrix').replace('{formats}', String(formats.length)).replace('{locales}', String(locales.length))}</p>
      </div>

      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
        <div className="grid grid-cols-6 gap-2 text-xs">
          <div className="font-medium text-slate-400">{t(locale, 'format')}</div>
          {locales.map(l => (
            <div key={l} className="font-medium text-slate-400 text-center">{l.toUpperCase()}</div>
          ))}
          <div className="font-medium text-slate-400">{t(locale, 'status')}</div>

          {formats.map(f => (
            <div key={f} className="contents">
              <div className="text-white capitalize">{f.replace('_', ' ')}</div>
              {locales.map(l => (
                <div key={`${f}-${l}`} className="text-center">
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-400/10 text-emerald-300">{t(locale, 'ready')}</span>
                </div>
              ))}
              <div className="text-center">
                <FileText className="w-3 h-3 text-emerald-400 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#161923]/70 to-[#0f1119]/50 backdrop-blur-xl border border-white/6 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">{t(locale, 'enrichedProjectsAvailable')}</h3>
        {enrichedProjects.length > 0 ? (
          <div className="space-y-2">
            {enrichedProjects.slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded bg-white/3">
                <div>
                  <div className="text-sm text-white">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.country} · {nicheLabel(locale, p.niche)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400">O:{p.scores?.opportunity?.value}</span>
                  <button
                    onClick={() => exportEnriched(p, 'html_report')}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 transition"
                    title={t(locale, 'exportHtmlReport')}
                  >
                    <Printer className="w-3 h-3" />
                    {t(locale, 'exportHtmlReport')}
                  </button>
                  <Download
                    className="w-4 h-4 text-cyan-400 cursor-pointer hover:text-cyan-300"
                    onClick={() => exportEnriched(p, 'brief')}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center py-4">{t(locale, 'runAnalysisFirst')}</div>
        )}
      </div>
    </div>
  );
}
