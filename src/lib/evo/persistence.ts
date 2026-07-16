export interface PersistenceAdapter<T> {
  load(): Promise<T[]>;
  save(items: T[]): Promise<void>;
  append(item: T): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

export interface PersistenceConfig {
  key: string;
  maxItems: number;
  backend: 'localStorage' | 'indexeddb' | 'api';
}

function createLocalStorageAdapter<T>(key: string, maxItems: number): PersistenceAdapter<T> {
  return {
    async load(): Promise<T[]> {
      if (typeof window === 'undefined') return [];
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },

    async save(items: T[]): Promise<void> {
      if (typeof window === 'undefined') return;
      const trimmed = items.slice(0, maxItems);
      localStorage.setItem(key, JSON.stringify(trimmed));
    },

    async append(item: T): Promise<void> {
      const items = await this.load();
      items.unshift(item);
      await this.save(items);
    },

    async clear(): Promise<void> {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    },

    async count(): Promise<number> {
      const items = await this.load();
      return items.length;
    },
  };
}

export function createPersistenceAdapter<T>(config: PersistenceConfig): PersistenceAdapter<T> {
  switch (config.backend) {
    case 'indexeddb':
      return createLocalStorageAdapter(`evo-${config.key}`, config.maxItems);
    case 'api':
      return createLocalStorageAdapter(`evo-${config.key}`, config.maxItems);
    case 'localStorage':
    default:
      return createLocalStorageAdapter(`evo-${config.key}`, config.maxItems);
  }
}
