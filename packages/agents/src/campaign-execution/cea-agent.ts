import { BaseAgent } from "../base/agent.js";
import { AgentConfig, TaskContext, WorkflowTask } from "@iq24/types";
// Note: Logger moved to avoid circular dependency - using console for now
// import { Logger } from '@iq24/ai-core/utils/logger';
import { z } from "zod";

// CEA-specific schemas
const CampaignSequenceSchema = z.object({
  id: z.string(),
  steps: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "email",
        "linkedin",
        "phone_call",
        "sms",
        "wait",
        "conditional",
      ]),
      delayDays: z.number().min(0),
      content: z
        .object({
          subject: z.string().optional(),
          body: z.string(),
          cta: z.string(),
          attachments: z.array(z.string()).optional(),
        })
        .optional(),
      conditions: z
        .object({
          ifOpened: z.boolean().optional(),
          ifClicked: z.boolean().optional(),
          ifReplied: z.boolean().optional(),
          ifBounced: z.boolean().optional(),
        })
        .optional(),
      channel: z.object({
        provider: z.string(),
        fromEmail: z.string().optional(),
        fromName: z.string().optional(),
        linkedinAccountId: z.string().optional(),
      }),
    }),
  ),
  totalDuration: z.number(),
  priority: z.enum(["high", "medium", "low"]),
});

const ExecutionContextSchema = z.object({
  leadId: z.string(),
  campaignId: z.string(),
  sequence: CampaignSequenceSchema,
  personalizedContent: z.array(
    z.object({
      stepId: z.string(),
      variants: z.array(
        z.object({
          id: z.string(),
          content: z.string(),
          subject: z.string().optional(),
          mseoAssets: z.array(z.any()).optional(),
        }),
      ),
    }),
  ),
  leadData: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    company: z.string(),
    timezone: z.string().optional(),
    linkedinUrl: z.string().optional(),
    phone: z.string().optional(),
  }),
  campaignSettings: z.object({
    sendingLimits: z.object({
      emailsPerDay: z.number(),
      linkedinPerDay: z.number(),
      callsPerDay: z.number(),
    }),
    abTestEnabled: z.boolean(),
    respectUnsubscribes: z.boolean(),
    trackingEnabled: z.boolean(),
  }),
});

const ExecutionResultSchema = z.object({
  stepId: z.string(),
  status: z.enum(["scheduled", "sent", "failed", "skipped", "bounced"]),
  timestamp: z.date(),
  channel: z.string(),
  messageId: z.string().optional(),
  errorDetails: z.string().optional(),
  trackingData: z
    .object({
      opens: z.number().default(0),
      clicks: z.number().default(0),
      replies: z.number().default(0),
      unsubscribes: z.number().default(0),
    })
    .optional(),
});

type CampaignSequence = z.infer<typeof CampaignSequenceSchema>;
type ExecutionContext = z.infer<typeof ExecutionContextSchema>;
type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

interface CEAConfig extends AgentConfig {
  channels: {
    email: {
      providers: {
        resend: { apiKey: string; enabled: boolean };
        sendgrid: { apiKey: string; enabled: boolean };
        aws_ses: { apiKey: string; region: string; enabled: boolean };
      };
      defaultFrom: { email: string; name: string };
      trackingDomain: string;
    };
    linkedin: {
      mcp: { endpoint: string; enabled: boolean };
      horizonDataWave: { apiKey: string; enabled: boolean };
      rateLimits: { connectionsPerDay: number; messagesPerDay: number };
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
      ai: { provider: "vapi" | "bland"; apiKey: string; enabled: boolean };
      human: { calendarLink: string; enabled: boolean };
    };
  };
  workflows: {
    temporal: { endpoint: string; namespace: string; enabled: boolean };
    trigger: { apiKey: string; projectId: string; enabled: boolean };
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
export class CampaignExecutionAgent extends BaseAgent {
  private config: CEAConfig;
  private logger: Logger;
  private channelProviders: Map<string, any> = new Map();
  private workflowEngine: any;
  private activeExecutions: Map<string, any> = new Map();

  constructor(config: CEAConfig) {
    super(config);
    this.config = config;
    this.logger = new Logger("CEA");
    this.initializeChannelProviders();
    this.initializeWorkflowEngine();
  }

  private initializeChannelProviders(): void {
    // Initialize email providers
    if (this.config.channels.email.providers.resend.enabled) {
      const { Resend } = require("resend");
      this.channelProviders.set(
        "resend",
        new Resend(this.config.channels.email.providers.resend.apiKey),
      );
    }

    if (this.config.channels.email.providers.sendgrid.enabled) {
      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(this.config.channels.email.providers.sendgrid.apiKey);
      this.channelProviders.set("sendgrid", sgMail);
    }

    // Initialize SMS provider
    if (this.config.channels.sms.twilio.enabled) {
      const twilio = require("twilio");
      const client = twilio(
        this.config.channels.sms.twilio.accountSid,
        this.config.channels.sms.twilio.authToken,
      );
      this.channelProviders.set("twilio", client);
    }

    // Initialize LinkedIn MCP client
    if (this.config.channels.linkedin.mcp.enabled) {
      // Custom MCP client for LinkedIn automation
      this.channelProviders.set("linkedin_mcp", {
        endpoint: this.config.channels.linkedin.mcp.endpoint,
        rateLimits: this.config.channels.linkedin.rateLimits,
      });
    }
  }

  private initializeWorkflowEngine(): void {
    if (this.config.workflows.temporal.enabled) {
      // Initialize Temporal client
      const { Client } = require("@temporalio/client");
      this.workflowEngine = new Client({
        connection: { address: this.config.workflows.temporal.endpoint },
        namespace: this.config.workflows.temporal.namespace,
      });
    } else if (this.config.workflows.trigger.enabled) {
      // Initialize Trigger.dev client
      const { TriggerClient } = require("@trigger.dev/sdk");
      this.workflowEngine = new TriggerClient({
        id: this.config.workflows.trigger.projectId,
        apiKey: this.config.workflows.trigger.apiKey,
      });
    }
  }

  protected async processTask(
    task: WorkflowTask,
    context: TaskContext,
  ): Promise<any> {
    this.logger.info(`Processing CEA task: ${task.type}`, { taskId: task.id });

    try {
      switch (task.type) {
        case "execute_campaign":
          return await this.executeCampaign(task.payload, context);

        case "schedule_sequence":
          return await this.scheduleSequence(task.payload, context);

        case "send_message":
          return await this.sendMessage(task.payload, context);

        case "handle_response":
          return await this.handleResponse(task.payload, context);

        case "update_sequence":
          return await this.updateSequence(task.payload, context);

        case "pause_campaign":
          return await this.pauseCampaign(task.payload, context);

        default:
          throw new Error(`Unknown CEA task type: ${task.type}`);
      }
    } catch (error) {
      this.logger.error("CEA task processing failed", { error, task });
      throw error;
    }
  }

  /**
   * Main campaign execution orchestration
   */
  private async executeCampaign(
    payload: any,
    context: TaskContext,
  ): Promise<{
    executionId: string;
    status: "scheduled" | "running" | "paused" | "completed" | "failed";
    scheduledSteps: ExecutionResult[];
    estimatedCompletion: Date;
  }> {
    const executionContext = ExecutionContextSchema.parse(payload);

    this.logger.info("Starting campaign execution", {
      leadId: executionContext.leadId,
      campaignId: executionContext.campaignId,
      sequenceSteps: executionContext.sequence.steps.length,
    });

    // Generate unique execution ID
    const executionId = `exec_${executionContext.campaignId}_${executionContext.leadId}_${Date.now()}`;

    try {
      // Create durable workflow for campaign execution
      const workflowHandle = await this.createDurableWorkflow(
        executionId,
        executionContext,
      );

      // Store execution in active tracking
      this.activeExecutions.set(executionId, {
        workflowHandle,
        context: executionContext,
        startTime: new Date(),
        status: "running",
      });

      // Schedule all sequence steps
      const scheduledSteps = await this.scheduleSequenceSteps(
        executionContext,
        executionId,
      );

      // Calculate estimated completion
      const estimatedCompletion = this.calculateEstimatedCompletion(
        executionContext.sequence,
      );

      // Update metrics
      this.metrics.increment("campaigns.executed");
      this.metrics.histogram(
        "sequence.steps_count",
        executionContext.sequence.steps.length,
      );

      return {
        executionId,
        status: "running",
        scheduledSteps,
        estimatedCompletion,
      };
    } catch (error) {
      this.logger.error("Campaign execution setup failed", {
        error,
        executionId,
      });
      this.metrics.increment("campaigns.execution_failed");
      throw error;
    }
  }

  /**
   * Creates a durable workflow for campaign execution
   */
  private async createDurableWorkflow(
    executionId: string,
    context: ExecutionContext,
  ): Promise<any> {
    if (this.config.workflows.temporal.enabled) {
      return await this.createTemporalWorkflow(executionId, context);
    } else if (this.config.workflows.trigger.enabled) {
      return await this.createTriggerWorkflow(executionId, context);
    } else {
      throw new Error("No workflow engine configured");
    }
  }

  private async createTemporalWorkflow(
    executionId: string,
    context: ExecutionContext,
  ): Promise<any> {
    // Create Temporal workflow for durable execution
    const workflowId = `campaign-execution-${executionId}`;

    const handle = await this.workflowEngine.workflow.start(
      "campaignExecutionWorkflow",
      {
        args: [context],
        taskQueue: "campaign-execution",
        workflowId,
        searchAttributes: {
          custom_namespace: "iq24-campaigns",
          lead_id: context.leadId,
          campaign_id: context.campaignId,
        },
      },
    );

    this.logger.info("Temporal workflow created", { workflowId, executionId });
    return handle;
  }

  private async createTriggerWorkflow(
    executionId: string,
    context: ExecutionContext,
  ): Promise<any> {
    // Create Trigger.dev job for durable execution
    const job = await this.workflowEngine.sendEvent({
      name: "campaign.execute",
      payload: {
        executionId,
        context,
      },
    });

    this.logger.info("Trigger.dev job created", { jobId: job.id, executionId });
    return job;
  }

  /**
   * Schedules individual sequence steps with proper timing
   */
  private async scheduleSequenceSteps(
    context: ExecutionContext,
    executionId: string,
  ): Promise<ExecutionResult[]> {
    const scheduledSteps: ExecutionResult[] = [];
    let cumulativeDelay = 0;

    for (const [index, step] of context.sequence.steps.entries()) {
      try {
        // Calculate optimal send time considering timezone and business hours
        const scheduledTime = await this.calculateOptimalSendTime(
          step.delayDays + cumulativeDelay,
          context.leadData.timezone,
          step.type,
        );

        // Create execution record
        const executionResult: ExecutionResult = {
          stepId: step.id,
          status: "scheduled",
          timestamp: scheduledTime,
          channel: step.type,
        };

        // Schedule the step execution
        await this.scheduleStepExecution(
          step,
          context,
          scheduledTime,
          executionId,
        );

        scheduledSteps.push(executionResult);
        cumulativeDelay += step.delayDays;

        this.metrics.increment(`steps.scheduled.${step.type}`);
      } catch (error) {
        this.logger.warn(`Failed to schedule step ${step.id}`, {
          error,
          stepId: step.id,
        });

        scheduledSteps.push({
          stepId: step.id,
          status: "failed",
          timestamp: new Date(),
          channel: step.type,
          errorDetails: error.message,
        });
      }
    }

    return scheduledSteps;
  }

  /**
   * Calculates optimal send time based on timezone and channel best practices
   */
  private async calculateOptimalSendTime(
    delayDays: number,
    timezone: string | undefined,
    channelType: string,
  ): Promise<Date> {
    const baseTime = new Date();
    baseTime.setDate(baseTime.getDate() + delayDays);

    // If no timezone provided, use UTC
    if (!timezone) {
      return this.adjustForChannelOptimalTime(baseTime, channelType);
    }

    // Convert to prospect's timezone and find optimal sending window
    const optimalHour = this.getOptimalHourForChannel(channelType);

    // Set time to optimal hour in prospect's timezone
    const targetTime = new Date(baseTime);
    targetTime.setHours(optimalHour, 0, 0, 0);

    // If business hours only is enabled, ensure it's a weekday
    if (this.config.execution.businessHoursOnly) {
      const dayOfWeek = targetTime.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Move to next Monday
        const daysToAdd = dayOfWeek === 0 ? 1 : 2;
        targetTime.setDate(targetTime.getDate() + daysToAdd);
      }
    }

    return targetTime;
  }

  private getOptimalHourForChannel(channelType: string): number {
    // Optimal sending hours based on channel and research
    const optimalHours = {
      email: 10, // 10 AM in prospect's timezone
      linkedin: 9, // 9 AM for LinkedIn messages
      sms: 14, // 2 PM for SMS
      phone_call: 11, // 11 AM for calls
    };

    return optimalHours[channelType as keyof typeof optimalHours] || 10;
  }

  private adjustForChannelOptimalTime(
    baseTime: Date,
    channelType: string,
  ): Date {
    const optimalHour = this.getOptimalHourForChannel(channelType);
    baseTime.setHours(optimalHour, 0, 0, 0);
    return baseTime;
  }

  /**
   * Schedules individual step execution using workflow engine
   */
  private async scheduleStepExecution(
    step: any,
    context: ExecutionContext,
    scheduledTime: Date,
    executionId: string,
  ): Promise<void> {
    const stepExecutionData = {
      stepId: step.id,
      executionId,
      step,
      context,
      scheduledTime,
    };

    if (this.config.workflows.temporal.enabled) {
      // Schedule Temporal activity
      await this.workflowEngine.schedule.create({
        scheduleId: `step-${step.id}-${executionId}`,
        spec: {
          startAt: scheduledTime,
        },
        action: {
          type: "startWorkflow",
          workflowType: "executeStep",
          args: [stepExecutionData],
          taskQueue: "step-execution",
        },
      });
    } else if (this.config.workflows.trigger.enabled) {
      // Schedule Trigger.dev job
      await this.workflowEngine.sendEvent({
        name: "step.execute",
        payload: stepExecutionData,
        delay: scheduledTime,
      });
    }
  }

  /**
   * Executes individual message sending
   */
  private async sendMessage(
    payload: any,
    context: TaskContext,
  ): Promise<ExecutionResult> {
    const { step, executionContext, personalizedContent } = payload;

    this.logger.info(`Sending ${step.type} message`, {
      stepId: step.id,
      leadId: executionContext.leadId,
      channel: step.type,
    });

    try {
      let result: ExecutionResult;

      switch (step.type) {
        case "email":
          result = await this.sendEmail(
            step,
            executionContext,
            personalizedContent,
          );
          break;

        case "linkedin":
          result = await this.sendLinkedInMessage(
            step,
            executionContext,
            personalizedContent,
          );
          break;

        case "sms":
          result = await this.sendSMS(
            step,
            executionContext,
            personalizedContent,
          );
          break;

        case "phone_call":
          result = await this.initiatePhoneCall(
            step,
            executionContext,
            personalizedContent,
          );
          break;

        default:
          throw new Error(`Unsupported message type: ${step.type}`);
      }

      // Update tracking and metrics
      this.metrics.increment(`messages.sent.${step.type}`);
      await this.updateExecutionStatus(payload.executionId, step.id, result);

      return result;
    } catch (error) {
      this.logger.error(`Failed to send ${step.type} message`, {
        error,
        stepId: step.id,
        leadId: executionContext.leadId,
      });

      const failedResult: ExecutionResult = {
        stepId: step.id,
        status: "failed",
        timestamp: new Date(),
        channel: step.type,
        errorDetails: error.message,
      };

      this.metrics.increment(`messages.failed.${step.type}`);
      await this.updateExecutionStatus(
        payload.executionId,
        step.id,
        failedResult,
      );

      return failedResult;
    }
  }

  /**
   * Send email using configured provider
   */
  private async sendEmail(
    step: any,
    context: ExecutionContext,
    personalizedContent: any,
  ): Promise<ExecutionResult> {
    const provider =
      this.channelProviders.get("resend") ||
      this.channelProviders.get("sendgrid");
    if (!provider) {
      throw new Error("No email provider configured");
    }

    // Get personalized content for this step
    const content = this.getPersonalizedContentForStep(
      step.id,
      personalizedContent,
    );

    const emailData = {
      from: `${this.config.channels.email.defaultFrom.name} <${this.config.channels.email.defaultFrom.email}>`,
      to: context.leadData.email,
      subject: content.subject || step.content?.subject || "Quick question",
      html: this.addTrackingPixels(
        content.content || step.content?.body || "",
        step.id,
      ),
      text: this.stripHtml(content.content || step.content?.body || ""),
    };

    if (this.channelProviders.has("resend")) {
      const result = await provider.emails.send(emailData);
      return {
        stepId: step.id,
        status: "sent",
        timestamp: new Date(),
        channel: "email",
        messageId: result.data?.id,
      };
    } else {
      // SendGrid implementation
      await provider.send(emailData);
      return {
        stepId: step.id,
        status: "sent",
        timestamp: new Date(),
        channel: "email",
      };
    }
  }

  /**
   * Send LinkedIn message via MCP
   */
  private async sendLinkedInMessage(
    step: any,
    context: ExecutionContext,
    personalizedContent: any,
  ): Promise<ExecutionResult> {
    const linkedinProvider = this.channelProviders.get("linkedin_mcp");
    if (!linkedinProvider) {
      throw new Error("LinkedIn MCP provider not configured");
    }

    const content = this.getPersonalizedContentForStep(
      step.id,
      personalizedContent,
    );

    // Call LinkedIn MCP service
    const messageData = {
      recipientLinkedInUrl: context.leadData.linkedinUrl,
      message: content.content || step.content?.body,
      connectionRequest: step.type === "linkedin_connect",
    };

    // Simulate MCP call (replace with actual MCP integration)
    const response = await this.callLinkedInMCP(messageData);

    return {
      stepId: step.id,
      status: "sent",
      timestamp: new Date(),
      channel: "linkedin",
      messageId: response.messageId,
    };
  }

  /**
   * Send SMS using Twilio
   */
  private async sendSMS(
    step: any,
    context: ExecutionContext,
    personalizedContent: any,
  ): Promise<ExecutionResult> {
    const twilioClient = this.channelProviders.get("twilio");
    if (!twilioClient) {
      throw new Error("Twilio SMS provider not configured");
    }

    if (!context.leadData.phone) {
      throw new Error("No phone number available for SMS");
    }

    const content = this.getPersonalizedContentForStep(
      step.id,
      personalizedContent,
    );

    const message = await twilioClient.messages.create({
      body: content.content || step.content?.body,
      from: this.config.channels.sms.twilio.fromNumber,
      to: context.leadData.phone,
    });

    return {
      stepId: step.id,
      status: "sent",
      timestamp: new Date(),
      channel: "sms",
      messageId: message.sid,
    };
  }

  /**
   * Initiate phone call using AI or human calendar booking
   */
  private async initiatePhoneCall(
    step: any,
    context: ExecutionContext,
    personalizedContent: any,
  ): Promise<ExecutionResult> {
    if (this.config.channels.phone.ai.enabled) {
      // AI-powered call using VAPI or Bland AI
      return await this.initiateAICall(step, context, personalizedContent);
    } else if (this.config.channels.phone.human.enabled) {
      // Send calendar booking link
      return await this.sendCalendarLink(step, context, personalizedContent);
    } else {
      throw new Error("No phone call method configured");
    }
  }

  /**
   * Handle inbound responses and engagement events
   */
  private async handleResponse(
    payload: any,
    context: TaskContext,
  ): Promise<{
    action: "continue" | "pause" | "modify" | "escalate";
    nextSteps: string[];
    updates: Record<string, any>;
  }> {
    const { executionId, responseType, responseData } = payload;

    this.logger.info("Handling response", { executionId, responseType });

    // Update engagement tracking
    await this.updateEngagementMetrics(executionId, responseType, responseData);

    // Determine next action based on response type
    let action: "continue" | "pause" | "modify" | "escalate" = "continue";
    const nextSteps: string[] = [];
    const updates: Record<string, any> = {};

    switch (responseType) {
      case "email_reply":
        action = "pause"; // Pause sequence for human review
        nextSteps.push("notify_sales_rep", "schedule_follow_up");
        updates.status = "engaged";
        break;

      case "email_unsubscribe":
        action = "pause";
        nextSteps.push("remove_from_all_sequences", "update_suppression_list");
        updates.status = "unsubscribed";
        break;

      case "email_bounce":
        action = "modify";
        nextSteps.push("update_email_status", "try_linkedin");
        updates.emailStatus = "invalid";
        break;

      case "linkedin_connection_accepted":
        action = "continue";
        nextSteps.push("proceed_to_next_step");
        updates.linkedinStatus = "connected";
        break;

      default:
        action = "continue";
    }

    this.metrics.increment(`responses.handled.${responseType}`);
    return { action, nextSteps, updates };
  }

  // Helper methods
  private getPersonalizedContentForStep(
    stepId: string,
    personalizedContent: any,
  ): any {
    const stepContent = personalizedContent.find(
      (content: any) => content.stepId === stepId,
    );
    if (!stepContent || !stepContent.variants.length) {
      return { content: "", subject: "" };
    }

    // Use A/B testing to select variant
    const variant =
      this.config.execution.maxConcurrentCampaigns > 1
        ? stepContent.variants[
            Math.floor(Math.random() * stepContent.variants.length)
          ]
        : stepContent.variants[0];

    return variant;
  }

  private addTrackingPixels(htmlContent: string, stepId: string): string {
    if (!this.config.tracking.pixelTracking) return htmlContent;

    const trackingPixel = `<img src="${this.config.tracking.webhookUrl}/pixel/${stepId}" width="1" height="1" style="display:none;" />`;
    return htmlContent + trackingPixel;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "");
  }

  private async callLinkedInMCP(messageData: any): Promise<any> {
    // Placeholder for LinkedIn MCP integration
    this.logger.info("Calling LinkedIn MCP", messageData);
    return { messageId: `li_${Date.now()}`, status: "sent" };
  }

  private async initiateAICall(
    step: any,
    context: ExecutionContext,
    personalizedContent: any,
  ): Promise<ExecutionResult> {
    // Placeholder for AI call integration
    return {
      stepId: step.id,
      status: "sent",
      timestamp: new Date(),
      channel: "phone_call",
      messageId: `ai_call_${Date.now()}`,
    };
  }

  private async sendCalendarLink(
    step: any,
    context: ExecutionContext,
    personalizedContent: any,
  ): Promise<ExecutionResult> {
    // Send email with calendar booking link
    const calendarContent = {
      subject: "Quick call?",
      content: `Hi ${context.leadData.firstName}, would you be open to a brief call? Here's my calendar: ${this.config.channels.phone.human.calendarLink}`,
    };

    return await this.sendEmail(
      {
        ...step,
        content: calendarContent,
      },
      context,
      personalizedContent,
    );
  }

  private calculateEstimatedCompletion(sequence: CampaignSequence): Date {
    const totalDays = sequence.steps.reduce(
      (sum, step) => sum + step.delayDays,
      0,
    );
    const completion = new Date();
    completion.setDate(completion.getDate() + totalDays);
    return completion;
  }

  private async updateExecutionStatus(
    executionId: string,
    stepId: string,
    result: ExecutionResult,
  ): Promise<void> {
    // Update execution tracking in database
    this.logger.info("Updating execution status", {
      executionId,
      stepId,
      status: result.status,
    });

    // This would typically update Supabase database
    // await this.supabase.from('campaign_executions').update({
    //   step_results: result
    // }).eq('execution_id', executionId);
  }

  private async updateEngagementMetrics(
    executionId: string,
    responseType: string,
    responseData: any,
  ): Promise<void> {
    // Update engagement metrics for AFLA analysis
    this.metrics.increment(`engagement.${responseType}`);

    // Store detailed engagement data
    this.logger.info("Engagement event recorded", {
      executionId,
      responseType,
      timestamp: new Date(),
    });
  }

  async getHealth(): Promise<{
    status: "healthy" | "unhealthy";
    details: Record<string, any>;
  }> {
    const providerStatuses = {};

    for (const [name, provider] of this.channelProviders.entries()) {
      try {
        // Test provider connectivity
        providerStatuses[name] = "healthy";
      } catch {
        providerStatuses[name] = "unhealthy";
      }
    }

    const workflowEngineStatus = this.workflowEngine ? "healthy" : "unhealthy";
    const allHealthy =
      Object.values(providerStatuses).every((status) => status === "healthy") &&
      workflowEngineStatus === "healthy";

    return {
      status: allHealthy ? "healthy" : "unhealthy",
      details: {
        channelProviders: providerStatuses,
        workflowEngine: workflowEngineStatus,
        activeExecutions: this.activeExecutions.size,
        metrics: await this.getMetricsSummary(),
      },
    };
  }
}
