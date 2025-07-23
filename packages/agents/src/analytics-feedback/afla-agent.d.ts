import { BaseAgent } from '../base/agent.js';
import { WorkflowContext, TaskDefinition, TaskResult } from '@iq24/types';
/**
 * Analytics & Feedback Loop Agent (AFLA) - Simplified Version
 *
 * Responsibilities:
 * - Monitor campaign performance in real-time
 * - Analyze engagement data using ML models
 * - Generate actionable insights and recommendations
 * - Provide feedback to ALO for dynamic optimization
 * - Detect anomalies and performance issues
 * - Update Feature Store with engagement-derived features
 */
export declare class AnalyticsFeedbackAgent extends BaseAgent {
    constructor();
    executeTask(task: TaskDefinition, context: WorkflowContext): Promise<TaskResult>;
    /**
     * Analyze campaign performance across multiple dimensions
     */
    private analyzeCampaignPerformance;
    /**
     * Generate actionable insights from performance data
     */
    private generateInsights;
    private detectAnomalies;
    private predictConversions;
    private analyzeAttribution;
    private generateRecommendations;
    private updateFeatureStore;
    private monitorSystemHealth;
}
//# sourceMappingURL=afla-agent.d.ts.map