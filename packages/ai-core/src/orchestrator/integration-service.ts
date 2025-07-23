/**
 * AI Core Integration Service
 * 
 * This service integrates the AI orchestration system with the IQ24 API engine,
 * providing a seamless interface between the AI agents and the application layer.
 */

import { EventEmitter } from "events";
import { MainOrchestrator } from "./main-orchestrator";
// Import types only for now - agents will be mocked until fully implemented
// import { ProspectDiscoveryAgent } from "@iq24/agents/src/prospect-discovery/prospect-discovery-agent";
import { ConfigManager } from "../config";
import { Logger } from "../utils/logger";
import type {
  Campaign,
  Prospect,
  Task,
  WorkflowStatus,
  AgentType,
  CampaignConfig,
  AIServiceConfig,
} from "../types";

export interface IntegrationServiceConfig {
  enabled: boolean;
  apiEndpoint: string;
  webhookUrl?: string;
  maxConcurrentCampaigns: number;
  defaultTimeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    baseDelayMs: number;
  };
}

export interface CampaignRequest {
  campaignId: string;
  userId: string;
  workspaceId: string;
  config: CampaignConfig;
  prospects: Prospect[];
  metadata?: Record<string, any>;
}

export interface CampaignResponse {
  campaignId: string;
  workflowId: string;
  status: WorkflowStatus;
  message: string;
  estimatedCompletion?: Date;
  metadata?: Record<string, any>;
}

export interface ProspectDiscoveryRequest {
  userId: string;
  workspaceId: string;
  searchCriteria: {
    industries: string[];
    companySizes: string[];
    roles: string[];
    locations: string[];
    keywords: string[];
  };
  limits: {
    maxProspects: number;
    maxCompanies: number;
  };
  enrichmentLevel: "basic" | "advanced" | "comprehensive";
}

export interface ProspectDiscoveryResponse {
  taskId: string;
  status: string;
  prospects: Prospect[];
  totalFound: number;
  processingTime: number;
  qualityScore: number;
}

/**
 * Integration service that provides a clean API interface to the AI orchestration system
 */
export class AIIntegrationService extends EventEmitter {
  private static instance: AIIntegrationService;
  private orchestrator: MainOrchestrator;
  private config: IntegrationServiceConfig;
  private logger: Logger;
  private agents: Map<AgentType, any> = new Map();
  private activeCampaigns: Map<string, CampaignResponse> = new Map();
  private activeDiscoveries: Map<string, ProspectDiscoveryResponse> = new Map();

  private constructor(config: IntegrationServiceConfig) {
    super();
    this.config = config;
    this.logger = new Logger("AIIntegrationService");
    this.orchestrator = MainOrchestrator.getInstance();
    this.setupEventHandlers();
  }

  public static getInstance(config?: IntegrationServiceConfig): AIIntegrationService {
    if (!AIIntegrationService.instance) {
      if (!config) {
        throw new Error("AIIntegrationService config required for first initialization");
      }
      AIIntegrationService.instance = new AIIntegrationService(config);
    }
    return AIIntegrationService.instance;
  }

  /**
   * Initialize the AI integration service
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info("Initializing AI Integration Service...");

      // Initialize the main orchestrator
      await this.orchestrator.initialize();

      // Initialize and register agents
      await this.initializeAgents();

      // Start the orchestrator
      await this.orchestrator.start();

      this.logger.info("AI Integration Service initialized successfully");
      this.emit("initialized");
    } catch (error) {
      this.logger.error("Failed to initialize AI Integration Service:", error);
      throw error;
    }
  }

  /**
   * Execute a complete campaign workflow
   */
  public async executeCampaign(request: CampaignRequest): Promise<CampaignResponse> {
    try {
      this.logger.info(`Starting campaign execution for ${request.campaignId}`);

      // Validate request
      if (!request.campaignId || !request.config || !request.prospects?.length) {
        throw new Error("Invalid campaign request: missing required fields");
      }

      // Create campaign workflow
      const workflowId = await this.orchestrator.createCampaignWorkflow({
        campaignId: request.campaignId,
        userId: request.userId,
        workspaceId: request.workspaceId,
        config: request.config,
        prospects: request.prospects,
        metadata: request.metadata || {},
      });

      // Start workflow execution
      const startResult = await this.orchestrator.startWorkflow(workflowId);

      const response: CampaignResponse = {
        campaignId: request.campaignId,
        workflowId: workflowId,
        status: "running" as WorkflowStatus,
        message: "Campaign workflow started successfully",
        estimatedCompletion: this.calculateEstimatedCompletion(request.prospects.length),
        metadata: {
          prospectCount: request.prospects.length,
          startedAt: new Date(),
        },
      };

      this.activeCampaigns.set(request.campaignId, response);
      this.emit("campaignStarted", response);

      return response;
    } catch (error) {
      this.logger.error(`Failed to execute campaign ${request.campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Execute prospect discovery
   */
  public async discoverProspects(request: ProspectDiscoveryRequest): Promise<ProspectDiscoveryResponse> {
    try {
      this.logger.info("Starting prospect discovery", { criteria: request.searchCriteria });

      // Get the prospect discovery agent
      const pdaAgent = this.agents.get(AgentType.PROSPECT_DISCOVERY);
      if (!pdaAgent) {
        throw new Error("Prospect Discovery Agent not available");
      }

      // Create discovery task
      const task: Task = {
        id: `pda-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "discover_prospects",
        agentType: AgentType.PROSPECT_DISCOVERY,
        status: "pending" as any,
        payload: {
          searchCriteria: request.searchCriteria,
          limits: request.limits,
          enrichmentLevel: request.enrichmentLevel,
        },
        priority: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        retryCount: 0,
        maxRetries: 3,
        errors: [],
        metadata: {
          userId: request.userId,
          workspaceId: request.workspaceId,
        },
      };

      // Execute discovery
      const startTime = Date.now();
      const result = await pdaAgent.processTask(task, {
        taskId: task.id,
        userId: request.userId,
        workspaceId: request.workspaceId,
        metadata: {},
        correlationId: task.id,
      });

      const processingTime = Date.now() - startTime;

      const response: ProspectDiscoveryResponse = {
        taskId: task.id,
        status: "completed",
        prospects: result.prospects || [],
        totalFound: result.metadata?.totalFound || 0,
        processingTime,
        qualityScore: result.metadata?.qualityScore || 0,
      };

      this.activeDiscoveries.set(task.id, response);
      this.emit("discoveryCompleted", response);

      return response;
    } catch (error) {
      this.logger.error("Failed to discover prospects:", error);
      throw error;
    }
  }

  /**
   * Get campaign status
   */
  public async getCampaignStatus(campaignId: string): Promise<CampaignResponse | null> {
    return this.activeCampaigns.get(campaignId) || null;
  }

  /**
   * Get discovery status
   */
  public async getDiscoveryStatus(taskId: string): Promise<ProspectDiscoveryResponse | null> {
    return this.activeDiscoveries.get(taskId) || null;
  }

  /**
   * Get system health status
   */
  public async getHealthStatus(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    agents: Record<string, any>;
    metrics: Record<string, any>;
  }> {
    try {
      const orchestratorHealth = await this.orchestrator.getHealthStatus();
      const agentHealths: Record<string, any> = {};

      // Check each agent's health
      for (const [agentType, agent] of this.agents) {
        try {
          agentHealths[agentType] = await agent.getHealthStatus();
        } catch (error) {
          agentHealths[agentType] = {
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }

      // Determine overall health
      const allHealthy = Object.values(agentHealths).every(
        health => health.status === "healthy"
      );
      const anyUnhealthy = Object.values(agentHealths).some(
        health => health.status === "unhealthy"
      );

      const overallStatus = anyUnhealthy ? "unhealthy" : 
                           allHealthy ? "healthy" : "degraded";

      return {
        status: overallStatus,
        agents: agentHealths,
        metrics: {
          activeCampaigns: this.activeCampaigns.size,
          activeDiscoveries: this.activeDiscoveries.size,
          orchestratorStatus: orchestratorHealth.status,
        },
      };
    } catch (error) {
      this.logger.error("Failed to get health status:", error);
      return {
        status: "unhealthy",
        agents: {},
        metrics: { error: "Health check failed" },
      };
    }
  }

  /**
   * Initialize all AI agents
   */
  private async initializeAgents(): Promise<void> {
    try {
      // Mock configuration for now
      const aiConfig = {
        openai: {
          apiKey: process.env.OPENAI_API_KEY || "mock-key",
          models: {
            completion: "gpt-4",
            embedding: "text-embedding-3-large",
          },
        },
        agents: {
          pda: {
            maxConcurrency: 5,
            timeout: 30000,
            retryPolicy: {
              maxRetries: 3,
              backoffMultiplier: 1.5,
              baseDelayMs: 1000,
            },
          },
        },
      };

      // Initialize base dependencies for agents
      const agentDependencies = {
        featureStore: null, // Will be injected
        modelStore: null,   // Will be injected
        dataStore: null,    // Will be injected
        logger: this.logger,
        metrics: null,      // Will be injected
        eventBus: this,
      };

      // Create agent configurations
      const agentConfigs = this.createAgentConfigurations(aiConfig);

      // Initialize each agent
      for (const [agentType, config] of agentConfigs) {
        try {
          let agent;
          
          switch (agentType) {
            case AgentType.PROSPECT_DISCOVERY:
              // Mock implementation for now
              agent = {
                processTask: async (task: Task, context: any) => {
                  this.logger.info(`Processing discovery task: ${task.id}`);
                  
                  // Mock prospect discovery results
                  const mockProspects = [
                    {
                      id: `prospect-${Date.now()}-1`,
                      firstName: "John",
                      lastName: "Smith",
                      email: "john.smith@techcorp.com",
                      company: "TechCorp Inc.",
                      position: "CTO",
                      industry: "Technology",
                      leadScore: 85,
                      source: "ai-discovery",
                      discoveredAt: new Date(),
                      lastUpdated: new Date(),
                    },
                    {
                      id: `prospect-${Date.now()}-2`,
                      firstName: "Sarah",
                      lastName: "Johnson",
                      email: "sarah.johnson@innovate.io",
                      company: "Innovate Solutions",
                      position: "VP Marketing",
                      industry: "Software",
                      leadScore: 72,
                      source: "ai-discovery",
                      discoveredAt: new Date(),
                      lastUpdated: new Date(),
                    },
                  ];
                  
                  return {
                    prospects: mockProspects,
                    metadata: {
                      totalFound: mockProspects.length,
                      qualityScore: 78,
                      processingTime: 2500,
                    },
                  };
                },
                getHealthStatus: async () => ({
                  status: "healthy",
                  details: { lastCheck: new Date() },
                }),
              };
              break;
            // Add other agents as needed
            default:
              this.logger.warn(`Agent type ${agentType} not implemented yet`);
              continue;
          }

          if (agent) {
            this.agents.set(agentType, agent);
            this.logger.info(`Initialized ${agentType} agent`);
          }
        } catch (error) {
          this.logger.error(`Failed to initialize ${agentType} agent:`, error);
        }
      }
    } catch (error) {
      this.logger.error("Failed to initialize agents:", error);
      throw error;
    }
  }

  /**
   * Create agent configurations
   */
  private createAgentConfigurations(aiConfig: AIServiceConfig): Map<AgentType, any> {
    const configs = new Map();

    // Prospect Discovery Agent config
    configs.set(AgentType.PROSPECT_DISCOVERY, {
      id: "pda-001",
      type: AgentType.PROSPECT_DISCOVERY,
      name: "Prospect Discovery Agent",
      description: "Advanced lead discovery and intelligence gathering",
      version: "1.0.0",
      models: [
        {
          name: aiConfig.openai.models.completion,
          version: "latest",
          provider: "openai",
          type: "llm",
          config: aiConfig.openai,
        },
      ],
      maxConcurrency: 5,
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 1.5,
        baseDelayMs: 1000,
      },
      healthCheck: {
        intervalMs: 30000,
        timeoutMs: 5000,
      },
    });

    return configs;
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    this.orchestrator.on("workflowCompleted", (data) => {
      const campaign = Array.from(this.activeCampaigns.values())
        .find(c => c.workflowId === data.workflowId);
      
      if (campaign) {
        campaign.status = "completed" as WorkflowStatus;
        this.emit("campaignCompleted", campaign);
      }
    });

    this.orchestrator.on("workflowFailed", (data) => {
      const campaign = Array.from(this.activeCampaigns.values())
        .find(c => c.workflowId === data.workflowId);
      
      if (campaign) {
        campaign.status = "failed" as WorkflowStatus;
        this.emit("campaignFailed", campaign);
      }
    });
  }

  /**
   * Calculate estimated completion time
   */
  private calculateEstimatedCompletion(prospectCount: number): Date {
    // Estimate based on prospect count and average processing time
    const avgTimePerProspect = 30; // seconds
    const estimatedSeconds = prospectCount * avgTimePerProspect;
    return new Date(Date.now() + estimatedSeconds * 1000);
  }
}

export default AIIntegrationService;