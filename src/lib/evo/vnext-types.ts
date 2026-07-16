import { Locale, Project } from './types';

export type AgentRole =
  | 'geo_analyst'
  | 'niche_analyst'
  | 'competitor_analyst'
  | 'pricing_analyst'
  | 'margin_analyst'
  | 'synthesis_agent';

export interface AgentOutput {
  role: AgentRole;
  signal: string;
  confidence: number;
  factors: string[];
  raw_data: Record<string, unknown>;
}

export interface ScoreBreakdown {
  value: number;
  factors: Array<{ name: string; weight: number; contribution: number }>;
  methodology: string;
}

export interface ProjectScores {
  opportunity: ScoreBreakdown;
  risk: ScoreBreakdown;
  margin: ScoreBreakdown;
}

export type SourceType = 'tender_registry' | 'news' | 'financial_report' | 'government' | 'industry_report' | 'web_scrape' | 'manual';

export interface SourceSignal {
  type: SourceType;
  freshness: string;
  confidence: number;
  explanation: string;
  url?: string;
}

export interface ActionRecommendation {
  type: 'opportunity' | 'risk' | 'next_step' | 'market_signal';
  label: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SynthesisOutput {
  summary: string;
  recommendation: string;
  confidence: number;
  key_factors: string[];
  generated_at: string;
}

export interface CompetitorContext {
  market_position: string;
  competitor_count: number;
  competitive_advantage: string;
  threat_level: 'low' | 'medium' | 'high';
  differentiation: string;
}

export type ExportFormat = 'brief' | 'sales_brief' | 'crm_note' | 'telegram' | 'json';

export interface ExportPayload {
  format: ExportFormat;
  locale: Locale;
  content: string;
  generated_at: string;
}

export interface AnalysisHistoryEntry {
  id: string;
  timestamp: string;
  geo: string;
  niche: string;
  query: string;
  result_count: number;
  avg_opportunity: number;
  avg_risk: number;
  avg_margin: number;
  top_project_id: number;
}

export interface EnrichedProject extends Project {
  scores: ProjectScores;
  sources: SourceSignal[];
  actions: ActionRecommendation[];
  synthesis: SynthesisOutput;
  competitorContext?: CompetitorContext;
}
