/**
 * Structured Logger - Production-grade logging utility
 * Provides consistent log format with levels, timestamps, and context
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: string;
  requestId?: string;
  userId?: number | null;
  data?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

function formatEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, meta?: Partial<Omit<LogEntry, "level" | "timestamp" | "message">>) {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...meta,
  };

  const output = formatEntry(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

/**
 * Create a scoped logger with a fixed context name
 */
export function createLogger(context: string) {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      log("debug", message, { context, data });
    },
    info(message: string, data?: Record<string, unknown>) {
      log("info", message, { context, data });
    },
    warn(message: string, data?: Record<string, unknown>) {
      log("warn", message, { context, data });
    },
    error(message: string, error?: unknown, data?: Record<string, unknown>) {
      const errorMeta = error instanceof Error
        ? { message: error.message, stack: error.stack, code: (error as any).code }
        : error
          ? { message: String(error) }
          : undefined;
      log("error", message, { context, data, error: errorMeta });
    },
    /** Log with request context */
    withRequest(requestId?: string, userId?: number | null) {
      return {
        debug(message: string, data?: Record<string, unknown>) {
          log("debug", message, { context, requestId, userId, data });
        },
        info(message: string, data?: Record<string, unknown>) {
          log("info", message, { context, requestId, userId, data });
        },
        warn(message: string, data?: Record<string, unknown>) {
          log("warn", message, { context, requestId, userId, data });
        },
        error(message: string, err?: unknown, data?: Record<string, unknown>) {
          const errorMeta = err instanceof Error
            ? { message: err.message, stack: err.stack, code: (err as any).code }
            : err
              ? { message: String(err) }
              : undefined;
          log("error", message, { context, requestId, userId, data, error: errorMeta });
        },
      };
    },
  };
}

/** Global application logger */
export const logger = createLogger("app");
