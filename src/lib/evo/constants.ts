export const STAGE_COLORS: Record<string, string> = {
  'intake': '#94a3b8',
  'enrichment': '#60a5fa',
  'scoring': '#a78bfa',
  'synthesis': '#fbbf24',
  'review': '#f97316',
  'export-ready': '#10b981',
};

export const STAGE_KEYS: Record<string, string> = {
  'intake': 'stageIntake',
  'enrichment': 'stageEnrichment',
  'scoring': 'stageScoring',
  'synthesis': 'stageSynthesis',
  'review': 'stageReview',
  'export-ready': 'stageExportReady',
};

export const PRIORITY_COLORS: Record<string, string> = {
  'high': 'text-rose-400 bg-rose-400/10',
  'medium': 'text-amber-400 bg-amber-400/10',
  'low': 'text-slate-400 bg-slate-400/10',
};

export const STAGES = ['intake', 'enrichment', 'scoring', 'synthesis', 'review', 'export-ready'];
