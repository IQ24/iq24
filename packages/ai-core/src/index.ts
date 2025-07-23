/**
 * IQ24.ai AI-Native B2B Growth Engine
 *
 * Main entry point for the sophisticated multi-agent AI orchestration system.
 * This is the central nervous system that coordinates all AI agents, workflows,
 * monitoring, error recovery, and performance optimization.
 *
 * Features:
 * - 7 specialized AI agents for complete B2B growth automation
 * - Sophisticated workflow orchestration with checkpointing
 * - Real-time monitoring and performance optimization
 * - Comprehensive error recovery with circuit breakers
 * - Integration testing and health monitoring
 * - Compliance enforcement and audit trail management
 * - Event-driven architecture with real-time communication
 */

import {
  MainOrchestrator,
  mainOrchestrator,
} from "./orchestrator/main-orchestrator";
import { ALOOrchestrator } from "./orchestrator/aco-orchestrator";
import { ConfigManager } from "./config";
import { Logger } from "./utils/logger";

// Export all core components for external use
export {
  MainOrchestrator,
  mainOrchestrator,
} from "./orchestrator/main-orchestrator";
export { ALOOrchestrator } from "./orchestrator/aco-orchestrator";
export { AIEngine } from "./engine/ai-engine";
export { CampaignWorkflow } from "./workflows/campaign-workflow";
export { SystemMonitor } from "./monitoring/system-monitor";
export { ErrorRecoverySystem } from "./recovery/error-recovery";
export { IntegrationTestSuite } from "./testing/integration-tests";
export { ConfigManager } from "./config";
export { DatabaseClient } from "./database/client";
export { ExternalServices } from "./integrations/external-services";

// Note: AI agents are exported from @iq24/agents package to avoid circular dependencies

// Export types
export * from "./types";

// Initialize logger
const logger = new Logger("IQ24-AI-System");

/**
 * Initialize and start the complete AI system
 */
export async function startAISystem(): Promise<MainOrchestrator> {
  try {
    logger.info("🚀 Starting IQ24.ai AI-Native B2B Growth Engine...");

    // Initialize the main orchestrator
    await mainOrchestrator.initialize();

    // Start the system
    await mainOrchestrator.start();

    logger.info("✅ IQ24.ai AI System started successfully!");
    logger.info("🔥 Ready to revolutionize B2B growth with AI orchestration");

    // Set up graceful shutdown
    setupGracefulShutdown();

    return mainOrchestrator;
  } catch (error) {
    logger.error("❌ Failed to start IQ24.ai AI System:", error);
    throw error;
  }
}

/**
 * Stop the AI system gracefully
 */
export async function stopAISystem(): Promise<void> {
  try {
    logger.info("🛑 Stopping IQ24.ai AI System...");

    await mainOrchestrator.stop();

    logger.info("✅ IQ24.ai AI System stopped successfully");
  } catch (error) {
    logger.error("❌ Error stopping IQ24.ai AI System:", error);
    throw error;
  }
}

/**
 * Get the current system status
 */
export async function getSystemStatus() {
  return await mainOrchestrator.getSystemStatus();
}

/**
 * Run comprehensive system diagnostics
 */
export async function runSystemDiagnostics() {
  return await mainOrchestrator.runDiagnostics();
}

/**
 * Create a new B2B growth campaign
 */
export async function createCampaign(config: any) {
  return await mainOrchestrator.createCampaign(config);
}

/**
 * Optimize system performance
 */
export async function optimizeSystemPerformance() {
  return await mainOrchestrator.optimizePerformance();
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(): void {
  const shutdownHandler = async (signal: string) => {
    logger.info(`Received ${signal}, initiating graceful shutdown...`);

    try {
      await stopAISystem();
      process.exit(0);
    } catch (error) {
      logger.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  };

  // Handle various shutdown signals
  process.on("SIGTERM", () => shutdownHandler("SIGTERM"));
  process.on("SIGINT", () => shutdownHandler("SIGINT"));
  process.on("SIGUSR2", () => shutdownHandler("SIGUSR2")); // nodemon restart

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    shutdownHandler("uncaughtException");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    shutdownHandler("unhandledRejection");
  });
}

/**
 * Development helper functions
 */
export const dev = {
  /**
   * Quick system health check
   */
  async healthCheck() {
    const status = await getSystemStatus();
    console.log("🔍 System Health Check:");
    console.log(`   Overall Health: ${status.health}`);
    console.log(`   Active Campaigns: ${status.metrics.activeCampaigns}`);
    console.log(`   Total Campaigns: ${status.metrics.totalCampaigns}`);
    console.log(
      `   Error Rate: ${(status.metrics.errorRate * 100).toFixed(2)}%`,
    );
    console.log(`   Uptime: ${status.metrics.uptime}%`);
    return status;
  },

  /**
   * Run diagnostics and display results
   */
  async diagnose() {
    const diagnostics = await runSystemDiagnostics();
    console.log("🔧 System Diagnostics:");
    console.log(`   Health: ${diagnostics.health}`);
    console.log(`   Issues: ${diagnostics.issues.length}`);
    if (diagnostics.issues.length > 0) {
      diagnostics.issues.forEach((issue, i) => {
        console.log(`     ${i + 1}. ${issue}`);
      });
    }
    console.log(`   Recommendations: ${diagnostics.recommendations.length}`);
    if (diagnostics.recommendations.length > 0) {
      diagnostics.recommendations.forEach((rec, i) => {
        console.log(`     ${i + 1}. ${rec}`);
      });
    }
    return diagnostics;
  },

  /**
   * Create a test campaign
   */
  async testCampaign() {
    const testConfig = {
      name: "Test Campaign",
      type: "prospecting",
      targetAudience: {
        size: 100,
        criteria: {
          industry: "Technology",
          company_size: "10-50",
          location: "United States",
        },
      },
      estimatedDuration: 3600000, // 1 hour
      channels: ["email", "linkedin"],
      personalizations: {
        level: "high",
        includeCompanyNews: true,
        includeSocialProof: true,
      },
    };

    const workflowId = await createCampaign(testConfig);
    console.log(`🧪 Test campaign created: ${workflowId}`);
    return workflowId;
  },

  /**
   * Monitor system in real-time
   */
  startMonitoring(intervalMs = 10000) {
    const interval = setInterval(async () => {
      try {
        const status = await getSystemStatus();
        console.clear();
        console.log("📊 IQ24.ai AI System - Real-time Monitor");
        console.log("=".repeat(50));
        console.log(`Health: ${status.health}`);
        console.log(`Active Campaigns: ${status.metrics.activeCampaigns}`);
        console.log(`Completed: ${status.metrics.completedCampaigns}`);
        console.log(
          `Error Rate: ${(status.metrics.errorRate * 100).toFixed(2)}%`,
        );
        console.log(
          `Avg Response Time: ${status.metrics.averageResponseTime}ms`,
        );
        console.log(`Uptime: ${status.metrics.uptime}%`);
        console.log("=".repeat(50));
        console.log("Press Ctrl+C to stop monitoring");
      } catch (error) {
        console.error("Monitoring error:", error);
      }
    }, intervalMs);

    // Return stop function
    return () => {
      clearInterval(interval);
      console.log("Monitoring stopped");
    };
  },
};

/**
 * Welcome message and system info
 */
export function displayWelcomeMessage(): void {
  console.log(`
  🚀 IQ24.ai - AI-Native B2B Growth Engine
  ========================================
  
  A sophisticated multi-agent AI orchestration system for B2B growth automation.
  
  Features:
  ✨ 7 Specialized AI Agents
  🔄 Workflow Orchestration
  📊 Real-time Monitoring
  🛡️ Error Recovery
  🔒 Compliance Enforcement
  ⚡ Performance Optimization
  
  System Components:
  - Prospect Discovery Agent (PDA)
  - Validation & Enrichment Agent (VEA) 
  - Outreach Personalization Agent (OPA)
  - Campaign Execution Agent (CEA)
  - Analytics & Feedback Loop Agent (AFLA)
  - Compliance Guardian Network (CGN)
  - Cognitive Reflection Module (CRM)
  
  Quick Start:
  - await startAISystem()  // Start the system
  - await dev.healthCheck()  // Check system health
  - await dev.testCampaign()  // Create test campaign
  - dev.startMonitoring()  // Monitor in real-time
  
  Ready to revolutionize B2B growth! 🚀
  `);
}

// Auto-display welcome message when imported
if (require.main === module) {
  displayWelcomeMessage();
}
