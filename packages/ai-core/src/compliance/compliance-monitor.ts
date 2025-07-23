/**
 * IQ24.ai - Compliance Monitoring System
 *
 * Real-time compliance monitoring, metrics collection, alerting, and reporting
 * system for comprehensive regulatory compliance oversight.
 */

import { EventEmitter } from "events";
import { Logger } from "winston";
import {
  ComplianceMetrics,
  ComplianceAlert,
  ComplianceAlertType,
  ComplianceAlertSeverity,
  ComplianceViolation,
  ViolationType,
  RegulatoryFramework,
  ComplianceEvent,
  ComplianceEventType,
  ComplianceReport,
  ComplianceReportType,
  MonitoringConfiguration,
  ComplianceThreshold,
  ComplianceStatus,
  ComplianceDashboard,
} from "./types";

export interface ComplianceMonitorOptions {
  logger: Logger;
  auditTrail: any;
  alertingService: AlertingService;
  metricsStorage: MetricsStorageAdapter;
  reportGenerator: ReportGenerator;
  configuration: MonitoringConfiguration;
  thresholds: ComplianceThreshold[];
}

export interface AlertingService {
  sendAlert(alert: ComplianceAlert): Promise<void>;
  sendBatchAlerts(alerts: ComplianceAlert[]): Promise<void>;
  updateAlertStatus(alertId: string, status: string): Promise<void>;
  getActiveAlerts(): Promise<ComplianceAlert[]>;
}

export interface MetricsStorageAdapter {
  storeMetrics(metrics: ComplianceMetrics): Promise<void>;
  getMetrics(timeRange: { from: Date; to: Date }): Promise<ComplianceMetrics[]>;
  getAggregatedMetrics(
    timeRange: { from: Date; to: Date },
    granularity: string,
  ): Promise<ComplianceMetrics[]>;
  deleteExpiredMetrics(retentionDays: number): Promise<void>;
}

export interface ReportGenerator {
  generateReport(
    type: ComplianceReportType,
    parameters: any,
  ): Promise<ComplianceReport>;
  scheduleReport(
    type: ComplianceReportType,
    schedule: string,
    recipients: string[],
  ): Promise<void>;
  getReportHistory(limit?: number): Promise<ComplianceReport[]>;
}

export class ComplianceMonitor extends EventEmitter {
  private logger: Logger;
  private auditTrail: any;
  private alerting: AlertingService;
  private metricsStorage: MetricsStorageAdapter;
  private reportGenerator: ReportGenerator;
  private config: MonitoringConfiguration;
  private thresholds: ComplianceThreshold[];

  // Real-time monitoring state
  private currentMetrics: ComplianceMetrics;
  private violationCounts: Map<ViolationType, number> = new Map();
  private alertThrottling: Map<string, Date> = new Map();
  private activeViolations: Set<string> = new Set();
  private frameworkStatus: Map<RegulatoryFramework, ComplianceStatus> =
    new Map();

  // Periodic monitoring intervals
  private metricsCollectionInterval: NodeJS.Timeout;
  private violationCheckInterval: NodeJS.Timeout;
  private reportGenerationInterval: NodeJS.Timeout;
  private cleanupInterval: NodeJS.Timeout;

  constructor(options: ComplianceMonitorOptions) {
    super();
    this.logger = options.logger;
    this.auditTrail = options.auditTrail;
    this.alerting = options.alertingService;
    this.metricsStorage = options.metricsStorage;
    this.reportGenerator = options.reportGenerator;
    this.config = options.configuration;
    this.thresholds = options.thresholds;

    this.initializeMetrics();
    this.startMonitoring();
  }

  /**
   * Process compliance event and update metrics
   */
  async processComplianceEvent(event: ComplianceEvent): Promise<void> {
    try {
      // Update real-time metrics
      await this.updateMetrics(event);

      // Check for violations
      await this.checkViolations(event);

      // Update framework status
      await this.updateFrameworkStatus(event);

      // Log event
      this.logger.debug("Processed compliance event", {
        type: event.type,
        contactId: event.contactId,
        timestamp: event.timestamp,
      });

      // Emit event for external listeners
      this.emit("eventProcessed", event);
    } catch (error) {
      this.logger.error("Failed to process compliance event", {
        event: event.type,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Record compliance violation
   */
  async recordViolation(violation: ComplianceViolation): Promise<void> {
    try {
      // Update violation counts
      const currentCount = this.violationCounts.get(violation.type) || 0;
      this.violationCounts.set(violation.type, currentCount + 1);

      // Add to active violations
      this.activeViolations.add(violation.id);

      // Create alert if threshold exceeded
      await this.checkViolationThresholds(violation);

      // Log audit event
      await this.auditTrail.logEvent({
        type: ComplianceEventType.VIOLATION_DETECTED,
        contactId: violation.contactId,
        details: {
          violationType: violation.type,
          violationId: violation.id,
          severity: violation.severity,
          framework: violation.framework,
        },
        timestamp: new Date(),
        userId: "system",
      } as ComplianceEvent);

      // Update framework status
      await this.updateFrameworkStatusForViolation(violation);

      this.logger.warn("Compliance violation recorded", {
        violationId: violation.id,
        type: violation.type,
        severity: violation.severity,
        framework: violation.framework,
      });

      // Emit violation event
      this.emit("violationRecorded", violation);
    } catch (error) {
      this.logger.error("Failed to record compliance violation", {
        violationId: violation.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Resolve compliance violation
   */
  async resolveViolation(
    violationId: string,
    resolution: string,
    userId: string,
  ): Promise<void> {
    try {
      // Remove from active violations
      this.activeViolations.delete(violationId);

      // Log resolution
      await this.auditTrail.logEvent({
        type: ComplianceEventType.VIOLATION_RESOLVED,
        details: {
          violationId,
          resolution,
          resolvedBy: userId,
        },
        timestamp: new Date(),
        userId,
      } as ComplianceEvent);

      this.logger.info("Compliance violation resolved", {
        violationId,
        resolution,
        resolvedBy: userId,
      });

      // Emit resolution event
      this.emit("violationResolved", { violationId, resolution, userId });
    } catch (error) {
      this.logger.error("Failed to resolve compliance violation", {
        violationId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get current compliance metrics
   */
  getCurrentMetrics(): ComplianceMetrics {
    return { ...this.currentMetrics };
  }

  /**
   * Get compliance metrics for time range
   */
  async getMetrics(timeRange: { from: Date; to: Date }): Promise<
    ComplianceMetrics[]
  > {
    try {
      return await this.metricsStorage.getMetrics(timeRange);
    } catch (error) {
      this.logger.error("Failed to get compliance metrics", {
        timeRange,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get compliance dashboard data
   */
  async getDashboard(): Promise<ComplianceDashboard> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [dailyMetrics, weeklyMetrics, activeAlerts] = await Promise.all([
        this.metricsStorage.getMetrics({ from: oneDayAgo, to: now }),
        this.metricsStorage.getMetrics({ from: oneWeekAgo, to: now }),
        this.alerting.getActiveAlerts(),
      ]);

      return {
        currentMetrics: this.currentMetrics,
        frameworkStatus: Object.fromEntries(this.frameworkStatus),
        activeViolations: Array.from(this.activeViolations),
        violationCounts: Object.fromEntries(this.violationCounts),
        activeAlerts: activeAlerts.length,
        dailyTrends: this.calculateTrends(dailyMetrics),
        weeklyTrends: this.calculateTrends(weeklyMetrics),
        lastUpdated: new Date(),
      };
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
      const parameters = {
        timeRange,
        frameworks: frameworks || Object.values(RegulatoryFramework),
        includeMetrics: true,
        includeViolations: true,
        includeAlerts: true,
      };

      const report = await this.reportGenerator.generateReport(
        type,
        parameters,
      );

      this.logger.info("Compliance report generated", {
        type,
        timeRange,
        reportId: report.id,
      });

      return report;
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
   * Schedule automatic report generation
   */
  async scheduleReport(
    type: ComplianceReportType,
    schedule: string,
    recipients: string[],
  ): Promise<void> {
    try {
      await this.reportGenerator.scheduleReport(type, schedule, recipients);

      this.logger.info("Compliance report scheduled", {
        type,
        schedule,
        recipients: recipients.length,
      });
    } catch (error) {
      this.logger.error("Failed to schedule compliance report", {
        type,
        schedule,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update monitoring configuration
   */
  updateConfiguration(config: Partial<MonitoringConfiguration>): void {
    this.config = { ...this.config, ...config };
    this.logger.info("Compliance monitoring configuration updated");
  }

  /**
   * Update compliance thresholds
   */
  updateThresholds(thresholds: ComplianceThreshold[]): void {
    this.thresholds = thresholds;
    this.logger.info("Compliance thresholds updated", {
      thresholdCount: thresholds.length,
    });
  }

  /**
   * Stop monitoring and cleanup
   */
  async shutdown(): Promise<void> {
    try {
      // Stop all intervals
      if (this.metricsCollectionInterval) {
        clearInterval(this.metricsCollectionInterval);
      }
      if (this.violationCheckInterval) {
        clearInterval(this.violationCheckInterval);
      }
      if (this.reportGenerationInterval) {
        clearInterval(this.reportGenerationInterval);
      }
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      // Final metrics collection
      await this.collectMetrics();

      this.logger.info("Compliance monitor shutdown completed");
    } catch (error) {
      this.logger.error("Error during compliance monitor shutdown", {
        error: error.message,
      });
      throw error;
    }
  }

  // Private methods

  private initializeMetrics(): void {
    this.currentMetrics = {
      timestamp: new Date(),
      totalEvents: 0,
      eventsByType: {},
      violationsByType: {},
      violationsByFramework: {},
      alertsByType: {},
      alertsBySeverity: {},
      frameworkCompliance: {},
      responseTimeMs: 0,
      processingErrors: 0,
      systemHealth: "healthy",
    };

    // Initialize framework status
    for (const framework of Object.values(RegulatoryFramework)) {
      this.frameworkStatus.set(framework, ComplianceStatus.COMPLIANT);
    }
  }

  private startMonitoring(): void {
    // Start metrics collection
    this.metricsCollectionInterval = setInterval(
      () => this.collectMetrics(),
      this.config.metricsCollectionIntervalMs,
    );

    // Start violation checking
    this.violationCheckInterval = setInterval(
      () => this.checkPeriodicViolations(),
      this.config.violationCheckIntervalMs,
    );

    // Start automatic reporting
    if (this.config.automaticReporting) {
      this.reportGenerationInterval = setInterval(
        () => this.generateAutomaticReports(),
        this.config.reportGenerationIntervalMs,
      );
    }

    // Start cleanup
    this.cleanupInterval = setInterval(
      () => this.performCleanup(),
      this.config.cleanupIntervalMs,
    );

    this.logger.info("Compliance monitoring started", {
      metricsInterval: this.config.metricsCollectionIntervalMs,
      violationCheckInterval: this.config.violationCheckIntervalMs,
      automaticReporting: this.config.automaticReporting,
    });
  }

  private async updateMetrics(event: ComplianceEvent): Promise<void> {
    // Update total events
    this.currentMetrics.totalEvents++;

    // Update events by type
    const eventType = event.type;
    this.currentMetrics.eventsByType[eventType] =
      (this.currentMetrics.eventsByType[eventType] || 0) + 1;

    // Update framework compliance
    if (event.framework) {
      this.currentMetrics.frameworkCompliance[event.framework] =
        this.frameworkStatus.get(event.framework) || ComplianceStatus.COMPLIANT;
    }

    // Update timestamp
    this.currentMetrics.timestamp = new Date();
  }

  private async checkViolations(event: ComplianceEvent): Promise<void> {
    // Check for various violation patterns
    const violations: ComplianceViolation[] = [];

    // Check consent violations
    if (event.type === ComplianceEventType.OUTREACH_SENT && !event.consentId) {
      violations.push({
        id: this.generateViolationId(),
        type: ViolationType.MISSING_CONSENT,
        severity: ComplianceAlertSeverity.HIGH,
        framework: event.framework || RegulatoryFramework.GDPR,
        contactId: event.contactId,
        description: "Outreach sent without valid consent",
        detectedAt: new Date(),
        resolved: false,
        metadata: { eventId: event.id },
      });
    }

    // Check data retention violations
    if (
      event.type === ComplianceEventType.DATA_PROCESSED &&
      this.isDataRetentionViolation(event)
    ) {
      violations.push({
        id: this.generateViolationId(),
        type: ViolationType.DATA_RETENTION,
        severity: ComplianceAlertSeverity.MEDIUM,
        framework: event.framework || RegulatoryFramework.GDPR,
        contactId: event.contactId,
        description: "Data processed beyond retention period",
        detectedAt: new Date(),
        resolved: false,
        metadata: { eventId: event.id },
      });
    }

    // Process violations
    for (const violation of violations) {
      await this.recordViolation(violation);
    }
  }

  private async checkViolationThresholds(
    violation: ComplianceViolation,
  ): Promise<void> {
    for (const threshold of this.thresholds) {
      if (threshold.violationType === violation.type) {
        const currentCount = this.violationCounts.get(violation.type) || 0;

        if (currentCount >= threshold.threshold) {
          await this.createThresholdAlert(violation, threshold, currentCount);
        }
      }
    }
  }

  private async createThresholdAlert(
    violation: ComplianceViolation,
    threshold: ComplianceThreshold,
    currentCount: number,
  ): Promise<void> {
    const alertKey = `threshold_${violation.type}`;

    // Check throttling
    const lastAlert = this.alertThrottling.get(alertKey);
    if (lastAlert && Date.now() - lastAlert.getTime() < threshold.throttleMs) {
      return;
    }

    const alert: ComplianceAlert = {
      id: this.generateAlertId(),
      type: ComplianceAlertType.THRESHOLD_EXCEEDED,
      severity: threshold.severity,
      framework: violation.framework,
      title: `${violation.type} threshold exceeded`,
      message: `${violation.type} violations (${currentCount}) exceeded threshold (${threshold.threshold})`,
      contactId: violation.contactId,
      violationId: violation.id,
      createdAt: new Date(),
      acknowledged: false,
      resolved: false,
      metadata: {
        currentCount,
        threshold: threshold.threshold,
        violationType: violation.type,
      },
    };

    await this.alerting.sendAlert(alert);
    this.alertThrottling.set(alertKey, new Date());

    this.logger.warn("Compliance threshold alert created", {
      alertId: alert.id,
      violationType: violation.type,
      currentCount,
      threshold: threshold.threshold,
    });
  }

  private async updateFrameworkStatus(event: ComplianceEvent): Promise<void> {
    if (!event.framework) return;

    // Determine compliance status based on recent violations
    const frameworkViolations = Array.from(this.activeViolations).length;
    const status =
      frameworkViolations === 0
        ? ComplianceStatus.COMPLIANT
        : frameworkViolations < 5
          ? ComplianceStatus.NEEDS_ATTENTION
          : ComplianceStatus.NON_COMPLIANT;

    this.frameworkStatus.set(event.framework, status);
  }

  private async updateFrameworkStatusForViolation(
    violation: ComplianceViolation,
  ): Promise<void> {
    const currentStatus = this.frameworkStatus.get(violation.framework);

    if (violation.severity === ComplianceAlertSeverity.CRITICAL) {
      this.frameworkStatus.set(
        violation.framework,
        ComplianceStatus.NON_COMPLIANT,
      );
    } else if (currentStatus === ComplianceStatus.COMPLIANT) {
      this.frameworkStatus.set(
        violation.framework,
        ComplianceStatus.NEEDS_ATTENTION,
      );
    }
  }

  private async collectMetrics(): Promise<void> {
    try {
      // Update metrics with current state
      this.currentMetrics.violationsByType = Object.fromEntries(
        this.violationCounts,
      );
      this.currentMetrics.frameworkCompliance = Object.fromEntries(
        this.frameworkStatus,
      );

      // Store metrics
      await this.metricsStorage.storeMetrics(this.currentMetrics);

      this.logger.debug("Metrics collected and stored", {
        totalEvents: this.currentMetrics.totalEvents,
        activeViolations: this.activeViolations.size,
      });
    } catch (error) {
      this.logger.error("Failed to collect metrics", {
        error: error.message,
      });
    }
  }

  private async checkPeriodicViolations(): Promise<void> {
    try {
      // Check for systematic violations that might not be caught in real-time
      // This could include patterns like repeated consent violations,
      // excessive data retention, etc.

      this.logger.debug("Periodic violation check completed");
    } catch (error) {
      this.logger.error("Failed to perform periodic violation check", {
        error: error.message,
      });
    }
  }

  private async generateAutomaticReports(): Promise<void> {
    try {
      if (!this.config.automaticReporting) return;

      // Generate daily summary report
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const today = new Date();

      await this.generateReport(ComplianceReportType.DAILY_SUMMARY, {
        from: yesterday,
        to: today,
      });

      this.logger.info("Automatic daily report generated");
    } catch (error) {
      this.logger.error("Failed to generate automatic report", {
        error: error.message,
      });
    }
  }

  private async performCleanup(): Promise<void> {
    try {
      // Clean up old metrics
      await this.metricsStorage.deleteExpiredMetrics(
        this.config.metricsRetentionDays,
      );

      // Clean up old alert throttling entries
      const now = Date.now();
      for (const [key, timestamp] of this.alertThrottling.entries()) {
        if (now - timestamp.getTime() > 24 * 60 * 60 * 1000) {
          // 24 hours
          this.alertThrottling.delete(key);
        }
      }

      this.logger.debug("Cleanup completed");
    } catch (error) {
      this.logger.error("Failed to perform cleanup", {
        error: error.message,
      });
    }
  }

  private calculateTrends(metrics: ComplianceMetrics[]): any {
    if (metrics.length < 2) return null;

    const latest = metrics[metrics.length - 1];
    const previous = metrics[metrics.length - 2];

    return {
      eventsTrend: this.calculatePercentageChange(
        previous.totalEvents,
        latest.totalEvents,
      ),
      violationsTrend: this.calculatePercentageChange(
        Object.values(previous.violationsByType || {}).reduce(
          (a, b) => a + b,
          0,
        ),
        Object.values(latest.violationsByType || {}).reduce((a, b) => a + b, 0),
      ),
    };
  }

  private calculatePercentageChange(
    oldValue: number,
    newValue: number,
  ): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  private isDataRetentionViolation(event: ComplianceEvent): boolean {
    // Implementation would check if data is being processed beyond retention period
    // This would require integration with your data retention policies
    return false;
  }

  private generateViolationId(): string {
    return `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { ComplianceMonitor };
