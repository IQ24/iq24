/**
 * Video Generation Engine - MSEO Component
 * 
 * Handles AI-powered video generation for personalized video content in outreach campaigns
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { 
  MSEOConfig, 
  MSEOGenerationRequest, 
  MSEOGenerationResult, 
  VideoTemplate 
} from './types';

export interface VideoGenerationParams {
  script?: string;
  visualPrompts: string[];
  provider: 'runwayml' | 'pika' | 'synthesia';
  duration?: number;
  quality?: 'draft' | 'standard' | 'high' | '4k';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  frameRate?: number;
  style?: string;
  avatar?: string;
  voice?: string;
  background?: string;
  music?: boolean;
  subtitles?: boolean;
  branding?: boolean;
}

export interface VideoGenerationResponse {
  video: {
    url: string;
    localPath?: string;
    thumbnailUrl?: string;
    metadata: {
      width: number;
      height: number;
      duration: number;
      frameRate: number;
      format: string;
      fileSize: number;
      provider: string;
      model: string;
      cost: number;
      quality: string;
      aspectRatio: string;
      hasAudio: boolean;
      hasSubtitles: boolean;
    };
  };
  requestMetadata: {
    totalCost: number;
    generationTime: number;
    provider: string;
    processingSteps: string[];
  };
}

export class VideoEngine extends EventEmitter {
  private config: MSEOConfig['video'];
  private logger: Logger;
  private cache: Map<string, { video: any; metadata: any; expiresAt: Date }>;
  private activeGenerations: Map<string, Promise<VideoGenerationResponse>>;
  private rateLimits: Map<string, { requests: number; resetTime: Date }>;

  constructor(config: MSEOConfig['video'], logger: Logger) {
    super();
    this.config = config;
    this.logger = logger;
    this.cache = new Map();
    this.activeGenerations = new Map();
    this.rateLimits = new Map();

    // Setup cache cleanup interval
    setInterval(() => this.cleanupCache(), 600000); // Check every 10 minutes
  }

  /**
   * Generate video using specified provider and parameters
   */
  async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResponse> {
    try {
      const cacheKey = this.getCacheKey(params);
      
      // Check cache first
      if (this.config.cachingEnabled) {
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
          this.logger.info('Video generation cache hit', { cacheKey });
          return cached;
        }
      }

      // Check if generation is already in progress
      const existingGeneration = this.activeGenerations.get(cacheKey);
      if (existingGeneration) {
        this.logger.info('Reusing active video generation', { cacheKey });
        return await existingGeneration;
      }

      // Check rate limits
      await this.checkRateLimit(params.provider);

      // Start new generation
      const generationPromise = this.executeVideoGeneration(params);
      this.activeGenerations.set(cacheKey, generationPromise);

      try {
        const result = await generationPromise;
        
        // Cache the result
        if (this.config.cachingEnabled) {
          this.cacheResult(cacheKey, result);
        }

        this.emit('videoGenerated', {
          provider: params.provider,
          quality: params.quality,
          duration: result.video.metadata.duration,
          cost: result.requestMetadata.totalCost,
          generationTime: result.requestMetadata.generationTime
        });

        return result;
      } finally {
        this.activeGenerations.delete(cacheKey);
      }
    } catch (error) {
      this.logger.error('Video generation failed', { 
        error: error.message, 
        provider: params.provider,
        visualPrompts: params.visualPrompts.length
      });
      
      this.emit('videoGenerationFailed', {
        provider: params.provider,
        visualPrompts: params.visualPrompts,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Generate personalized video using template and prospect data
   */
  async generatePersonalizedVideo(
    template: VideoTemplate,
    variables: Record<string, any>,
    prospectData: any
  ): Promise<VideoGenerationResponse> {
    try {
      // Process template with variables and personalization
      const personalizedScript = this.personalizeScript(template.script, variables, prospectData);
      const personalizedVisuals = template.visualPrompts.map(prompt => 
        this.personalizePrompt(prompt, variables, prospectData)
      );
      
      // Apply video settings from template
      const params: VideoGenerationParams = {
        script: personalizedScript,
        visualPrompts: personalizedVisuals,
        provider: template.videoSettings.provider as any,
        duration: template.videoSettings.duration,
        quality: this.config.quality,
        aspectRatio: template.dimensions.aspectRatio as any,
        frameRate: template.dimensions.frameRate,
        style: template.videoSettings.style,
        music: template.videoSettings.music,
        subtitles: template.videoSettings.subtitles,
        branding: template.videoSettings.branding
      };

      return await this.generateVideo(params);
    } catch (error) {
      this.logger.error('Personalized video generation failed', {
        error: error.message,
        templateId: template.id,
        prospectId: prospectData.id
      });
      throw error;
    }
  }

  /**
   * Execute video generation with specific provider
   */
  private async executeVideoGeneration(params: VideoGenerationParams): Promise<VideoGenerationResponse> {
    const startTime = Date.now();
    
    switch (params.provider) {
      case 'runwayml':
        return await this.generateWithRunwayML(params, startTime);
      case 'pika':
        return await this.generateWithPika(params, startTime);
      case 'synthesia':
        return await this.generateWithSynthesia(params, startTime);
      default:
        throw new Error(`Unsupported video provider: ${params.provider}`);
    }
  }

  /**
   * Generate video using Runway ML API
   */
  private async generateWithRunwayML(params: VideoGenerationParams, startTime: number): Promise<VideoGenerationResponse> {
    if (!this.config.providers.runwayml.enabled) {
      throw new Error('Runway ML provider is not enabled');
    }

    const config = this.config.providers.runwayml;
    
    // Step 1: Create generation request
    const createResponse = await fetch('https://api.runwayml.com/v1/video/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        prompt: params.visualPrompts.join(', '),
        duration: params.duration || config.duration,
        ratio: params.aspectRatio || config.ratio,
        watermark: config.watermark,
        quality: params.quality || 'standard'
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Runway ML API error: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.id;

    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.runwayml.com/v1/video/generate/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check Runway ML status: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'completed') {
        const generationTime = Date.now() - startTime;
        const cost = this.calculateCost('runwayml', params.duration || config.duration);

        return {
          video: {
            url: statusData.output.url,
            thumbnailUrl: statusData.output.thumbnail,
            metadata: {
              width: params.aspectRatio === '16:9' ? 1920 : params.aspectRatio === '9:16' ? 1080 : 1080,
              height: params.aspectRatio === '16:9' ? 1080 : params.aspectRatio === '9:16' ? 1920 : 1080,
              duration: params.duration || config.duration,
              frameRate: 24,
              format: 'mp4',
              fileSize: statusData.output.fileSize || 0,
              provider: 'runwayml',
              model: config.model,
              cost: cost,
              quality: params.quality || 'standard',
              aspectRatio: params.aspectRatio || config.ratio,
              hasAudio: false,
              hasSubtitles: false
            }
          },
          requestMetadata: {
            totalCost: cost,
            generationTime,
            provider: 'runwayml',
            processingSteps: ['prompt_processing', 'video_generation', 'post_processing']
          }
        };
      }
      
      if (statusData.status === 'failed') {
        throw new Error(`Runway ML generation failed: ${statusData.error}`);
      }
      
      attempts++;
    }

    throw new Error('Runway ML generation timed out');
  }

  /**
   * Generate video using Pika Labs API
   */
  private async generateWithPika(params: VideoGenerationParams, startTime: number): Promise<VideoGenerationResponse> {
    if (!this.config.providers.pika.enabled) {
      throw new Error('Pika Labs provider is not enabled');
    }

    const config = this.config.providers.pika;
    
    // Note: This is a placeholder implementation
    // Actual Pika Labs API integration would require their specific endpoints
    const createResponse = await fetch('https://api.pika.art/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: params.visualPrompts.join(', '),
        aspect_ratio: params.aspectRatio || config.aspectRatio,
        frame_rate: params.frameRate || config.frameRate,
        duration: params.duration || config.duration
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Pika Labs API error: ${createResponse.status} - ${errorText}`);
    }

    // Simplified response handling - actual implementation would be more complex
    const data = await createResponse.json();
    const generationTime = Date.now() - startTime;
    const cost = this.calculateCost('pika', params.duration || config.duration);

    return {
      video: {
        url: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        metadata: {
          width: 1920,
          height: 1080,
          duration: params.duration || config.duration,
          frameRate: params.frameRate || config.frameRate,
          format: 'mp4',
          fileSize: data.file_size || 0,
          provider: 'pika',
          model: 'pika-1.0',
          cost: cost,
          quality: params.quality || 'standard',
          aspectRatio: params.aspectRatio || config.aspectRatio,
          hasAudio: false,
          hasSubtitles: false
        }
      },
      requestMetadata: {
        totalCost: cost,
        generationTime,
        provider: 'pika',
        processingSteps: ['prompt_processing', 'video_generation']
      }
    };
  }

  /**
   * Generate video using Synthesia API (AI Avatar videos)
   */
  private async generateWithSynthesia(params: VideoGenerationParams, startTime: number): Promise<VideoGenerationResponse> {
    if (!this.config.providers.synthesia.enabled) {
      throw new Error('Synthesia provider is not enabled');
    }

    const config = this.config.providers.synthesia;
    
    const createResponse = await fetch('https://api.synthesia.io/v2/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: params.script ? params.script.substring(0, 50) + '...' : config.title,
        avatar: params.avatar || config.avatar,
        voice: params.voice || config.voice,
        background: params.background || config.background,
        script: params.script || params.visualPrompts.join(' '),
        webhook_url: null // We'll poll instead
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Synthesia API error: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();
    const videoId = createData.id;

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes with 5-second intervals
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await fetch(`https://api.synthesia.io/v2/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check Synthesia status: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'complete') {
        const generationTime = Date.now() - startTime;
        const cost = this.calculateCost('synthesia', statusData.duration);

        return {
          video: {
            url: statusData.download_url,
            thumbnailUrl: statusData.thumbnail,
            metadata: {
              width: 1920,
              height: 1080,
              duration: statusData.duration,
              frameRate: 25,
              format: 'mp4',
              fileSize: statusData.size || 0,
              provider: 'synthesia',
              model: 'synthesia-ai',
              cost: cost,
              quality: params.quality || 'standard',
              aspectRatio: '16:9',
              hasAudio: true,
              hasSubtitles: params.subtitles || false
            }
          },
          requestMetadata: {
            totalCost: cost,
            generationTime,
            provider: 'synthesia',
            processingSteps: ['script_processing', 'avatar_rendering', 'voice_synthesis', 'video_compilation']
          }
        };
      }
      
      if (statusData.status === 'failed') {
        throw new Error(`Synthesia generation failed: ${statusData.error}`);
      }
      
      attempts++;
    }

    throw new Error('Synthesia generation timed out');
  }

  /**
   * Personalize script with variables and prospect data
   */
  private personalizeScript(
    script: string, 
    variables: Record<string, any>, 
    prospectData: any
  ): string {
    let personalizedScript = script;

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalizedScript = personalizedScript.replace(regex, String(value));
    });

    // Add prospect-specific personalization
    if (prospectData) {
      const replacements = {
        'prospect_name': prospectData.firstName || prospectData.name || 'there',
        'prospect_company': prospectData.company || 'your company',
        'prospect_title': prospectData.title || 'your role',
        'prospect_industry': prospectData.industry || 'your industry'
      };

      Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        personalizedScript = personalizedScript.replace(regex, String(value));
      });
    }

    return personalizedScript;
  }

  /**
   * Personalize visual prompt with variables and prospect data
   */
  private personalizePrompt(
    prompt: string, 
    variables: Record<string, any>, 
    prospectData: any
  ): string {
    let personalizedPrompt = prompt;

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalizedPrompt = personalizedPrompt.replace(regex, String(value));
    });

    // Add prospect-specific visual elements
    if (prospectData) {
      const replacements = {
        'industry_visual': this.getIndustryVisual(prospectData.industry),
        'company_style': this.getCompanyStyle(prospectData.company),
        'professional_setting': this.getProfessionalSetting(prospectData.title)
      };

      Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        personalizedPrompt = personalizedPrompt.replace(regex, String(value));
      });
    }

    return personalizedPrompt;
  }

  /**
   * Get industry-specific visual elements
   */
  private getIndustryVisual(industry?: string): string {
    const industryVisuals = {
      'technology': 'modern office with computers and digital displays',
      'healthcare': 'clean medical facility with modern equipment',
      'finance': 'professional banking environment with charts',
      'manufacturing': 'industrial facility with machinery',
      'retail': 'modern storefront with products',
      'education': 'bright classroom or campus setting'
    };

    return industryVisuals[industry?.toLowerCase()] || 'professional business environment';
  }

  /**
   * Get company-style visual elements
   */
  private getCompanyStyle(company?: string): string {
    // This could be enhanced with actual company data lookup
    if (company) {
      const companySize = company.length > 20 ? 'enterprise' : 'startup';
      return companySize === 'enterprise' ? 
        'corporate headquarters with glass buildings' : 
        'modern startup office with open spaces';
    }
    return 'professional office environment';
  }

  /**
   * Get role-specific professional setting
   */
  private getProfessionalSetting(title?: string): string {
    const titleSettings = {
      'ceo': 'executive boardroom with city view',
      'cto': 'high-tech development environment',
      'marketing': 'creative workspace with presentations',
      'sales': 'client meeting room with presentations',
      'hr': 'comfortable office meeting space'
    };

    const key = Object.keys(titleSettings).find(k => 
      title?.toLowerCase().includes(k)
    );

    return titleSettings[key] || 'professional meeting room';
  }

  /**
   * Generate cache key for video generation request
   */
  private getCacheKey(params: VideoGenerationParams): string {
    const keyData = {
      script: params.script,
      visualPrompts: params.visualPrompts,
      provider: params.provider,
      duration: params.duration,
      quality: params.quality,
      aspectRatio: params.aspectRatio,
      frameRate: params.frameRate,
      style: params.style,
      avatar: params.avatar,
      voice: params.voice,
      background: params.background
    };
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  /**
   * Get cached video generation result
   */
  private getCachedResult(cacheKey: string): VideoGenerationResponse | null {
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > new Date()) {
      return {
        video: cached.video,
        requestMetadata: cached.metadata
      };
    }
    return null;
  }

  /**
   * Cache video generation result
   */
  private cacheResult(cacheKey: string, result: VideoGenerationResponse): void {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.config.cacheExpiryHours);

    this.cache.set(cacheKey, {
      video: result.video,
      metadata: result.requestMetadata,
      expiresAt
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
    const currentLimits = this.rateLimits.get(rateLimitKey) || { requests: 0, resetTime: now };

    // Reset if time window has passed
    if (now >= currentLimits.resetTime) {
      currentLimits.requests = 0;
      currentLimits.resetTime = new Date(now.getTime() + 300000); // 5 minute window for videos
    }

    // Check limits based on provider (videos are more resource-intensive)
    const maxRequestsPer5Minutes = provider === 'synthesia' ? 5 : provider === 'runwayml' ? 3 : 2;
    
    if (currentLimits.requests >= maxRequestsPer5Minutes) {
      const waitTime = currentLimits.resetTime.getTime() - now.getTime();
      throw new Error(`Rate limit exceeded for ${provider}. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    currentLimits.requests++;
    this.rateLimits.set(rateLimitKey, currentLimits);
  }

  /**
   * Calculate cost based on provider and video duration
   */
  private calculateCost(provider: string, duration: number): number {
    // Simplified cost calculation - should be based on actual provider pricing
    const costPerSecond = {
      'runwayml': 0.5,
      'pika': 0.3,
      'synthesia': 1.0
    };

    return duration * (costPerSecond[provider] || 0.5);
  }

  /**
   * Get video engine health status
   */
  getHealthStatus(): any {
    return {
      status: 'healthy',
      providers: {
        runwayml: this.config.providers.runwayml.enabled,
        pika: this.config.providers.pika.enabled,
        synthesia: this.config.providers.synthesia.enabled
      },
      cache: {
        size: this.cache.size,
        enabled: this.config.cachingEnabled
      },
      activeGenerations: this.activeGenerations.size,
      rateLimits: Object.fromEntries(this.rateLimits)
    };
  }

  /**
   * Clean shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Video Engine...');
    
    // Wait for active generations to complete (with longer timeout for videos)
    const activeGenerations = Array.from(this.activeGenerations.values());
    if (activeGenerations.length > 0) {
      this.logger.info(`Waiting for ${activeGenerations.length} active video generations to complete...`);
      
      const timeout = new Promise(resolve => setTimeout(resolve, 300000)); // 5 minute timeout
      const completions = Promise.all(activeGenerations);
      
      await Promise.race([completions, timeout]);
    }

    // Clear cache and cleanup
    this.cache.clear();
    this.activeGenerations.clear();
    this.rateLimits.clear();
    
    this.logger.info('Video Engine shutdown complete');
  }
}