/**
 * AI Core Logger Utility
 * 
 * Provides structured logging for the AI orchestration system
 */

export interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

export class Logger {
  private context: string;
  private level: keyof LogLevel;

  constructor(context: string, level: keyof LogLevel = "INFO") {
    this.context = context;
    this.level = level;
  }

  private shouldLog(level: keyof LogLevel): boolean {
    const levels: LogLevel = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    return levels[level] <= levels[this.level];
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level} [${this.context}] ${message}${metaStr}`;
  }

  error(message: string, error?: Error | any): void {
    if (!this.shouldLog("ERROR")) return;
    
    const meta = error instanceof Error 
      ? { error: error.message, stack: error.stack }
      : error;
    
    console.error(this.formatMessage("ERROR", message, meta));
  }

  warn(message: string, meta?: any): void {
    if (!this.shouldLog("WARN")) return;
    console.warn(this.formatMessage("WARN", message, meta));
  }

  info(message: string, meta?: any): void {
    if (!this.shouldLog("INFO")) return;
    console.log(this.formatMessage("INFO", message, meta));
  }

  debug(message: string, meta?: any): void {
    if (!this.shouldLog("DEBUG")) return;
    console.log(this.formatMessage("DEBUG", message, meta));
  }
}