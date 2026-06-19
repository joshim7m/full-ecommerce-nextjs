// =============================================================================
// Logger — tiny wrapper around console with leveled output
// =============================================================================

import { env } from "./env";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel: LogLevel =
  (env.logLevel as LogLevel) in LEVEL_ORDER ? (env.logLevel as LogLevel) : "info";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[configuredLevel];
}

function format(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaString = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}${metaString}`;
}

export const logger = {
  debug(message: string, meta?: unknown): void {
    if (shouldLog("debug")) console.debug(format("debug", message, meta));
  },
  info(message: string, meta?: unknown): void {
    if (shouldLog("info")) console.info(format("info", message, meta));
  },
  warn(message: string, meta?: unknown): void {
    if (shouldLog("warn")) console.warn(format("warn", message, meta));
  },
  error(message: string, meta?: unknown): void {
    if (shouldLog("error")) console.error(format("error", message, meta));
  },
};
