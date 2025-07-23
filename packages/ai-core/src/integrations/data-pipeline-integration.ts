/**
 * IQ24.ai Data Pipeline Integration for AI Agents
 *
 * Provides seamless integration between AI agents and the data pipeline:
 * - Feature store access for personalization and lead scoring
 * - Real-time stream processing for event-driven workflows
 * - ML model deployment and prediction serving
 * - Data quality monitoring for agent inputs/outputs
 * - Lineage tracking for compliance and debugging
 */

import { EventEmitter } from "events";
import {
  DataPipeline,
  FeatureDefinition,
  ModelDefinition,
  QualityRule,
} from "../../data-pipeline/src";
import { AgentContext, ProspectData, CampaignMetrics } from "../types";

export interface DataPipelineIntegrationConfig {
  enableFeatureStore: boolean;
  enableModelStore: boolean;
  enableStreaming: boolean;
  enableQualityMonitoring: boolean;
  enableLineageTracking: boolean;
  featureNamespace: string;
  modelNamespace: string;
}

export interface AgentFeatureSet {
  prospectId: string;
  features: {
    // Prospect Discovery Features
    leadScore?: number;
    intentSignals?: number;
    companyGrowthRate?: number;
    technographicMatch?: number;

    // Validation & Enrichment Features
    emailDeliverability?: number;
    contactAccuracy?: number;
    dataCompleteness?: number;
    enrichmentConfidence?: number;

    // Personalization Features
    personalizationScore?: number;
    contentRelevance?: number;
    toneSuitability?: number;
    channelPreference?: string;

    // Campaign Execution Features
    optimalSendTime?: string;
    responselikelihood?: number;
    engagementHistory?: number;

    // Analytics Features
    conversionProbability?: number;
    lifetimeValue?: number;
    churnRisk?: number;
  };
}

export class DataPipelineIntegration extends EventEmitter {
  private dataPipeline: DataPipeline;
  private config: DataPipelineIntegrationConfig;
  private featureCache = new Map<string, AgentFeatureSet>();
  private modelCache = new Map<string, string>(); // modelName -> modelId mapping
  private initialized = false;

  constructor(
    dataPipeline: DataPipeline,
    config: DataPipelineIntegrationConfig,
  ) {
    super();
    this.dataPipeline = dataPipeline;
    this.config = config;
    this.setupEventHandlers();
  }

  async initialize(): Promise<void> {
    console.log("🔗 Initializing Data Pipeline Integration for AI Agents...");

    try {
      // Initialize feature definitions for AI agents
      if (this.config.enableFeatureStore) {
        await this.initializeFeatures();
      }

      // Initialize ML models for AI agents
      if (this.config.enableModelStore) {
        await this.initializeModels();
      }

      // Setup quality monitoring rules
      if (this.config.enableQualityMonitoring) {
        await this.initializeQualityRules();
      }

      this.initialized = true;
      console.log("✅ Data Pipeline Integration initialized");
      this.emit("initialized");
    } catch (error) {
      console.error(
        "❌ Failed to initialize Data Pipeline Integration:",
        error,
      );
      throw error;
    }
  }

  /**
   * Feature Store Integration for AI Agents
   */
  async getProspectFeatures(
    prospectId: string,
    agentType?: string,
  ): Promise<AgentFeatureSet> {
    const cacheKey = `${prospectId}_${agentType || "all"}`;

    if (this.featureCache.has(cacheKey)) {
      return this.featureCache.get(cacheKey)!;
    }

    try {
      const featureNames = this.getFeatureNamesForAgent(agentType);
      const features = await this.dataPipeline.getFeatures(
        featureNames,
        prospectId,
      );

      const featureSet: AgentFeatureSet = {
        prospectId,
        features,
      };

      // Cache for 5 minutes
      this.featureCache.set(cacheKey, featureSet);
      setTimeout(() => this.featureCache.delete(cacheKey), 5 * 60 * 1000);

      return featureSet;
    } catch (error) {
      console.error(
        `Failed to get features for prospect ${prospectId}:`,
        error,
      );
      throw error;
    }
  }

  async updateProspectFeatures(
    prospectId: string,
    features: Partial<AgentFeatureSet["features"]>,
  ): Promise<void> {
    try {
      for (const [featureName, value] of Object.entries(features)) {
        if (value !== undefined) {
          await this.dataPipeline.setFeature(
            `${this.config.featureNamespace}.${featureName}`,
            prospectId,
            value,
          );
        }
      }

      // Clear cache for this prospect
      for (const key of this.featureCache.keys()) {
        if (key.startsWith(prospectId)) {
          this.featureCache.delete(key);
        }
      }

      this.emit("features_updated", { prospectId, features });
    } catch (error) {
      console.error(
        `Failed to update features for prospect ${prospectId}:`,
        error,
      );
      throw error;
    }
  }

  async computeFeaturesForProspects(prospectIds: string[]): Promise<void> {
    try {
      await this.dataPipeline.computeFeatures(prospectIds);

      // Clear cache for these prospects
      for (const prospectId of prospectIds) {
        for (const key of this.featureCache.keys()) {
          if (key.startsWith(prospectId)) {
            this.featureCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error("Failed to compute features for prospects:", error);
      throw error;
    }
  }

  /**
   * ML Model Integration for AI Agents
   */
  async predictLeadScore(prospectData: ProspectData): Promise<number> {
    try {
      const modelId = this.modelCache.get("lead_scoring");
      if (!modelId) {
        throw new Error("Lead scoring model not found");
      }

      const features = this.extractFeaturesFromProspect(prospectData);
      const prediction = await this.dataPipeline.predict(modelId, features);

      return prediction.score || 0;
    } catch (error) {
      console.error("Failed to predict lead score:", error);
      return 0; // Default score
    }
  }

  async predictPersonalizationScore(
    prospectData: ProspectData,
    messageContent: string,
  ): Promise<number> {
    try {
      const modelId = this.modelCache.get("personalization_scoring");
      if (!modelId) {
        throw new Error("Personalization scoring model not found");
      }

      const features = {
        ...this.extractFeaturesFromProspect(prospectData),
        messageLength: messageContent.length,
        personalTokens: this.countPersonalTokens(messageContent),
        sentimentScore: await this.analyzeSentiment(messageContent),
      };

      const prediction = await this.dataPipeline.predict(modelId, features);
      return prediction.score || 0;
    } catch (error) {
      console.error("Failed to predict personalization score:", error);
      return 0;
    }
  }

  async predictOptimalSendTime(prospectData: ProspectData): Promise<string> {
    try {
      const modelId = this.modelCache.get("send_time_optimization");
      if (!modelId) {
        return "09:00"; // Default time
      }

      const features = this.extractFeaturesFromProspect(prospectData);
      const prediction = await this.dataPipeline.predict(modelId, features);

      return prediction.optimalTime || "09:00";
    } catch (error) {
      console.error("Failed to predict optimal send time:", error);
      return "09:00";
    }
  }

  async predictConversionProbability(
    prospectData: ProspectData,
    campaignMetrics: CampaignMetrics,
  ): Promise<number> {
    try {
      const modelId = this.modelCache.get("conversion_prediction");
      if (!modelId) {
        return 0.1; // Default probability
      }

      const features = {
        ...this.extractFeaturesFromProspect(prospectData),
        ...this.extractFeaturesFromCampaign(campaignMetrics),
      };

      const prediction = await this.dataPipeline.predict(modelId, features);
      return prediction.probability || 0.1;
    } catch (error) {
      console.error("Failed to predict conversion probability:", error);
      return 0.1;
    }
  }

  /**
   * Stream Processing Integration
   */
  async publishAgentEvent(
    agentType: string,
    eventType: string,
    data: any,
  ): Promise<void> {
    if (!this.config.enableStreaming) {
      return;
    }

    try {
      await this.dataPipeline.publishToStream(
        `agent.${agentType}.${eventType}`,
        {
          timestamp: new Date().toISOString(),
          agentType,
          eventType,
          data,
        },
      );
    } catch (error) {
      console.error(
        `Failed to publish agent event ${agentType}.${eventType}:`,
        error,
      );
    }
  }

  /**
   * Quality Monitoring Integration
   */
  async validateAgentInput(agentType: string, data: any): Promise<boolean> {
    if (!this.config.enableQualityMonitoring) {
      return true;
    }

    try {
      const result = await this.dataPipeline.runQualityChecks(
        `agent_input.${agentType}`,
        [data],
      );
      return result.passed;
    } catch (error) {
      console.error(`Failed to validate input for agent ${agentType}:`, error);
      return false;
    }
  }

  async validateAgentOutput(agentType: string, data: any): Promise<boolean> {
    if (!this.config.enableQualityMonitoring) {
      return true;
    }

    try {
      const result = await this.dataPipeline.runQualityChecks(
        `agent_output.${agentType}`,
        [data],
      );
      return result.passed;
    } catch (error) {
      console.error(`Failed to validate output for agent ${agentType}:`, error);
      return false;
    }
  }

  /**
   * Data Lineage Integration
   */
  async trackAgentDataFlow(
    sourceAgent: string,
    targetAgent: string,
    dataType: string,
    metadata?: any,
  ): Promise<void> {
    if (!this.config.enableLineageTracking) {
      return;
    }

    try {
      // Note: This would typically be handled by the lineage tracker
      // but we can emit events for external tracking
      this.emit("data_flow_tracked", {
        source: sourceAgent,
        target: targetAgent,
        dataType,
        metadata,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to track agent data flow:", error);
    }
  }

  /**
   * Private Helper Methods
   */
  private async initializeFeatures(): Promise<void> {
    const featureDefinitions: FeatureDefinition[] = [
      {
        name: `${this.config.featureNamespace}.leadScore`,
        type: "numeric",
        description: "AI-computed lead scoring based on multiple signals",
        tags: ["prospect_discovery", "scoring"],
        validationRules: { min: 0, max: 100 },
      },
      {
        name: `${this.config.featureNamespace}.intentSignals`,
        type: "numeric",
        description: "Number of buying intent signals detected",
        tags: ["prospect_discovery", "intent"],
        validationRules: { min: 0 },
      },
      {
        name: `${this.config.featureNamespace}.personalizationScore`,
        type: "numeric",
        description: "Quality score for personalized content",
        tags: ["personalization", "content"],
        validationRules: { min: 0, max: 100 },
      },
      {
        name: `${this.config.featureNamespace}.conversionProbability`,
        type: "numeric",
        description: "Predicted probability of conversion",
        tags: ["analytics", "prediction"],
        validationRules: { min: 0, max: 1 },
      },
    ];

    for (const definition of featureDefinitions) {
      await this.dataPipeline.defineFeature(definition);
    }
  }

  private async initializeModels(): Promise<void> {
    // In a real implementation, these would be actual trained models
    // For now, we register placeholder models
    const modelDefinitions = [
      {
        name: "lead_scoring",
        version: "1.0.0",
        type: "classification",
        framework: "scikit-learn",
        description: "Lead scoring model using prospect and company features",
      },
      {
        name: "personalization_scoring",
        version: "1.0.0",
        type: "regression",
        framework: "tensorflow",
        description: "Content personalization quality scoring",
      },
      {
        name: "send_time_optimization",
        version: "1.0.0",
        type: "regression",
        framework: "xgboost",
        description:
          "Optimal send time prediction based on prospect timezone and behavior",
      },
      {
        name: "conversion_prediction",
        version: "1.0.0",
        type: "classification",
        framework: "tensorflow",
        description:
          "Conversion probability prediction using campaign and prospect features",
      },
    ];

    for (const definition of modelDefinitions) {
      // In a real scenario, you would load the actual model data
      const mockModelData = Buffer.from(
        `Mock model data for ${definition.name}`,
      );
      const modelId = await this.dataPipeline.registerModel(
        definition,
        mockModelData,
      );
      this.modelCache.set(definition.name, modelId);

      // Deploy the model for serving
      await this.dataPipeline.deployModel(modelId);
    }
  }

  private async initializeQualityRules(): Promise<void> {
    const qualityRules: QualityRule[] = [
      {
        id: "prospect_data_completeness",
        name: "Prospect Data Completeness",
        type: "completeness",
        fields: ["email", "firstName", "company"],
        threshold: 0.8,
        severity: "warning",
      },
      {
        id: "email_format_validation",
        name: "Email Format Validation",
        type: "pattern",
        field: "email",
        pattern: "^[^s@]+@[^s@]+.[^s@]+$",
        severity: "error",
      },
      {
        id: "personalization_quality",
        name: "Personalization Quality Check",
        type: "range",
        field: "personalizationScore",
        min: 60,
        max: 100,
        severity: "warning",
      },
    ];

    for (const rule of qualityRules) {
      await this.dataPipeline.registerQualityRule(rule);
    }
  }

  private getFeatureNamesForAgent(agentType?: string): string[] {
    const baseFeatures = [
      `${this.config.featureNamespace}.leadScore`,
      `${this.config.featureNamespace}.conversionProbability`,
    ];

    switch (agentType) {
      case "PDA":
        return [
          ...baseFeatures,
          `${this.config.featureNamespace}.intentSignals`,
        ];
      case "OPA":
        return [
          ...baseFeatures,
          `${this.config.featureNamespace}.personalizationScore`,
        ];
      default:
        return baseFeatures;
    }
  }

  private extractFeaturesFromProspect(
    prospectData: ProspectData,
  ): Record<string, any> {
    return {
      companySize: prospectData.company?.size || 0,
      industry: prospectData.company?.industry || "unknown",
      jobLevel: prospectData.jobLevel || "unknown",
      contactAge: this.calculateContactAge(prospectData.createdAt),
      hasLinkedIn: !!prospectData.linkedinUrl,
      hasPhone: !!prospectData.phone,
      locationScore: this.calculateLocationScore(prospectData.location),
    };
  }

  private extractFeaturesFromCampaign(
    metrics: CampaignMetrics,
  ): Record<string, any> {
    return {
      openRate: metrics.openRate || 0,
      clickRate: metrics.clickRate || 0,
      responseRate: metrics.responseRate || 0,
      totalSent: metrics.totalSent || 0,
      daysActive: this.calculateDaysActive(metrics.startDate),
    };
  }

  private countPersonalTokens(content: string): number {
    const personalTokens = ["{{firstName}}", "{{company}}", "{{jobTitle}}"];
    return personalTokens.reduce(
      (count, token) => count + (content.includes(token) ? 1 : 0),
      0,
    );
  }

  private async analyzeSentiment(content: string): Promise<number> {
    // Simple sentiment analysis - in production, use a proper NLP service
    const positiveWords = [
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "horrible",
      "disappointing",
    ];

    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter((word) =>
      positiveWords.includes(word),
    ).length;
    const negativeCount = words.filter((word) =>
      negativeWords.includes(word),
    ).length;

    return (positiveCount - negativeCount) / words.length;
  }

  private calculateContactAge(createdAt?: string): number {
    if (!createdAt) return 0;
    return Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  private calculateLocationScore(location?: string): number {
    // Simple location scoring - in production, use geographic data
    const majorCities = ["New York", "San Francisco", "London", "Toronto"];
    return location && majorCities.some((city) => location.includes(city))
      ? 1
      : 0;
  }

  private calculateDaysActive(startDate?: string): number {
    if (!startDate) return 0;
    return Math.floor(
      (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  private setupEventHandlers(): void {
    this.dataPipeline.on("feature_computed", (data) => {
      this.emit("feature_computed", data);
    });

    this.dataPipeline.on("model_deployed", (data) => {
      this.emit("model_deployed", data);
    });

    this.dataPipeline.on("quality_check_failed", (data) => {
      this.emit("quality_check_failed", data);
    });
  }

  async getHealth(): Promise<any> {
    return {
      initialized: this.initialized,
      cacheSize: this.featureCache.size,
      modelsLoaded: this.modelCache.size,
      dataPipelineHealth: await this.dataPipeline.getHealth(),
    };
  }

  async shutdown(): Promise<void> {
    this.featureCache.clear();
    this.modelCache.clear();
    this.emit("shutdown");
  }
}

export default DataPipelineIntegration;
