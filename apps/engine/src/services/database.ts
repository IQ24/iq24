/**
 * Database Service for IQ24 AI Engine
 * 
 * Provides database integration for AI workspaces, campaigns, leads, and agent executions.
 * This service bridges the AI engine with the PostgreSQL database to persist campaign data.
 */

import { Pool, PoolClient } from 'pg';
import { Logger } from '@iq24/utils';

export interface AIWorkspace {
  id: string;
  name: string;
  team_id: string;
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Lead {
  id: string;
  workspace_id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  position: string;
  linkedin_url?: string;
  phone?: string;
  lead_score?: number;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'not_interested';
  enrichment_data: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface AICampaign {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  target_audience: Record<string, any>;
  search_criteria?: Record<string, any>;
  goals: string[];
  channels: string[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  max_prospects: number;
  sequence: Record<string, any>[];
  created_at: Date;
  updated_at: Date;
}

export interface AgentExecution {
  id: string;
  campaign_id: string;
  agent_type: string;
  agent_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  error_message?: string;
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class DatabaseService {
  private pool: Pool;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('DatabaseService');
    
    // Initialize PostgreSQL connection pool
    this.pool = new Pool({
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'lTARHmvi',
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'iq24_dev',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.pool.on('error', (err) => {
      this.logger.error('PostgreSQL pool error:', err);
    });

    this.pool.on('connect', () => {
      this.logger.debug('New PostgreSQL connection established');
    });
  }

  /**
   * Get a database client from the pool
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Execute a query with automatic connection management
   */
  async query(text: string, params: any[] = []): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // AI Workspace operations
  async createWorkspace(workspace: Omit<AIWorkspace, 'id' | 'created_at' | 'updated_at'>): Promise<AIWorkspace> {
    const query = `
      INSERT INTO ai_workspaces (name, team_id, settings)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await this.query(query, [workspace.name, workspace.team_id, workspace.settings]);
    return result.rows[0];
  }

  async getWorkspace(id: string): Promise<AIWorkspace | null> {
    const query = 'SELECT * FROM ai_workspaces WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0] || null;
  }

  async getWorkspacesByTeam(teamId: string): Promise<AIWorkspace[]> {
    const query = 'SELECT * FROM ai_workspaces WHERE team_id = $1 ORDER BY created_at DESC';
    const result = await this.query(query, [teamId]);
    return result.rows;
  }

  // Lead operations
  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const query = `
      INSERT INTO leads (workspace_id, first_name, last_name, email, company, position, 
                        linkedin_url, phone, lead_score, source, status, enrichment_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      lead.workspace_id, lead.first_name, lead.last_name, lead.email, 
      lead.company, lead.position, lead.linkedin_url, lead.phone, 
      lead.lead_score, lead.source, lead.status, lead.enrichment_data
    ];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async getLeadsByWorkspace(workspaceId: string, limit: number = 100, offset: number = 0): Promise<Lead[]> {
    const query = `
      SELECT * FROM leads 
      WHERE workspace_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await this.query(query, [workspaceId, limit, offset]);
    return result.rows;
  }

  async updateLeadStatus(id: string, status: Lead['status']): Promise<Lead | null> {
    const query = `
      UPDATE leads 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await this.query(query, [status, id]);
    return result.rows[0] || null;
  }

  // AI Campaign operations
  async createCampaign(campaign: Omit<AICampaign, 'id' | 'created_at' | 'updated_at'>): Promise<AICampaign> {
    const query = `
      INSERT INTO ai_campaigns (workspace_id, name, description, target_audience, search_criteria, 
                               goals, channels, status, max_prospects, sequence)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      campaign.workspace_id, campaign.name, campaign.description, campaign.target_audience,
      campaign.search_criteria, campaign.goals, campaign.channels, campaign.status,
      campaign.max_prospects, campaign.sequence
    ];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async getCampaign(id: string): Promise<AICampaign | null> {
    const query = 'SELECT * FROM ai_campaigns WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0] || null;
  }

  async getCampaignsByWorkspace(workspaceId: string): Promise<AICampaign[]> {
    const query = 'SELECT * FROM ai_campaigns WHERE workspace_id = $1 ORDER BY created_at DESC';
    const result = await this.query(query, [workspaceId]);
    return result.rows;
  }

  async updateCampaignStatus(id: string, status: AICampaign['status']): Promise<AICampaign | null> {
    const query = `
      UPDATE ai_campaigns 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await this.query(query, [status, id]);
    return result.rows[0] || null;
  }

  // Agent Execution operations
  async createAgentExecution(execution: Omit<AgentExecution, 'id' | 'created_at' | 'updated_at'>): Promise<AgentExecution> {
    const query = `
      INSERT INTO agent_executions (campaign_id, agent_type, agent_name, status, input_data, 
                                   output_data, error_message, started_at, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      execution.campaign_id, execution.agent_type, execution.agent_name, execution.status,
      execution.input_data, execution.output_data, execution.error_message,
      execution.started_at, execution.completed_at
    ];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async updateAgentExecution(id: string, updates: Partial<AgentExecution>): Promise<AgentExecution | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE agent_executions 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const result = await this.query(query, values);
    return result.rows[0] || null;
  }

  async getAgentExecutionsByCampaign(campaignId: string): Promise<AgentExecution[]> {
    const query = `
      SELECT * FROM agent_executions 
      WHERE campaign_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await this.query(query, [campaignId]);
    return result.rows;
  }

  // Campaign leads relationship
  async addLeadToCampaign(campaignId: string, leadId: string): Promise<void> {
    const query = `
      INSERT INTO campaign_leads (campaign_id, lead_id)
      VALUES ($1, $2)
      ON CONFLICT (campaign_id, lead_id) DO NOTHING
    `;
    await this.query(query, [campaignId, leadId]);
  }

  async getLeadsByCampaign(campaignId: string): Promise<Lead[]> {
    const query = `
      SELECT l.* FROM leads l
      INNER JOIN campaign_leads cl ON l.id = cl.lead_id
      WHERE cl.campaign_id = $1
      ORDER BY l.created_at DESC
    `;
    const result = await this.query(query, [campaignId]);
    return result.rows;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; connection: boolean; timestamp: Date }> {
    try {
      await this.query('SELECT 1');
      return {
        status: 'healthy',
        connection: true,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        connection: false,
        timestamp: new Date()
      };
    }
  }

  // Cleanup
  async close(): Promise<void> {
    await this.pool.end();
    this.logger.info('Database connection pool closed');
  }
}

// Singleton instance
let dbService: DatabaseService | null = null;

export function getDatabaseService(): DatabaseService {
  if (!dbService) {
    dbService = new DatabaseService();
  }
  return dbService;
}