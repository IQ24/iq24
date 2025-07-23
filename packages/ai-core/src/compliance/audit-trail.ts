import {
  AuditEventType as AuditEventSchemaType,
  AuditEventType,
  ComplianceConfigType,
} from "./types";
import { logger } from "../utils/logger";
import crypto from "crypto";

/**
 * Audit Trail System
 * Maintains immutable, cryptographically secure audit logs for compliance
 * Implements blockchain-like integrity verification
 */
export class AuditTrail {
  private config: ComplianceConfigType;
  private eventQueue: AuditEventSchemaType[] = [];
  private lastEventHash: string | null = null;
  private isInitialized = false;
  private flushInterval: NodeJS.Timeout | null = null;
  private compressionEnabled = true;

  constructor(config: ComplianceConfigType) {
    this.config = config;
  }

  /**
   * Initialize the audit trail system
   */
  async initialize(): Promise<void> {
    try {
      logger.info("Initializing Audit Trail system");

      // Load the last event hash from storage
      await this.loadLastEventHash();

      // Start automatic flushing
      this.startAutoFlush();

      // Verify chain integrity on startup
      await this.verifyChainIntegrity();

      this.isInitialized = true;
      logger.info("Audit Trail system initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Audit Trail system", { error });
      throw error;
    }
  }

  /**
   * Log an audit event
   */
  async logEvent(eventData: Partial<AuditEventSchemaType>): Promise<string> {
    if (!this.isInitialized) {
      throw new Error("Audit Trail not initialized");
    }

    const event: AuditEventSchemaType = {
      id: this.generateEventId(),
      timestamp: new Date(),
      eventType: eventData.eventType || "DATA_ACCESSED",
      userId: eventData.userId || "system",
      prospectId: eventData.prospectId,
      campaignId: eventData.campaignId,
      details: eventData.details || {},
      ipAddress: eventData.ipAddress || this.getSystemIP(),
      userAgent: eventData.userAgent || "IQ24-System/1.0",
      regulations: eventData.regulations || this.config.enabledRegulations,
      immutableHash: "", // Will be calculated
      previousEventHash: this.lastEventHash,
    };

    // Calculate immutable hash
    event.immutableHash = this.calculateEventHash(event);

    // Update last event hash for chain integrity
    this.lastEventHash = event.immutableHash;

    // Add to queue for batch processing
    this.eventQueue.push(event);

    // Immediate flush for critical events
    if (this.isCriticalEvent(event)) {
      await this.flush();
    }

    logger.debug("Audit event logged", {
      eventId: event.id,
      eventType: event.eventType,
      userId: event.userId,
    });

    return event.id;
  }

  /**
   * Calculate cryptographic hash for an event
   */
  private calculateEventHash(event: AuditEventSchemaType): string {
    // Create deterministic string representation for hashing
    const hashData = {
      id: event.id,
      timestamp: event.timestamp.toISOString(),
      eventType: event.eventType,
      userId: event.userId,
      prospectId: event.prospectId,
      campaignId: event.campaignId,
      details: this.normalizeObject(event.details),
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      regulations: [...event.regulations].sort(),
      previousEventHash: event.previousEventHash,
    };

    const hashString = JSON.stringify(hashData, Object.keys(hashData).sort());
    return crypto.createHash("sha256").update(hashString).digest("hex");
  }

  /**
   * Normalize object for consistent hashing
   */
  private normalizeObject(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== "object") return obj;
    if (Array.isArray(obj))
      return obj.map((item) => this.normalizeObject(item)).sort();

    const normalized: any = {};
    const sortedKeys = Object.keys(obj).sort();

    for (const key of sortedKeys) {
      normalized[key] = this.normalizeObject(obj[key]);
    }

    return normalized;
  }

  /**
   * Check if event is critical and requires immediate flushing
   */
  private isCriticalEvent(event: AuditEventSchemaType): boolean {
    const criticalEvents: AuditEventType[] = [
      "COMPLIANCE_VIOLATION",
      "DATA_DELETED",
      "CONSENT_WITHDRAWN",
      "MESSAGE_BLOCKED",
    ];

    return criticalEvents.includes(event.eventType);
  }

  /**
   * Start automatic flushing of events
   */
  private startAutoFlush(): void {
    this.flushInterval = setInterval(async () => {
      if (this.eventQueue.length > 0) {
        await this.flush();
      }
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Flush queued events to persistent storage
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real implementation, this would write to a database
      // with proper transaction handling and replication
      await this.persistEvents(eventsToFlush);

      logger.debug(`Flushed ${eventsToFlush.length} audit events`);
    } catch (error) {
      // Re-queue events on failure
      this.eventQueue.unshift(...eventsToFlush);
      logger.error("Failed to flush audit events", {
        error,
        eventCount: eventsToFlush.length,
      });
      throw error;
    }
  }

  /**
   * Persist events to storage
   */
  private async persistEvents(events: AuditEventSchemaType[]): Promise<void> {
    // This would typically use a database with ACID properties
    // For compliance, consider using immutable storage solutions

    for (const event of events) {
      // Simulate database write
      await this.writeEventToStorage(event);

      // Update metrics
      this.updateMetrics(event);
    }
  }

  /**
   * Write individual event to storage
   */
  private async writeEventToStorage(
    event: AuditEventSchemaType,
  ): Promise<void> {
    // In production, this would write to:
    // - Primary database (PostgreSQL/Supabase)
    // - Backup storage (S3/Cloud Storage)
    // - Compliance archive (immutable storage)

    logger.debug("Persisting audit event", { eventId: event.id });
  }

  /**
   * Update audit metrics
   */
  private updateMetrics(event: AuditEventSchemaType): void {
    // Track metrics for monitoring and alerting
    // This would typically update time-series metrics
  }

  /**
   * Verify chain integrity
   */
  async verifyChainIntegrity(fromDate?: Date, toDate?: Date): Promise<boolean> {
    try {
      logger.info("Verifying audit trail chain integrity");

      const events = await this.getEventsForVerification(fromDate, toDate);

      if (events.length === 0) {
        logger.info("No events to verify");
        return true;
      }

      let previousHash: string | null = null;
      let corruptedEvents = 0;

      for (const event of events) {
        // Verify hash integrity
        const expectedHash = this.calculateEventHash({
          ...event,
          immutableHash: "", // Remove hash for recalculation
        });

        if (event.immutableHash !== expectedHash) {
          logger.error("Hash mismatch detected", {
            eventId: event.id,
            expected: expectedHash,
            actual: event.immutableHash,
          });
          corruptedEvents++;
        }

        // Verify chain linkage
        if (previousHash !== null && event.previousEventHash !== previousHash) {
          logger.error("Chain linkage broken", {
            eventId: event.id,
            expectedPrevious: previousHash,
            actualPrevious: event.previousEventHash,
          });
          corruptedEvents++;
        }

        previousHash = event.immutableHash;
      }

      const isIntact = corruptedEvents === 0;

      logger.info("Chain integrity verification completed", {
        totalEvents: events.length,
        corruptedEvents,
        isIntact,
      });

      if (!isIntact) {
        // Create critical alert for chain corruption
        await this.handleChainCorruption(corruptedEvents, events.length);
      }

      return isIntact;
    } catch (error) {
      logger.error("Chain integrity verification failed", { error });
      return false;
    }
  }

  /**
   * Get events for verification
   */
  private async getEventsForVerification(
    fromDate?: Date,
    toDate?: Date,
  ): Promise<AuditEventSchemaType[]> {
    // This would query the database for events in the specified range
    // For now, return empty array as we don't have persistent storage implemented
    return [];
  }

  /**
   * Handle chain corruption detection
   */
  private async handleChainCorruption(
    corruptedCount: number,
    totalCount: number,
  ): Promise<void> {
    const corruptionRatio = corruptedCount / totalCount;

    logger.error("Audit trail corruption detected", {
      corruptedCount,
      totalCount,
      corruptionRatio,
    });

    // This would trigger critical alerts and potentially initiate
    // emergency procedures for compliance breach response
  }

  /**
   * Query audit events with filters
   */
  async queryEvents(filters: {
    eventType?: AuditEventType[];
    userId?: string;
    prospectId?: string;
    campaignId?: string;
    fromDate?: Date;
    toDate?: Date;
    regulations?: string[];
    limit?: number;
    offset?: number;
  }): Promise<AuditEventSchemaType[]> {
    // This would query the database with the provided filters
    // For now, return empty array
    return [];
  }

  /**
   * Export audit trail for compliance reporting
   */
  async exportAuditTrail(
    format: "JSON" | "CSV" | "XML" = "JSON",
    filters?: any,
  ): Promise<string> {
    const events = await this.queryEvents(filters || {});

    switch (format) {
      case "JSON":
        return JSON.stringify(events, null, 2);
      case "CSV":
        return this.convertToCSV(events);
      case "XML":
        return this.convertToXML(events);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Convert events to CSV format
   */
  private convertToCSV(events: AuditEventSchemaType[]): string {
    if (events.length === 0) return "";

    const headers = [
      "id",
      "timestamp",
      "eventType",
      "userId",
      "prospectId",
      "campaignId",
      "ipAddress",
      "userAgent",
      "regulations",
      "immutableHash",
    ];

    const csvRows = [headers.join(",")];

    for (const event of events) {
      const row = headers.map((header) => {
        let value = (event as any)[header];

        if (Array.isArray(value)) {
          value = value.join(";");
        } else if (typeof value === "object") {
          value = JSON.stringify(value);
        }

        // Escape CSV values
        return `"${String(value || "").replace(/"/g, '""')}"`;
      });

      csvRows.push(row.join(","));
    }

    return csvRows.join("\n");
  }

  /**
   * Convert events to XML format
   */
  private convertToXML(events: AuditEventSchemaType[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<audit_trail>\n';

    for (const event of events) {
      xml += "  <event>\n";
      xml += `    <id>${this.escapeXML(event.id)}</id>\n`;
      xml += `    <timestamp>${event.timestamp.toISOString()}</timestamp>\n`;
      xml += `    <eventType>${this.escapeXML(event.eventType)}</eventType>\n`;
      xml += `    <userId>${this.escapeXML(event.userId)}</userId>\n`;

      if (event.prospectId) {
        xml += `    <prospectId>${this.escapeXML(event.prospectId)}</prospectId>\n`;
      }

      if (event.campaignId) {
        xml += `    <campaignId>${this.escapeXML(event.campaignId)}</campaignId>\n`;
      }

      xml += `    <ipAddress>${this.escapeXML(event.ipAddress)}</ipAddress>\n`;
      xml += `    <userAgent>${this.escapeXML(event.userAgent)}</userAgent>\n`;
      xml += `    <regulations>${event.regulations.join(",")}</regulations>\n`;
      xml += `    <immutableHash>${this.escapeXML(event.immutableHash)}</immutableHash>\n`;
      xml += "  </event>\n";
    }

    xml += "</audit_trail>";
    return xml;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `audit_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  }

  /**
   * Get system IP address
   */
  private getSystemIP(): string {
    // In production, this would get the actual system IP
    return "127.0.0.1";
  }

  /**
   * Load last event hash from storage
   */
  private async loadLastEventHash(): Promise<void> {
    // This would query the database for the most recent event hash
    // For now, set to null indicating no previous events
    this.lastEventHash = null;
  }

  /**
   * Get audit trail statistics
   */
  async getStatistics(
    period: "HOUR" | "DAY" | "WEEK" | "MONTH" = "DAY",
  ): Promise<any> {
    // This would return comprehensive statistics about the audit trail
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsByUser: {},
      eventsByRegulation: {},
      averageProcessingTime: 0,
      chainIntegrityScore: 1.0,
      storageUsed: 0,
      retentionCompliance: 100,
    };
  }

  /**
   * Clean up old audit events based on retention policy
   */
  async cleanupOldEvents(): Promise<number> {
    const retentionDate = new Date();
    retentionDate.setDate(
      retentionDate.getDate() - this.config.auditRetentionDays,
    );

    // This would delete events older than the retention period
    // while maintaining compliance requirements

    logger.info("Cleaning up audit events older than retention period", {
      retentionDays: this.config.auditRetentionDays,
      cutoffDate: retentionDate,
    });

    return 0; // Number of events cleaned up
  }

  /**
   * Shutdown the audit trail system
   */
  async shutdown(): Promise<void> {
    logger.info("Shutting down Audit Trail system");

    // Stop auto-flush
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Flush any remaining events
    await this.flush();

    this.isInitialized = false;
    logger.info("Audit Trail system shutdown complete");
  }
}
