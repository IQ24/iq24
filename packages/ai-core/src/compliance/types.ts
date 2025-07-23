import { z } from "zod";

// Core compliance types and schemas
export const ComplianceRegulation = z.enum([
  "GDPR",
  "CCPA",
  "CAN_SPAM",
  "CASL",
  "PIPEDA",
  "LGPD",
  "PDPA_SG",
  "DPA_UK",
  "CPRA",
  "VCDPA",
]);

export type ComplianceRegulationType = z.infer<typeof ComplianceRegulation>;

export const ComplianceRiskLevel = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);
export type ComplianceRiskLevelType = z.infer<typeof ComplianceRiskLevel>;

export const ComplianceAction = z.enum([
  "APPROVE",
  "REJECT",
  "REQUIRE_REVIEW",
  "REQUEST_MODIFICATION",
  "FLAG_FOR_AUDIT",
]);
export type ComplianceActionType = z.infer<typeof ComplianceAction>;

// Content Analysis Results
export const ContentAnalysisResult = z.object({
  contentId: z.string(),
  contentType: z.enum([
    "EMAIL",
    "SMS",
    "LINKEDIN_MESSAGE",
    "VOICE_SCRIPT",
    "IMAGE_PROMPT",
  ]),
  content: z.string(),
  analysisTimestamp: z.date(),
  risks: z.array(
    z.object({
      regulation: ComplianceRegulation,
      riskLevel: ComplianceRiskLevel,
      riskType: z.string(),
      description: z.string(),
      suggestions: z.array(z.string()),
      confidence: z.number().min(0).max(1),
    }),
  ),
  overallRiskLevel: ComplianceRiskLevel,
  recommendedAction: ComplianceAction,
  complianceScore: z.number().min(0).max(1),
  requiredModifications: z.array(z.string()).optional(),
  approvedRegulations: z.array(ComplianceRegulation),
});

export type ContentAnalysisResultType = z.infer<typeof ContentAnalysisResult>;

// Consent Management
export const ConsentType = z.enum([
  "EMAIL_MARKETING",
  "SMS_MARKETING",
  "PHONE_CALLS",
  "DATA_PROCESSING",
  "THIRD_PARTY_SHARING",
  "ANALYTICS_TRACKING",
  "PERSONALIZATION",
]);

export const ConsentStatus = z.enum([
  "GRANTED",
  "DENIED",
  "PENDING",
  "WITHDRAWN",
  "EXPIRED",
]);

export const ConsentRecord = z.object({
  prospectId: z.string(),
  consentType: ConsentType,
  status: ConsentStatus,
  timestamp: z.date(),
  expiryDate: z.date().optional(),
  source: z.string(), // How consent was obtained
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  evidenceUrl: z.string().optional(), // Link to consent proof
  withdrawalReason: z.string().optional(),
  regulations: z.array(ComplianceRegulation),
});

export type ConsentRecordType = z.infer<typeof ConsentRecord>;

// Audit Trail
export const AuditEventType = z.enum([
  "CONTENT_ANALYSIS",
  "CONSENT_GRANTED",
  "CONSENT_WITHDRAWN",
  "MESSAGE_SENT",
  "MESSAGE_BLOCKED",
  "DATA_ACCESSED",
  "DATA_EXPORTED",
  "DATA_DELETED",
  "REGULATION_UPDATE",
  "POLICY_CHANGE",
  "COMPLIANCE_VIOLATION",
]);

export const AuditEvent = z.object({
  id: z.string(),
  timestamp: z.date(),
  eventType: AuditEventType,
  userId: z.string(),
  prospectId: z.string().optional(),
  campaignId: z.string().optional(),
  details: z.record(z.any()),
  ipAddress: z.string(),
  userAgent: z.string(),
  regulations: z.array(ComplianceRegulation),
  immutableHash: z.string(), // Cryptographic hash for tamper detection
  previousEventHash: z.string().optional(), // For blockchain-like integrity
});

export type AuditEventType = z.infer<typeof AuditEvent>;

// Regulation Configuration
export const RegulationRule = z.object({
  id: z.string(),
  regulation: ComplianceRegulation,
  category: z.string(),
  name: z.string(),
  description: z.string(),
  severity: ComplianceRiskLevel,
  patterns: z.array(z.string()), // Regex patterns or keywords
  exceptions: z.array(z.string()).optional(),
  suggestions: z.array(z.string()),
  isActive: z.boolean(),
  lastUpdated: z.date(),
  version: z.string(),
});

export type RegulationRuleType = z.infer<typeof RegulationRule>;

// Dynamic Regulatory Updates
export const RegulatoryUpdate = z.object({
  id: z.string(),
  regulation: ComplianceRegulation,
  updateType: z.enum([
    "NEW_RULE",
    "RULE_MODIFICATION",
    "RULE_REMOVAL",
    "INTERPRETATION_CHANGE",
  ]),
  title: z.string(),
  description: z.string(),
  effectiveDate: z.date(),
  source: z.string(), // Government website, legal database, etc.
  sourceUrl: z.string(),
  impact: z.enum(["LOW", "MEDIUM", "HIGH"]),
  actionRequired: z.boolean(),
  rulesAffected: z.array(z.string()), // Rule IDs
  implementationDeadline: z.date().optional(),
  status: z.enum(["PENDING", "IMPLEMENTED", "OVERDUE"]),
});

export type RegulatoryUpdateType = z.infer<typeof RegulatoryUpdate>;

// Compliance Dashboard Metrics
export const ComplianceMetrics = z.object({
  timestamp: z.date(),
  period: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY"]),
  totalAnalyses: z.number(),
  approvedContent: z.number(),
  rejectedContent: z.number(),
  flaggedContent: z.number(),
  complianceScore: z.number().min(0).max(1),
  riskDistribution: z.record(ComplianceRiskLevel, z.number()),
  regulationBreakdown: z.record(
    ComplianceRegulation,
    z.object({
      violations: z.number(),
      warnings: z.number(),
      score: z.number().min(0).max(1),
    }),
  ),
  consentMetrics: z.object({
    totalConsents: z.number(),
    activeConsents: z.number(),
    withdrawnConsents: z.number(),
    expiredConsents: z.number(),
    consentRate: z.number().min(0).max(1),
  }),
  processingTimes: z.object({
    averageAnalysisTime: z.number(), // milliseconds
    p95AnalysisTime: z.number(),
    p99AnalysisTime: z.number(),
  }),
});

export type ComplianceMetricsType = z.infer<typeof ComplianceMetrics>;

// Compliance Configuration
export const ComplianceConfig = z.object({
  enabledRegulations: z.array(ComplianceRegulation),
  strictMode: z.boolean(), // If true, reject on any violation
  autoRejectThreshold: z.number().min(0).max(1), // Risk score threshold
  requireHumanReview: z.boolean(),
  auditRetentionDays: z.number(),
  consentExpiryDays: z.number(),
  alertsEnabled: z.boolean(),
  alertWebhooks: z.array(z.string()),
  emergencyContacts: z.array(z.string()),
  dataRetentionPolicies: z.record(z.string(), z.number()), // data type -> retention days
  rightsRequestHandling: z.object({
    autoProcessDataExport: z.boolean(),
    autoProcessDataDeletion: z.boolean(),
    maxResponseTime: z.number(), // hours
  }),
});

export type ComplianceConfigType = z.infer<typeof ComplianceConfig>;

// Data Subject Rights Requests
export const DataRightsRequestType = z.enum([
  "ACCESS", // Right to access personal data
  "RECTIFICATION", // Right to correct inaccurate data
  "ERASURE", // Right to be forgotten
  "PORTABILITY", // Right to data portability
  "RESTRICTION", // Right to restrict processing
  "OBJECTION", // Right to object to processing
  "WITHDRAW_CONSENT", // Right to withdraw consent
]);

export const DataRightsRequest = z.object({
  id: z.string(),
  requestType: DataRightsRequestType,
  prospectId: z.string(),
  requestorEmail: z.string(),
  requestorName: z.string(),
  submissionDate: z.date(),
  verificationStatus: z.enum(["PENDING", "VERIFIED", "FAILED"]),
  status: z.enum(["RECEIVED", "IN_PROGRESS", "COMPLETED", "REJECTED"]),
  dueDate: z.date(),
  completionDate: z.date().optional(),
  description: z.string(),
  regulationBasis: z.array(ComplianceRegulation),
  dataCategories: z.array(z.string()),
  processingActivities: z.array(z.string()),
  responseData: z.record(z.any()).optional(),
  rejectionReason: z.string().optional(),
  handlerUserId: z.string(),
});

export type DataRightsRequestType = z.infer<typeof DataRightsRequest>;

// Monitoring and Alerting
export const ComplianceAlert = z.object({
  id: z.string(),
  timestamp: z.date(),
  severity: z.enum(["INFO", "WARNING", "ERROR", "CRITICAL"]),
  type: z.enum([
    "REGULATION_VIOLATION",
    "CONSENT_EXPIRED",
    "AUDIT_ANOMALY",
    "SYSTEM_ERROR",
    "REGULATORY_UPDATE",
    "DATA_BREACH",
    "RIGHTS_REQUEST_OVERDUE",
  ]),
  title: z.string(),
  description: z.string(),
  affectedRegulations: z.array(ComplianceRegulation),
  relatedEntities: z.object({
    prospectIds: z.array(z.string()).optional(),
    campaignIds: z.array(z.string()).optional(),
    contentIds: z.array(z.string()).optional(),
  }),
  actionRequired: z.boolean(),
  suggestedActions: z.array(z.string()),
  escalationLevel: z.number().min(1).max(5),
  assignedTo: z.string().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "DISMISSED"]),
  resolution: z.string().optional(),
  resolvedAt: z.date().optional(),
});

export type ComplianceAlertType = z.infer<typeof ComplianceAlert>;

// Export all types for easy importing
export type {
  ContentAnalysisResultType,
  ConsentRecordType,
  AuditEventType as AuditEventSchemaType,
  RegulationRuleType,
  RegulatoryUpdateType,
  ComplianceMetricsType,
  ComplianceConfigType,
  DataRightsRequestType as DataRightsRequestSchemaType,
  ComplianceAlertType,
};

// Utility types for API responses
export interface ComplianceApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  complianceInfo?: {
    regulations: ComplianceRegulationType[];
    riskLevel: ComplianceRiskLevelType;
    requiresReview: boolean;
  };
}

export interface ComplianceCheckRequest {
  content: string;
  contentType:
    | "EMAIL"
    | "SMS"
    | "LINKEDIN_MESSAGE"
    | "VOICE_SCRIPT"
    | "IMAGE_PROMPT";
  prospectId?: string;
  campaignId?: string;
  targetRegulations?: ComplianceRegulationType[];
  context?: Record<string, any>;
}

// Real-time monitoring types
export interface ComplianceMonitoringEvent {
  timestamp: Date;
  eventType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  metadata: Record<string, any>;
}

export interface ComplianceHealthCheck {
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  checks: {
    [checkName: string]: {
      status: "PASS" | "WARN" | "FAIL";
      message: string;
      lastCheck: Date;
      responseTime?: number;
    };
  };
  overall: {
    score: number; // 0-100
    uptime: number; // percentage
    errorRate: number; // percentage
  };
}

// Regulatory Framework Enum
export enum RegulatoryFramework {
  GDPR = "GDPR",
  CCPA = "CCPA",
  CAN_SPAM = "CAN_SPAM",
  CASL = "CASL",
  PIPEDA = "PIPEDA",
  LGPD = "LGPD",
  PDPA_SG = "PDPA_SG",
  DPA_UK = "DPA_UK",
  CPRA = "CPRA",
  VCDPA = "VCDPA",
}

// Comprehensive Compliance System Configuration
export interface ComplianceSystemConfig {
  version: string;
  enabledFrameworks: RegulatoryFramework[];

  guardianConfig: {
    maxConcurrentChecks: number;
    checkTimeoutMs: number;
    retryAttempts: number;
    enableMLAnalysis: boolean;
    confidenceThreshold: number;
  };

  regulationConfig: {
    maxConcurrentAnalysis: number;
    analysisTimeoutMs: number;
    enableDynamicUpdates: boolean;
    updateIntervalHours: number;
  };

  auditConfig: {
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    retentionDays: number;
    batchSize: number;
    maxEventSize: number;
  };

  consentConfig: {
    requireDoubleOptIn: boolean;
    defaultExpirationDays: number;
    enableAutomaticCleanup: boolean;
    reminderDays: number[];
  };

  monitorConfig: {
    enableRealTimeMonitoring: boolean;
    metricsRetentionDays: number;
    alertingEnabled: boolean;
    reportingEnabled: boolean;
  };

  thresholds: {
    maxViolationsPerHour: number;
    maxViolationsPerDay: number;
    consentExpirationWarningDays: number;
    complianceScoreThreshold: number;
  };

  healthCheckIntervalMs: number;
}

// Outreach Content Structure
export interface OutreachContent {
  id: string;
  type: "EMAIL" | "SMS" | "LINKEDIN_MESSAGE" | "VOICE_SCRIPT" | "IMAGE_PROMPT";
  channel: "EMAIL" | "SMS" | "LINKEDIN" | "VOICE" | "IMAGE";
  content: string;
  subject?: string;
  prospectId: string;
  campaignId: string;
  personalizations?: Record<string, any>;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
