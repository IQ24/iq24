export interface JobDefinition {
  id: string;
  name: string;
  description?: string;
  schedule?: string; // Cron expression
  retryPolicy?: RetryPolicy;
  timeout?: number;
  priority?: JobPriority;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: "exponential" | "linear" | "fixed";
  initialDelay: number;
  maxDelay: number;
}

export enum JobPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
}

export interface JobContext {
  jobId: string;
  attemptNumber: number;
  scheduledAt: Date;
  data: any;
  logger: any;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export type JobHandler = (context: JobContext) => Promise<JobResult>;
