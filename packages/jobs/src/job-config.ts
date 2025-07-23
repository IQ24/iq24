import { JobDefinition } from "./job-types";

export const DEFAULT_JOB_CONFIG = {
  maxConcurrentJobs: 10,
  defaultTimeout: 30000, // 30 seconds
  defaultRetryAttempts: 3,
  queuePollInterval: 1000,
  cleanupInterval: 300000, // 5 minutes
};

export const JOB_DEFINITIONS: Record<string, JobDefinition> = {
  // Data Processing Jobs
  "process-campaign-data": {
    id: "process-campaign-data",
    name: "Process Campaign Data",
    description: "Process and analyze campaign performance data",
    timeout: 60000,
    retryPolicy: {
      maxAttempts: 3,
      backoffStrategy: "exponential",
      initialDelay: 1000,
      maxDelay: 30000,
    },
  },

  // AI Jobs
  "generate-ai-content": {
    id: "generate-ai-content",
    name: "Generate AI Content",
    description: "Generate personalized content using AI",
    timeout: 120000,
    retryPolicy: {
      maxAttempts: 2,
      backoffStrategy: "exponential",
      initialDelay: 2000,
      maxDelay: 60000,
    },
  },

  // Notification Jobs
  "send-notifications": {
    id: "send-notifications",
    name: "Send Notifications",
    description: "Send notifications to users",
    timeout: 30000,
    retryPolicy: {
      maxAttempts: 5,
      backoffStrategy: "exponential",
      initialDelay: 500,
      maxDelay: 10000,
    },
  },

  // Analytics Jobs
  "calculate-metrics": {
    id: "calculate-metrics",
    name: "Calculate Metrics",
    description: "Calculate performance metrics and KPIs",
    schedule: "0 */6 * * *", // Every 6 hours
    timeout: 180000,
    retryPolicy: {
      maxAttempts: 3,
      backoffStrategy: "exponential",
      initialDelay: 5000,
      maxDelay: 60000,
    },
  },
};
