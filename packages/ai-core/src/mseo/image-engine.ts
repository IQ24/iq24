/**
 * Image Generation Engine - MSEO Component
 *
 * Handles AI-powered image generation for personalized visual content in outreach campaigns
 */

import { EventEmitter } from "events";
import { Logger } from "../utils/logger";
import {
  MSEOConfig,
  MSEOGenerationRequest,
  MSEOGenerationResult,
  ImageTemplate,
} from "./types";

export interface ImageGenerationParams {
  prompt: string;
  provider: "openai" | "stability" | "midjourney";
  size?: string;
  quality?: "draft" | "standard" | "high" | "premium";
  style?: string;
  negativePrompt?: string;
  seed?: number;
  steps?: number;
  cfgScale?: number;
  samples?: number;
}

export interface ImageGenerationResponse {
  images: Array<{
    url: string;
    localPath?: string;
    metadata: {
      width: number;
      height: number;
      format: string;
      fileSize: number;
      provider: string;
      model: string;
      cost: number;
      quality: string;
      prompt: string;
      seed?: number;
    };
  }>;
  requestMetadata: {
    totalCost: number;
    generationTime: number;
    provider: string;
    totalImages: number;
  };
}

export class ImageEngine extends EventEmitter {
  private config: MSEOConfig["image"];
  private logger: Logger;
  private cache: Map<string, { images: any[]; metadata: any; expiresAt: Date }>;
  private activeGenerations: Map<string, Promise<ImageGenerationResponse>>;
  private rateLimits: Map<string, { requests: number; resetTime: Date }>;

  constructor(config: MSEOConfig["image"], logger: Logger) {
    super();
    this.config = config;
    this.logger = logger;
    this.cache = new Map();
    this.activeGenerations = new Map();
    this.rateLimits = new Map();

    // Setup cache cleanup interval
    setInterval(() => this.cleanupCache(), 300000); // Check every 5 minutes
  }

  /**
   * Generate images using specified provider and parameters
   */
  async generateImage(
    params: ImageGenerationParams,
  ): Promise<ImageGenerationResponse> {
    try {
      const cacheKey = this.getCacheKey(params);

      // Check cache first
      if (this.config.cachingEnabled) {
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
          this.logger.info("Image generation cache hit", { cacheKey });
          return cached;
        }
      }

      // Check if generation is already in progress
      const existingGeneration = this.activeGenerations.get(cacheKey);
      if (existingGeneration) {
        this.logger.info("Reusing active image generation", { cacheKey });
        return await existingGeneration;
      }

      // Check rate limits
      await this.checkRateLimit(params.provider);

      // Start new generation
      const generationPromise = this.executeImageGeneration(params);
      this.activeGenerations.set(cacheKey, generationPromise);

      try {
        const result = await generationPromise;

        // Cache the result
        if (this.config.cachingEnabled) {
          this.cacheResult(cacheKey, result);
        }

        this.emit("imageGenerated", {
          provider: params.provider,
          quality: params.quality,
          totalImages: result.requestMetadata.totalImages,
          cost: result.requestMetadata.totalCost,
          generationTime: result.requestMetadata.generationTime,
        });

        return result;
      } finally {
        this.activeGenerations.delete(cacheKey);
      }
    } catch (error) {
      this.logger.error("Image generation failed", {
        error: error.message,
        provider: params.provider,
        prompt: params.prompt.substring(0, 100) + "...",
      });

      this.emit("imageGenerationFailed", {
        provider: params.provider,
        prompt: params.prompt,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Generate personalized image using template and prospect data
   */
  async generatePersonalizedImage(
    template: ImageTemplate,
    variables: Record<string, any>,
    prospectData: any,
  ): Promise<ImageGenerationResponse> {
    try {
      // Process template with variables and personalization
      const personalizedPrompt = this.personalizePrompt(
        template.prompt,
        variables,
        prospectData,
      );

      // Apply image settings from template
      const params: ImageGenerationParams = {
        prompt: personalizedPrompt,
        provider: template.imageSettings.provider as any,
        quality: this.config.quality,
        style: template.imageSettings.style,
        size: `${template.dimensions.width}x${template.dimensions.height}`,
      };

      // Apply provider-specific settings
      if (
        params.provider === "stability" &&
        this.config.providers.stability.enabled
      ) {
        const stabilityConfig = this.config.providers.stability;
        params.steps = stabilityConfig.steps;
        params.cfgScale = stabilityConfig.cfgScale;
        params.seed = stabilityConfig.seed;
        params.samples = stabilityConfig.samples;
      }

      return await this.generateImage(params);
    } catch (error) {
      this.logger.error("Personalized image generation failed", {
        error: error.message,
        templateId: template.id,
        prospectId: prospectData.id,
      });
      throw error;
    }
  }

  /**
   * Execute image generation with specific provider
   */
  private async executeImageGeneration(
    params: ImageGenerationParams,
  ): Promise<ImageGenerationResponse> {
    const startTime = Date.now();

    switch (params.provider) {
      case "openai":
        return await this.generateWithOpenAI(params, startTime);
      case "stability":
        return await this.generateWithStability(params, startTime);
      case "midjourney":
        return await this.generateWithMidjourney(params, startTime);
      default:
        throw new Error(`Unsupported image provider: ${params.provider}`);
    }
  }

  /**
   * Generate image using OpenAI DALL-E API
   */
  private async generateWithOpenAI(
    params: ImageGenerationParams,
    startTime: number,
  ): Promise<ImageGenerationResponse> {
    if (!this.config.providers.openai.enabled) {
      throw new Error("OpenAI provider is not enabled");
    }

    const config = this.config.providers.openai;
    const url = "https://api.openai.com/v1/images/generations";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        prompt: params.prompt,
        n: params.samples || 1,
        size: params.size || config.size,
        quality: config.quality,
        style: config.style,
        response_format: "url",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI DALL-E API error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    const generationTime = Date.now() - startTime;
    const totalCost = this.calculateCost(
      "openai",
      params.prompt.length,
      data.data.length,
    );

    const images = data.data.map((item: any, index: number) => ({
      url: item.url,
      metadata: {
        width: parseInt(params.size?.split("x")[0] || "1024"),
        height: parseInt(params.size?.split("x")[1] || "1024"),
        format: "png",
        fileSize: 0, // Will be updated when downloaded
        provider: "openai",
        model: config.model,
        cost: totalCost / data.data.length,
        quality: params.quality || "standard",
        prompt: params.prompt,
        seed: undefined,
      },
    }));

    return {
      images,
      requestMetadata: {
        totalCost,
        generationTime,
        provider: "openai",
        totalImages: images.length,
      },
    };
  }

  /**
   * Generate image using Stability AI API
   */
  private async generateWithStability(
    params: ImageGenerationParams,
    startTime: number,
  ): Promise<ImageGenerationResponse> {
    if (!this.config.providers.stability.enabled) {
      throw new Error("Stability AI provider is not enabled");
    }

    const config = this.config.providers.stability;
    const url = `https://api.stability.ai/v1/generation/${config.engine}/text-to-image`;

    const formData = new FormData();
    formData.append("text_prompts[0][text]", params.prompt);
    formData.append("text_prompts[0][weight]", "1");

    if (params.negativePrompt) {
      formData.append("text_prompts[1][text]", params.negativePrompt);
      formData.append("text_prompts[1][weight]", "-1");
    }

    formData.append("cfg_scale", String(params.cfgScale || config.cfgScale));
    formData.append("steps", String(params.steps || config.steps));
    formData.append("samples", String(params.samples || config.samples));
    formData.append("seed", String(params.seed || config.seed));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Stability AI API error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    const generationTime = Date.now() - startTime;
    const totalCost = this.calculateCost(
      "stability",
      params.prompt.length,
      data.artifacts.length,
    );

    const images = data.artifacts.map((artifact: any, index: number) => ({
      url: `data:image/png;base64,${artifact.base64}`,
      metadata: {
        width: 1024, // Stability AI default
        height: 1024,
        format: "png",
        fileSize: Math.floor(artifact.base64.length * 0.75), // Approximate file size
        provider: "stability",
        model: config.engine,
        cost: totalCost / data.artifacts.length,
        quality: params.quality || "standard",
        prompt: params.prompt,
        seed: artifact.seed,
      },
    }));

    return {
      images,
      requestMetadata: {
        totalCost,
        generationTime,
        provider: "stability",
        totalImages: images.length,
      },
    };
  }

  /**
   * Generate image using Midjourney API (placeholder implementation)
   */
  private async generateWithMidjourney(
    params: ImageGenerationParams,
    startTime: number,
  ): Promise<ImageGenerationResponse> {
    if (!this.config.providers.midjourney.enabled) {
      throw new Error("Midjourney provider is not enabled");
    }

    // Note: This is a placeholder implementation
    // Actual Midjourney API integration would require their specific endpoints and authentication
    throw new Error(
      "Midjourney provider not yet implemented - placeholder for future integration",
    );
  }

  /**
   * Personalize prompt with variables and prospect data
   */
  private personalizePrompt(
    prompt: string,
    variables: Record<string, any>,
    prospectData: any,
  ): string {
    let personalizedPrompt = prompt;

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      personalizedPrompt = personalizedPrompt.replace(regex, String(value));
    });

    // Add prospect-specific personalization
    if (prospectData) {
      const replacements = {
        prospect_name:
          prospectData.firstName || prospectData.name || "Professional",
        prospect_company: prospectData.company || "Business",
        prospect_industry: prospectData.industry || "Industry",
        prospect_title: prospectData.title || "Professional",
      };

      Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        personalizedPrompt = personalizedPrompt.replace(regex, String(value));
      });
    }

    // Add quality and style modifiers based on configuration
    if (this.config.personalizationLevel === "hyper") {
      personalizedPrompt +=
        ", highly detailed, professional quality, modern style";
    } else if (this.config.personalizationLevel === "advanced") {
      personalizedPrompt += ", professional quality, clean design";
    }

    return personalizedPrompt;
  }

  /**
   * Generate cache key for image generation request
   */
  private getCacheKey(params: ImageGenerationParams): string {
    const keyData = {
      prompt: params.prompt,
      provider: params.provider,
      size: params.size,
      quality: params.quality,
      style: params.style,
      negativePrompt: params.negativePrompt,
      seed: params.seed,
      steps: params.steps,
      cfgScale: params.cfgScale,
      samples: params.samples,
    };

    return Buffer.from(JSON.stringify(keyData)).toString("base64");
  }

  /**
   * Get cached image generation result
   */
  private getCachedResult(cacheKey: string): ImageGenerationResponse | null {
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > new Date()) {
      return {
        images: cached.images,
        requestMetadata: cached.metadata,
      };
    }
    return null;
  }

  /**
   * Cache image generation result
   */
  private cacheResult(cacheKey: string, result: ImageGenerationResponse): void {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.config.cacheExpiryHours);

    this.cache.set(cacheKey, {
      images: result.images,
      metadata: result.requestMetadata,
      expiresAt,
    });
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = new Date();
    for (const [key, cached] of this.cache.entries()) {
      if (cached.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Check and enforce rate limits for provider
   */
  private async checkRateLimit(provider: string): Promise<void> {
    const now = new Date();
    const rateLimitKey = provider;
    const currentLimits = this.rateLimits.get(rateLimitKey) || {
      requests: 0,
      resetTime: now,
    };

    // Reset if time window has passed
    if (now >= currentLimits.resetTime) {
      currentLimits.requests = 0;
      currentLimits.resetTime = new Date(now.getTime() + 60000); // 1 minute window
    }

    // Check limits based on provider
    const maxRequestsPerMinute =
      provider === "openai" ? 5 : provider === "stability" ? 10 : 3;

    if (currentLimits.requests >= maxRequestsPerMinute) {
      const waitTime = currentLimits.resetTime.getTime() - now.getTime();
      throw new Error(
        `Rate limit exceeded for ${provider}. Try again in ${Math.ceil(waitTime / 1000)} seconds.`,
      );
    }

    currentLimits.requests++;
    this.rateLimits.set(rateLimitKey, currentLimits);
  }

  /**
   * Calculate cost based on provider and request parameters
   */
  private calculateCost(
    provider: string,
    promptLength: number,
    imageCount: number,
  ): number {
    // Simplified cost calculation - should be based on actual provider pricing
    const costPerImage = {
      openai: 0.02, // DALL-E 3 pricing
      stability: 0.01, // Stability AI pricing
      midjourney: 0.05, // Estimated Midjourney pricing
    };

    return imageCount * (costPerImage[provider] || 0.01);
  }

  /**
   * Download and save image locally (optional utility)
   */
  async downloadImage(url: string, localPath: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      // Note: In a real implementation, you'd use fs.writeFile or similar
      // For now, we'll just return the path

      this.logger.info("Image downloaded successfully", {
        url,
        localPath,
        size: buffer.byteLength,
      });
      return localPath;
    } catch (error) {
      this.logger.error("Failed to download image", {
        error: error.message,
        url,
      });
      throw error;
    }
  }

  /**
   * Get image engine health status
   */
  getHealthStatus(): any {
    return {
      status: "healthy",
      providers: {
        openai: this.config.providers.openai.enabled,
        stability: this.config.providers.stability.enabled,
        midjourney: this.config.providers.midjourney.enabled,
      },
      cache: {
        size: this.cache.size,
        enabled: this.config.cachingEnabled,
      },
      activeGenerations: this.activeGenerations.size,
      rateLimits: Object.fromEntries(this.rateLimits),
    };
  }

  /**
   * Clean shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info("Shutting down Image Engine...");

    // Wait for active generations to complete (with timeout)
    const activeGenerations = Array.from(this.activeGenerations.values());
    if (activeGenerations.length > 0) {
      this.logger.info(
        `Waiting for ${activeGenerations.length} active image generations to complete...`,
      );

      const timeout = new Promise((resolve) => setTimeout(resolve, 60000)); // 60 second timeout
      const completions = Promise.all(activeGenerations);

      await Promise.race([completions, timeout]);
    }

    // Clear cache and cleanup
    this.cache.clear();
    this.activeGenerations.clear();
    this.rateLimits.clear();

    this.logger.info("Image Engine shutdown complete");
  }
}
