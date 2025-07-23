/**
 * Basic AI Engine - Ultra-minimal version for testing core functionality
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger());

// Basic health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0-basic",
    service: "IQ24 AI Engine",
    services: {
      ai: { status: "healthy", provider: "mock" },
      database: { status: "healthy", type: "mock" },
    },
  });
});

// Mock prospect discovery
app.post("/ai/prospects/discover", async (c) => {
  try {
    const body = await c.req.json();
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const prospects = [
      {
        id: `prospect-${Date.now()}-1`,
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@techcorp.com",
        company: "TechCorp Inc.",
        position: "CTO",
        industry: "Technology",
        linkedinUrl: "https://linkedin.com/in/john-smith",
        leadScore: 85,
        source: "ai-discovery",
        discoveredAt: new Date(),
      },
      {
        id: `prospect-${Date.now()}-2`,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@innovate.io",
        company: "Innovate Solutions",
        position: "VP Marketing",
        industry: "Software",
        linkedinUrl: "https://linkedin.com/in/sarah-johnson",
        leadScore: 72,
        source: "ai-discovery",
        discoveredAt: new Date(),
      },
    ];
    
    return c.json({
      success: true,
      taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "completed",
      prospects,
      metadata: {
        totalFound: prospects.length,
        qualityScore: 78,
        processingTime: 1000,
        aiProvider: "mock-openai",
        aiCost: 0.02,
        searchCriteria: body.searchCriteria || {},
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// Mock campaign execution
app.post("/ai/campaigns/execute", async (c) => {
  try {
    const body = await c.req.json();
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return c.json({
      success: true,
      campaignId: body.campaignId || `campaign_${Date.now()}`,
      workflowId: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "completed",
      message: `Campaign executed successfully for ${body.prospects?.length || 0} prospects`,
      metadata: {
        prospectsProcessed: body.prospects?.length || 0,
        processingTime: 2000,
        channels: body.config?.channels || ["email"],
        personalizationLevel: body.config?.personalizationLevel || "advanced",
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// System metrics
app.get("/ai/metrics", (c) => {
  return c.json({
    timestamp: new Date().toISOString(),
    system: {
      status: "healthy",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: "1.0.0-basic",
    },
    ai: {
      totalProviders: 1,
      healthyProviders: 1,
      providerStatus: [{
        name: "mock-openai",
        healthy: true,
        lastChecked: new Date(),
        responseTime: 1200,
        errorRate: 0,
      }],
    },
    metrics: {
      totalRequests: 0,
      successRate: 100,
      averageResponseTime: 1200,
      activeTasks: 0,
    },
  });
});

// Root route
app.get("/", (c) => {
  return c.json({
    name: "IQ24 AI Engine",
    version: "1.0.0-basic",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /health - Health check",
      "POST /ai/prospects/discover - AI prospect discovery",
      "POST /ai/campaigns/execute - AI campaign execution", 
      "GET /ai/metrics - System metrics",
    ],
  });
});

export default app;