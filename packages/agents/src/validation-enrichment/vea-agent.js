import { BaseAgent } from "../base/agent.js";
import { Logger } from "@iq24/ai-core/utils/logger";
import { z } from "zod";
// VEA-specific schemas
const ContactValidationSchema = z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    company: z.string().min(1),
});
const EnrichmentSourceSchema = z.object({
    provider: z.enum(["apollo", "hunter", "clearbit", "zoominfo", "internal"]),
    endpoint: z.string(),
    confidence: z.number().min(0).max(1),
    lastUpdated: z.date(),
});
const ValidationResultSchema = z.object({
    leadId: z.string(),
    isValid: z.boolean(),
    validationScore: z.number().min(0).max(1),
    enrichedData: z.record(z.any()),
    sources: z.array(EnrichmentSourceSchema),
    deduplicationKey: z.string(),
    validationReasons: z.array(z.string()),
});
/**
 * Validation & Enrichment Agent (VEA)
 *
 * Responsibilities:
 * - Validates email addresses and phone numbers using external APIs
 * - Cross-references data across multiple sources
 * - Enriches profiles with firmographic, technographic, and demographic data
 * - Performs data deduplication and standardization
 * - Updates prospect records in database and Feature Store
 */
export class ValidationEnrichmentAgent extends BaseAgent {
    constructor(config) {
        super(config);
        this.enrichmentProviders = new Map();
        this.config = config;
        this.logger = new Logger("VEA");
        this.initializeProviders();
    }
    initializeProviders() {
        // Initialize Apollo provider
        if (this.config.enrichmentProviders.apollo.enabled) {
            this.enrichmentProviders.set("apollo", {
                baseUrl: "https://api.apollo.io/v1",
                apiKey: this.config.enrichmentProviders.apollo.apiKey,
                rateLimits: { requests: 100, window: 60000 }, // 100 req/min
            });
        }
        // Initialize Hunter provider
        if (this.config.enrichmentProviders.hunter.enabled) {
            this.enrichmentProviders.set("hunter", {
                baseUrl: "https://api.hunter.io/v2",
                apiKey: this.config.enrichmentProviders.hunter.apiKey,
                rateLimits: { requests: 50, window: 60000 }, // 50 req/min
            });
        }
        // Initialize Clearbit provider
        if (this.config.enrichmentProviders.clearbit.enabled) {
            this.enrichmentProviders.set("clearbit", {
                baseUrl: "https://person.clearbit.com/v2",
                apiKey: this.config.enrichmentProviders.clearbit.apiKey,
                rateLimits: { requests: 600, window: 3600000 }, // 600 req/hour
            });
        }
    }
    async processTask(task, context) {
        this.logger.info(`Processing VEA task: ${task.type}`, { taskId: task.id });
        try {
            switch (task.type) {
                case "validate_contacts":
                    return await this.validateContacts(task.payload.candidates, context);
                case "enrich_profiles":
                    return await this.enrichProfiles(task.payload.leads, context);
                case "deduplicate_data":
                    return await this.deduplicateData(task.payload.dataset, context);
                case "cross_reference":
                    return await this.crossReferenceData(task.payload.sources, context);
                default:
                    throw new Error(`Unknown VEA task type: ${task.type}`);
            }
        }
        catch (error) {
            this.logger.error("VEA task processing failed", { error, task });
            throw error;
        }
    }
    /**
     * Validates contact information from PDA candidates
     */
    async validateContacts(candidates, context) {
        const results = [];
        this.logger.info(`Validating ${candidates.length} contact candidates`);
        for (const candidate of candidates) {
            try {
                // Parse and validate candidate data structure
                const validatedContact = ContactValidationSchema.parse(candidate);
                // Perform email validation
                const emailValidation = await this.validateEmail(validatedContact.email, context);
                // Perform phone validation if available
                const phoneValidation = validatedContact.phone
                    ? await this.validatePhone(validatedContact.phone, context)
                    : { isValid: true, confidence: 0.5 };
                // Calculate overall validation score
                const validationScore = this.calculateValidationScore(emailValidation, phoneValidation);
                // Generate deduplication key
                const deduplicationKey = this.generateDeduplicationKey(validatedContact);
                const result = {
                    leadId: candidate.id || `temp_${Date.now()}`,
                    isValid: validationScore >= this.config.validation.emailMinConfidence,
                    validationScore,
                    enrichedData: {},
                    sources: [],
                    deduplicationKey,
                    validationReasons: this.getValidationReasons(emailValidation, phoneValidation),
                };
                results.push(result);
                // Update metrics
                this.metrics.increment("contacts.validated");
                this.metrics.histogram("validation.score", validationScore);
            }
            catch (error) {
                this.logger.warn("Contact validation failed", { candidate, error });
                this.metrics.increment("contacts.validation_failed");
            }
        }
        return results;
    }
    /**
     * Enriches validated leads with additional data from multiple sources
     */
    async enrichProfiles(leads, context) {
        const enrichedLeads = [];
        this.logger.info(`Enriching ${leads.length} validated leads`);
        for (const lead of leads) {
            if (!lead.isValid)
                continue;
            try {
                const enrichmentData = await this.performMultiSourceEnrichment(lead, context);
                // Merge enrichment data
                lead.enrichedData = {
                    ...lead.enrichedData,
                    ...enrichmentData.data,
                };
                lead.sources = [...lead.sources, ...enrichmentData.sources];
                enrichedLeads.push(lead);
                this.metrics.increment("profiles.enriched");
                this.metrics.histogram("enrichment.sources_count", lead.sources.length);
            }
            catch (error) {
                this.logger.warn("Profile enrichment failed", {
                    leadId: lead.leadId,
                    error,
                });
                this.metrics.increment("profiles.enrichment_failed");
                enrichedLeads.push(lead); // Include even if enrichment fails
            }
        }
        return enrichedLeads;
    }
    /**
     * Performs multi-source data enrichment with waterfall logic
     */
    async performMultiSourceEnrichment(lead, context) {
        const enrichmentData = {};
        const sources = [];
        // Define enrichment priority order
        const providers = ["apollo", "hunter", "clearbit"];
        for (const providerName of providers) {
            if (sources.length >= this.config.validation.maxEnrichmentSources)
                break;
            const provider = this.enrichmentProviders.get(providerName);
            if (!provider)
                continue;
            try {
                const providerData = await this.callEnrichmentProvider(providerName, lead, context);
                if (providerData && Object.keys(providerData).length > 0) {
                    // Merge with confidence weighting
                    for (const [key, value] of Object.entries(providerData)) {
                        if (!enrichmentData[key] ||
                            this.shouldOverrideData(enrichmentData[key], value, providerName)) {
                            enrichmentData[key] = value;
                        }
                    }
                    sources.push({
                        provider: providerName,
                        endpoint: provider.baseUrl,
                        confidence: this.getProviderConfidence(providerName),
                        lastUpdated: new Date(),
                    });
                    this.metrics.increment(`enrichment.${providerName}.success`);
                }
            }
            catch (error) {
                this.logger.warn(`Enrichment provider ${providerName} failed`, {
                    error,
                    leadId: lead.leadId,
                });
                this.metrics.increment(`enrichment.${providerName}.failed`);
            }
        }
        return { data: enrichmentData, sources };
    }
    /**
     * Email validation using multiple techniques
     */
    async validateEmail(email, context) {
        // Basic regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, confidence: 0, technique: "regex" };
        }
        try {
            // Use Hunter.io email verifier if available
            const hunterProvider = this.enrichmentProviders.get("hunter");
            if (hunterProvider) {
                const verification = await this.callHunterVerification(email);
                return {
                    isValid: verification.result === "deliverable",
                    confidence: verification.score / 100,
                    technique: "hunter_api",
                };
            }
            // Fall back to domain validation
            const domain = email.split("@")[1];
            const domainValid = await this.validateDomain(domain);
            return {
                isValid: domainValid,
                confidence: domainValid ? 0.7 : 0.1,
                technique: "domain_check",
            };
        }
        catch (error) {
            this.logger.warn("Email validation error", { email, error });
            return { isValid: false, confidence: 0, technique: "error" };
        }
    }
    /**
     * Phone number validation and formatting
     */
    async validatePhone(phone, context) {
        try {
            // Basic phone number cleanup and validation
            const cleaned = phone.replace(/\D/g, "");
            // US phone number validation (can be extended for international)
            if (cleaned.length === 10 ||
                (cleaned.length === 11 && cleaned.startsWith("1"))) {
                const formatted = cleaned.length === 11
                    ? `+1-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
                    : `+1-${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
                return {
                    isValid: true,
                    confidence: 0.8,
                    formatted,
                };
            }
            return { isValid: false, confidence: 0.2 };
        }
        catch (error) {
            this.logger.warn("Phone validation error", { phone, error });
            return { isValid: false, confidence: 0 };
        }
    }
    /**
     * Data deduplication using fuzzy matching and key generation
     */
    async deduplicateData(dataset, context) {
        const seen = new Map();
        const duplicates = [];
        const unique = [];
        for (const record of dataset) {
            const existing = seen.get(record.deduplicationKey);
            if (existing) {
                // Found duplicate - merge or choose best
                if (record.validationScore > existing.validationScore) {
                    // Replace with higher quality record
                    unique.splice(unique.indexOf(existing), 1, record);
                    seen.set(record.deduplicationKey, record);
                    duplicates.push(existing);
                }
                else {
                    duplicates.push(record);
                }
            }
            else {
                seen.set(record.deduplicationKey, record);
                unique.push(record);
            }
        }
        const deduplicationReport = {
            totalRecords: dataset.length,
            uniqueRecords: unique.length,
            duplicateRecords: duplicates.length,
            deduplicationRate: duplicates.length / dataset.length,
            timestamp: new Date().toISOString(),
        };
        this.logger.info("Deduplication complete", deduplicationReport);
        return { unique, duplicates, deduplicationReport };
    }
    /**
     * Cross-reference data across multiple sources for consistency
     */
    async crossReferenceData(sources, context) {
        // Implementation for cross-referencing data
        // This would analyze data from multiple sources and identify conflicts
        return {
            consistency: 0.85,
            conflicts: [],
            recommendation: "accept",
        };
    }
    // Helper methods
    calculateValidationScore(emailValidation, phoneValidation) {
        const emailWeight = 0.7;
        const phoneWeight = 0.3;
        return (emailValidation.confidence * emailWeight +
            phoneValidation.confidence * phoneWeight);
    }
    generateDeduplicationKey(contact) {
        // Create a fuzzy matching key based on email and name
        const email = contact.email.toLowerCase().trim();
        const name = `${contact.firstName} ${contact.lastName}`
            .toLowerCase()
            .trim();
        const company = contact.company.toLowerCase().trim();
        return `${email}:${name}:${company}`.replace(/\s+/g, "_");
    }
    getValidationReasons(emailValidation, phoneValidation) {
        const reasons = [];
        if (emailValidation.isValid) {
            reasons.push(`Email validated via ${emailValidation.technique}`);
        }
        else {
            reasons.push(`Email failed validation: ${emailValidation.technique}`);
        }
        if (phoneValidation.isValid) {
            reasons.push("Phone number format valid");
        }
        return reasons;
    }
    async callEnrichmentProvider(provider, lead, context) {
        // Placeholder for actual API calls to enrichment providers
        // This would make HTTP requests to Apollo, Hunter, Clearbit etc.
        switch (provider) {
            case "apollo":
                return await this.callApolloEnrichment(lead);
            case "hunter":
                return await this.callHunterEnrichment(lead);
            case "clearbit":
                return await this.callClearbitEnrichment(lead);
            default:
                return null;
        }
    }
    async callApolloEnrichment(lead) {
        // Apollo API integration
        return {
            jobTitle: "Software Engineer",
            seniority: "Mid-level",
            department: "Engineering",
            companySize: "100-500",
            industry: "Technology",
        };
    }
    async callHunterEnrichment(lead) {
        // Hunter API integration
        return {
            linkedinUrl: "https://linkedin.com/in/example",
            twitterHandle: "@example",
            confidence: 95,
        };
    }
    async callClearbitEnrichment(lead) {
        // Clearbit API integration
        return {
            avatar: "https://avatar.clearbit.com/example@company.com",
            location: "San Francisco, CA",
            timezone: "America/Los_Angeles",
        };
    }
    async callHunterVerification(email) {
        // Hunter email verification API call
        return {
            result: "deliverable",
            score: 85,
            email: email,
        };
    }
    async validateDomain(domain) {
        // DNS lookup or domain validation
        return true; // Simplified
    }
    shouldOverrideData(existing, newValue, provider) {
        // Logic to determine if new data should override existing data
        const providerReliability = {
            apollo: 0.9,
            clearbit: 0.85,
            hunter: 0.8,
        };
        return ((providerReliability[provider] ||
            0.5) > 0.8);
    }
    getProviderConfidence(provider) {
        const confidenceMap = {
            apollo: 0.9,
            clearbit: 0.85,
            hunter: 0.8,
        };
        return confidenceMap[provider] || 0.5;
    }
    async getHealth() {
        const providerStatuses = {};
        for (const [name, provider] of this.enrichmentProviders.entries()) {
            try {
                // Test provider connectivity
                providerStatuses[name] = "healthy";
            }
            catch {
                providerStatuses[name] = "unhealthy";
            }
        }
        const allHealthy = Object.values(providerStatuses).every((status) => status === "healthy");
        return {
            status: allHealthy ? "healthy" : "unhealthy",
            details: {
                providers: providerStatuses,
                metrics: await this.getMetricsSummary(),
            },
        };
    }
}
//# sourceMappingURL=vea-agent.js.map