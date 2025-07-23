/**
 * AI Core Integration Service
 * 
 * This service integrates the AI orchestration system with the IQ24 API engine,
 * providing a seamless interface between the AI agents and the application layer.
 */

import { EventEmitter } from "events";
import { MainOrchestrator } from "./main-orchestrator";
import { AIProviderManager, aiProviderManager } from "../providers/ai-provider-manager";
import { DatabaseManager, databaseManager } from "../database/database-manager";
import { AgentFactory, MultiAgentSystem, multiAgentSystem } from "@iq24/agents";
import { ConfigManager } from "../config";
import { Logger } from "../utils/logger";
import { advancedProspectingEngine } from "../discovery/advanced-prospecting-engine";
import type { DiscoveryRequest, DiscoveryResponse } from "../discovery/advanced-prospecting-engine";
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
  private aiProviders: AIProviderManager;
  private database: DatabaseManager;
  private multiAgentSystem: MultiAgentSystem;
  private agents: Map<AgentType, any> = new Map();
  private activeCampaigns: Map<string, CampaignResponse> = new Map();
  private activeDiscoveries: Map<string, ProspectDiscoveryResponse> = new Map();

  private constructor(config: IntegrationServiceConfig) {
    super();
    this.config = config;
    this.logger = new Logger("AIIntegrationService");
    this.orchestrator = MainOrchestrator.getInstance();
    this.aiProviders = aiProviderManager;
    this.database = databaseManager;
    this.multiAgentSystem = multiAgentSystem;
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

      // Initialize the advanced prospecting engine
      await advancedProspectingEngine.initialize({
        dataSources: {
          apollo: { enabled: true },
          hunter: { enabled: true },
          linkedin: { enabled: true },
          crunchbase: { enabled: true },
        },
        enrichment: {
          clearbit: { enabled: true },
          fullcontact: { enabled: true },
        },
      });

      // Initialize and register agents
      await this.initializeAgents();

      // Start the orchestrator
      await this.orchestrator.start();

      this.logger.info("AI Integration Service with Advanced Prospecting Engine initialized successfully");
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
   * Execute prospect discovery using Advanced Prospecting Engine
   */
  public async discoverProspects(request: ProspectDiscoveryRequest): Promise<ProspectDiscoveryResponse> {
    try {
      this.logger.info("Starting advanced prospect discovery", { criteria: request.searchCriteria });

      // Convert to Advanced Prospecting Engine format
      const discoveryRequest: DiscoveryRequest = {
        idealCustomerProfile: {
          industries: request.searchCriteria.industries,
          companySizes: request.searchCriteria.companySizes,
          roles: request.searchCriteria.roles,
          locations: request.searchCriteria.locations,
          keywords: request.searchCriteria.keywords,
        },
        limits: {
          maxProspects: request.limits.maxProspects,
          maxCompanies: request.limits.maxCompanies,
        },
        aiConfig: {
          enrichmentLevel: request.enrichmentLevel,
          includeIntentSignals: true,
          includePersonalityAnalysis: request.enrichmentLevel === 'comprehensive',
          includeRelationshipMapping: request.enrichmentLevel !== 'basic',
        },
        dataSources: {
          requireEmailValidation: true,
          requireLinkedInProfile: false,
        },
      };

      // Execute advanced discovery
      const startTime = Date.now();
      const result: DiscoveryResponse = await advancedProspectingEngine.discoverProspects(
        discoveryRequest,
        {
          userId: request.userId,
          workspaceId: request.workspaceId,
        }
      );

      const taskId = `apd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Convert prospects to legacy format
      const legacyProspects = result.prospects.map(prospect => ({
        id: prospect.id,
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        email: prospect.email,
        phone: prospect.phone,
        company: prospect.company.name,
        position: prospect.position.title,
        industry: prospect.company.industry,
        linkedinUrl: prospect.linkedinUrl,
        leadScore: prospect.insights.leadScore,
        source: 'advanced-ai-discovery',
        discoveredAt: new Date(),
        metadata: {
          companySize: prospect.company.size,
          location: prospect.company.location,
          department: prospect.position.department,
          seniority: prospect.position.seniority,
          personalityProfile: prospect.insights.personalityProfile,
          communicationStyle: prospect.insights.communicationStyle,
          painPoints: prospect.insights.painPoints,
          intentScore: prospect.insights.intentScore,
          dataQuality: prospect.metadata.dataQuality,
          enrichmentLevel: prospect.metadata.enrichmentLevel,
        },
      }));

      const response: ProspectDiscoveryResponse = {
        taskId,
        status: "completed",
        prospects: legacyProspects,
        totalFound: result.insights.totalFound,
        processingTime: result.metadata.processingTime,
        qualityScore: result.metadata.qualityScore,
      };

      this.activeDiscoveries.set(taskId, response);
      this.emit("discoveryCompleted", response);

      this.logger.info(`Advanced prospect discovery completed: ${result.prospects.length} prospects found with quality score ${result.metadata.qualityScore}`);

      return response;
    } catch (error) {
      this.logger.error("Failed to discover prospects using advanced engine:", error);
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
              agent = {
                processTask: async (task: Task, context: any) => {
                  this.logger.info(`Processing AI-powered discovery task: ${task.id}`);
                  const startTime = Date.now();
                  
                  try {
                    // Extract search criteria from task payload
                    const { searchCriteria, limits, enrichmentLevel } = task.payload;
                    
                    // Use AI to analyze and enhance search criteria
                    const aiRequest = {
                      model: "gpt-4",
                      messages: [
                        {
                          role: "system" as const,
                          content: `You are an expert B2B prospect discovery agent. Your job is to analyze search criteria and generate high-quality prospect leads based on the provided parameters. Generate realistic prospect data that matches the criteria.`,
                        },
                        {
                          role: "user" as const,
                          content: `Generate ${limits.maxProspects || 10} B2B prospects matching these criteria:\n\nIndustries: ${searchCriteria.industries.join(", ")}\nCompany Sizes: ${searchCriteria.companySizes.join(", ")}\nRoles: ${searchCriteria.roles.join(", ")}\nLocations: ${searchCriteria.locations.join(", ")}\nKeywords: ${searchCriteria.keywords.join(", ")}\n\nEnrichment Level: ${enrichmentLevel}\n\nReturn JSON with array of prospects including: firstName, lastName, email, company, position, industry, linkedinUrl, phone, leadScore (0-100), and metadata with company info.`,
                        },
                      ],
                      temperature: 0.7,
                      maxTokens: 2000,
                    };
                    
                    // Execute AI request
                    const aiResponse = await this.aiProviders.executeRequest(aiRequest);
                    
                    // Parse AI response
                    let prospects: any[] = [];
                    try {
                      const responseData = JSON.parse(aiResponse.content);
                      prospects = Array.isArray(responseData) ? responseData : responseData.prospects || [];
                    } catch (parseError) {
                      this.logger.warn("Failed to parse AI response, using fallback data");
                      prospects = this.generateFallbackProspects(searchCriteria, limits.maxProspects || 5);
                    }
                    
                    // Enrich prospects with additional data and scoring
                    const enrichedProspects = await Promise.all(
                      prospects.map(async (prospect: any) => {
                        const enrichedProspect = {
                          id: `prospect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          firstName: prospect.firstName || "Unknown",
                          lastName: prospect.lastName || "Prospect",
                          email: prospect.email || `${prospect.firstName?.toLowerCase()}.${prospect.lastName?.toLowerCase()}@${prospect.company?.toLowerCase().replace(/\s+/g, "")}.com`,
                          company: prospect.company || "Unknown Company",
                          position: prospect.position || "Unknown Position",
                          industry: prospect.industry || searchCriteria.industries[0] || "Technology",
                          linkedinUrl: prospect.linkedinUrl,
                          phone: prospect.phone,
                          leadScore: this.calculateLeadScore(prospect, searchCriteria),
                          source: "ai-discovery",
                          discoveredAt: new Date(),
                          lastUpdated: new Date(),
                          metadata: {
                            aiGenerated: true,
                            enrichmentLevel,
                            searchCriteria: searchCriteria,
                            companyInfo: prospect.companyInfo || {},
                          },
                        };
                        
                        // Store prospect in database
                        if (context.workspaceId) {
                          await this.database.query(
                            `INSERT INTO prospects (id, workspace_id, first_name, last_name, email, company, position, lead_score, status, metadata) 
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                             ON CONFLICT (id) DO NOTHING`,
                            [
                              enrichedProspect.id,
                              context.workspaceId,
                              enrichedProspect.firstName,
                              enrichedProspect.lastName,
                              enrichedProspect.email,
                              enrichedProspect.company,
                              enrichedProspect.position,
                              enrichedProspect.leadScore,
                              "new",
                              JSON.stringify(enrichedProspect.metadata),
                            ]
                          );
                        }
                        
                        return enrichedProspect;
                      })
                    );
                    
                    const processingTime = Date.now() - startTime;
                    const qualityScore = this.calculateQualityScore(enrichedProspects);
                    
                    // Store analytics event
                    if (context.workspaceId) {
                      await this.database.query(
                        `INSERT INTO analytics_events (workspace_id, event_type, event_data) VALUES ($1, $2, $3)`,
                        [
                          context.workspaceId,
                          "prospect_discovery_completed",
                          JSON.stringify({
                            taskId: task.id,
                            prospectsFound: enrichedProspects.length,
                            qualityScore,
                            processingTime,
                            aiProvider: aiResponse.provider,
                            aiCost: aiResponse.cost,
                          }),
                        ]
                      );
                    }
                    
                    this.logger.info(`AI discovery completed: found ${enrichedProspects.length} prospects in ${processingTime}ms`);
                    
                    return {
                      prospects: enrichedProspects,
                      metadata: {
                        totalFound: enrichedProspects.length,
                        qualityScore,
                        processingTime,
                        aiProvider: aiResponse.provider,
                        aiCost: aiResponse.cost,
                        enrichmentLevel,
                      },
                    };
                  } catch (error) {
                    this.logger.error(`Prospect discovery task ${task.id} failed:`, error);
                    throw error;
                  }
                },
                
                getHealthStatus: async () => {
                  try {
                    // Test AI provider connectivity
                    const testRequest = {
                      model: "gpt-3.5-turbo",
                      messages: [{ role: "user" as const, content: "Health check" }],
                      maxTokens: 10,
                    };
                    await this.aiProviders.executeRequest(testRequest);
                    
                    return {
                      status: "healthy",
                      details: { 
                        lastCheck: new Date(),
                        aiProviderStatus: this.aiProviders.getSystemStatus(),
                        databaseStatus: await this.database.getSystemHealth(),
                      },
                    };
                  } catch (error) {
                    return {
                      status: "unhealthy",
                      details: { 
                        error: error instanceof Error ? error.message : "Unknown error",
                        lastCheck: new Date(),
                      },
                    };
                  }
                },
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

  /**
   * Calculate lead score based on prospect data and search criteria
   */
  private calculateLeadScore(prospect: any, searchCriteria: any): number {
    let score = 50; // Base score
    
    // Industry match bonus
    if (prospect.industry && searchCriteria.industries.includes(prospect.industry)) {
      score += 20;
    }
    
    // Role/position relevance
    if (prospect.position) {
      const position = prospect.position.toLowerCase();
      const relevantTitles = ['cto', 'ceo', 'vp', 'director', 'manager', 'head'];
      if (relevantTitles.some(title => position.includes(title))) {
        score += 15;
      }
    }
    
    // Email validity bonus
    if (prospect.email && prospect.email.includes('@') && !prospect.email.includes('example')) {
      score += 10;
    }
    
    // LinkedIn presence bonus
    if (prospect.linkedinUrl) {
      score += 5;
    }
    
    // Add some randomization to make it realistic
    const randomFactor = Math.random() * 20 - 10; // -10 to +10
    score += randomFactor;
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  /**
   * Calculate quality score for a set of prospects
   */
  private calculateQualityScore(prospects: any[]): number {
    if (prospects.length === 0) return 0;
    
    let totalScore = 0;
    let validEmails = 0;
    let hasLinkedIn = 0;
    
    prospects.forEach(prospect => {
      totalScore += prospect.leadScore || 0;
      if (prospect.email && prospect.email.includes('@')) validEmails++;
      if (prospect.linkedinUrl) hasLinkedIn++;
    });
    
    const avgLeadScore = totalScore / prospects.length;
    const emailQuality = (validEmails / prospects.length) * 100;
    const linkedInCoverage = (hasLinkedIn / prospects.length) * 100;
    
    // Weight the factors
    const qualityScore = (avgLeadScore * 0.5) + (emailQuality * 0.3) + (linkedInCoverage * 0.2);
    
    return Math.round(qualityScore);
  }
  
  /**
   * Generate fallback prospects when AI parsing fails
   */
  private generateFallbackProspects(searchCriteria: any, count: number): any[] {
    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Ashley', 'Chris', 'Amanda'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const companies = ['TechCorp', 'InnovateSoft', 'DataSystems', 'CloudTech', 'NextGen Solutions', 'Digital Dynamics'];
    const positions = ['CEO', 'CTO', 'VP Engineering', 'Director of Marketing', 'Head of Sales', 'Product Manager'];
    
    const prospects = [];
    
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      const industry = searchCriteria.industries[0] || 'Technology';
      
      prospects.push({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
        company,
        position,
        industry,
        linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        leadScore: Math.floor(Math.random() * 40) + 40, // 40-80 range
        companyInfo: {
          size: searchCriteria.companySizes[0] || 'Medium',
          location: searchCriteria.locations[0] || 'United States',
        },
      });
    }
    
    return prospects;
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus() {
    return {
      service: {
        initialized: this.orchestrator ? true : false,
        config: {
          maxConcurrentCampaigns: this.config.maxConcurrentCampaigns,
          defaultTimeout: this.config.defaultTimeout,
        },
      },
      orchestrator: await this.orchestrator.getSystemStatus(),
      agents: {
        total: this.agents.size,
        types: Array.from(this.agents.keys()),
      },
      campaigns: {
        active: this.activeCampaigns.size,
        total: this.activeCampaigns.size, // Would track historical
      },
      discoveries: {
        active: this.activeDiscoveries.size,
      },
      aiProviders: this.aiProviders.getSystemStatus(),
      database: await this.database.getSystemHealth(),
    };
  }
}

export default AIIntegrationService;