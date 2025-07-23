// IQ24.ai Prospect Discovery Agent (PDA) - Advanced Lead Discovery & Intelligence

import { Browser, Page, launch } from "puppeteer";
import { chromium } from "playwright";
import * as cheerio from "cheerio";
import axios from "axios";
import { z } from "zod";
import neo4j from "neo4j-driver";
import {
  BaseAgent,
  type AgentConfig,
  type AgentContext,
  type Task,
  type AgentType,
} from "../base/agent";

type Prospect = {
  id: string;
  companyName: string;
  industry: string;
  size: string;
  location: string;
  contacts: Contact[];
  score: number;
  metadata: Record<string, any>;
};

type Contact = {
  id: string;
  name: string;
  title: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  verified: boolean;
};

// ============================================================================
// PROSPECT DISCOVERY AGENT CONFIGURATION
// ============================================================================

const PDAConfigSchema = z.object({
  dataSourceApis: z.object({
    apollo: z
      .object({
        apiKey: z.string(),
        baseUrl: z.string().default("https://api.apollo.io/v1"),
      })
      .optional(),
    hunter: z
      .object({
        apiKey: z.string(),
        baseUrl: z.string().default("https://api.hunter.io/v2"),
      })
      .optional(),
    linkedin: z
      .object({
        sessionCookies: z.string(),
        rateLimitDelay: z.number().default(2000),
      })
      .optional(),
  }),
  scraping: z.object({
    maxConcurrentPages: z.number().default(5),
    requestDelay: z.number().default(1000),
    userAgent: z
      .string()
      .default("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"),
    timeout: z.number().default(30000),
  }),
  graphDb: z.object({
    uri: z.string(),
    username: z.string(),
    password: z.string(),
  }),
  aiModels: z.object({
    leadScoringModel: z.string().default("gpt-4"),
    intentAnalysisModel: z.string().default("gpt-4"),
    entityExtractionModel: z.string().default("gpt-3.5-turbo"),
  }),
});

type PDAConfig = z.infer<typeof PDAConfigSchema>;

// ============================================================================
// DATA SOURCE INTERFACES
// ============================================================================

interface CompanySearchCriteria {
  industries: string[];
  companySizes: string[];
  technologies: string[];
  locations: string[];
  keywords: string[];
  fundingStage?: string[];
  revenueRange?: [number, number];
}

interface PersonSearchCriteria {
  roles: string[];
  seniority: string[];
  departments: string[];
  excludeRoles?: string[];
}

interface DiscoveryResult {
  prospects: Prospect[];
  companies: any[];
  relationships: Array<{
    from: string;
    to: string;
    type: string;
    strength: number;
  }>;
  metadata: {
    totalFound: number;
    processingTime: number;
    dataSources: string[];
    qualityScore: number;
  };
}

// ============================================================================
// PROSPECT DISCOVERY AGENT
// ============================================================================

export class ProspectDiscoveryAgent extends BaseAgent {
  private pdaConfig: PDAConfig;
  private browser?: Browser;
  private graphDriver?: neo4j.Driver;
  private rateLimiters: Map<string, number> = new Map();

  constructor(config: AgentConfig, dependencies: any, pdaConfig: PDAConfig) {
    super(config, dependencies);
    this.pdaConfig = pdaConfig;
    this.initializeConnections();
  }

  // ============================================================================
  // CORE AGENT METHODS
  // ============================================================================

  async execute(task: Task, context: AgentContext): Promise<DiscoveryResult> {
    const startTime = Date.now();

    try {
      switch (task.type) {
        case "discover_prospects":
          return await this.discoverProspects(task.payload, context);
        case "enrich_company_data":
          return await this.enrichCompanyData(task.payload, context);
        case "analyze_relationships":
          return await this.analyzeRelationships(task.payload, context);
        case "score_leads":
          return await this.scoreLeads(task.payload, context);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      this.dependencies.logger.error(
        `PDA execution failed for task ${task.id}`,
        {
          error: error instanceof Error ? error.message : error,
          taskType: task.type,
          correlationId: context.correlationId,
        },
      );
      throw error;
    }
  }

  validatePayload(payload: any): boolean {
    const schema = z.object({
      icp: z.object({
        industries: z.array(z.string()),
        companySizes: z.array(z.string()),
        roles: z.array(z.string()),
      }),
      targetCount: z.number().min(1).max(10000),
      filters: z.record(z.any()).optional(),
    });

    try {
      schema.parse(payload);
      return true;
    } catch {
      return false;
    }
  }

  async getHealthStatus() {
    const checks = await Promise.allSettled([
      this.checkApiConnections(),
      this.checkBrowserHealth(),
      this.checkGraphDbConnection(),
    ]);

    const healthyChecks = checks.filter(
      (check) => check.status === "fulfilled",
    ).length;
    const totalChecks = checks.length;

    return {
      status:
        healthyChecks === totalChecks
          ? ("healthy" as const)
          : healthyChecks > totalChecks / 2
            ? ("degraded" as const)
            : ("unhealthy" as const),
      details: {
        apiConnections: checks[0].status === "fulfilled",
        browserHealth: checks[1].status === "fulfilled",
        graphDbConnection: checks[2].status === "fulfilled",
        healthScore: healthyChecks / totalChecks,
      },
    };
  }

  // ============================================================================
  // PROSPECT DISCOVERY METHODS
  // ============================================================================

  /**
   * Main prospect discovery method - orchestrates multiple data sources
   */
  private async discoverProspects(
    payload: any,
    context: AgentContext,
  ): Promise<DiscoveryResult> {
    const { icp, targetCount, filters = {} } = payload;
    const startTime = Date.now();

    this.dependencies.logger.info(
      `Starting prospect discovery for ${targetCount} prospects`,
      {
        icp,
        correlationId: context.correlationId,
      },
    );

    // 1. Multi-source company discovery
    const companies = await this.discoverCompanies({
      industries: icp.industries,
      companySizes: icp.companySizes,
      technologies: icp.technologies || [],
      locations: filters.locations || [],
      keywords: filters.keywords || [],
    });

    // 2. People discovery within companies
    const prospects = await this.discoverPeopleInCompanies(companies, {
      roles: icp.roles,
      seniority: filters.seniority || [],
      departments: filters.departments || [],
    });

    // 3. AI-powered lead scoring
    const scoredProspects = await this.scoreProspectsWithAI(prospects, icp);

    // 4. Relationship graph analysis
    const relationships =
      await this.analyzeProspectRelationships(scoredProspects);

    // 5. Final filtering and ranking
    const finalProspects = this.rankAndFilterProspects(
      scoredProspects,
      targetCount,
    );

    const result: DiscoveryResult = {
      prospects: finalProspects,
      companies,
      relationships,
      metadata: {
        totalFound: prospects.length,
        processingTime: Date.now() - startTime,
        dataSources: this.getActiveDatasources(),
        qualityScore: this.calculateQualityScore(finalProspects),
      },
    };

    // Store results in graph database for future relationship analysis
    await this.storeInGraphDatabase(result);

    return result;
  }

  /**
   * Discover companies using multiple data sources
   */
  private async discoverCompanies(
    criteria: CompanySearchCriteria,
  ): Promise<any[]> {
    const companies: any[] = [];
    const sources = [];

    // Apollo.io integration
    if (this.pdaConfig.dataSourceApis.apollo) {
      try {
        const apolloCompanies = await this.searchApollo(criteria);
        companies.push(...apolloCompanies);
        sources.push("apollo");
      } catch (error) {
        this.dependencies.logger.warn("Apollo search failed", { error });
      }
    }

    // Web scraping for additional sources
    try {
      const scrapedCompanies = await this.scrapeCompanyDirectories(criteria);
      companies.push(...scrapedCompanies);
      sources.push("web_scraping");
    } catch (error) {
      this.dependencies.logger.warn("Web scraping failed", { error });
    }

    // Crunchbase API (if available)
    try {
      const crunchbaseCompanies = await this.searchCrunchbase(criteria);
      companies.push(...crunchbaseCompanies);
      sources.push("crunchbase");
    } catch (error) {
      this.dependencies.logger.warn("Crunchbase search failed", { error });
    }

    // Deduplicate companies
    const uniqueCompanies = this.deduplicateCompanies(companies);

    this.dependencies.logger.info(
      `Discovered ${uniqueCompanies.length} companies from sources: ${sources.join(", ")}`,
    );

    return uniqueCompanies;
  }

  /**
   * Apollo.io API integration
   */
  private async searchApollo(criteria: CompanySearchCriteria): Promise<any[]> {
    if (!this.pdaConfig.dataSourceApis.apollo) {
      return [];
    }

    await this.respectRateLimit("apollo");

    const searchParams = {
      person_titles: criteria.industries, // Approximate mapping
      organization_num_employees_ranges: this.mapCompanySizesToApollo(
        criteria.companySizes,
      ),
      technologies: criteria.technologies,
      per_page: 100,
    };

    try {
      const response = await axios.post(
        `${this.pdaConfig.dataSourceApis.apollo.baseUrl}/mixed_companies/search`,
        searchParams,
        {
          headers: {
            "X-Api-Key": this.pdaConfig.dataSourceApis.apollo.apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data.organizations || [];
    } catch (error) {
      this.dependencies.logger.error("Apollo API error", { error });
      return [];
    }
  }

  /**
   * Hunter.io API integration
   */
  private async searchHunter(domain: string): Promise<any> {
    if (!this.pdaConfig.dataSourceApis.hunter) {
      return null;
    }

    await this.respectRateLimit("hunter");

    try {
      const response = await axios.get(
        `${this.pdaConfig.dataSourceApis.hunter.baseUrl}/domain-search`,
        {
          params: {
            domain,
            api_key: this.pdaConfig.dataSourceApis.hunter.apiKey,
            limit: 100,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      this.dependencies.logger.error("Hunter API error", { error, domain });
      return null;
    }
  }

  /**
   * Advanced web scraping with ethical practices
   */
  private async scrapeCompanyDirectories(
    criteria: CompanySearchCriteria,
  ): Promise<any[]> {
    if (!this.browser) {
      await this.initializeBrowser();
    }

    const companies: any[] = [];
    const targetSites = [
      "https://www.crunchbase.com",
      "https://angel.co",
      "https://www.tracxn.com",
    ];

    for (const site of targetSites) {
      try {
        const siteCompanies = await this.scrapeSpecificSite(site, criteria);
        companies.push(...siteCompanies);
      } catch (error) {
        this.dependencies.logger.warn(`Scraping failed for ${site}`, { error });
      }
    }

    return companies;
  }

  /**
   * AI-powered lead scoring using LLMs
   */
  private async scoreProspectsWithAI(
    prospects: Prospect[],
    icp: any,
  ): Promise<Prospect[]> {
    const model = await this.getModel(this.pdaConfig.aiModels.leadScoringModel);
    if (!model) {
      this.dependencies.logger.warn(
        "Lead scoring model not available, using fallback scoring",
      );
      return this.fallbackLeadScoring(prospects, icp);
    }

    const scoredProspects: Prospect[] = [];

    // Process in batches to avoid API limits
    const batchSize = 10;
    for (let i = 0; i < prospects.length; i += batchSize) {
      const batch = prospects.slice(i, i + batchSize);
      const batchScores = await this.scoreProspectBatch(batch, icp, model);
      scoredProspects.push(...batchScores);
    }

    return scoredProspects;
  }

  /**
   * Score a batch of prospects using AI
   */
  private async scoreProspectBatch(
    prospects: Prospect[],
    icp: any,
    model: any,
  ): Promise<Prospect[]> {
    const prompt = this.buildLeadScoringPrompt(prospects, icp);

    try {
      // This would integrate with your LLM service
      const scores = await this.dependencies.llmService.generate({
        model: model.model,
        prompt,
        temperature: 0.1,
        maxTokens: 1000,
      });

      return this.parseLeadScores(prospects, scores);
    } catch (error) {
      this.dependencies.logger.error("AI lead scoring failed", { error });
      return prospects.map((p) => ({ ...p, leadScore: 50 })); // Default score
    }
  }

  /**
   * Analyze relationships between prospects using graph analysis
   */
  private async analyzeProspectRelationships(prospects: Prospect[]): Promise<
    Array<{
      from: string;
      to: string;
      type: string;
      strength: number;
    }>
  > {
    if (!this.graphDriver) {
      return [];
    }

    const relationships: Array<{
      from: string;
      to: string;
      type: string;
      strength: number;
    }> = [];

    // Analyze company relationships
    const companyGroups = this.groupProspectsByCompany(prospects);

    for (const [company, companyProspects] of companyGroups) {
      // Internal company relationships
      for (let i = 0; i < companyProspects.length; i++) {
        for (let j = i + 1; j < companyProspects.length; j++) {
          relationships.push({
            from: companyProspects[i].id,
            to: companyProspects[j].id,
            type: "colleague",
            strength: this.calculateRelationshipStrength(
              companyProspects[i],
              companyProspects[j],
            ),
          });
        }
      }
    }

    // LinkedIn network analysis (if available)
    if (this.pdaConfig.dataSourceApis.linkedin) {
      const linkedinRelationships =
        await this.analyzeLinkedInConnections(prospects);
      relationships.push(...linkedinRelationships);
    }

    return relationships;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async initializeConnections(): Promise<void> {
    // Initialize graph database connection
    if (this.pdaConfig.graphDb) {
      this.graphDriver = neo4j.driver(
        this.pdaConfig.graphDb.uri,
        neo4j.auth.basic(
          this.pdaConfig.graphDb.username,
          this.pdaConfig.graphDb.password,
        ),
      );
    }

    // Initialize browser for scraping
    await this.initializeBrowser();
  }

  private async initializeBrowser(): Promise<void> {
    try {
      this.browser = await launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      });
    } catch (error) {
      this.dependencies.logger.error("Failed to initialize browser", { error });
    }
  }

  private async respectRateLimit(source: string): Promise<void> {
    const lastCall = this.rateLimiters.get(source) || 0;
    const delay =
      source === "linkedin"
        ? this.pdaConfig.dataSourceApis.linkedin?.rateLimitDelay || 2000
        : 1000;

    const elapsed = Date.now() - lastCall;
    if (elapsed < delay) {
      await new Promise((resolve) => setTimeout(resolve, delay - elapsed));
    }

    this.rateLimiters.set(source, Date.now());
  }

  private deduplicateCompanies(companies: any[]): any[] {
    const seen = new Set();
    return companies.filter((company) => {
      const key = company.domain || company.name?.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private calculateQualityScore(prospects: Prospect[]): number {
    if (prospects.length === 0) return 0;

    const scores = prospects.map((p) => p.leadScore || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Factor in data completeness
    const completeness = prospects.map((p) => {
      let score = 0;
      if (p.email) score += 0.3;
      if (p.phone) score += 0.2;
      if (p.linkedinUrl) score += 0.2;
      if (p.company) score += 0.2;
      if (p.position) score += 0.1;
      return score;
    });

    const avgCompleteness =
      completeness.reduce((a, b) => a + b, 0) / completeness.length;

    return Math.round(avgScore * 0.7 + avgCompleteness * 100 * 0.3);
  }

  private getActiveDatasources(): string[] {
    const sources = [];
    if (this.pdaConfig.dataSourceApis.apollo) sources.push("apollo");
    if (this.pdaConfig.dataSourceApis.hunter) sources.push("hunter");
    if (this.pdaConfig.dataSourceApis.linkedin) sources.push("linkedin");
    sources.push("web_scraping");
    return sources;
  }

  // Additional helper methods would be implemented here...
  private async checkApiConnections(): Promise<boolean> {
    return true;
  }
  private async checkBrowserHealth(): Promise<boolean> {
    return !!this.browser;
  }
  private async checkGraphDbConnection(): Promise<boolean> {
    return !!this.graphDriver;
  }
  private mapCompanySizesToApollo(sizes: string[]): string[] {
    return sizes;
  }
  private async searchCrunchbase(
    criteria: CompanySearchCriteria,
  ): Promise<any[]> {
    return [];
  }
  private async scrapeSpecificSite(
    site: string,
    criteria: CompanySearchCriteria,
  ): Promise<any[]> {
    return [];
  }
  private async discoverPeopleInCompanies(
    companies: any[],
    criteria: PersonSearchCriteria,
  ): Promise<Prospect[]> {
    return [];
  }
  private fallbackLeadScoring(prospects: Prospect[], icp: any): Prospect[] {
    return prospects;
  }
  private buildLeadScoringPrompt(prospects: Prospect[], icp: any): string {
    return "";
  }
  private parseLeadScores(prospects: Prospect[], scores: string): Prospect[] {
    return prospects;
  }
  private groupProspectsByCompany(
    prospects: Prospect[],
  ): Map<string, Prospect[]> {
    return new Map();
  }
  private calculateRelationshipStrength(p1: Prospect, p2: Prospect): number {
    return 0.5;
  }
  private async analyzeLinkedInConnections(
    prospects: Prospect[],
  ): Promise<any[]> {
    return [];
  }
  private rankAndFilterProspects(
    prospects: Prospect[],
    targetCount: number,
  ): Prospect[] {
    return prospects.slice(0, targetCount);
  }
  private async storeInGraphDatabase(result: DiscoveryResult): Promise<void> {}
}

// ============================================================================
// FACTORY AND REGISTRATION
// ============================================================================

export function createProspectDiscoveryAgent(
  config: AgentConfig,
  dependencies: any,
  pdaConfig: PDAConfig,
): ProspectDiscoveryAgent {
  return new ProspectDiscoveryAgent(config, dependencies, pdaConfig);
}
