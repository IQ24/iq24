// IQ24.ai Base Agent - Foundation for All AI Agents

import { EventEmitter } from 'events';
import { z } from 'zod';
import type { 
  AgentType, 
  Task, 
  TaskStatus, 
  ModelInfo,
  FeatureVector,
  AnalyticsMetric 
} from '../types';

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
   * Get current agent status
   */
  async getStatus() {
    const healthStatus = await this.getHealthStatus();
    
    return {
      id: this.config.id,
      type: this.config.type,
      name: this.config.name,
      version: this.config.version,
      isHealthy: this.isHealthy,
      activeTasks: this.activeTasks.size,
      healthStatus,
      uptime: process.uptime(),
      models: this.config.models.map(m => ({
        id: m.id,
        name: m.name,
        type: m.type
      }))
    };
  }

  /**
   * Gracefully shutdown the agent
   */
  async shutdown(): Promise<void> {
    this.dependencies.logger.info(`Shutting down agent ${this.config.id}`);
    
    // Stop health checks
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Wait for active tasks to complete (with timeout)
    const shutdownTimeout = 30000; // 30 seconds
    const startTime = Date.now();
    
    while (this.activeTasks.size > 0 && (Date.now() - startTime) < shutdownTimeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (this.activeTasks.size > 0) {
      this.dependencies.logger.warn(`Agent ${this.config.id} shutting down with ${this.activeTasks.size} active tasks`);
    }

    this.emit('shutdown');
  }

  // ============================================================================
  // PROTECTED UTILITY METHODS
  // ============================================================================

  /**
   * Get features for a prospect from the feature store
   */
  protected async getFeatures(prospectId: string, featureNames: string[]): Promise<FeatureVector | null> {
    try {
      return await this.dependencies.featureStore.getFeatures(prospectId, featureNames);
    } catch (error) {
      this.dependencies.logger.error(`Failed to get features for prospect ${prospectId}`, { error });
      return null;
    }
  }

  /**
   * Get a model from the model store
   */
  protected async getModel(modelId: string): Promise<ModelInfo | null> {
    try {
      return await this.dependencies.modelStore.getModel(modelId);
    } catch (error) {
      this.dependencies.logger.error(`Failed to get model ${modelId}`, { error });
      return null;
    }
  }

  /**
   * Record a metric
   */
  protected async recordMetric(name: string, value: number, dimensions: Record<string, string> = {}): Promise<void> {
    const metric: AnalyticsMetric = {
      name: `agent.${this.config.type}.${name}`,
      value,
      unit: 'count',
      timestamp: new Date(),
      dimensions: {
        agentId: this.config.id,
        agentType: this.config.type,
        ...dimensions
      }
    };

    try {
      await this.dependencies.metrics.record(metric);
    } catch (error) {
      this.dependencies.logger.error('Failed to record metric', { metric, error });
    }
  }

  /**
   * Emit an event to the system event bus
   */
  protected emitSystemEvent(eventType: string, data: any): void {
    this.dependencies.eventBus.emit(eventType, {
      agentId: this.config.id,
      agentType: this.config.type,
      timestamp: new Date(),
      data
    });
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

        // Emit health change events
        if (wasHealthy !== this.isHealthy) {
          this.emit('healthChanged', { 
            previousHealth: wasHealthy, 
            currentHealth: this.isHealthy,
            details: health.details 
          });
        }

        // Record health metrics
        await this.recordMetric('health_check', this.isHealthy ? 1 : 0, {
          status: health.status
        });

      } catch (error) {
        this.dependencies.logger.error(`Health check failed for agent ${this.config.id}`, { error });
        this.isHealthy = false;
      }
    }, this.config.healthCheck.intervalMs);
  }

  private setupEventHandlers(): void {
    // Handle process signals for graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }
}

/**
 * Agent factory for creating and registering agents
 */
export class AgentFactory {
  private static agents: Map<string, typeof BaseAgent> = new Map();

  static register(agentType: AgentType, agentClass: typeof BaseAgent): void {
    this.agents.set(agentType, agentClass);
  }

  static create(
    agentType: AgentType, 
    config: AgentConfig, 
    dependencies: AgentDependencies
  ): BaseAgent {
    const AgentClass = this.agents.get(agentType);
    if (!AgentClass) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    return new AgentClass(config, dependencies);
  }

  static getRegisteredAgents(): AgentType[] {
    return Array.from(this.agents.keys()) as AgentType[];
  }
}