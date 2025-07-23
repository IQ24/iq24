import { BaseAgent } from "../base/agent.js";
import { logger } from "@iq24/ai-core/utils/logger";
import { SystemMonitoring } from "@iq24/ai-core/services";
import * as nlp from "natural";
import { createHash } from "crypto";
/**
 * Compliance Guardian Network (CGN)
 *
 * Responsibilities:
 * - Pre-screen all outreach content for compliance risks
 * - Manage consent data and opt-in/opt-out processes
 * - Maintain immutable audit trails for regulatory compliance
 * - Monitor and adapt to regulatory changes (GDPR, CCPA, CAN-SPAM, etc.)
 * - Prevent non-compliant messages from being sent
 * - Generate compliance reports and assessments
 * - Ensure data protection and privacy compliance
 */
export class ComplianceGuardianAgent extends BaseAgent {
    constructor() {
        const metadata = {
            name: "Compliance Guardian Network",
            version: "1.0.0",
            description: "Proactive compliance monitoring and enforcement for global data protection and marketing regulations",
            capabilities: [
                "content-compliance-screening",
                "consent-management",
                "audit-trail-generation",
                "regulatory-monitoring",
                "privacy-protection",
                "gdpr-compliance",
                "ccpa-compliance",
                "can-spam-compliance",
                "violation-prevention",
                "compliance-reporting",
            ],
            dependencies: [
                "supabase",
                "system-monitoring",
                "nlp-models",
                "regulatory-api",
            ],
            requiredConfig: [
                "COMPLIANCE_DATABASE_URL",
                "AUDIT_LOG_CONFIG",
                "REGULATORY_API_KEY",
                "PRIVACY_SETTINGS",
            ],
        };
        super("cgn", metadata);
        this.complianceRules = new Map();
        this.systemMonitoring = new SystemMonitoring();
        this.regulatoryWatchdog = new RegulatoryWatchdog();
        this.auditLogger = new AuditLogger();
        this.initializeComplianceRules();
    }
    async executeTask(task, context) {
        const { taskType, payload } = task;
        try {
            this.metrics.taskStarted(taskType);
            switch (taskType) {
                case "screen-content":
                    return await this.screenContent(payload, context);
                case "manage-consent":
                    return await this.manageConsent(payload, context);
                case "audit-action":
                    return await this.auditAction(payload, context);
                case "check-compliance":
                    return await this.checkCompliance(payload, context);
                case "update-regulations":
                    return await this.updateRegulations(payload, context);
                case "generate-compliance-report":
                    return await this.generateComplianceReport(payload, context);
                case "assess-data-protection":
                    return await this.assessDataProtection(payload, context);
                case "handle-data-request":
                    return await this.handleDataRequest(payload, context);
                default:
                    throw new Error(`Unknown task type: ${taskType}`);
            }
        }
        catch (error) {
            this.metrics.taskFailed(taskType, error);
            throw error;
        }
        finally {
            this.metrics.taskCompleted(taskType);
        }
    }
    /**
     * Screen content for compliance violations before sending
     */
    async screenContent(payload, context) {
        logger.info("Screening content for compliance", {
            messageType: payload.messageType,
            recipientLocation: payload.recipientLocation,
        });
        const complianceCheck = {
            contentId: this.generateContentId(payload.content),
            content: payload.content,
            messageType: payload.messageType,
            recipientLocation: payload.recipientLocation,
            campaignId: payload.campaignId,
            timestamp: new Date(),
            checks: [],
            overallStatus: "pending",
            violations: [],
            recommendations: [],
        };
        // Get applicable compliance rules based on recipient location and message type
        const applicableRules = this.getApplicableRules(payload.recipientLocation, payload.messageType);
        // Run all compliance checks
        for (const rule of applicableRules) {
            const checkResult = await this.runComplianceCheck(payload.content, rule);
            complianceCheck.checks.push(checkResult);
            if (checkResult.status === "violation") {
                complianceCheck.violations.push({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    severity: rule.severity,
                    description: checkResult.description,
                    recommendation: checkResult.recommendation,
                    regulationType: rule.regulationType,
                });
            }
        }
        // Determine overall compliance status
        complianceCheck.overallStatus = this.determineOverallStatus(complianceCheck.checks);
        // Generate recommendations for violations
        if (complianceCheck.violations.length > 0) {
            complianceCheck.recommendations =
                await this.generateComplianceRecommendations(complianceCheck.violations, payload.content);
        }
        // Log compliance check to audit trail
        await this.auditLogger.logComplianceCheck(complianceCheck);
        // If there are blocking violations, prevent content from being sent
        const blockingViolations = complianceCheck.violations.filter((v) => v.severity === "critical");
        const approved = blockingViolations.length === 0;
        return {
            success: true,
            data: {
                approved,
                complianceCheck,
                blockingViolations,
                requiresReview: complianceCheck.violations.some((v) => v.severity === "high"),
            },
            metadata: {
                checksPerformed: complianceCheck.checks.length,
                violationsFound: complianceCheck.violations.length,
                processingTime: Date.now() - context.startTime,
            },
        };
    }
    /**
     * Manage consent records and opt-in/opt-out processes
     */
    async manageConsent(payload, context) {
        logger.info("Managing consent", {
            action: payload.action,
            prospectId: payload.prospectId,
            consentType: payload.consentType,
        });
        const consentRecord = {
            prospectId: payload.prospectId,
            email: payload.email,
            consentType: payload.consentType,
            action: payload.action,
            timestamp: new Date(),
            source: payload.source || "system",
            ipAddress: payload.ipAddress,
            userAgent: payload.userAgent,
            verified: false,
            expiryDate: this.calculateConsentExpiry(payload.consentType),
        };
        let result = {};
        switch (payload.action) {
            case "opt-in":
                result = await this.processOptIn(consentRecord);
                break;
            case "opt-out":
                result = await this.processOptOut(consentRecord);
                break;
            case "check-consent":
                result = await this.checkConsentStatus(payload.prospectId, payload.consentType);
                break;
            case "update-consent":
                result = await this.updateConsent(consentRecord);
                break;
        }
        // Log consent action to audit trail
        await this.auditLogger.logConsentAction(consentRecord);
        // Update compliance database
        await this.updateConsentDatabase(consentRecord);
        // Check if action affects any active campaigns
        await this.checkCampaignImpact(payload.prospectId, payload.action);
        return {
            success: true,
            data: {
                consentRecord,
                result,
                auditTrailId: await this.auditLogger.getLastAuditId(),
            },
        };
    }
    /**
     * Log actions to immutable audit trail
     */
    async auditAction(payload, context) {
        logger.info("Creating audit trail entry", {
            action: payload.action,
            entityType: payload.entityType,
        });
        const auditTrail = {
            id: this.generateAuditId(),
            timestamp: new Date(),
            action: payload.action,
            entityType: payload.entityType,
            entityId: payload.entityId,
            userId: payload.userId || "system",
            workflowId: context.workflowId,
            metadata: payload.metadata,
            hash: "", // Will be calculated
            previousHash: await this.auditLogger.getLastAuditHash(),
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            sensitive: payload.sensitive || false,
        };
        // Calculate hash for integrity
        auditTrail.hash = this.calculateAuditHash(auditTrail);
        // Store in immutable audit log
        const stored = await this.auditLogger.storeAuditTrail(auditTrail);
        // Verify integrity
        const integrityCheck = await this.auditLogger.verifyIntegrity(auditTrail.id);
        return {
            success: true,
            data: {
                auditTrailId: auditTrail.id,
                hash: auditTrail.hash,
                integrityVerified: integrityCheck,
                stored,
            },
        };
    }
    /**
     * Perform comprehensive compliance check
     */
    async checkCompliance(payload, context) {
        logger.info("Performing compliance check", {
            campaignId: payload.campaignId,
            scope: payload.scope,
        });
        const complianceResults = {
            campaignId: payload.campaignId,
            scope: payload.scope,
            timestamp: new Date(),
            overallStatus: "compliant",
            checks: [],
            violations: [],
            warnings: [],
            recommendations: [],
        };
        // Check campaign-level compliance
        if (payload.scope === "campaign" || payload.scope === "campaign") {
            const campaignCheck = await this.checkCampaignCompliance(payload.campaignId);
            complianceResults.checks.push(campaignCheck);
        }
        // Check prospect-level compliance (consent, data protection)
        if (payload.prospects &&
            (payload.scope === "prospect" || payload.scope === "campaign")) {
            for (const prospect of payload.prospects) {
                const prospectCheck = await this.checkProspectCompliance(prospect);
                complianceResults.checks.push(prospectCheck);
                if (prospectCheck.violations) {
                    complianceResults.violations.push(...prospectCheck.violations);
                }
            }
        }
        // Check content-level compliance
        if (payload.content &&
            (payload.scope === "content" || payload.scope === "campaign")) {
            for (const content of payload.content) {
                const contentCheck = await this.screenContent({
                    content: content.text,
                    messageType: content.type,
                    recipientLocation: content.recipientLocation || "US",
                    campaignId: payload.campaignId,
                }, context);
                complianceResults.checks.push(contentCheck.data);
                if (contentCheck.data?.complianceCheck?.violations) {
                    complianceResults.violations.push(...contentCheck.data.complianceCheck.violations);
                }
            }
        }
        // Determine overall status
        complianceResults.overallStatus =
            this.determineOverallComplianceStatus(complianceResults);
        // Generate comprehensive recommendations
        complianceResults.recommendations =
            await this.generateComprehensiveRecommendations(complianceResults);
        return {
            success: true,
            data: complianceResults,
            metadata: {
                totalChecks: complianceResults.checks.length,
                violationCount: complianceResults.violations.length,
                warningCount: complianceResults.warnings.length,
            },
        };
    }
    /**
     * Update compliance rules based on regulatory changes
     */
    async updateRegulations(payload, context) {
        logger.info("Updating regulatory compliance rules", {
            source: payload.source,
            updateCount: payload.updates.length,
        });
        const updateResults = {
            processed: 0,
            successful: 0,
            failed: 0,
            newRules: 0,
            modifiedRules: 0,
            errors: [],
        };
        for (const update of payload.updates) {
            try {
                updateResults.processed++;
                const result = await this.processRegulatoryUpdate(update);
                if (result.success) {
                    updateResults.successful++;
                    if (result.isNewRule) {
                        updateResults.newRules++;
                    }
                    else {
                        updateResults.modifiedRules++;
                    }
                }
                else {
                    updateResults.failed++;
                    updateResults.errors.push({
                        updateId: update.id,
                        error: result.error,
                    });
                }
            }
            catch (error) {
                updateResults.failed++;
                updateResults.errors.push({
                    updateId: update.id,
                    error: error.message,
                });
            }
        }
        // Log regulatory update to audit trail
        await this.auditLogger.logRegulatoryUpdate({
            source: payload.source,
            updates: payload.updates,
            results: updateResults,
            timestamp: new Date(),
        });
        // Notify system of compliance rule changes
        await this.systemMonitoring.notifyRuleChanges(updateResults);
        return {
            success: updateResults.failed === 0,
            data: updateResults,
            metadata: {
                totalUpdates: payload.updates.length,
                successRate: updateResults.successful / updateResults.processed,
            },
        };
    }
    /**
     * Generate comprehensive compliance report
     */
    async generateComplianceReport(payload, context) {
        logger.info("Generating compliance report", {
            scope: payload.scope,
            reportType: payload.reportType,
        });
        const report = {
            id: this.generateReportId(),
            timestamp: new Date(),
            timeRange: payload.timeRange,
            scope: payload.scope,
            reportType: payload.reportType,
            summary: await this.generateComplianceSummary(payload.timeRange, payload.scope),
            violations: await this.getViolationsInRange(payload.timeRange, payload.scope),
            auditTrail: payload.reportType === "audit"
                ? await this.getAuditTrail(payload.timeRange)
                : undefined,
            consentAnalysis: await this.analyzeConsentTrends(payload.timeRange),
            riskAssessment: await this.assessComplianceRisk(),
            recommendations: payload.includeRecommendations
                ? await this.generateReportRecommendations()
                : undefined,
            dataProtectionStatus: await this.assessDataProtectionCompliance(),
            regulatoryAlignment: await this.assessRegulatoryAlignment(),
        };
        // Store report for future reference
        await this.storeComplianceReport(report);
        return {
            success: true,
            data: report,
            metadata: {
                reportSize: JSON.stringify(report).length,
                violationsAnalyzed: report.violations.length,
                auditEntriesIncluded: report.auditTrail?.length || 0,
            },
        };
    }
    /**
     * Assess data protection compliance (GDPR, CCPA)
     */
    async assessDataProtection(payload, context) {
        logger.info("Assessing data protection compliance", {
            dataType: payload.dataType,
            assessmentType: payload.assessmentType,
        });
        const assessment = {
            id: this.generateAssessmentId(),
            timestamp: new Date(),
            dataType: payload.dataType,
            scope: payload.scope,
            assessmentType: payload.assessmentType,
            findings: [],
            riskLevel: "low",
            complianceScore: 0,
            recommendations: [],
        };
        switch (payload.assessmentType) {
            case "privacy-impact":
                assessment.findings =
                    await this.conductPrivacyImpactAssessment(payload);
                break;
            case "data-mapping":
                assessment.findings = await this.conductDataMappingAssessment(payload);
                break;
            case "consent-audit":
                assessment.findings = await this.conductConsentAudit(payload);
                break;
        }
        // Calculate compliance score and risk level
        assessment.complianceScore = this.calculateComplianceScore(assessment.findings);
        assessment.riskLevel = this.determineRiskLevel(assessment.complianceScore, assessment.findings);
        // Generate targeted recommendations
        assessment.recommendations =
            await this.generateDataProtectionRecommendations(assessment);
        return {
            success: true,
            data: assessment,
            metadata: {
                findingsCount: assessment.findings.length,
                complianceScore: assessment.complianceScore,
                riskLevel: assessment.riskLevel,
            },
        };
    }
    /**
     * Handle data subject requests (GDPR Article 15, CCPA)
     */
    async handleDataRequest(payload, context) {
        logger.info("Handling data subject request", {
            requestType: payload.requestType,
            subjectId: payload.subjectId,
        });
        // Verify the request authenticity
        const verificationResult = await this.verifyDataRequest(payload);
        if (!verificationResult.verified) {
            return {
                success: false,
                error: "Request verification failed",
                data: { verificationResult },
            };
        }
        let requestResult = {};
        switch (payload.requestType) {
            case "access":
                requestResult = await this.processDataAccessRequest(payload);
                break;
            case "portability":
                requestResult = await this.processDataPortabilityRequest(payload);
                break;
            case "deletion":
                requestResult = await this.processDataDeletionRequest(payload);
                break;
            case "rectification":
                requestResult = await this.processDataRectificationRequest(payload);
                break;
            case "restriction":
                requestResult = await this.processDataRestrictionRequest(payload);
                break;
        }
        // Log data request to audit trail
        await this.auditLogger.logDataRequest({
            requestType: payload.requestType,
            subjectId: payload.subjectId,
            email: payload.email,
            result: requestResult,
            timestamp: new Date(),
            processingTime: Date.now() - context.startTime,
        });
        return {
            success: true,
            data: {
                requestId: requestResult.requestId,
                status: requestResult.status,
                estimatedCompletionTime: requestResult.estimatedCompletionTime,
                nextSteps: requestResult.nextSteps,
            },
        };
    }
    // Helper methods for compliance rule management
    initializeComplianceRules() {
        // Initialize base compliance rules for different regulations
        this.complianceRules.set("GDPR", this.getGDPRRules());
        this.complianceRules.set("CCPA", this.getCCPARules());
        this.complianceRules.set("CAN-SPAM", this.getCANSPAMRules());
        this.complianceRules.set("CASL", this.getCASLRules());
    }
    getApplicableRules(location, messageType) {
        const rules = [];
        // Add location-based rules
        if (this.isEULocation(location)) {
            rules.push(...(this.complianceRules.get("GDPR") || []));
        }
        if (this.isCaliforniaLocation(location)) {
            rules.push(...(this.complianceRules.get("CCPA") || []));
        }
        if (this.isUSLocation(location)) {
            rules.push(...(this.complianceRules.get("CAN-SPAM") || []));
        }
        if (this.isCanadaLocation(location)) {
            rules.push(...(this.complianceRules.get("CASL") || []));
        }
        // Filter by message type
        return rules.filter((rule) => rule.applicableChannels.includes(messageType) ||
            rule.applicableChannels.includes("all"));
    }
    async runComplianceCheck(content, rule) {
        // Implementation for running individual compliance checks
        const tokens = nlp.WordTokenizer.tokenize(content.toLowerCase());
        let violations = 0;
        let matches = [];
        // Check for prohibited terms
        if (rule.prohibitedTerms) {
            for (const term of rule.prohibitedTerms) {
                if (content.toLowerCase().includes(term.toLowerCase())) {
                    violations++;
                    matches.push(term);
                }
            }
        }
        // Check for required elements (like unsubscribe links)
        if (rule.requiredElements) {
            for (const element of rule.requiredElements) {
                if (!this.checkRequiredElement(content, element)) {
                    violations++;
                    matches.push(`Missing: ${element.name}`);
                }
            }
        }
        return {
            ruleId: rule.id,
            ruleName: rule.name,
            status: violations > 0 ? "violation" : "compliant",
            violations,
            matches,
            description: violations > 0
                ? `Found ${violations} compliance issues`
                : "Content is compliant",
            recommendation: violations > 0 ? rule.recommendation : undefined,
        };
    }
    // Helper methods for specific regulations
    getGDPRRules() {
        return [
            {
                id: "gdpr-consent-required",
                name: "GDPR Consent Requirement",
                description: "Ensure explicit consent before processing personal data",
                regulationType: "GDPR",
                severity: "critical",
                applicableChannels: ["email", "sms", "all"],
                requiredElements: [
                    {
                        name: "consent_verification",
                        pattern: /consent|permission|agreed/i,
                    },
                ],
                recommendation: "Verify explicit consent before sending communications",
            },
            {
                id: "gdpr-unsubscribe-required",
                name: "GDPR Right to Withdraw",
                description: "Provide easy way to withdraw consent",
                regulationType: "GDPR",
                severity: "high",
                applicableChannels: ["email"],
                requiredElements: [
                    {
                        name: "unsubscribe_link",
                        pattern: /unsubscribe|opt.out|withdraw/i,
                    },
                ],
                recommendation: "Include clear unsubscribe mechanism",
            },
        ];
    }
    getCCPARules() {
        return [
            {
                id: "ccpa-opt-out-required",
                name: "CCPA Opt-Out Requirement",
                description: "Provide opt-out mechanism for California residents",
                regulationType: "CCPA",
                severity: "high",
                applicableChannels: ["email", "sms"],
                requiredElements: [
                    { name: "opt_out_mechanism", pattern: /opt.out|do not sell/i },
                ],
                recommendation: "Include CCPA compliant opt-out mechanism",
            },
        ];
    }
    getCANSPAMRules() {
        return [
            {
                id: "can-spam-identification",
                name: "CAN-SPAM Sender Identification",
                description: "Clearly identify the sender",
                regulationType: "CAN-SPAM",
                severity: "high",
                applicableChannels: ["email"],
                requiredElements: [
                    { name: "sender_identification", pattern: /from:|sender:|company:/i },
                ],
                recommendation: "Clearly identify the sender organization",
            },
            {
                id: "can-spam-subject-line",
                name: "CAN-SPAM Subject Line Truthfulness",
                description: "Subject line must not be deceptive",
                regulationType: "CAN-SPAM",
                severity: "high",
                applicableChannels: ["email"],
                prohibitedTerms: ["free money", "guaranteed winner", "act now"],
                recommendation: "Use truthful, non-deceptive subject lines",
            },
        ];
    }
    getCASLRules() {
        return [
            {
                id: "casl-consent-required",
                name: "CASL Express Consent",
                description: "Require express consent for commercial electronic messages",
                regulationType: "CASL",
                severity: "critical",
                applicableChannels: ["email", "sms"],
                requiredElements: [
                    { name: "express_consent", pattern: /consent|permission|subscribe/i },
                ],
                recommendation: "Obtain express consent before sending commercial messages",
            },
        ];
    }
    // Additional helper methods...
    generateContentId(content) {
        return createHash("sha256").update(content).digest("hex").substring(0, 16);
    }
    generateAuditId() {
        return `audit_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }
    calculateAuditHash(auditTrail) {
        const data = `${auditTrail.timestamp}${auditTrail.action}${auditTrail.entityId}${auditTrail.previousHash}`;
        return createHash("sha256").update(data).digest("hex");
    }
    isEULocation(location) {
        const euCountries = [
            "DE",
            "FR",
            "IT",
            "ES",
            "NL",
            "BE",
            "AT",
            "PT",
            "IE",
            "GR" /* ... */,
        ];
        return euCountries.includes(location.toUpperCase());
    }
    isCaliforniaLocation(location) {
        return (location.toLowerCase().includes("ca") ||
            location.toLowerCase().includes("california"));
    }
    isUSLocation(location) {
        return (location.toLowerCase().includes("us") ||
            location.toLowerCase().includes("usa"));
    }
    isCanadaLocation(location) {
        return (location.toLowerCase().includes("ca") ||
            location.toLowerCase().includes("canada"));
    }
}
// Supporting classes
class RegulatoryWatchdog {
    async getLatestUpdates() {
        // Implementation for monitoring regulatory changes
        return [];
    }
}
class AuditLogger {
    async logComplianceCheck(check) {
        // Implementation for logging compliance checks
    }
    async logConsentAction(record) {
        // Implementation for logging consent actions
    }
    async storeAuditTrail(trail) {
        // Implementation for storing immutable audit trails
        return true;
    }
    async verifyIntegrity(auditId) {
        // Implementation for verifying audit trail integrity
        return true;
    }
    async getLastAuditHash() {
        // Implementation for getting last audit hash for chain integrity
        return "";
    }
    async getLastAuditId() {
        // Implementation for getting last audit ID
        return "";
    }
    async logRegulatoryUpdate(update) {
        // Implementation for logging regulatory updates
    }
    async logDataRequest(request) {
        // Implementation for logging data subject requests
    }
}
//# sourceMappingURL=cgn-agent.js.map