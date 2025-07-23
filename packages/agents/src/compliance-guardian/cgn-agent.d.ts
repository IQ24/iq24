import { BaseAgent } from "../base/agent.js";
import { WorkflowContext, TaskDefinition, TaskResult } from "@iq24/ai-core/types";
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
export declare class ComplianceGuardianAgent extends BaseAgent {
    private systemMonitoring;
    private complianceRules;
    private regulatoryWatchdog;
    private auditLogger;
    constructor();
    executeTask(task: TaskDefinition, context: WorkflowContext): Promise<TaskResult>;
    /**
     * Screen content for compliance violations before sending
     */
    private screenContent;
    /**
     * Manage consent records and opt-in/opt-out processes
     */
    private manageConsent;
    /**
     * Log actions to immutable audit trail
     */
    private auditAction;
    /**
     * Perform comprehensive compliance check
     */
    private checkCompliance;
    /**
     * Update compliance rules based on regulatory changes
     */
    private updateRegulations;
    /**
     * Generate comprehensive compliance report
     */
    private generateComplianceReport;
    /**
     * Assess data protection compliance (GDPR, CCPA)
     */
    private assessDataProtection;
    /**
     * Handle data subject requests (GDPR Article 15, CCPA)
     */
    private handleDataRequest;
    private initializeComplianceRules;
    private getApplicableRules;
    private runComplianceCheck;
    private getGDPRRules;
    private getCCPARules;
    private getCANSPAMRules;
    private getCASLRules;
    private generateContentId;
    private generateAuditId;
    private calculateAuditHash;
    private isEULocation;
    private isCaliforniaLocation;
    private isUSLocation;
    private isCanadaLocation;
}
//# sourceMappingURL=cgn-agent.d.ts.map