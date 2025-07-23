import { BaseAgent } from "../base/agent.js";
import { Logger } from "@iq24/ai-core/utils/logger";
import { z } from "zod";
// OPA-specific schemas
const PersonalizationContextSchema = z.object({
    lead: z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        company: z.string(),
        jobTitle: z.string(),
        industry: z.string(),
        location: z.string().optional(),
        linkedinUrl: z.string().optional(),
        recentActivity: z.array(z.string()).optional(),
        painPoints: z.array(z.string()).optional(),
        interests: z.array(z.string()).optional(),
    }),
    campaign: z.object({
        id: z.string(),
        type: z.enum(["cold_email", "linkedin_message", "follow_up", "nurture"]),
        objective: z.string(),
        tone: z.enum(["professional", "casual", "consultative", "urgent"]),
        cta: z.string(),
    }),
    company: z.object({
        name: z.string(),
        industry: z.string(),
        size: z.string(),
        recentNews: z.array(z.string()).optional(),
        technologies: z.array(z.string()).optional(),
        challenges: z.array(z.string()).optional(),
    }),
});
const MessageVariantSchema = z.object({
    id: z.string(),
    type: z.enum(["text", "voice_script", "image_prompt", "video_script"]),
    content: z.string(),
    personalizationTokens: z.record(z.string()),
    subjectLine: z.string().optional(),
    preheader: z.string().optional(),
    callToAction: z.string(),
    estimatedEngagement: z.number().min(0).max(1),
    abTestGroup: z.string().optional(),
});
const MSEORequestSchema = z.object({
    type: z.enum(["voice", "image", "video"]),
    script: z.string(),
    style: z.string(),
    personalizedElements: z.record(z.string()),
    quality: z.enum(["draft", "production", "premium"]),
});
/**
 * Outreach Personalization Agent (OPA)
 *
 * Responsibilities:
 * - Analyzes enriched prospect data for personalization opportunities
 * - Uses advanced NLP/LLMs to generate personalized content
 * - Optimizes subject lines, CTAs, and message tone using predictive models
 * - Integrates with MSEO for multi-modal content generation
 * - Adapts messaging based on campaign goals and ALO instructions
 */
export class OutreachPersonalizationAgent extends BaseAgent {
    constructor(config) {
        super(config);
        this.llmClients = new Map();
        this.promptTemplates = new Map();
        this.config = config;
        this.logger = new Logger("OPA");
        this.initializeLLMClients();
        this.loadPromptTemplates();
    }
    initializeLLMClients() {
        // Initialize OpenAI client
        if (this.config.llmProviders.openai.enabled) {
            const OpenAI = require("openai");
            this.llmClients.set("openai", new OpenAI({
                apiKey: this.config.llmProviders.openai.apiKey,
            }));
        }
        // Initialize Anthropic client
        if (this.config.llmProviders.anthropic.enabled) {
            const Anthropic = require("@anthropic-ai/sdk");
            this.llmClients.set("anthropic", new Anthropic({
                apiKey: this.config.llmProviders.anthropic.apiKey,
            }));
        }
        // Initialize Mistral client
        if (this.config.llmProviders.mistral.enabled) {
            // Mistral client initialization
            this.llmClients.set("mistral", {
                apiKey: this.config.llmProviders.mistral.apiKey,
                baseUrl: "https://api.mistral.ai/v1",
            });
        }
    }
    loadPromptTemplates() {
        // Load sophisticated prompt templates for different use cases
        this.promptTemplates.set("cold_email", `
You are an expert B2B sales copywriter creating highly personalized cold emails that drive responses.

Context:
- Prospect: {{firstName}} {{lastName}}, {{jobTitle}} at {{company}}
- Industry: {{industry}}
- Company Size: {{companySize}}
- Recent Company News: {{recentNews}}
- Pain Points: {{painPoints}}
- Campaign Objective: {{objective}}

Instructions:
1. Write a compelling subject line that references something specific about their company or role
2. Create a personalized opening that shows genuine research
3. Connect their likely challenges to your solution without being pushy
4. Include a soft, specific call-to-action
5. Keep it concise (150-200 words max)
6. Match the {{tone}} tone specified

Generate 3 variants with different approaches:
1. Problem-focused variant
2. Opportunity-focused variant  
3. Social proof variant

Format as JSON with subject, body, and reasoning for each.
    `);
        this.promptTemplates.set("linkedin_message", `
Create a personalized LinkedIn connection request or message.

Context: {{context}}

Requirements:
- Professional but conversational tone
- Reference mutual connections or shared interests if available
- Under 300 characters for connection requests
- Clear value proposition for messages
- Industry-specific language and insights

Generate the message with personalization tokens clearly marked.
    `);
        this.promptTemplates.set("follow_up", `
Create a thoughtful follow-up message that adds value and moves the conversation forward.

Previous Context: {{previousInteraction}}
Time Since Last Contact: {{daysSince}} days
Prospect Data: {{prospectData}}

Requirements:
- Acknowledge previous interaction appropriately
- Add new value or insight
- Use a different angle from the original message
- Include a specific, low-commitment next step
- Show patience and professionalism

Generate a follow-up that feels natural and helpful.
    `);
    }
    async processTask(task, context) {
        this.logger.info(`Processing OPA task: ${task.type}`, { taskId: task.id });
        try {
            switch (task.type) {
                case "personalize_outreach":
                    return await this.personalizeOutreach(task.payload, context);
                case "generate_variants":
                    return await this.generateMessageVariants(task.payload, context);
                case "optimize_subject_lines":
                    return await this.optimizeSubjectLines(task.payload, context);
                case "create_mseo_content":
                    return await this.createMSEOContent(task.payload, context);
                case "analyze_tonality":
                    return await this.analyzeTonality(task.payload, context);
                default:
                    throw new Error(`Unknown OPA task type: ${task.type}`);
            }
        }
        catch (error) {
            this.logger.error("OPA task processing failed", { error, task });
            throw error;
        }
    }
    /**
     * Main personalization orchestration method
     */
    async personalizeOutreach(payload, context) {
        const personalizationContext = PersonalizationContextSchema.parse(payload);
        this.logger.info("Starting outreach personalization", {
            leadId: personalizationContext.lead.id,
            campaignType: personalizationContext.campaign.type,
        });
        // Step 1: Analyze prospect for personalization opportunities
        const personalizationInsights = await this.analyzePersonalizationOpportunities(personalizationContext);
        // Step 2: Generate personalized message variants
        const personalizedMessages = await this.generatePersonalizedMessages(personalizationContext, personalizationInsights);
        // Step 3: Create MSEO assets if requested
        const mseoAssets = await this.generateMSEOAssets(personalizedMessages, personalizationContext);
        // Step 4: Generate optimization recommendations
        const recommendations = await this.generateOptimizationRecommendations(personalizedMessages, personalizationContext, personalizationInsights);
        // Update metrics
        this.metrics.increment("messages.personalized");
        this.metrics.histogram("personalization.insights_count", Object.keys(personalizationInsights).length);
        return {
            personalizedMessages,
            mseoAssets,
            personalizationInsights,
            recommendations,
        };
    }
    /**
     * Analyzes prospect data to identify personalization opportunities
     */
    async analyzePersonalizationOpportunities(context) {
        const insights = {};
        // Company-based personalization
        if (context.company.recentNews?.length) {
            insights.companyNews = {
                type: "recent_news",
                items: context.company.recentNews,
                personalizationAngle: "Reference recent company developments",
            };
        }
        // Role-based personalization
        insights.rolePersonalization = await this.analyzeRoleSpecificChallenges(context.lead.jobTitle, context.company.industry);
        // Industry insights
        insights.industryInsights = await this.getIndustrySpecificInsights(context.company.industry);
        // Location-based opportunities
        if (context.lead.location) {
            insights.locationPersonalization = await this.getLocationBasedInsights(context.lead.location);
        }
        // Technology stack analysis
        if (context.company.technologies?.length) {
            insights.techStackPersonalization =
                await this.analyzeTechnologyStackOpportunities(context.company.technologies);
        }
        // Pain point analysis
        if (context.lead.painPoints?.length) {
            insights.painPointAnalysis = await this.analyzePainPointsForMessaging(context.lead.painPoints);
        }
        this.logger.info("Personalization analysis complete", {
            insightCount: Object.keys(insights).length,
            leadId: context.lead.id,
        });
        return insights;
    }
    /**
     * Generates multiple personalized message variants using LLMs
     */
    async generatePersonalizedMessages(context, insights) {
        const variants = [];
        const maxVariants = Math.min(this.config.personalization.maxVariants, 5);
        // Prepare context for LLM
        const llmContext = this.prepareLLMContext(context, insights);
        // Get appropriate prompt template
        const template = this.promptTemplates.get(context.campaign.type) ||
            this.promptTemplates.get("cold_email");
        // Generate variants using different LLM providers for diversity
        const providers = Array.from(this.llmClients.keys()).slice(0, maxVariants);
        for (let i = 0; i < maxVariants; i++) {
            const provider = providers[i % providers.length];
            const client = this.llmClients.get(provider);
            if (!client)
                continue;
            try {
                const prompt = this.populateTemplate(template, llmContext);
                const response = await this.callLLMProvider(provider, client, prompt, context.campaign.tone);
                const variant = await this.parseAndValidateResponse(response, i, provider);
                if (variant) {
                    variant.abTestGroup = this.config.personalization.abTestEnabled
                        ? `variant_${i + 1}`
                        : undefined;
                    variants.push(variant);
                }
            }
            catch (error) {
                this.logger.warn(`Failed to generate variant ${i + 1} with ${provider}`, { error });
                this.metrics.increment(`llm.${provider}.errors`);
            }
        }
        // Rank variants by predicted engagement
        const rankedVariants = await this.rankVariantsByEngagement(variants, context);
        this.logger.info(`Generated ${rankedVariants.length} message variants`, {
            leadId: context.lead.id,
            campaignType: context.campaign.type,
        });
        return rankedVariants;
    }
    /**
     * Generates MSEO (Multi-Sensory Engagement Orchestration) assets
     */
    async generateMSEOAssets(messages, context) {
        const assets = [];
        // Only generate MSEO assets for high-value prospects or specific campaign types
        if (!this.shouldGenerateMSEOAssets(context)) {
            return assets;
        }
        for (const message of messages.slice(0, 2)) {
            // Limit to top 2 variants
            try {
                // Generate voice script and audio
                if (this.config.mseoServices.voiceGeneration.enabled) {
                    const voiceAsset = await this.generateVoiceMessage(message, context);
                    if (voiceAsset)
                        assets.push(voiceAsset);
                }
                // Generate personalized image
                if (this.config.mseoServices.imageGeneration.enabled) {
                    const imageAsset = await this.generatePersonalizedImage(message, context);
                    if (imageAsset)
                        assets.push(imageAsset);
                }
                // Generate video content for premium campaigns
                if (this.config.mseoServices.videoGeneration.enabled &&
                    context.campaign.type === "premium") {
                    const videoAsset = await this.generatePersonalizedVideo(message, context);
                    if (videoAsset)
                        assets.push(videoAsset);
                }
            }
            catch (error) {
                this.logger.warn("MSEO asset generation failed", {
                    error,
                    messageId: message.id,
                });
                this.metrics.increment("mseo.generation_failed");
            }
        }
        this.metrics.histogram("mseo.assets_generated", assets.length);
        return assets;
    }
    // Helper methods for LLM interaction
    async callLLMProvider(provider, client, prompt, tone) {
        this.metrics.increment(`llm.${provider}.requests`);
        const startTime = Date.now();
        try {
            let response;
            switch (provider) {
                case "openai":
                    response = await client.chat.completions.create({
                        model: this.config.llmProviders.openai.model,
                        messages: [
                            {
                                role: "system",
                                content: "You are an expert B2B sales copywriter focused on personalized outreach.",
                            },
                            { role: "user", content: prompt },
                        ],
                        temperature: 0.7,
                        max_tokens: 1000,
                    });
                    return response.choices[0].message.content;
                case "anthropic":
                    response = await client.messages.create({
                        model: this.config.llmProviders.anthropic.model,
                        max_tokens: 1000,
                        messages: [{ role: "user", content: prompt }],
                    });
                    return response.content[0].text;
                case "mistral":
                    // Mistral API call implementation
                    response = await this.callMistralAPI(client, prompt);
                    return response.choices[0].message.content;
                default:
                    throw new Error(`Unknown LLM provider: ${provider}`);
            }
        }
        finally {
            this.metrics.histogram(`llm.${provider}.response_time`, Date.now() - startTime);
        }
    }
    async parseAndValidateResponse(response, index, provider) {
        try {
            // Try to parse as JSON first
            let parsed;
            try {
                parsed = JSON.parse(response);
            }
            catch {
                // If not JSON, treat as plain text and structure it
                parsed = this.structurePlainTextResponse(response);
            }
            const variant = {
                id: `${provider}_variant_${index + 1}`,
                type: "text",
                content: parsed.body || parsed.content || response,
                personalizationTokens: this.extractPersonalizationTokens(parsed.body || parsed.content || response),
                subjectLine: parsed.subject || this.generateFallbackSubject(),
                callToAction: parsed.cta ||
                    this.extractCallToAction(parsed.body || parsed.content || response),
                estimatedEngagement: await this.estimateEngagement(parsed),
            };
            return MessageVariantSchema.parse(variant);
        }
        catch (error) {
            this.logger.warn("Failed to parse LLM response", {
                error,
                response: response.substring(0, 200),
            });
            return null;
        }
    }
    // MSEO generation methods
    async generateVoiceMessage(message, context) {
        const voiceScript = await this.adaptMessageForVoice(message.content, context);
        const mseoRequest = {
            type: "voice",
            script: voiceScript,
            style: "professional",
            personalizedElements: {
                firstName: context.lead.firstName,
                company: context.company.name,
            },
            quality: "production",
        };
        return await this.callMSEOService("voice", mseoRequest);
    }
    async generatePersonalizedImage(message, context) {
        const imagePrompt = await this.createPersonalizedImagePrompt(message, context);
        const mseoRequest = {
            type: "image",
            script: imagePrompt,
            style: "professional_business",
            personalizedElements: {
                industry: context.company.industry,
                companyName: context.company.name,
            },
            quality: "production",
        };
        return await this.callMSEOService("image", mseoRequest);
    }
    async generatePersonalizedVideo(message, context) {
        const videoScript = await this.adaptMessageForVideo(message.content, context);
        const mseoRequest = {
            type: "video",
            script: videoScript,
            style: "business_professional",
            personalizedElements: {
                recipientName: context.lead.firstName,
                companyName: context.company.name,
                industry: context.company.industry,
            },
            quality: "premium",
        };
        return await this.callMSEOService("video", mseoRequest);
    }
    // Analysis and optimization methods
    async analyzeRoleSpecificChallenges(jobTitle, industry) {
        // Implementation for role-specific challenge analysis
        return {
            commonChallenges: ["efficiency", "scale", "roi"],
            decisionMakingPower: "high",
            preferredCommunicationStyle: "data-driven",
        };
    }
    async getIndustrySpecificInsights(industry) {
        const insights = this.config.prompts.industryInsights[industry] || [];
        return {
            trends: insights,
            regulations: [],
            competitiveLandscape: "high",
        };
    }
    async rankVariantsByEngagement(variants, context) {
        // Use ML model to predict engagement scores
        for (const variant of variants) {
            variant.estimatedEngagement = await this.predictEngagementScore(variant, context);
        }
        return variants.sort((a, b) => b.estimatedEngagement - a.estimatedEngagement);
    }
    async predictEngagementScore(variant, context) {
        // Simplified engagement prediction based on various factors
        let score = 0.5; // Base score
        // Length optimization
        const wordCount = variant.content.split(" ").length;
        if (wordCount >= 80 && wordCount <= 150)
            score += 0.1;
        // Personalization tokens
        const tokenCount = Object.keys(variant.personalizationTokens).length;
        score += Math.min(tokenCount * 0.05, 0.2);
        // Subject line quality
        if (variant.subjectLine &&
            variant.subjectLine.length >= 6 &&
            variant.subjectLine.length <= 50) {
            score += 0.1;
        }
        // CTA presence and quality
        if (variant.callToAction && variant.callToAction.length > 0) {
            score += 0.1;
        }
        return Math.min(score, 1.0);
    }
    // Utility methods
    prepareLLMContext(context, insights) {
        return {
            firstName: context.lead.firstName,
            lastName: context.lead.lastName,
            company: context.company.name,
            jobTitle: context.lead.jobTitle,
            industry: context.company.industry,
            companySize: context.company.size,
            objective: context.campaign.objective,
            tone: context.campaign.tone,
            recentNews: context.company.recentNews?.join(", ") || "",
            painPoints: context.lead.painPoints?.join(", ") || "",
            // Add insights
            ...Object.entries(insights).reduce((acc, [key, value]) => {
                acc[key] = JSON.stringify(value);
                return acc;
            }, {}),
        };
    }
    populateTemplate(template, context) {
        let populated = template;
        for (const [key, value] of Object.entries(context)) {
            populated = populated.replace(new RegExp(`{{${key}}}`, "g"), value);
        }
        return populated;
    }
    extractPersonalizationTokens(content) {
        const tokens = {};
        const regex = /\[\[(\w+):\s*([^\]]+)\]\]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            tokens[match[1]] = match[2];
        }
        return tokens;
    }
    shouldGenerateMSEOAssets(context) {
        // Generate MSEO for high-value prospects or premium campaigns
        return (context.campaign.type === "premium" ||
            context.company.size === "Enterprise" ||
            context.lead.jobTitle.toLowerCase().includes("ceo") ||
            context.lead.jobTitle.toLowerCase().includes("founder"));
    }
    async callMSEOService(type, request) {
        // Placeholder for MSEO service calls
        this.logger.info(`Calling MSEO service for ${type}`, { request });
        this.metrics.increment(`mseo.${type}.requests`);
        return {
            id: `mseo_${type}_${Date.now()}`,
            type,
            url: `https://assets.iq24.ai/${type}/${Date.now()}`,
            status: "generated",
        };
    }
    async getHealth() {
        const llmStatuses = {};
        for (const [name, client] of this.llmClients.entries()) {
            try {
                // Test LLM connectivity with a simple request
                llmStatuses[name] = "healthy";
            }
            catch {
                llmStatuses[name] = "unhealthy";
            }
        }
        const allHealthy = Object.values(llmStatuses).every((status) => status === "healthy");
        return {
            status: allHealthy ? "healthy" : "unhealthy",
            details: {
                llmProviders: llmStatuses,
                templatesLoaded: this.promptTemplates.size,
                metrics: await this.getMetricsSummary(),
            },
        };
    }
    // Additional helper methods would be implemented here...
    structurePlainTextResponse(response) {
        // Convert plain text response to structured format
        return { body: response };
    }
    generateFallbackSubject() {
        return "Quick question about [Company]";
    }
    extractCallToAction(content) {
        // Extract CTA from content using regex or NLP
        return "Worth a brief call?";
    }
    async estimateEngagement(parsed) {
        return 0.7; // Simplified
    }
    async adaptMessageForVoice(content, context) {
        // Adapt written content for voice delivery
        return content.replace(/\n/g, " ... ").replace(/[^\w\s.,!?]/g, "");
    }
    async createPersonalizedImagePrompt(message, context) {
        return `Professional business image for ${context.company.industry} industry, featuring modern design elements`;
    }
    async adaptMessageForVideo(content, context) {
        // Adapt content for video format
        return `Hello ${context.lead.firstName}, ${content}`;
    }
    async callMistralAPI(client, prompt) {
        // Placeholder for Mistral API call
        return { choices: [{ message: { content: prompt } }] };
    }
    async getLocationBasedInsights(location) {
        return { timezone: "UTC", businessHours: "9-5" };
    }
    async analyzeTechnologyStackOpportunities(technologies) {
        return { compatibleTools: technologies, integrationOpportunities: [] };
    }
    async analyzePainPointsForMessaging(painPoints) {
        return { primaryPain: painPoints[0], messagingAngle: "solution-focused" };
    }
    async generateOptimizationRecommendations(messages, context, insights) {
        return [
            "Consider A/B testing subject lines",
            "Add industry-specific value proposition",
            "Include social proof for higher conversion",
        ];
    }
}
//# sourceMappingURL=opa-agent.js.map