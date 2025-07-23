/**
 * MSEO Template Manager
 *
 * Manages sophisticated template systems for multi-sensory content generation
 * including dynamic personalization, industry-specific customization, and
 * content optimization for voice, image, and video modalities.
 */

import type {
  MSEOTemplate,
  MSEOTemplateConfig,
  MSEOPersonalizationData,
  MSEOTemplateType,
  MSEOIndustry,
  MSEOTone,
  MSEOComplexity,
  MSEOGenerationRequest,
  MSEOTemplateVariable,
  MSEOTemplateCriteria,
  MSEOTemplateMatch,
  MSEOTemplateAnalytics,
} from "./types";

/**
 * Advanced template management system for MSEO content generation
 */
export class MSEOTemplateManager {
  private templates: Map<string, MSEOTemplate> = new Map();
  private templatesByType: Map<MSEOTemplateType, MSEOTemplate[]> = new Map();
  private templatesByIndustry: Map<MSEOIndustry, MSEOTemplate[]> = new Map();
  private templateAnalytics: Map<string, MSEOTemplateAnalytics> = new Map();
  private config: MSEOTemplateConfig;

  constructor(config: MSEOTemplateConfig) {
    this.config = config;
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default templates for common use cases
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: MSEOTemplate[] = [
      // Voice Templates
      {
        id: "voice-cold-outreach-tech",
        name: "Tech Cold Outreach Voice",
        type: "voice",
        category: "outreach",
        industry: "technology",
        tone: "professional",
        complexity: "medium",
        template: `Hi {{firstName}}, this is {{senderName}} from {{companyName}}. I noticed your company {{prospectCompany}} recently {{recentActivity}}. I'd love to share how we've helped similar {{industry}} companies like {{similarCompany}} achieve {{benefit}}. Would you have 2 minutes for a quick conversation?`,
        variables: [
          {
            name: "firstName",
            type: "string",
            required: true,
            description: "Prospect first name",
          },
          {
            name: "senderName",
            type: "string",
            required: true,
            description: "Sender full name",
          },
          {
            name: "companyName",
            type: "string",
            required: true,
            description: "Sender company name",
          },
          {
            name: "prospectCompany",
            type: "string",
            required: true,
            description: "Prospect company name",
          },
          {
            name: "recentActivity",
            type: "string",
            required: false,
            description: "Recent company activity or news",
          },
          {
            name: "industry",
            type: "string",
            required: true,
            description: "Target industry",
          },
          {
            name: "similarCompany",
            type: "string",
            required: false,
            description: "Similar successful client",
          },
          {
            name: "benefit",
            type: "string",
            required: true,
            description: "Key benefit or result achieved",
          },
        ],
        personalizationRules: [
          {
            condition: 'if industry == "fintech"',
            action:
              'replace "achieve" with "secure compliance while achieving"',
          },
          {
            condition: "if companySize > 1000",
            action: "add enterprise-focused language",
          },
        ],
        qualityScore: 0.85,
        usageCount: 0,
        conversionRate: 0.12,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["cold-outreach", "voice", "b2b", "technology"],
        isActive: true,
        voiceSettings: {
          speed: 1.0,
          pitch: 0.0,
          emphasis: ["benefit", "similarCompany"],
          pausesAfter: ["Hi {{firstName}}", "from {{companyName}}"],
          tone: "conversational",
        },
      },

      // Image Templates
      {
        id: "image-linkedin-connection-generic",
        name: "LinkedIn Connection Request Visual",
        type: "image",
        category: "social",
        industry: "generic",
        tone: "friendly",
        complexity: "simple",
        template: `Create a professional LinkedIn connection request image featuring: "{{firstName}}, I'd love to connect and share insights about {{industry}} trends. Looking forward to growing our network together!" Include professional networking imagery with {{companyLogo}} if available.`,
        variables: [
          {
            name: "firstName",
            type: "string",
            required: true,
            description: "Prospect first name",
          },
          {
            name: "industry",
            type: "string",
            required: true,
            description: "Target industry",
          },
          {
            name: "companyLogo",
            type: "url",
            required: false,
            description: "Company logo URL",
          },
        ],
        personalizationRules: [
          {
            condition: 'if industry == "healthcare"',
            action: "use medical/healthcare themed imagery",
          },
          {
            condition: 'if prospectTitle contains "CEO"',
            action: "use executive-level professional imagery",
          },
        ],
        qualityScore: 0.78,
        usageCount: 0,
        conversionRate: 0.08,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["linkedin", "connection", "networking", "social"],
        isActive: true,
        imageSettings: {
          dimensions: { width: 1200, height: 630 },
          style: "professional",
          colorScheme: "corporate",
          includeText: true,
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f8f9fa",
        },
      },

      // Video Templates
      {
        id: "video-product-demo-saas",
        name: "SaaS Product Demo Video",
        type: "video",
        category: "demo",
        industry: "saas",
        tone: "enthusiastic",
        complexity: "high",
        template: `Create a personalized product demo video: "Hi {{firstName}}, I wanted to show you exactly how {{productName}} can solve {{painPoint}} for {{prospectCompany}}. Let me walk you through a quick demo..." followed by screen recording of key features relevant to {{industry}} with voice-over explaining benefits.`,
        variables: [
          {
            name: "firstName",
            type: "string",
            required: true,
            description: "Prospect first name",
          },
          {
            name: "productName",
            type: "string",
            required: true,
            description: "Product or service name",
          },
          {
            name: "painPoint",
            type: "string",
            required: true,
            description: "Specific pain point to address",
          },
          {
            name: "prospectCompany",
            type: "string",
            required: true,
            description: "Prospect company name",
          },
          {
            name: "industry",
            type: "string",
            required: true,
            description: "Target industry",
          },
        ],
        personalizationRules: [
          {
            condition: 'if industry == "ecommerce"',
            action: "focus on conversion and sales features",
          },
          {
            condition: "if companySize < 50",
            action: "emphasize ease of use and quick setup",
          },
        ],
        qualityScore: 0.92,
        usageCount: 0,
        conversionRate: 0.18,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["demo", "video", "saas", "product"],
        isActive: true,
        videoSettings: {
          duration: 90,
          format: "mp4",
          resolution: "1920x1080",
          includeSubtitles: true,
          backgroundMusic: "professional",
          transitions: "smooth",
          callToAction: "Schedule a call to see more",
        },
      },
    ];

    // Initialize template collections
    this.templatesByType.set("voice", []);
    this.templatesByType.set("image", []);
    this.templatesByType.set("video", []);

    Object.values(MSEOIndustry).forEach((industry) => {
      this.templatesByIndustry.set(industry, []);
    });

    // Add default templates
    defaultTemplates.forEach((template) => {
      this.addTemplate(template);
    });
  }

  /**
   * Add a new template to the system
   */
  addTemplate(template: MSEOTemplate): void {
    this.templates.set(template.id, template);

    // Index by type
    const typeTemplates = this.templatesByType.get(template.type) || [];
    typeTemplates.push(template);
    this.templatesByType.set(template.type, typeTemplates);

    // Index by industry
    const industryTemplates =
      this.templatesByIndustry.get(template.industry) || [];
    industryTemplates.push(template);
    this.templatesByIndustry.set(template.industry, industryTemplates);

    // Initialize analytics
    this.templateAnalytics.set(template.id, {
      templateId: template.id,
      usageCount: template.usageCount || 0,
      conversionRate: template.conversionRate || 0,
      averageQualityScore: template.qualityScore || 0,
      lastUsed: null,
      successfulGenerations: 0,
      failedGenerations: 0,
      averageGenerationTime: 0,
      costPerGeneration: 0,
      userFeedbackScore: 0,
      abTestResults: [],
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    });
  }

  /**
   * Find the best template match for a generation request
   */
  async findBestTemplate(
    request: MSEOGenerationRequest,
    personalizationData: MSEOPersonalizationData,
  ): Promise<MSEOTemplateMatch | null> {
    const criteria: MSEOTemplateCriteria = {
      type: request.type,
      industry: personalizationData.industry || "generic",
      tone: request.tone || "professional",
      complexity: request.complexity || "medium",
      category: request.category,
      tags: request.tags,
      minQualityScore: this.config.minQualityThreshold,
      includeInactive: false,
    };

    const candidates = this.searchTemplates(criteria);

    if (candidates.length === 0) {
      return null;
    }

    // Score each candidate based on multiple factors
    const scoredCandidates = candidates.map((template) => {
      const baseScore = template.qualityScore || 0;
      const conversionScore = (template.conversionRate || 0) * 2;
      const usageScore = Math.min((template.usageCount || 0) / 100, 1) * 0.5;

      // Industry match bonus
      const industryMatch =
        template.industry === criteria.industry
          ? 1
          : template.industry === "generic"
            ? 0.5
            : 0;

      // Tone match bonus
      const toneMatch = template.tone === criteria.tone ? 0.5 : 0;

      // Tag relevance score
      const tagScore = this.calculateTagRelevance(
        template.tags,
        criteria.tags || [],
      );

      const totalScore =
        baseScore +
        conversionScore +
        usageScore +
        industryMatch +
        toneMatch +
        tagScore;

      return {
        template,
        score: totalScore,
        reasons: this.generateMatchReasons(template, criteria, {
          baseScore,
          conversionScore,
          industryMatch,
          toneMatch,
          tagScore,
        }),
      };
    });

    // Sort by score and return the best match
    const bestMatch = scoredCandidates.sort((a, b) => b.score - a.score)[0];

    return {
      template: bestMatch.template,
      score: bestMatch.score,
      matchReasons: bestMatch.reasons,
      personalizationSuggestions: this.generatePersonalizationSuggestions(
        bestMatch.template,
        personalizationData,
      ),
      alternativeTemplates: scoredCandidates.slice(1, 4).map((c) => ({
        template: c.template,
        score: c.score,
        reasons: c.reasons,
      })),
    };
  }

  /**
   * Search templates based on criteria
   */
  searchTemplates(criteria: MSEOTemplateCriteria): MSEOTemplate[] {
    let templates = Array.from(this.templates.values());

    // Filter by active status
    if (!criteria.includeInactive) {
      templates = templates.filter((t) => t.isActive);
    }

    // Filter by type
    if (criteria.type) {
      templates = templates.filter((t) => t.type === criteria.type);
    }

    // Filter by industry (include generic as fallback)
    if (criteria.industry) {
      templates = templates.filter(
        (t) => t.industry === criteria.industry || t.industry === "generic",
      );
    }

    // Filter by tone
    if (criteria.tone) {
      templates = templates.filter((t) => t.tone === criteria.tone);
    }

    // Filter by complexity
    if (criteria.complexity) {
      templates = templates.filter((t) => t.complexity === criteria.complexity);
    }

    // Filter by category
    if (criteria.category) {
      templates = templates.filter((t) => t.category === criteria.category);
    }

    // Filter by minimum quality score
    if (criteria.minQualityScore) {
      templates = templates.filter(
        (t) => (t.qualityScore || 0) >= criteria.minQualityScore,
      );
    }

    // Filter by tags
    if (criteria.tags && criteria.tags.length > 0) {
      templates = templates.filter((t) =>
        criteria.tags!.some((tag) => t.tags.includes(tag)),
      );
    }

    return templates;
  }

  /**
   * Personalize a template with dynamic data
   */
  async personalizeTemplate(
    template: MSEOTemplate,
    personalizationData: MSEOPersonalizationData,
  ): Promise<string> {
    let personalizedContent = template.template;

    // Replace template variables
    template.variables.forEach((variable) => {
      const value =
        personalizationData[variable.name as keyof MSEOPersonalizationData] ||
        "";
      const placeholder = `{{${variable.name}}}`;
      personalizedContent = personalizedContent.replace(
        new RegExp(placeholder, "g"),
        String(value),
      );
    });

    // Apply personalization rules
    if (template.personalizationRules) {
      for (const rule of template.personalizationRules) {
        if (this.evaluateCondition(rule.condition, personalizationData)) {
          personalizedContent = this.applyRuleAction(
            personalizedContent,
            rule.action,
            personalizationData,
          );
        }
      }
    }

    // Apply AI-powered enhancements if enabled
    if (this.config.enableAIEnhancements) {
      personalizedContent = await this.enhanceWithAI(
        personalizedContent,
        personalizationData,
        template,
      );
    }

    return personalizedContent;
  }

  /**
   * Generate personalization suggestions for a template
   */
  private generatePersonalizationSuggestions(
    template: MSEOTemplate,
    data: MSEOPersonalizationData,
  ): string[] {
    const suggestions: string[] = [];

    // Missing required variables
    const missingRequired = template.variables
      .filter(
        (v) => v.required && !data[v.name as keyof MSEOPersonalizationData],
      )
      .map((v) => `Required variable '${v.name}' is missing: ${v.description}`);

    suggestions.push(...missingRequired);

    // Industry-specific suggestions
    if (data.industry) {
      switch (data.industry) {
        case "fintech":
          suggestions.push(
            "Consider emphasizing security and compliance benefits",
          );
          break;
        case "healthcare":
          suggestions.push(
            "Highlight HIPAA compliance and patient privacy features",
          );
          break;
        case "ecommerce":
          suggestions.push("Focus on conversion rates and revenue impact");
          break;
      }
    }

    // Company size suggestions
    if (data.companySize) {
      if (data.companySize < 50) {
        suggestions.push(
          "Emphasize ease of use and quick implementation for small teams",
        );
      } else if (data.companySize > 1000) {
        suggestions.push("Highlight enterprise features and scalability");
      }
    }

    return suggestions;
  }

  /**
   * Track template usage and performance
   */
  recordTemplateUsage(
    templateId: string,
    success: boolean,
    generationTime: number,
    cost: number,
  ): void {
    const analytics = this.templateAnalytics.get(templateId);
    if (!analytics) return;

    analytics.usageCount++;
    analytics.lastUsed = new Date();

    if (success) {
      analytics.successfulGenerations++;
    } else {
      analytics.failedGenerations++;
    }

    // Update averages
    const totalGenerations =
      analytics.successfulGenerations + analytics.failedGenerations;
    analytics.averageGenerationTime =
      (analytics.averageGenerationTime * (totalGenerations - 1) +
        generationTime) /
      totalGenerations;
    analytics.costPerGeneration =
      (analytics.costPerGeneration * (totalGenerations - 1) + cost) /
      totalGenerations;

    // Update template usage count
    const template = this.templates.get(templateId);
    if (template) {
      template.usageCount = analytics.usageCount;
      template.updatedAt = new Date();
    }
  }

  /**
   * Get template analytics
   */
  getTemplateAnalytics(
    templateId?: string,
  ): MSEOTemplateAnalytics | MSEOTemplateAnalytics[] {
    if (templateId) {
      return (
        this.templateAnalytics.get(templateId) || ({} as MSEOTemplateAnalytics)
      );
    }
    return Array.from(this.templateAnalytics.values());
  }

  /**
   * Update template performance based on feedback
   */
  updateTemplatePerformance(
    templateId: string,
    conversionRate: number,
    qualityScore: number,
  ): void {
    const template = this.templates.get(templateId);
    const analytics = this.templateAnalytics.get(templateId);

    if (template && analytics) {
      template.conversionRate = conversionRate;
      template.qualityScore = qualityScore;
      template.updatedAt = new Date();

      analytics.conversionRate = conversionRate;
      analytics.averageQualityScore = qualityScore;
      analytics.updatedAt = new Date();
    }
  }

  /**
   * Get templates by performance metrics
   */
  getTopPerformingTemplates(
    type?: MSEOTemplateType,
    limit: number = 10,
  ): MSEOTemplate[] {
    let templates = Array.from(this.templates.values());

    if (type) {
      templates = templates.filter((t) => t.type === type);
    }

    return templates
      .filter((t) => t.isActive)
      .sort((a, b) => {
        const scoreA =
          (a.conversionRate || 0) * 0.6 + (a.qualityScore || 0) * 0.4;
        const scoreB =
          (b.conversionRate || 0) * 0.6 + (b.qualityScore || 0) * 0.4;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Validate template before adding
   */
  validateTemplate(template: MSEOTemplate): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required fields
    if (!template.id) errors.push("Template ID is required");
    if (!template.name) errors.push("Template name is required");
    if (!template.type) errors.push("Template type is required");
    if (!template.template) errors.push("Template content is required");

    // Duplicate ID check
    if (this.templates.has(template.id)) {
      errors.push(`Template with ID '${template.id}' already exists`);
    }

    // Variable validation
    const templateContent = template.template;
    const variableMatches = templateContent.match(/\{\{(\w+)\}\}/g) || [];
    const referencedVariables = variableMatches.map((match) =>
      match.replace(/[{}]/g, ""),
    );

    template.variables.forEach((variable) => {
      if (!referencedVariables.includes(variable.name)) {
        errors.push(
          `Variable '${variable.name}' is defined but not used in template`,
        );
      }
    });

    referencedVariables.forEach((varName) => {
      if (!template.variables.find((v) => v.name === varName)) {
        errors.push(
          `Variable '${varName}' is used in template but not defined`,
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Private helper methods

  private calculateTagRelevance(
    templateTags: string[],
    requestTags: string[],
  ): number {
    if (requestTags.length === 0) return 0;

    const matchingTags = templateTags.filter((tag) =>
      requestTags.includes(tag),
    );
    return matchingTags.length / requestTags.length;
  }

  private generateMatchReasons(
    template: MSEOTemplate,
    criteria: MSEOTemplateCriteria,
    scores: any,
  ): string[] {
    const reasons: string[] = [];

    if (scores.industryMatch >= 1) {
      reasons.push(`Perfect industry match: ${template.industry}`);
    } else if (scores.industryMatch > 0) {
      reasons.push(`Generic template suitable for ${criteria.industry}`);
    }

    if (scores.toneMatch > 0) {
      reasons.push(`Tone matches: ${template.tone}`);
    }

    if (template.conversionRate && template.conversionRate > 0.1) {
      reasons.push(
        `High conversion rate: ${(template.conversionRate * 100).toFixed(1)}%`,
      );
    }

    if (template.qualityScore && template.qualityScore > 0.8) {
      reasons.push(
        `High quality score: ${(template.qualityScore * 100).toFixed(0)}%`,
      );
    }

    return reasons;
  }

  private evaluateCondition(
    condition: string,
    data: MSEOPersonalizationData,
  ): boolean {
    // Simple condition evaluator - in production, use a proper expression parser
    try {
      // Replace data variables in condition
      let evaluableCondition = condition;
      Object.entries(data).forEach(([key, value]) => {
        evaluableCondition = evaluableCondition.replace(
          new RegExp(key, "g"),
          JSON.stringify(value),
        );
      });

      // Basic evaluation (extend for more complex conditions)
      return eval(evaluableCondition);
    } catch (error) {
      console.warn(`Failed to evaluate condition: ${condition}`, error);
      return false;
    }
  }

  private applyRuleAction(
    content: string,
    action: string,
    data: MSEOPersonalizationData,
  ): string {
    // Simple action processor - extend for more complex transformations
    if (action.startsWith("replace ")) {
      const replaceMatch = action.match(/replace "([^"]+)" with "([^"]+)"/);
      if (replaceMatch) {
        const [, from, to] = replaceMatch;
        return content.replace(new RegExp(from, "g"), to);
      }
    }

    if (action.startsWith("add ")) {
      const addMatch = action.match(/add (.+)/);
      if (addMatch) {
        const textToAdd = addMatch[1];
        return content + " " + textToAdd;
      }
    }

    return content;
  }

  private async enhanceWithAI(
    content: string,
    data: MSEOPersonalizationData,
    template: MSEOTemplate,
  ): Promise<string> {
    // Placeholder for AI enhancement - integrate with LLM API
    // This would send the content to an LLM for personalization improvements
    return content;
  }
}

/**
 * Export factory function for easy initialization
 */
export function createMSEOTemplateManager(
  config: MSEOTemplateConfig,
): MSEOTemplateManager {
  return new MSEOTemplateManager(config);
}

/**
 * Default template configuration
 */
export const defaultTemplateConfig: MSEOTemplateConfig = {
  enableAIEnhancements: true,
  minQualityThreshold: 0.6,
  maxTemplatesPerType: 100,
  cacheTemplates: true,
  enableAnalytics: true,
  templateValidation: true,
  autoOptimization: true,
  enableABTesting: false,
};
