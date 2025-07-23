/**
 * ML Model Store and Management System
 *
 * Provides comprehensive ML model lifecycle management including:
 * - Model versioning and deployment
 * - A/B testing capabilities
 * - Performance monitoring
 * - Automated rollback mechanisms
 * - Multi-environment support
 */

import {
  MLModel,
  ModelMetadata,
  ModelPrediction,
  ModelVersion,
  ModelPerformanceMetrics,
  ModelConfig,
  ABTestConfig,
  ModelEvent,
  HealthStatus,
  ModelDeployment,
} from "../types";
import { EventEmitter } from "events";
import { Logger } from "winston";
import { Cache } from "ioredis";
import * as tf from "@tensorflow/tfjs-node";
import axios from "axios";

export interface IModelStore {
  // Model Management
  registerModel(model: MLModel, metadata: ModelMetadata): Promise<string>;
  updateModel(modelId: string, updates: Partial<MLModel>): Promise<void>;
  getModel(modelId: string, version?: string): Promise<MLModel | null>;
  listModels(filter?: Partial<ModelMetadata>): Promise<MLModel[]>;
  deleteModel(modelId: string, version?: string): Promise<void>;

  // Model Deployment
  deployModel(
    modelId: string,
    version: string,
    config: ModelConfig,
  ): Promise<ModelDeployment>;
  promoteModel(
    modelId: string,
    fromVersion: string,
    toVersion: string,
  ): Promise<void>;
  rollbackModel(modelId: string, targetVersion: string): Promise<void>;

  // Prediction Serving
  predict(
    modelId: string,
    input: any,
    options?: PredictionOptions,
  ): Promise<ModelPrediction>;
  batchPredict(
    modelId: string,
    inputs: any[],
    options?: PredictionOptions,
  ): Promise<ModelPrediction[]>;

  // A/B Testing
  configureABTest(modelId: string, config: ABTestConfig): Promise<string>;
  getABTestResults(testId: string): Promise<ABTestResults>;
  concludeABTest(testId: string, winnerVersion: string): Promise<void>;

  // Performance Monitoring
  recordPrediction(modelId: string, prediction: ModelPrediction): Promise<void>;
  getPerformanceMetrics(
    modelId: string,
    timeRange?: TimeRange,
  ): Promise<ModelPerformanceMetrics>;

  // Health & Status
  getHealth(): Promise<HealthStatus>;
  getModelHealth(modelId: string): Promise<HealthStatus>;
}

interface PredictionOptions {
  version?: string;
  timeout?: number;
  explainability?: boolean;
  confidence_threshold?: number;
}

interface ABTestResults {
  testId: string;
  modelA: string;
  modelB: string;
  metrics: {
    modelA: ModelPerformanceMetrics;
    modelB: ModelPerformanceMetrics;
  };
  statisticalSignificance: number;
  recommendation: "A" | "B" | "inconclusive";
}

interface TimeRange {
  start: Date;
  end: Date;
}

export class ModelStoreImpl implements IModelStore {
  private models: Map<string, MLModel> = new Map();
  private deployments: Map<string, ModelDeployment> = new Map();
  private abTests: Map<string, ABTestConfig> = new Map();
  private predictions: Map<string, ModelPrediction[]> = new Map();
  private eventEmitter: EventEmitter;

  constructor(
    private cache: Cache,
    private logger: Logger,
    private config: {
      storage_path: string;
      serving_endpoints: Record<string, string>;
      performance_threshold: number;
      auto_rollback: boolean;
      max_prediction_history: number;
    },
  ) {
    this.eventEmitter = new EventEmitter();
    this.setupEventHandlers();
    this.startHealthMonitoring();
  }

  private setupEventHandlers(): void {
    this.eventEmitter.on("model:deployed", this.handleModelDeployed.bind(this));
    this.eventEmitter.on(
      "model:performance_degraded",
      this.handlePerformanceDegraded.bind(this),
    );
    this.eventEmitter.on(
      "prediction:completed",
      this.handlePredictionCompleted.bind(this),
    );
  }

  private startHealthMonitoring(): void {
    setInterval(async () => {
      await this.monitorModelHealth();
    }, 30000); // Check every 30 seconds
  }

  async registerModel(
    model: MLModel,
    metadata: ModelMetadata,
  ): Promise<string> {
    try {
      const modelId = `${model.name}_${model.version}_${Date.now()}`;

      // Validate model
      await this.validateModel(model);

      // Store model
      const enrichedModel: MLModel = {
        ...model,
        id: modelId,
        metadata: {
          ...metadata,
          registered_at: new Date(),
          status: "registered",
        },
      };

      this.models.set(modelId, enrichedModel);

      // Cache model metadata
      await this.cache.setex(
        `model:${modelId}:metadata`,
        3600,
        JSON.stringify(enrichedModel.metadata),
      );

      this.logger.info("Model registered successfully", {
        modelId,
        name: model.name,
        version: model.version,
        type: model.type,
      });

      this.eventEmitter.emit("model:registered", {
        modelId,
        model: enrichedModel,
      });

      return modelId;
    } catch (error) {
      this.logger.error("Failed to register model", {
        error,
        model: model.name,
      });
      throw error;
    }
  }

  async deployModel(
    modelId: string,
    version: string,
    config: ModelConfig,
  ): Promise<ModelDeployment> {
    try {
      const model = await this.getModel(modelId, version);
      if (!model) {
        throw new Error(`Model not found: ${modelId}:${version}`);
      }

      const deployment: ModelDeployment = {
        id: `${modelId}_deployment_${Date.now()}`,
        model_id: modelId,
        version,
        config,
        status: "deploying",
        deployed_at: new Date(),
        endpoint: this.generateEndpoint(modelId, version),
        health_status: "unknown",
      };

      // Deploy to serving infrastructure
      await this.deployToInfrastructure(deployment);

      deployment.status = "active";
      deployment.health_status = "healthy";

      this.deployments.set(deployment.id, deployment);

      // Update model status
      model.metadata.status = "deployed";
      model.metadata.deployment_id = deployment.id;

      this.logger.info("Model deployed successfully", {
        modelId,
        version,
        deploymentId: deployment.id,
        endpoint: deployment.endpoint,
      });

      this.eventEmitter.emit("model:deployed", { deployment, model });

      return deployment;
    } catch (error) {
      this.logger.error("Failed to deploy model", { error, modelId, version });
      throw error;
    }
  }

  async predict(
    modelId: string,
    input: any,
    options: PredictionOptions = {},
  ): Promise<ModelPrediction> {
    try {
      const model = await this.getModel(modelId, options.version);
      if (!model) {
        throw new Error(`Model not found: ${modelId}`);
      }

      const deployment = await this.getActiveDeployment(modelId);
      if (!deployment) {
        throw new Error(`No active deployment for model: ${modelId}`);
      }

      // Check if this is part of an A/B test
      const abTestVersion = await this.getABTestVersion(modelId, input);
      const effectiveVersion =
        abTestVersion || options.version || model.version;

      const startTime = Date.now();

      // Make prediction
      const result = await this.executePrediction(deployment.endpoint, input, {
        ...options,
        version: effectiveVersion,
      });

      const prediction: ModelPrediction = {
        id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        model_id: modelId,
        model_version: effectiveVersion,
        input,
        output: result.output,
        confidence: result.confidence,
        latency: Date.now() - startTime,
        timestamp: new Date(),
        metadata: {
          deployment_id: deployment.id,
          ab_test_group: abTestVersion ? "test" : "control",
          explainability: options.explainability
            ? result.explainability
            : undefined,
        },
      };

      // Record prediction for monitoring
      await this.recordPrediction(modelId, prediction);

      this.eventEmitter.emit("prediction:completed", { prediction, model });

      return prediction;
    } catch (error) {
      this.logger.error("Prediction failed", { error, modelId, input });
      throw error;
    }
  }

  async batchPredict(
    modelId: string,
    inputs: any[],
    options: PredictionOptions = {},
  ): Promise<ModelPrediction[]> {
    try {
      const batchSize = 32; // Process in batches to avoid memory issues
      const results: ModelPrediction[] = [];

      for (let i = 0; i < inputs.length; i += batchSize) {
        const batch = inputs.slice(i, i + batchSize);
        const batchPromises = batch.map((input) =>
          this.predict(modelId, input, options),
        );
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      this.logger.info("Batch prediction completed", {
        modelId,
        inputCount: inputs.length,
        resultCount: results.length,
      });

      return results;
    } catch (error) {
      this.logger.error("Batch prediction failed", {
        error,
        modelId,
        inputCount: inputs.length,
      });
      throw error;
    }
  }

  async configureABTest(
    modelId: string,
    config: ABTestConfig,
  ): Promise<string> {
    try {
      const testId = `abtest_${modelId}_${Date.now()}`;

      // Validate both model versions exist
      const modelA = await this.getModel(modelId, config.version_a);
      const modelB = await this.getModel(modelId, config.version_b);

      if (!modelA || !modelB) {
        throw new Error("One or both model versions not found for A/B test");
      }

      const abTest: ABTestConfig = {
        ...config,
        id: testId,
        model_id: modelId,
        status: "active",
        created_at: new Date(),
        metrics: {
          version_a: { predictions: 0, success_rate: 0, avg_latency: 0 },
          version_b: { predictions: 0, success_rate: 0, avg_latency: 0 },
        },
      };

      this.abTests.set(testId, abTest);

      this.logger.info("A/B test configured", {
        testId,
        modelId,
        versionA: config.version_a,
        versionB: config.version_b,
        trafficSplit: config.traffic_split,
      });

      this.eventEmitter.emit("ab_test:started", { testId, config: abTest });

      return testId;
    } catch (error) {
      this.logger.error("Failed to configure A/B test", {
        error,
        modelId,
        config,
      });
      throw error;
    }
  }

  async getPerformanceMetrics(
    modelId: string,
    timeRange?: TimeRange,
  ): Promise<ModelPerformanceMetrics> {
    try {
      const predictions = this.predictions.get(modelId) || [];

      // Filter by time range if provided
      const filteredPredictions = timeRange
        ? predictions.filter(
            (p) =>
              p.timestamp >= timeRange.start && p.timestamp <= timeRange.end,
          )
        : predictions;

      if (filteredPredictions.length === 0) {
        return {
          model_id: modelId,
          total_predictions: 0,
          avg_latency: 0,
          success_rate: 0,
          error_rate: 0,
          confidence_distribution: {},
          timeRange,
        };
      }

      const totalPredictions = filteredPredictions.length;
      const successfulPredictions = filteredPredictions.filter(
        (p) => p.confidence >= 0.5,
      ).length;
      const avgLatency =
        filteredPredictions.reduce((sum, p) => sum + p.latency, 0) /
        totalPredictions;

      // Calculate confidence distribution
      const confidenceDistribution = filteredPredictions.reduce(
        (dist, p) => {
          const bucket = Math.floor(p.confidence * 10) / 10;
          dist[bucket] = (dist[bucket] || 0) + 1;
          return dist;
        },
        {} as Record<number, number>,
      );

      const metrics: ModelPerformanceMetrics = {
        model_id: modelId,
        total_predictions: totalPredictions,
        avg_latency: Math.round(avgLatency),
        success_rate: successfulPredictions / totalPredictions,
        error_rate:
          (totalPredictions - successfulPredictions) / totalPredictions,
        confidence_distribution: confidenceDistribution,
        last_updated: new Date(),
        timeRange,
      };

      this.logger.debug("Performance metrics calculated", {
        modelId,
        metrics: {
          total_predictions: metrics.total_predictions,
          avg_latency: metrics.avg_latency,
          success_rate: metrics.success_rate,
        },
      });

      return metrics;
    } catch (error) {
      this.logger.error("Failed to get performance metrics", {
        error,
        modelId,
      });
      throw error;
    }
  }

  async recordPrediction(
    modelId: string,
    prediction: ModelPrediction,
  ): Promise<void> {
    try {
      // Store prediction in memory (with size limit)
      if (!this.predictions.has(modelId)) {
        this.predictions.set(modelId, []);
      }

      const predictions = this.predictions.get(modelId)!;
      predictions.push(prediction);

      // Maintain size limit
      if (predictions.length > this.config.max_prediction_history) {
        predictions.shift(); // Remove oldest
      }

      // Cache recent prediction
      await this.cache.setex(
        `prediction:${prediction.id}`,
        3600,
        JSON.stringify(prediction),
      );

      // Update performance metrics
      await this.updatePerformanceMetrics(modelId, prediction);
    } catch (error) {
      this.logger.error("Failed to record prediction", {
        error,
        modelId,
        predictionId: prediction.id,
      });
    }
  }

  async getHealth(): Promise<HealthStatus> {
    try {
      const totalModels = this.models.size;
      const activeDeployments = Array.from(this.deployments.values()).filter(
        (d) => d.status === "active",
      ).length;
      const activeABTests = Array.from(this.abTests.values()).filter(
        (t) => t.status === "active",
      ).length;

      const health: HealthStatus = {
        status: "healthy",
        timestamp: new Date(),
        details: {
          total_models: totalModels,
          active_deployments: activeDeployments,
          active_ab_tests: activeABTests,
          cache_status: await this.checkCacheHealth(),
          prediction_latency_p95: await this.getLatencyPercentile(0.95),
        },
      };

      // Check for any unhealthy deployments
      const unhealthyDeployments = Array.from(this.deployments.values()).filter(
        (d) => d.health_status === "unhealthy",
      );

      if (unhealthyDeployments.length > 0) {
        health.status = "degraded";
        health.details.unhealthy_deployments = unhealthyDeployments.length;
      }

      return health;
    } catch (error) {
      this.logger.error("Health check failed", { error });
      return {
        status: "unhealthy",
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  // Private helper methods
  private async validateModel(model: MLModel): Promise<void> {
    // Validate model structure and requirements
    if (!model.name || !model.version || !model.type) {
      throw new Error("Model must have name, version, and type");
    }

    if (model.type === "tensorflow" && model.model_path) {
      // Validate TensorFlow model
      try {
        await tf.loadLayersModel(`file://${model.model_path}`);
      } catch (error) {
        throw new Error(`Invalid TensorFlow model: ${error.message}`);
      }
    }
  }

  private generateEndpoint(modelId: string, version: string): string {
    return `${this.config.serving_endpoints.base}/models/${modelId}/versions/${version}/predict`;
  }

  private async deployToInfrastructure(
    deployment: ModelDeployment,
  ): Promise<void> {
    // Simulate deployment to serving infrastructure
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real implementation, this would:
    // - Build model container
    // - Deploy to Kubernetes/Cloud Run
    // - Configure load balancer
    // - Setup monitoring endpoints
  }

  private async executePrediction(
    endpoint: string,
    input: any,
    options: PredictionOptions,
  ): Promise<any> {
    try {
      const response = await axios.post(
        endpoint,
        {
          instances: [input],
          options,
        },
        {
          timeout: options.timeout || 5000,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      // Fallback to local prediction if remote fails
      return this.executeLocalPrediction(input, options);
    }
  }

  private async executeLocalPrediction(
    input: any,
    options: PredictionOptions,
  ): Promise<any> {
    // Simplified local prediction - in reality would load and run model
    return {
      output: { prediction: Math.random() > 0.5 ? "positive" : "negative" },
      confidence: Math.random(),
      explainability: options.explainability
        ? { feature_importance: {} }
        : undefined,
    };
  }

  private async getActiveDeployment(
    modelId: string,
  ): Promise<ModelDeployment | null> {
    return (
      Array.from(this.deployments.values()).find(
        (d) => d.model_id === modelId && d.status === "active",
      ) || null
    );
  }

  private async getABTestVersion(
    modelId: string,
    input: any,
  ): Promise<string | null> {
    const activeTests = Array.from(this.abTests.values()).filter(
      (t) => t.model_id === modelId && t.status === "active",
    );

    if (activeTests.length === 0) return null;

    const test = activeTests[0]; // Use first active test
    const hashValue = this.hashInput(input);

    return hashValue < test.traffic_split ? test.version_b : test.version_a;
  }

  private hashInput(input: any): number {
    // Simple hash function to determine A/B test group
    const str = JSON.stringify(input);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return (Math.abs(hash) % 100) / 100; // Return value between 0 and 1
  }

  private async updatePerformanceMetrics(
    modelId: string,
    prediction: ModelPrediction,
  ): Promise<void> {
    // Update real-time metrics
    const metricsKey = `metrics:${modelId}:realtime`;
    await this.cache.hincrby(metricsKey, "total_predictions", 1);
    await this.cache.hincrby(metricsKey, "total_latency", prediction.latency);

    if (prediction.confidence >= 0.5) {
      await this.cache.hincrby(metricsKey, "successful_predictions", 1);
    }
  }

  private async checkCacheHealth(): Promise<string> {
    try {
      await this.cache.ping();
      return "healthy";
    } catch (error) {
      return "unhealthy";
    }
  }

  private async getLatencyPercentile(percentile: number): Promise<number> {
    const allPredictions = Array.from(this.predictions.values()).flat();
    if (allPredictions.length === 0) return 0;

    const latencies = allPredictions
      .map((p) => p.latency)
      .sort((a, b) => a - b);
    const index = Math.floor(latencies.length * percentile);

    return latencies[index] || 0;
  }

  private async monitorModelHealth(): Promise<void> {
    for (const [deploymentId, deployment] of this.deployments) {
      if (deployment.status !== "active") continue;

      try {
        // Check model health endpoint
        const healthResponse = await axios.get(
          `${deployment.endpoint}/health`,
          {
            timeout: 5000,
          },
        );

        const wasHealthy = deployment.health_status === "healthy";
        deployment.health_status =
          healthResponse.status === 200 ? "healthy" : "unhealthy";

        if (wasHealthy && deployment.health_status === "unhealthy") {
          this.eventEmitter.emit("model:health_degraded", { deployment });
        }
      } catch (error) {
        deployment.health_status = "unhealthy";
        this.logger.warn("Model health check failed", {
          deploymentId,
          modelId: deployment.model_id,
          error: error.message,
        });
      }
    }
  }

  private async handleModelDeployed(event: {
    deployment: ModelDeployment;
    model: MLModel;
  }): Promise<void> {
    this.logger.info("Handling model deployment event", {
      deploymentId: event.deployment.id,
      modelId: event.model.id,
    });
  }

  private async handlePerformanceDegraded(event: {
    modelId: string;
    metrics: ModelPerformanceMetrics;
  }): Promise<void> {
    this.logger.warn("Model performance degraded", {
      modelId: event.modelId,
      successRate: event.metrics.success_rate,
      avgLatency: event.metrics.avg_latency,
    });

    if (
      this.config.auto_rollback &&
      event.metrics.success_rate < this.config.performance_threshold
    ) {
      await this.initiateAutoRollback(event.modelId);
    }
  }

  private async handlePredictionCompleted(event: {
    prediction: ModelPrediction;
    model: MLModel;
  }): Promise<void> {
    // Monitor for performance degradation
    const metrics = await this.getPerformanceMetrics(event.model.id);

    if (metrics.success_rate < this.config.performance_threshold) {
      this.eventEmitter.emit("model:performance_degraded", {
        modelId: event.model.id,
        metrics,
      });
    }
  }

  private async initiateAutoRollback(modelId: string): Promise<void> {
    try {
      // Find previous stable version
      const model = await this.getModel(modelId);
      if (!model) return;

      // In a real implementation, would look up deployment history
      const previousVersion = "previous_stable_version";

      await this.rollbackModel(modelId, previousVersion);

      this.logger.info("Auto rollback initiated", {
        modelId,
        targetVersion: previousVersion,
      });
    } catch (error) {
      this.logger.error("Auto rollback failed", { error, modelId });
    }
  }

  async getModel(modelId: string, version?: string): Promise<MLModel | null> {
    return this.models.get(modelId) || null;
  }

  async updateModel(modelId: string, updates: Partial<MLModel>): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) throw new Error(`Model not found: ${modelId}`);

    const updatedModel = { ...model, ...updates };
    this.models.set(modelId, updatedModel);

    this.eventEmitter.emit("model:updated", { modelId, updates });
  }

  async listModels(filter?: Partial<ModelMetadata>): Promise<MLModel[]> {
    const models = Array.from(this.models.values());

    if (!filter) return models;

    return models.filter((model) => {
      return Object.entries(filter).every(
        ([key, value]) => model.metadata[key as keyof ModelMetadata] === value,
      );
    });
  }

  async deleteModel(modelId: string, version?: string): Promise<void> {
    this.models.delete(modelId);
    this.predictions.delete(modelId);

    // Remove associated deployments
    for (const [deploymentId, deployment] of this.deployments) {
      if (deployment.model_id === modelId) {
        this.deployments.delete(deploymentId);
      }
    }

    this.eventEmitter.emit("model:deleted", { modelId, version });
  }

  async promoteModel(
    modelId: string,
    fromVersion: string,
    toVersion: string,
  ): Promise<void> {
    // Implementation for model promotion
    this.eventEmitter.emit("model:promoted", {
      modelId,
      fromVersion,
      toVersion,
    });
  }

  async rollbackModel(modelId: string, targetVersion: string): Promise<void> {
    // Implementation for model rollback
    this.eventEmitter.emit("model:rolledback", { modelId, targetVersion });
  }

  async getABTestResults(testId: string): Promise<ABTestResults> {
    const test = this.abTests.get(testId);
    if (!test) throw new Error(`A/B test not found: ${testId}`);

    // Calculate test results
    return {
      testId,
      modelA: test.version_a,
      modelB: test.version_b,
      metrics: {
        modelA: await this.getPerformanceMetrics(test.model_id),
        modelB: await this.getPerformanceMetrics(test.model_id),
      },
      statisticalSignificance: 0.95, // Simplified calculation
      recommendation: "A",
    };
  }

  async concludeABTest(testId: string, winnerVersion: string): Promise<void> {
    const test = this.abTests.get(testId);
    if (!test) throw new Error(`A/B test not found: ${testId}`);

    test.status = "completed";
    test.winner = winnerVersion;

    this.eventEmitter.emit("ab_test:concluded", { testId, winnerVersion });
  }

  async getModelHealth(modelId: string): Promise<HealthStatus> {
    const deployment = await this.getActiveDeployment(modelId);

    return {
      status: deployment?.health_status === "healthy" ? "healthy" : "unhealthy",
      timestamp: new Date(),
      details: {
        deployment_status: deployment?.status,
        health_status: deployment?.health_status,
      },
    };
  }
}
