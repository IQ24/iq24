import { BaseAgent } from "../base/agent.js";
import { AgentConfig, TaskContext, WorkflowTask } from "@iq24/types";
interface CEAConfig extends AgentConfig {
    channels: {
        email: {
            providers: {
                resend: {
                    apiKey: string;
                    enabled: boolean;
                };
                sendgrid: {
                    apiKey: string;
                    enabled: boolean;
                };
                aws_ses: {
                    apiKey: string;
                    region: string;
                    enabled: boolean;
                };
            };
            defaultFrom: {
                email: string;
                name: string;
            };
            trackingDomain: string;
        };
        linkedin: {
            mcp: {
                endpoint: string;
                enabled: boolean;
            };
            horizonDataWave: {
                apiKey: string;
                enabled: boolean;
            };
            rateLimits: {
                connectionsPerDay: number;
                messagesPerDay: number;
            };
        };
        sms: {
            twilio: {
                accountSid: string;
                authToken: string;
                fromNumber: string;
                enabled: boolean;
            };
        };
        phone: {
            ai: {
                provider: "vapi" | "bland";
                apiKey: string;
                enabled: boolean;
            };
            human: {
                calendarLink: string;
                enabled: boolean;
            };
        };
    };
    workflows: {
        temporal: {
            endpoint: string;
            namespace: string;
            enabled: boolean;
        };
        trigger: {
            apiKey: string;
            projectId: string;
            enabled: boolean;
        };
    };
    execution: {
        maxConcurrentCampaigns: number;
        retryAttempts: number;
        timeoutMinutes: number;
        respectTimezones: boolean;
        businessHoursOnly: boolean;
    };
    tracking: {
        webhookUrl: string;
        pixelTracking: boolean;
        linkTracking: boolean;
        engagementWebhooks: boolean;
    };
}
/**
 * Campaign Execution Agent (CEA)
 *
 * Responsibilities:
 * - Executes predefined or dynamically adjusted outreach sequences
 * - Schedules messages based on optimal timing and prospect timezones
 * - Manages communication across multiple channels (Email, SMS, LinkedIn)
 * - Performs A/B testing on message variations as directed by ALO/AFLA
 * - Handles basic response routing and updates engagement status
 * - Integrates with durable workflow engines (Temporal.io/Trigger.dev)
 */
export declare class CampaignExecutionAgent extends BaseAgent {
    private config;
    private logger;
    private channelProviders;
    private workflowEngine;
    private activeExecutions;
    constructor(config: CEAConfig);
    private initializeChannelProviders;
    private initializeWorkflowEngine;
    protected processTask(task: WorkflowTask, context: TaskContext): Promise<any>;
    /**
     * Main campaign execution orchestration
     */
    private executeCampaign;
    /**
     * Creates a durable workflow for campaign execution
     */
    private createDurableWorkflow;
    private createTemporalWorkflow;
    private createTriggerWorkflow;
    /**
     * Schedules individual sequence steps with proper timing
     */
    private scheduleSequenceSteps;
    /**
     * Calculates optimal send time based on timezone and channel best practices
     */
    private calculateOptimalSendTime;
    private getOptimalHourForChannel;
    private adjustForChannelOptimalTime;
    /**
     * Schedules individual step execution using workflow engine
     */
    private scheduleStepExecution;
    /**
     * Executes individual message sending
     */
    private sendMessage;
    /**
     * Send email using configured provider
     */
    private sendEmail;
    /**
     * Send LinkedIn message via MCP
     */
    private sendLinkedInMessage;
    /**
     * Send SMS using Twilio
     */
    private sendSMS;
    /**
     * Initiate phone call using AI or human calendar booking
     */
    private initiatePhoneCall;
    /**
     * Handle inbound responses and engagement events
     */
    private handleResponse;
    private getPersonalizedContentForStep;
    private addTrackingPixels;
    private stripHtml;
    private callLinkedInMCP;
    private initiateAICall;
    private sendCalendarLink;
    private calculateEstimatedCompletion;
    private updateExecutionStatus;
    private updateEngagementMetrics;
    getHealth(): Promise<{
        status: "healthy" | "unhealthy";
        details: Record<string, any>;
    }>;
}
export {};
//# sourceMappingURL=cea-agent.d.ts.map