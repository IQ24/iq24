/**
 * IQ24.ai Database Client
 * Centralized database access layer with type safety and connection management
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getConfig } from '../config';
import type { Database } from './types';

let supabaseClient: SupabaseClient<Database> | null = null;
let supabaseServiceClient: SupabaseClient<Database> | null = null;

/**
 * Get the public Supabase client (with RLS enabled)
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    const config = getConfig();
    supabaseClient = createClient<Database>(
      config.database.supabaseUrl,
      config.database.supabaseAnonKey,
      {
        auth: {
          persistSession: false, // AI agents don't need persistent sessions
        },
        global: {
          headers: {
            'X-Client-Info': 'iq24-ai-core',
          },
        },
      }
    );
  }
  return supabaseClient;
}

/**
 * Get the service role Supabase client (bypasses RLS)
 * Use with extreme caution - only for internal agent operations
 */
export function getSupabaseServiceClient(): SupabaseClient<Database> {
  if (!supabaseServiceClient) {
    const config = getConfig();
    supabaseServiceClient = createClient<Database>(
      config.database.supabaseUrl,
      config.database.supabaseServiceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            'X-Client-Info': 'iq24-ai-service',
          },
        },
      }
    );
  }
  return supabaseServiceClient;
}

/**
 * Database Repository Classes for Type-Safe Access
 */

export class BaseRepository<T extends Record<string, any>> {
  protected client: SupabaseClient<Database>;
  protected tableName: string;

  constructor(tableName: string, useServiceRole = false) {
    this.tableName = tableName;
    this.client = useServiceRole ? getSupabaseServiceClient() : getSupabaseClient();
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw new Error(`Failed to find ${this.tableName} by id: ${error.message}`);
    }

    return data as T | null;
  }

  async findMany(filters: Record<string, any> = {}, limit = 100): Promise<T[]> {
    let query = this.client.from(this.tableName).select('*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query.limit(limit);

    if (error) {
      throw new Error(`Failed to find ${this.tableName}: ${error.message}`);
    }

    return (data as T[]) || [];
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
    }

    return result as T;
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
    }

    return result as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
    }
  }
}

/**
 * Specialized Repository Classes
 */

export interface Lead {
  id: string;
  workspace_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  title?: string;
  company_name?: string;
  company_domain?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  company_size?: string;
  company_industry?: string;
  company_location?: string;
  company_revenue?: string;
  company_funding?: string;
  technologies?: any[];
  lead_score?: number;
  intent_signals?: Record<string, any>;
  personality_profile?: Record<string, any>;
  engagement_history?: any[];
  source?: string;
  source_id?: string;
  data_sources?: string[];
  email_validated?: boolean;
  phone_validated?: boolean;
  data_quality_score?: number;
  last_validated_at?: string;
  discovery_status?: string;
  personalization_status?: string;
  outreach_status?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class LeadRepository extends BaseRepository<Lead> {
  constructor(useServiceRole = false) {
    super('leads', useServiceRole);
  }

  async findByEmail(email: string, workspaceId: string): Promise<Lead | null> {
    const { data, error } = await this.client
      .from('leads')
      .select('*')
      .eq('email', email)
      .eq('workspace_id', workspaceId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find lead by email: ${error.message}`);
    }

    return data as Lead | null;
  }

  async findByCompanyDomain(domain: string, workspaceId: string): Promise<Lead[]> {
    const { data, error } = await this.client
      .from('leads')
      .select('*')
      .eq('company_domain', domain)
      .eq('workspace_id', workspaceId);

    if (error) {
      throw new Error(`Failed to find leads by company domain: ${error.message}`);
    }

    return (data as Lead[]) || [];
  }

  async updateDiscoveryStatus(id: string, status: string, discoveryData?: Record<string, any>): Promise<Lead> {
    const updateData: any = { discovery_status: status };
    if (discoveryData) {
      updateData.intent_signals = discoveryData;
    }
    return this.update(id, updateData);
  }
}

export interface Campaign {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  type?: string;
  status?: string;
  icp_criteria?: Record<string, any>;
  target_count?: number;
  leads_discovered?: number;
  leads_validated?: number;
  leads_personalized?: number;
  leads_contacted?: number;
  discovery_config?: Record<string, any>;
  validation_config?: Record<string, any>;
  personalization_config?: Record<string, any>;
  execution_config?: Record<string, any>;
  workflow_id?: string;
  current_stage?: string;
  stages_completed?: string[];
  metrics?: Record<string, any>;
  analytics_summary?: Record<string, any>;
  compliance_status?: string;
  compliance_checks?: any[];
  gdpr_consent_obtained?: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export class CampaignRepository extends BaseRepository<Campaign> {
  constructor(useServiceRole = false) {
    super('campaigns', useServiceRole);
  }

  async findActiveCampaigns(workspaceId: string): Promise<Campaign[]> {
    return this.findMany({
      workspace_id: workspaceId,
      status: 'active'
    });
  }

  async updateStage(id: string, stage: string, stagesCompleted: string[] = []): Promise<Campaign> {
    return this.update(id, {
      current_stage: stage,
      stages_completed: stagesCompleted
    });
  }

  async updateMetrics(id: string, metrics: Record<string, any>): Promise<Campaign> {
    return this.update(id, { metrics });
  }
}

export interface AgentExecution {
  id: string;
  workspace_id: string;
  agent_type: string;
  agent_instance_id: string;
  campaign_id?: string;
  lead_id?: string;
  workflow_id?: string;
  activity_id?: string;
  task_type: string;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  status?: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  error_message?: string;
  error_details?: Record<string, any>;
  retry_count?: number;
  max_retries?: number;
  metrics?: Record<string, any>;
  traces?: any[];
  created_at: string;
}

export class AgentExecutionRepository extends BaseRepository<AgentExecution> {
  constructor(useServiceRole = true) { // Agents typically need service role access
    super('agent_executions', useServiceRole);
  }

  async findByAgentType(agentType: string, workspaceId: string, limit = 100): Promise<AgentExecution[]> {
    return this.findMany({
      agent_type: agentType,
      workspace_id: workspaceId
    }, limit);
  }

  async findByCampaign(campaignId: string, limit = 100): Promise<AgentExecution[]> {
    return this.findMany({ campaign_id: campaignId }, limit);
  }

  async updateStatus(id: string, status: string, outputData?: Record<string, any>, error?: string): Promise<AgentExecution> {
    const updateData: any = { 
      status,
      completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : undefined
    };
    
    if (outputData) {
      updateData.output_data = outputData;
    }
    
    if (error) {
      updateData.error_message = error;
    }

    return this.update(id, updateData);
  }
}

export interface OutreachActivity {
  id: string;
  workspace_id: string;
  campaign_id: string;
  lead_id: string;
  type: string;
  channel: string;
  subject?: string;
  content?: string;
  content_personalized?: string;
  scheduled_at?: string;
  sent_at?: string;
  status?: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  reply_content?: string;
  personalization_method?: string;
  personalization_data?: Record<string, any>;
  sentiment_score?: number;
  compliance_approved?: boolean;
  compliance_checks?: any[];
  unsubscribe_link?: string;
  external_message_id?: string;
  external_thread_id?: string;
  created_at: string;
  updated_at: string;
}

export class OutreachActivityRepository extends BaseRepository<OutreachActivity> {
  constructor(useServiceRole = false) {
    super('outreach_activities', useServiceRole);
  }

  async findByCampaign(campaignId: string): Promise<OutreachActivity[]> {
    return this.findMany({ campaign_id: campaignId });
  }

  async findByLead(leadId: string): Promise<OutreachActivity[]> {
    return this.findMany({ lead_id: leadId });
  }

  async updateStatus(id: string, status: string, timestamp?: string): Promise<OutreachActivity> {
    const updateData: any = { status };
    
    if (timestamp) {
      switch (status) {
        case 'sent':
          updateData.sent_at = timestamp;
          break;
        case 'opened':
          updateData.opened_at = timestamp;
          break;
        case 'clicked':
          updateData.clicked_at = timestamp;
          break;
        case 'replied':
          updateData.replied_at = timestamp;
          break;
      }
    }

    return this.update(id, updateData);
  }
}

/**
 * Database connection health check
 */
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; latency: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('workspaces')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      return {
        healthy: false,
        latency,
        error: error.message
      };
    }

    return {
      healthy: true,
      latency
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

/**
 * Repository factory for easy access
 */
export const repositories = {
  leads: new LeadRepository(),
  campaigns: new CampaignRepository(),
  agentExecutions: new AgentExecutionRepository(),
  outreachActivities: new OutreachActivityRepository(),
  
  // Service role versions for internal agent operations
  service: {
    leads: new LeadRepository(true),
    campaigns: new CampaignRepository(true),
    agentExecutions: new AgentExecutionRepository(true),
    outreachActivities: new OutreachActivityRepository(true),
  }
};