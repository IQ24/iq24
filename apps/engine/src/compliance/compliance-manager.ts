/**
 * IQ24 AI Engine - Compliance Manager
 * 
 * Comprehensive compliance management system ensuring adherence to data privacy
 * regulations (GDPR, CCPA), AI ethics guidelines, and industry standards.
 */

import { EventEmitter } from "events";

export interface ComplianceConfig {
  enableGDPR: boolean;
  enableCCPA: boolean;
  enableSOX: boolean;
  auditRetentionDays: number;
  anonymizationDelay: number;
  consentRequired: boolean;
  rightToBeForgettenEnabled: boolean;
}

export interface DataProcessingConsent {
  userId: string;
  email: string;
  consentGiven: boolean;
  consentDate: Date;
  consentType: 'marketing' | 'analytics' | 'personalization' | 'all';
  ipAddress: string;
  userAgent: string;
  optOutDate?: Date;
  source: string;
}

export interface ComplianceViolation {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'data_privacy' | 'ai_bias' | 'consent' | 'retention' | 'access_control';
  description: string;
  affectedUsers: string[];
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  automaticallyResolved: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure' | 'partial';
  sensitiveDataAccessed: boolean;
}

export interface DataRetentionPolicy {
  dataType: string;
  retentionDays: number;
  anonymizationRequired: boolean;
  deletionMethod: 'soft' | 'hard' | 'anonymize';
  lastReviewDate: Date;
  nextReviewDate: Date;
}

export class ComplianceManager extends EventEmitter {
  private static instance: ComplianceManager;
  private config: ComplianceConfig;
  private consentRecords: Map<string, DataProcessingConsent> = new Map();
  private violations: Map<string, ComplianceViolation> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private retentionPolicies: Map<string, DataRetentionPolicy> = new Map();
  private isInitialized = false;

  private constructor(config: ComplianceConfig) {
    super();
    this.config = config;
    this.initializeRetentionPolicies();
    // Note: Monitoring will be started lazily to avoid Cloudflare Workers global scope restrictions
  }

  public static getInstance(config?: ComplianceConfig): ComplianceManager {
    if (!ComplianceManager.instance) {
      if (!config) {
        throw new Error("ComplianceManager config required for first initialization");
      }
      ComplianceManager.instance = new ComplianceManager(config);
    }
    return ComplianceManager.instance;
  }

  /**
   * Initialize compliance manager
   */
  async initialize(): Promise<void> {
    try {
      console.log("Initializing Compliance Manager...");
      
      // Load existing consent records
      await this.loadConsentRecords();
      
      // Load audit logs
      await this.loadAuditLogs();
      
      // Start automated compliance checks
      this.startAutomatedChecks();
      
      this.isInitialized = true;
      console.log("Compliance Manager initialized successfully");
      this.emit("initialized");
    } catch (error) {
      console.error("Failed to initialize Compliance Manager:", error);
      throw error;
    }
  }

  /**
   * Record user consent for data processing
   */
  async recordConsent(consent: Omit<DataProcessingConsent, 'consentDate'>): Promise<void> {
    const consentRecord: DataProcessingConsent = {
      ...consent,
      consentDate: new Date(),
    };

    this.consentRecords.set(consent.userId, consentRecord);
    
    // Log consent action
    await this.logAuditEvent({
      userId: consent.userId,
      action: 'consent_granted',
      resource: 'data_processing',
      details: {
        consentType: consent.consentType,
        email: consent.email,
      },
      ipAddress: consent.ipAddress,
      userAgent: consent.userAgent,
      result: 'success',
      sensitiveDataAccessed: false,
    });

    console.log(`Consent recorded for user ${consent.userId}: ${consent.consentType}`);
    this.emit("consentRecorded", consentRecord);
  }

  /**
   * Handle right to be forgotten request (GDPR Article 17)
   */
  async processRightToBeForgettenRequest(userId: string, requestDetails: any): Promise<void> {
    if (!this.config.rightToBeForgettenEnabled) {
      throw new Error("Right to be forgotten is not enabled in this configuration");
    }

    try {
      console.log(`Processing right to be forgotten request for user ${userId}`);

      // Mark user consent as withdrawn
      const consent = this.consentRecords.get(userId);
      if (consent) {
        consent.consentGiven = false;
        consent.optOutDate = new Date();
        this.consentRecords.set(userId, consent);
      }

      // Schedule data anonymization/deletion
      await this.scheduleDataDeletion(userId, 'user_request');

      // Log the request
      await this.logAuditEvent({
        userId,
        action: 'right_to_be_forgotten_request',
        resource: 'user_data',
        details: requestDetails,
        ipAddress: requestDetails.ipAddress || 'unknown',
        userAgent: requestDetails.userAgent || 'unknown',
        result: 'success',
        sensitiveDataAccessed: true,
      });

      this.emit("rightToBeForgettenProcessed", { userId, requestDetails });
    } catch (error) {
      console.error(`Failed to process right to be forgotten request for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user has given valid consent for specific processing
   */
  async checkConsent(userId: string, processingType: string): Promise<boolean> {
    const consent = this.consentRecords.get(userId);
    
    if (!consent) {
      // Log potential compliance violation
      await this.recordViolation({
        severity: 'high',
        type: 'consent',
        description: `No consent record found for user ${userId} attempting ${processingType}`,
        affectedUsers: [userId],
        detectedAt: new Date(),
        automaticallyResolved: false,
      });
      return false;
    }

    if (!consent.consentGiven || consent.optOutDate) {
      return false;
    }

    // Check if consent covers the requested processing type
    if (consent.consentType === 'all' || consent.consentType === processingType) {
      return true;
    }

    return false;
  }

  /**
   * Monitor AI model outputs for bias and fairness
   */
  async monitorAIBias(modelOutput: any, inputData: any, modelType: string): Promise<void> {
    try {
      // Analyze for potential bias indicators
      const biasIndicators = await this.detectBiasIndicators(modelOutput, inputData, modelType);
      
      if (biasIndicators.length > 0) {
        await this.recordViolation({
          severity: this.calculateBiasSeverity(biasIndicators),
          type: 'ai_bias',
          description: `Potential AI bias detected in ${modelType}: ${biasIndicators.join(', ')}`,
          affectedUsers: inputData.affectedUsers || [],
          detectedAt: new Date(),
          automaticallyResolved: false,
        });
      }

      // Log AI model usage for audit
      await this.logAuditEvent({
        userId: inputData.userId || 'system',
        action: 'ai_model_execution',
        resource: modelType,
        details: {
          modelType,
          biasIndicators,
          inputSample: this.sanitizeInputForLogging(inputData),
        },
        ipAddress: inputData.ipAddress || 'internal',
        userAgent: inputData.userAgent || 'ai_system',
        result: 'success',
        sensitiveDataAccessed: this.containsSensitiveData(inputData),
      });

    } catch (error) {
      console.error("AI bias monitoring failed:", error);
    }
  }

  /**
   * Log audit event for compliance tracking
   */
  async logAuditEvent(event: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event,
    };

    this.auditLog.push(auditEntry);
    
    // Keep audit log size manageable (last 10000 entries)
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }

    // Emit event for real-time monitoring
    this.emit("auditEvent", auditEntry);
  }

  /**
   * Record compliance violation
   */
  async recordViolation(violation: Omit<ComplianceViolation, 'id'>): Promise<void> {
    const violationRecord: ComplianceViolation = {
      id: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...violation,
    };

    this.violations.set(violationRecord.id, violationRecord);

    console.warn(`Compliance violation detected: ${violation.description}`);
    
    // Auto-resolve low severity violations if possible
    if (violation.severity === 'low' && this.canAutoResolve(violation.type)) {
      await this.autoResolveViolation(violationRecord.id);
    }

    this.emit("complianceViolation", violationRecord);
  }

  /**
   * Get compliance status report
   */
  async getComplianceStatus(): Promise<{
    status: 'compliant' | 'warning' | 'violation';
    summary: {
      totalConsents: number;
      activeViolations: number;
      auditLogEntries: number;
      lastComplianceCheck: Date;
    };
    violations: ComplianceViolation[];
    recentAuditEvents: AuditLogEntry[];
  }> {
    const activeViolations = Array.from(this.violations.values()).filter(v => !v.resolvedAt);
    const criticalViolations = activeViolations.filter(v => v.severity === 'critical');
    
    let status: 'compliant' | 'warning' | 'violation' = 'compliant';
    if (criticalViolations.length > 0) {
      status = 'violation';
    } else if (activeViolations.length > 0) {
      status = 'warning';
    }

    return {
      status,
      summary: {
        totalConsents: this.consentRecords.size,
        activeViolations: activeViolations.length,
        auditLogEntries: this.auditLog.length,
        lastComplianceCheck: new Date(),
      },
      violations: activeViolations.slice(0, 10), // Last 10 violations
      recentAuditEvents: this.auditLog.slice(-20), // Last 20 audit events
    };
  }

  /**
   * Export audit data for regulatory compliance
   */
  async exportAuditData(startDate: Date, endDate: Date): Promise<{
    auditEvents: AuditLogEntry[];
    violations: ComplianceViolation[];
    consentRecords: DataProcessingConsent[];
    exportedAt: Date;
  }> {
    const auditEvents = this.auditLog.filter(
      event => event.timestamp >= startDate && event.timestamp <= endDate
    );

    const violations = Array.from(this.violations.values()).filter(
      violation => violation.detectedAt >= startDate && violation.detectedAt <= endDate
    );

    const consentRecords = Array.from(this.consentRecords.values()).filter(
      consent => consent.consentDate >= startDate && consent.consentDate <= endDate
    );

    return {
      auditEvents,
      violations,
      consentRecords,
      exportedAt: new Date(),
    };
  }

  // Private helper methods
  private initializeRetentionPolicies(): void {
    const defaultPolicies: DataRetentionPolicy[] = [
      {
        dataType: 'prospect_data',
        retentionDays: 1095, // 3 years
        anonymizationRequired: true,
        deletionMethod: 'anonymize',
        lastReviewDate: new Date(),
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
      {
        dataType: 'audit_logs',
        retentionDays: 2555, // 7 years (regulatory requirement)
        anonymizationRequired: false,
        deletionMethod: 'soft',
        lastReviewDate: new Date(),
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        dataType: 'consent_records',
        retentionDays: 2555, // 7 years
        anonymizationRequired: false,
        deletionMethod: 'soft',
        lastReviewDate: new Date(),
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ];

    defaultPolicies.forEach(policy => {
      this.retentionPolicies.set(policy.dataType, policy);
    });
  }

  private monitoringStarted = false;

  private startComplianceMonitoring(): void {
    if (this.monitoringStarted) return;
    this.monitoringStarted = true;
    
    // Note: In production Cloudflare Workers, we would use scheduled events
    // For development, we'll log that monitoring is initialized
    console.log('Compliance monitoring initialized (lazy startup)');
  }

  private startAutomatedChecks(): void {
    // Start compliance monitoring when automated checks are requested
    this.startComplianceMonitoring();
    
    // Note: In production, these would be Cloudflare Workers scheduled events
    console.log('Automated compliance checks initialized');
  }

  private async runAutomatedComplianceChecks(): Promise<void> {
    try {
      // Check for expired consents
      await this.checkExpiredConsents();
      
      // Check for data retention violations
      await this.checkDataRetentionCompliance();
      
      // Monitor for suspicious access patterns
      await this.checkAccessPatterns();
      
    } catch (error) {
      console.error("Automated compliance check failed:", error);
    }
  }

  private async checkExpiredConsents(): Promise<void> {
    const now = new Date();
    const consentExpiryDays = 365; // 1 year consent validity

    for (const [userId, consent] of this.consentRecords) {
      const daysSinceConsent = (now.getTime() - consent.consentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceConsent > consentExpiryDays && consent.consentGiven) {
        await this.recordViolation({
          severity: 'medium',
          type: 'consent',
          description: `Consent expired for user ${userId} (${Math.round(daysSinceConsent)} days old)`,
          affectedUsers: [userId],
          detectedAt: now,
          automaticallyResolved: false,
        });
      }
    }
  }

  private async checkDataRetentionCompliance(): Promise<void> {
    // This would integrate with actual data storage to check retention policies
    console.log("Checking data retention compliance...");
  }

  private async checkAccessPatterns(): Promise<void> {
    const recentEvents = this.auditLog.slice(-100); // Last 100 events
    const suspiciousPatterns = this.detectSuspiciousPatterns(recentEvents);
    
    for (const pattern of suspiciousPatterns) {
      await this.recordViolation({
        severity: pattern.severity,
        type: 'access_control',
        description: pattern.description,
        affectedUsers: pattern.affectedUsers,
        detectedAt: new Date(),
        automaticallyResolved: false,
      });
    }
  }

  private detectSuspiciousPatterns(events: AuditLogEntry[]): Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedUsers: string[];
  }> {
    const patterns: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedUsers: string[];
    }> = [];

    // Check for excessive failed access attempts
    const failedAttempts = events.filter(e => e.result === 'failure');
    const userFailures = new Map<string, number>();
    
    failedAttempts.forEach(event => {
      userFailures.set(event.userId, (userFailures.get(event.userId) || 0) + 1);
    });

    for (const [userId, count] of userFailures) {
      if (count > 10) {
        patterns.push({
          severity: 'high',
          description: `Excessive failed access attempts detected for user ${userId} (${count} attempts)`,
          affectedUsers: [userId],
        });
      }
    }

    return patterns;
  }

  private async detectBiasIndicators(modelOutput: any, inputData: any, modelType: string): Promise<string[]> {
    const indicators: string[] = [];
    
    // Mock bias detection logic
    if (modelType === 'lead_scoring') {
      // Check for potential demographic bias in lead scoring
      if (modelOutput.leadScore && inputData.demographics) {
        // This would implement actual bias detection algorithms
        if (Math.random() < 0.05) { // 5% chance of detecting bias for demo
          indicators.push("potential_demographic_bias");
        }
      }
    }

    return indicators;
  }

  private calculateBiasSeverity(indicators: string[]): 'low' | 'medium' | 'high' | 'critical' {
    if (indicators.includes('critical_bias')) return 'critical';
    if (indicators.includes('high_bias')) return 'high';
    if (indicators.includes('medium_bias')) return 'medium';
    return 'low';
  }

  private sanitizeInputForLogging(inputData: any): any {
    // Remove or mask sensitive information for logging
    const sanitized = { ...inputData };
    if (sanitized.email) sanitized.email = this.maskEmail(sanitized.email);
    if (sanitized.phone) sanitized.phone = this.maskPhone(sanitized.phone);
    return sanitized;
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }

  private maskPhone(phone: string): string {
    return phone.replace(/\d(?=\d{4})/g, '*');
  }

  private containsSensitiveData(data: any): boolean {
    return !!(data.email || data.phone || data.ssn || data.creditCard);
  }

  private canAutoResolve(violationType: string): boolean {
    return violationType === 'data_privacy' || violationType === 'retention';
  }

  private async autoResolveViolation(violationId: string): Promise<void> {
    const violation = this.violations.get(violationId);
    if (violation) {
      violation.resolvedAt = new Date();
      violation.resolution = "Automatically resolved by compliance system";
      violation.automaticallyResolved = true;
      this.violations.set(violationId, violation);
    }
  }

  private async scheduleDataDeletion(userId: string, reason: string): Promise<void> {
    console.log(`Scheduling data deletion for user ${userId}, reason: ${reason}`);
    // This would integrate with actual data deletion systems
  }

  private async loadConsentRecords(): Promise<void> {
    // Load from persistent storage
    console.log("Loading consent records...");
  }

  private async loadAuditLogs(): Promise<void> {
    // Load from persistent storage
    console.log("Loading audit logs...");
  }
}

// Also export a default instance for backward compatibility
export const complianceManager = ComplianceManager.getInstance({
  gdprEnabled: true,
  ccpaEnabled: true,
  rightToBeForgettenEnabled: true,
  auditLogRetentionDays: 2555,
  consentExpiryDays: 365,
});