/**
 * IQ24.ai AI Core Configuration Management
 * Centralized configuration for all AI agents, orchestration, and services
 */

export interface DatabaseConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  supabaseAnonKey: string;
}

export interface AIServiceConfig {
  openai: {
    apiKey: string;
    models: {
      completion: string;
      embedding: string;
      reasoning: string;
    };
    maxTokens: number;
    temperature: number;
  };
  anthropic: {
    apiKey: string;
    models: {
      completion: string;
      reasoning: string;
    };
    maxTokens: number;
  };
  mistral: {
    apiKey: string;
    models: {
      completion: string;
      embedding: string;
    };
  };
}

export interface DataSourceConfig {
  apollo: {
    apiKey: string;
    baseUrl: string;
    rateLimit: {
      requestsPerMinute: number;
      burstLimit: number;
    };
  };
  hunter: {
    apiKey: string;
    baseUrl: string;
    rateLimit: {
      requestsPerMinute: number;
      burstLimit: number;
    };
  };
  linkedin: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  clearbit: {
    apiKey: string;
    baseUrl: string;
  };
}

export interface WorkflowConfig {
  temporal: {
    address: string;
    namespace: string;
    taskQueue: string;
    clientOptions: {
      connection: {
        tls: boolean;
      };
    };
  };
  trigger: {
    id: string;
    apiKey: string;
    apiUrl: string;
  };
}

export interface AgentConfig {
  pda: {
    maxConcurrentDiscoveries: number;
    discoveryTimeoutMs: number;
    retryAttempts: number;
    dataSources: string[];
  };
  vea: {
    maxConcurrentValidations: number;
    validationTimeoutMs: number;
    enrichmentSources: string[];
    deduplicationThreshold: number;
  };
  opa: {
    maxConcurrentPersonalizations: number;
    personalizationTimeoutMs: number;
    llmModels: string[];
    mseoEnabled: boolean;
  };
  cea: {
    maxConcurrentExecutions: number;
    executionTimeoutMs: number;
    retryIntervalMs: number;
    maxRetryAttempts: number;
  };
  afla: {
    analyticsIntervalMs: number;
    batchSize: number;
    retentionDays: number;
  };
  cgn: {
    complianceRules: string[];
    auditRetentionDays: number;
    alertThresholds: {
      riskScore: number;
      violationCount: number;
    };
  };
  crm: {
    learningIntervalMs: number;
    knowledgeTransferThreshold: number;
    modelUpdateFrequency: string;
  };
}

export interface ComplianceConfig {
  gdpr: {
    enabled: boolean;
    consentRequired: boolean;
    dataRetentionDays: number;
  };
  ccpa: {
    enabled: boolean;
    optOutRequired: boolean;
  };
  canSpam: {
    enabled: boolean;
    unsubscribeRequired: boolean;
    identificationRequired: boolean;
  };
}

export interface MonitoringConfig {
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    structured: boolean;
    correlationId: boolean;
  };
  metrics: {
    enabled: boolean;
    interval: number;
    retention: number;
  };
  alerts: {
    email: string[];
    slack: {
      webhook: string;
      channel: string;
    };
    thresholds: {
      errorRate: number;
      responseTime: number;
      queueLength: number;
    };
  };
}

export interface AIConfig {
  database: DatabaseConfig;
  aiServices: AIServiceConfig;
  dataSources: DataSourceConfig;
  workflow: WorkflowConfig;
  agents: AgentConfig;
  compliance: ComplianceConfig;
  monitoring: MonitoringConfig;
  environment: 'development' | 'staging' | 'production';
}

/**
 * Load configuration from environment variables and defaults
 */
export function loadConfig(): AIConfig {
  return {
    database: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    },
    aiServices: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        models: {
          completion: process.env.OPENAI_COMPLETION_MODEL || 'gpt-4o',
          embedding: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-large',
          reasoning: process.env.OPENAI_REASONING_MODEL || 'o1-preview',
        },
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        models: {
          completion: process.env.ANTHROPIC_COMPLETION_MODEL || 'claude-3-5-sonnet-20241022',
          reasoning: process.env.ANTHROPIC_REASONING_MODEL || 'claude-3-5-sonnet-20241022',
        },
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000'),
      },
      mistral: {
        apiKey: process.env.MISTRAL_API_KEY || '',
        models: {
          completion: process.env.MISTRAL_COMPLETION_MODEL || 'mistral-large-latest',
          embedding: process.env.MISTRAL_EMBEDDING_MODEL || 'mistral-embed',
        },
      },
    },
    dataSources: {
      apollo: {
        apiKey: process.env.APOLLO_API_KEY || '',
        baseUrl: process.env.APOLLO_BASE_URL || 'https://api.apollo.io/v1',
        rateLimit: {
          requestsPerMinute: parseInt(process.env.APOLLO_RATE_LIMIT || '60'),
          burstLimit: parseInt(process.env.APOLLO_BURST_LIMIT || '10'),
        },
      },
      hunter: {
        apiKey: process.env.HUNTER_API_KEY || '',
        baseUrl: process.env.HUNTER_BASE_URL || 'https://api.hunter.io/v2',
        rateLimit: {
          requestsPerMinute: parseInt(process.env.HUNTER_RATE_LIMIT || '100'),
          burstLimit: parseInt(process.env.HUNTER_BURST_LIMIT || '20'),
        },
      },
      linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        redirectUri: process.env.LINKEDIN_REDIRECT_URI || '',
      },
      clearbit: {
        apiKey: process.env.CLEARBIT_API_KEY || '',
        baseUrl: process.env.CLEARBIT_BASE_URL || 'https://person.clearbit.com/v2',
      },
    },
    workflow: {
      temporal: {
        address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
        namespace: process.env.TEMPORAL_NAMESPACE || 'default',
        taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'iq24-ai-workflow',
        clientOptions: {
          connection: {
            tls: process.env.TEMPORAL_TLS === 'true',
          },
        },
      },
      trigger: {
        id: process.env.TRIGGER_PROJECT_ID || '',
        apiKey: process.env.TRIGGER_SECRET_KEY || '',
        apiUrl: process.env.TRIGGER_API_URL || 'https://api.trigger.dev',
      },
    },
    agents: {
      pda: {
        maxConcurrentDiscoveries: parseInt(process.env.PDA_MAX_CONCURRENT || '5'),
        discoveryTimeoutMs: parseInt(process.env.PDA_TIMEOUT_MS || '300000'),
        retryAttempts: parseInt(process.env.PDA_RETRY_ATTEMPTS || '3'),
        dataSources: (process.env.PDA_DATA_SOURCES || 'apollo,hunter,linkedin').split(','),
      },
      vea: {
        maxConcurrentValidations: parseInt(process.env.VEA_MAX_CONCURRENT || '10'),
        validationTimeoutMs: parseInt(process.env.VEA_TIMEOUT_MS || '60000'),
        enrichmentSources: (process.env.VEA_ENRICHMENT_SOURCES || 'apollo,clearbit,hunter').split(','),
        deduplicationThreshold: parseFloat(process.env.VEA_DEDUP_THRESHOLD || '0.85'),
      },
      opa: {
        maxConcurrentPersonalizations: parseInt(process.env.OPA_MAX_CONCURRENT || '8'),
        personalizationTimeoutMs: parseInt(process.env.OPA_TIMEOUT_MS || '120000'),
        llmModels: (process.env.OPA_LLM_MODELS || 'openai,anthropic').split(','),
        mseoEnabled: process.env.OPA_MSEO_ENABLED === 'true',
      },
      cea: {
        maxConcurrentExecutions: parseInt(process.env.CEA_MAX_CONCURRENT || '20'),
        executionTimeoutMs: parseInt(process.env.CEA_TIMEOUT_MS || '600000'),
        retryIntervalMs: parseInt(process.env.CEA_RETRY_INTERVAL_MS || '5000'),
        maxRetryAttempts: parseInt(process.env.CEA_MAX_RETRIES || '5'),
      },
      afla: {
        analyticsIntervalMs: parseInt(process.env.AFLA_INTERVAL_MS || '300000'),
        batchSize: parseInt(process.env.AFLA_BATCH_SIZE || '1000'),
        retentionDays: parseInt(process.env.AFLA_RETENTION_DAYS || '90'),
      },
      cgn: {
        complianceRules: (process.env.CGN_COMPLIANCE_RULES || 'gdpr,ccpa,canspam').split(','),
        auditRetentionDays: parseInt(process.env.CGN_AUDIT_RETENTION || '2555'), // 7 years
        alertThresholds: {
          riskScore: parseFloat(process.env.CGN_RISK_THRESHOLD || '0.7'),
          violationCount: parseInt(process.env.CGN_VIOLATION_THRESHOLD || '5'),
        },
      },
      crm: {
        learningIntervalMs: parseInt(process.env.CRM_LEARNING_INTERVAL_MS || '86400000'), // 24 hours
        knowledgeTransferThreshold: parseFloat(process.env.CRM_KNOWLEDGE_THRESHOLD || '0.8'),
        modelUpdateFrequency: process.env.CRM_MODEL_UPDATE_FREQ || 'weekly',
      },
    },
    compliance: {
      gdpr: {
        enabled: process.env.GDPR_ENABLED === 'true',
        consentRequired: process.env.GDPR_CONSENT_REQUIRED !== 'false',
        dataRetentionDays: parseInt(process.env.GDPR_RETENTION_DAYS || '1095'), // 3 years
      },
      ccpa: {
        enabled: process.env.CCPA_ENABLED === 'true',
        optOutRequired: process.env.CCPA_OPT_OUT_REQUIRED !== 'false',
      },
      canSpam: {
        enabled: process.env.CAN_SPAM_ENABLED !== 'false',
        unsubscribeRequired: process.env.CAN_SPAM_UNSUBSCRIBE_REQUIRED !== 'false',
        identificationRequired: process.env.CAN_SPAM_IDENTIFICATION_REQUIRED !== 'false',
      },
    },
    monitoring: {
      logging: {
        level: (process.env.LOG_LEVEL as any) || 'info',
        structured: process.env.LOG_STRUCTURED !== 'false',
        correlationId: process.env.LOG_CORRELATION_ID !== 'false',
      },
      metrics: {
        enabled: process.env.METRICS_ENABLED !== 'false',
        interval: parseInt(process.env.METRICS_INTERVAL || '60000'), // 1 minute
        retention: parseInt(process.env.METRICS_RETENTION || '86400000'), // 24 hours
      },
      alerts: {
        email: (process.env.ALERT_EMAILS || '').split(',').filter(Boolean),
        slack: {
          webhook: process.env.SLACK_WEBHOOK_URL || '',
          channel: process.env.SLACK_CHANNEL || '#iq24-alerts',
        },
        thresholds: {
          errorRate: parseFloat(process.env.ALERT_ERROR_RATE_THRESHOLD || '0.05'), // 5%
          responseTime: parseInt(process.env.ALERT_RESPONSE_TIME_THRESHOLD || '5000'), // 5 seconds
          queueLength: parseInt(process.env.ALERT_QUEUE_LENGTH_THRESHOLD || '100'),
        },
      },
    },
    environment: (process.env.NODE_ENV as any) || 'development',
  };
}

/**
 * Validate configuration and throw errors for missing required values
 */
export function validateConfig(config: AIConfig): void {
  const errors: string[] = [];

  // Database validation
  if (!config.database.supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  if (!config.database.supabaseServiceKey && config.environment !== 'development') {
    errors.push('SUPABASE_SERVICE_KEY is required for non-development environments');
  }

  // AI Services validation
  if (!config.aiServices.openai.apiKey && config.environment !== 'development') {
    errors.push('OPENAI_API_KEY is required for non-development environments');
  }

  // Data Sources validation (for production)
  if (config.environment === 'production') {
    if (!config.dataSources.apollo.apiKey) {
      errors.push('APOLLO_API_KEY is required for production');
    }
    if (!config.dataSources.hunter.apiKey) {
      errors.push('HUNTER_API_KEY is required for production');
    }
  }

  // Workflow validation
  if (!config.workflow.temporal.address) {
    errors.push('TEMPORAL_ADDRESS is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Export singleton instance
let configInstance: AIConfig | null = null;

export function getConfig(): AIConfig {
  if (!configInstance) {
    configInstance = loadConfig();
    validateConfig(configInstance);
  }
  return configInstance;
}

// Reset config for testing
export function resetConfig(): void {
  configInstance = null;
}