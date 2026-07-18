import { logger } from './logger';

interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  maxRetries?: number;
}

export async function safeFetch(url: string, options: SafeFetchOptions = {}): Promise<Response> {
  const { timeoutMs = 30000, maxRetries = 1, ...fetchOptions } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxRetries) {
        logger.warn('safeFetch', 'retry', {
          url,
          attempt: attempt + 1,
          maxRetries,
          error: lastError.message,
        });
      }
    }
  }

  logger.error('safeFetch', 'failed', {
    url,
    attempts: maxRetries + 1,
    error: lastError?.message,
  });

  throw lastError;
}
