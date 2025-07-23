import { BaseAgent } from "../base/agent.js";
import { AgentConfig, TaskContext, WorkflowTask } from "@iq24/ai-core/types";
interface VEAConfig extends AgentConfig {
    enrichmentProviders: {
        apollo: {
            apiKey: string;
            enabled: boolean;
        };
        hunter: {
            apiKey: string;
            enabled: boolean;
        };
        clearbit: {
            apiKey: string;
            enabled: boolean;
        };
    };
    validation: {
        emailMinConfidence: number;
        phoneMinConfidence: number;
        deduplicationThreshold: number;
        maxEnrichmentSources: number;
    };
    dataPipelines: {
        staging: string;
        processed: string;
        failed: string;
    };
}
/**
 * Validation & Enrichment Agent (VEA)
 *
 * Responsibilities:
 * - Validates email addresses and phone numbers using external APIs
 * - Cross-references data across multiple sources
 * - Enriches profiles with firmographic, technographic, and demographic data
 * - Performs data deduplication and standardization
 * - Updates prospect records in database and Feature Store
 */
export declare class ValidationEnrichmentAgent extends BaseAgent {
    private config;
    private logger;
    private enrichmentProviders;
    constructor(config: VEAConfig);
    private initializeProviders;
    protected processTask(task: WorkflowTask, context: TaskContext): Promise<any>;
    /**
     * Validates contact information from PDA candidates
     */
    private validateContacts;
    /**
     * Enriches validated leads with additional data from multiple sources
     */
    private enrichProfiles;
    /**
     * Performs multi-source data enrichment with waterfall logic
     */
    private performMultiSourceEnrichment;
    /**
     * Email validation using multiple techniques
     */
    private validateEmail;
    /**
     * Phone number validation and formatting
     */
    private validatePhone;
    /**
     * Data deduplication using fuzzy matching and key generation
     */
    private deduplicateData;
    /**
     * Cross-reference data across multiple sources for consistency
     */
    private crossReferenceData;
    private calculateValidationScore;
    private generateDeduplicationKey;
    private getValidationReasons;
    private callEnrichmentProvider;
    private callApolloEnrichment;
    private callHunterEnrichment;
    private callClearbitEnrichment;
    private callHunterVerification;
    private validateDomain;
    private shouldOverrideData;
    private getProviderConfidence;
    getHealth(): Promise<{
        status: "healthy" | "unhealthy";
        details: Record<string, any>;
    }>;
}
export {};
//# sourceMappingURL=vea-agent.d.ts.map