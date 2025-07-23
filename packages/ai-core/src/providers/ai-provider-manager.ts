/**
 * AI Provider Manager - Multi-Provider AI Integration with Smart Routing
 * 
 * This service manages multiple AI providers (OpenAI, Anthropic, Mistral, etc.)
 * with intelligent routing, fallback handling, rate limiting, and cost optimization.
 */

import { EventEmitter } from "events";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { Logger } from "../utils/logger";

export interface AIProviderConfig {
  name: string;
  apiKey: string;
  baseURL?: string;
  enabled: boolean;
  priority: number;
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  costPerToken: {
    input: number;
    output: number;
  };
  supportedModels: string[];
}

export interface AIRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  tools?: any[];
  toolChoice?: any;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
  cost: number;
  processingTime: number;
  requestId: string;
}

export interface ProviderStatus {
  name: string;
  healthy: boolean;
  lastChecked: Date;
  responseTime: number;
  errorRate: number;
  requestsInLastMinute: number;
  tokensInLastMinute: number;
}

export class AIProviderManager extends EventEmitter {
  private static instance: AIProviderManager;
  private providers: Map<string, AIProviderConfig> = new Map();
  private clients: Map<string, any> = new Map();
  private logger: Logger;
  private rateLimiters: Map<string, { requests: number[], tokens: number[] }> = new Map();
  private healthStatus: Map<string, ProviderStatus> = new Map();
  private requestHistory: Array<{ provider: string; timestamp: Date; success: boolean; responseTime: number }> = [];

  private constructor() {
    super();
    this.logger = new Logger("AIProviderManager");
    this.setupHealthChecks();
  }

  public static getInstance(): AIProviderManager {
    if (!AIProviderManager.instance) {
      AIProviderManager.instance = new AIProviderManager();
    }
    return AIProviderManager.instance;
  }

  /**
   * Initialize AI providers with their configurations
   */
  async initialize(providerConfigs: AIProviderConfig[]): Promise<void> {
    try {
      this.logger.info("Initializing AI Provider Manager...");

      for (const config of providerConfigs) {
        await this.addProvider(config);
      }

      this.logger.info(`Initialized ${this.providers.size} AI providers`);
      this.emit("initialized", { providers: Array.from(this.providers.keys()) });
    } catch (error) {
      this.logger.error("Failed to initialize AI Provider Manager:", error);
      throw error;
    }
  }

  /**
   * Add a new AI provider
   */
  async addProvider(config: AIProviderConfig): Promise<void> {
    try {
      this.providers.set(config.name, config);
      this.rateLimiters.set(config.name, { requests: [], tokens: [] });

      // Initialize provider client based on type
      switch (config.name.toLowerCase()) {
        case "openai":
          this.clients.set(config.name, new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseURL,
          }));
          break;
        case "anthropic":
          this.clients.set(config.name, new Anthropic({
            apiKey: config.apiKey,
          }));
          break;
        default:
          // Generic HTTP client for other providers
          this.clients.set(config.name, {
            baseURL: config.baseURL,
            apiKey: config.apiKey,
          });
      }

      // Initialize health status
      this.healthStatus.set(config.name, {
        name: config.name,
        healthy: true,
        lastChecked: new Date(),
        responseTime: 0,
        errorRate: 0,
        requestsInLastMinute: 0,
        tokensInLastMinute: 0,
      });

      this.logger.info(`Added AI provider: ${config.name}`);
      this.emit("providerAdded", { name: config.name, config });
    } catch (error) {
      this.logger.error(`Failed to add provider ${config.name}:`, error);
      throw error;
    }
  }

  /**
   * Execute AI request with smart provider selection and fallback
   */
  async executeRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Get available providers sorted by priority and health
    const availableProviders = this.getAvailableProviders(request.model);

    for (const providerName of availableProviders) {
      try {
        // Check rate limits
        if (!this.checkRateLimit(providerName, request)) {
          this.logger.warn(`Rate limit exceeded for provider ${providerName}, trying next...`);
          continue;
        }

        // Execute request with the provider
        const response = await this.executeWithProvider(providerName, request);
        
        // Update rate limiters
        this.updateRateLimiters(providerName, response.usage.totalTokens);
        
        // Record successful request
        this.recordRequest(providerName, true, Date.now() - startTime);
        
        this.logger.info(`AI request completed successfully with ${providerName} in ${response.processingTime}ms`);
        this.emit("requestCompleted", { provider: providerName, response, success: true });
        
        return response;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Provider ${providerName} failed:`, error);
        
        // Record failed request
        this.recordRequest(providerName, false, Date.now() - startTime);
        
        // Mark provider as potentially unhealthy
        this.updateProviderHealth(providerName, false, Date.now() - startTime);
        
        continue;
      }
    }

    // All providers failed
    const error = new Error(`All AI providers failed. Last error: ${lastError?.message}`);
    this.logger.error("AI request failed with all providers:", error);
    this.emit("requestFailed", { request, error: error.message });
    throw error;
  }

  /**
   * Execute request with a specific provider
   */
  private async executeWithProvider(providerName: string, request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const client = this.clients.get(providerName);
    const config = this.providers.get(providerName);
    
    if (!client || !config) {
      throw new Error(`Provider ${providerName} not found or not configured`);
    }

    let response: any;
    let content: string;
    let usage: any;

    switch (providerName.toLowerCase()) {
      case "openai":
        response = await client.chat.completions.create({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
          tools: request.tools,
          tool_choice: request.toolChoice,
        });
        content = response.choices[0]?.message?.content || "";
        usage = response.usage;
        break;

      case "anthropic":
        response = await client.messages.create({
          model: request.model,
          messages: request.messages.filter(m => m.role !== "system"),
          system: request.messages.find(m => m.role === "system")?.content,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
        });
        content = response.content[0]?.text || "";
        usage = {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens,
        };
        break;

      default:
        throw new Error(`Provider ${providerName} not yet implemented`);
    }

    const processingTime = Date.now() - startTime;
    const cost = this.calculateCost(config, usage);

    return {
      content,
      usage: {
        promptTokens: usage.prompt_tokens || usage.promptTokens,
        completionTokens: usage.completion_tokens || usage.completionTokens,
        totalTokens: usage.total_tokens || usage.totalTokens,
      },
      model: request.model,
      provider: providerName,
      cost,
      processingTime,
      requestId: this.generateRequestId(),
    };
  }

  /**
   * Get available providers for a specific model, sorted by priority and health
   */
  private getAvailableProviders(model: string): string[] {
    return Array.from(this.providers.entries())
      .filter(([name, config]) => {
        return config.enabled && 
               config.supportedModels.includes(model) &&
               this.healthStatus.get(name)?.healthy !== false;
      })
      .sort((a, b) => {
        const [nameA, configA] = a;
        const [nameB, configB] = b;
        
        // Sort by priority (higher first), then by health status
        const healthA = this.healthStatus.get(nameA);
        const healthB = this.healthStatus.get(nameB);
        
        if (configA.priority !== configB.priority) {
          return configB.priority - configA.priority;
        }
        
        // Prefer providers with lower error rates
        return (healthA?.errorRate || 0) - (healthB?.errorRate || 0);
      })
      .map(([name]) => name);
  }

  /**
   * Check if provider is within rate limits
   */
  private checkRateLimit(providerName: string, request: AIRequest): boolean {
    const config = this.providers.get(providerName);
    const limiter = this.rateLimiters.get(providerName);
    
    if (!config || !limiter) return false;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean old entries
    limiter.requests = limiter.requests.filter(timestamp => timestamp > oneMinuteAgo);
    limiter.tokens = limiter.tokens.filter(timestamp => timestamp > oneMinuteAgo);

    // Check limits
    const currentRequests = limiter.requests.length;
    const currentTokens = limiter.tokens.length;

    return currentRequests < config.rateLimits.requestsPerMinute &&
           currentTokens < config.rateLimits.tokensPerMinute;
  }

  /**
   * Update rate limiters after a successful request
   */
  private updateRateLimiters(providerName: string, tokens: number): void {
    const limiter = this.rateLimiters.get(providerName);
    if (limiter) {
      const now = Date.now();
      limiter.requests.push(now);
      for (let i = 0; i < tokens; i++) {
        limiter.tokens.push(now);
      }
    }
  }

  /**
   * Calculate cost for a request
   */
  private calculateCost(config: AIProviderConfig, usage: any): number {
    const inputTokens = usage.prompt_tokens || usage.promptTokens || 0;
    const outputTokens = usage.completion_tokens || usage.completionTokens || 0;
    
    return (inputTokens * config.costPerToken.input) + (outputTokens * config.costPerToken.output);
  }

  /**
   * Record request metrics
   */
  private recordRequest(provider: string, success: boolean, responseTime: number): void {
    this.requestHistory.push({
      provider,
      timestamp: new Date(),
      success,
      responseTime,
    });

    // Keep only last 1000 requests
    if (this.requestHistory.length > 1000) {
      this.requestHistory = this.requestHistory.slice(-1000);
    }

    this.updateProviderHealth(provider, success, responseTime);
  }

  /**
   * Update provider health status
   */
  private updateProviderHealth(provider: string, success: boolean, responseTime: number): void {
    const status = this.healthStatus.get(provider);
    if (!status) return;

    status.lastChecked = new Date();
    status.responseTime = (status.responseTime + responseTime) / 2; // Moving average

    // Calculate error rate from recent requests
    const recentRequests = this.requestHistory
      .filter(r => r.provider === provider && r.timestamp > new Date(Date.now() - 300000)) // Last 5 minutes
      .slice(-20); // Last 20 requests

    if (recentRequests.length > 0) {
      const failures = recentRequests.filter(r => !r.success).length;
      status.errorRate = failures / recentRequests.length;
      status.healthy = status.errorRate < 0.5; // Mark unhealthy if >50% error rate
    }

    this.healthStatus.set(provider, status);
  }

  /**
   * Setup periodic health checks
   */
  private setupHealthChecks(): void {
    setInterval(async () => {
      for (const [providerName] of this.providers) {
        try {
          await this.performHealthCheck(providerName);
        } catch (error) {
          this.logger.warn(`Health check failed for ${providerName}:`, error);
        }
      }
    }, 60000); // Every minute
  }

  /**
   * Perform health check for a provider
   */
  private async performHealthCheck(providerName: string): Promise<void> {
    try {
      const testRequest: AIRequest = {
        model: "gpt-3.5-turbo", // Use a basic model for health checks
        messages: [{ role: "user", content: "Health check" }],
        maxTokens: 10,
      };

      const startTime = Date.now();
      await this.executeWithProvider(providerName, testRequest);
      const responseTime = Date.now() - startTime;

      this.updateProviderHealth(providerName, true, responseTime);
    } catch (error) {
      this.updateProviderHealth(providerName, false, 0);
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      totalProviders: this.providers.size,
      healthyProviders: Array.from(this.healthStatus.values()).filter(s => s.healthy).length,
      providerStatus: Array.from(this.healthStatus.values()),
      recentRequests: this.requestHistory.slice(-10),
    };
  }

  /**
   * Get detailed metrics
   */
  getMetrics() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const recentRequests = this.requestHistory.filter(r => r.timestamp.getTime() > oneHourAgo);

    return {
      totalRequests: this.requestHistory.length,
      recentRequests: recentRequests.length,
      successRate: recentRequests.length > 0 
        ? recentRequests.filter(r => r.success).length / recentRequests.length 
        : 0,
      averageResponseTime: recentRequests.length > 0
        ? recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length
        : 0,
      providerDistribution: this.getProviderDistribution(recentRequests),
    };
  }

  /**
   * Get provider usage distribution
   */
  private getProviderDistribution(requests: typeof this.requestHistory): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const request of requests) {
      distribution[request.provider] = (distribution[request.provider] || 0) + 1;
    }
    return distribution;
  }
}

// Export singleton instance
export const aiProviderManager = AIProviderManager.getInstance();