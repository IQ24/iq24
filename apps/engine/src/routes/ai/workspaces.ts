/**
 * AI Workspaces API Routes
 * 
 * Provides workspace management for AI campaigns and operations.
 * Each workspace belongs to a team and contains campaigns, leads, and agent executions.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getDatabaseService } from "../../services/database";
import { Logger } from "@iq24/utils";

const app = new Hono();
const logger = new Logger("ai-workspaces");

// Schemas
const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  team_id: z.string().uuid(),
  settings: z.record(z.any()).optional().default({}),
});

const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  settings: z.record(z.any()).optional(),
});

/**
 * GET /workspaces
 * List all workspaces for a team
 */
app.get("/", async (c) => {
  try {
    const teamId = c.req.header("x-team-id");
    
    if (!teamId) {
      return c.json({ error: "Team ID is required" }, 400);
    }

    const db = getDatabaseService();
    const workspaces = await db.getWorkspacesByTeam(teamId);

    return c.json({
      success: true,
      data: workspaces,
      total: workspaces.length,
    });
  } catch (error) {
    logger.error("Failed to fetch workspaces:", error);
    return c.json({
      error: "Failed to fetch workspaces",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * POST /workspaces
 * Create a new AI workspace
 */
app.post("/", zValidator("json", CreateWorkspaceSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const db = getDatabaseService();

    const workspace = await db.createWorkspace(data);

    logger.info(`Created AI workspace: ${workspace.id}`, {
      workspaceId: workspace.id,
      name: workspace.name,
      teamId: workspace.team_id,
    });

    return c.json({
      success: true,
      data: workspace,
    }, 201);
  } catch (error) {
    logger.error("Failed to create workspace:", error);
    return c.json({
      error: "Failed to create workspace",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * GET /workspaces/:id
 * Get a specific workspace
 */
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = getDatabaseService();

    const workspace = await db.getWorkspace(id);

    if (!workspace) {
      return c.json({ error: "Workspace not found" }, 404);
    }

    return c.json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    logger.error("Failed to fetch workspace:", error);
    return c.json({
      error: "Failed to fetch workspace",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * GET /workspaces/:id/campaigns
 * Get all campaigns for a workspace
 */
app.get("/:id/campaigns", async (c) => {
  try {
    const workspaceId = c.req.param("id");
    const db = getDatabaseService();

    // Verify workspace exists
    const workspace = await db.getWorkspace(workspaceId);
    if (!workspace) {
      return c.json({ error: "Workspace not found" }, 404);
    }

    const campaigns = await db.getCampaignsByWorkspace(workspaceId);

    return c.json({
      success: true,
      data: campaigns,
      total: campaigns.length,
    });
  } catch (error) {
    logger.error("Failed to fetch workspace campaigns:", error);
    return c.json({
      error: "Failed to fetch campaigns",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * GET /workspaces/:id/leads
 * Get all leads for a workspace
 */
app.get("/:id/leads", async (c) => {
  try {
    const workspaceId = c.req.param("id");
    const limit = parseInt(c.req.query("limit") || "100");
    const offset = parseInt(c.req.query("offset") || "0");
    
    const db = getDatabaseService();

    // Verify workspace exists
    const workspace = await db.getWorkspace(workspaceId);
    if (!workspace) {
      return c.json({ error: "Workspace not found" }, 404);
    }

    const leads = await db.getLeadsByWorkspace(workspaceId, limit, offset);

    return c.json({
      success: true,
      data: leads,
      total: leads.length,
      pagination: {
        limit,
        offset,
        hasMore: leads.length === limit,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch workspace leads:", error);
    return c.json({
      error: "Failed to fetch leads",  
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

/**
 * GET /workspaces/:id/stats
 * Get workspace statistics
 */
app.get("/:id/stats", async (c) => {
  try {
    const workspaceId = c.req.param("id");
    const db = getDatabaseService();

    // Verify workspace exists
    const workspace = await db.getWorkspace(workspaceId);
    if (!workspace) {
      return c.json({ error: "Workspace not found" }, 404);
    }

    // Get stats in parallel
    const [campaigns, leads] = await Promise.all([
      db.getCampaignsByWorkspace(workspaceId),
      db.getLeadsByWorkspace(workspaceId, 1000), // Get up to 1000 for stats
    ]);

    // Calculate stats
    const stats = {
      campaigns: {
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'active').length,
        completed: campaigns.filter(c => c.status === 'completed').length,
        paused: campaigns.filter(c => c.status === 'paused').length,
      },
      leads: {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        qualified: leads.filter(l => l.status === 'qualified').length,
        converted: leads.filter(l => l.status === 'converted').length,
      },
      activity: {
        lastCampaignCreated: campaigns[0]?.created_at || null,
        lastLeadAdded: leads[0]?.created_at || null,
      },
    };

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Failed to fetch workspace stats:", error);
    return c.json({
      error: "Failed to fetch workspace stats",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

export default app;