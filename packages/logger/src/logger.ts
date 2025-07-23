import pino from "pino";

// Create shared logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});

// Export logger factory for creating contextual loggers
export function createLogger(context: string) {
  return logger.child({ context });
}
