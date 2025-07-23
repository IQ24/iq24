/**
 * Advanced Data Pipeline and Feature Store Types
 *
 * Comprehensive type definitions for the sophisticated data processing,
 * feature engineering, and ML operations pipeline.
 */

/**
 * Data source configurations
 */
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  config: DataSourceConfig;
  status: DataSourceStatus;
  lastSync?: Date;
  errorCount: number;
  totalRecords: number;
}

export type DataSourceType =
  | "apollo"
  | "hunter"
  | "linkedin"
  | "clearbit"
  | "crunchbase"
  | "web_scraping"
  | "internal_crm"
  | "email_provider"
  | "social_media"
  | "news_api"
  | "company_database";

export type DataSourceStatus = "active" | "paused" | "error" | "syncing";

export interface DataSourceConfig {
  endpoint?: string;
  apiKey?: string;
  refreshInterval: number; // minutes
  batchSize: number;
  retryPolicy: RetryPolicy;
  filterCriteria?: Record<string, any>;
  transformations?: DataTransformation[];
}

/**
 * Data transformation and processing
 */
export interface DataTransformation {
  id: string;
  type: TransformationType;
  config: TransformationConfig;
  order: number;
}

export type TransformationType =
  | "normalize"
  | "deduplicate"
  | "enrich"
  | "validate"
  | "format"
  | "aggregate"
  | "filter"
  | "join"
  | "ml_inference";

export interface TransformationConfig {
  fields?: string[];
  rules?: Record<string, any>;
  model?: string;
  threshold?: number;
  [key: string]: any;
}

/**
 * Feature store definitions
 */
export interface FeatureStore {
  features: Map<string, Feature>;
  featureGroups: Map<string, FeatureGroup>;
  onlineStore: OnlineFeatureStore;
  offlineStore: OfflineFeatureStore;
  registry: FeatureRegistry;
}

export interface Feature {
  id: string;
  name: string;
  type: FeatureType;
  description: string;
  source: DataSource;
  transformation?: DataTransformation;
  valueType: ValueType;
  metadata: FeatureMetadata;
  version: number;
  status: FeatureStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type FeatureType =
  | "demographic"
  | "firmographic"
  | "technographic"
  | "behavioral"
  | "engagement"
  | "social"
  | "temporal"
  | "derived"
  | "ml_prediction";

export type ValueType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "json"
  | "array"
  | "embedding";

export type FeatureStatus =
  | "active"
  | "deprecated"
  | "experimental"
  | "archived";

export interface FeatureMetadata {
  category: string;
  tags: string[];
  owner: string;
  documentation: string;
  sla: ServiceLevelAgreement;
  quality: FeatureQualityMetrics;
  lineage: DataLineage;
}

export interface FeatureGroup {
  id: string;
  name: string;
  features: string[]; // feature IDs
  entityType: EntityType;
  description: string;
  onlineEnabled: boolean;
  offlineEnabled: boolean;
  ttl?: number;
}

export type EntityType =
  | "prospect"
  | "company"
  | "campaign"
  | "interaction"
  | "user";

/**
 * Online and offline feature stores
 */
export interface OnlineFeatureStore {
  get(entityId: string, featureNames: string[]): Promise<Record<string, any>>;
  multiGet(requests: FeatureRequest[]): Promise<FeatureResponse[]>;
  put(entityId: string, features: Record<string, any>): Promise<void>;
  delete(entityId: string, featureNames: string[]): Promise<void>;
  exists(entityId: string, featureName: string): Promise<boolean>;
}

export interface OfflineFeatureStore {
  getHistoricalFeatures(
    request: HistoricalFeatureRequest,
  ): Promise<FeatureDataset>;
  materialize(
    featureGroup: string,
    startTime: Date,
    endTime: Date,
  ): Promise<void>;
  createTrainingDataset(config: TrainingDatasetConfig): Promise<FeatureDataset>;
  getFeatureStatistics(
    featureName: string,
    timeRange: TimeRange,
  ): Promise<FeatureStatistics>;
}

export interface FeatureRequest {
  entityId: string;
  featureNames: string[];
  timestamp?: Date;
}

export interface FeatureResponse {
  entityId: string;
  features: Record<string, any>;
  timestamp: Date;
  metadata: {
    freshness: number;
    confidence: number;
    source: string;
  };
}

export interface HistoricalFeatureRequest {
  entityIds: string[];
  featureNames: string[];
  startTime: Date;
  endTime: Date;
  pointInTime?: boolean;
}

export interface FeatureDataset {
  data: Record<string, any>[];
  schema: DatasetSchema;
  metadata: DatasetMetadata;
}

/**
 * Data pipeline execution
 */
export interface DataPipeline {
  id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
  schedule: PipelineSchedule;
  config: PipelineConfig;
  status: PipelineStatus;
  metrics: PipelineMetrics;
  lastRun?: PipelineRun;
}

export interface PipelineStage {
  id: string;
  name: string;
  type: StageType;
  config: StageConfig;
  dependencies: string[];
  resources: ResourceRequirements;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export type StageType =
  | "extract"
  | "transform"
  | "load"
  | "validate"
  | "enrich"
  | "ml_training"
  | "ml_inference"
  | "notification";

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: RunStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  logs: LogEntry[];
  metrics: RunMetrics;
  error?: Error;
}

export type RunStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";
export type PipelineStatus = "active" | "paused" | "disabled" | "draft";

/**
 * ML and analytics types
 */
export interface MLModel {
  id: string;
  name: string;
  type: ModelType;
  version: string;
  status: ModelStatus;
  config: ModelConfig;
  metrics: ModelMetrics;
  features: string[];
  target: string;
  createdAt: Date;
  lastTrained: Date;
}

export type ModelType =
  | "classification"
  | "regression"
  | "clustering"
  | "recommendation"
  | "anomaly_detection"
  | "time_series"
  | "nlp"
  | "embedding";

export type ModelStatus = "training" | "active" | "deprecated" | "failed";

export interface ModelConfig {
  algorithm: string;
  hyperparameters: Record<string, any>;
  trainingDataConfig: TrainingDataConfig;
  validationConfig: ValidationConfig;
  deploymentConfig: DeploymentConfig;
}

export interface ModelMetrics {
  training: TrainingMetrics;
  validation: ValidationMetrics;
  production?: ProductionMetrics;
}

/**
 * Data quality and monitoring
 */
export interface DataQualityProfile {
  completeness: number;
  validity: number;
  consistency: number;
  accuracy: number;
  timeliness: number;
  uniqueness: number;
  rules: QualityRule[];
  alerts: QualityAlert[];
}

export interface QualityRule {
  id: string;
  name: string;
  condition: string;
  severity: AlertSeverity;
  enabled: boolean;
}

export interface QualityAlert {
  id: string;
  ruleId: string;
  message: string;
  severity: AlertSeverity;
  timestamp: Date;
  resolved: boolean;
}

export type AlertSeverity = "low" | "medium" | "high" | "critical";

/**
 * Supporting types
 */
export interface ServiceLevelAgreement {
  availability: number; // percentage
  latency: number; // milliseconds
  freshness: number; // minutes
}

export interface FeatureQualityMetrics {
  completeness: number;
  validity: number;
  consistency: number;
  freshness: number;
  lastUpdate: Date;
}

export interface DataLineage {
  upstream: string[];
  downstream: string[];
  transformations: string[];
  lastModified: Date;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: "linear" | "exponential" | "fixed";
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
}

export interface ResourceRequirements {
  cpu: number;
  memory: number;
  storage: number;
  gpu?: number;
}

export interface PipelineSchedule {
  type: "cron" | "interval" | "event" | "manual";
  expression?: string;
  interval?: number;
  events?: string[];
  timezone: string;
}

export interface PipelineConfig {
  parallelism: number;
  checkpointing: boolean;
  monitoring: boolean;
  alerting: AlertingConfig;
  resources: ResourceRequirements;
}

export interface AlertingConfig {
  enabled: boolean;
  channels: string[];
  thresholds: Record<string, number>;
}

export interface PipelineMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageDuration: number;
  averageThroughput: number;
  lastRunTime?: Date;
}

export interface StageConfig {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: Date;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, any>;
}

export interface RunMetrics {
  duration: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
  ioOperations: number;
}

export interface DatasetSchema {
  fields: FieldDefinition[];
  primaryKey?: string[];
  foreignKeys?: ForeignKeyDefinition[];
}

export interface FieldDefinition {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
  constraints?: FieldConstraints;
}

export interface ForeignKeyDefinition {
  fields: string[];
  referencedTable: string;
  referencedFields: string[];
}

export interface FieldConstraints {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: any[];
  minimum?: number;
  maximum?: number;
}

export interface DatasetMetadata {
  size: number;
  recordCount: number;
  createdAt: Date;
  updatedAt: Date;
  source: string;
  version: string;
  checksum: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface TrainingDatasetConfig {
  featureGroups: string[];
  labelColumn: string;
  timeRange: TimeRange;
  samplingStrategy?: SamplingStrategy;
  transformations?: DataTransformation[];
}

export interface SamplingStrategy {
  type: "random" | "stratified" | "time_based";
  ratio?: number;
  size?: number;
  stratifyColumn?: string;
}

export interface TrainingDataConfig {
  source: string;
  features: string[];
  target: string;
  splitRatio: number[];
  preprocessing: PreprocessingConfig;
}

export interface ValidationConfig {
  method: "holdout" | "cross_validation" | "time_series_split";
  parameters: Record<string, any>;
}

export interface DeploymentConfig {
  environment: "staging" | "production";
  scalingPolicy: ScalingPolicy;
  monitoring: MonitoringConfig;
}

export interface PreprocessingConfig {
  normalization?: NormalizationConfig;
  encoding?: EncodingConfig;
  featureSelection?: FeatureSelectionConfig;
  imputeStrategy?: ImputeStrategy;
}

export interface NormalizationConfig {
  method: "minmax" | "zscore" | "robust";
  features: string[];
}

export interface EncodingConfig {
  categorical: CategoricalEncodingConfig;
  text?: TextEncodingConfig;
}

export interface CategoricalEncodingConfig {
  method: "onehot" | "label" | "target" | "binary";
  features: string[];
  handleUnknown: "error" | "ignore";
}

export interface TextEncodingConfig {
  method: "tfidf" | "word2vec" | "bert" | "fasttext";
  features: string[];
  parameters: Record<string, any>;
}

export interface FeatureSelectionConfig {
  method: "correlation" | "mutual_info" | "rfe" | "lasso";
  k?: number;
  threshold?: number;
}

export interface ImputeStrategy {
  numerical: "mean" | "median" | "mode" | "constant";
  categorical: "mode" | "constant";
  constant?: any;
}

export interface TrainingMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
  logloss?: number;
}

export interface ValidationMetrics extends TrainingMetrics {
  overfitting: boolean;
  stability: number;
}

export interface ProductionMetrics extends TrainingMetrics {
  drift: DataDriftMetrics;
  performance: PerformanceMetrics;
  usage: UsageMetrics;
}

export interface DataDriftMetrics {
  detected: boolean;
  severity: "low" | "medium" | "high";
  features: string[];
  lastDetected?: Date;
}

export interface PerformanceMetrics {
  latency: number;
  throughput: number;
  errorRate: number;
  availability: number;
}

export interface UsageMetrics {
  requestCount: number;
  uniqueUsers: number;
  averageRequestsPerUser: number;
  peakThroughput: number;
}

export interface ScalingPolicy {
  minInstances: number;
  maxInstances: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alertThresholds: Record<string, number>;
  dashboardUrl?: string;
}

export interface FeatureStatistics {
  count: number;
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  nullCount: number;
  uniqueCount: number;
  histogram?: HistogramBin[];
  topValues?: ValueCount[];
}

export interface HistogramBin {
  min: number;
  max: number;
  count: number;
}

export interface ValueCount {
  value: any;
  count: number;
  percentage: number;
}

export interface FeatureRegistry {
  register(feature: Feature): Promise<void>;
  get(featureId: string): Promise<Feature | null>;
  list(filter?: FeatureFilter): Promise<Feature[]>;
  update(featureId: string, updates: Partial<Feature>): Promise<void>;
  delete(featureId: string): Promise<void>;
  search(query: string): Promise<Feature[]>;
}

export interface FeatureFilter {
  type?: FeatureType;
  status?: FeatureStatus;
  owner?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Events and notifications
 */
export interface DataPipelineEvent {
  type: PipelineEventType;
  pipelineId: string;
  runId?: string;
  timestamp: Date;
  data: Record<string, any>;
}

export type PipelineEventType =
  | "pipeline_started"
  | "pipeline_completed"
  | "pipeline_failed"
  | "stage_started"
  | "stage_completed"
  | "stage_failed"
  | "data_quality_alert"
  | "feature_drift_detected"
  | "model_performance_degraded";

/**
 * Configuration and settings
 */
export interface DataPipelineConfig {
  storage: StorageConfig;
  compute: ComputeConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  features: FeatureStoreConfig;
}

export interface StorageConfig {
  offline: {
    provider: "postgresql" | "s3" | "bigquery" | "snowflake";
    connectionString: string;
    batchSize: number;
    partitioning: PartitioningConfig;
  };
  online: {
    provider: "redis" | "dynamodb" | "cassandra";
    connectionString: string;
    ttl: number;
    replication: number;
  };
  cache: {
    provider: "redis" | "memcached";
    connectionString: string;
    ttl: number;
    maxSize: number;
  };
}

export interface ComputeConfig {
  framework: "spark" | "dask" | "ray" | "local";
  resources: ResourceRequirements;
  autoscaling: boolean;
  maxWorkers: number;
}

export interface SecurityConfig {
  encryption: {
    atRest: boolean;
    inTransit: boolean;
    keyManagement: string;
  };
  access: {
    authentication: boolean;
    authorization: boolean;
    rbac: boolean;
  };
  audit: {
    enabled: boolean;
    retention: number;
    compliance: string[];
  };
}

export interface FeatureStoreConfig {
  onlineStore: OnlineStoreConfig;
  offlineStore: OfflineStoreConfig;
  registry: RegistryConfig;
}

export interface OnlineStoreConfig {
  provider: string;
  config: Record<string, any>;
  ttl: number;
  maxConnections: number;
}

export interface OfflineStoreConfig {
  provider: string;
  config: Record<string, any>;
  partitioning: PartitioningConfig;
  compression: CompressionConfig;
}

export interface RegistryConfig {
  provider: string;
  config: Record<string, any>;
  versioning: boolean;
  backup: boolean;
}

export interface PartitioningConfig {
  strategy: "time" | "hash" | "range";
  columns: string[];
  buckets?: number;
}

export interface CompressionConfig {
  algorithm: "gzip" | "snappy" | "lz4" | "zstd";
  level: number;
}
