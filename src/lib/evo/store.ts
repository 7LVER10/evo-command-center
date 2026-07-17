import { create } from 'zustand';
import { EvoState, ProjectStatus } from './types';
import { EnrichedProject, ExportFormat } from './vnext-types';
import { runAgentStack, generateSignals } from './agent-engine';
import { generateExport, downloadExport, copyToClipboard } from './export-engine';
import { getHistory, addHistoryEntry } from './history-engine';
import { t } from './i18n';

const STORAGE_KEY = 'evo-state';

function loadPersistedState(): Partial<EvoState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return { locale: parsed.locale, theme: parsed.theme };
  } catch {
    return {};
  }
}

function persistState(state: EvoState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      locale: state.locale,
      theme: state.theme,
    }));
  } catch {}
}

export const useEvoStore = create<EvoState>((set, get) => ({
  locale: loadPersistedState().locale || 'ru',
  theme: loadPersistedState().theme || 'dark',
  searchQuery: '',
  filterGeo: 'all',
  filterNiche: 'all',
  filterStage: 'all',
  analysisStatus: 'idle',
  analyzedCount: 0,
  analyzedAt: null,
  projects: [],
  projectsLoading: true,
  selectedProject: null,
  enrichedProjects: [],
  signals: [],
  analysisHistory: [],
  showHistory: false,
  showDetail: false,
  toasts: [],

  setLocale: (locale) => {
    set({ locale });
    setTimeout(() => persistState(get()), 0);
  },
  setTheme: (theme) => {
    set({ theme });
    setTimeout(() => persistState(get()), 0);
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterGeo: (geo) => set({ filterGeo: geo }),
  setFilterNiche: (niche) => set({ filterNiche: niche }),
  setFilterStage: (stage) => set({ filterStage: stage }),
  setSelectedProject: (project) => set({ selectedProject: project, showDetail: !!project }),
  setShowHistory: (show) => set({ showHistory: show }),
  setShowDetail: (show) => set({ showDetail: show }),

  addToast: (toast) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 3000);
  },

  loadProjects: async () => {
    set({ projectsLoading: true });
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      set({ projects: data, projectsLoading: false });
    } catch {
      set({ projectsLoading: false });
    }
  },

  runAnalysis: async () => {
    const { searchQuery, filterGeo, filterNiche, filterStage, locale } = get();
    set({ analysisStatus: 'loading' });
    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          country: filterGeo,
          niche: filterNiche,
          stage: filterStage,
        }),
      });
      const data = await res.json();

      const enriched: EnrichedProject[] = data.items.map((project: any) => {
        const agentResult = runAgentStack(project, locale);
        return { ...project, ...agentResult };
      });

      const signals = generateSignals(data.items, enriched);

      set({
        analysisStatus: 'success',
        enrichedProjects: enriched,
        signals,
        analyzedCount: data.items.length,
        analyzedAt: new Date().toISOString(),
      });

      await addHistoryEntry({
        geo: filterGeo,
        niche: filterNiche,
        query: searchQuery,
        result_count: data.items.length,
        avg_opportunity: enriched.length > 0 ? Math.round(enriched.reduce((a, e) => a + (e.scores?.opportunity?.value || 0), 0) / enriched.length) : 0,
        avg_risk: enriched.length > 0 ? Math.round(enriched.reduce((a, e) => a + (e.scores?.risk?.value || 0), 0) / enriched.length) : 0,
        avg_margin: enriched.length > 0 ? Math.round(enriched.reduce((a, e) => a + (e.scores?.margin?.value || 0), 0) / enriched.length) : 0,
        top_project_id: enriched[0]?.id || 0,
      });

      const history = await getHistory();
      set({ analysisHistory: history });

      get().addToast({ type: 'success', message: t(get().locale, 'analysisComplete').replace('{n}', String(data.items.length)) });
    } catch {
      set({ analysisStatus: 'error' });
      get().addToast({ type: 'error', message: t(get().locale, 'analysisFailed') });
    }
  },

  updateProjectStatus: async (id: number, status: ProjectStatus) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      get().loadProjects();
      get().addToast({ type: 'success', message: t(get().locale, 'statusUpdated') });
    } catch {
      get().addToast({ type: 'error', message: t(get().locale, 'statusUpdateFailed') });
    }
  },

  exportEnriched: (project, format) => {
    const { locale } = get();
    const payload = generateExport(project, format, locale);
    downloadExport(payload, project.name.replace(/\s+/g, '-').toLowerCase());
    const label = format === 'html_report' ? t(get().locale, 'exportHtmlReport') : format;
    get().addToast({ type: 'success', message: t(get().locale, 'exportedAs').replace('{format}', label) });
  },

  copyExport: async (project, format) => {
    const { locale } = get();
    const payload = generateExport(project, format, locale);
    await copyToClipboard(payload.content);
    get().addToast({ type: 'success', message: t(get().locale, 'copiedToClipboard') });
  },

  loadHistory: async () => {
    const history = await getHistory();
    set({ analysisHistory: history });
  },
}));
