import { JobQueue, QueuedJob } from "./job-queue";
import { JobScheduler } from "./job-scheduler";
import { getLogger } from "@iq24/logger";

export class JobWorker {
  private queue: JobQueue;
  private scheduler: JobScheduler;
  private isRunning = false;
  private processingInterval?: NodeJS.Timeout;
  private logger = getLogger("JobWorker");

  constructor(queue: JobQueue, scheduler: JobScheduler) {
    this.queue = queue;
    this.scheduler = scheduler;
  }

  async start(intervalMs: number = 1000): Promise<void> {
    if (this.isRunning) {
      this.logger.warn("Worker is already running");
      return;
    }

    this.isRunning = true;
    this.logger.info("Starting job worker", { intervalMs });

    this.processingInterval = setInterval(async () => {
      await this.processNextJob();
    }, intervalMs);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn("Worker is not running");
      return;
    }

    this.isRunning = false;

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }

    this.logger.info("Stopped job worker");
  }

  private async processNextJob(): Promise<void> {
    try {
      const job = await this.queue.dequeue();
      if (!job) {
        return; // No jobs to process
      }

      await this.executeJob(job);
    } catch (error) {
      this.logger.error("Error processing job", { error });
    }
  }

  private async executeJob(job: QueuedJob): Promise<void> {
    const startTime = Date.now();
    this.logger.info(`Processing job ${job.jobId}`, {
      jobId: job.jobId,
      attemptNumber: job.attemptNumber,
      maxAttempts: job.maxAttempts,
    });

    try {
      const result = await this.scheduler.execute(
        job.jobId,
        job.data,
        job.attemptNumber,
      );
      const duration = Date.now() - startTime;

      if (result.success) {
        this.logger.info(`Job ${job.jobId} completed successfully`, {
          jobId: job.jobId,
          duration,
          result: result.data,
        });
      } else {
        await this.handleJobFailure(job, result.error || "Unknown error");
      }
    } catch (error) {
      await this.handleJobFailure(
        job,
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  private async handleJobFailure(job: QueuedJob, error: string): Promise<void> {
    this.logger.error(`Job ${job.jobId} failed`, {
      jobId: job.jobId,
      attemptNumber: job.attemptNumber,
      maxAttempts: job.maxAttempts,
      error,
    });

    if (job.attemptNumber < job.maxAttempts) {
      // Retry the job
      job.lastError = error;
      await this.queue.requeue(job);

      this.logger.info(`Requeued job ${job.jobId} for retry`, {
        jobId: job.jobId,
        nextAttempt: job.attemptNumber + 1,
        maxAttempts: job.maxAttempts,
      });
    } else {
      // Max attempts reached, job failed permanently
      this.logger.error(
        `Job ${job.jobId} failed permanently after ${job.maxAttempts} attempts`,
        {
          jobId: job.jobId,
          finalError: error,
        },
      );

      // Here you would typically send the job to a dead letter queue
      // or trigger some failure handling mechanism
    }
  }

  getStatus(): { isRunning: boolean; queueSize: number } {
    return {
      isRunning: this.isRunning,
      queueSize: this.queue.getQueueSize(),
    };
  }
}
