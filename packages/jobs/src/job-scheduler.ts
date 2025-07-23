import { JobDefinition, JobHandler, JobContext, JobResult } from "./job-types";
import { getLogger } from "@iq24/logger";

export class JobScheduler {
  private jobs: Map<
    string,
    { definition: JobDefinition; handler: JobHandler }
  > = new Map();
  private logger = getLogger("JobScheduler");

  register(definition: JobDefinition, handler: JobHandler): void {
    this.jobs.set(definition.id, { definition, handler });
    this.logger.info(`Registered job: ${definition.id}`);
  }

  async schedule(
    jobId: string,
    data: any,
    scheduledAt?: Date,
  ): Promise<string> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const executionId = `${jobId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // In a real implementation, this would queue the job
    // For now, we'll just log the scheduling
    this.logger.info(
      `Scheduled job ${jobId} with execution ID ${executionId}`,
      {
        jobId,
        executionId,
        scheduledAt: scheduledAt || new Date(),
        data,
      },
    );

    return executionId;
  }

  async execute(
    jobId: string,
    data: any,
    attemptNumber: number = 1,
  ): Promise<JobResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const context: JobContext = {
      jobId,
      attemptNumber,
      scheduledAt: new Date(),
      data,
      logger: getLogger(`Job-${jobId}`),
    };

    try {
      this.logger.info(`Executing job ${jobId}`, { jobId, attemptNumber });
      const result = await job.handler(context);

      if (result.success) {
        this.logger.info(`Job ${jobId} completed successfully`, {
          jobId,
          result,
        });
      } else {
        this.logger.error(`Job ${jobId} failed`, {
          jobId,
          error: result.error,
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`Job ${jobId} threw an error`, { jobId, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  getRegisteredJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  getJobDefinition(jobId: string): JobDefinition | undefined {
    return this.jobs.get(jobId)?.definition;
  }
}
