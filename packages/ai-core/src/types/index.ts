// IQ24.ai AI Core Types - Comprehensive Type System

import { z } from 'zod';
import { ComplianceSystemConfig, RegulatoryFramework } from '../compliance/types.js';

// ============================================================================
// CORE AGENT TYPES
// ============================================================================

export enum AgentType {
  PROSPECT_DISCOVERY = 'prospect-discovery',
  VALIDATION_ENRICHMENT = 'validation-enrichment', 
  OUTREACH_PERSONALIZATION = 'outreach-personalization',
  CAMPAIGN_EXECUTION = 'campaign-execution',
  ANALYTICS_FEEDBACK = 'analytics-feedback',
  COMPLIANCE_GUARDIAN = 'compliance-guardian',
  ADAPTIVE_LEARNING_ORCHESTRATION = 'adaptive-learning-orchestration',
  COGNITIVE_REFLECTION = 'cognitive-reflection'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum WorkflowStatus {
  CREATED = 'created',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// ============================================================================
// PROSPECT AND LEAD TYPES
// ============================================================================

export const ProspectSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  company: z.string(),
  position: z.string(),
  linkedinUrl: z.string().optional(),
  phone: z.string().optional(),
  
  // Enrichment data
  industry: z.string().optional(),
  companySize: z.string().optional(),
  revenue: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  
  // Behavioral data
  recentActivity: z.array(z.string()).optional(),
  engagementHistory: z.array(z.object({
    type: z.string(),
    timestamp: z.date(),
    value: z.number()
  })).optional(),
  
  // Scoring
  leadScore: z.number().min(0).max(100).optional(),
  intentScore: z.number().min(0).max(100).optional(),
  
  // Metadata
  source: z.string(),
  discoveredAt: z.date(),
  lastUpdated: z.date(),
  tags: z.array(z.string()).optional()
});

export type Prospect = z.infer<typeof ProspectSchema>;

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  
  // Targeting
  idealCustomerProfile: z.object({
    industries: z.array(z.string()),
    companySizes: z.array(z.string()),
    roles: z.array(z.string()),
    technologies: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional()
  }),
  
  // Configuration
  channels: z.array(z.enum(['email', 'linkedin', 'phone', 'sms'])),
  sequence: z.array(z.object({
    step: z.number(),
    type: z.string(),
    delay: z.number(), // hours
    template: z.string(),
    conditions: z.array(z.string()).optional()
  })),
  
  // AI Configuration
  personalizationLevel: z.enum(['basic', 'advanced', 'hyper']),
  complianceProfile: z.string(),
  mseoEnabled: z.boolean().default(false),
  
  // Status and metrics
  status: z.enum(['draft', 'active', 'paused', 'completed']),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  
  // Results
  totalProspects: z.number().default(0),
  contacted: z.number().default(0),
  responses: z.number().default(0),
  meetings: z.number().default(0),
  conversions: z.number().default(0),
  
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Campaign = z.infer<typeof CampaignSchema>;

// ============================================================================
// TASK AND WORKFLOW TYPES
// ============================================================================

export const TaskSchema = z.object({
  id: z.string(),
  type: z.string(),
  agentType: z.nativeEnum(AgentType),
  status: z.nativeEnum(TaskStatus),
  
  // Task data
  payload: z.record(z.any()),
  result: z.record(z.any()).optional(),
  error: z.string().optional(),
  
  // Execution details
  priority: z.number().min(1).max(10).default(5),
  maxRetries: z.number().default(3),
  currentRetry: z.number().default(0),
  
  // Timing
  scheduledAt: z.date().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  
  // Relationships
  workflowId: z.string().optional(),
  parentTaskId: z.string().optional(),
  dependsOn: z.array(z.string()).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Task = z.infer<typeof TaskSchema>;

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.string(),
  status: z.nativeEnum(WorkflowStatus),
  
  // Configuration
  config: z.record(z.any()),
  
  // Tasks
  tasks: z.array(z.string()), // Task IDs
  currentTask: z.string().optional(),
  
  // Execution
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  pausedAt: z.date().optional(),
  
  // Results
  result: z.record(z.any()).optional(),
  error: z.string().optional(),
  
  // Metadata
  campaignId: z.string().optional(),
  userId: z.string(),
  workspaceId: z.string(),
  metadata: z.record(z.any()).optional(),
  
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Workflow = z.infer<typeof WorkflowSchema>;

// ============================================================================
// AI AND ML TYPES
// ============================================================================

export interface ModelInfo {
  id: string;
  name: string;
  type: 'llm' | 'embedding' | 'classification' | 'regression' | 'clustering';
  provider: 'openai' | 'anthropic' | 'huggingface' | 'custom';
  model: string;
  version: string;
  config: Record<string, any>;
  metrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    [key: string]: number | undefined;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureDefinition {
  name: string;
  type: 'categorical' | 'numerical' | 'text' | 'embedding';
  description: string;
  source: string;
  transformation?: string[];
  ttl?: number; // Time to live in seconds
}

export interface FeatureVector {
  prospectId: string;
  features: Record<string, any>;
  computedAt: Date;
  version: string;
}

// ============================================================================
// MSEO (MULTI-SENSORY ENGAGEMENT ORCHESTRATION) TYPES
// ============================================================================

export interface MSEOContent {
  type: 'text' | 'voice' | 'image' | 'video';
  content: string | Buffer;
  metadata: {
    duration?: number; // For voice/video
    dimensions?: { width: number; height: number }; // For images/video
    format: string;
    quality?: 'low' | 'medium' | 'high';
    personalization: Record<string, any>;
  };
  generatedAt: Date;
  model: string;
}

export interface MSEORequest {
  prospectId: string;
  contentTypes: Array<'text' | 'voice' | 'image' | 'video'>;
  context: {
    campaign: Campaign;
    prospect: Prospect;
    previousInteractions: any[];
    customData: Record<string, any>;
  };
  preferences: {
    style: string;
    tone: string;
    language: string;
    voiceGender?: 'male' | 'female';
    imageStyle?: string;
  };
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

export interface ComplianceRule {
  id: string;
  name: string;
  type: 'gdpr' | 'ccpa' | 'can_spam' | 'linkedin_policy' | 'custom';
  description: string;
  regex?: string;
  keywords?: string[];
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: 'flag' | 'block' | 'modify';
  regions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceCheck {
  id: string;
  contentId: string;
  rules: ComplianceRule[];
  violations: Array<{
    ruleId: string;
    severity: string;
    message: string;
    suggestion?: string;
  }>;
  status: 'passed' | 'warning' | 'failed';
  checkedAt: Date;
  auditTrail: {
    userId: string;
    action: string;
    timestamp: Date;
    details: Record<string, any>;
  }[];
}

// ============================================================================
// ANALYTICS AND INSIGHTS TYPES
// ============================================================================

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  dimensions: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface InsightRecommendation {
  id: string;
  type: 'optimization' | 'alert' | 'opportunity' | 'risk';
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  actions: string[];
  data: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

// ============================================================================
// QUANTUM-INSPIRED OPTIMIZATION TYPES
// ============================================================================

export interface OptimizationProblem {
  id: string;
  type: 'resource_allocation' | 'sequence_optimization' | 'channel_mix' | 'timing';
  objective: 'maximize' | 'minimize';
  variables: Array<{
    name: string;
    type: 'continuous' | 'discrete' | 'binary';
    bounds: [number, number];
    current: number;
  }>;
  constraints: Array<{
    name: string;
    expression: string;
    type: 'equality' | 'inequality';
  }>;
  data: Record<string, any>;
  createdAt: Date;
}

export interface OptimizationResult {
  problemId: string;
  solution: Record<string, number>;
  objectiveValue: number;
  confidence: number;
  iterations: number;
  convergenceTime: number;
  metadata: Record<string, any>;
  computedAt: Date;
}

// ============================================================================
// AI ENGINE CONFIGURATION TYPES
// ============================================================================

export interface AIEngineConfig {
  // Core settings
  enableDataPipeline: boolean;
  enableMSEO: boolean;
  enableQuantumOptimization: boolean;
  enableAdvancedCompliance: boolean;
  
  // Agent configuration
  agents: {
    maxConcurrentTasks: number;
    taskTimeout: number;
    retryPolicy: {
      maxRetries: number;
      backoffMultiplier: number;
      maxBackoffTime: number;
    };
    healthCheckInterval: number;
  };
  
  // Data pipeline settings
  dataPipeline?: {
    enableFeatureStores: boolean;
    enableMLModels: boolean;
    enableStreamProcessing: boolean;
    enableQualityMonitoring: boolean;
    enableLineageTracking: boolean;
    
    kafka: {
      brokers: string[];
      clientId: string;
      groupId: string;
    };
    
    redis: {
      host: string;
      port: number;
      db: number;
    };
    
    modelStore: {
      maxModels: number;
      cleanupInterval: number;
    };
  };
  
  // MSEO configuration
  mseo?: {
    enableVoice: boolean;
    enableImage: boolean;
    enableVideo: boolean;
    
    providers: {
      voice: string[];
      image: string[];
      video: string[];
    };
    
    quality: {
      voice: 'low' | 'medium' | 'high';
      image: 'low' | 'medium' | 'high';
      video: 'low' | 'medium' | 'high';
    };
    
    cache: {
      enabled: boolean;
      ttl: number;
      maxSize: number;
    };
  };
  
  // Quantum optimization settings
  quantumOptimization?: {
    enableQuantumInspired: boolean;
    optimizationTimeout: number;
    maxIterations: number;
    convergenceThreshold: number;
  };
  
  // Comprehensive Compliance System Configuration
  compliance: ComplianceSystemConfig;
  
  // Monitoring and logging
  monitoring: {
    enableMetrics: boolean;
    enableTracing: boolean;
    enableHealthChecks: boolean;
    metricsInterval: number;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      memoryUsage: number;
      cpuUsage: number;
    };
  };
  
  // External integrations
  integrations: {
    temporal: {
      namespace: string;
      taskQueue: string;
    };
    
    supabase: {
      url: string;
      anonKey: string;
      serviceKey: string;
    };
    
    apis: {
      openai: {
        apiKey: string;
        organization?: string;
      };
      anthropic: {
        apiKey: string;
      };
      apollo: {
        apiKey: string;
      };
      hunter: {
        apiKey: string;
      };
    };
  };
  
  // Environment settings
  environment: 'development' | 'staging' | 'production';
  debug: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}