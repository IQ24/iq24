import { BaseAgent } from "../base/agent.js";
import { AgentConfig, TaskContext, WorkflowTask } from "@iq24/ai-core/types";
interface OPAConfig extends AgentConfig {
    llmProviders: {
        openai: {
            apiKey: string;
            model: string;
            enabled: boolean;
        };
        anthropic: {
            apiKey: string;
            model: string;
            enabled: boolean;
        };
        mistral: {
            apiKey: string;
            model: string;
            enabled: boolean;
        };
    };
    mseoServices: {
        voiceGeneration: {
            provider: "elevenlabs" | "aws-polly";
            enabled: boolean;
        };
        imageGeneration: {
            provider: "dall-e" | "stable-diffusion";
            enabled: boolean;
        };
        videoGeneration: {
            provider: "custom" | "synthesia";
            enabled: boolean;
        };
    };
    personalization: {
        maxVariants: number;
        abTestEnabled: boolean;
        tonalityAnalysis: boolean;
        sentimentOptimization: boolean;
        industrySpecific: boolean;
    };
    prompts: {
        templates: Record<string, string>;
        personalityTraits: string[];
        industryInsights: Record<string, string[]>;
    };
}
/**
 * Outreach Personalization Agent (OPA)
 *
 * Responsibilities:
 * - Analyzes enriched prospect data for personalization opportunities
 * - Uses advanced NLP/LLMs to generate personalized content
 * - Optimizes subject lines, CTAs, and message tone using predictive models
 * - Integrates with MSEO for multi-modal content generation
 * - Adapts messaging based on campaign goals and ALO instructions
 */
export declare class OutreachPersonalizationAgent extends BaseAgent {
    private config;
    private logger;
    private llmClients;
    private promptTemplates;
    constructor(config: OPAConfig);
    private initializeLLMClients;
    private loadPromptTemplates;
    protected processTask(task: WorkflowTask, context: TaskContext): Promise<any>;
    /**
     * Main personalization orchestration method
     */
    private personalizeOutreach;
    /**
     * Analyzes prospect data to identify personalization opportunities
     */
    private analyzePersonalizationOpportunities;
    /**
     * Generates multiple personalized message variants using LLMs
     */
    private generatePersonalizedMessages;
    /**
     * Generates MSEO (Multi-Sensory Engagement Orchestration) assets
     */
    private generateMSEOAssets;
    private callLLMProvider;
    private parseAndValidateResponse;
    private generateVoiceMessage;
    private generatePersonalizedImage;
    private generatePersonalizedVideo;
    private analyzeRoleSpecificChallenges;
    private getIndustrySpecificInsights;
    private rankVariantsByEngagement;
    private predictEngagementScore;
    private prepareLLMContext;
    private populateTemplate;
    private extractPersonalizationTokens;
    private shouldGenerateMSEOAssets;
    private callMSEOService;
    getHealth(): Promise<{
        status: "healthy" | "unhealthy";
        details: Record<string, any>;
    }>;
    private structurePlainTextResponse;
    private generateFallbackSubject;
    private extractCallToAction;
    private estimateEngagement;
    private adaptMessageForVoice;
    private createPersonalizedImagePrompt;
    private adaptMessageForVideo;
    private callMistralAPI;
    private getLocationBasedInsights;
    private analyzeTechnologyStackOpportunities;
    private analyzePainPointsForMessaging;
    private generateOptimizationRecommendations;
}
export {};
//# sourceMappingURL=opa-agent.d.ts.map