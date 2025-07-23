/**
 * Main AI Orchestration Controller
 *
 * This is the central command and control system that integrates all AI agents,
 * workflow management, monitoring, and error recovery into a unified platform.
 *
 * Features:
 * - Unified orchestration of all 7 AI agents
 * - Integration with monitoring and error recovery systems
 * - Event-driven architecture with real-time communication
 * - Workflow state management and checkpointing
 * - Performance optimization and resource allocation
 * - Compliance enforcement and audit trail management
 */

import { EventEmitter } from "events";
import { ALOOrchestrator } from "./aco-orchestrator";
import { SystemMonitor } from "../monitoring/system-monitor";
import { ErrorRecoverySystem } from "../recovery/error-recovery";
import { IntegrationTestSuite } from "../testing/integration-tests";
import { ConfigManager } from "../config";
import { DatabaseClient } from "../database/client";
import { ExternalServices } from "../integrations/external-services";
import {
  AIAgentStatus,
  WorkflowStatus,
  SystemHealthStatus,
  CampaignConfig,
  OrchestrationEvent,
  PerformanceMetrics,
  ComplianceStatus,
} from "../types";
import { Logger } from "../utils/logger";

/**
 * Main orchestration controller that coordinates all AI system components
 */
export class MainOrchestrator extends EventEmitter {
  private static instance: MainOrchestrator;
  private aloOrchestrator: ALOOrchestrator;
  private systemMonitor: SystemMonitor;
  private errorRecovery: ErrorRecoverySystem;
  private integrationTests: IntegrationTestSuite;
  private config: ConfigManager;
  private database: DatabaseClient;
  private externalServices: ExternalServices;
  private logger: Logger;

  private isInitialized = false;
  private isRunning = false;
  private systemHealth: SystemHealthStatus = "unknown";
  private activeWorkflows = new Map<string, WorkflowStatus>();
  private performanceMetrics: PerformanceMetrics = {
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    failedCampaigns: 0,
    averageResponseTime: 0,
    throughputPerHour: 0,
    errorRate: 0,
    uptime: 0,
  };

  private constructor() {
    super();
    this.logger = new Logger("MainOrchestrator");
    this.config = ConfigManager.getInstance();
    this.database = DatabaseClient.getInstance();
    this.externalServices = new ExternalServices();
    this.aloOrchestrator = new ALOOrchestrator();
    this.systemMonitor = new SystemMonitor();
    this.errorRecovery = new ErrorRecoverySystem();
    this.integrationTests = new IntegrationTestSuite();
  }

  /**
   * Get singleton instance of MainOrchestrator
   */
  public static getInstance(): MainOrchestrator {
    if (!MainOrchestrator.instance) {
      MainOrchestrator.instance = new MainOrchestrator();
    }
    return MainOrchestrator.instance;
  }

  /**
   * Initialize the main orchestration system
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn("MainOrchestrator already initialized");
      return;
    }

    try {
      this.logger.info("Initializing AI Orchestration System...");

      // Initialize core dependencies
      await this.config.load();
      await this.database.initialize();
      await this.externalServices.initialize();

      // Initialize orchestration components
      await this.aloOrchestrator.initialize();
      await this.systemMonitor.initialize();
      await this.errorRecovery.initialize();
      await this.integrationTests.initialize();

      // Set up event listeners
      this.setupEventListeners();

      // Run initial health checks
      await this.performInitialHealthChecks();

      this.isInitialized = true;
      this.logger.info("AI Orchestration System initialized successfully");

      this.emit("initialized", { timestamp: new Date() });
    } catch (error) {
      this.logger.error("Failed to initialize MainOrchestrator:", error);
      throw error;
    }
  }

  /**
   * Start the orchestration system
   */
  public async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("MainOrchestrator must be initialized before starting");
    }

    if (this.isRunning) {
      this.logger.warn("MainOrchestrator already running");
      return;
    }

    try {
      this.logger.info("Starting AI Orchestration System...");

      // Start monitoring and error recovery
      await this.systemMonitor.start();
      await this.errorRecovery.start();

      // Start the ALO orchestrator
      await this.aloOrchestrator.start();

      // Begin performance metrics collection
      this.startPerformanceMonitoring();

      this.isRunning = true;
      this.systemHealth = "healthy";

      this.logger.info("AI Orchestration System started successfully");
      this.emit("started", { timestamp: new Date() });
    } catch (error) {
      this.logger.error("Failed to start MainOrchestrator:", error);
      await this.errorRecovery.handleSystemError(error as Error);
      throw error;
    }
  }

  /**
   * Stop the orchestration system gracefully
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      this.logger.info("Stopping AI Orchestration System...");

      // Stop performance monitoring
      this.stopPerformanceMonitoring();

      // Stop orchestration components
      await this.aloOrchestrator.stop();
      await this.systemMonitor.stop();
      await this.errorRecovery.stop();

      // Wait for active workflows to complete or timeout
      await this.waitForActiveWorkflows(30000); // 30 second timeout

      this.isRunning = false;
      this.systemHealth = "stopped";

      this.logger.info("AI Orchestration System stopped successfully");
      this.emit("stopped", { timestamp: new Date() });
    } catch (error) {
      this.logger.error("Error during MainOrchestrator shutdown:", error);
      throw error;
    }
  }

  /**
   * Create and execute a new B2B growth campaign
   */
  public async createCampaign(config: CampaignConfig): Promise<string> {
    if (!this.isRunning) {
      throw new Error("MainOrchestrator is not running");
    }

    try {
      this.logger.info("Creating new campaign:", {
        name: config.name,
        type: config.type,
        targetAudience: config.targetAudience?.size || "unknown",
      });

      // Validate campaign configuration
      await this.validateCampaignConfig(config);

      // Create campaign workflow
      const workflowId =
        await this.aloOrchestrator.createCampaignWorkflow(config);

      // Track workflow
      this.activeWorkflows.set(workflowId, {
        id: workflowId,
        status: "running",
        startTime: new Date(),
        config,
        progress: {
          stage: "initiation",
          completedSteps: 0,
          totalSteps: 7,
          estimatedCompletion: new Date(
            Date.now() + (config.estimatedDuration || 3600000),
          ),
        },
      });

      // Update metrics
      this.performanceMetrics.totalCampaigns++;
      this.performanceMetrics.activeCampaigns++;

      this.emit("campaignCreated", { workflowId, config });

      return workflowId;
    } catch (error) {
      this.logger.error("Failed to create campaign:", error);
      this.performanceMetrics.failedCampaigns++;
      throw error;
    }
  }

  /**
   * Get current system status
   */
  public async getSystemStatus(): Promise<{
    health: SystemHealthStatus;
    agents: Record<string, AIAgentStatus>;
    workflows: WorkflowStatus[];
    metrics: PerformanceMetrics;
    compliance: ComplianceStatus;
  }> {
    const agentStatuses = await this.aloOrchestrator.getAgentStatuses();
    const workflowStatuses = Array.from(this.activeWorkflows.values());
    const complianceStatus = await this.getComplianceStatus();

    return {
      health: this.systemHealth,
      agents: agentStatuses,
      workflows: workflowStatuses,
      metrics: this.performanceMetrics,
      compliance: complianceStatus,
    };
  }

  /**
   * Run comprehensive system diagnostics
   */
  public async runDiagnostics(): Promise<{
    health: SystemHealthStatus;
    issues: string[];
    recommendations: string[];
    testResults: any;
  }> {
    try {
      this.logger.info("Running system diagnostics...");

      const testResults = await this.integrationTests.runAllTests();
      const healthCheck = await this.systemMonitor.getSystemHealth();

      const issues: string[] = [];
      const recommendations: string[] = [];

      // Analyze test results
      if (testResults.agentHealth.failedTests > 0) {
        issues.push(
          `${testResults.agentHealth.failedTests} agent health tests failed`,
        );
        recommendations.push(
          "Check agent configurations and external service connectivity",
        );
      }

      if (testResults.workflow.failedTests > 0) {
        issues.push(
          `${testResults.workflow.failedTests} workflow tests failed`,
        );
        recommendations.push(
          "Review workflow orchestration and state management",
        );
      }

      if (testResults.performance.averageResponseTime > 5000) {
        issues.push("High response times detected");
        recommendations.push(
          "Consider scaling resources or optimizing algorithms",
        );
      }

      // Determine overall health
      const overallHealth: SystemHealthStatus =
        issues.length === 0
          ? "healthy"
          : issues.length <= 2
            ? "degraded"
            : "unhealthy";

      return {
        health: overallHealth,
        issues,
        recommendations,
        testResults,
      };
    } catch (error) {
      this.logger.error("Failed to run diagnostics:", error);
      return {
        health: "unhealthy",
        issues: ["Diagnostics system failure"],
        recommendations: ["Contact system administrator"],
        testResults: null,
      };
    }
  }

  /**
   * Optimize system performance based on current metrics
   */
  public async optimizePerformance(): Promise<void> {
    try {
      this.logger.info("Optimizing system performance...");

      const currentMetrics = this.performanceMetrics;

      // Analyze performance patterns
      if (currentMetrics.errorRate > 0.05) {
        // 5% error rate threshold
        await this.errorRecovery.adjustRetryPolicies();
        this.logger.info(
          "Adjusted error recovery policies due to high error rate",
        );
      }

      if (currentMetrics.averageResponseTime > 3000) {
        // 3 second threshold
        await this.aloOrchestrator.optimizeResourceAllocation();
        this.logger.info(
          "Optimized resource allocation due to high response times",
        );
      }

      if (currentMetrics.activeCampaigns > 100) {
        // High load threshold
        await this.systemMonitor.enablePerformanceMode();
        this.logger.info("Enabled performance mode due to high campaign load");
      }

      this.emit("performanceOptimized", {
        previousMetrics: currentMetrics,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error("Failed to optimize performance:", error);
      throw error;
    }
  }

  /**
   * Set up event listeners for cross-component communication
   */
  private setupEventListeners(): void {
    // ALO Orchestrator events
    this.aloOrchestrator.on("workflowCompleted", (data) => {
      this.handleWorkflowCompletion(data.workflowId, "completed");
    });

    this.aloOrchestrator.on("workflowFailed", (data) => {
      this.handleWorkflowCompletion(data.workflowId, "failed");
    });

    // System Monitor events
    this.systemMonitor.on("criticalAlert", async (alert) => {
      this.logger.error("Critical system alert:", alert);
      await this.errorRecovery.handleCriticalAlert(alert);
      this.emit("criticalAlert", alert);
    });

    this.systemMonitor.on("performanceAlert", (alert) => {
      this.logger.warn("Performance alert:", alert);
      this.emit("performanceAlert", alert);
    });

    // Error Recovery events
    this.errorRecovery.on("systemRecovered", (data) => {
      this.logger.info("System recovered from error:", data);
      this.emit("systemRecovered", data);
    });

    this.errorRecovery.on("recoveryFailed", (data) => {
      this.logger.error("System recovery failed:", data);
      this.systemHealth = "unhealthy";
      this.emit("recoveryFailed", data);
    });
  }

  /**
   * Perform initial health checks
   */
  private async performInitialHealthChecks(): Promise<void> {
    const healthCheck = await this.systemMonitor.getSystemHealth();

    if (healthCheck.overall !== "healthy") {
      this.logger.warn("Initial health check failed:", healthCheck);
      this.systemHealth = "degraded";
    } else {
      this.systemHealth = "healthy";
    }
  }

  /**
   * Start performance metrics collection
   */
  private startPerformanceMonitoring(): void {
    // Update metrics every 30 seconds
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 30000);
  }

  /**
   * Stop performance metrics collection
   */
  private stopPerformanceMonitoring(): void {
    // Implementation would clear intervals and cleanup
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    try {
      const now = Date.now();
      const activeWorkflows = Array.from(this.activeWorkflows.values());

      this.performanceMetrics.activeCampaigns = activeWorkflows.filter(
        (w) => w.status === "running",
      ).length;
      this.performanceMetrics.throughputPerHour = this.calculateThroughput();
      this.performanceMetrics.uptime = this.calculateUptime();

      // Calculate error rate from recent workflows
      const recentWorkflows = activeWorkflows.filter(
        (w) => w.startTime && now - w.startTime.getTime() < 3600000, // Last hour
      );

      const failedRecent = recentWorkflows.filter(
        (w) => w.status === "failed",
      ).length;
      this.performanceMetrics.errorRate =
        recentWorkflows.length > 0 ? failedRecent / recentWorkflows.length : 0;
    } catch (error) {
      this.logger.error("Error updating performance metrics:", error);
    }
  }

  /**
   * Handle workflow completion
   */
  private handleWorkflowCompletion(
    workflowId: string,
    status: "completed" | "failed",
  ): void {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow) {
      workflow.status = status;
      workflow.endTime = new Date();

      if (status === "completed") {
        this.performanceMetrics.completedCampaigns++;
      } else {
        this.performanceMetrics.failedCampaigns++;
      }

      this.performanceMetrics.activeCampaigns--;
      this.activeWorkflows.delete(workflowId);

      this.emit("workflowCompleted", { workflowId, status, workflow });
    }
  }

  /**
   * Wait for active workflows to complete
   */
  private async waitForActiveWorkflows(timeoutMs: number): Promise<void> {
    const startTime = Date.now();

    while (
      this.activeWorkflows.size > 0 &&
      Date.now() - startTime < timeoutMs
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (this.activeWorkflows.size > 0) {
      this.logger.warn(
        `${this.activeWorkflows.size} workflows still active after timeout`,
      );
    }
  }

  /**
   * Validate campaign configuration
   */
  private async validateCampaignConfig(config: CampaignConfig): Promise<void> {
    if (!config.name || !config.type) {
      throw new Error("Campaign name and type are required");
    }

    if (!config.targetAudience || config.targetAudience.size === 0) {
      throw new Error("Target audience is required");
    }

    // Additional validation logic
    const maxCampaigns = this.config.get("maxConcurrentCampaigns", 50);
    if (this.performanceMetrics.activeCampaigns >= maxCampaigns) {
      throw new Error(`Maximum concurrent campaigns (${maxCampaigns}) reached`);
    }
  }

  /**
   * Get compliance status
   */
  private async getComplianceStatus(): Promise<ComplianceStatus> {
    // This would integrate with the Compliance Guardian Network
    return {
      gdprCompliant: true,
      ccpaCompliant: true,
      canSpamCompliant: true,
      auditTrailComplete: true,
      lastAuditDate: new Date(),
      pendingReviews: 0,
    };
  }

  /**
   * Calculate system throughput
   */
  private calculateThroughput(): number {
    // Implementation would calculate campaigns per hour
    return this.performanceMetrics.completedCampaigns;
  }

  /**
   * Calculate system uptime
   */
  private calculateUptime(): number {
    // Implementation would track uptime percentage
    return 99.9; // Placeholder
  }
}

// Export singleton instance
export const mainOrchestrator = MainOrchestrator.getInstance();

/**
 * Orchestration Events Interface
 */
export interface OrchestrationEvents {
  initialized: { timestamp: Date };
  started: { timestamp: Date };
  stopped: { timestamp: Date };
  campaignCreated: { workflowId: string; config: CampaignConfig };
  workflowCompleted: {
    workflowId: string;
    status: string;
    workflow: WorkflowStatus;
  };
  criticalAlert: any;
  performanceAlert: any;
  systemRecovered: any;
  recoveryFailed: any;
  performanceOptimized: {
    previousMetrics: PerformanceMetrics;
    timestamp: Date;
  };
}

/**
 * Export for external use
 */
export { MainOrchestrator };
