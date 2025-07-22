import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { 
  MSEOConfig, 
  MSEOGenerationRequest, 
  MSEOGenerationResult,
  MSEOContentQueue,
  MSEOAnalytics,
  MSEOProviderHealth,
  ContentType,
  MSEOTemplate,
  MSEOPersonalizationData,
  QueuePriority,
  MSEOOrchestrationContext
} from './types';
import { VoiceEngine } from './voice-engine';
import { ImageEngine } from './image-engine';
import { VideoEngine } from './video-engine';

export interface MSEOOrchestratorEvents {
  contentGenerated: (result: MSEOGenerationResult) => void;
  queueUpdated: (queueSize: number, priorityDistribution: Record<QueuePriority, number>) => void;
  providerHealthChanged: (provider: string, health: MSEOProviderHealth) => void;
  performanceAlert: (metric: string, value: number, threshold: number) => void;
  costAlert: (provider: string, cost: number, budget: number) => void;
  error: (error: Error, context: any) => void;
}

export class MSEOOrchestrator extends EventEmitter {
  private voiceEngine: VoiceEngine;
  private imageEngine: ImageEngine;
  private videoEngine: VideoEngine;
  private contentQueue: MSEOContentQueue[];
  private analytics: MSEOAnalytics;
  private providerHealth: Map<string, MSEOProviderHealth>;
  private templates: Map<string, MSEOTemplate>;
  private isProcessing: boolean;
  private processInterval: NodeJS.Timeout | null;
  private logger: Logger;

  declare emit: <K extends keyof MSEOOrchestratorEvents>(
    eventName: K,
    ...args: Parameters<MSEOOrchestratorEvents[K]>
  ) => boolean;

  declare on: <K extends keyof MSEOOrchestratorEvents>(
    eventName: K,
    listener: MSEOOrchestratorEvents[K]
  ) => this;

  constructor(private config: MSEOConfig) {
    super();
    this.logger = new Logger('MSEOOrchestrator');
    
    // Initialize engines
    this.voiceEngine = new VoiceEngine(config.voice);
    this.imageEngine = new ImageEngine(config.image);
    this.videoEngine = new VideoEngine(config.video);
    
    // Initialize state
    this.contentQueue = [];
    this.providerHealth = new Map();
    this.templates = new Map();
    this.isProcessing = false;
    this.processInterval = null;
    
    // Initialize analytics
    this.analytics = {
      totalRequests: 0,
      successRate: 0,
      averageGenerationTime: 0,
      costMetrics: {
        totalCost: 0,
        costPerRequest: 0,
        providerCosts: {}
      },
      qualityMetrics: {
        averageQualityScore: 0,
        userSatisfactionRate: 0,
        contentEngagementRate: 0
      },
      performanceMetrics: {
        throughput: 0,
        latency: 0,
        errorRate: 0
      },
      providerMetrics: {}
    };

    this.setupEngineEventHandlers();
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing MSEO Orchestrator...');
    
    try {
      // Initialize all engines
      await Promise.all([
        this.voiceEngine.initialize(),
        this.imageEngine.initialize(),
        this.videoEngine.initialize()
      ]);

      // Load default templates
      await this.loadDefaultTemplates();

      // Start queue processing
      this.startQueueProcessing();

      // Initialize provider health monitoring
      this.startHealthMonitoring();

      this.logger.info('MSEO Orchestrator initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MSEO Orchestrator:', error);
      throw error;
    }
  }

  async generateContent(request: MSEOGenerationRequest): Promise<MSEOGenerationResult> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.logger.info(`Processing content generation request: ${requestId}`, {
      contentType: request.contentType,
      priority: request.priority
    });

    try {
      // Add to queue or process immediately based on priority
      if (request.priority === 'immediate') {
        return await this.processRequest(request, requestId);
      }

      // Add to queue for batch processing
      const queueItem: MSEOContentQueue = {
        id: requestId,
        request,
        timestamp: new Date(),
        retryCount: 0,
        context: this.buildOrchestrationContext(request)
      };

      this.contentQueue.push(queueItem);
      this.sortQueueByPriority();
      
      this.emit('queueUpdated', this.contentQueue.length, this.getQueuePriorityDistribution());

      // Return promise that resolves when processing is complete
      return new Promise((resolve, reject) => {
        const checkResult = () => {
          const queueIndex = this.contentQueue.findIndex(item => item.id === requestId);
          if (queueIndex === -1) {
            // Item processed, check results
            setTimeout(checkResult, 100);
          }
        };
        
        setTimeout(checkResult, 100);
      });

    } catch (error) {
      this.logger.error(`Content generation failed for request ${requestId}:`, error);
      this.emit('error', error as Error, { requestId, request });
      throw error;
    }
  }

  private async processRequest(
    request: MSEOGenerationRequest, 
    requestId: string
  ): Promise<MSEOGenerationResult> {
    const startTime = Date.now();

    try {
      let result: MSEOGenerationResult;

      switch (request.contentType) {
        case 'voice':
          result = await this.processVoiceRequest(request, requestId);
          break;
        case 'image':
          result = await this.processImageRequest(request, requestId);
          break;
        case 'video':
          result = await this.processVideoRequest(request, requestId);
          break;
        case 'multimodal':
          result = await this.processMultimodalRequest(request, requestId);
          break;
        default:
          throw new Error(`Unsupported content type: ${request.contentType}`);
      }

      // Update analytics
      const processingTime = Date.now() - startTime;
      this.updateAnalytics(request, result, processingTime);
      
      this.emit('contentGenerated', result);
      return result;

    } catch (error) {
      this.logger.error(`Request processing failed: ${requestId}`, error);
      throw error;
    }
  }

  private async processVoiceRequest(
    request: MSEOGenerationRequest,
    requestId: string
  ): Promise<MSEOGenerationResult> {
    const voiceResult = await this.voiceEngine.generateVoice({
      script: request.content || request.template?.variables?.script || '',
      voiceId: request.voiceSettings?.voiceId,
      personalizeForProspect: request.personalizationData,
      template: request.template?.name,
      settings: {
        model: request.voiceSettings?.model,
        stability: request.voiceSettings?.stability,
        similarityBoost: request.voiceSettings?.similarityBoost,
        style: request.voiceSettings?.style,
        speakerBoost: request.voiceSettings?.speakerBoost
      }
    });

    return {
      id: requestId,
      contentType: 'voice',
      status: 'completed',
      content: {
        voice: voiceResult
      },
      metadata: {
        processingTime: 0, // Will be set by caller
        cost: voiceResult.cost || 0,
        qualityScore: voiceResult.qualityMetrics?.overallRating || 0.8,
        providerUsed: voiceResult.provider
      },
      timestamp: new Date()
    };
  }

  private async processImageRequest(
    request: MSEOGenerationRequest,
    requestId: string
  ): Promise<MSEOGenerationResult> {
    const imageResult = await this.imageEngine.generateImage({
      prompt: request.content || request.template?.variables?.prompt || '',
      personalizeForProspect: request.personalizationData,
      template: request.template?.name,
      settings: {
        model: request.imageSettings?.model,
        size: request.imageSettings?.size,
        quality: request.imageSettings?.quality,
        style: request.imageSettings?.style,
        n: request.imageSettings?.n
      }
    });

    return {
      id: requestId,
      contentType: 'image',
      status: 'completed',
      content: {
        image: imageResult
      },
      metadata: {
        processingTime: 0,
        cost: imageResult.cost || 0,
        qualityScore: imageResult.qualityMetrics?.overallRating || 0.8,
        providerUsed: imageResult.provider
      },
      timestamp: new Date()
    };
  }

  private async processVideoRequest(
    request: MSEOGenerationRequest,
    requestId: string
  ): Promise<MSEOGenerationResult> {
    const videoResult = await this.videoEngine.generateVideo({
      script: request.content || request.template?.variables?.script || '',
      visualPrompt: request.template?.variables?.visualPrompt || '',
      personalizeForProspect: request.personalizationData,
      template: request.template?.name,
      settings: {
        model: request.videoSettings?.model,
        duration: request.videoSettings?.duration,
        aspectRatio: request.videoSettings?.aspectRatio,
        fps: request.videoSettings?.fps,
        resolution: request.videoSettings?.resolution
      }
    });

    return {
      id: requestId,
      contentType: 'video',
      status: 'completed',
      content: {
        video: videoResult
      },
      metadata: {
        processingTime: 0,
        cost: videoResult.cost || 0,
        qualityScore: videoResult.qualityMetrics?.overallRating || 0.8,
        providerUsed: videoResult.provider
      },
      timestamp: new Date()
    };
  }

  private async processMultimodalRequest(
    request: MSEOGenerationRequest,
    requestId: string
  ): Promise<MSEOGenerationResult> {
    // Generate all content types in parallel or sequence based on configuration
    const promises: Promise<any>[] = [];

    if (request.multimodalSettings?.includeVoice) {
      promises.push(this.processVoiceRequest(request, `${requestId}_voice`));
    }

    if (request.multimodalSettings?.includeImage) {
      promises.push(this.processImageRequest(request, `${requestId}_image`));
    }

    if (request.multimodalSettings?.includeVideo) {
      promises.push(this.processVideoRequest(request, `${requestId}_video`));
    }

    const results = await Promise.all(promises);
    
    // Combine results
    const combinedContent: any = {};
    let totalCost = 0;
    let averageQuality = 0;
    const providersUsed: string[] = [];

    results.forEach(result => {
      Object.assign(combinedContent, result.content);
      totalCost += result.metadata.cost;
      averageQuality += result.metadata.qualityScore;
      if (result.metadata.providerUsed && !providersUsed.includes(result.metadata.providerUsed)) {
        providersUsed.push(result.metadata.providerUsed);
      }
    });

    return {
      id: requestId,
      contentType: 'multimodal',
      status: 'completed',
      content: combinedContent,
      metadata: {
        processingTime: 0,
        cost: totalCost,
        qualityScore: averageQuality / results.length,
        providerUsed: providersUsed.join(', ')
      },
      timestamp: new Date()
    };
  }

  private buildOrchestrationContext(request: MSEOGenerationRequest): MSEOOrchestrationContext {
    return {
      campaignId: request.campaignId || '',
      prospectId: request.prospectId || '',
      sequenceStep: request.sequenceStep || 1,
      channelContext: request.channelContext || {},
      previousInteractions: request.previousInteractions || [],
      businessContext: request.businessContext || {},
      performanceGoals: request.performanceGoals || {
        targetEngagementRate: 0.15,
        maxCostPerLead: 50,
        qualityThreshold: 0.8
      }
    };
  }

  private setupEngineEventHandlers(): void {
    // Voice engine events
    this.voiceEngine.on('providerHealthChanged', (provider, health) => {
      this.providerHealth.set(`voice_${provider}`, health);
      this.emit('providerHealthChanged', `voice_${provider}`, health);
    });

    this.voiceEngine.on('error', (error, context) => {
      this.emit('error', error, { engine: 'voice', ...context });
    });

    // Image engine events
    this.imageEngine.on('providerHealthChanged', (provider, health) => {
      this.providerHealth.set(`image_${provider}`, health);
      this.emit('providerHealthChanged', `image_${provider}`, health);
    });

    this.imageEngine.on('error', (error, context) => {
      this.emit('error', error, { engine: 'image', ...context });
    });

    // Video engine events
    this.videoEngine.on('providerHealthChanged', (provider, health) => {
      this.providerHealth.set(`video_${provider}`, health);
      this.emit('providerHealthChanged', `video_${provider}`, health);
    });

    this.videoEngine.on('error', (error, context) => {
      this.emit('error', error, { engine: 'video', ...context });
    });
  }

  private async loadDefaultTemplates(): Promise<void> {
    // Load default templates for each content type
    const defaultTemplates: MSEOTemplate[] = [
      {
        id: 'voice_intro_professional',
        name: 'Professional Introduction',
        contentType: 'voice',
        category: 'introduction',
        variables: {
          script: 'Hi {{prospect.firstName}}, this is {{user.name}} from {{company.name}}. I noticed {{prospect.company}} is {{prospect.industry}} and thought you might be interested in how we helped {{similarCompany}} achieve {{achievement}}.'
        },
        personalizationRules: {
          industrySpecific: true,
          roleSpecific: true,
          companySize: true
        },
        qualitySettings: {
          minQualityScore: 0.8,
          requireHumanReview: false
        }
      },
      {
        id: 'image_product_showcase',
        name: 'Product Showcase',
        contentType: 'image',
        category: 'product',
        variables: {
          prompt: 'Professional product showcase for {{product.name}}, highlighting {{product.keyFeature}}, styled for {{prospect.industry}} industry, clean modern design, corporate aesthetic'
        },
        personalizationRules: {
          industrySpecific: true,
          companyBranding: true
        },
        qualitySettings: {
          minQualityScore: 0.85,
          requireHumanReview: true
        }
      },
      {
        id: 'video_demo_personalized',
        name: 'Personalized Demo',
        contentType: 'video',
        category: 'demo',
        variables: {
          script: 'Hi {{prospect.firstName}}, let me show you how {{product.name}} can specifically help {{prospect.company}} with {{prospect.painPoint}}.',
          visualPrompt: 'Screen recording of software demo, professional presenter, {{prospect.company}} logo integration, {{prospect.industry}} use case focus'
        },
        personalizationRules: {
          industrySpecific: true,
          roleSpecific: true,
          companySpecific: true
        },
        qualitySettings: {
          minQualityScore: 0.9,
          requireHumanReview: true
        }
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    this.logger.info(`Loaded ${defaultTemplates.length} default templates`);
  }

  private sortQueueByPriority(): void {
    const priorityOrder: Record<QueuePriority, number> = {
      immediate: 0,
      high: 1,
      normal: 2,
      low: 3,
      background: 4
    };

    this.contentQueue.sort((a, b) => {
      const aPriority = priorityOrder[a.request.priority || 'normal'];
      const bPriority = priorityOrder[b.request.priority || 'normal'];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // If same priority, sort by timestamp (FIFO)
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }

  private getQueuePriorityDistribution(): Record<QueuePriority, number> {
    const distribution: Record<QueuePriority, number> = {
      immediate: 0,
      high: 0,
      normal: 0,
      low: 0,
      background: 0
    };

    this.contentQueue.forEach(item => {
      const priority = item.request.priority || 'normal';
      distribution[priority]++;
    });

    return distribution;
  }

  private startQueueProcessing(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
    }

    const processingInterval = this.config.queue?.processingInterval || 5000;
    
    this.processInterval = setInterval(async () => {
      if (this.isProcessing || this.contentQueue.length === 0) {
        return;
      }

      this.isProcessing = true;
      
      try {
        // Process up to maxConcurrentRequests items
        const maxConcurrent = this.config.queue?.maxConcurrentRequests || 3;
        const itemsToProcess = this.contentQueue.splice(0, maxConcurrent);
        
        const promises = itemsToProcess.map(async (item) => {
          try {
            const result = await this.processRequest(item.request, item.id);
            return { success: true, result, item };
          } catch (error) {
            this.logger.error(`Queue item processing failed: ${item.id}`, error);
            
            // Retry logic
            if (item.retryCount < (this.config.queue?.maxRetries || 3)) {
              item.retryCount++;
              item.timestamp = new Date();
              this.contentQueue.push(item); // Re-queue for retry
            }
            
            return { success: false, error, item };
          }
        });

        await Promise.all(promises);
        
      } catch (error) {
        this.logger.error('Queue processing error:', error);
      } finally {
        this.isProcessing = false;
      }
    }, processingInterval);
  }

  private startHealthMonitoring(): void {
    setInterval(async () => {
      try {
        // Check engine health
        const voiceHealth = await this.voiceEngine.getHealthStatus();
        const imageHealth = await this.imageEngine.getHealthStatus();
        const videoHealth = await this.videoEngine.getHealthStatus();

        // Update overall health metrics
        this.updateProviderHealthMetrics(voiceHealth, imageHealth, videoHealth);
        
        // Check for alerts
        this.checkPerformanceAlerts();
        this.checkCostAlerts();
        
      } catch (error) {
        this.logger.error('Health monitoring error:', error);
      }
    }, this.config.monitoring?.healthCheckInterval || 30000);
  }

  private updateProviderHealthMetrics(
    voiceHealth: any,
    imageHealth: any,
    videoHealth: any
  ): void {
    // Implementation for health metrics aggregation
    // This would aggregate health from all engines and update analytics
  }

  private checkPerformanceAlerts(): void {
    const thresholds = this.config.monitoring?.performanceThresholds;
    if (!thresholds) return;

    // Check latency
    if (this.analytics.performanceMetrics.latency > thresholds.maxLatency) {
      this.emit('performanceAlert', 'latency', this.analytics.performanceMetrics.latency, thresholds.maxLatency);
    }

    // Check error rate
    if (this.analytics.performanceMetrics.errorRate > thresholds.maxErrorRate) {
      this.emit('performanceAlert', 'errorRate', this.analytics.performanceMetrics.errorRate, thresholds.maxErrorRate);
    }

    // Check throughput
    if (this.analytics.performanceMetrics.throughput < thresholds.minThroughput) {
      this.emit('performanceAlert', 'throughput', this.analytics.performanceMetrics.throughput, thresholds.minThroughput);
    }
  }

  private checkCostAlerts(): void {
    const budgets = this.config.budget;
    if (!budgets) return;

    // Check overall budget
    if (budgets.daily && this.analytics.costMetrics.totalCost > budgets.daily) {
      this.emit('costAlert', 'overall', this.analytics.costMetrics.totalCost, budgets.daily);
    }

    // Check provider budgets
    Object.entries(budgets.perProvider || {}).forEach(([provider, budget]) => {
      const providerCost = this.analytics.costMetrics.providerCosts[provider] || 0;
      if (providerCost > budget) {
        this.emit('costAlert', provider, providerCost, budget);
      }
    });
  }

  private updateAnalytics(
    request: MSEOGenerationRequest,
    result: MSEOGenerationResult,
    processingTime: number
  ): void {
    this.analytics.totalRequests++;
    
    // Update timing
    result.metadata.processingTime = processingTime;
    
    // Update average generation time
    this.analytics.averageGenerationTime = 
      (this.analytics.averageGenerationTime * (this.analytics.totalRequests - 1) + processingTime) / 
      this.analytics.totalRequests;

    // Update cost metrics
    this.analytics.costMetrics.totalCost += result.metadata.cost;
    this.analytics.costMetrics.costPerRequest = 
      this.analytics.costMetrics.totalCost / this.analytics.totalRequests;

    // Update provider costs
    if (result.metadata.providerUsed) {
      this.analytics.costMetrics.providerCosts[result.metadata.providerUsed] = 
        (this.analytics.costMetrics.providerCosts[result.metadata.providerUsed] || 0) + result.metadata.cost;
    }

    // Update quality metrics
    const qualitySum = this.analytics.qualityMetrics.averageQualityScore * (this.analytics.totalRequests - 1) + 
                     result.metadata.qualityScore;
    this.analytics.qualityMetrics.averageQualityScore = qualitySum / this.analytics.totalRequests;

    // Update success rate
    const successCount = result.status === 'completed' ? 1 : 0;
    this.analytics.successRate = 
      (this.analytics.successRate * (this.analytics.totalRequests - 1) + successCount) / 
      this.analytics.totalRequests;
  }

  // Public API methods
  async getAnalytics(): Promise<MSEOAnalytics> {
    return { ...this.analytics };
  }

  async getQueueStatus(): Promise<{
    queueLength: number;
    priorityDistribution: Record<QueuePriority, number>;
    estimatedProcessingTime: number;
  }> {
    return {
      queueLength: this.contentQueue.length,
      priorityDistribution: this.getQueuePriorityDistribution(),
      estimatedProcessingTime: this.contentQueue.length * (this.analytics.averageGenerationTime || 5000)
    };
  }

  async getProviderHealth(): Promise<Map<string, MSEOProviderHealth>> {
    return new Map(this.providerHealth);
  }

  async addTemplate(template: MSEOTemplate): Promise<void> {
    this.templates.set(template.id, template);
    this.logger.info(`Added template: ${template.name} (${template.id})`);
  }

  async getTemplate(templateId: string): Promise<MSEOTemplate | undefined> {
    return this.templates.get(templateId);
  }

  async listTemplates(contentType?: ContentType): Promise<MSEOTemplate[]> {
    const allTemplates = Array.from(this.templates.values());
    return contentType 
      ? allTemplates.filter(t => t.contentType === contentType)
      : allTemplates;
  }

  async pauseProcessing(): Promise<void> {
    this.isProcessing = true;
    this.logger.info('MSEO processing paused');
  }

  async resumeProcessing(): Promise<void> {
    this.isProcessing = false;
    this.logger.info('MSEO processing resumed');
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down MSEO Orchestrator...');
    
    // Stop queue processing
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }

    // Shutdown engines
    await Promise.all([
      this.voiceEngine.shutdown(),
      this.imageEngine.shutdown(),
      this.videoEngine.shutdown()
    ]);

    this.logger.info('MSEO Orchestrator shutdown complete');
  }
}