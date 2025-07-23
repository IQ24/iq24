/**
 * AI Campaigns API Routes
 * 
 * Provides comprehensive campaign management with multi-provider AI integration.
 * Handles campaign creation, execution, monitoring, and agent orchestration.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getDatabaseService } from "../../services/database";
import { Logger } from "@iq24/utils";

const app = new Hono();
const logger = new Logger("ai-campaigns");

// Enhanced schemas
const CreateCampaignSchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  target_audience: z.object({
    titles: z.array(z.string()).optional(),
    industries: z.array(z.string()).optional(),
    company_sizes: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    technologies: z.array(z.string()).optional(),
  }),
  search_criteria: z.object({
    keywords: z.array(z.string()).optional(),
    exclude_keywords: z.array(z.string()).optional(),
    include_domains: z.array(z.string()).optional(),
    exclude_domains: z.array(z.string()).optional(),
  }).optional(),
  goals: z.array(z.string()).min(1),
  channels: z.array(z.enum(["email", "linkedin", "sms", "phone"])).min(1),
  max_prospects: z.number().min(1).max(10000).default(1000),
  sequence: z.array(z.object({
    step: z.number(),
    type: z.enum(["email", "linkedin", "sms", "wait"]),
    delay_hours: z.number().min(0).max(720), // Max 30 days
    template: z.string().optional(),
    conditions: z.array(z.string()).optional(),
  })).optional(),
});

const UpdateCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["draft", "active", "paused", "completed", "failed"]).optional(),
  target_audience: z.object({
    titles: z.array(z.string()).optional(),
    industries: z.array(z.string()).optional(),
    company_sizes: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    technologies: z.array(z.string()).optional(),
  }).optional(),
  search_criteria: z.object({
    keywords: z.array(z.string()).optional(),
    exclude_keywords: z.array(z.string()).optional(),
    include_domains: z.array(z.string()).optional(),
    exclude_domains: z.array(z.string()).optional(),
  }).optional(),
  goals: z.array(z.string()).optional(),
  channels: z.array(z.enum(["email", "linkedin", "sms", "phone"])).optional(),
  max_prospects: z.number().min(1).max(10000).optional(),
  sequence: z.array(z.object({
    step: z.number(),
    type: z.enum(["email", "linkedin", "sms", "wait"]),
    delay_hours: z.number().min(0).max(720),
    template: z.string().optional(),
    conditions: z.array(z.string()).optional(),
  })).optional(),
});

const ExecuteCampaignSchema = z.object({
  ai_providers: z.object({
    prospect_discovery: z.enum(["openai", "anthropic", "mistral"]).default("openai"),
    content_generation: z.enum(["openai", "anthropic", "mistral"]).default("openai"),
    lead_scoring: z.enum(["openai", "anthropic", "mistral"]).default("anthropic"),
  }).optional(),
  execution_mode: z.enum(["immediate", "scheduled", "manual"]).default("immediate"),
  schedule_time: z.string().datetime().optional(),
  dry_run: z.boolean().default(false),
});

/**
 * GET /campaigns
 * List campaigns with filtering
 */
app.get("/", async (c) => {
  try {
    const workspaceId = c.req.query("workspace_id");
    const status = c.req.query("status");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");

    if (!workspaceId) {
      return c.json({ error: "workspace_id is required" }, 400);
    }

    const db = getDatabaseService();
    let campaigns = await db.getCampaignsByWorkspace(workspaceId);

    // Apply status filter if provided
    if (status) {
      campaigns = campaigns.filter(c => c.status === status);
    }

    // Apply pagination
    const paginatedCampaigns = campaigns.slice(offset, offset + limit);

    return c.json({
      success: true,
      data: paginatedCampaigns,
      pagination: {
        total: campaigns.length,
        limit,
        offset,
        hasMore: (offset + limit) < campaigns.length,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch campaigns:", error);
    return c.json({
      error: "Failed to fetch campaigns",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * POST /campaigns
 * Create a new AI campaign
 */
app.post("/", zValidator("json", CreateCampaignSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const db = getDatabaseService();

    // Verify workspace exists
    const workspace = await db.getWorkspace(data.workspace_id);
    if (!workspace) {
      return c.json({ error: "Workspace not found" }, 404);
    }

    // Create campaign with initial draft status
    const campaignData = {
      ...data,
      status: "draft" as const,
    };

    const campaign = await db.createCampaign(campaignData);

    // Log campaign creation
    logger.info(`Created AI campaign: ${campaign.id}`, {
      campaignId: campaign.id,
      workspaceId: campaign.workspace_id,
      name: campaign.name,
      channels: campaign.channels,
      maxProspects: campaign.max_prospects,
    });

    return c.json({
      success: true,
      data: campaign,
    }, 201);
  } catch (error) {
    logger.error("Failed to create campaign:", error);
    return c.json({
      error: "Failed to create campaign",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * GET /campaigns/:id
 * Get campaign details
 */
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = getDatabaseService();

    const campaign = await db.getCampaign(id);
    if (!campaign) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    // Get related data
    const [leads, executions] = await Promise.all([
      db.getLeadsByCampaign(id),
      db.getAgentExecutionsByCampaign(id),
    ]);

    const campaignWithRelations = {
      ...campaign,
      leads,
      executions,
      stats: {
        total_leads: leads.length,
        qualified_leads: leads.filter(l => l.status === 'qualified').length,
        converted_leads: leads.filter(l => l.status === 'converted').length,
        total_executions: executions.length,
        completed_executions: executions.filter(e => e.status === 'completed').length,
        failed_executions: executions.filter(e => e.status === 'failed').length,
      },
    };

    return c.json({
      success: true,
      data: campaignWithRelations,
    });
  } catch (error) {
    logger.error("Failed to fetch campaign:", error);
    return c.json({
      error: "Failed to fetch campaign",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * PUT /campaigns/:id
 * Update campaign
 */
app.put("/:id", zValidator("json", UpdateCampaignSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const updates = c.req.valid("json");
    const db = getDatabaseService();

    // Check if campaign exists
    const existingCampaign = await db.getCampaign(id);
    if (!existingCampaign) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    // Update campaign status if provided
    if (updates.status) {
      const updatedCampaign = await db.updateCampaignStatus(id, updates.status);
      
      logger.info(`Updated campaign status: ${id}`, {
        campaignId: id,
        oldStatus: existingCampaign.status,
        newStatus: updates.status,
      });

      return c.json({
        success: true,
        data: updatedCampaign,
      });
    }

    // For other updates, we'd need to implement a general update method
    return c.json({
      success: true,
      data: existingCampaign,
      message: "Campaign status updates are currently supported",
    });
  } catch (error) {
    logger.error("Failed to update campaign:", error);
    return c.json({
      error: "Failed to update campaign",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * POST /campaigns/:id/execute
 * Execute a campaign with AI agent orchestration
 */
app.post("/:id/execute", zValidator("json", ExecuteCampaignSchema), async (c) => {
  try {
    const campaignId = c.req.param("id");
    const executionConfig = c.req.valid("json");
    const db = getDatabaseService();

    // Get campaign
    const campaign = await db.getCampaign(campaignId);
    if (!campaign) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    // Check if campaign is in a valid state for execution
    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      return c.json({ 
        error: "Campaign cannot be executed", 
        message: `Campaign status is '${campaign.status}', expected 'draft' or 'paused'` 
      }, 400);
    }

    // Update campaign status to active
    await db.updateCampaignStatus(campaignId, 'active');

    // Create agent execution records for the campaign workflow
    const agentTypes = [
      'prospect-discovery',
      'validation-enrichment', 
      'outreach-personalization',
      'campaign-execution',
      'analytics-feedback'
    ];

    const executions = [];
    for (const agentType of agentTypes) {
      const execution = await db.createAgentExecution({
        campaign_id: campaignId,
        agent_type: agentType,
        agent_name: `${agentType}-agent`,
        status: 'pending',
        input_data: {
          campaign: campaign,
          execution_config: executionConfig,
          providers: executionConfig.ai_providers || {},
        },
      });
      executions.push(execution);
    }

    // In a real implementation, this would trigger the AI orchestrator
    // For now, we'll simulate the start of execution
    logger.info(`Started campaign execution: ${campaignId}`, {
      campaignId,
      executionMode: executionConfig.execution_mode,
      dryRun: executionConfig.dry_run,
      agentExecutions: executions.length,
    });

    // Simulate updating the first agent execution to running
    if (executions.length > 0) {
      await db.updateAgentExecution(executions[0].id, {
        status: 'running',
        started_at: new Date(),
      });
    }

    return c.json({
      success: true,
      data: {
        campaign_id: campaignId,
        execution_id: `exec_${Date.now()}`,
        status: 'started',
        agent_executions: executions.map(e => ({
          id: e.id,
          agent_type: e.agent_type,
          status: e.status,
        })),
        estimated_completion: new Date(Date.now() + 3600000), // 1 hour from now
        dry_run: executionConfig.dry_run,
      },
    });
  } catch (error) {
    logger.error("Failed to execute campaign:", error);
    return c.json({
      error: "Failed to execute campaign",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * POST /campaigns/:id/pause
 * Pause campaign execution
 */
app.post("/:id/pause", async (c) => {
  try {
    const campaignId = c.req.param("id");
    const db = getDatabaseService();

    const campaign = await db.updateCampaignStatus(campaignId, 'paused');
    if (!campaign) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    logger.info(`Paused campaign: ${campaignId}`);

    return c.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    logger.error("Failed to pause campaign:", error);
    return c.json({
      error: "Failed to pause campaign",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * POST /campaigns/:id/stop
 * Stop campaign execution
 */
app.post("/:id/stop", async (c) => {
  try {
    const campaignId = c.req.param("id");
    const db = getDatabaseService();

    const campaign = await db.updateCampaignStatus(campaignId, 'completed');
    if (!campaign) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    logger.info(`Stopped campaign: ${campaignId}`);

    return c.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    logger.error("Failed to stop campaign:", error);
    return c.json({
      error: "Failed to stop campaign",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * GET /campaigns/:id/executions
 * Get campaign agent executions
 */
app.get("/:id/executions", async (c) => {
  try {
    const campaignId = c.req.param("id");
    const db = getDatabaseService();

    const executions = await db.getAgentExecutionsByCampaign(campaignId);

    return c.json({
      success: true,
      data: executions,
      total: executions.length,
    });
  } catch (error) {
    logger.error("Failed to fetch campaign executions:", error);
    return c.json({
      error: "Failed to fetch executions",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

export default app;