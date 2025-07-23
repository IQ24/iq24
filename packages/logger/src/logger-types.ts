// Logger types
export interface LogContext {
  context: string;
  correlationId?: string;
  userId?: string;
  requestId?: string;
}

export type LogLevel = "error" | "warn" | "info" | "debug" | "trace";
