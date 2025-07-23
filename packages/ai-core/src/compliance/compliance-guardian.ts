import {
  ContentAnalysisResultType,
  ConsentRecordType,
  ComplianceRegulationType,
  ComplianceRiskLevelType,
  ComplianceActionType,
  RegulationRuleType,
  ComplianceCheckRequest,
  ComplianceApiResponse,
  ComplianceConfigType,
  ComplianceAlertType,
} from "./types";
import { AuditTrail } from "./audit-trail";
import { ConsentManager } from "./consent-manager";
import { RegulationEngine } from "./regulation-engine";
import { ComplianceMonitor } from "./compliance-monitor";
import { logger } from "../utils/logger";
import { EventEmitter } from "events";

/**
 * Compliance Guardian Network (CGN)
 * The primary compliance enforcement and monitoring system for IQ24.ai
 *
 * Ensures all outreach activities adhere to global regulations:
 * - GDPR (General Data Protection Regulation)
 * - CCPA (California Consumer Privacy Act)
 * - CAN-SPAM Act
 * - CASL (Canada's Anti-Spam Legislation)
 * - PIPEDA (Personal Information Protection and Electronic Documents Act)
 * - LGPD (Lei Geral de Proteção de Dados)
 * - PDPA Singapore
 * - UK Data Protection Act
 * - CPRA (California Privacy Rights Act)
 * - Virginia Consumer Data Protection Act
 */
export class ComplianceGuardianNetwork extends EventEmitter {
  private auditTrail: AuditTrail;
  private consentManager: ConsentManager;
  private regulationEngine: RegulationEngine;
  private complianceMonitor: ComplianceMonitor;
  private config: ComplianceConfigType;
  private isInitialized = false;

  constructor(config: ComplianceConfigType) {
    super();
    this.config = config;
    this.auditTrail = new AuditTrail(config);
    this.consentManager = new ConsentManager(config);
    this.regulationEngine = new RegulationEngine(config);
    this.complianceMonitor = new ComplianceMonitor(config);
  }

  /**
   * Initialize the Compliance Guardian Network
   */
  async initialize(): Promise<void> {
    try {
      logger.info("Initializing Compliance Guardian Network");

      // Initialize all subsystems
      await Promise.all([
        this.auditTrail.initialize(),
        this.consentManager.initialize(),
        this.regulationEngine.initialize(),
        this.complianceMonitor.initialize(),
      ]);

      // Load regulation rules
      await this.regulationEngine.loadRules();

      // Set up event listeners
      this.setupEventListeners();

      // Start monitoring
      await this.complianceMonitor.startMonitoring();

      this.isInitialized = true;
      logger.info("Compliance Guardian Network initialized successfully");

      // Emit initialization event
      this.emit("initialized", {
        timestamp: new Date(),
        regulations: this.config.enabledRegulations,
        strictMode: this.config.strictMode,
      });
    } catch (error) {
      logger.error("Failed to initialize Compliance Guardian Network", {
        error,
      });
      throw new Error(`CGN initialization failed: ${error.message}`);
    }
  }

  /**
   * Analyze content for compliance violations
   * This is the main entry point for content analysis
   */
  async analyzeContent(
    request: ComplianceCheckRequest,
  ): Promise<ComplianceApiResponse<ContentAnalysisResultType>> {
    if (!this.isInitialized) {
      throw new Error("Compliance Guardian Network not initialized");
    }

    const startTime = Date.now();

    try {
      // Log the analysis request
      await this.auditTrail.logEvent({
        eventType: "CONTENT_ANALYSIS",
        userId: "system", // This would come from the request context
        details: {
          contentType: request.contentType,
          contentLength: request.content.length,
          prospectId: request.prospectId,
          campaignId: request.campaignId,
        },
      });

      // Check consent if prospect ID is provided
      if (request.prospectId) {
        const consentValid = await this.verifyConsent(
          request.prospectId,
          request.contentType,
        );
        if (!consentValid) {
          const result: ContentAnalysisResultType = {
            contentId: this.generateContentId(),
            contentType: request.contentType,
            content: request.content,
            analysisTimestamp: new Date(),
            risks: [
              {
                regulation: "GDPR",
                riskLevel: "CRITICAL",
                riskType: "MISSING_CONSENT",
                description: "No valid consent found for this prospect",
                suggestions: [
                  "Obtain explicit consent before sending",
                  "Verify consent status",
                ],
                confidence: 1.0,
              },
            ],
            overallRiskLevel: "CRITICAL",
            recommendedAction: "REJECT",
            complianceScore: 0.0,
            requiredModifications: ["Obtain consent before proceeding"],
            approvedRegulations: [],
          };

          await this.handleNonCompliantContent(result);
          return { success: false, data: result, error: "Missing consent" };
        }
      }

      // Analyze content against regulation rules
      const analysisResult = await this.regulationEngine.analyzeContent(
        request.content,
        request.contentType,
        request.targetRegulations || this.config.enabledRegulations,
      );

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Log analysis metrics
      this.complianceMonitor.recordAnalysis({
        processingTime,
        riskLevel: analysisResult.overallRiskLevel,
        action: analysisResult.recommendedAction,
        regulations: analysisResult.approvedRegulations,
      });

      // Handle different risk levels
      if (
        analysisResult.overallRiskLevel === "CRITICAL" ||
        (analysisResult.overallRiskLevel === "HIGH" && this.config.strictMode)
      ) {
        await this.handleNonCompliantContent(analysisResult);
        return {
          success: false,
          data: analysisResult,
          error: "Content failed compliance check",
          complianceInfo: {
            regulations: this.config.enabledRegulations,
            riskLevel: analysisResult.overallRiskLevel,
            requiresReview: true,
          },
        };
      }

      // Check if human review is required
      if (this.shouldRequireHumanReview(analysisResult)) {
        analysisResult.recommendedAction = "REQUIRE_REVIEW";
        await this.flagForHumanReview(analysisResult);
      }

      // Log successful analysis
      await this.auditTrail.logEvent({
        eventType: "CONTENT_ANALYSIS",
        userId: "system",
        prospectId: request.prospectId,
        campaignId: request.campaignId,
        details: {
          contentId: analysisResult.contentId,
          overallRiskLevel: analysisResult.overallRiskLevel,
          complianceScore: analysisResult.complianceScore,
          processingTime,
        },
      });

      return {
        success: true,
        data: analysisResult,
        complianceInfo: {
          regulations: analysisResult.approvedRegulations,
          riskLevel: analysisResult.overallRiskLevel,
          requiresReview: analysisResult.recommendedAction === "REQUIRE_REVIEW",
        },
      };
    } catch (error) {
      logger.error("Content analysis failed", { error, request });

      // Create critical alert
      await this.createAlert({
        severity: "CRITICAL",
        type: "SYSTEM_ERROR",
        title: "Content Analysis Failure",
        description: `Failed to analyze content: ${error.message}`,
        affectedRegulations: this.config.enabledRegulations,
        actionRequired: true,
        suggestedActions: [
          "Review system health",
          "Check regulation engine status",
        ],
      });

      return {
        success: false,
        error: `Analysis failed: ${error.message}`,
      };
    }
  }

  /**
   * Verify consent for a specific prospect and communication type
   */
  private async verifyConsent(
    prospectId: string,
    contentType: string,
  ): Promise<boolean> {
    try {
      const consentType = this.mapContentTypeToConsent(contentType);
      return await this.consentManager.hasValidConsent(prospectId, consentType);
    } catch (error) {
      logger.error("Consent verification failed", {
        error,
        prospectId,
        contentType,
      });
      return false; // Fail secure - deny if we can't verify
    }
  }

  /**
   * Map content type to consent type
   */
  private mapContentTypeToConsent(
    contentType: string,
  ): "EMAIL_MARKETING" | "SMS_MARKETING" | "PHONE_CALLS" | "DATA_PROCESSING" {
    switch (contentType) {
      case "EMAIL":
        return "EMAIL_MARKETING";
      case "SMS":
        return "SMS_MARKETING";
      case "VOICE_SCRIPT":
        return "PHONE_CALLS";
      default:
        return "DATA_PROCESSING";
    }
  }

  /**
   * Determine if content requires human review
   */
  private shouldRequireHumanReview(result: ContentAnalysisResultType): boolean {
    if (!this.config.requireHumanReview) return false;

    // Always require review for high risk content
    if (result.overallRiskLevel === "HIGH") return true;

    // Require review if compliance score is below threshold
    if (result.complianceScore < this.config.autoRejectThreshold) return true;

    // Require review for specific risk types
    const sensitiveRiskTypes = [
      "SENSITIVE_DATA",
      "MISLEADING_CLAIMS",
      "CONSENT_ISSUES",
    ];
    return result.risks.some((risk) =>
      sensitiveRiskTypes.includes(risk.riskType),
    );
  }

  /**
   * Handle non-compliant content
   */
  private async handleNonCompliantContent(
    result: ContentAnalysisResultType,
  ): Promise<void> {
    // Create compliance alert
    await this.createAlert({
      severity: "ERROR",
      type: "REGULATION_VIOLATION",
      title: "Non-Compliant Content Detected",
      description: `Content failed compliance check with ${result.overallRiskLevel} risk level`,
      affectedRegulations: result.risks.map((r) => r.regulation),
      relatedEntities: {
        contentIds: [result.contentId],
      },
      actionRequired: true,
      suggestedActions: result.requiredModifications || [],
    });

    // Log the violation
    await this.auditTrail.logEvent({
      eventType: "MESSAGE_BLOCKED",
      userId: "system",
      details: {
        contentId: result.contentId,
        riskLevel: result.overallRiskLevel,
        violations: result.risks.map((r) => r.riskType),
        complianceScore: result.complianceScore,
      },
    });

    // Emit event for external systems
    this.emit("contentBlocked", {
      contentId: result.contentId,
      riskLevel: result.overallRiskLevel,
      violations: result.risks,
      timestamp: new Date(),
    });
  }

  /**
   * Flag content for human review
   */
  private async flagForHumanReview(
    result: ContentAnalysisResultType,
  ): Promise<void> {
    await this.createAlert({
      severity: "WARNING",
      type: "REGULATION_VIOLATION",
      title: "Content Requires Human Review",
      description: "Content flagged for manual compliance review",
      affectedRegulations: result.risks.map((r) => r.regulation),
      relatedEntities: {
        contentIds: [result.contentId],
      },
      actionRequired: true,
      suggestedActions: [
        "Review content for compliance",
        "Approve or reject after human assessment",
      ],
    });

    this.emit("reviewRequired", {
      contentId: result.contentId,
      analysisResult: result,
      timestamp: new Date(),
    });
  }

  /**
   * Create compliance alert
   */
  private async createAlert(
    alertData: Partial<ComplianceAlertType>,
  ): Promise<void> {
    const alert: ComplianceAlertType = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      severity: alertData.severity || "WARNING",
      type: alertData.type || "REGULATION_VIOLATION",
      title: alertData.title || "Compliance Alert",
      description: alertData.description || "",
      affectedRegulations: alertData.affectedRegulations || [],
      relatedEntities: alertData.relatedEntities || {},
      actionRequired: alertData.actionRequired || false,
      suggestedActions: alertData.suggestedActions || [],
      escalationLevel: this.calculateEscalationLevel(
        alertData.severity || "WARNING",
      ),
      status: "OPEN",
    };

    await this.complianceMonitor.createAlert(alert);

    // Send notifications if configured
    if (this.config.alertsEnabled && alert.severity === "CRITICAL") {
      await this.sendCriticalAlert(alert);
    }
  }

  /**
   * Calculate escalation level based on severity
   */
  private calculateEscalationLevel(
    severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL",
  ): number {
    switch (severity) {
      case "INFO":
        return 1;
      case "WARNING":
        return 2;
      case "ERROR":
        return 3;
      case "CRITICAL":
        return 5;
      default:
        return 2;
    }
  }

  /**
   * Send critical alert notifications
   */
  private async sendCriticalAlert(alert: ComplianceAlertType): Promise<void> {
    try {
      // Send webhook notifications
      for (const webhookUrl of this.config.alertWebhooks) {
        await this.sendWebhookAlert(webhookUrl, alert);
      }

      // Send email notifications to emergency contacts
      for (const contact of this.config.emergencyContacts) {
        await this.sendEmailAlert(contact, alert);
      }
    } catch (error) {
      logger.error("Failed to send critical alert notifications", {
        error,
        alertId: alert.id,
      });
    }
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(
    webhookUrl: string,
    alert: ComplianceAlertType,
  ): Promise<void> {
    // Implementation would use HTTP client to send webhook
    logger.info("Sending webhook alert", { webhookUrl, alertId: alert.id });
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(
    email: string,
    alert: ComplianceAlertType,
  ): Promise<void> {
    // Implementation would use email service
    logger.info("Sending email alert", { email, alertId: alert.id });
  }

  /**
   * Set up event listeners for subsystems
   */
  private setupEventListeners(): void {
    // Listen for consent events
    this.consentManager.on("consentWithdrawn", async (data) => {
      await this.handleConsentWithdrawn(data);
    });

    this.consentManager.on("consentExpired", async (data) => {
      await this.handleConsentExpired(data);
    });

    // Listen for regulation updates
    this.regulationEngine.on("regulationUpdated", async (data) => {
      await this.handleRegulationUpdate(data);
    });

    // Listen for monitoring alerts
    this.complianceMonitor.on("anomalyDetected", async (data) => {
      await this.handleAnomalyDetected(data);
    });
  }

  /**
   * Handle consent withdrawal
   */
  private async handleConsentWithdrawn(data: any): Promise<void> {
    await this.createAlert({
      severity: "WARNING",
      type: "CONSENT_EXPIRED",
      title: "Consent Withdrawn",
      description: `Consent withdrawn for prospect ${data.prospectId}`,
      actionRequired: true,
      suggestedActions: [
        "Stop all communications",
        "Update prospect status",
        "Review active campaigns",
      ],
    });
  }

  /**
   * Handle consent expiration
   */
  private async handleConsentExpired(data: any): Promise<void> {
    await this.createAlert({
      severity: "WARNING",
      type: "CONSENT_EXPIRED",
      title: "Consent Expired",
      description: `Consent expired for prospect ${data.prospectId}`,
      actionRequired: true,
      suggestedActions: [
        "Request consent renewal",
        "Pause communications",
        "Update consent records",
      ],
    });
  }

  /**
   * Handle regulation updates
   */
  private async handleRegulationUpdate(data: any): Promise<void> {
    await this.createAlert({
      severity: "INFO",
      type: "REGULATORY_UPDATE",
      title: "Regulation Updated",
      description: `${data.regulation} regulation has been updated`,
      affectedRegulations: [data.regulation],
      actionRequired: data.actionRequired,
      suggestedActions: data.suggestedActions || [
        "Review updated regulations",
        "Update compliance procedures",
      ],
    });
  }

  /**
   * Handle anomaly detection
   */
  private async handleAnomalyDetected(data: any): Promise<void> {
    await this.createAlert({
      severity: "ERROR",
      type: "AUDIT_ANOMALY",
      title: "Compliance Anomaly Detected",
      description: data.description,
      actionRequired: true,
      suggestedActions: [
        "Investigate anomaly",
        "Review recent activities",
        "Check system integrity",
      ],
    });
  }

  /**
   * Get compliance health status
   */
  async getHealthStatus(): Promise<any> {
    return await this.complianceMonitor.getHealthStatus();
  }

  /**
   * Get compliance metrics
   */
  async getMetrics(
    period: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" = "DAILY",
  ): Promise<any> {
    return await this.complianceMonitor.getMetrics(period);
  }

  /**
   * Generate unique content ID
   */
  private generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown the compliance system gracefully
   */
  async shutdown(): Promise<void> {
    logger.info("Shutting down Compliance Guardian Network");

    await Promise.all([
      this.complianceMonitor.stopMonitoring(),
      this.auditTrail.flush(),
      this.consentManager.shutdown(),
      this.regulationEngine.shutdown(),
    ]);

    this.isInitialized = false;
    logger.info("Compliance Guardian Network shutdown complete");
  }
}
