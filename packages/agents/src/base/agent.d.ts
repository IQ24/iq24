import { EventEmitter } from "events";
export type AgentType = "prospect_discovery" | "validation_enrichment" | "outreach_personalization" | "campaign_execution" | "analytics_feedback" | "compliance_guardian" | "cognitive_reflection";
export type TaskStatus = "pending" | "in_progress" | "completed" | "failed" | "cancelled";
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
    type: "llm" | "embedding" | "classification" | "generation";
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
export declare abstract class BaseAgent extends EventEmitter {
    protected config: AgentConfig;
    protected dependencies: AgentDependencies;
    protected isHealthy: boolean;
    protected activeTasks: Map<string, Task>;
    private healthCheckInterval?;
    constructor(config: AgentConfig, dependencies: AgentDependencies);
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
        status: "healthy" | "degraded" | "unhealthy";
        details: Record<string, any>;
    }>;
    /**
     * Process a task with full error handling and metrics
     */
    processTask(task: Task, context: AgentContext): Promise<any>;
    /**
     * Get current agent status and metrics
     */
    getStatus(): Promise<{
        id: string;
        type: AgentType;
        name: string;
        version: string;
        isHealthy: boolean;
        activeTasks: number;
        maxConcurrency: number;
        healthDetails: {
            status: "healthy" | "degraded" | "unhealthy";
            details: Record<string, any>;
        };
    }>;
    /**
     * Graceful shutdown - complete active tasks and cleanup
     */
    shutdown(timeoutMs?: number): Promise<void>;
    protected recordMetric(name: string, value: number, tags?: Record<string, string>): Promise<void>;
    protected storeFeatures(features: FeatureVector): Promise<void>;
    protected getFeatures(key: string): Promise<FeatureVector | null>;
    private setupHealthCheck;
    private setupEventHandlers;
    private waitForActiveTasks;
}
//# sourceMappingURL=agent.d.ts.map