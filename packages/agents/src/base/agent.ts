// IQ24.ai Base Agent - Foundation for All AI Agents

import { EventEmitter } from 'events';
import { z } from 'zod';

// Core Types
export type AgentType = 
  | 'prospect_discovery' 
  | 'validation_enrichment' 
  | 'outreach_personalization' 
  | 'campaign_execution' 
  | 'analytics_feedback' 
  | 'compliance_guardian' 
  | 'cognitive_reflection';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface Task {
  id: string;
  type: string;
  status: TaskStatus;
  payload: any;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  retryCount: number;
  maxRetries: number;
  errors: string[];
  metadata: Record<string, any>;
}

export interface ModelInfo {
  name: string;
  version: string;
  provider: string;
  type: 'llm' | 'embedding' | 'classification' | 'generation';
  config: Record<string, any>;
}

export interface FeatureVector {
  features: Record<string, number>;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: Date;
}

export interface AgentConfig {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  version: string;
  models: ModelInfo[];
  maxConcurrency: number;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    baseDelayMs: number;
  };
  healthCheck: {
    intervalMs: number;
    timeoutMs: number;
  };
}

export interface AgentContext {
  taskId: string;
  workflowId?: string;
  userId: string;
  workspaceId: string;
  metadata: Record<string, any>;
  correlationId: string;
}

export interface AgentDependencies {
  featureStore: any;
  modelStore: any;
  dataStore: any;
  logger: any;
  metrics: any;
  eventBus: EventEmitter;
}

export abstract class BaseAgent extends EventEmitter {
  protected config: AgentConfig;
  protected dependencies: AgentDependencies;
  protected isHealthy: boolean = true;
  protected activeTasks: Map<string, Task> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: AgentConfig, dependencies: AgentDependencies) {
    super();
    this.config = config;
    this.dependencies = dependencies;
    this.setupHealthCheck();
    this.setupEventHandlers();
  }

  // ============================================================================
  // ABSTRACT METHODS - Must be implemented by each agent
  // ============================================================================

  /**
   * Execute the agent's core logic
   */
  abstract execute(task: Task, context: AgentContext): Promise<any>;

  /**
   * Validate task payload before execution
   */
  abstract validatePayload(payload: any): boolean;

  /**
   * Get agent-specific health status
   */
  abstract getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }>;

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Process a task with full error handling and metrics
   */
  async processTask(task: Task, context: AgentContext): Promise<any> {
    const startTime = Date.now();
    this.activeTasks.set(task.id, task);

    try {
      // Validate payload
      if (!this.validatePayload(task.payload)) {
        throw new Error(`Invalid payload for task ${task.id}`);
      }

      // Log task start
      this.dependencies.logger.info(`Agent ${this.config.id} starting task ${task.id}`, {
        agentType: this.config.type,
        taskType: task.type,
        correlationId: context.correlationId
      });

      // Execute task
      this.emit('taskStarted', { task, context });
      const result = await this.execute(task, context);

      // Record success metrics
      const duration = Date.now() - startTime;
      await this.recordMetric('task_completed', 1, {
        agentType: this.config.type,
        taskType: task.type,
        duration: duration.toString()
      });

      this.emit('taskCompleted', { task, context, result, duration });
      
      this.dependencies.logger.info(`Agent ${this.config.id} completed task ${task.id}`, {
        duration,
        correlationId: context.correlationId
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failure metrics
      await this.recordMetric('task_failed', 1, {
        agentType: this.config.type,
        taskType: task.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      this.emit('taskFailed', { task, context, error, duration });
      
      this.dependencies.logger.error(`Agent ${this.config.id} failed task ${task.id}`, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        duration,
        correlationId: context.correlationId
      });

      throw error;
    } finally {
      this.activeTasks.delete(task.id);
    }
  }

  /**
   * Get current agent status and metrics
   */
  async getStatus() {
    const health = await this.getHealthStatus();
    return {
      id: this.config.id,
      type: this.config.type,
      name: this.config.name,
      version: this.config.version,
      isHealthy: this.isHealthy,
      activeTasks: this.activeTasks.size,
      maxConcurrency: this.config.maxConcurrency,
      healthDetails: health
    };
  }

  /**
   * Graceful shutdown - complete active tasks and cleanup
   */
  async shutdown(timeoutMs: number = 30000): Promise<void> {
    this.dependencies.logger.info(`Agent ${this.config.id} starting graceful shutdown`);
    
    // Clear health check
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Wait for active tasks to complete or timeout
    const shutdownPromise = this.waitForActiveTasks();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Shutdown timeout')), timeoutMs)
    );

    try {
      await Promise.race([shutdownPromise, timeoutPromise]);
      this.dependencies.logger.info(`Agent ${this.config.id} shutdown completed`);
    } catch (error) {
      this.dependencies.logger.warn(`Agent ${this.config.id} shutdown timeout, forcing termination`);
      this.activeTasks.clear();
    }

    this.emit('shutdown');
  }

  // ============================================================================
  // PROTECTED METHODS
  // ============================================================================

  protected async recordMetric(name: string, value: number, tags: Record<string, string> = {}): Promise<void> {
    const metric: AnalyticsMetric = {
      name,
      value,
      tags: {
        agent_id: this.config.id,
        agent_type: this.config.type,
        ...tags
      },
      timestamp: new Date()
    };

    try {
      await this.dependencies.metrics.record(metric);
    } catch (error) {
      this.dependencies.logger.warn(`Failed to record metric ${name}`, { error });
    }
  }

  protected async storeFeatures(features: FeatureVector): Promise<void> {
    try {
      await this.dependencies.featureStore.store(
        `agent_${this.config.id}`, 
        features
      );
    } catch (error) {
      this.dependencies.logger.warn(`Failed to store features`, { error });
    }
  }

  protected async getFeatures(key: string): Promise<FeatureVector | null> {
    try {
      return await this.dependencies.featureStore.get(key);
    } catch (error) {
      this.dependencies.logger.warn(`Failed to get features for ${key}`, { error });
      return null;
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private setupHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getHealthStatus();
        const wasHealthy = this.isHealthy;
        this.isHealthy = health.status === 'healthy';

        if (wasHealthy !== this.isHealthy) {
          this.emit('healthChanged', { 
            agent: this.config.id, 
            healthy: this.isHealthy,
            details: health 
          });
          
          this.dependencies.logger.info(
            `Agent ${this.config.id} health changed to ${this.isHealthy ? 'healthy' : 'unhealthy'}`,
            health
          );
        }
      } catch (error) {
        this.dependencies.logger.error(`Health check failed for agent ${this.config.id}`, { error });
        this.isHealthy = false;
      }
    }, this.config.healthCheck.intervalMs);
  }

  private setupEventHandlers(): void {
    // Set up any default event handlers
    this.on('error', (error) => {
      this.dependencies.logger.error(`Agent ${this.config.id} error`, { error });
    });
  }

  private async waitForActiveTasks(): Promise<void> {
    while (this.activeTasks.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}