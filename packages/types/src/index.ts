/**
 * @fileoverview Shared types across IQ24.ai packages to avoid circular dependencies
 */

// Agent Configuration Types
export interface AgentConfig {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  enabled: boolean;
  timeout: number;
  retryPolicy: RetryPolicy;
  resources: ResourceAllocation;
  metadata?: Record<string, any>;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
  maxDelay: number;
}

export interface ResourceAllocation {
  cpu: number;
  memory: number;
  priority: 'low' | 'medium' | 'high';
}

// Task and Workflow Types
export interface TaskContext {
  taskId: string;
  workflowId: string;
  campaignId: string;
  userId: string;
  timestamp: Date;
  attempt: number;
  metadata: Record<string, any>;
  checkpoints: Checkpoint[];
}

export interface WorkflowTask {
  id: string;
  type: string;
  name: string;
  description?: string;
  input: any;
  output?: any;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: Error;
  metadata: Record<string, any>;
}

export interface Checkpoint {
  id: string;
  timestamp: Date;
  state: any;
  metadata: Record<string, any>;
}

export type TaskStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

// Data Source Types
export interface DataSourceConfig {
  id: string;
  type: string;
  name: string;
  endpoint: string;
  authentication: AuthConfig;
  rateLimit?: RateLimit;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  enabled: boolean;
}

export interface AuthConfig {
  type: 'api_key' | 'oauth' | 'basic' | 'bearer';
  credentials: Record<string, string>;
}

export interface RateLimit {
  requests: number;
  period: number; // in milliseconds
  burst?: number;
}

// Enrichment and Processing Types
export interface EnrichmentResult {
  success: boolean;
  data: any;
  confidence: number;
  source: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface ProcessingResult {
  success: boolean;
  data: any;
  processingTime: number;
  confidence?: number;
  metadata: Record<string, any>;
}

// Campaign and Lead Types
export interface CampaignConfig {
  id: string;
  name: string;
  description?: string;
  objectives: string[];
  targetAudience: TargetAudience;
  channels: CommunicationChannel[];
  schedule: CampaignSchedule;
  personalization: PersonalizationConfig;
  compliance: ComplianceConfig;
  metadata: Record<string, any>;
}

export interface TargetAudience {
  demographics: Record<string, any>;
  firmographics: Record<string, any>;
  technographics: Record<string, any>;
  behavioralAttributes: Record<string, any>;
  exclusions?: Record<string, any>;
}

export interface CommunicationChannel {
  type: 'email' | 'linkedin' | 'sms' | 'phone' | 'mail';
  enabled: boolean;
  priority: number;
  configuration: Record<string, any>;
}

export interface CampaignSchedule {
  startDate: Date;
  endDate?: Date;
  timezone: string;
  frequency: ScheduleFrequency;
  timing: TimingPreferences;
}

export interface ScheduleFrequency {
  type: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number;
  days?: number[];
  customPattern?: string;
}

export interface TimingPreferences {
  preferredHours: number[];
  excludedHours: number[];
  workdaysOnly: boolean;
  respectTimezones: boolean;
}

export interface PersonalizationConfig {
  level: 'basic' | 'advanced' | 'hyper';
  dynamicFields: string[];
  templates: Record<string, any>;
  aiPersonalization: boolean;
  multiSensory: boolean;
}

export interface ComplianceConfig {
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  canSpamCompliant: boolean;
  customRules: ComplianceRule[];
  auditTrail: boolean;
}

export interface ComplianceRule {
  id: string;
  name: string;
  type: string;
  condition: string;
  action: string;
  enabled: boolean;
}

// Prospect and Lead Types
export interface ProspectProfile {
  id: string;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  contactInfo: ContactInfo;
  engagementHistory: EngagementEvent[];
  enrichmentData: EnrichmentData;
  score: ProspectScore;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  bio?: string;
  interests?: string[];
  socialProfiles?: SocialProfile[];
}

export interface ProfessionalInfo {
  company: CompanyInfo;
  jobTitle: string;
  department?: string;
  senioryLevel?: string;
  yearsExperience?: number;
  skills?: string[];
  certifications?: string[];
}

export interface CompanyInfo {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  revenue: string;
  location: string;
  description?: string;
  technologies?: string[];
  fundingStage?: string;
}

export interface ContactInfo {
  email: string;
  emailStatus: 'valid' | 'invalid' | 'risky' | 'unknown';
  phone?: string;
  phoneStatus?: 'valid' | 'invalid' | 'unknown';
  linkedinUrl?: string;
  otherContacts?: Record<string, string>;
}

export interface SocialProfile {
  platform: string;
  url: string;
  username?: string;
  verified?: boolean;
}

export interface EngagementEvent {
  id: string;
  type: string;
  channel: string;
  timestamp: Date;
  details: Record<string, any>;
  outcome: string;
}

export interface EnrichmentData {
  sources: string[];
  lastEnriched: Date;
  confidence: number;
  additionalData: Record<string, any>;
}

export interface ProspectScore {
  overall: number;
  fit: number;
  intent: number;
  engagement: number;
  factors: Record<string, number>;
  lastCalculated: Date;
}

// Analytics and Metrics Types
export interface AnalyticsMetrics {
  campaignMetrics: CampaignMetrics;
  agentMetrics: AgentMetrics;
  systemMetrics: SystemMetrics;
  complianceMetrics: ComplianceMetrics;
  timestamp: Date;
}

export interface CampaignMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  prospectsSourced: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsReplied: number;
  meetingsBooked: number;
  conversions: number;
  roi: number;
}

export interface AgentMetrics {
  [agentId: string]: {
    tasksProcessed: number;
    successRate: number;
    averageProcessingTime: number;
    errorRate: number;
    uptime: number;
  };
}

export interface SystemMetrics {
  uptime: number;
  cpu: number;
  memory: number;
  errorRate: number;
  responseTime: number;
  throughput: number;
}

export interface ComplianceMetrics {
  complianceScore: number;
  violations: number;
  auditsCompleted: number;
  risksIdentified: number;
}

// Event and Notification Types
export interface SystemEvent {
  id: string;
  type: string;
  category: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  timestamp: Date;
  data: any;
  metadata: Record<string, any>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipient: string;
  channel: 'email' | 'sms' | 'push' | 'webhook';
  createdAt: Date;
  sentAt?: Date;
  readAt?: Date;
  metadata: Record<string, any>;
}

// AI and ML Types
export interface AIModelConfig {
  id: string;
  name: string;
  type: string;
  version: string;
  provider: string;
  endpoint?: string;
  parameters: Record<string, any>;
  enabled: boolean;
}

export interface PredictionResult {
  prediction: any;
  confidence: number;
  modelId: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

// Error and Recovery Types
export interface SystemError {
  id: string;
  type: string;
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
}

export interface RecoveryAction {
  id: string;
  type: string;
  trigger: string;
  action: string;
  parameters: Record<string, any>;
  enabled: boolean;
}

// Health and Monitoring Types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, ComponentHealth>;
  timestamp: Date;
  uptime: number;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  errorRate?: number;
  lastCheck: Date;
  details?: Record<string, any>;
}

// Quantum Optimization Types
export interface OptimizationProblem {
  id: string;
  type: string;
  parameters: Record<string, any>;
  constraints: Record<string, any>;
  objective: string;
  priority: number;
}

export interface OptimizationResult {
  problemId: string;
  solution: any;
  confidence: number;
  computationTime: number;
  iterations: number;
  metadata: Record<string, any>;
}