/**
 * IQ24.ai - Consent Management System
 *
 * Comprehensive consent management system supporting multiple regulatory frameworks
 * including granular consent tracking, withdrawal mechanisms, and audit trails.
 */

import { EventEmitter } from "events";
import { Logger } from "winston";
import {
  ConsentRecord,
  ConsentType,
  ConsentPurpose,
  ConsentStatus,
  DataRightsRequest,
  DataRightsType,
  ComplianceEvent,
  ComplianceEventType,
  RegulatoryFramework,
  ConsentMetrics,
  ConsentConfiguration,
  LegalBasis,
} from "./types";

export interface ConsentManagerOptions {
  logger: Logger;
  auditTrail: any; // Reference to audit trail system
  storageAdapter: ConsentStorageAdapter;
  notifications: NotificationService;
  encryption: EncryptionService;
  retention: RetentionService;
  configuration: ConsentConfiguration;
}

export interface ConsentStorageAdapter {
  saveConsent(consent: ConsentRecord): Promise<void>;
  getConsent(
    contactId: string,
    type: ConsentType,
  ): Promise<ConsentRecord | null>;
  getAllConsents(contactId: string): Promise<ConsentRecord[]>;
  updateConsent(
    consentId: string,
    updates: Partial<ConsentRecord>,
  ): Promise<void>;
  deleteConsent(consentId: string): Promise<void>;
  searchConsents(criteria: ConsentSearchCriteria): Promise<ConsentRecord[]>;
}

export interface NotificationService {
  sendConsentConfirmation(
    contact: ContactInfo,
    consent: ConsentRecord,
  ): Promise<void>;
  sendWithdrawalConfirmation(
    contact: ContactInfo,
    consent: ConsentRecord,
  ): Promise<void>;
  sendDataRightsResponse(
    request: DataRightsRequest,
    response: string,
  ): Promise<void>;
  sendExpirationNotice(
    contact: ContactInfo,
    consent: ConsentRecord,
  ): Promise<void>;
}

export interface EncryptionService {
  encrypt(data: any): Promise<string>;
  decrypt(encryptedData: string): Promise<any>;
  hash(data: string): string;
}

export interface RetentionService {
  scheduleRetention(consentId: string, expiryDate: Date): Promise<void>;
  processExpiredConsents(): Promise<void>;
  getRetentionSchedule(consentId: string): Promise<Date | null>;
}

export interface ConsentSearchCriteria {
  contactId?: string;
  type?: ConsentType;
  status?: ConsentStatus;
  purpose?: ConsentPurpose;
  framework?: RegulatoryFramework;
  dateRange?: { from: Date; to: Date };
  expiringBefore?: Date;
}

export interface ContactInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  jurisdiction?: string;
}

export class ConsentManager extends EventEmitter {
  private logger: Logger;
  private auditTrail: any;
  private storage: ConsentStorageAdapter;
  private notifications: NotificationService;
  private encryption: EncryptionService;
  private retention: RetentionService;
  private config: ConsentConfiguration;
  private consentCache: Map<string, ConsentRecord[]> = new Map();
  private metricsCollector: ConsentMetricsCollector;

  constructor(options: ConsentManagerOptions) {
    super();
    this.logger = options.logger;
    this.auditTrail = options.auditTrail;
    this.storage = options.storageAdapter;
    this.notifications = options.notifications;
    this.encryption = options.encryption;
    this.retention = options.retention;
    this.config = options.configuration;
    this.metricsCollector = new ConsentMetricsCollector();

    this.setupAutomaticProcessing();
  }

  /**
   * Record new consent from contact
   */
  async recordConsent(
    contactInfo: ContactInfo,
    consentType: ConsentType,
    purposes: ConsentPurpose[],
    framework: RegulatoryFramework,
    options: {
      legalBasis?: LegalBasis;
      source?: string;
      ipAddress?: string;
      userAgent?: string;
      doubleOptIn?: boolean;
      expiryDate?: Date;
      metadata?: Record<string, any>;
    } = {},
  ): Promise<ConsentRecord> {
    try {
      // Validate consent requirements for jurisdiction
      await this.validateConsentRequirements(
        contactInfo,
        consentType,
        framework,
      );

      // Create consent record
      const consent: ConsentRecord = {
        id: this.generateConsentId(),
        contactId: contactInfo.id,
        type: consentType,
        purposes,
        status: options.doubleOptIn
          ? ConsentStatus.PENDING_CONFIRMATION
          : ConsentStatus.GRANTED,
        framework,
        legalBasis:
          options.legalBasis ||
          this.determineLegalBasis(consentType, framework),
        grantedAt: new Date(),
        source: options.source || "direct",
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        expiryDate: options.expiryDate || this.calculateExpiryDate(framework),
        isDoubleOptIn: options.doubleOptIn || false,
        confirmationToken: options.doubleOptIn
          ? this.generateConfirmationToken()
          : undefined,
        metadata: await this.encryption.encrypt(options.metadata || {}),
        version: this.config.currentVersion,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store consent
      await this.storage.saveConsent(consent);

      // Update cache
      this.updateConsentCache(contactInfo.id, consent);

      // Schedule retention if needed
      if (consent.expiryDate) {
        await this.retention.scheduleRetention(consent.id, consent.expiryDate);
      }

      // Send confirmation if double opt-in
      if (options.doubleOptIn) {
        await this.notifications.sendConsentConfirmation(contactInfo, consent);
      }

      // Log audit event
      await this.auditTrail.logEvent({
        type: ComplianceEventType.CONSENT_GRANTED,
        contactId: contactInfo.id,
        consentId: consent.id,
        details: {
          type: consentType,
          purposes,
          framework,
          source: consent.source,
        },
        timestamp: new Date(),
        userId: "system",
      } as ComplianceEvent);

      // Update metrics
      this.metricsCollector.recordConsentEvent("granted", framework);

      // Emit event
      this.emit("consentGranted", consent, contactInfo);

      this.logger.info("Consent recorded successfully", {
        consentId: consent.id,
        contactId: contactInfo.id,
        type: consentType,
        framework,
      });

      return consent;
    } catch (error) {
      this.logger.error("Failed to record consent", {
        contactId: contactInfo.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Confirm double opt-in consent
   */
  async confirmConsent(confirmationToken: string): Promise<ConsentRecord> {
    try {
      // Find consent by confirmation token
      const consents = await this.storage.searchConsents({
        status: ConsentStatus.PENDING_CONFIRMATION,
      });

      const consent = consents.find(
        (c) => c.confirmationToken === confirmationToken,
      );
      if (!consent) {
        throw new Error("Invalid or expired confirmation token");
      }

      // Check expiration (typically 24-48 hours)
      const confirmationExpiry = new Date(consent.createdAt);
      confirmationExpiry.setHours(
        confirmationExpiry.getHours() + this.config.confirmationExpiryHours,
      );

      if (new Date() > confirmationExpiry) {
        throw new Error("Confirmation token has expired");
      }

      // Update consent status
      const updatedConsent = {
        ...consent,
        status: ConsentStatus.GRANTED,
        confirmedAt: new Date(),
        confirmationToken: undefined,
        updatedAt: new Date(),
      };

      await this.storage.updateConsent(consent.id, updatedConsent);

      // Update cache
      this.updateConsentCache(consent.contactId, updatedConsent);

      // Log audit event
      await this.auditTrail.logEvent({
        type: ComplianceEventType.CONSENT_CONFIRMED,
        contactId: consent.contactId,
        consentId: consent.id,
        timestamp: new Date(),
        userId: "system",
      } as ComplianceEvent);

      // Update metrics
      this.metricsCollector.recordConsentEvent("confirmed", consent.framework);

      // Emit event
      this.emit("consentConfirmed", updatedConsent);

      this.logger.info("Consent confirmed successfully", {
        consentId: consent.id,
        contactId: consent.contactId,
      });

      return updatedConsent;
    } catch (error) {
      this.logger.error("Failed to confirm consent", {
        token: confirmationToken,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(
    contactId: string,
    consentType: ConsentType,
    reason?: string,
    userId?: string,
  ): Promise<ConsentRecord> {
    try {
      // Get current consent
      const consent = await this.storage.getConsent(contactId, consentType);
      if (!consent) {
        throw new Error("Consent not found");
      }

      if (consent.status === ConsentStatus.WITHDRAWN) {
        return consent; // Already withdrawn
      }

      // Update consent status
      const updatedConsent = {
        ...consent,
        status: ConsentStatus.WITHDRAWN,
        withdrawnAt: new Date(),
        withdrawalReason: reason,
        updatedAt: new Date(),
      };

      await this.storage.updateConsent(consent.id, updatedConsent);

      // Update cache
      this.updateConsentCache(contactId, updatedConsent);

      // Send withdrawal confirmation
      const contactInfo = await this.getContactInfo(contactId);
      if (contactInfo) {
        await this.notifications.sendWithdrawalConfirmation(
          contactInfo,
          updatedConsent,
        );
      }

      // Log audit event
      await this.auditTrail.logEvent({
        type: ComplianceEventType.CONSENT_WITHDRAWN,
        contactId,
        consentId: consent.id,
        details: { reason },
        timestamp: new Date(),
        userId: userId || "system",
      } as ComplianceEvent);

      // Update metrics
      this.metricsCollector.recordConsentEvent("withdrawn", consent.framework);

      // Emit event
      this.emit("consentWithdrawn", updatedConsent);

      this.logger.info("Consent withdrawn successfully", {
        consentId: consent.id,
        contactId,
        reason,
      });

      return updatedConsent;
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
   * Process data rights request (GDPR Article 15, CCPA, etc.)
   */
  async processDataRightsRequest(request: DataRightsRequest): Promise<void> {
    try {
      this.logger.info("Processing data rights request", {
        requestId: request.id,
        type: request.type,
        contactId: request.contactId,
      });

      let response: string;

      switch (request.type) {
        case DataRightsType.ACCESS:
          response = await this.processAccessRequest(request);
          break;
        case DataRightsType.DELETION:
          response = await this.processDeletionRequest(request);
          break;
        case DataRightsType.RECTIFICATION:
          response = await this.processRectificationRequest(request);
          break;
        case DataRightsType.PORTABILITY:
          response = await this.processPortabilityRequest(request);
          break;
        case DataRightsType.RESTRICTION:
          response = await this.processRestrictionRequest(request);
          break;
        case DataRightsType.OBJECTION:
          response = await this.processObjectionRequest(request);
          break;
        default:
          throw new Error(
            `Unsupported data rights request type: ${request.type}`,
          );
      }

      // Send response to requester
      await this.notifications.sendDataRightsResponse(request, response);

      // Log audit event
      await this.auditTrail.logEvent({
        type: ComplianceEventType.DATA_RIGHTS_REQUEST_PROCESSED,
        contactId: request.contactId,
        details: {
          requestType: request.type,
          requestId: request.id,
        },
        timestamp: new Date(),
        userId: "system",
      } as ComplianceEvent);

      // Update metrics
      this.metricsCollector.recordDataRightsRequest(request.type);

      this.emit("dataRightsProcessed", request);
    } catch (error) {
      this.logger.error("Failed to process data rights request", {
        requestId: request.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Check if contact has valid consent for specific purpose
   */
  async hasValidConsent(
    contactId: string,
    consentType: ConsentType,
    purpose: ConsentPurpose,
  ): Promise<boolean> {
    try {
      // Check cache first
      const cachedConsents = this.consentCache.get(contactId);
      let consent: ConsentRecord | null = null;

      if (cachedConsents) {
        consent = cachedConsents.find((c) => c.type === consentType) || null;
      } else {
        consent = await this.storage.getConsent(contactId, consentType);
      }

      if (!consent) {
        return false;
      }

      // Check consent status
      if (consent.status !== ConsentStatus.GRANTED) {
        return false;
      }

      // Check if purpose is included
      if (!consent.purposes.includes(purpose)) {
        return false;
      }

      // Check expiry
      if (consent.expiryDate && new Date() > consent.expiryDate) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error("Failed to check consent validity", {
        contactId,
        consentType,
        purpose,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Get consent preferences for contact
   */
  async getConsentPreferences(contactId: string): Promise<ConsentRecord[]> {
    try {
      // Check cache first
      const cachedConsents = this.consentCache.get(contactId);
      if (cachedConsents) {
        return cachedConsents;
      }

      // Load from storage
      const consents = await this.storage.getAllConsents(contactId);

      // Update cache
      this.consentCache.set(contactId, consents);

      return consents;
    } catch (error) {
      this.logger.error("Failed to get consent preferences", {
        contactId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get consent metrics and analytics
   */
  async getConsentMetrics(timeRange?: {
    from: Date;
    to: Date;
  }): Promise<ConsentMetrics> {
    return this.metricsCollector.getMetrics(timeRange);
  }

  /**
   * Process expired consents
   */
  async processExpiredConsents(): Promise<void> {
    try {
      this.logger.info("Processing expired consents");

      // Get expired consents
      const expiredConsents = await this.storage.searchConsents({
        status: ConsentStatus.GRANTED,
        expiringBefore: new Date(),
      });

      for (const consent of expiredConsents) {
        // Update status
        await this.storage.updateConsent(consent.id, {
          status: ConsentStatus.EXPIRED,
          expiredAt: new Date(),
          updatedAt: new Date(),
        });

        // Clear from cache
        this.clearConsentCache(consent.contactId);

        // Log audit event
        await this.auditTrail.logEvent({
          type: ComplianceEventType.CONSENT_EXPIRED,
          contactId: consent.contactId,
          consentId: consent.id,
          timestamp: new Date(),
          userId: "system",
        } as ComplianceEvent);

        // Send expiration notice if required
        const contactInfo = await this.getContactInfo(consent.contactId);
        if (contactInfo && this.config.sendExpirationNotices) {
          await this.notifications.sendExpirationNotice(contactInfo, consent);
        }
      }

      this.logger.info(`Processed ${expiredConsents.length} expired consents`);
    } catch (error) {
      this.logger.error("Failed to process expired consents", {
        error: error.message,
      });
      throw error;
    }
  }

  // Private helper methods

  private async validateConsentRequirements(
    contactInfo: ContactInfo,
    consentType: ConsentType,
    framework: RegulatoryFramework,
  ): Promise<void> {
    // Validate based on framework requirements
    if (framework === RegulatoryFramework.GDPR && !contactInfo.jurisdiction) {
      throw new Error("Jurisdiction required for GDPR consent");
    }

    if (
      consentType === ConsentType.MARKETING &&
      framework === RegulatoryFramework.GDPR &&
      !this.isExplicitConsentRequired(contactInfo.jurisdiction)
    ) {
      throw new Error("Explicit consent required for marketing under GDPR");
    }
  }

  private determineLegalBasis(
    consentType: ConsentType,
    framework: RegulatoryFramework,
  ): LegalBasis {
    if (framework === RegulatoryFramework.GDPR) {
      switch (consentType) {
        case ConsentType.MARKETING:
          return LegalBasis.CONSENT;
        case ConsentType.SERVICE:
          return LegalBasis.CONTRACT;
        case ConsentType.ANALYTICS:
          return LegalBasis.LEGITIMATE_INTEREST;
        default:
          return LegalBasis.CONSENT;
      }
    }
    return LegalBasis.CONSENT;
  }

  private calculateExpiryDate(
    framework: RegulatoryFramework,
  ): Date | undefined {
    const expiry = new Date();

    switch (framework) {
      case RegulatoryFramework.GDPR:
        expiry.setFullYear(expiry.getFullYear() + 2); // 2 years for GDPR
        break;
      case RegulatoryFramework.CCPA:
        return undefined; // No automatic expiry for CCPA
      case RegulatoryFramework.CAN_SPAM:
        return undefined; // No automatic expiry
      default:
        expiry.setFullYear(expiry.getFullYear() + 1); // Default 1 year
    }

    return expiry;
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConfirmationToken(): string {
    return Math.random().toString(36).substr(2, 32);
  }

  private updateConsentCache(contactId: string, consent: ConsentRecord): void {
    const cachedConsents = this.consentCache.get(contactId) || [];
    const index = cachedConsents.findIndex((c) => c.id === consent.id);

    if (index >= 0) {
      cachedConsents[index] = consent;
    } else {
      cachedConsents.push(consent);
    }

    this.consentCache.set(contactId, cachedConsents);
  }

  private clearConsentCache(contactId: string): void {
    this.consentCache.delete(contactId);
  }

  private isExplicitConsentRequired(jurisdiction?: string): boolean {
    // EU jurisdictions require explicit consent for marketing
    const euCountries = [
      "AT",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "FI",
      "FR",
      "DE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "ES",
      "SE",
    ];
    return jurisdiction ? euCountries.includes(jurisdiction) : false;
  }

  private async getContactInfo(contactId: string): Promise<ContactInfo | null> {
    // This would typically fetch from your main contact database
    // For now, return null - implement based on your data layer
    return null;
  }

  private setupAutomaticProcessing(): void {
    // Set up periodic processing of expired consents
    setInterval(async () => {
      try {
        await this.processExpiredConsents();
        await this.retention.processExpiredConsents();
      } catch (error) {
        this.logger.error("Automatic consent processing failed", {
          error: error.message,
        });
      }
    }, this.config.processingIntervalMs);
  }

  // Data rights request processors

  private async processAccessRequest(
    request: DataRightsRequest,
  ): Promise<string> {
    // Implementation for data access request (GDPR Article 15)
    const consents = await this.storage.getAllConsents(request.contactId);
    const data = {
      consents: consents.map((c) => ({
        type: c.type,
        purposes: c.purposes,
        status: c.status,
        grantedAt: c.grantedAt,
        framework: c.framework,
      })),
    };
    return JSON.stringify(data, null, 2);
  }

  private async processDeletionRequest(
    request: DataRightsRequest,
  ): Promise<string> {
    // Implementation for right to erasure (GDPR Article 17)
    const consents = await this.storage.getAllConsents(request.contactId);

    for (const consent of consents) {
      await this.storage.deleteConsent(consent.id);
    }

    this.clearConsentCache(request.contactId);

    return `All consent data for contact ${request.contactId} has been deleted.`;
  }

  private async processRectificationRequest(
    request: DataRightsRequest,
  ): Promise<string> {
    // Implementation for right to rectification (GDPR Article 16)
    return "Rectification request processed. Please provide corrected information.";
  }

  private async processPortabilityRequest(
    request: DataRightsRequest,
  ): Promise<string> {
    // Implementation for data portability (GDPR Article 20)
    return await this.processAccessRequest(request);
  }

  private async processRestrictionRequest(
    request: DataRightsRequest,
  ): Promise<string> {
    // Implementation for right to restriction (GDPR Article 18)
    const consents = await this.storage.getAllConsents(request.contactId);

    for (const consent of consents) {
      await this.storage.updateConsent(consent.id, {
        status: ConsentStatus.RESTRICTED,
        updatedAt: new Date(),
      });
    }

    return "Data processing has been restricted for your account.";
  }

  private async processObjectionRequest(
    request: DataRightsRequest,
  ): Promise<string> {
    // Implementation for right to object (GDPR Article 21)
    return await this.withdrawConsent(
      request.contactId,
      ConsentType.MARKETING,
      "User objection",
    );
  }
}

/**
 * Consent metrics collector
 */
class ConsentMetricsCollector {
  private metrics: Map<string, number> = new Map();
  private timeSeriesData: Array<{
    timestamp: Date;
    event: string;
    framework: string;
  }> = [];

  recordConsentEvent(event: string, framework: RegulatoryFramework): void {
    const key = `${event}_${framework}`;
    this.metrics.set(key, (this.metrics.get(key) || 0) + 1);
    this.timeSeriesData.push({ timestamp: new Date(), event, framework });
  }

  recordDataRightsRequest(type: DataRightsType): void {
    const key = `data_rights_${type}`;
    this.metrics.set(key, (this.metrics.get(key) || 0) + 1);
  }

  getMetrics(timeRange?: { from: Date; to: Date }): ConsentMetrics {
    let data = this.timeSeriesData;

    if (timeRange) {
      data = data.filter(
        (d) => d.timestamp >= timeRange.from && d.timestamp <= timeRange.to,
      );
    }

    return {
      totalConsents: data.filter((d) => d.event === "granted").length,
      totalWithdrawals: data.filter((d) => d.event === "withdrawn").length,
      totalConfirmations: data.filter((d) => d.event === "confirmed").length,
      consentsByFramework: this.groupByFramework(data),
      dataRightsRequests: this.getDataRightsMetrics(),
      timeRange: timeRange || { from: new Date(0), to: new Date() },
    };
  }

  private groupByFramework(
    data: Array<{ event: string; framework: string }>,
  ): Record<string, number> {
    const result: Record<string, number> = {};

    for (const item of data) {
      if (item.event === "granted") {
        result[item.framework] = (result[item.framework] || 0) + 1;
      }
    }

    return result;
  }

  private getDataRightsMetrics(): Record<string, number> {
    const result: Record<string, number> = {};

    for (const [key, value] of this.metrics.entries()) {
      if (key.startsWith("data_rights_")) {
        const type = key.replace("data_rights_", "");
        result[type] = value;
      }
    }

    return result;
  }
}

export { ConsentManager, ConsentMetricsCollector };
