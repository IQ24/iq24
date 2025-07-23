import { JobDefinition, JobPriority } from "./job-types";
import { getLogger } from "@iq24/logger";

export interface QueuedJob {
  id: string;
  jobId: string;
  data: any;
  priority: JobPriority;
  scheduledAt: Date;
  attemptNumber: number;
  maxAttempts: number;
  lastError?: string;
}

export class JobQueue {
  private queue: QueuedJob[] = [];
  private processing = false;
  private logger = getLogger("JobQueue");

  async enqueue(job: QueuedJob): Promise<void> {
    this.queue.push(job);
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first

    this.logger.info(`Enqueued job ${job.jobId}`, {
      jobId: job.jobId,
      priority: job.priority,
      queueSize: this.queue.length,
    });
  }

  async dequeue(): Promise<QueuedJob | undefined> {
    const job = this.queue.shift();
    if (job) {
      this.logger.info(`Dequeued job ${job.jobId}`, {
        jobId: job.jobId,
        remainingInQueue: this.queue.length,
      });
    }
    return job;
  }

  async peek(): Promise<QueuedJob | undefined> {
    return this.queue[0];
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getQueuedJobs(): QueuedJob[] {
    return [...this.queue];
  }

  async clear(): Promise<void> {
    const previousSize = this.queue.length;
    this.queue = [];
    this.logger.info(`Cleared queue, removed ${previousSize} jobs`);
  }

  async removeJob(jobId: string): Promise<boolean> {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((job) => job.id !== jobId);
    const removed = this.queue.length < initialLength;

    if (removed) {
      this.logger.info(`Removed job ${jobId} from queue`);
    }

    return removed;
  }

  async getJobStatus(jobId: string): Promise<"queued" | "not_found"> {
    const job = this.queue.find((j) => j.id === jobId);
    return job ? "queued" : "not_found";
  }

  async requeue(job: QueuedJob): Promise<void> {
    job.attemptNumber += 1;
    await this.enqueue(job);
  }
}
