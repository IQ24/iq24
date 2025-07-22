/**
 * IQ24.ai Data Pipeline - Main Entry Point
 * 
 * Unified interface for all data pipeline operations including:
 * - Feature store management (online/offline)
 * - Real-time stream processing
 * - ML model lifecycle management
 * - Data quality monitoring
 * - Transformation engines
 * - Data lineage tracking
 * 
 * Provides enterprise-grade data infrastructure for AI agent orchestration
 */

import { EventEmitter } from 'events';
import { 
  DataPipelineConfig, 
  PipelineMetrics, 
  PipelineHealth,
  DataSource,
  FeatureDefinition,
  ModelDefinition,
  QualityRule,
  TransformationDefinition,
  StreamConfig,
  LineageNode
} from './types';

import { PipelineEngine } from './engine/pipeline-engine';
import { FeatureStore } from './stores/feature-store';
import { TransformationEngine } from './transformations/transformation-engine';
import { QualityMonitor } from './quality/quality-monitor';
import { ModelStore } from './models/model-store';
import { StreamProcessor } from './streaming/stream-processor';
import { LineageTracker } from './lineage/lineage-tracker';

export interface DataPipelineOptions {
  config: DataPipelineConfig;
  enableStreaming?: boolean;
  enableLineageTracking?: boolean;
  autoStartMonitoring?: boolean;
}

export class DataPipeline extends EventEmitter {
  private config: DataPipelineConfig;
  private pipelineEngine: PipelineEngine;
  private featureStore: FeatureStore;
  private transformationEngine: TransformationEngine;
  private qualityMonitor: QualityMonitor;
  private modelStore: ModelStore;
  private streamProcessor?: StreamProcessor;
  private lineageTracker?: LineageTracker;
  private healthMonitor: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private isShuttingDown = false;

  constructor(options: DataPipelineOptions) {
    super();
    this.config = options.config;

    // Initialize core components
    this.pipelineEngine = new PipelineEngine(this.config.pipeline);
    this.featureStore = new FeatureStore(this.config.featureStore);
    this.transformationEngine = new TransformationEngine(this.config.transformations);
    this.qualityMonitor = new QualityMonitor(this.config.quality);
    this.modelStore = new ModelStore(this.config.models);

    // Initialize optional components
    if (options.enableStreaming && this.config.streaming) {
      this.streamProcessor = new StreamProcessor(this.config.streaming);
    }

    if (options.enableLineageTracking && this.config.lineage) {
      this.lineageTracker = new LineageTracker(this.config.lineage);
    }

    this.setupEventHandlers();
    
    if (options.autoStartMonitoring !== false) {
      this.startHealthMonitoring();
    }
  }

  /**
   * Initialize the data pipeline
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing IQ24.ai Data Pipeline...');

      // Initialize core components in dependency order
      await this.featureStore.initialize();
      await this.transformationEngine.initialize();
      await this.qualityMonitor.initialize();
      await this.modelStore.initialize();
      await this.pipelineEngine.initialize();

      // Initialize optional components
      if (this.streamProcessor) {
        await this.streamProcessor.initialize();
      }

      if (this.lineageTracker) {
        await this.lineageTracker.initialize();
      }

      this.isInitialized = true;
      console.log('✅ Data Pipeline initialized successfully');
      this.emit('initialized');

    } catch (error) {
      console.error('❌ Failed to initialize Data Pipeline:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Feature Store Operations
   */
  async defineFeature(definition: FeatureDefinition): Promise<void> {
    await this.featureStore.defineFeature(definition);
    if (this.lineageTracker) {
      await this.lineageTracker.trackSchemaChange({
        entityId: definition.name,
        entityType: 'feature',
        changeType: 'CREATE',
        metadata: { definition }
      });
    }
  }

  async getFeature(name: string, entityId: string): Promise<any> {
    return this.featureStore.getFeature(name, entityId);
  }

  async getFeatures(names: string[], entityId: string): Promise<Record<string, any>> {
    return this.featureStore.getFeatures(names, entityId);
  }

  async setFeature(name: string, entityId: string, value: any): Promise<void> {
    await this.featureStore.setFeature(name, entityId, value);
  }

  async computeFeatures(entityIds: string[], featureNames?: string[]): Promise<void> {
    await this.featureStore.computeFeatures(entityIds, featureNames);
  }

  /**
   * Data Pipeline Operations
   */
  async processPipeline(pipelineId: string, data: any[]): Promise<any[]> {
    const startTime = Date.now();
    
    try {
      // Track lineage
      if (this.lineageTracker) {
        await this.lineageTracker.trackDataFlow({
          sourceId: 'input',
          targetId: pipelineId,
          dataType: 'pipeline_input',
          metadata: { recordCount: data.length }
        });
      }

      // Process through pipeline
      const result = await this.pipelineEngine.processPipeline(pipelineId, data);

      // Track completion
      if (this.lineageTracker) {
        await this.lineageTracker.trackDataFlow({
          sourceId: pipelineId,
          targetId: 'output',
          dataType: 'pipeline_output',
          metadata: { recordCount: result.length, processingTimeMs: Date.now() - startTime }
        });
      }

      return result;
    } catch (error) {
      console.error(`Pipeline processing failed for ${pipelineId}:`, error);
      throw error;
    }
  }

  async runQualityChecks(dataSource: string, data: any[]): Promise<any> {
    return this.qualityMonitor.runChecks(dataSource, data);
  }

  /**
   * ML Model Operations
   */
  async registerModel(definition: ModelDefinition, modelData: Buffer): Promise<string> {
    const modelId = await this.modelStore.registerModel(definition, modelData);
    
    if (this.lineageTracker) {
      await this.lineageTracker.trackSchemaChange({
        entityId: modelId,
        entityType: 'model',
        changeType: 'CREATE',
        metadata: { definition }
      });
    }

    return modelId;
  }

  async deployModel(modelId: string, config?: any): Promise<void> {
    await this.modelStore.deployModel(modelId, config);
    
    if (this.lineageTracker) {
      await this.lineageTracker.trackSchemaChange({
        entityId: modelId,
        entityType: 'model',
        changeType: 'DEPLOY',
        metadata: { config }
      });
    }
  }

  async predict(modelId: string, features: Record<string, any>): Promise<any> {
    return this.modelStore.predict(modelId, features);
  }

  async batchPredict(modelId: string, featureSets: Record<string, any>[]): Promise<any[]> {
    return this.modelStore.batchPredict(modelId, featureSets);
  }

  /**
   * Stream Processing Operations (if enabled)
   */
  async startStreamProcessing(): Promise<void> {
    if (!this.streamProcessor) {
      throw new Error('Stream processing not enabled');
    }
    await this.streamProcessor.start();
  }

  async stopStreamProcessing(): Promise<void> {
    if (!this.streamProcessor) {
      throw new Error('Stream processing not enabled');
    }
    await this.streamProcessor.stop();
  }

  async publishToStream(topic: string, data: any): Promise<void> {
    if (!this.streamProcessor) {
      throw new Error('Stream processing not enabled');
    }
    await this.streamProcessor.publish(topic, data);
  }

  /**
   * Data Lineage Operations (if enabled)
   */
  async getDataLineage(entityId: string, depth: number = 3): Promise<LineageNode[]> {
    if (!this.lineageTracker) {
      throw new Error('Data lineage tracking not enabled');
    }
    return this.lineageTracker.getLineage(entityId, depth);
  }

  async analyzeImpact(entityId: string): Promise<any> {
    if (!this.lineageTracker) {
      throw new Error('Data lineage tracking not enabled');
    }
    return this.lineageTracker.analyzeImpact(entityId);
  }

  /**
   * Health and Monitoring
   */
  async getHealth(): Promise<PipelineHealth> {
    const components = {
      pipelineEngine: await this.pipelineEngine.getHealth(),
      featureStore: await this.featureStore.getHealth(),
      transformationEngine: await this.transformationEngine.getHealth(),
      qualityMonitor: await this.qualityMonitor.getHealth(),
      modelStore: await this.modelStore.getHealth(),
      ...(this.streamProcessor && { streamProcessor: await this.streamProcessor.getHealth() }),
      ...(this.lineageTracker && { lineageTracker: await this.lineageTracker.getHealth() })
    };

    const overallStatus = Object.values(components).every(c => c.status === 'healthy') 
      ? 'healthy' 
      : Object.values(components).some(c => c.status === 'degraded') 
        ? 'degraded' 
        : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      components,
      uptime: process.uptime(),
      initialized: this.isInitialized
    };
  }

  async getMetrics(): Promise<PipelineMetrics> {
    const [
      pipelineMetrics,
      featureMetrics,
      qualityMetrics,
      modelMetrics,
      streamMetrics,
      lineageMetrics
    ] = await Promise.all([
      this.pipelineEngine.getMetrics(),
      this.featureStore.getMetrics(),
      this.qualityMonitor.getMetrics(),
      this.modelStore.getMetrics(),
      this.streamProcessor?.getMetrics(),
      this.lineageTracker?.getMetrics()
    ]);

    return {
      timestamp: new Date().toISOString(),
      pipeline: pipelineMetrics,
      features: featureMetrics,
      quality: qualityMetrics,
      models: modelMetrics,
      ...(streamMetrics && { streaming: streamMetrics }),
      ...(lineageMetrics && { lineage: lineageMetrics })
    };
  }

  /**
   * Utility Methods
   */
  async transformData(transformationId: string, data: any[]): Promise<any[]> {
    return this.transformationEngine.transform(transformationId, data);
  }

  async registerQualityRule(rule: QualityRule): Promise<void> {
    await this.qualityMonitor.registerRule(rule);
  }

  async createTransformation(definition: TransformationDefinition): Promise<void> {
    await this.transformationEngine.createTransformation(definition);
  }

  /**
   * Event Handlers
   */
  private setupEventHandlers(): void {
    // Pipeline Engine Events
    this.pipelineEngine.on('pipeline_completed', (data) => {
      this.emit('pipeline_completed', data);
    });

    this.pipelineEngine.on('pipeline_failed', (data) => {
      this.emit('pipeline_failed', data);
    });

    // Feature Store Events
    this.featureStore.on('feature_computed', (data) => {
      this.emit('feature_computed', data);
    });

    // Quality Monitor Events
    this.qualityMonitor.on('quality_check_failed', (data) => {
      this.emit('quality_check_failed', data);
    });

    // Model Store Events
    this.modelStore.on('model_deployed', (data) => {
      this.emit('model_deployed', data);
    });

    this.modelStore.on('prediction_completed', (data) => {
      this.emit('prediction_completed', data);
    });

    // Stream Processor Events (if enabled)
    if (this.streamProcessor) {
      this.streamProcessor.on('stream_processed', (data) => {
        this.emit('stream_processed', data);
      });

      this.streamProcessor.on('stream_error', (data) => {
        this.emit('stream_error', data);
      });
    }

    // Error handling
    this.on('error', (error) => {
      console.error('❌ Data Pipeline Error:', error);
    });
  }

  /**
   * Health Monitoring
   */
  private startHealthMonitoring(): void {
    this.healthMonitor = setInterval(async () => {
      try {
        const health = await this.getHealth();
        if (health.status !== 'healthy') {
          this.emit('health_degraded', health);
        }
      } catch (error) {
        this.emit('health_check_failed', error);
      }
    }, 30000); // Check every 30 seconds
  }

  private stopHealthMonitoring(): void {
    if (this.healthMonitor) {
      clearInterval(this.healthMonitor);
      this.healthMonitor = null;
    }
  }

  /**
   * Graceful Shutdown
   */
  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    console.log('🔄 Shutting down Data Pipeline...');

    try {
      // Stop health monitoring
      this.stopHealthMonitoring();

      // Stop optional components first
      if (this.streamProcessor) {
        await this.streamProcessor.stop();
      }

      if (this.lineageTracker) {
        await this.lineageTracker.shutdown();
      }

      // Stop core components
      await Promise.all([
        this.pipelineEngine.shutdown(),
        this.featureStore.shutdown(),
        this.transformationEngine.shutdown(),
        this.qualityMonitor.shutdown(),
        this.modelStore.shutdown()
      ]);

      console.log('✅ Data Pipeline shutdown complete');
      this.emit('shutdown');

    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      this.emit('error', error);
      throw error;
    }
  }
}

// Export main class and types
export * from './types';
export { DataPipeline };

// Export individual components for advanced usage
export {
  PipelineEngine,
  FeatureStore,
  TransformationEngine,
  QualityMonitor,
  ModelStore,
  StreamProcessor,
  LineageTracker
};

// Convenience factory function
export function createDataPipeline(options: DataPipelineOptions): DataPipeline {
  return new DataPipeline(options);
}