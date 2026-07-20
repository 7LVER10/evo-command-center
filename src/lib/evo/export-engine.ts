import { Locale } from './types';
import { EnrichedProject, ExportFormat, ExportPayload, ExportTier } from './vnext-types';
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

function getLocaleConfig(locale: Locale) {
  return { dateStr: new Date().toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'de' ? 'de-DE' : locale === 'tr' ? 'tr-TR' : 'en-US'), langLabel: locale === 'ru' ? 'Русский' : locale === 'de' ? 'Deutsch' : locale === 'tr' ? 'Türkçe' : 'English' };
}

function getProjectData(project: EnrichedProject, locale: Locale) {
  const opp = project.scores?.opportunity?.value || Math.round(project.relevance * 100);
  const risk = project.scores?.risk?.value || Math.round((1 - project.relevance) * 100);
  const margin = project.scores?.margin?.value || Math.round(project.relevance * 85 + (project.id % 15));
  const budget = locale === 'ru' ? `${(project.relevance * 1200).toFixed(0)} млн руб.` : locale === 'de' ? `€${(project.relevance * 14).toFixed(0)}M` : `$${(project.relevance * 15).toFixed(0)}M`;
  const projectSummary = locale === 'ru' ? project.summary_ru : locale === 'de' ? project.summary_de : locale === 'tr' ? project.summary_tr : project.summary_en;
  const displaySummary = projectSummary || project.summary_en || '';
  const analysisDate = project.updated_at ? new Date(project.updated_at).toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'de' ? 'de-DE' : locale === 'tr' ? 'tr-TR' : 'en-US') : getLocaleConfig(locale).dateStr;
  const confidence = project.synthesis?.confidence ? `${(project.synthesis.confidence * 100).toFixed(1)}%` : '—';
  const keyFactors = project.synthesis?.key_factors || [];
  const recommendation = project.synthesis?.recommendation || '';
  const nextStep = project.actions?.find(a => a.type === 'next_step')?.description || '';
  const nicheDisplay = nicheLabel(locale, project.niche);
  return { opp, risk, margin, budget, displaySummary, analysisDate, confidence, keyFactors, recommendation, nextStep, nicheDisplay, ...getLocaleConfig(locale) };
}

// ─── MINIMAL TIER ───
function generateMinimalReport(project: EnrichedProject, locale: Locale): string {
  const l = (key: string) => t(locale, key);
  const d = getProjectData(project, locale);
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${l('tierMinimal')} — ${project.name}</title>
<style>
  @page { size: A4; margin: 20mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 40px; max-width: 700px; margin: 0 auto; }
  .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; color: #0f172a; margin-bottom: 4px; }
  .header .sub { font-size: 13px; color: #64748b; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
  .meta-item { background: #f1f5f9; padding: 10px 14px; border-radius: 6px; }
  .meta-label { font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
  .meta-value { font-size: 14px; font-weight: 600; color: #1e293b; }
  .section { margin-bottom: 20px; }
  .section h2 { font-size: 15px; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
  .section p { font-size: 13px; color: #475569; }
  .metrics { display: flex; gap: 12px; margin-bottom: 20px; }
  .metric { flex: 1; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
  .metric-val { font-size: 24px; font-weight: 700; }
  .metric-val.opp { color: #10b981; }
  .metric-val.risk { color: #f43f5e; }
  .metric-val.margin { color: #0ea5e9; }
  .metric-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; }
  .rec { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 12px; font-size: 13px; color: #065f46; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  .print-actions { text-align: center; margin-bottom: 16px; }
  .print-btn { background: #0ea5e9; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
  @media print { .no-print { display: none !important; } body { padding: 0; } }
</style>
</head>
<body>
  <div class="print-actions no-print"><button class="print-btn" onclick="window.print()">⎙ ${l('exportPrint')}</button></div>
  <div class="header">
    <h1>${project.name}</h1>
    <div class="sub">${d.nicheDisplay} · ${project.country}</div>
  </div>
  <div class="meta">
    <div class="meta-item"><div class="meta-label">${l('reportMarket')}</div><div class="meta-value">${project.country}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportNiche')}</div><div class="meta-value">${d.nicheDisplay}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportAnalysisDate')}</div><div class="meta-value">${d.analysisDate}</div></div>
    <div class="meta-item"><div class="meta-label">${l('tierEstBudget')}</div><div class="meta-value">${d.budget}</div></div>
  </div>
  <div class="metrics">
    <div class="metric"><div class="metric-val opp">${d.opp}</div><div class="metric-lbl">${l('reportOpportunity')}</div></div>
    <div class="metric"><div class="metric-val risk">${d.risk}</div><div class="metric-lbl">${l('reportRisk')}</div></div>
    <div class="metric"><div class="metric-val margin">${d.margin}%</div><div class="metric-lbl">${l('reportMargin')}</div></div>
  </div>
  <div class="section"><h2>${l('tierExecutiveSummary')}</h2><p>${d.displaySummary || l('reportSummaryUnavailable')}</p></div>
  ${d.recommendation ? `<div class="section"><h2>${l('recommendation')}</h2><div class="rec">${d.recommendation}</div></div>` : ''}
  <div class="footer">${l('reportGeneratedBy')} · ${d.dateStr}</div>
</body>
</html>`;
}

// ─── STANDARD TIER ───
function generateStandardReport(project: EnrichedProject, locale: Locale): string {
  const l = (key: string) => t(locale, key);
  const d = getProjectData(project, locale);
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${l('tierStandard')} — ${project.name}</title>
<style>
  @page { size: A4; margin: 18mm; }
  @media print { .no-print { display: none !important; } body { padding: 0 !important; background: #fff !important; } .page-break { page-break-before: always; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 40px; max-width: 780px; margin: 0 auto; }
  .header { border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 28px; }
  .header h1 { font-size: 26px; color: #0f172a; margin-bottom: 6px; }
  .header .sub { font-size: 14px; color: #64748b; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px; }
  .meta-item { background: #f1f5f9; padding: 12px 16px; border-radius: 8px; }
  .meta-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 2px; }
  .meta-value { font-size: 15px; font-weight: 600; color: #1e293b; }
  .section { margin-bottom: 28px; }
  .section h2 { font-size: 17px; color: #0f172a; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
  .section p { font-size: 14px; color: #475569; margin-bottom: 10px; }
  .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
  .metric { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: center; }
  .metric-val { font-size: 28px; font-weight: 700; }
  .metric-val.opp { color: #10b981; }
  .metric-val.risk { color: #f43f5e; }
  .metric-val.margin { color: #0ea5e9; }
  .metric-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .factors { list-style: none; padding: 0; }
  .factors li { padding: 8px 12px; margin-bottom: 4px; background: #f8fafc; border-left: 3px solid #0ea5e9; font-size: 13px; color: #334155; border-radius: 0 6px 6px 0; }
  .rec { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px; font-size: 14px; color: #065f46; margin-bottom: 12px; }
  .next { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; font-size: 14px; color: #1e40af; }
  .budget-block { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
  .budget-block h3 { font-size: 13px; color: #166534; margin-bottom: 6px; }
  .source-list { font-size: 12px; color: #64748b; }
  .source-list li { margin-bottom: 3px; }
  .footer { margin-top: 32px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  .print-actions { text-align: center; margin-bottom: 16px; }
  .print-btn { background: #0ea5e9; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
</style>
</head>
<body>
  <div class="print-actions no-print"><button class="print-btn" onclick="window.print()">⎙ ${l('exportPrint')}</button></div>
  <div class="header">
    <h1>${l('tierStandardReport')}: ${project.name}</h1>
    <div class="sub">${d.nicheDisplay} · ${project.country} · ${l('tierConfidence')}: ${d.confidence}</div>
  </div>
  <div class="meta">
    <div class="meta-item"><div class="meta-label">${l('reportProject')}</div><div class="meta-value">${project.name}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportNiche')}</div><div class="meta-value">${d.nicheDisplay}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportMarket')}</div><div class="meta-value">${project.country}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportAnalysisDate')}</div><div class="meta-value">${d.analysisDate}</div></div>
    <div class="meta-item"><div class="meta-label">${l('tierEstBudget')}</div><div class="meta-value">${d.budget}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportLanguage')}</div><div class="meta-value">${d.langLabel}</div></div>
  </div>
  <div class="metrics">
    <div class="metric"><div class="metric-val opp">${d.opp}</div><div class="metric-lbl">${l('reportOpportunity')}</div></div>
    <div class="metric"><div class="metric-val risk">${d.risk}</div><div class="metric-lbl">${l('reportRisk')}</div></div>
    <div class="metric"><div class="metric-val margin">${d.margin}%</div><div class="metric-lbl">${l('reportMargin')}</div></div>
  </div>
  <div class="section"><h2>${l('tierExecutiveSummary')}</h2><p>${d.displaySummary || l('reportSummaryUnavailable')}</p></div>
  <div class="section"><h2>${l('reportMarketSnapshot')}</h2><ul class="factors">${d.keyFactors.length > 0 ? d.keyFactors.map(f => `<li>${f}</li>`).join('') : `<li>${l('reportSourceSummary')}: ${project.country} — ${d.nicheDisplay}</li><li>${l('reportOpportunity')}: ${d.opp}/100</li><li>${l('reportRisk')}: ${d.risk}/100</li><li>${l('reportMargin')}: ${d.margin}%</li><li>${l('reportConfidence')}: ${d.confidence}</li>`}</ul></div>
  <div class="section"><h2>${l('tierBudgetEstimate')}</h2><div class="budget-block"><h3>${l('tierEstimatedValue')}</h3><p style="font-size:18px;font-weight:700;color:#166534">${d.budget}</p><p style="font-size:12px;color:#64748b;margin-top:4px">${l('tierBudgetDisclaimer')}</p></div></div>
  <div class="section"><h2>${l('tierSourceTransparency')}</h2><ul class="source-list"><li>${l('tierSourceAnalysis')} — ${l('tierSourceAgentStack')}</li><li>${l('tierSourceConfidence')}: ${d.confidence}</li><li>${l('tierSourceDate')}: ${d.analysisDate}</li></ul></div>
  <div class="section page-break"><h2>${l('reportClientSummary')}</h2><p>${d.displaySummary}</p>${d.recommendation ? `<div class="rec"><strong>${l('recommendation')}:</strong> ${d.recommendation}</div>` : ''}${d.nextStep ? `<div class="next"><strong>${l('nextStep')}:</strong> ${d.nextStep}</div>` : ''}</div>
  <div class="footer">${l('reportGeneratedBy')} · ${d.dateStr}</div>
</body>
</html>`;
}

// ─── PREMIUM TIER ───
function generatePremiumReport(project: EnrichedProject, locale: Locale): string {
  const l = (key: string) => t(locale, key);
  const d = getProjectData(project, locale);
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${l('tierPremium')} — ${project.name}</title>
<style>
  @page { size: A4; margin: 16mm; }
  @media print { .no-print { display: none !important; } body { padding: 0 !important; background: #fff !important; } .page-break { page-break-before: always; } .slide { page-break-after: always; } .slide:last-child { page-break-after: auto; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; padding: 32px; border-radius: 12px; margin-bottom: 28px; }
  .header h1 { font-size: 28px; margin-bottom: 6px; }
  .header .sub { font-size: 14px; color: #94a3b8; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
  .meta-item { background: #f1f5f9; padding: 12px 16px; border-radius: 8px; }
  .meta-label { font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 2px; }
  .meta-value { font-size: 14px; font-weight: 600; color: #1e293b; }
  .section { margin-bottom: 28px; }
  .section h2 { font-size: 18px; color: #0f172a; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #0ea5e9; }
  .section p { font-size: 14px; color: #475569; margin-bottom: 10px; }
  .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
  .metric { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; }
  .metric-val { font-size: 32px; font-weight: 700; }
  .metric-val.opp { color: #10b981; }
  .metric-val.risk { color: #f43f5e; }
  .metric-val.margin { color: #0ea5e9; }
  .metric-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .factors { list-style: none; padding: 0; }
  .factors li { padding: 10px 14px; margin-bottom: 6px; background: #f8fafc; border-left: 4px solid #0ea5e9; font-size: 14px; color: #334155; border-radius: 0 8px 8px 0; }
  .rec { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 16px; font-size: 14px; color: #065f46; margin-bottom: 12px; }
  .next { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; font-size: 14px; color: #1e40af; }
  .budget-block { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; margin-bottom: 16px; }
  .budget-block h3 { font-size: 14px; color: #166534; margin-bottom: 8px; }
  .source-list { font-size: 13px; color: #64748b; }
  .source-list li { margin-bottom: 4px; }
  .slide { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; margin-bottom: 20px; min-height: 400px; display: flex; flex-direction: column; justify-content: center; }
  .slide h2 { font-size: 22px; color: #0f172a; margin-bottom: 12px; }
  .slide p { font-size: 15px; color: #475569; margin-bottom: 8px; }
  .slide .highlight { font-size: 20px; font-weight: 700; color: #0ea5e9; margin: 12px 0; }
  .slide .tag { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 4px; }
  .footer { margin-top: 32px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  .print-actions { text-align: center; margin-bottom: 16px; }
  .print-btn { background: #0ea5e9; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
</style>
</head>
<body>
  <div class="print-actions no-print"><button class="print-btn" onclick="window.print()">⎙ ${l('exportPrint')}</button></div>

  <div class="header">
    <h1>${l('tierPremiumReport')}: ${project.name}</h1>
    <div class="sub">${d.nicheDisplay} · ${project.country} · ${l('tierConfidence')}: ${d.confidence}</div>
  </div>

  <div class="meta">
    <div class="meta-item"><div class="meta-label">${l('reportProject')}</div><div class="meta-value">${project.name}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportNiche')}</div><div class="meta-value">${d.nicheDisplay}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportMarket')}</div><div class="meta-value">${project.country}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportAnalysisDate')}</div><div class="meta-value">${d.analysisDate}</div></div>
    <div class="meta-item"><div class="meta-label">${l('tierEstBudget')}</div><div class="meta-value">${d.budget}</div></div>
    <div class="meta-item"><div class="meta-label">${l('reportLanguage')}</div><div class="meta-value">${d.langLabel}</div></div>
  </div>

  <div class="metrics">
    <div class="metric"><div class="metric-val opp">${d.opp}</div><div class="metric-lbl">${l('reportOpportunity')}</div></div>
    <div class="metric"><div class="metric-val risk">${d.risk}</div><div class="metric-lbl">${l('reportRisk')}</div></div>
    <div class="metric"><div class="metric-val margin">${d.margin}%</div><div class="metric-lbl">${l('reportMargin')}</div></div>
  </div>

  <div class="section"><h2>${l('tierExecutiveSummary')}</h2><p>${d.displaySummary || l('reportSummaryUnavailable')}</p></div>

  <div class="section"><h2>${l('reportMarketSnapshot')}</h2><ul class="factors">${d.keyFactors.length > 0 ? d.keyFactors.map(f => `<li>${f}</li>`).join('') : `<li>${l('reportSourceSummary')}: ${project.country} — ${d.nicheDisplay}</li><li>${l('reportOpportunity')}: ${d.opp}/100</li><li>${l('reportRisk')}: ${d.risk}/100</li><li>${l('reportMargin')}: ${d.margin}%</li><li>${l('reportConfidence')}: ${d.confidence}</li>`}</ul></div>

  <div class="section"><h2>${l('tierBudgetEstimate')}</h2><div class="budget-block"><h3>${l('tierEstimatedValue')}</h3><p style="font-size:22px;font-weight:700;color:#166534">${d.budget}</p><p style="font-size:12px;color:#64748b;margin-top:4px">${l('tierBudgetDisclaimer')}</p></div></div>

  <div class="section"><h2>${l('tierSourceTransparency')}</h2><ul class="source-list"><li>${l('tierSourceAnalysis')} — ${l('tierSourceAgentStack')}</li><li>${l('tierSourceConfidence')}: ${d.confidence}</li><li>${l('tierSourceDate')}: ${d.analysisDate}</li></ul></div>

  <div class="section page-break"><h2>${l('reportClientSummary')}</h2><p>${d.displaySummary}</p>${d.recommendation ? `<div class="rec"><strong>${l('recommendation')}:</strong> ${d.recommendation}</div>` : ''}${d.nextStep ? `<div class="next"><strong>${l('nextStep')}:</strong> ${d.nextStep}</div>` : ''}</div>

  <div class="section page-break">
    <h2>${l('tierPresentationDeck')}</h2>

    <div class="slide">
      <h2>${l('tierSlide1Title')}: ${project.name}</h2>
      <div class="highlight">${d.nicheDisplay} · ${project.country}</div>
      <p>${d.displaySummary || l('reportSummaryUnavailable')}</p>
      <div><span class="tag">${l('reportOpportunity')}: ${d.opp}/100</span><span class="tag">${l('reportRisk')}: ${d.risk}/100</span><span class="tag">${l('reportMargin')}: ${d.margin}%</span></div>
    </div>

    <div class="slide">
      <h2>${l('tierSlide2Title')}</h2>
      <div class="highlight">${d.budget}</div>
      <p>${l('tierBudgetDisclaimer')}</p>
      <p><strong>${l('reportConfidence')}:</strong> ${d.confidence}</p>
      <ul class="factors">${d.keyFactors.slice(0, 4).map(f => `<li>${f}</li>`).join('')}</ul>
    </div>

    <div class="slide">
      <h2>${l('tierSlide3Title')}</h2>
      <div class="rec" style="margin-bottom:12px"><strong>${l('recommendation')}:</strong> ${d.recommendation || l('reportSummaryUnavailable')}</div>
      ${d.nextStep ? `<div class="next"><strong>${l('nextStep')}:</strong> ${d.nextStep}</div>` : ''}
      <p style="margin-top:16px;font-size:13px;color:#64748b">${l('tierSlide3Footer')}</p>
    </div>
  </div>

  <div class="footer">${l('reportGeneratedBy')} · ${d.dateStr}</div>
</body>
</html>`;
}

// ─── PUBLIC API ───
export function generateExport(project: EnrichedProject, format: ExportFormat, locale: Locale, tier: ExportTier = 'standard'): ExportPayload {
  if (format === 'html_report') {
    let content: string;
    if (tier === 'minimal') content = generateMinimalReport(project, locale);
    else if (tier === 'premium') content = generatePremiumReport(project, locale);
    else content = generateStandardReport(project, locale);
    return { format, locale, content, generated_at: new Date().toISOString(), tier };
  }
  const template = exportTemplates[locale]?.[format as TextExportFormat] || exportTemplates.en[format as TextExportFormat];
  return { format, locale, content: template(project), generated_at: new Date().toISOString(), tier };
}

export function downloadExport(payload: ExportPayload, filename: string) {
  if (payload.format === 'html_report') {
    const tierSuffix = payload.tier && payload.tier !== 'standard' ? `-${payload.tier}` : '';
    const blob = new Blob([payload.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) { w.onload = () => { URL.revokeObjectURL(url); }; }
    else { const a = document.createElement('a'); a.href = url; a.download = `${filename}-report${tierSuffix}.html`; a.click(); URL.revokeObjectURL(url); }
    return;
  }
  const ext = payload.format === 'json' ? 'json' : 'txt';
  const blob = new Blob([payload.content], { type: payload.format === 'json' ? 'application/json' : 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}.${ext}`; a.click(); URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
