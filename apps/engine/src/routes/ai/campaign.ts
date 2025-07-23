import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AIEngine } from "../../../../../packages/ai-core/src/engine/ai-engine.js";
import { Campaign } from "../../../../../packages/ai-core/src/types/index.js";

/**
 * AI Campaign API Routes
 *
 * This module provides HTTP API endpoints for the IQ24.ai AI Engine,
 * enabling frontend applications to interact with the sophisticated
 * multi-agent B2B growth system.
 */

const app = new Hono();

// Initialize AI Engine (should be done once at app startup)
let aiEngine: AIEngine;

// Campaign configuration schema
const campaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  targetAudience: z.object({
    titles: z.array(z.string()).optional(),
    industries: z.array(z.string()).optional(),
    companySize: z.tuple([z.number(), z.number()]).optional(),
    locations: z.array(z.string()).optional(),
    technologies: z.array(z.string()).optional(),
  }),
  searchCriteria: z
    .object({
      keywords: z.array(z.string()).optional(),
      excludeKeywords: z.array(z.string()).optional(),
      includeDomains: z.array(z.string()).optional(),
      excludeDomains: z.array(z.string()).optional(),
    })
    .optional(),
  goals: z.array(z.string()),
  channels: z.array(z.enum(["email", "linkedin", "sms"])),
  maxProspects: z.number().min(1).max(10000).default(1000),
  sequence: z
    .array(
      z.object({
        step: z.number(),
        type: z.enum(["email", "linkedin", "sms", "wait"]),
        delayHours: z.number().min(0).max(720), // Max 30 days
        template: z.string().optional(),
      }),
    )
    .optional(),
});

const workflowActionSchema = z.object({
  action: z.enum(["pause", "resume", "stop"]),
});

/**
 * POST /ai/campaigns
 * Create and execute a new AI-powered B2B growth campaign
 */
app.post("/campaigns", zValidator("json", campaignSchema), async (c) => {
  try {
    const campaignData = c.req.valid("json");

    // Initialize AI Engine if not already done
    if (!aiEngine) {
      aiEngine = AIEngine.createDefault();
      await aiEngine.initialize();
    }

    // Create campaign configuration
    const campaign: Campaign = {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: campaignData.name,
      description: campaignData.description,
      targetAudience: campaignData.targetAudience,
      searchCriteria: campaignData.searchCriteria,
      goals: campaignData.goals,
      channels: campaignData.channels,
      maxProspects: campaignData.maxProspects,
      sequence: campaignData.sequence || [],
      status: "pending",
      createdAt: new Date(),
      createdBy: "api-user", // In real app, get from auth context
    };

    // Execute the sophisticated multi-agent workflow
    const workflowExecution = await aiEngine.executeCampaign(campaign);

    return c.json(
      {
        success: true,
        data: {
          campaignId: campaign.id,
          workflowId: workflowExecution.id,
          status: workflowExecution.status,
          estimatedCompletion: workflowExecution.estimatedCompletion,
          initialMetrics: workflowExecution.metrics,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Campaign creation failed:", error);

    return c.json(
      {
        success: false,
        error: {
          code: "CAMPAIGN_CREATION_FAILED",
          message:
            error.message ||
            "An unexpected error occurred while creating the campaign",
        },
      },
      500,
    );
  }
});

/**
 * GET /ai/campaigns/:workflowId
 * Get campaign workflow status and metrics
 */
app.get("/campaigns/:workflowId", async (c) => {
  try {
    const workflowId = c.req.param("workflowId");

    if (!aiEngine) {
      throw new Error("AI Engine not initialized");
    }

    // Get workflow status and metrics
    const status = aiEngine.getStatus();
    const activeWorkflows = status.activeWorkflows;

    // In a real implementation, you'd query the workflow from storage
    // For now, we'll return the engine status

    return c.json({
      success: true,
      data: {
        workflowId,
        status: "unknown", // Would be retrieved from storage
        currentStage: "unknown",
        progress: 0,
        metrics: {
          prospectsDiscovered: 0,
          prospectsValidated: 0,
          messagesPersonalized: 0,
          messagesSent: 0,
          responses: 0,
          conversions: 0,
        },
        stages: [],
        estimatedCompletion: null,
      },
    });
  } catch (error) {
    console.error("Failed to get campaign status:", error);

    return c.json(
      {
        success: false,
        error: {
          code: "CAMPAIGN_STATUS_ERROR",
          message: error.message || "Failed to retrieve campaign status",
        },
      },
      500,
    );
  }
});

/**
 * POST /ai/campaigns/:workflowId/actions
 * Control campaign workflow execution (pause, resume, stop)
 */
app.post(
  "/campaigns/:workflowId/actions",
  zValidator("json", workflowActionSchema),
  async (c) => {
    try {
      const workflowId = c.req.param("workflowId");
      const { action } = c.req.valid("json");

      if (!aiEngine) {
        throw new Error("AI Engine not initialized");
      }

      let result;
      switch (action) {
        case "pause":
          await aiEngine.pauseWorkflow(workflowId);
          result = { status: "paused" };
          break;
        case "resume":
          await aiEngine.resumeWorkflow(workflowId);
          result = { status: "running" };
          break;
        case "stop":
          // Would implement stop functionality
          result = { status: "stopped" };
          break;
      }

      return c.json({
        success: true,
        data: {
          workflowId,
          action,
          ...result,
        },
      });
    } catch (error) {
      console.error("Campaign action failed:", error);

      return c.json(
        {
          success: false,
          error: {
            code: "CAMPAIGN_ACTION_FAILED",
            message: error.message || "Failed to execute campaign action",
          },
        },
        500,
      );
    }
  },
);

/**
 * GET /ai/analytics
 * Get real-time analytics and insights across all campaigns
 */
app.get("/analytics", async (c) => {
  try {
    if (!aiEngine) {
      throw new Error("AI Engine not initialized");
    }

    const timeframe =
      (c.req.query("timeframe") as "hour" | "day" | "week" | "month") || "day";

    // Get comprehensive analytics from the AI Engine
    const analytics = await aiEngine.getAnalytics(timeframe);

    return c.json({
      success: true,
      data: {
        timeframe,
        analytics,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Analytics retrieval failed:", error);

    return c.json(
      {
        success: false,
        error: {
          code: "ANALYTICS_ERROR",
          message: error.message || "Failed to retrieve analytics",
        },
      },
      500,
    );
  }
});

/**
 * GET /ai/status
 * Get AI Engine status and capabilities
 */
app.get("/status", async (c) => {
  try {
    if (!aiEngine) {
      return c.json({
        success: true,
        data: {
          initialized: false,
          status: "not_initialized",
          message: "AI Engine has not been initialized yet",
        },
      });
    }

    const status = aiEngine.getStatus();
    const capabilities = aiEngine.getCapabilities();

    return c.json({
      success: true,
      data: {
        initialized: status.initialized,
        status: status.shuttingDown ? "shutting_down" : "running",
        activeWorkflows: status.activeWorkflows,
        agents: Object.keys(status.agents).map((name) => ({
          name,
          status: status.agents[name].status,
          healthy: status.agents[name].healthy,
        })),
        capabilities,
        uptime: status.uptime,
        memory: status.memory,
      },
    });
  } catch (error) {
    console.error("Status retrieval failed:", error);

    return c.json(
      {
        success: false,
        error: {
          code: "STATUS_ERROR",
          message: error.message || "Failed to retrieve AI Engine status",
        },
      },
      500,
    );
  }
});

/**
 * POST /ai/initialize
 * Initialize the AI Engine
 */
app.post("/initialize", async (c) => {
  try {
    if (aiEngine && aiEngine.getStatus().initialized) {
      return c.json({
        success: true,
        data: {
          message: "AI Engine already initialized",
          status: "running",
        },
      });
    }

    aiEngine = AIEngine.createDefault();
    await aiEngine.initialize();

    const capabilities = aiEngine.getCapabilities();

    return c.json({
      success: true,
      data: {
        message: "AI Engine initialized successfully",
        status: "running",
        capabilities,
      },
    });
  } catch (error) {
    console.error("AI Engine initialization failed:", error);

    return c.json(
      {
        success: false,
        error: {
          code: "INITIALIZATION_FAILED",
          message: error.message || "Failed to initialize AI Engine",
        },
      },
      500,
    );
  }
});

/**
 * GET /ai/health
 * Health check endpoint
 */
app.get("/health", async (c) => {
  try {
    const healthy = aiEngine ? aiEngine.getStatus().initialized : false;
    const status = healthy ? 200 : 503;

    return c.json(
      {
        status: healthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        service: "iq24-ai-engine",
      },
      status,
    );
  } catch (error) {
    return c.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        service: "iq24-ai-engine",
        error: error.message,
      },
      503,
    );
  }
});

export default app;
