import type { EnrichedProject, AnalysisHistoryEntry, ExportFormat } from './vnext-types';

export type Locale = 'en' | 'ru' | 'de' | 'tr';
export type Theme = 'dark' | 'light';
export type Priority = 'high' | 'medium' | 'low';
export type ProjectStatus = 'active' | 'pending' | 'completed' | 'archived';
export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';
export type Stage = 'intake' | 'enrichment' | 'scoring' | 'synthesis' | 'review' | 'export-ready';

export interface Project {
  id: number;
  name: string;
  country: string;
  niche: string;
  grp: string;
  relevance: number;
  priority: Priority;
  status: ProjectStatus;
  stage: Stage;
  summary_en: string;
  summary_ru: string;
  summary_de: string;
  summary_tr: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisMetrics {
  total: number;
  avgRelevance: number;
  highPriorityCount: number;
}

export interface AnalysisResult {
  items: Project[];
  metrics: AnalysisMetrics;
}

export interface Toast {
  id?: number;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

export interface MarketSignal {
  id: string;
  type: 'geo' | 'niche' | 'competitor';
  label: string;
  velocity: number;
  confidence: number;
  direction: 'up' | 'down' | 'stable';
  delta: string;
}

export interface EvoState {
  locale: Locale;
  theme: Theme;
  searchQuery: string;
  filterGeo: string;
  filterNiche: string;
  filterStage: string;
  analysisStatus: AnalysisStatus;
  analyzedCount: number;
  analyzedAt: string | null;
  projects: Project[];
  projectsLoading: boolean;
  selectedProject: Project | null;
  enrichedProjects: EnrichedProject[];
  signals: MarketSignal[];
  analysisHistory: AnalysisHistoryEntry[];
  activeView: string;
  showDetail: boolean;
  toasts: Toast[];
  setActiveView: (view: string) => void;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  setSearchQuery: (query: string) => void;
  setFilterGeo: (geo: string) => void;
  setFilterNiche: (niche: string) => void;
  setFilterStage: (stage: string) => void;
  setSelectedProject: (project: Project | null) => void;
  setShowDetail: (show: boolean) => void;
  addToast: (toast: Toast) => void;
  runAnalysis: () => Promise<void>;
  loadProjects: () => Promise<void>;
  updateProjectStatus: (id: number, status: ProjectStatus) => Promise<void>;
  exportEnriched: (project: EnrichedProject, format: ExportFormat) => void;
  copyExport: (project: EnrichedProject, format: ExportFormat) => Promise<void>;
  loadHistory: () => void;
}
