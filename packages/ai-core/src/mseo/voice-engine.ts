/**
 * Voice Generation Engine - MSEO Component
 * 
 * Handles AI-powered voice synthesis for personalized outreach campaigns
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { 
  MSEOConfig, 
  MSEOGenerationRequest, 
  MSEOGenerationResult, 
  VoiceTemplate 
} from './types';

export interface VoiceGenerationParams {
  text: string;
  provider: 'elevenlabs' | 'openai' | 'azure';
  voice: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  outputFormat?: 'mp3' | 'wav' | 'flac' | 'ogg';
  quality?: 'standard' | 'high' | 'premium';
}

export interface VoiceGenerationResponse {
  audioBuffer: Buffer;
  metadata: {
    duration: number;
    format: string;
    provider: string;
    voice: string;
    cost: number;
    quality: string;
  };
}

export class VoiceEngine extends EventEmitter {
  private config: MSEOConfig['voice'];
  private logger: Logger;
  private cache: Map<string, { buffer: Buffer; metadata: any; expiresAt: Date }>;
  private activeGenerations: Map<string, Promise<VoiceGenerationResponse>>;
  private rateLimits: Map<string, { requests: number; resetTime: Date }>;

  constructor(config: MSEOConfig['voice'], logger: Logger) {
    super();
    this.config = config;
    this.logger = logger;
    this.cache = new Map();
    this.activeGenerations = new Map();
    this.rateLimits = new Map();

    // Setup cache cleanup interval
    setInterval(() => this.cleanupCache(), 60000); // Check every minute
  }

  /**
   * Generate voice audio from text using specified provider and settings
   */
  async generateVoice(params: VoiceGenerationParams): Promise<VoiceGenerationResponse> {
    try {
      const cacheKey = this.getCacheKey(params);
      
      // Check cache first
      if (this.config.cachingEnabled) {
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
          this.logger.info('Voice generation cache hit', { cacheKey });
          return cached;
        }
      }

      // Check if generation is already in progress
      const existingGeneration = this.activeGenerations.get(cacheKey);
      if (existingGeneration) {
        this.logger.info('Reusing active voice generation', { cacheKey });
        return await existingGeneration;
      }

      // Check rate limits
      await this.checkRateLimit(params.provider);

      // Start new generation
      const generationPromise = this.executeVoiceGeneration(params);
      this.activeGenerations.set(cacheKey, generationPromise);

      try {
        const result = await generationPromise;
        
        // Cache the result
        if (this.config.cachingEnabled) {
          this.cacheResult(cacheKey, result);
        }

        this.emit('voiceGenerated', {
          provider: params.provider,
          voice: params.voice,
          duration: result.metadata.duration,
          cost: result.metadata.cost
        });

        return result;
      } finally {
        this.activeGenerations.delete(cacheKey);
      }
    } catch (error) {
      this.logger.error('Voice generation failed', { 
        error: error.message, 
        provider: params.provider,
        voice: params.voice 
      });
      
      this.emit('voiceGenerationFailed', {
        provider: params.provider,
        voice: params.voice,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Generate personalized voice message using template and prospect data
   */
  async generatePersonalizedVoice(
    template: VoiceTemplate,
    variables: Record<string, any>,
    prospectData: any
  ): Promise<VoiceGenerationResponse> {
    try {
      // Process template with variables and personalization
      const personalizedScript = this.personalizeScript(template.script, variables, prospectData);
      
      // Apply voice settings from template
      const params: VoiceGenerationParams = {
        text: personalizedScript,
        provider: template.voiceSettings.provider as any,
        voice: template.voiceSettings.voice,
        outputFormat: this.config.outputFormat,
        quality: this.config.quality
      };

      // Apply provider-specific settings
      if (params.provider === 'elevenlabs' && this.config.providers.elevenlabs.enabled) {
        const elevenlabsConfig = this.config.providers.elevenlabs;
        params.stability = elevenlabsConfig.stability;
        params.similarityBoost = elevenlabsConfig.similarityBoost;
        params.style = elevenlabsConfig.style;
      } else if (params.provider === 'openai' && this.config.providers.openai.enabled) {
        const openaiConfig = this.config.providers.openai;
        params.speed = openaiConfig.speed;
      }

      return await this.generateVoice(params);
    } catch (error) {
      this.logger.error('Personalized voice generation failed', {
        error: error.message,
        templateId: template.id,
        prospectId: prospectData.id
      });
      throw error;
    }
  }

  /**
   * Execute voice generation with specific provider
   */
  private async executeVoiceGeneration(params: VoiceGenerationParams): Promise<VoiceGenerationResponse> {
    switch (params.provider) {
      case 'elevenlabs':
        return await this.generateWithElevenLabs(params);
      case 'openai':
        return await this.generateWithOpenAI(params);
      case 'azure':
        return await this.generateWithAzure(params);
      default:
        throw new Error(`Unsupported voice provider: ${params.provider}`);
    }
  }

  /**
   * Generate voice using ElevenLabs API
   */
  private async generateWithElevenLabs(params: VoiceGenerationParams): Promise<VoiceGenerationResponse> {
    if (!this.config.providers.elevenlabs.enabled) {
      throw new Error('ElevenLabs provider is not enabled');
    }

    const config = this.config.providers.elevenlabs;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': config.apiKey
      },
      body: JSON.stringify({
        text: params.text,
        model_id: config.model,
        voice_settings: {
          stability: params.stability || config.stability,
          similarity_boost: params.similarityBoost || config.similarityBoost,
          style: params.style || config.style,
          use_speaker_boost: config.useSpeakerBoost
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    
    return {
      audioBuffer,
      metadata: {
        duration: this.estimateAudioDuration(params.text, 'elevenlabs'),
        format: params.outputFormat || 'mp3',
        provider: 'elevenlabs',
        voice: params.voice,
        cost: this.calculateCost('elevenlabs', params.text.length),
        quality: params.quality || 'standard'
      }
    };
  }

  /**
   * Generate voice using OpenAI TTS API
   */
  private async generateWithOpenAI(params: VoiceGenerationParams): Promise<VoiceGenerationResponse> {
    if (!this.config.providers.openai.enabled) {
      throw new Error('OpenAI provider is not enabled');
    }

    const config = this.config.providers.openai;
    const url = 'https://api.openai.com/v1/audio/speech';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        input: params.text,
        voice: config.voice,
        speed: params.speed || config.speed,
        response_format: params.outputFormat || 'mp3'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI TTS API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    return {
      audioBuffer,
      metadata: {
        duration: this.estimateAudioDuration(params.text, 'openai'),
        format: params.outputFormat || 'mp3',
        provider: 'openai',
        voice: params.voice,
        cost: this.calculateCost('openai', params.text.length),
        quality: params.quality || 'standard'
      }
    };
  }

  /**
   * Generate voice using Azure Speech Services
   */
  private async generateWithAzure(params: VoiceGenerationParams): Promise<VoiceGenerationResponse> {
    if (!this.config.providers.azure.enabled) {
      throw new Error('Azure Speech provider is not enabled');
    }

    const config = this.config.providers.azure;
    const url = `https://${config.region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${config.language}">
        <voice name="${config.voice}">
          <prosody pitch="${config.pitch}" rate="${config.rate}" volume="${config.volume}">
            ${params.text}
          </prosody>
        </voice>
      </speak>
    `;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
      },
      body: ssml
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure Speech API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    return {
      audioBuffer,
      metadata: {
        duration: this.estimateAudioDuration(params.text, 'azure'),
        format: params.outputFormat || 'mp3',
        provider: 'azure',
        voice: params.voice,
        cost: this.calculateCost('azure', params.text.length),
        quality: params.quality || 'standard'
      }
    };
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
   * Generate cache key for voice generation request
   */
  private getCacheKey(params: VoiceGenerationParams): string {
    const keyData = {
      text: params.text,
      provider: params.provider,
      voice: params.voice,
      speed: params.speed,
      stability: params.stability,
      similarityBoost: params.similarityBoost,
      style: params.style,
      outputFormat: params.outputFormat,
      quality: params.quality
    };
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  /**
   * Get cached voice generation result
   */
  private getCachedResult(cacheKey: string): VoiceGenerationResponse | null {
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > new Date()) {
      return {
        audioBuffer: cached.buffer,
        metadata: cached.metadata
      };
    }
    return null;
  }

  /**
   * Cache voice generation result
   */
  private cacheResult(cacheKey: string, result: VoiceGenerationResponse): void {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.config.cacheExpiryHours);

    this.cache.set(cacheKey, {
      buffer: result.audioBuffer,
      metadata: result.metadata,
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
      currentLimits.resetTime = new Date(now.getTime() + 60000); // 1 minute window
    }

    // Check limits based on provider (simplified - should be configurable)
    const maxRequestsPerMinute = provider === 'elevenlabs' ? 20 : provider === 'openai' ? 50 : 30;
    
    if (currentLimits.requests >= maxRequestsPerMinute) {
      const waitTime = currentLimits.resetTime.getTime() - now.getTime();
      throw new Error(`Rate limit exceeded for ${provider}. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    currentLimits.requests++;
    this.rateLimits.set(rateLimitKey, currentLimits);
  }

  /**
   * Estimate audio duration based on text length and provider
   */
  private estimateAudioDuration(text: string, provider: string): number {
    // Rough estimation: average speaking rate is ~150 words per minute
    const wordCount = text.split(/\s+/).length;
    const baseRate = 150; // words per minute
    
    // Adjust rate based on provider characteristics
    const rateMultiplier = provider === 'elevenlabs' ? 1.1 : provider === 'azure' ? 0.9 : 1.0;
    const adjustedRate = baseRate * rateMultiplier;
    
    return Math.ceil((wordCount / adjustedRate) * 60); // duration in seconds
  }

  /**
   * Calculate cost based on provider and text length
   */
  private calculateCost(provider: string, textLength: number): number {
    // Simplified cost calculation - should be based on actual provider pricing
    const costPerCharacter = {
      'elevenlabs': 0.0001,
      'openai': 0.000015,
      'azure': 0.00001
    };

    return textLength * (costPerCharacter[provider] || 0.00001);
  }

  /**
   * Get voice engine health status
   */
  getHealthStatus(): any {
    return {
      status: 'healthy',
      providers: {
        elevenlabs: this.config.providers.elevenlabs.enabled,
        openai: this.config.providers.openai.enabled,
        azure: this.config.providers.azure.enabled
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
    this.logger.info('Shutting down Voice Engine...');
    
    // Wait for active generations to complete (with timeout)
    const activeGenerations = Array.from(this.activeGenerations.values());
    if (activeGenerations.length > 0) {
      this.logger.info(`Waiting for ${activeGenerations.length} active voice generations to complete...`);
      
      const timeout = new Promise(resolve => setTimeout(resolve, 30000)); // 30 second timeout
      const completions = Promise.all(activeGenerations);
      
      await Promise.race([completions, timeout]);
    }

    // Clear cache and cleanup
    this.cache.clear();
    this.activeGenerations.clear();
    this.rateLimits.clear();
    
    this.logger.info('Voice Engine shutdown complete');
  }
}