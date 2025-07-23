/**
 * Minimal AI Engine - Simplified version for testing
 * 
 * This is a lightweight version of the AI engine that focuses on core functionality
 * without complex dependencies that cause build issues.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger());

// Mock AI Provider for testing
class MockAIProvider {
  async executeRequest(request: any) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const { searchCriteria, limits } = request.payload || {};
    const maxProspects = limits?.maxProspects || 5;
    
    // Generate mock prospects
    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
    const companies = ['TechCorp', 'InnovateSoft', 'DataSystems', 'CloudTech', 'NextGen Solutions'];
    const positions = ['CEO', 'CTO', 'VP Engineering', 'Director of Marketing', 'Head of Sales'];
    
    const prospects = [];
    for (let i = 0; i < Math.min(maxProspects, 10); i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      
      prospects.push({
        id: `prospect-${Date.now()}-${i}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\\s+/g, '')}.com`,
        company,
        position,
        industry: searchCriteria?.industries?.[0] || 'Technology',
        linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        phone: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        leadScore: Math.floor(Math.random() * 40) + 50, // 50-90 range
        source: 'ai-discovery',
        discoveredAt: new Date(),
        lastUpdated: new Date(),
        metadata: {
          aiGenerated: true,
          searchCriteria: searchCriteria || {},
          companyInfo: {
            size: searchCriteria?.companySizes?.[0] || 'Medium',
            location: searchCriteria?.locations?.[0] || 'United States',
          },
        },
      });
    }
    
    return {
      content: JSON.stringify({ prospects }),
      usage: {
        promptTokens: 150,
        completionTokens: 800,
        totalTokens: 950,
      },
      model: 'mock-gpt-4',
      provider: 'mock-openai',
      cost: 0.02,
      processingTime: 1500,
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
  
  getSystemStatus() {
    return {
      totalProviders: 1,
      healthyProviders: 1,
      providerStatus: [{
        name: 'mock-openai',
        healthy: true,
        lastChecked: new Date(),
        responseTime: 1200,
        errorRate: 0,
        requestsInLastMinute: 0,
        tokensInLastMinute: 0,
      }],
      recentRequests: [],
    };
  }
}

// Mock Database for testing
class MockDatabase {
  private prospects: any[] = [];
  private analytics: any[] = [];
  
  async query(sql: string, params: any[] = []) {
    if (sql.includes('INSERT INTO prospects')) {
      const prospect = {
        id: params[0],
        workspace_id: params[1],
        first_name: params[2],
        last_name: params[3],
        email: params[4],
        company: params[5],
        position: params[6],
        lead_score: params[7],
        status: params[8],
        metadata: JSON.parse(params[9] || '{}'),
        created_at: new Date(),
      };
      this.prospects.push(prospect);
      return { rows: [prospect], rowCount: 1 };
    }
    
    if (sql.includes('INSERT INTO analytics_events')) {
      const event = {
        workspace_id: params[0],
        event_type: params[1],
        event_data: JSON.parse(params[2] || '{}'),
        timestamp: new Date(),
      };
      this.analytics.push(event);
      return { rows: [event], rowCount: 1 };
    }
    
    return { rows: [], rowCount: 0 };
  }
  
  async getSystemHealth() {
    return {
      connected: true,
      timestamp: new Date(),
      postgresql: {
        connected: true,
        version: 'Mock PostgreSQL 15.0',
      },
      redis: {
        connected: true,
      },
    };
  }
}

// Initialize services
const aiProvider = new MockAIProvider();
const database = new MockDatabase();

// Add root endpoint for basic info
app.get("/", (c) => {
  return c.json({
    name: "IQ24 AI Engine",
    version: "1.0.0-minimal",
    status: "operational",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /health - Health check",
      "POST /ai/prospects/discover - AI-powered prospect discovery",
      "POST /ai/campaigns/execute - Execute AI marketing campaigns", 
      "GET /ai/metrics - AI system metrics",
    ],
  });
});

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
    maxProspects: z.number().min(1).max(100).default(10),
    maxCompanies: z.number().min(1).max(50).default(25),
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
    personalizationLevel: z.enum(["basic", "advanced", "hyper"]).default("advanced"),
    complianceProfile: z.string().default("gdpr"),
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

// Routes

/**
 * Health check endpoint - simplified to avoid async hangs
 */
app.get("/health", (c) => {
  try {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0-minimal",
      engine: "running",
      uptime: process.uptime ? Math.floor(process.uptime()) : 0,
      services: {
        ai: {
          status: "healthy",
          providers: 1,
          healthyProviders: 1,
        },
        database: {
          status: "healthy",
          postgresql: true,
          redis: true,
        },
      },
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
 * AI-powered prospect discovery
 */
app.post(
  "/ai/prospects/discover",
  zValidator("json", ProspectDiscoveryRequestSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const userId = c.req.header("x-user-id") || "anonymous";
      const workspaceId = c.req.header("x-workspace-id") || "default";
      
      console.log(`🔍 Starting AI prospect discovery for user: ${userId}, workspace: ${workspaceId}`);
      console.log(`📋 Search criteria:`, JSON.stringify(body.searchCriteria, null, 2));
      
      const startTime = Date.now();
      
      // Execute AI-powered discovery
      const aiResponse = await aiProvider.executeRequest({
        payload: {
          searchCriteria: body.searchCriteria,
          limits: body.limits,
          enrichmentLevel: body.enrichmentLevel,
        },
      });
      
      // Parse AI response
      const responseData = JSON.parse(aiResponse.content);
      const prospects = responseData.prospects || [];
      
      // Store prospects in database
      const storedProspects = [];
      for (const prospect of prospects) {
        await database.query(
          `INSERT INTO prospects (id, workspace_id, first_name, last_name, email, company, position, lead_score, status, metadata) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            prospect.id,
            workspaceId,
            prospect.firstName,
            prospect.lastName,
            prospect.email,
            prospect.company,
            prospect.position,
            prospect.leadScore,
            "new",
            JSON.stringify(prospect.metadata),
          ]
        );
        storedProspects.push(prospect);
      }
      
      const processingTime = Date.now() - startTime;
      const qualityScore = calculateQualityScore(storedProspects);
      
      // Store analytics
      await database.query(
        `INSERT INTO analytics_events (workspace_id, event_type, event_data) VALUES ($1, $2, $3)`,
        [
          workspaceId,
          "prospect_discovery_completed",
          JSON.stringify({
            prospectsFound: storedProspects.length,
            qualityScore,
            processingTime,
            aiProvider: aiResponse.provider,
            aiCost: aiResponse.cost,
          }),
        ]
      );
      
      console.log(`✅ Discovery completed: found ${storedProspects.length} prospects in ${processingTime}ms`);
      
      return c.json({
        success: true,
        taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: "completed",
        prospects: storedProspects,
        metadata: {
          totalFound: storedProspects.length,
          qualityScore,
          processingTime,
          aiProvider: aiResponse.provider,
          aiCost: aiResponse.cost,
          enrichmentLevel: body.enrichmentLevel,
          searchCriteria: body.searchCriteria,
        },
      });
    } catch (error) {
      console.error("❌ Prospect discovery failed:", error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }, 500);
    }
  }
);

/**
 * Execute AI campaign
 */
app.post(
  "/ai/campaigns/execute",
  zValidator("json", CampaignExecutionRequestSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const userId = c.req.header("x-user-id") || "anonymous";
      const workspaceId = c.req.header("x-workspace-id") || "default";
      
      console.log(`🚀 Starting AI campaign execution: ${body.campaignId}`);
      console.log(`👥 Processing ${body.prospects.length} prospects`);
      
      const startTime = Date.now();
      
      // Simulate campaign processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const processedProspects = body.prospects.map(prospect => ({
        ...prospect,
        status: "processed",
        processedAt: new Date(),
        campaignId: body.campaignId,
      }));
      
      const processingTime = Date.now() - startTime;
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store analytics
      await database.query(
        `INSERT INTO analytics_events (workspace_id, event_type, event_data) VALUES ($1, $2, $3)`,
        [
          workspaceId,
          "campaign_execution_completed",
          JSON.stringify({
            campaignId: body.campaignId,
            workflowId,
            prospectsProcessed: processedProspects.length,
            processingTime,
            channels: body.config.channels,
            personalizationLevel: body.config.personalizationLevel,
          }),
        ]
      );
      
      console.log(`✅ Campaign execution completed in ${processingTime}ms`);
      
      return c.json({
        success: true,
        campaignId: body.campaignId,
        workflowId,
        status: "completed",
        message: `Campaign executed successfully for ${processedProspects.length} prospects`,
        metadata: {
          prospectsProcessed: processedProspects.length,
          processingTime,
          channels: body.config.channels,
          personalizationLevel: body.config.personalizationLevel,
          estimatedCompletion: new Date(),
        },
      });
    } catch (error) {
      console.error("❌ Campaign execution failed:", error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }, 500);
    }
  }
);

/**
 * Get system metrics - simplified to avoid async hangs
 */
app.get("/ai/metrics", (c) => {
  try {
    return c.json({
      timestamp: new Date().toISOString(),
      system: {
        status: "healthy",
        uptime: process.uptime ? Math.floor(process.uptime()) : 0,
        memory: process.memoryUsage ? process.memoryUsage() : {},
        version: "1.0.0-minimal",
      },
      ai: {
        totalProviders: 1,
        healthyProviders: 1,
        providerStatus: [{
          name: 'mock-openai',
          healthy: true,
          lastChecked: new Date(),
          responseTime: 1200,
          errorRate: 0,
          requestsInLastMinute: 0,
          tokensInLastMinute: 0,
        }],
        recentRequests: [],
      },
      database: {
        connected: true,
        timestamp: new Date(),
        postgresql: {
          connected: true,
          version: 'Mock PostgreSQL 15.0',
        },
        redis: {
          connected: true,
        },
      },
      metrics: {
        totalRequests: 0,
        successRate: 100,
        averageResponseTime: 1200,
        activeTasks: 0,
      },
    });
  } catch (error) {
    return c.json({
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// Helper functions
function calculateQualityScore(prospects: any[]): number {
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

export default app;