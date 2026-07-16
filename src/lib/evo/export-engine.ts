import { Locale } from './types';
import { EnrichedProject, ExportFormat, ExportPayload } from './vnext-types';

const exportTemplates: Record<Locale, Record<ExportFormat, (project: EnrichedProject) => string>> = {
  ru: {
    brief: (p) => `КРАТКИЙ БРИФ: ${p.name}\n\nСтрана: ${p.country}\nНиша: ${p.niche}\nБюджет: ${(p.relevance * 1200).toFixed(0)} млн руб.\nРелевантность: ${Math.round(p.relevance * 100)}%\nМаржа: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\nРЕКОМЕНДАЦИЯ: ${p.synthesis?.recommendation || 'Нет данных'}\n\nКЛЮЧЕВЫЕ ФАКТОРЫ:\n${p.synthesis?.key_factors?.map(f => `• ${f}`).join('\n') || 'Нет данных'}`,
    sales_brief: (p) => `КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ: ${p.name}\n\nКлиент: ${p.country}\nПроект: ${p.niche}\nПотенциал: ${(p.relevance * 1200).toFixed(0)} млн руб.\n\nПРИОРИТЕТ: ${p.scores?.opportunity?.value || 0}/100\nРИСК: ${p.scores?.risk?.value || 0}/100\nМАРЖА: ${p.scores?.margin?.value || 0}%\n\nСЛЕДУЮЩИЙ ШАГ: ${p.actions?.find(a => a.type === 'next_step')?.description || 'Контакт с заказчиком'}`,
    crm_note: (p) => `[CRM] ${p.name} | ${p.country} | ${p.niche} | Потенциал: ${(p.relevance * 1200).toFixed(0)} млн | Маржа: ${Math.round(p.relevance * 85 + (p.id % 15))}% | Статус: ${p.status}`,
    telegram: (p) => `🔍 *EVO Analysis*\n\n*${p.name}*\n📍 ${p.country} | 🏷 ${p.niche}\n💰 ${(p.relevance * 1200).toFixed(0)} млн руб.\n📊 Релевантность: ${Math.round(p.relevance * 100)}%\n📈 Маржа: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\n${p.synthesis?.recommendation || ''}`,
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
    brief: (p) => `KURZBRIEF: ${p.name}\n\nLand: ${p.country}\nNische: ${p.niche}\nBudget: €${(p.relevance * 14).toFixed(0)}M\nRelevanz: ${Math.round(p.relevance * 100)}%\nMarge: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\nEMPFEHLUNG: ${p.synthesis?.recommendation || 'Keine Daten'}`,
    sales_brief: (p) => `VERKAUFSBRIEF: ${p.name}\n\nKunde: ${p.country}\nProjekt: ${p.niche}\nPotenzial: €${(p.relevance * 14).toFixed(0)}M\n\nPRIORITÄT: ${p.scores?.opportunity?.value || 0}/100\nRISIKO: ${p.scores?.risk?.value || 0}/100\nMARGE: ${p.scores?.margin?.value || 0}%`,
    crm_note: (p) => `[CRM] ${p.name} | ${p.country} | ${p.niche} | Potenzial: €${(p.relevance * 14).toFixed(0)}M | Marge: ${Math.round(p.relevance * 85 + (p.id % 15))}%`,
    telegram: (p) => `🔍 *EVO-Analyse*\n\n*${p.name}*\n📍 ${p.country} | 🏷 ${p.niche}\n💰 €${(p.relevance * 14).toFixed(0)}M\n📊 Relevanz: ${Math.round(p.relevance * 100)}%\n📈 Marge: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\n${p.synthesis?.recommendation || ''}`,
    json: (p) => JSON.stringify(p, null, 2),
  },
  tr: {
    brief: (p) => `KISA BRIEF: ${p.name}\n\nÜlke: ${p.country}\nNiş: ${p.niche}\nBütçe: $${(p.relevance * 15).toFixed(0)}M\nİlgililik: ${Math.round(p.relevance * 100)}%\nMarj: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\nÖNERİ: ${p.synthesis?.recommendation || 'Veri yok'}`,
    sales_brief: (p) => `SATIŞ BRIEFİ: ${p.name}\n\nMüşteri: ${p.country}\nProje: ${p.niche}\nPotansiyel: $${(p.relevance * 15).toFixed(0)}M\n\nÖNCELİK: ${p.scores?.opportunity?.value || 0}/100\nRİSK: ${p.scores?.risk?.value || 0}/100\nMARJ: ${p.scores?.margin?.value || 0}%`,
    crm_note: (p) => `[CRM] ${p.name} | ${p.country} | ${p.niche} | Potansiyel: $${(p.relevance * 15).toFixed(0)}M | Marj: ${Math.round(p.relevance * 85 + (p.id % 15))}%`,
    telegram: (p) => `🔍 *EVO Analizi*\n\n*${p.name}*\n📍 ${p.country} | 🏷 ${p.niche}\n💰 $${(p.relevance * 15).toFixed(0)}M\n📊 İlgililik: ${Math.round(p.relevance * 100)}%\n📈 Marj: ${Math.round(p.relevance * 85 + (p.id % 15))}%\n\n${p.synthesis?.recommendation || ''}`,
    json: (p) => JSON.stringify(p, null, 2),
  },
};

export function generateExport(project: EnrichedProject, format: ExportFormat, locale: Locale): ExportPayload {
  const template = exportTemplates[locale]?.[format] || exportTemplates.en[format];
  return {
    format,
    locale,
    content: template(project),
    generated_at: new Date().toISOString(),
  };
}

export function downloadExport(payload: ExportPayload, filename: string) {
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
