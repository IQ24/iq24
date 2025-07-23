/**
 * IQ24.ai - Comprehensive Compliance System
 *
 * Main integration module that orchestrates all compliance components
 * and provides a unified interface for the AI engine.
 */

import { EventEmitter } from "events";
import { Logger } from "winston";
import { ComplianceGuardianNetwork } from "./compliance-guardian";
import { RegulationEngine } from "./regulation-engine";
import { AuditTrail } from "./audit-trail";
import { ConsentManager } from "./consent-manager";
import { ComplianceMonitor } from "./compliance-monitor";
import {
  ComplianceSystemConfig,
  ComplianceEvent,
  ComplianceEventType,
  ComplianceViolation,
  ComplianceAlert,
  ComplianceStatus,
  RegulatoryFramework,
  ConsentType,
  ConsentPurpose,
  OutreachContent,
  ComplianceCheckResult,
  ComplianceSystemStatus,
  DataRightsRequest,
  ConsentRecord,
  ComplianceMetrics,
  ComplianceReport,
  ComplianceReportType,
} from "./types";

export interface ComplianceSystemOptions {
  logger: Logger;
  config: ComplianceSystemConfig;
  storageAdapters: {
    consent: any;
    audit: any;
    metrics: any;
  };
  services: {
    notifications: any;
    encryption: any;
    retention: any;
    alerting: any;
    reporting: any;
  };
}

/**
 * Main Compliance System that orchestrates all compliance components
 */
export class ComplianceSystem extends EventEmitter {
  private logger: Logger;
  private config: ComplianceSystemConfig;

  // Core compliance components
  private guardian: ComplianceGuardianNetwork;
  private regulationEngine: RegulationEngine;
  private auditTrail: AuditTrail;
  private consentManager: ConsentManager;
  private monitor: ComplianceMonitor;

  // System state
  private isInitialized: boolean = false;
  private systemStatus: ComplianceSystemStatus =
    ComplianceSystemStatus.INITIALIZING;
  private lastHealthCheck: Date = new Date();

  constructor(options: ComplianceSystemOptions) {
    super();
    this.logger = options.logger;
    this.config = options.config;

    this.setupComponents(options);
    this.setupEventHandlers();
  }

  /**
   * Initialize the compliance system
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info("Initializing IQ24.ai Compliance System");

      // Initialize components in order
      await this.auditTrail.initialize();
      await this.regulationEngine.initialize();
      await this.consentManager.initialize?.();
      await this.guardian.initialize();
      await this.monitor.initialize?.();

      this.isInitialized = true;
      this.systemStatus = ComplianceSystemStatus.ACTIVE;
      this.lastHealthCheck = new Date();

      // Log initialization event
      await this.logEvent({
        type: ComplianceEventType.SYSTEM_INITIALIZED,
        details: {
          version: this.config.version,
          frameworks: this.config.enabledFrameworks,
          components: [
            "guardian",
            "regulation-engine",
            "audit-trail",
            "consent-manager",
            "monitor",
          ],
        },
        timestamp: new Date(),
        userId: "system",
      });

      this.logger.info("Compliance system initialized successfully", {
        version: this.config.version,
        frameworks: this.config.enabledFrameworks.length,
        components: 5,
      });

      this.emit("initialized");
    } catch (error) {
      this.systemStatus = ComplianceSystemStatus.ERROR;
      this.logger.error("Failed to initialize compliance system", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Check if outreach content is compliant before sending
   */
  async checkOutreachCompliance(
    content: OutreachContent,
    contactId: string,
    framework: RegulatoryFramework,
  ): Promise<ComplianceCheckResult> {
    try {
      if (!this.isInitialized) {
        throw new Error("Compliance system not initialized");
      }

      // Step 1: Check consent
      const hasConsent = await this.consentManager.hasValidConsent(
        contactId,
        ConsentType.MARKETING,
        ConsentPurpose.EMAIL_MARKETING,
      );

      if (!hasConsent) {
        const violation: ComplianceViolation = {
          id: this.generateViolationId(),
          type: "MISSING_CONSENT" as any,
          severity: "HIGH" as any,
          framework,
          contactId,
          description: "Missing valid consent for marketing outreach",
          detectedAt: new Date(),
          resolved: false,
          metadata: { contentType: content.type, channel: content.channel },
        };

        await this.monitor.recordViolation(violation);

        return {
          isCompliant: false,
          violations: [violation],
          recommendations: [
            "Obtain explicit consent before sending marketing communications",
          ],
          requiresHumanReview: true,
          blockedReasons: ["Missing consent"],
        };
      }

      // Step 2: Content analysis by Guardian
      const guardianResult = await this.guardian.analyzeContent(
        content,
        framework,
      );

      if (!guardianResult.approved) {
        return {
          isCompliant: false,
          violations: guardianResult.violations || [],
          recommendations: guardianResult.recommendations || [],
          requiresHumanReview: guardianResult.requiresHumanReview || false,
          blockedReasons: guardianResult.blockedReasons || [],
        };
      }

      // Step 3: Log compliant outreach
      await this.logEvent({
        type: ComplianceEventType.OUTREACH_APPROVED,
        contactId,
        consentId: await this.getConsentId(contactId, ConsentType.MARKETING),
        framework,
        details: {
          contentType: content.type,
          channel: content.channel,
          approved: true,
        },
        timestamp: new Date(),
        userId: "system",
      });

      return {
        isCompliant: true,
        violations: [],
        recommendations: [],
        requiresHumanReview: false,
        blockedReasons: [],
      };
    } catch (error) {
      this.logger.error("Failed to check outreach compliance", {
        contactId,
        framework,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Record consent for contact
   */
  async recordConsent(
    contactInfo: any,
    consentType: ConsentType,
    purposes: ConsentPurpose[],
    framework: RegulatoryFramework,
    options?: any,
  ): Promise<ConsentRecord> {
    try {
      const consent = await this.consentManager.recordConsent(
        contactInfo,
        consentType,
        purposes,
        framework,
        options,
      );

      // Log event
      await this.logEvent({
        type: ComplianceEventType.CONSENT_GRANTED,
        contactId: contactInfo.id,
        consentId: consent.id,
        framework,
        details: {
          type: consentType,
          purposes,
          source: options?.source || "direct",
        },
        timestamp: new Date(),
        userId: options?.userId || "system",
      });

      return consent;
    } catch (error) {
      this.logger.error("Failed to record consent", {
        contactId: contactInfo.id,
        consentType,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Withdraw consent for contact
   */
  async withdrawConsent(
    contactId: string,
    consentType: ConsentType,
    reason?: string,
    userId?: string,
  ): Promise<ConsentRecord> {
    try {
      const consent = await this.consentManager.withdrawConsent(
        contactId,
        consentType,
        reason,
        userId,
      );

      // Log event
      await this.logEvent({
        type: ComplianceEventType.CONSENT_WITHDRAWN,
        contactId,
        consentId: consent.id,
        details: { reason },
        timestamp: new Date(),
        userId: userId || "system",
      });

      return consent;
    } catch (error) {
      this.logger.error("Failed to withdraw consent", {
        contactId,
        consentType,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Process data rights request (GDPR, CCPA, etc.)
   */
  async processDataRightsRequest(request: DataRightsRequest): Promise<void> {
    try {
      await this.consentManager.processDataRightsRequest(request);

      // Log event
      await this.logEvent({
        type: ComplianceEventType.DATA_RIGHTS_REQUEST_PROCESSED,
        contactId: request.contactId,
        details: {
          requestType: request.type,
          requestId: request.id,
        },
        timestamp: new Date(),
        userId: "system",
      });
    } catch (error) {
      this.logger.error("Failed to process data rights request", {
        requestId: request.id,
        type: request.type,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update regulatory rules
   */
  async updateRegulations(
    framework: RegulatoryFramework,
    rules: any[],
  ): Promise<void> {
    try {
      await this.regulationEngine.updateRules(framework, rules);

      await this.logEvent({
        type: ComplianceEventType.REGULATIONS_UPDATED,
        framework,
        details: {
          rulesUpdated: rules.length,
          updatedAt: new Date(),
        },
        timestamp: new Date(),
        userId: "system",
      });

      this.logger.info("Regulations updated", {
        framework,
        rulesCount: rules.length,
      });
    } catch (error) {
      this.logger.error("Failed to update regulations", {
        framework,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get compliance metrics
   */
  async getMetrics(timeRange?: {
    from: Date;
    to: Date;
  }): Promise<ComplianceMetrics> {
    try {
      if (timeRange) {
        const metrics = await this.monitor.getMetrics(timeRange);
        return metrics[0] || this.monitor.getCurrentMetrics();
      }
      return this.monitor.getCurrentMetrics();
    } catch (error) {
      this.logger.error("Failed to get compliance metrics", {
        timeRange,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get compliance dashboard
   */
  async getDashboard(): Promise<any> {
    try {
      return await this.monitor.getDashboard();
    } catch (error) {
      this.logger.error("Failed to get compliance dashboard", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateReport(
    type: ComplianceReportType,
    timeRange: { from: Date; to: Date },
    frameworks?: RegulatoryFramework[],
  ): Promise<ComplianceReport> {
    try {
      return await this.monitor.generateReport(type, timeRange, frameworks);
    } catch (error) {
      this.logger.error("Failed to generate compliance report", {
        type,
        timeRange,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    status: ComplianceSystemStatus;
    initialized: boolean;
    lastHealthCheck: Date;
    componentStatus: Record<string, string>;
  } {
    return {
      status: this.systemStatus,
      initialized: this.isInitialized,
      lastHealthCheck: this.lastHealthCheck,
      componentStatus: {
        guardian: "active",
        regulationEngine: "active",
        auditTrail: "active",
        consentManager: "active",
        monitor: "active",
      },
    };
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check each component
      const checks = await Promise.all([
        this.guardian.healthCheck?.() ?? true,
        this.regulationEngine.healthCheck?.() ?? true,
        this.auditTrail.healthCheck?.() ?? true,
        this.consentManager.healthCheck?.() ?? true,
        this.monitor.healthCheck?.() ?? true,
      ]);

      const isHealthy = checks.every((check) => check === true);
      this.systemStatus = isHealthy
        ? ComplianceSystemStatus.ACTIVE
        : ComplianceSystemStatus.DEGRADED;
      this.lastHealthCheck = new Date();

      if (!isHealthy) {
        this.logger.warn("Compliance system health check failed", {
          componentResults: checks,
        });
      }

      return isHealthy;
    } catch (error) {
      this.systemStatus = ComplianceSystemStatus.ERROR;
      this.logger.error("Health check failed", {
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Shutdown the compliance system
   */
  async shutdown(): Promise<void> {
    try {
      this.logger.info("Shutting down compliance system");

      this.systemStatus = ComplianceSystemStatus.SHUTTING_DOWN;

      // Shutdown components in reverse order
      await this.monitor.shutdown?.();
      await this.consentManager.shutdown?.();
      await this.guardian.shutdown?.();
      await this.regulationEngine.shutdown?.();
      await this.auditTrail.shutdown?.();

      this.systemStatus = ComplianceSystemStatus.STOPPED;
      this.isInitialized = false;

      this.logger.info("Compliance system shutdown completed");
      this.emit("shutdown");
    } catch (error) {
      this.systemStatus = ComplianceSystemStatus.ERROR;
      this.logger.error("Failed to shutdown compliance system", {
        error: error.message,
      });
      throw error;
    }
  }

  // Private helper methods

  private setupComponents(options: ComplianceSystemOptions): void {
    // Initialize audit trail first (other components depend on it)
    this.auditTrail = new AuditTrail({
      logger: this.logger,
      storageAdapter: options.storageAdapters.audit,
      encryption: options.services.encryption,
      configuration: this.config.auditConfig,
    });

    // Initialize regulation engine
    this.regulationEngine = new RegulationEngine({
      logger: this.logger,
      auditTrail: this.auditTrail,
      configuration: this.config.regulationConfig,
    });

    // Initialize consent manager
    this.consentManager = new ConsentManager({
      logger: this.logger,
      auditTrail: this.auditTrail,
      storageAdapter: options.storageAdapters.consent,
      notifications: options.services.notifications,
      encryption: options.services.encryption,
      retention: options.services.retention,
      configuration: this.config.consentConfig,
    });

    // Initialize compliance guardian
    this.guardian = new ComplianceGuardianNetwork({
      logger: this.logger,
      regulationEngine: this.regulationEngine,
      auditTrail: this.auditTrail,
      configuration: this.config.guardianConfig,
    });

    // Initialize monitor
    this.monitor = new ComplianceMonitor({
      logger: this.logger,
      auditTrail: this.auditTrail,
      alertingService: options.services.alerting,
      metricsStorage: options.storageAdapters.metrics,
      reportGenerator: options.services.reporting,
      configuration: this.config.monitorConfig,
      thresholds: this.config.thresholds,
    });
  }

  private setupEventHandlers(): void {
    // Set up event forwarding and coordination between components
    this.guardian.on("violationDetected", (violation) => {
      this.monitor.recordViolation(violation);
      this.emit("violationDetected", violation);
    });

    this.consentManager.on("consentGranted", (consent) => {
      this.emit("consentGranted", consent);
    });

    this.consentManager.on("consentWithdrawn", (consent) => {
      this.emit("consentWithdrawn", consent);
    });

    this.monitor.on("violationRecorded", (violation) => {
      this.emit("violationRecorded", violation);
    });

    // Set up periodic health checks
    setInterval(() => {
      this.healthCheck().catch((error) => {
        this.logger.error("Periodic health check failed", {
          error: error.message,
        });
      });
    }, this.config.healthCheckIntervalMs);
  }

  private async logEvent(event: ComplianceEvent): Promise<void> {
    try {
      await this.auditTrail.logEvent(event);
      await this.monitor.processComplianceEvent(event);
    } catch (error) {
      this.logger.error("Failed to log compliance event", {
        eventType: event.type,
        error: error.message,
      });
    }
  }

  private async getConsentId(
    contactId: string,
    consentType: ConsentType,
  ): Promise<string | undefined> {
    try {
      const consents =
        await this.consentManager.getConsentPreferences(contactId);
      const consent = consents.find(
        (c) => c.type === consentType && c.status === "GRANTED",
      );
      return consent?.id;
    } catch (error) {
      return undefined;
    }
  }

  private generateViolationId(): string {
    return `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export all types and components
export * from "./types";
export { ComplianceGuardianNetwork } from "./compliance-guardian";
export { RegulationEngine } from "./regulation-engine";
export { AuditTrail } from "./audit-trail";
export { ConsentManager } from "./consent-manager";
export { ComplianceMonitor } from "./compliance-monitor";

// Default export
export default ComplianceSystem;
