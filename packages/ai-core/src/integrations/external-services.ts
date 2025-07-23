import { Logger } from "@iq24/utils";

/**
 * External Services Integration Layer
 *
 * This module provides standardized interfaces for integrating with external
 * B2B data providers, AI/ML services, and marketing platforms that power
 * the IQ24.ai multi-agent system.
 */

export interface ExternalServiceConfig {
  apiKey: string;
  baseUrl?: string;
  rateLimit?: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  timeout?: number;
  retryConfig?: {
    maxRetries: number;
    backoffMs: number;
  };
}

/**
 * Apollo.io Integration
 * Advanced B2B database and sales intelligence platform
 */
export class ApolloService {
  private config: ExternalServiceConfig;
  private logger: Logger;
  private rateLimiter: RateLimiter;

  constructor(config: ExternalServiceConfig) {
    this.config = config;
    this.logger = new Logger("apollo-service");
    this.rateLimiter = new RateLimiter(config.rateLimit);
  }

  async searchPeople(criteria: {
    titles?: string[];
    companies?: string[];
    locations?: string[];
    industries?: string[];
    companySize?: [number, number];
    technologies?: string[];
    limit?: number;
  }): Promise<any[]> {
    await this.rateLimiter.acquire();

    try {
      const response = await fetch(
        `${this.config.baseUrl}/v1/mixed_people/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-Api-Key": this.config.apiKey,
          },
          body: JSON.stringify({
            ...criteria,
            per_page: criteria.limit || 25,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Apollo API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      this.logger.info("Apollo people search completed", {
        resultsCount: data.people?.length || 0,
        totalCount: data.pagination?.total_entries,
      });

      return data.people || [];
    } catch (error) {
      this.logger.error("Apollo people search failed", {
        error: error.message,
      });
      throw error;
    }
  }

  async searchCompanies(criteria: {
    industries?: string[];
    locations?: string[];
    companySize?: [number, number];
    technologies?: string[];
    fundingStage?: string[];
    revenueRange?: [number, number];
    limit?: number;
  }): Promise<any[]> {
    await this.rateLimiter.acquire();

    try {
      const response = await fetch(
        `${this.config.baseUrl}/v1/mixed_companies/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-Api-Key": this.config.apiKey,
          },
          body: JSON.stringify({
            ...criteria,
            per_page: criteria.limit || 25,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Apollo API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      this.logger.info("Apollo company search completed", {
        resultsCount: data.organizations?.length || 0,
        totalCount: data.pagination?.total_entries,
      });

      return data.organizations || [];
    } catch (error) {
      this.logger.error("Apollo company search failed", {
        error: error.message,
      });
      throw error;
    }
  }

  async enrichPerson(email: string): Promise<any> {
    await this.rateLimiter.acquire();

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/people/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "X-Api-Key": this.config.apiKey,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Person not found
        }
        throw new Error(
          `Apollo API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      this.logger.debug("Apollo person enrichment completed", {
        email,
        found: !!data.person,
      });

      return data.person;
    } catch (error) {
      this.logger.error("Apollo person enrichment failed", {
        email,
        error: error.message,
      });
      throw error;
    }
  }
}

/**
 * Hunter.io Integration
 * Email discovery and verification platform
 */
export class HunterService {
  private config: ExternalServiceConfig;
  private logger: Logger;
  private rateLimiter: RateLimiter;

  constructor(config: ExternalServiceConfig) {
    this.config = config;
    this.logger = new Logger("hunter-service");
    this.rateLimiter = new RateLimiter(config.rateLimit);
  }

  async findEmails(domain: string): Promise<any> {
    await this.rateLimiter.acquire();

    try {
      const url = new URL(`${this.config.baseUrl}/v2/domain-search`);
      url.searchParams.set("domain", domain);
      url.searchParams.set("api_key", this.config.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          `Hunter API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      this.logger.info("Hunter domain search completed", {
        domain,
        emailsFound: data.data?.emails?.length || 0,
      });

      return data.data;
    } catch (error) {
      this.logger.error("Hunter domain search failed", {
        domain,
        error: error.message,
      });
      throw error;
    }
  }

  async findEmail(
    firstName: string,
    lastName: string,
    domain: string,
  ): Promise<string | null> {
    await this.rateLimiter.acquire();

    try {
      const url = new URL(`${this.config.baseUrl}/v2/email-finder`);
      url.searchParams.set("domain", domain);
      url.searchParams.set("first_name", firstName);
      url.searchParams.set("last_name", lastName);
      url.searchParams.set("api_key", this.config.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Email not found
        }
        throw new Error(
          `Hunter API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      this.logger.debug("Hunter email finder completed", {
        name: `${firstName} ${lastName}`,
        domain,
        found: !!data.data?.email,
      });

      return data.data?.email || null;
    } catch (error) {
      this.logger.error("Hunter email finder failed", {
        name: `${firstName} ${lastName}`,
        domain,
        error: error.message,
      });
      throw error;
    }
  }

  async verifyEmail(email: string): Promise<{
    result: "deliverable" | "undeliverable" | "risky" | "unknown";
    score: number;
    regexp: boolean;
    gibberish: boolean;
    disposable: boolean;
    webmail: boolean;
    mx_records: boolean;
    smtp_server: boolean;
  }> {
    await this.rateLimiter.acquire();

    try {
      const url = new URL(`${this.config.baseUrl}/v2/email-verifier`);
      url.searchParams.set("email", email);
      url.searchParams.set("api_key", this.config.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          `Hunter API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      this.logger.debug("Hunter email verification completed", {
        email,
        result: data.data?.result,
        score: data.data?.score,
      });

      return data.data;
    } catch (error) {
      this.logger.error("Hunter email verification failed", {
        email,
        error: error.message,
      });
      throw error;
    }
  }
}

/**
 * OpenAI Integration
 * Advanced language model and AI capabilities
 */
export class OpenAIService {
  private config: ExternalServiceConfig;
  private logger: Logger;
  private rateLimiter: RateLimiter;

  constructor(config: ExternalServiceConfig) {
    this.config = config;
    this.logger = new Logger("openai-service");
    this.rateLimiter = new RateLimiter(config.rateLimit);
  }

  async generateText(
    prompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    } = {},
  ): Promise<string> {
    await this.rateLimiter.acquire();

    try {
      const messages = [];

      if (options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }

      messages.push({ role: "user", content: prompt });

      const response = await fetch(
        `${this.config.baseUrl}/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: options.model || "gpt-4o",
            messages,
            max_tokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content || "";

      this.logger.debug("OpenAI text generation completed", {
        model: options.model || "gpt-4o",
        promptLength: prompt.length,
        responseLength: generatedText.length,
      });

      return generatedText;
    } catch (error) {
      this.logger.error("OpenAI text generation failed", {
        error: error.message,
      });
      throw error;
    }
  }

  async generateImage(
    prompt: string,
    options: {
      model?: string;
      size?: "1024x1024" | "1792x1024" | "1024x1792";
      quality?: "standard" | "hd";
      style?: "vivid" | "natural";
    } = {},
  ): Promise<string> {
    await this.rateLimiter.acquire();

    try {
      const response = await fetch(
        `${this.config.baseUrl}/v1/images/generations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: options.model || "dall-e-3",
            prompt,
            size: options.size || "1024x1024",
            quality: options.quality || "standard",
            style: options.style || "vivid",
            n: 1,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const imageUrl = data.data[0]?.url;

      if (!imageUrl) {
        throw new Error("No image URL returned from OpenAI");
      }

      this.logger.debug("OpenAI image generation completed", {
        model: options.model || "dall-e-3",
        promptLength: prompt.length,
      });

      return imageUrl;
    } catch (error) {
      this.logger.error("OpenAI image generation failed", {
        error: error.message,
      });
      throw error;
    }
  }
}

/**
 * Anthropic Claude Integration
 * Advanced conversational AI and reasoning
 */
export class AnthropicService {
  private config: ExternalServiceConfig;
  private logger: Logger;
  private rateLimiter: RateLimiter;

  constructor(config: ExternalServiceConfig) {
    this.config = config;
    this.logger = new Logger("anthropic-service");
    this.rateLimiter = new RateLimiter(config.rateLimit);
  }

  async generateText(
    prompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    } = {},
  ): Promise<string> {
    await this.rateLimiter.acquire();

    try {
      const requestBody: any = {
        model: options.model || "claude-3-5-sonnet-20241022",
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        messages: [{ role: "user", content: prompt }],
      };

      if (options.systemPrompt) {
        requestBody.system = options.systemPrompt;
      }

      const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.config.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Anthropic API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const generatedText = data.content[0]?.text || "";

      this.logger.debug("Anthropic text generation completed", {
        model: options.model || "claude-3-5-sonnet-20241022",
        promptLength: prompt.length,
        responseLength: generatedText.length,
      });

      return generatedText;
    } catch (error) {
      this.logger.error("Anthropic text generation failed", {
        error: error.message,
      });
      throw error;
    }
  }
}

/**
 * Temporal.io Integration
 * Durable workflow execution platform
 */
export class TemporalService {
  private config: ExternalServiceConfig;
  private logger: Logger;

  constructor(config: ExternalServiceConfig) {
    this.config = config;
    this.logger = new Logger("temporal-service");
  }

  async startWorkflow(
    workflowType: string,
    workflowId: string,
    input: any,
  ): Promise<string> {
    try {
      // Note: In a real implementation, this would use the Temporal TypeScript SDK
      // For now, we'll simulate the workflow execution

      this.logger.info("Starting Temporal workflow", {
        workflowType,
        workflowId,
      });

      // Simulate workflow execution
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return executionId;
    } catch (error) {
      this.logger.error("Failed to start Temporal workflow", {
        workflowType,
        workflowId,
        error: error.message,
      });
      throw error;
    }
  }

  async queryWorkflow(workflowId: string, queryType: string): Promise<any> {
    try {
      this.logger.debug("Querying Temporal workflow", {
        workflowId,
        queryType,
      });

      // Simulate workflow query
      return { status: "running", result: null };
    } catch (error) {
      this.logger.error("Failed to query Temporal workflow", {
        workflowId,
        queryType,
        error: error.message,
      });
      throw error;
    }
  }
}

/**
 * Rate Limiter Utility
 * Manages API rate limits and request throttling
 */
class RateLimiter {
  private requests: number[] = [];
  private config: { requestsPerMinute: number; burstLimit: number };

  constructor(
    config: { requestsPerMinute: number; burstLimit: number } = {
      requestsPerMinute: 60,
      burstLimit: 10,
    },
  ) {
    this.config = config;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old requests
    this.requests = this.requests.filter(
      (timestamp) => timestamp > oneMinuteAgo,
    );

    // Check if we've exceeded the rate limit
    if (this.requests.length >= this.config.requestsPerMinute) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = 60000 - (now - oldestRequest) + 100; // Add small buffer

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    // Add current request
    this.requests.push(now);
  }
}

/**
 * Service Factory
 * Creates and configures external service instances
 */
export class ExternalServiceFactory {
  static createApolloService(apiKey: string): ApolloService {
    return new ApolloService({
      apiKey,
      baseUrl: "https://api.apollo.io",
      rateLimit: { requestsPerMinute: 200, burstLimit: 50 },
      timeout: 30000,
    });
  }

  static createHunterService(apiKey: string): HunterService {
    return new HunterService({
      apiKey,
      baseUrl: "https://api.hunter.io",
      rateLimit: { requestsPerMinute: 300, burstLimit: 50 },
      timeout: 15000,
    });
  }

  static createOpenAIService(apiKey: string): OpenAIService {
    return new OpenAIService({
      apiKey,
      baseUrl: "https://api.openai.com",
      rateLimit: { requestsPerMinute: 3000, burstLimit: 100 },
      timeout: 60000,
    });
  }

  static createAnthropicService(apiKey: string): AnthropicService {
    return new AnthropicService({
      apiKey,
      baseUrl: "https://api.anthropic.com",
      rateLimit: { requestsPerMinute: 1000, burstLimit: 50 },
      timeout: 60000,
    });
  }

  static createTemporalService(): TemporalService {
    return new TemporalService({
      apiKey: "", // Temporal doesn't use API keys
      baseUrl: "localhost:7233", // Default Temporal server
    });
  }
}

export {
  ApolloService,
  HunterService,
  OpenAIService,
  AnthropicService,
  TemporalService,
};
