import {
  FeatureStore,
  OnlineFeatureStore,
  OfflineFeatureStore,
  FeatureRegistry,
  FeatureGroup,
  Feature,
  FeatureValue,
  FeatureQuery,
  FeatureRegistration,
  FeatureLineage,
  FeatureQualityMetrics,
  FeatureStorageConfig,
  FeatureServingConfig,
  FeatureRetrievalOptions
} from '../types';
import { EventEmitter } from 'events';
import { Redis } from 'ioredis';
import { Logger } from '../utils/logger';

/**
 * Online Feature Store Implementation
 * High-performance, low-latency feature serving for real-time inference
 */
export class OnlineFeatureStoreImpl extends EventEmitter implements OnlineFeatureStore {
  private redis: Redis;
  private logger: Logger;
  private registry: FeatureRegistry;
  private config: FeatureServingConfig;
  private healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  private metrics: Map<string, FeatureQualityMetrics> = new Map();

  constructor(
    redis: Redis,
    registry: FeatureRegistry,
    config: FeatureServingConfig,
    logger: Logger
  ) {
    super();
    this.redis = redis;
    this.registry = registry;
    this.config = config;
    this.logger = logger;
    this.startHealthCheck();
  }

  async get(featureKey: string, entityId: string): Promise<FeatureValue | null> {
    try {
      const key = this.buildFeatureKey(featureKey, entityId);
      const value = await this.redis.get(key);
      
      if (!value) {
        this.logger.debug(`Feature not found: ${featureKey} for entity ${entityId}`);
        return null;
      }

      const parsedValue = JSON.parse(value);
      this.updateAccessMetrics(featureKey);
      
      return {
        value: parsedValue.value,
        timestamp: new Date(parsedValue.timestamp),
        version: parsedValue.version,
        source: parsedValue.source
      };
    } catch (error) {
      this.logger.error('Failed to get feature from online store', { featureKey, entityId, error });
      this.emit('error', { operation: 'get', featureKey, entityId, error });
      throw error;
    }
  }

  async getBatch(queries: FeatureQuery[]): Promise<Map<string, FeatureValue | null>> {
    const results = new Map<string, FeatureValue | null>();
    
    try {
      // Build pipeline for batch retrieval
      const pipeline = this.redis.pipeline();
      const queryKeys: string[] = [];

      for (const query of queries) {
        const key = this.buildFeatureKey(query.featureKey, query.entityId);
        pipeline.get(key);
        queryKeys.push(`${query.featureKey}:${query.entityId}`);
      }

      const pipelineResults = await pipeline.exec();
      
      if (!pipelineResults) {
        throw new Error('Pipeline execution failed');
      }

      for (let i = 0; i < queries.length; i++) {
        const [error, value] = pipelineResults[i];
        const queryKey = queryKeys[i];
        
        if (error) {
          this.logger.error('Failed to get feature in batch', { queryKey, error });
          results.set(queryKey, null);
          continue;
        }

        if (value) {
          const parsedValue = JSON.parse(value as string);
          results.set(queryKey, {
            value: parsedValue.value,
            timestamp: new Date(parsedValue.timestamp),
            version: parsedValue.version,
            source: parsedValue.source
          });
          this.updateAccessMetrics(queries[i].featureKey);
        } else {
          results.set(queryKey, null);
        }
      }

      return results;
    } catch (error) {
      this.logger.error('Failed to get batch features from online store', { queriesCount: queries.length, error });
      this.emit('error', { operation: 'getBatch', queries, error });
      throw error;
    }
  }

  async set(featureKey: string, entityId: string, value: FeatureValue): Promise<void> {
    try {
      const key = this.buildFeatureKey(featureKey, entityId);
      const serializedValue = JSON.stringify({
        value: value.value,
        timestamp: value.timestamp.toISOString(),
        version: value.version,
        source: value.source
      });

      // Set with TTL if configured
      const feature = await this.registry.getFeature(featureKey);
      const ttl = feature?.ttl || this.config.defaultTtl;

      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }

      this.updateWriteMetrics(featureKey);
      this.emit('featureUpdated', { featureKey, entityId, value });
    } catch (error) {
      this.logger.error('Failed to set feature in online store', { featureKey, entityId, error });
      this.emit('error', { operation: 'set', featureKey, entityId, error });
      throw error;
    }
  }

  async setBatch(features: Array<{ featureKey: string; entityId: string; value: FeatureValue }>): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();

      for (const { featureKey, entityId, value } of features) {
        const key = this.buildFeatureKey(featureKey, entityId);
        const serializedValue = JSON.stringify({
          value: value.value,
          timestamp: value.timestamp.toISOString(),
          version: value.version,
          source: value.source
        });

        const feature = await this.registry.getFeature(featureKey);
        const ttl = feature?.ttl || this.config.defaultTtl;

        if (ttl) {
          pipeline.setex(key, ttl, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }

        this.updateWriteMetrics(featureKey);
      }

      await pipeline.exec();
      this.emit('batchFeaturesUpdated', { features });
    } catch (error) {
      this.logger.error('Failed to set batch features in online store', { featuresCount: features.length, error });
      this.emit('error', { operation: 'setBatch', features, error });
      throw error;
    }
  }

  async delete(featureKey: string, entityId: string): Promise<void> {
    try {
      const key = this.buildFeatureKey(featureKey, entityId);
      await this.redis.del(key);
      this.emit('featureDeleted', { featureKey, entityId });
    } catch (error) {
      this.logger.error('Failed to delete feature from online store', { featureKey, entityId, error });
      this.emit('error', { operation: 'delete', featureKey, entityId, error });
      throw error;
    }
  }

  async getHealth(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; latency: number; metrics: any }> {
    const start = Date.now();
    
    try {
      await this.redis.ping();
      const latency = Date.now() - start;
      
      return {
        status: this.healthStatus,
        latency,
        metrics: {
          totalFeatures: await this.redis.dbsize(),
          memoryUsage: await this.redis.memory('usage'),
          accessMetrics: Object.fromEntries(this.metrics)
        }
      };
    } catch (error) {
      this.healthStatus = 'unhealthy';
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        metrics: { error: error.message }
      };
    }
  }

  private buildFeatureKey(featureKey: string, entityId: string): string {
    return `feature:${featureKey}:${entityId}`;
  }

  private updateAccessMetrics(featureKey: string): void {
    const metrics = this.metrics.get(featureKey) || {
      accessCount: 0,
      lastAccessed: new Date(),
      avgLatency: 0,
      errorRate: 0,
      qualityScore: 1.0
    };

    metrics.accessCount++;
    metrics.lastAccessed = new Date();
    this.metrics.set(featureKey, metrics);
  }

  private updateWriteMetrics(featureKey: string): void {
    const metrics = this.metrics.get(featureKey) || {
      accessCount: 0,
      lastAccessed: new Date(),
      avgLatency: 0,
      errorRate: 0,
      qualityScore: 1.0
    };

    metrics.lastAccessed = new Date();
    this.metrics.set(featureKey, metrics);
  }

  private startHealthCheck(): void {
    setInterval(async () => {
      try {
        const health = await this.getHealth();
        if (health.latency > this.config.healthCheck.latencyThreshold) {
          this.healthStatus = 'degraded';
        } else {
          this.healthStatus = 'healthy';
        }
      } catch (error) {
        this.healthStatus = 'unhealthy';
        this.logger.error('Health check failed', { error });
      }
    }, this.config.healthCheck.interval);
  }
}

/**
 * Offline Feature Store Implementation
 * Batch feature computation and historical feature serving
 */
export class OfflineFeatureStoreImpl extends EventEmitter implements OfflineFeatureStore {
  private logger: Logger;
  private registry: FeatureRegistry;
  private config: FeatureStorageConfig;
  private computeJobs: Map<string, any> = new Map();

  constructor(
    registry: FeatureRegistry,
    config: FeatureStorageConfig,
    logger: Logger
  ) {
    super();
    this.registry = registry;
    this.config = config;
    this.logger = logger;
  }

  async computeFeatures(
    featureGroup: FeatureGroup,
    startTime: Date,
    endTime: Date,
    options?: { parallelism?: number; chunkSize?: number }
  ): Promise<string> {
    try {
      const jobId = this.generateJobId();
      const computeOptions = {
        parallelism: options?.parallelism || this.config.defaultParallelism,
        chunkSize: options?.chunkSize || this.config.defaultChunkSize
      };

      this.logger.info('Starting offline feature computation', {
        jobId,
        featureGroup: featureGroup.name,
        startTime,
        endTime,
        options: computeOptions
      });

      // Create compute job
      const job = {
        id: jobId,
        featureGroup,
        startTime,
        endTime,
        options: computeOptions,
        status: 'running',
        createdAt: new Date(),
        progress: 0
      };

      this.computeJobs.set(jobId, job);

      // Start async computation
      this.executeFeatureComputation(job).catch(error => {
        this.logger.error('Feature computation failed', { jobId, error });
        job.status = 'failed';
        job.error = error.message;
        this.emit('computationFailed', { jobId, error });
      });

      return jobId;
    } catch (error) {
      this.logger.error('Failed to start feature computation', { featureGroup: featureGroup.name, error });
      throw error;
    }
  }

  async getHistoricalFeatures(
    featureKeys: string[],
    entityIds: string[],
    pointInTime: Date,
    options?: FeatureRetrievalOptions
  ): Promise<Map<string, Map<string, FeatureValue | null>>> {
    try {
      const results = new Map<string, Map<string, FeatureValue | null>>();

      // Initialize result structure
      for (const entityId of entityIds) {
        results.set(entityId, new Map());
      }

      // Retrieve historical features for each feature key
      for (const featureKey of featureKeys) {
        const feature = await this.registry.getFeature(featureKey);
        if (!feature) {
          this.logger.warn('Feature not found in registry', { featureKey });
          continue;
        }

        // Query historical data store (implementation depends on storage backend)
        const historicalData = await this.queryHistoricalData(
          featureKey,
          entityIds,
          pointInTime,
          options
        );

        // Populate results
        for (const [entityId, value] of historicalData) {
          const entityResults = results.get(entityId);
          if (entityResults) {
            entityResults.set(featureKey, value);
          }
        }
      }

      return results;
    } catch (error) {
      this.logger.error('Failed to get historical features', { featureKeys, entityIds: entityIds.length, pointInTime, error });
      throw error;
    }
  }

  async getComputationStatus(jobId: string): Promise<{
    status: 'running' | 'completed' | 'failed';
    progress: number;
    startTime: Date;
    endTime?: Date;
    error?: string;
  }> {
    const job = this.computeJobs.get(jobId);
    if (!job) {
      throw new Error(`Computation job not found: ${jobId}`);
    }

    return {
      status: job.status,
      progress: job.progress,
      startTime: job.createdAt,
      endTime: job.completedAt,
      error: job.error
    };
  }

  async createFeatureView(
    name: string,
    features: string[],
    entities: string[],
    filterExpression?: string
  ): Promise<void> {
    try {
      // Create materialized view for efficient feature serving
      this.logger.info('Creating feature view', { name, features, entities, filterExpression });

      // Implementation depends on storage backend (BigQuery, Snowflake, etc.)
      await this.createMaterializedView(name, features, entities, filterExpression);

      this.emit('featureViewCreated', { name, features, entities });
    } catch (error) {
      this.logger.error('Failed to create feature view', { name, error });
      throw error;
    }
  }

  private async executeFeatureComputation(job: any): Promise<void> {
    try {
      const { featureGroup, startTime, endTime, options } = job;
      
      // Divide time range into chunks for parallel processing
      const timeChunks = this.createTimeChunks(startTime, endTime, options.chunkSize);
      let completedChunks = 0;

      // Process chunks in parallel
      const chunkPromises = timeChunks.map(async (chunk) => {
        try {
          await this.computeFeatureChunk(featureGroup, chunk.start, chunk.end);
          completedChunks++;
          job.progress = completedChunks / timeChunks.length;
          this.emit('computationProgress', { jobId: job.id, progress: job.progress });
        } catch (error) {
          this.logger.error('Failed to compute feature chunk', { jobId: job.id, chunk, error });
          throw error;
        }
      });

      await Promise.all(chunkPromises);

      job.status = 'completed';
      job.completedAt = new Date();
      job.progress = 1.0;

      this.logger.info('Feature computation completed', { jobId: job.id });
      this.emit('computationCompleted', { jobId: job.id });
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.completedAt = new Date();
      throw error;
    }
  }

  private async computeFeatureChunk(
    featureGroup: FeatureGroup,
    startTime: Date,
    endTime: Date
  ): Promise<void> {
    // Implementation depends on feature computation logic
    // This would typically involve:
    // 1. Loading raw data for the time period
    // 2. Applying feature transformations
    // 3. Computing aggregations
    // 4. Storing results in feature store

    this.logger.debug('Computing feature chunk', {
      featureGroup: featureGroup.name,
      startTime,
      endTime
    });

    // Simulate computation time
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async queryHistoricalData(
    featureKey: string,
    entityIds: string[],
    pointInTime: Date,
    options?: FeatureRetrievalOptions
  ): Promise<Map<string, FeatureValue | null>> {
    // Implementation depends on storage backend
    // This would typically query a data warehouse or time-series database
    
    const results = new Map<string, FeatureValue | null>();
    
    // Placeholder implementation
    for (const entityId of entityIds) {
      results.set(entityId, null);
    }

    return results;
  }

  private async createMaterializedView(
    name: string,
    features: string[],
    entities: string[],
    filterExpression?: string
  ): Promise<void> {
    // Implementation depends on storage backend
    this.logger.debug('Creating materialized view', { name, features, entities, filterExpression });
  }

  private createTimeChunks(startTime: Date, endTime: Date, chunkSizeHours: number): Array<{ start: Date; end: Date }> {
    const chunks = [];
    let currentStart = new Date(startTime);
    
    while (currentStart < endTime) {
      const currentEnd = new Date(currentStart.getTime() + chunkSizeHours * 60 * 60 * 1000);
      if (currentEnd > endTime) {
        chunks.push({ start: currentStart, end: endTime });
        break;
      } else {
        chunks.push({ start: currentStart, end: currentEnd });
        currentStart = currentEnd;
      }
    }
    
    return chunks;
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Feature Registry Implementation
 * Centralized catalog of all features with metadata, lineage, and governance
 */
export class FeatureRegistryImpl extends EventEmitter implements FeatureRegistry {
  private features: Map<string, Feature> = new Map();
  private featureGroups: Map<string, FeatureGroup> = new Map();
  private lineage: Map<string, FeatureLineage> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    super();
    this.logger = logger;
  }

  async registerFeature(registration: FeatureRegistration): Promise<void> {
    try {
      const feature: Feature = {
        key: registration.key,
        name: registration.name,
        description: registration.description,
        dataType: registration.dataType,
        tags: registration.tags || [],
        owner: registration.owner,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: registration.version || '1.0.0',
        source: registration.source,
        transformation: registration.transformation,
        validationRules: registration.validationRules || [],
        ttl: registration.ttl
      };

      this.features.set(registration.key, feature);

      // Create lineage entry
      if (registration.dependencies) {
        const lineage: FeatureLineage = {
          featureKey: registration.key,
          dependencies: registration.dependencies,
          dependents: [],
          transformation: registration.transformation,
          createdAt: new Date()
        };
        this.lineage.set(registration.key, lineage);

        // Update dependents
        for (const dep of registration.dependencies) {
          const depLineage = this.lineage.get(dep);
          if (depLineage) {
            depLineage.dependents.push(registration.key);
          }
        }
      }

      this.logger.info('Feature registered', { featureKey: registration.key });
      this.emit('featureRegistered', { feature });
    } catch (error) {
      this.logger.error('Failed to register feature', { registration, error });
      throw error;
    }
  }

  async getFeature(key: string): Promise<Feature | null> {
    return this.features.get(key) || null;
  }

  async listFeatures(options?: {
    tags?: string[];
    owner?: string;
    dataType?: string;
  }): Promise<Feature[]> {
    let features = Array.from(this.features.values());

    if (options?.tags) {
      features = features.filter(f => 
        options.tags!.some(tag => f.tags.includes(tag))
      );
    }

    if (options?.owner) {
      features = features.filter(f => f.owner === options.owner);
    }

    if (options?.dataType) {
      features = features.filter(f => f.dataType === options.dataType);
    }

    return features;
  }

  async registerFeatureGroup(group: FeatureGroup): Promise<void> {
    try {
      this.featureGroups.set(group.name, {
        ...group,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      this.logger.info('Feature group registered', { groupName: group.name });
      this.emit('featureGroupRegistered', { group });
    } catch (error) {
      this.logger.error('Failed to register feature group', { group, error });
      throw error;
    }
  }

  async getFeatureGroup(name: string): Promise<FeatureGroup | null> {
    return this.featureGroups.get(name) || null;
  }

  async getFeatureLineage(featureKey: string): Promise<FeatureLineage | null> {
    return this.lineage.get(featureKey) || null;
  }

  async getFeatureMetrics(featureKey: string): Promise<FeatureQualityMetrics | null> {
    // Implementation would query metrics storage
    return null;
  }

  async updateFeatureMetrics(featureKey: string, metrics: FeatureQualityMetrics): Promise<void> {
    // Implementation would update metrics storage
    this.emit('featureMetricsUpdated', { featureKey, metrics });
  }
}

/**
 * Main Feature Store Implementation
 * Coordinates online and offline stores with registry and quality monitoring
 */
export class FeatureStoreImpl extends EventEmitter implements FeatureStore {
  private onlineStore: OnlineFeatureStore;
  private offlineStore: OfflineFeatureStore;
  private registry: FeatureRegistry;
  private logger: Logger;

  constructor(
    onlineStore: OnlineFeatureStore,
    offlineStore: OfflineFeatureStore,
    registry: FeatureRegistry,
    logger: Logger
  ) {
    super();
    this.onlineStore = onlineStore;
    this.offlineStore = offlineStore;
    this.registry = registry;
    this.logger = logger;

    // Forward events
    this.onlineStore.on('error', (event) => this.emit('onlineStoreError', event));
    this.offlineStore.on('error', (event) => this.emit('offlineStoreError', event));
    this.registry.on('featureRegistered', (event) => this.emit('featureRegistered', event));
  }

  get online(): OnlineFeatureStore {
    return this.onlineStore;
  }

  get offline(): OfflineFeatureStore {
    return this.offlineStore;
  }

  get features(): FeatureRegistry {
    return this.registry;
  }

  async getHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    components: {
      onlineStore: any;
      offlineStore: any;
      registry: any;
    };
  }> {
    try {
      const [onlineHealth] = await Promise.all([
        this.onlineStore.getHealth()
      ]);

      let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (onlineHealth.status === 'unhealthy') {
        overall = 'unhealthy';
      } else if (onlineHealth.status === 'degraded') {
        overall = 'degraded';
      }

      return {
        overall,
        components: {
          onlineStore: onlineHealth,
          offlineStore: { status: 'healthy' }, // Simplified
          registry: { status: 'healthy' } // Simplified
        }
      };
    } catch (error) {
      this.logger.error('Failed to get feature store health', { error });
      return {
        overall: 'unhealthy',
        components: {
          onlineStore: { status: 'unhealthy', error: error.message },
          offlineStore: { status: 'unknown' },
          registry: { status: 'unknown' }
        }
      };
    }
  }
}