/**
 * AI Engine Routes - Core AI functionality endpoints
 * 
 * This module provides REST API endpoints for the IQ24 AI engine,
 * integrating with the AI orchestration system to provide campaign
 * execution, prospect discovery, and agent management capabilities.
 */

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { AIIntegrationService } from "@iq24/ai-core/src/orchestrator/integration-service";
import { ConfigManager } from "@iq24/ai-core/src/config";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger());

// Request/Response Schemas
const ProspectDiscoveryRequestSchema = z.object({
  searchCriteria: z.object({
    industries: z.array(z.string()),
    companySizes: z.array(z.string()),
    roles: z.array(z.string()),
    locations: z.array(z.string()),
    keywords: z.array(z.string()),
  }),
  limits: z.object({
    maxProspects: z.number().min(1).max(1000).default(100),
    maxCompanies: z.number().min(1).max(500).default(50),
  }),
  enrichmentLevel: z.enum(["basic", "advanced", "comprehensive"]).default("advanced"),
});

const CampaignExecutionRequestSchema = z.object({
  campaignId: z.string(),
  config: z.object({
    name: z.string(),
    description: z.string().optional(),
    idealCustomerProfile: z.object({
      industries: z.array(z.string()),
      companySizes: z.array(z.string()),
      roles: z.array(z.string()),
      technologies: z.array(z.string()).optional(),
      keywords: z.array(z.string()).optional(),
    }),
    channels: z.array(z.enum(["email", "linkedin", "phone", "sms"])),
    sequence: z.array(z.object({
      step: z.number(),
      type: z.string(),
      delay: z.number(),
      template: z.string(),
      conditions: z.array(z.string()).optional(),
    })),
    personalizationLevel: z.enum(["basic", "advanced", "hyper"]).default("advanced"),
    complianceProfile: z.string().default("gdpr"),
    mseoEnabled: z.boolean().default(false),
  }),
  prospects: z.array(z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    company: z.string(),
    position: z.string(),
    linkedinUrl: z.string().optional(),
    phone: z.string().optional(),
    leadScore: z.number().min(0).max(100).optional(),
    source: z.string(),
  })),
  metadata: z.record(z.any()).optional(),
});

// Initialize AI Integration Service (singleton)
let aiService: AIIntegrationService | null = null;

async function getAIService(): Promise<AIIntegrationService> {
  if (!aiService) {
    const config = {
      enabled: true,
      apiEndpoint: "http://localhost:3002",
      maxConcurrentCampaigns: 10,
      defaultTimeout: 300000, // 5 minutes
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 1.5,
        baseDelayMs: 1000,
      },
    };
    
    aiService = AIIntegrationService.getInstance(config);
    await aiService.initialize();
  }
  return aiService;
}

// Routes

/**
 * Health check endpoint
 */
app.get("/health", async (c) => {
  try {
    const service = await getAIService();
    const health = await service.getHealthStatus();
    
    return c.json({
      status: "ok", 
      ai: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

/**
 * Discover prospects using AI-powered discovery
 */
app.post(
  "/prospects/discover",
  zValidator("json", ProspectDiscoveryRequestSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const service = await getAIService();
      
      // Get user context from headers or authentication
      const userId = c.req.header("x-user-id") || "anonymous";
      const workspaceId = c.req.header("x-workspace-id") || "default";
      
      const request = {
        userId,
        workspaceId,
        searchCriteria: body.searchCriteria,
        limits: body.limits,
        enrichmentLevel: body.enrichmentLevel,
      };
      
      const result = await service.discoverProspects(request);
      
      return c.json({
        success: true,
        data: result,
        metadata: {
          requestId: result.taskId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Prospect discovery error:", error);
      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Prospect discovery failed",
          code: "DISCOVERY_ERROR",
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      }, 500);
    }
  }
);

/**
 * Get discovery task status
 */
app.get("/prospects/discover/:taskId", async (c) => {
  try {
    const taskId = c.req.param("taskId");
    const service = await getAIService();
    
    const status = await service.getDiscoveryStatus(taskId);
    
    if (!status) {
      return c.json({
        success: false,
        error: {
          message: "Discovery task not found",
          code: "TASK_NOT_FOUND",
        },
      }, 404);
    }
    
    return c.json({
      success: true,
      data: status,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Status check failed",
        code: "STATUS_ERROR",
      },
    }, 500);
  }
});

/**
 * Execute AI-powered campaign
 */
app.post(
  "/campaigns/execute",
  zValidator("json", CampaignExecutionRequestSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const service = await getAIService();
      
      // Get user context
      const userId = c.req.header("x-user-id") || "anonymous";
      const workspaceId = c.req.header("x-workspace-id") || "default";
      
      const request = {
        campaignId: body.campaignId,
        userId,
        workspaceId,
        config: body.config,
        prospects: body.prospects,
        metadata: body.metadata,
      };
      
      const result = await service.executeCampaign(request);
      
      return c.json({
        success: true,
        data: result,
        metadata: {
          requestId: result.workflowId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Campaign execution error:", error);
      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Campaign execution failed",
          code: "EXECUTION_ERROR",
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      }, 500);
    }
  }
);

/**
 * Get campaign status
 */
app.get("/campaigns/:campaignId/status", async (c) => {
  try {
    const campaignId = c.req.param("campaignId");
    const service = await getAIService();
    
    const status = await service.getCampaignStatus(campaignId);
    
    if (!status) {
      return c.json({
        success: false,
        error: {
          message: "Campaign not found",
          code: "CAMPAIGN_NOT_FOUND",
        },
      }, 404);
    }
    
    return c.json({
      success: true,
      data: status,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Status check failed",
        code: "STATUS_ERROR",
      },
    }, 500);
  }
});

/**
 * List available AI agents and their capabilities
 */
app.get("/agents", async (c) => {
  try {
    const service = await getAIService();
    const health = await service.getHealthStatus();
    
    const agents = Object.entries(health.agents).map(([type, status]) => ({
      type,
      status: status.status,
      capabilities: getAgentCapabilities(type),
      details: status.details || {},
    }));
    
    return c.json({
      success: true,
      data: {
        agents,
        totalAgents: agents.length,
        healthyAgents: agents.filter(a => a.status === "healthy").length,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to list agents",
        code: "AGENTS_ERROR",
      },
    }, 500);
  }
});

/**
 * Get system analytics and metrics
 */
app.get("/analytics", async (c) => {
  try {
    const service = await getAIService();
    const health = await service.getHealthStatus();
    
    const analytics = {
      system: {
        status: health.status,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
      agents: health.agents,
      campaigns: {
        active: health.metrics.activeCampaigns || 0,
        // Add more campaign metrics here
      },
      discoveries: {
        active: health.metrics.activeDiscoveries || 0,
        // Add more discovery metrics here
      },
    };
    
    return c.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Analytics failed",
        code: "ANALYTICS_ERROR",
      },
    }, 500);
  }
});

// Helper Functions

function getAgentCapabilities(agentType: string): string[] {
  const capabilities: Record<string, string[]> = {
    "prospect-discovery": [
      "Company research and intelligence",
      "Contact discovery and verification",
      "Lead scoring and qualification",
      "Technology stack identification",
      "Industry analysis",
    ],
    "validation-enrichment": [
      "Data validation and cleaning",
      "Contact enrichment",
      "Company data enrichment",
      "Social profile matching",
      "Intent signal detection",
    ],
    "outreach-personalization": [
      "Message personalization",
      "Content generation",
      "A/B testing optimization",
      "Multi-channel messaging",
      "Response prediction",
    ],
    "campaign-execution": [
      "Campaign automation",
      "Sequence management",
      "Response handling",
      "Follow-up scheduling",
      "Performance monitoring",
    ],
    "analytics-feedback": [
      "Performance analysis",
      "Campaign optimization",
      "Predictive insights",
      "ROI calculation",
      "Trend identification",
    ],
    "compliance-guardian": [
      "GDPR compliance",
      "CAN-SPAM compliance",
      "Data privacy protection",
      "Consent management",
      "Audit trail maintenance",
    ],
  };
  
  return capabilities[agentType] || ["General AI capabilities"];
}

export default app;