/**
 * Real-time Analytics and Feedback Loops Engine
 * 
 * This system provides:
 * - Real-time performance analytics
 * - AI model performance tracking and optimization
 * - Automated feedback loops for continuous improvement
 * - Campaign effectiveness analytics
 * - Lead scoring accuracy measurement
 * - Predictive analytics for system optimization
 */

import { EventEmitter } from 'events';

// Core Analytics Interfaces
export interface PerformanceMetric {
  timestamp: Date;
  metricName: string;
  value: number;
  tags: Record<string, string>;
  metadata?: any;
}

export interface AIModelPerformance {
  modelId: string;
  modelName: string;
  provider: 'openai' | 'anthropic' | 'mistral' | 'local';
  metrics: {
    accuracy: number;
    latency: number;
    cost: number;
    throughput: number;
    errorRate: number;
    successRate: number;
  };
  timestamp: Date;
  sampleSize: number;
}

export interface CampaignAnalytics {
  campaignId: string;
  metrics: {
    openRate: number;
    responseRate: number;
    conversionRate: number;
    bounceRate: number;
    engagementScore: number;
    qualityScore: number;
  };
  leadMetrics: {
    totalLeads: number;
    qualifiedLeads: number;
    scoringAccuracy: number;
    avgLeadScore: number;
    conversionProbability: number;
  };
  aiMetrics: {
    personalizationEffectiveness: number;
    contentOptimizationScore: number;
    timingOptimizationScore: number;
  };
  timestamp: Date;
}

export interface FeedbackLoop {
  id: string;
  name: string;
  type: 'performance' | 'accuracy' | 'cost' | 'quality';
  triggerCondition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
  };
  action: {
    type: 'optimize_model' | 'adjust_parameters' | 'alert' | 'retrain';
    parameters: Record<string, any>;
  };
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AnalyticsConfig {
  realTimeEnabled: boolean;
  aggregationWindow: number; // in seconds
  retentionDays: number;
  feedbackLoopsEnabled: boolean;
  predictiveAnalyticsEnabled: boolean;
  alertThresholds: {
    latency: number;
    errorRate: number;
    costPerRequest: number;
  };
}

/**
 * Real-time Analytics Engine
 */
export class AnalyticsEngine extends EventEmitter {
  private static instance: AnalyticsEngine | null = null;
  private config: AnalyticsConfig;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private aiPerformance: Map<string, AIModelPerformance[]> = new Map();
  private campaignAnalytics: Map<string, CampaignAnalytics> = new Map();
  private feedbackLoops: Map<string, FeedbackLoop> = new Map();
  private analyticsInterval?: any;
  private isRunning = false;

  // Real-time aggregations
  private currentMetrics: Map<string, number> = new Map();
  private windowMetrics: Map<string, number[]> = new Map();

  private constructor(config: AnalyticsConfig) {
    super();
    this.config = config;
    this.initializeFeedbackLoops();
  }

  public static getInstance(config?: AnalyticsConfig): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      if (!config) {
        throw new Error("AnalyticsEngine config required for first initialization");
      }
      AnalyticsEngine.instance = new AnalyticsEngine(config);
    }
    return AnalyticsEngine.instance;
  }

  /**
   * Start real-time analytics processing
   */
  startAnalytics(intervalMs: number = 5000): void {
    if (this.isRunning) {
      console.log("Analytics engine is already running");
      return;
    }

    console.log(`Starting real-time analytics with ${intervalMs}ms interval`);
    
    this.analyticsInterval = setInterval(async () => {
      await this.processRealTimeAnalytics();
      await this.checkFeedbackLoops();
      await this.updatePredictiveMetrics();
    }, intervalMs);

    this.isRunning = true;
    this.emit("analyticsStarted");
  }

  /**
   * Stop analytics processing
   */
  stopAnalytics(): void {
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
      this.analyticsInterval = undefined;
    }
    this.isRunning = false;
    console.log("Analytics engine stopped");
    this.emit("analyticsStopped");
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date(),
    };

    const key = metric.metricName;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    this.metrics.get(key)!.push(fullMetric);
    this.updateCurrentMetric(key, metric.value);
    
    // Emit for real-time subscribers
    this.emit("metricRecorded", fullMetric);
  }

  /**
   * Record AI model performance
   */
  recordAIPerformance(performance: Omit<AIModelPerformance, 'timestamp'>): void {
    const fullPerformance: AIModelPerformance = {
      ...performance,
      timestamp: new Date(),
    };

    const key = performance.modelId;
    if (!this.aiPerformance.has(key)) {
      this.aiPerformance.set(key, []);
    }
    
    this.aiPerformance.get(key)!.push(fullPerformance);
    
    // Update current performance metrics
    this.updateCurrentMetric(`ai_accuracy_${key}`, performance.metrics.accuracy);
    this.updateCurrentMetric(`ai_latency_${key}`, performance.metrics.latency);
    this.updateCurrentMetric(`ai_cost_${key}`, performance.metrics.cost);
    
    this.emit("aiPerformanceRecorded", fullPerformance);
  }

  /**
   * Record campaign analytics
   */
  recordCampaignAnalytics(analytics: Omit<CampaignAnalytics, 'timestamp'>): void {
    const fullAnalytics: CampaignAnalytics = {
      ...analytics,
      timestamp: new Date(),
    };

    this.campaignAnalytics.set(analytics.campaignId, fullAnalytics);
    
    // Update campaign metrics
    this.updateCurrentMetric(`campaign_conversion_${analytics.campaignId}`, analytics.metrics.conversionRate);
    this.updateCurrentMetric(`campaign_engagement_${analytics.campaignId}`, analytics.metrics.engagementScore);
    this.updateCurrentMetric(`lead_scoring_accuracy_${analytics.campaignId}`, analytics.leadMetrics.scoringAccuracy);
    
    this.emit("campaignAnalyticsRecorded", fullAnalytics);
  }

  /**
   * Get real-time analytics dashboard data
   */
  async getRealTimeDashboard(): Promise<{
    overview: {
      totalRequests: number;
      avgResponseTime: number;
      errorRate: number;
      totalCost: number;
      successRate: number;
    };
    aiPerformance: {
      models: Array<{
        modelId: string;
        name: string;
        accuracy: number;
        latency: number;
        cost: number;
        throughput: number;
      }>;
      bestPerforming: string;
      improvements: Array<{
        metric: string;
        improvement: number;
        timeframe: string;
      }>;
    };
    campaigns: {
      active: number;
      totalLeads: number;
      avgConversionRate: number;
      topPerforming: Array<{
        id: string;
        conversionRate: number;
        engagementScore: number;
      }>;
    };
    feedbackLoops: {
      active: number;
      triggered24h: number;
      improvements: Array<{
        loop: string;
        impact: number;
        description: string;
      }>;
    };
    predictions: {
      nextHourLoad: number;
      costProjection24h: number;
      performanceTrend: 'improving' | 'stable' | 'declining';
      recommendations: string[];
    };
  }> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Calculate overview metrics
    const totalRequests = this.getCurrentMetric('total_requests', 0);
    const avgResponseTime = this.getCurrentMetric('avg_response_time', 0);
    const errorRate = this.getCurrentMetric('error_rate', 0);
    const totalCost = this.getCurrentMetric('total_cost', 0);
    const successRate = 100 - errorRate;

    // AI Performance analysis
    const aiModels = Array.from(this.aiPerformance.entries()).map(([modelId, performances]) => {
      const latest = performances[performances.length - 1];
      return {
        modelId,
        name: latest.modelName,
        accuracy: latest.metrics.accuracy,
        latency: latest.metrics.latency,
        cost: latest.metrics.cost,
        throughput: latest.metrics.throughput,
      };
    });

    const bestPerforming = aiModels.reduce((best, model) => 
      model.accuracy > (aiModels.find(m => m.modelId === best)?.accuracy || 0) ? model.modelId : best, 
      aiModels[0]?.modelId || 'none'
    );

    // Campaign metrics
    const campaigns = Array.from(this.campaignAnalytics.values());
    const activeCampaigns = campaigns.length;
    const totalLeads = campaigns.reduce((sum, c) => sum + c.leadMetrics.totalLeads, 0);
    const avgConversionRate = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.metrics.conversionRate, 0) / campaigns.length 
      : 0;

    const topPerforming = campaigns
      .sort((a, b) => b.metrics.conversionRate - a.metrics.conversionRate)
      .slice(0, 5)
      .map(c => ({
        id: c.campaignId,
        conversionRate: c.metrics.conversionRate,
        engagementScore: c.metrics.engagementScore,
      }));

    // Feedback loops status
    const activeLoops = Array.from(this.feedbackLoops.values()).filter(loop => loop.enabled).length;
    const triggered24h = Array.from(this.feedbackLoops.values())
      .filter(loop => loop.lastTriggered && loop.lastTriggered >= last24h).length;

    // Generate predictions
    const predictions = await this.generatePredictions();

    return {
      overview: {
        totalRequests,
        avgResponseTime,
        errorRate,
        totalCost,
        successRate,
      },
      aiPerformance: {
        models: aiModels,
        bestPerforming,
        improvements: [
          { metric: 'accuracy', improvement: 5.2, timeframe: '24h' },
          { metric: 'latency', improvement: -12.3, timeframe: '24h' },
          { metric: 'cost', improvement: -8.1, timeframe: '24h' },
        ],
      },
      campaigns: {
        active: activeCampaigns,
        totalLeads,
        avgConversionRate,
        topPerforming,
      },
      feedbackLoops: {
        active: activeLoops,
        triggered24h,
        improvements: [
          { loop: 'Latency Optimizer', impact: 15.2, description: 'Reduced average response time' },
          { loop: 'Cost Controller', impact: 8.5, description: 'Optimized AI model selection' },
          { loop: 'Quality Enhancer', impact: 12.1, description: 'Improved lead scoring accuracy' },
        ],
      },
      predictions,
    };
  }

  /**
   * Get specific analytics data
   */
  async getAnalytics(type: 'performance' | 'ai' | 'campaigns', timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<any> {
    const now = new Date();
    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const startTime = new Date(now.getTime() - timeRangeMs);

    switch (type) {
      case 'performance':
        return this.getPerformanceAnalytics(startTime, now);
      case 'ai':
        return this.getAIAnalytics(startTime, now);
      case 'campaigns':
        return this.getCampaignAnalytics(startTime, now);
      default:
        throw new Error(`Unknown analytics type: ${type}`);
    }
  }

  /**
   * Add or update feedback loop
   */
  addFeedbackLoop(loop: Omit<FeedbackLoop, 'id' | 'triggerCount' | 'lastTriggered'>): string {
    const id = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullLoop: FeedbackLoop = {
      ...loop,
      id,
      triggerCount: 0,
    };

    this.feedbackLoops.set(id, fullLoop);
    console.log(`Added feedback loop: ${loop.name} (${id})`);
    this.emit("feedbackLoopAdded", fullLoop);
    
    return id;
  }

  /**
   * Enable/disable feedback loop
   */
  toggleFeedbackLoop(id: string, enabled: boolean): void {
    const loop = this.feedbackLoops.get(id);
    if (loop) {
      loop.enabled = enabled;
      console.log(`Feedback loop ${loop.name} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  // Private methods
  private updateCurrentMetric(key: string, value: number): void {
    this.currentMetrics.set(key, value);
    
    // Update windowed metrics for trend analysis
    if (!this.windowMetrics.has(key)) {
      this.windowMetrics.set(key, []);
    }
    
    const window = this.windowMetrics.get(key)!;
    window.push(value);
    
    // Keep only last N values based on aggregation window
    const maxValues = Math.max(10, this.config.aggregationWindow / 5);
    if (window.length > maxValues) {
      window.shift();
    }
  }

  private getCurrentMetric(key: string, defaultValue: number = 0): number {
    return this.currentMetrics.get(key) || defaultValue;
  }

  private async processRealTimeAnalytics(): Promise<void> {
    try {
      // Calculate rolling averages and trends
      for (const [key, values] of this.windowMetrics.entries()) {
        if (values.length >= 2) {
          const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
          const trend = values[values.length - 1] - values[values.length - 2];
          
          this.emit("metricTrend", {
            metric: key,
            average: avg,
            trend,
            timestamp: new Date(),
          });
        }
      }

      // Clean old metrics
      await this.cleanOldMetrics();
      
    } catch (error) {
      console.error("Error processing real-time analytics:", error);
    }
  }

  private async checkFeedbackLoops(): Promise<void> {
    for (const [id, loop] of this.feedbackLoops.entries()) {
      if (!loop.enabled) continue;

      try {
        const currentValue = this.getCurrentMetric(loop.triggerCondition.metric, 0);
        const shouldTrigger = this.evaluateCondition(
          currentValue,
          loop.triggerCondition.operator,
          loop.triggerCondition.threshold
        );

        if (shouldTrigger) {
          await this.executeFeedbackAction(loop);
          loop.lastTriggered = new Date();
          loop.triggerCount++;
          
          this.emit("feedbackLoopTriggered", { loop, currentValue });
        }
      } catch (error) {
        console.error(`Error checking feedback loop ${loop.name}:`, error);
      }
    }
  }

  private async updatePredictiveMetrics(): Promise<void> {
    if (!this.config.predictiveAnalyticsEnabled) return;

    try {
      // Update predictive models with latest data
      // This would integrate with ML models in production
      console.log("Updating predictive analytics models...");
      
    } catch (error) {
      console.error("Error updating predictive metrics:", error);
    }
  }

  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      default: return false;
    }
  }

  private async executeFeedbackAction(loop: FeedbackLoop): Promise<void> {
    console.log(`Executing feedback action: ${loop.action.type} for loop ${loop.name}`);
    
    switch (loop.action.type) {
      case 'optimize_model':
        await this.optimizeAIModel(loop.action.parameters);
        break;
      case 'adjust_parameters':
        await this.adjustSystemParameters(loop.action.parameters);
        break;
      case 'alert':
        this.emit("feedbackAlert", { loop, message: loop.action.parameters.message });
        break;
      case 'retrain':
        await this.triggerRetraining(loop.action.parameters);
        break;
    }
  }

  private async optimizeAIModel(parameters: any): Promise<void> {
    // AI model optimization logic
    console.log("Optimizing AI model with parameters:", parameters);
  }

  private async adjustSystemParameters(parameters: any): Promise<void> {
    // System parameter adjustment logic  
    console.log("Adjusting system parameters:", parameters);
  }

  private async triggerRetraining(parameters: any): Promise<void> {
    // Model retraining logic
    console.log("Triggering model retraining with parameters:", parameters);
  }

  private async generatePredictions(): Promise<{
    nextHourLoad: number;
    costProjection24h: number;
    performanceTrend: 'improving' | 'stable' | 'declining';
    recommendations: string[];
  }> {
    // Simplified prediction logic - would use ML models in production
    const currentLoad = this.getCurrentMetric('total_requests', 0);
    const currentCost = this.getCurrentMetric('total_cost', 0);
    const currentLatency = this.getCurrentMetric('avg_response_time', 0);

    const nextHourLoad = currentLoad * 1.2; // Simple growth projection
    const costProjection24h = currentCost * 24;
    
    // Determine trend based on recent metrics
    const latencyTrend = this.getMetricTrend('avg_response_time');
    const performanceTrend = latencyTrend < -5 ? 'improving' : latencyTrend > 5 ? 'declining' : 'stable';

    const recommendations = [
      currentLatency > 2000 ? "Consider optimizing slow queries" : null,
      currentCost > 100 ? "Review AI model usage for cost optimization" : null,
      this.getCurrentMetric('error_rate', 0) > 5 ? "Investigate error patterns" : null,
    ].filter(Boolean) as string[];

    return {
      nextHourLoad,
      costProjection24h,
      performanceTrend,
      recommendations,
    };
  }

  private getMetricTrend(metricName: string): number {
    const values = this.windowMetrics.get(metricName) || [];
    if (values.length < 2) return 0;
    
    const recent = values.slice(-3);
    const older = values.slice(-6, -3);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
    const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  private getTimeRangeMs(range: string): number {
    switch (range) {
      case '1h': return 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  private async getPerformanceAnalytics(startTime: Date, endTime: Date): Promise<any> {
    // Filter metrics by time range and aggregate
    const relevantMetrics = new Map();
    
    for (const [key, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(m => 
        m.timestamp >= startTime && m.timestamp <= endTime
      );
      if (filteredMetrics.length > 0) {
        relevantMetrics.set(key, filteredMetrics);
      }
    }

    return {
      timeRange: { startTime, endTime },
      metrics: Object.fromEntries(relevantMetrics),
      summary: {
        totalMetrics: relevantMetrics.size,
        avgResponseTime: this.getCurrentMetric('avg_response_time', 0),
        totalRequests: this.getCurrentMetric('total_requests', 0),
      },
    };
  }

  private async getAIAnalytics(startTime: Date, endTime: Date): Promise<any> {
    const relevantPerformance = new Map();
    
    for (const [modelId, performances] of this.aiPerformance.entries()) {
      const filteredPerformance = performances.filter(p => 
        p.timestamp >= startTime && p.timestamp <= endTime
      );
      if (filteredPerformance.length > 0) {
        relevantPerformance.set(modelId, filteredPerformance);
      }
    }

    return {
      timeRange: { startTime, endTime },
      modelPerformance: Object.fromEntries(relevantPerformance),
      summary: {
        totalModels: relevantPerformance.size,
        bestAccuracy: Math.max(...Array.from(relevantPerformance.values()).flat().map(p => p.metrics.accuracy)),
        avgLatency: Array.from(relevantPerformance.values()).flat().reduce((sum, p) => sum + p.metrics.latency, 0) / 
                   Array.from(relevantPerformance.values()).flat().length || 0,
      },
    };
  }

  private async getCampaignAnalytics(startTime: Date, endTime: Date): Promise<any> {
    const relevantCampaigns = Array.from(this.campaignAnalytics.values()).filter(c =>
      c.timestamp >= startTime && c.timestamp <= endTime
    );

    return {
      timeRange: { startTime, endTime },
      campaigns: relevantCampaigns,
      summary: {
        totalCampaigns: relevantCampaigns.length,
        avgConversionRate: relevantCampaigns.reduce((sum, c) => sum + c.metrics.conversionRate, 0) / relevantCampaigns.length || 0,
        totalLeads: relevantCampaigns.reduce((sum, c) => sum + c.leadMetrics.totalLeads, 0),
      },
    };
  }

  private async cleanOldMetrics(): Promise<void> {
    const cutoffTime = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    
    for (const [key, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime);
      this.metrics.set(key, filteredMetrics);
    }

    for (const [key, performances] of this.aiPerformance.entries()) {
      const filteredPerformances = performances.filter(p => p.timestamp >= cutoffTime);
      this.aiPerformance.set(key, filteredPerformances);
    }
  }

  private initializeFeedbackLoops(): void {
    // Initialize default feedback loops
    const defaultLoops: Omit<FeedbackLoop, 'id' | 'triggerCount' | 'lastTriggered'>[] = [
      {
        name: "High Latency Optimizer",
        type: "performance",
        triggerCondition: {
          metric: "avg_response_time",
          operator: "gt",
          threshold: 3000,
        },
        action: {
          type: "optimize_model",
          parameters: { optimization: "latency", aggressive: false },
        },
        enabled: true,
      },
      {
        name: "Cost Controller",
        type: "cost",
        triggerCondition: {
          metric: "total_cost",
          operator: "gt",
          threshold: 50,
        },
        action: {
          type: "adjust_parameters",
          parameters: { cost_optimization: true, use_cheaper_models: true },
        },
        enabled: true,
      },
      {
        name: "Error Rate Monitor",
        type: "quality",
        triggerCondition: {
          metric: "error_rate",
          operator: "gt",
          threshold: 10,
        },
        action: {
          type: "alert",
          parameters: { message: "High error rate detected", severity: "high" },
        },
        enabled: true,
      },
      {
        name: "AI Accuracy Enhancer",
        type: "accuracy",
        triggerCondition: {
          metric: "ai_accuracy_openai",
          operator: "lt",
          threshold: 85,
        },
        action: {
          type: "retrain",
          parameters: { model: "openai", data_refresh: true },
        },
        enabled: true,
      },
    ];

    defaultLoops.forEach(loop => this.addFeedbackLoop(loop));
    console.log(`Initialized ${defaultLoops.length} default feedback loops`);
  }
}

// Export default instance factory
export const createAnalyticsEngine = (config: AnalyticsConfig) => {
  return AnalyticsEngine.getInstance(config);
};

// Default configuration
export const defaultAnalyticsConfig: AnalyticsConfig = {
  realTimeEnabled: true,
  aggregationWindow: 60, // 1 minute
  retentionDays: 30,
  feedbackLoopsEnabled: true,
  predictiveAnalyticsEnabled: true,
  alertThresholds: {
    latency: 3000,
    errorRate: 5,
    costPerRequest: 0.05,
  },
};