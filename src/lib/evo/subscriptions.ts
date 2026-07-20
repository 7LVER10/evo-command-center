import type { ExportTier } from './vnext-types';

// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION TIERS — EVO Command Center
//
// Three clear products with honest pricing, limits, and entitlements.
// No demo promises. No hidden caps. No fake "unlimited."
// ═══════════════════════════════════════════════════════════════

export interface SubscriptionTier {
  id: ExportTier;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  billing: 'monthly' | 'yearly' | 'quote';
  limits: {
    projects: number;
    analysesPerMonth: number;
    clientReportsPerMonth: number;
    exportFormats: string[];
    agentDepth: 'basic' | 'full';
  };
  features: string[];
  lockedFeatures: string[];
}

export const SUBSCRIPTION_TIERS: Record<ExportTier, SubscriptionTier> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Entry-level intelligence for quick validation',
    price: '$49',
    priceNote: '/month',
    billing: 'monthly',
    limits: {
      projects: 5,
      analysesPerMonth: 10,
      clientReportsPerMonth: 5,
      exportFormats: ['brief', 'crm_note'],
      agentDepth: 'basic',
    },
    features: [
      'Search and filter project database',
      'Basic agent analysis (3 agents: geo, niche, margin)',
      'Compact client-ready report (Minimal tier)',
      'Copy brief and CRM note exports',
      'Project opportunity scores',
    ],
    lockedFeatures: [
      'Full 5-agent deep analysis',
      'Standard/Premium reports',
      'Presentation deck export',
      'Market intelligence signals',
      'Competitor context analysis',
      'Unlimited project access',
    ],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    tagline: 'Full analysis with professional client reports',
    price: '$149',
    priceNote: '/month',
    billing: 'monthly',
    limits: {
      projects: 25,
      analysesPerMonth: 50,
      clientReportsPerMonth: 25,
      exportFormats: ['brief', 'sales_brief', 'crm_note', 'telegram'],
      agentDepth: 'full',
    },
    features: [
      'Everything in Minimal',
      'Full 5-agent analysis (geo, niche, competitor, pricing, margin)',
      'Standard client report with sources and budget estimate',
      'Market intelligence signals',
      'Competitor context analysis',
      'Sales brief and Telegram exports',
      'Analysis history tracking',
      'Multi-locale support (EN/RU/DE/TR)',
    ],
    lockedFeatures: [
      'Premium report with presentation deck',
      'Unlimited project access',
      'Priority analysis queue',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    tagline: 'Complete intelligence platform with presentation deck',
    price: '$399',
    priceNote: '/month',
    billing: 'monthly',
    limits: {
      projects: 100,
      analysesPerMonth: 200,
      clientReportsPerMonth: 100,
      exportFormats: ['brief', 'sales_brief', 'crm_note', 'telegram'],
      agentDepth: 'full',
    },
    features: [
      'Everything in Standard',
      'Premium report with 3-slide presentation deck',
      'Up to 100 projects',
      'Up to 200 analyses per month',
      'Up to 100 client reports per month',
      'Full 5-agent deep analysis',
      'All export formats',
      'Priority analysis processing',
      'Dedicated support',
    ],
    lockedFeatures: [
      'Enterprise custom limits (contact sales)',
    ],
  },
};

// ─── PERMISSION CHECK ───

export interface SubscriptionState {
  currentTier: ExportTier;
  analysesUsed: number;
  reportsUsed: number;
  projectsViewed: number;
}

export function canExportReport(state: SubscriptionState, tier: ExportTier): boolean {
  const tierDef = SUBSCRIPTION_TIERS[tier];
  if (!tierDef) return false;
  return state.reportsUsed < tierDef.limits.clientReportsPerMonth;
}

export function canRunAnalysis(state: SubscriptionState): boolean {
  const tierDef = SUBSCRIPTION_TIERS[state.currentTier];
  if (!tierDef) return false;
  return state.analysesUsed < tierDef.limits.analysesPerMonth;
}

export function canAccessProject(state: SubscriptionState, projectIndex: number): boolean {
  const tierDef = SUBSCRIPTION_TIERS[state.currentTier];
  if (!tierDef) return false;
  return projectIndex < tierDef.limits.projects;
}

export function canUseExportFormat(state: SubscriptionState, format: string): boolean {
  const tierDef = SUBSCRIPTION_TIERS[state.currentTier];
  if (!tierDef) return false;
  return tierDef.limits.exportFormats.includes(format);
}

export function getRemainingAnalyses(state: SubscriptionState): number {
  const tierDef = SUBSCRIPTION_TIERS[state.currentTier];
  return Math.max(0, tierDef.limits.analysesPerMonth - state.analysesUsed);
}

export function getRemainingReports(state: SubscriptionState): number {
  const tierDef = SUBSCRIPTION_TIERS[state.currentTier];
  return Math.max(0, tierDef.limits.clientReportsPerMonth - state.reportsUsed);
}
