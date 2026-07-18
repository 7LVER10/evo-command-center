import { create } from 'zustand';
import { EvoState, ProjectStatus } from './types';
import { EnrichedProject, ExportFormat } from './vnext-types';
import { generateExport, downloadExport, copyToClipboard } from './export-engine';
import { t } from './i18n';
import { logger } from './logger';
import { safeFetch } from './safe-fetch';

const STORAGE_KEY = 'evo-state';

function loadPersistedState(): Partial<EvoState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return { locale: parsed.locale, theme: parsed.theme };
  } catch (err) {
    logger.warn('store', 'persistState:load_failed', { error: err instanceof Error ? err.message : String(err) });
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
  } catch (err) {
    logger.warn('store', 'persistState:save_failed', { error: err instanceof Error ? err.message : String(err) });
  }
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
  activeView: 'dashboard',
  showDetail: false,
  toasts: [],
  ownerToken: null,

  setActiveView: (view) => set({ activeView: view }),
  setOwnerToken: (token) => set({ ownerToken: token }),

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
      const res = await safeFetch('/api/projects');
      const data = await res.json();
      logger.info('store', 'loadProjects:success', { count: data.length });
      set({ projects: data, projectsLoading: false });
    } catch (err) {
      logger.error('store', 'loadProjects:failed', { error: err instanceof Error ? err.message : String(err) });
      set({ projectsLoading: false });
    }
  },

  runAnalysis: async () => {
    const { searchQuery, filterGeo, filterNiche, filterStage, locale } = get();
    logger.info('store', 'runAnalysis:start', { query: searchQuery, geo: filterGeo, niche: filterNiche, stage: filterStage });
    set({ analysisStatus: 'loading' });
    try {
      const res = await safeFetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          country: filterGeo,
          niche: filterNiche,
          stage: filterStage,
          locale,
        }),
      });
      const data = await res.json();

      const enriched: EnrichedProject[] = data.enrichedProjects;
      const signals = data.signals;

      logger.info('store', 'runAnalysis:complete', { items: enriched.length, signals: signals.length });

      set({
        analysisStatus: 'success',
        enrichedProjects: enriched,
        signals,
        analyzedCount: enriched.length,
        analyzedAt: new Date().toISOString(),
      });

      try {
        const token = get().ownerToken;
        await safeFetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'x-evo-token': token } : {}),
          },
          body: JSON.stringify({
            geo: filterGeo,
            niche: filterNiche,
            query: searchQuery,
            result_count: enriched.length,
            avg_opportunity: enriched.length > 0 ? Math.round(enriched.reduce((a, e) => a + (e.scores?.opportunity?.value || 0), 0) / enriched.length) : 0,
            avg_risk: enriched.length > 0 ? Math.round(enriched.reduce((a, e) => a + (e.scores?.risk?.value || 0), 0) / enriched.length) : 0,
            avg_margin: enriched.length > 0 ? Math.round(enriched.reduce((a, e) => a + (e.scores?.margin?.value || 0), 0) / enriched.length) : 0,
            top_project_id: enriched[0]?.id || 0,
          }),
        });
      } catch (err) {
        logger.warn('store', 'history_write_failed', { error: err instanceof Error ? err.message : String(err) });
      }

      const historyRes = await safeFetch('/api/history');
      const history = await historyRes.json();
      set({ analysisHistory: history });

      get().addToast({ type: 'success', message: t(get().locale, 'analysisComplete').replace('{n}', String(enriched.length)) });
    } catch (err) {
      logger.error('store', 'runAnalysis:failed', { error: err instanceof Error ? err.message : String(err) });
      set({ analysisStatus: 'error' });
      get().addToast({ type: 'error', message: t(get().locale, 'analysisFailed') });
    }
  },

  updateProjectStatus: async (id: number, status: ProjectStatus) => {
    logger.info('store', 'updateProjectStatus:start', { id, status });
    try {
      await safeFetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      logger.info('store', 'updateProjectStatus:success', { id, status });
      get().loadProjects();
      get().addToast({ type: 'success', message: t(get().locale, 'statusUpdated') });
    } catch (err) {
      logger.error('store', 'updateProjectStatus:failed', { id, status, error: err instanceof Error ? err.message : String(err) });
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
    try {
      const token = get().ownerToken;
      const res = await safeFetch('/api/history', {
        headers: token ? { 'x-evo-token': token } : {},
      });
      const history = await res.json();
      set({ analysisHistory: history });
    } catch (err) {
      logger.warn('store', 'loadHistory:failed', { error: err instanceof Error ? err.message : String(err) });
    }
  },
}));
