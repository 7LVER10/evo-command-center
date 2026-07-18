type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  scope: string;
  event: string;
  meta?: Record<string, unknown>;
}

function formatLog(entry: LogEntry): string {
  const meta = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.scope}] ${entry.event}${meta}`;
}

function write(level: LogLevel, scope: string, event: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    event,
    meta,
  };

  if (level === 'error') {
    console.error(formatLog(entry));
  } else if (level === 'warn') {
    console.warn(formatLog(entry));
  } else {
    console.log(formatLog(entry));
  }
}

export const logger = {
  info: (scope: string, event: string, meta?: Record<string, unknown>) => write('info', scope, event, meta),
  warn: (scope: string, event: string, meta?: Record<string, unknown>) => write('warn', scope, event, meta),
  error: (scope: string, event: string, meta?: Record<string, unknown>) => write('error', scope, event, meta),
};
