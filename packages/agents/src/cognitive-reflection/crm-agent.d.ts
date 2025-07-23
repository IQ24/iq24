import { BaseAgent } from '../base/agent.js';
import { WorkflowContext, TaskDefinition, TaskResult } from '@iq24/types';
/**
 * Cognitive Reflection & Meta-Learning Agent (CRMA) - Simplified Version
 *
 * Responsibilities:
 * - Analyze system performance patterns across all agents
 * - Generate meta-insights about agent effectiveness
 * - Facilitate knowledge transfer between agents
 * - Suggest strategic improvements and experiments
 * - Plan long-term system evolution
 * - Process human feedback and integrate learning
 */
export declare class CognitiveReflectionAgent extends BaseAgent {
    constructor();
    executeTask(task: TaskDefinition, context: WorkflowContext): Promise<TaskResult>;
    /**
     * Analyze system performance patterns across all agents
     */
    private analyzeSystemPatterns;
    /**
     * Generate meta-insights about agent effectiveness
     */
    private generateMetaInsights;
    private facilitateKnowledgeTransfer;
    private suggestStrategicImprovements;
    private designModelExperiments;
    private planSystemEvolution;
    private processHumanFeedback;
    private optimizeAgentInteractions;
    private evaluateLearningEffectiveness;
}
//# sourceMappingURL=crm-agent.d.ts.map