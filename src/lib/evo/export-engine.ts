import { Locale } from './types';
import { EnrichedProject, ExportFormat, ExportPayload } from './vnext-types';
import { t, nicheLabel } from './i18n';

type TextExportFormat = Exclude<ExportFormat, 'html_report'>;

const exportTemplates: Record<Locale, Record<TextExportFormat, (project: EnrichedProject) => string>> = {
  ru: {
    brief: (p) => `КРАТКИЙ БРИФ: ${p.name}\n\nСтрана: ${p.country}\nНиша: ${p.niche}\nБюджет: ${(p.relevance * 1200).toFixed(0)} млн руб.\nРелевантность: ${Math.round(p.relevance * 100)}%\nМаржа: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\nРЕКОМЕНДАЦИЯ: ${p.synthesis?.recommendation || 'Нет данных'}\n\nКЛЮЧЕВЫЕ ФАКТОРЫ:\n${p.synthesis?.key_factors?.map(f => `• ${f}`).join('\n') || 'Нет данных'}`,
    sales_brief: (p) => `КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ: ${p.name}\n\nКлиент: ${p.country}\nПроект: ${p.niche}\nПотенциал: ${(p.relevance * 1200).toFixed(0)} млн руб.\n\nПРИОРИТЕТ: ${p.scores?.opportunity?.value || 0}/100\nРИСК: ${p.scores?.risk?.value || 0}/100\nМАРЖА: ${p.scores?.margin?.value || 0}%\n\nСЛЕДУЮЩИЙ ШАГ: ${p.actions?.find(a => a.type === 'next_step')?.description || 'Контакт с заказчиком'}`,
    crm_note: (p) => `[CRM] ${p.name} | ${p.country} | ${p.niche} | Потенциал: ${(p.relevance * 1200).toFixed(0)} млн | Маржа: ${Math.round(p.relevance * 85 + (p.id % 15))}% | Статус: ${p.status}`,
    telegram: (p) => `🔍 *EVO Анализ*\n\n*${p.name}*\n📍 ${p.country} | 🏷 ${p.niche}\n💰 ${(p.relevance * 1200).toFixed(0)} млн руб.\n📊 Релевантность: ${Math.round(p.relevance * 100)}%\n📈 Маржа: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\n${p.synthesis?.recommendation || ''}`,
    json: (p) => JSON.stringify(p, null, 2),
  },
  en: {
    brief: (p) => `BRIEF: ${p.name}\n\nCountry: ${p.country}\nNiche: ${p.niche}\nBudget: $${(p.relevance * 15).toFixed(0)}M\nRelevance: ${Math.round(p.relevance * 100)}%\nMargin: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\nRECOMMENDATION: ${p.synthesis?.recommendation || 'No data'}\n\nKEY FACTORS:\n${p.synthesis?.key_factors?.map(f => `• ${f}`).join('\n') || 'No data'}`,
    sales_brief: (p) => `SALES BRIEF: ${p.name}\n\nClient: ${p.country}\nProject: ${p.niche}\nPotential: $${(p.relevance * 15).toFixed(0)}M\n\nPRIORITY: ${p.scores?.opportunity?.value || 0}/100\nRISK: ${p.scores?.risk?.value || 0}/100\nMARGIN: ${p.scores?.margin?.value || 0}%\n\nNEXT STEP: ${p.actions?.find(a => a.type === 'next_step')?.description || 'Contact stakeholder'}`,
    crm_note: (p) => `[CRM] ${p.name} | ${p.country} | ${p.niche} | Potential: $${(p.relevance * 15).toFixed(0)}M | Margin: ${Math.round(p.relevance * 85 + (p.id % 15))}% | Status: ${p.status}`,
    telegram: (p) => `🔍 *EVO Analysis*\n\n*${p.name}*\n📍 ${p.country} | 🏷 ${p.niche}\n💰 $${(p.relevance * 15).toFixed(0)}M\n📊 Relevance: ${Math.round(p.relevance * 100)}%\n📈 Margin: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\n${p.synthesis?.recommendation || ''}`,
    json: (p) => JSON.stringify(p, null, 2),
  },
  de: {
    brief: (p) => `KURZBRIEF: ${p.name}\n\nLand: ${p.country}\nNische: ${p.niche}\nBudget: €${(p.relevance * 14).toFixed(0)}M\nRelevanz: ${Math.round(p.relevance * 100)}%\nMarge: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\nEMPFEHLUNG: ${p.synthesis?.recommendation || 'Keine Daten'}\n\nSCHLÜSSELFAKTOREN:\n${p.synthesis?.key_factors?.map(f => `• ${f}`).join('\n') || 'Keine Daten'}`,
    sales_brief: (p) => `VERKAUFSBRIEF: ${p.name}\n\nKunde: ${p.country}\nProjekt: ${p.niche}\nPotenzial: €${(p.relevance * 14).toFixed(0)}M\n\nPRIORITÄT: ${p.scores?.opportunity?.value || 0}/100\nRISIKO: ${p.scores?.risk?.value || 0}/100\nMARGE: ${p.scores?.margin?.value || 0}%\n\nNÄCHSTER SCHRITT: ${p.actions?.find(a => a.type === 'next_step')?.description || 'Kontakt zum Ansprechpartner'}`,
    crm_note: (p) => `[CRM] ${p.name} | ${p.country} | ${p.niche} | Potenzial: €${(p.relevance * 14).toFixed(0)}M | Marge: ${Math.round(p.relevance * 85 + (p.id % 15))}% | Status: ${p.status}`,
    telegram: (p) => `🔍 *EVO-Analyse*\n\n*${p.name}*\n📍 ${p.country} | 🏷 ${p.niche}\n💰 €${(p.relevance * 14).toFixed(0)}M\n📊 Relevanz: ${Math.round(p.relevance * 100)}%\n📈 Marge: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\n${p.synthesis?.recommendation || ''}`,
    json: (p) => JSON.stringify(p, null, 2),
  },
  tr: {
    brief: (p) => `KISA BRIEF: ${p.name}\n\nÜlke: ${p.country}\nNiş: ${p.niche}\nBütçe: $${(p.relevance * 15).toFixed(0)}M\nİlgililik: ${Math.round(p.relevance * 100)}%\nMarj: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\nÖNERİ: ${p.synthesis?.recommendation || 'Veri yok'}\n\nANAHTAR FAKTÖRLER:\n${p.synthesis?.key_factors?.map(f => `• ${f}`).join('\n') || 'Veri yok'}`,
    sales_brief: (p) => `SATIŞ BRIEFİ: ${p.name}\n\nMüşteri: ${p.country}\nProje: ${p.niche}\nPotansiyel: $${(p.relevance * 15).toFixed(0)}M\n\nÖNCELİK: ${p.scores?.opportunity?.value || 0}/100\nRİSK: ${p.scores?.risk?.value || 0}/100\nMARJ: ${p.scores?.margin?.value || 0}%\n\nSONRAKI ADIM: ${p.actions?.find(a => a.type === 'next_step')?.description || 'İlgili kişiyle iletişime geçin'}`,
    crm_note: (p) => `[CRM] ${p.name} | ${p.country} | ${p.niche} | Potansiyel: $${(p.relevance * 15).toFixed(0)}M | Marj: ${Math.round(p.relevance * 85 + (p.id % 15))}% | Durum: ${p.status}`,
    telegram: (p) => `🔍 *EVO Analizi*\n\n*${p.name}*\n📍 ${p.country} | 🏷 ${p.niche}\n💰 $${(p.relevance * 15).toFixed(0)}M\n📊 İlgililik: ${Math.round(p.relevance * 100)}%\n📈 Marj: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\n${p.synthesis?.recommendation || ''}`,
    json: (p) => JSON.stringify(p, null, 2),
  },
};

function generateHtmlReport(project: EnrichedProject, locale: Locale): string {
  const l = (key: string) => t(locale, key);
  const opp = project.scores?.opportunity?.value || Math.round(project.relevance * 100);
  const risk = project.scores?.risk?.value || Math.round((1 - project.relevance) * 100);
  const margin = project.scores?.margin?.value || Math.round(project.relevance * 85 + (project.id % 15));
  const budget = locale === 'ru' ? `${(project.relevance * 1200).toFixed(0)} млн руб.` : locale === 'de' ? `€${(project.relevance * 14).toFixed(0)}M` : `$${(project.relevance * 15).toFixed(0)}M`;

  // Project-specific summary with deterministic fallback
  const projectSummary = locale === 'ru' ? project.summary_ru
    : locale === 'de' ? project.summary_de
    : locale === 'tr' ? project.summary_tr
    : project.summary_en;
  const englishFallback = project.summary_en;
  const displaySummary = projectSummary || englishFallback || l('reportSummaryUnavailable');

  const dateStr = new Date().toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'de' ? 'de-DE' : locale === 'tr' ? 'tr-TR' : 'en-US');

  // Analysis timestamp from project data (honest source)
  const analysisDate = project.updated_at
    ? new Date(project.updated_at).toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'de' ? 'de-DE' : locale === 'tr' ? 'tr-TR' : 'en-US')
    : dateStr;

  const confidence = project.synthesis?.confidence ? `${(project.synthesis.confidence * 100).toFixed(1)}%` : '—';
  const keyFactors = project.synthesis?.key_factors || [];
  const recommendation = project.synthesis?.recommendation || '';
  const nextStep = project.actions?.find(a => a.type === 'next_step')?.description || '';
  const langLabel = locale === 'ru' ? 'Русский' : locale === 'de' ? 'Deutsch' : locale === 'tr' ? 'Türkçe' : 'English';
  const nicheDisplay = nicheLabel(locale, project.niche);

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${l('reportTitle')} — ${project.name}</title>
<style>
  @page { size: A4; margin: 20mm 18mm 20mm 18mm; }
  @media print {
    .no-print { display: none !important; }
    body { margin: 0 !important; padding: 0 !important; background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .header { page-break-after: avoid; }
    .section { page-break-inside: avoid; }
    .metrics-grid { page-break-inside: avoid; }
    .meta-grid { page-break-inside: avoid; }
    .page-break { page-break-before: always; }
    .footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 8px 18mm; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { border-bottom: 3px solid #0ea5e9; padding-bottom: 24px; margin-bottom: 32px; }
  .header h1 { font-size: 28px; color: #0f172a; margin-bottom: 8px; }
  .header .subtitle { font-size: 14px; color: #64748b; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
  .meta-item { background: #f1f5f9; padding: 12px 16px; border-radius: 8px; }
  .meta-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 2px; }
  .meta-value { font-size: 15px; font-weight: 600; color: #1e293b; }
  .section { margin-bottom: 32px; }
  .section h2 { font-size: 18px; color: #0f172a; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
  .section p { font-size: 14px; color: #475569; margin-bottom: 12px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
  .metric-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; }
  .metric-value { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
  .metric-value.opp { color: #10b981; }
  .metric-value.risk { color: #f43f5e; }
  .metric-value.margin { color: #0ea5e9; }
  .metric-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .factors-list { list-style: none; padding: 0; }
  .factors-list li { padding: 8px 12px; margin-bottom: 4px; background: #f8fafc; border-left: 3px solid #0ea5e9; font-size: 14px; color: #334155; border-radius: 0 6px 6px 0; }
  .recommendation { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; font-size: 14px; color: #065f46; }
  .next-step { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; font-size: 14px; color: #1e40af; margin-top: 12px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  .summary-block { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 14px; color: #334155; margin-bottom: 16px; }
  .print-actions { text-align: center; margin-bottom: 24px; }
  .print-btn { background: #0ea5e9; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .print-btn:hover { background: #0284c7; }
</style>
</head>
<body>
  <div class="print-actions no-print">
    <button class="print-btn" onclick="window.print()">⎙ ${l('exportHtmlReport')}</button>
  </div>
  <div class="header">
    <h1>${l('reportTitle')}</h1>
    <div class="subtitle">${l('reportProject')}: ${project.name}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">${l('reportProject')}</div><div class="meta-value">${project.name}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportNiche')}</div><div class="meta-value">${nicheDisplay}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportMarket')}</div><div class="meta-value">${project.country}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportAnalysisDate')}</div><div class="meta-value">${analysisDate}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportExportDate')}</div><div class="meta-value">${dateStr}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportLanguage')}</div><div class="meta-value">${langLabel}</div></div>
  </div>

  <div class="section">
    <h2>${l('reportSourceSummary')}</h2>
    <p>${l('reportSourceDesc')}</p>
    ${displaySummary ? `<div class="summary-block">${displaySummary}</div>` : ''}
  </div>

  <div class="section">
    <h2>${l('reportMarketSnapshot')}</h2>
    <ul class="factors-list">
      ${keyFactors.length > 0 ? keyFactors.map(f => `<li>${f}</li>`).join('\n      ') : `<li>${l('reportSourceSummary')}: ${project.country} — ${nicheDisplay}</li>
      <li>${l('reportOpportunity')}: ${opp}/100</li>
      <li>${l('reportRisk')}: ${risk}/100</li>
      <li>${l('reportMargin')}: ${margin}%</li>
      <li>${l('reportConfidence')}: ${confidence}</li>`}
    </ul>
  </div>

  <div class="section">
    <h2>${l('reportKeyMetrics')}</h2>
    <div class="metrics-grid">
      <div class="metric-card"><div class="metric-value opp">${opp}</div><div class="metric-label">${l('reportOpportunity')}</div></div>
      <div class="metric-card"><div class="metric-value risk">${risk}</div><div class="metric-label">${l('reportRisk')}</div></div>
      <div class="metric-card"><div class="metric-value margin">${margin}%</div><div class="metric-label">${l('reportMargin')}</div></div>
    </div>
  </div>

  <div class="section page-break">
    <h2>${l('reportClientSummary')}</h2>
    <p>${displaySummary}</p>
    ${recommendation ? `<div class="recommendation"><strong>${l('recommendation')}:</strong> ${recommendation}</div>` : ''}
    ${nextStep ? `<div class="next-step"><strong>${l('nextStep')}:</strong> ${nextStep}</div>` : ''}
  </div>

  <div class="footer">${l('reportGeneratedBy')} · ${dateStr}</div>
</body>
</html>`;
}

export function generateExport(project: EnrichedProject, format: ExportFormat, locale: Locale): ExportPayload {
  if (format === 'html_report') {
    return {
      format,
      locale,
      content: generateHtmlReport(project, locale),
      generated_at: new Date().toISOString(),
    };
  }
  const template = exportTemplates[locale]?.[format as TextExportFormat] || exportTemplates.en[format as TextExportFormat];
  return {
    format,
    locale,
    content: template(project),
    generated_at: new Date().toISOString(),
  };
}

export function downloadExport(payload: ExportPayload, filename: string) {
  if (payload.format === 'html_report') {
    const blob = new Blob([payload.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) {
      w.onload = () => { URL.revokeObjectURL(url); };
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-report.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
    return;
  }
  const ext = payload.format === 'json' ? 'json' : 'txt';
  const blob = new Blob([payload.content], { type: payload.format === 'json' ? 'application/json' : 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
