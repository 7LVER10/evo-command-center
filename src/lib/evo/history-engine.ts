import { AnalysisHistoryEntry } from './vnext-types';
import { createPersistenceAdapter, PersistenceAdapter } from './persistence';

const historyAdapter: PersistenceAdapter<AnalysisHistoryEntry> = createPersistenceAdapter({
  key: 'analysis-history',
  maxItems: 100,
  backend: 'localStorage',
});

export async function getHistory(): Promise<AnalysisHistoryEntry[]> {
  return historyAdapter.load();
}

export async function addHistoryEntry(entry: Omit<AnalysisHistoryEntry, 'id' | 'timestamp'>): Promise<void> {
  const newEntry: AnalysisHistoryEntry = {
    ...entry,
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  await historyAdapter.append(newEntry);
}

export async function clearHistory(): Promise<void> {
  await historyAdapter.clear();
}

export async function getHistoryCount(): Promise<number> {
  return historyAdapter.count();
}
