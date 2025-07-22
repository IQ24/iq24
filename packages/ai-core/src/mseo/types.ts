/**
 * Multi-Sensory Engagement Orchestration (MSEO) Types
 * 
 * Advanced AI-powered voice, image, and video generation for hyper-personalized outreach
 */

export interface MSEOConfig {
  // Voice Generation Settings
  voice: {
    enabled: boolean;
    providers: {
      elevenlabs: {
        enabled: boolean;
        apiKey: string;
        voiceId: string;
        model: 'eleven_monolingual_v1' | 'eleven_multilingual_v2' | 'eleven_turbo_v2';
        stability: number; // 0-1
        similarityBoost: number; // 0-1
        style: number; // 0-1
        useSpeakerBoost: boolean;
      };
      openai: {
        enabled: boolean;
        apiKey: string;
        voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
        model: 'tts-1' | 'tts-1-hd';
        speed: number; // 0.25-4.0
      };
      azure: {
        enabled: boolean;
        subscriptionKey: string;
        region: string;
        voice: string;
        language: string;
        pitch: string;
        rate: string;
        volume: string;
      };
    };
    quality: 'standard' | 'high' | 'premium';
    maxDurationSeconds: number;
    outputFormat: 'mp3' | 'wav' | 'flac' | 'ogg';
    cachingEnabled: boolean;
    cacheExpiryHours: number;
  };

  // Image Generation Settings
  image: {
    enabled: boolean;
    providers: {
      openai: {
        enabled: boolean;
        apiKey: string;
        model: 'dall-e-2' | 'dall-e-3';
        size: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
        quality: 'standard' | 'hd';
        style: 'vivid' | 'natural';
      };
      stability: {
        enabled: boolean;
        apiKey: string;
        engine: 'stable-diffusion-xl-1024-v1-0' | 'stable-diffusion-v1-6' | 'stable-diffusion-xl-beta-v2-2-2';
        steps: number; // 10-150
        cfgScale: number; // 1-35
        seed: number;
        samples: number; // 1-10
      };
      midjourney: {
        enabled: boolean;
        apiKey: string;
        version: string;
        quality: number; // 0.25, 0.5, 1, 2
        stylize: number; // 0-1000
      };
    };
    quality: 'draft' | 'standard' | 'high' | 'premium';
    personalizationLevel: 'basic' | 'advanced' | 'hyper';
    cachingEnabled: boolean;
    cacheExpiryHours: number;
  };

  // Video Generation Settings
  video: {
    enabled: boolean;
    providers: {
      runwayml: {
        enabled: boolean;
        apiKey: string;
        model: 'gen2' | 'gen3';
        duration: number; // seconds 2-16
        ratio: '16:9' | '9:16' | '1:1';
        watermark: boolean;
      };
      pika: {
        enabled: boolean;
        apiKey: string;
        aspectRatio: '16:9' | '9:16' | '1:1';
        frameRate: 24 | 30;
        duration: number; // seconds 3-10
      };
      synthesia: {
        enabled: boolean;
        apiKey: string;
        avatar: string;
        voice: string;
        background: string;
        title: string;
      };
    };
    quality: 'draft' | 'standard' | 'high' | '4k';
    maxDurationSeconds: number;
    personalizationLevel: 'template' | 'custom' | 'hyper';
    cachingEnabled: boolean;
    cacheExpiryHours: number;
  };

  // Content Personalization Engine
  personalization: {
    useProspectData: boolean;
    useCompanyData: boolean;
    useIndustryData: boolean;
    useRecentNews: boolean;
    useSocialMedia: boolean;
    contextualRelevance: 'low' | 'medium' | 'high' | 'maximum';
    emotionalTone: 'professional' | 'friendly' | 'enthusiastic' | 'empathetic' | 'adaptive';
    culturalAdaptation: boolean;
    languageOptimization: boolean;
  };

  // Content Templates and Scenarios
  templates: {
    voice: VoiceTemplate[];
    image: ImageTemplate[];
    video: VideoTemplate[];
  };

  // Quality Control and Compliance
  qualityControl: {
    enabled: boolean;
    contentModeration: boolean;
    brandCompliance: boolean;
    accessibilityStandards: boolean;
    multiLanguageSupport: boolean;
    approvalWorkflow: boolean;
  };

  // Performance and Scaling
  performance: {
    concurrentGenerations: number;
    queueManagement: boolean;
    priorityLevels: string[];
    resourceAllocation: 'balanced' | 'speed' | 'quality';
    fallbackProviders: boolean;
  };

  // Analytics and Optimization
  analytics: {
    trackEngagement: boolean;
    a_bTesting: boolean;
    performanceMetrics: boolean;
    contentEffectiveness: boolean;
    costOptimization: boolean;
  };
}

export interface VoiceTemplate {
  id: string;
  name: string;
  description: string;
  script: string;
  variables: TemplateVariable[];
  voiceSettings: {
    provider: string;
    voice: string;
    tone: string;
    pace: 'slow' | 'normal' | 'fast';
    emphasis: string[];
  };
  duration: number;
  useCase: string[];
  industry: string[];
  language: string;
  approved: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  variables: TemplateVariable[];
  imageSettings: {
    provider: string;
    style: string;
    composition: string;
    colorScheme: string;
    mood: string;
    brandElements: string[];
  };
  dimensions: {
    width: number;
    height: number;
    aspectRatio: string;
  };
  useCase: string[];
  industry: string[];
  approved: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  script: string;
  visualPrompts: string[];
  variables: TemplateVariable[];
  videoSettings: {
    provider: string;
    style: string;
    duration: number;
    transitions: string[];
    music: boolean;
    subtitles: boolean;
    branding: boolean;
  };
  dimensions: {
    width: number;
    height: number;
    aspectRatio: string;
    frameRate: number;
  };
  useCase: string[];
  industry: string[];
  approved: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'url' | 'image' | 'color';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    options?: string[];
  };
  dataSource?: 'prospect' | 'company' | 'industry' | 'news' | 'social' | 'manual';
  personalizationWeight: number; // 0-1
}

export interface MSEOGenerationRequest {
  type: 'voice' | 'image' | 'video';
  templateId: string;
  prospectId: string;
  campaignId: string;
  customization: {
    variables: Record<string, any>;
    overrides?: {
      provider?: string;
      quality?: string;
      style?: string;
    };
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  deliveryFormat: string;
  metadata: {
    userId: string;
    workspaceId: string;
    requestedAt: Date;
    deadline?: Date;
    purpose: string;
    context: Record<string, any>;
  };
}

export interface MSEOGenerationResult {
  id: string;
  requestId: string;
  type: 'voice' | 'image' | 'video';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  content: {
    url?: string;
    localPath?: string;
    metadata: {
      provider: string;
      model: string;
      duration?: number;
      dimensions?: { width: number; height: number };
      fileSize: number;
      format: string;
      quality: string;
    };
  };
  analytics: {
    generationTime: number;
    cost: number;
    qualityScore?: number;
    engagementPrediction?: number;
  };
  error?: {
    code: string;
    message: string;
    details: any;
    retryable: boolean;
  };
  createdAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

export interface MSEOAnalytics {
  totalGenerations: number;
  successRate: number;
  averageGenerationTime: number;
  totalCost: number;
  qualityMetrics: {
    averageScore: number;
    distribution: Record<string, number>;
  };
  engagementMetrics: {
    openRates: Record<string, number>;
    clickRates: Record<string, number>;
    responseRates: Record<string, number>;
  };
  providerPerformance: Record<string, {
    usage: number;
    successRate: number;
    averageTime: number;
    averageCost: number;
    qualityScore: number;
  }>;
  contentTypePerformance: Record<string, {
    generations: number;
    engagementRate: number;
    costEffectiveness: number;
  }>;
  trends: {
    daily: Array<{ date: string; generations: number; cost: number }>;
    weekly: Array<{ week: string; generations: number; cost: number }>;
    monthly: Array<{ month: string; generations: number; cost: number }>;
  };
}

export interface MSEOQueue {
  id: string;
  name: string;
  priority: number;
  concurrency: number;
  requests: MSEOGenerationRequest[];
  processing: number;
  completed: number;
  failed: number;
  paused: boolean;
  settings: {
    maxRetries: number;
    timeoutSeconds: number;
    backoffStrategy: 'linear' | 'exponential';
    priorityWeighting: boolean;
  };
}

export interface MSEOProvider {
  id: string;
  name: string;
  type: 'voice' | 'image' | 'video';
  enabled: boolean;
  config: any;
  capabilities: string[];
  limitations: {
    maxFileSize?: number;
    maxDuration?: number;
    supportedFormats: string[];
    rateLimit: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
    };
  };
  pricing: {
    model: 'per_request' | 'per_second' | 'per_token' | 'subscription';
    cost: number;
    currency: string;
    freeQuota?: number;
  };
  quality: {
    averageScore: number;
    reliability: number;
    speed: number;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'limited';
  lastHealthCheck: Date;
}