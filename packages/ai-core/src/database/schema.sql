-- IQ24.ai Database Schema for AI Agent Orchestration
-- Supabase PostgreSQL schema for managing agent states, workflows, and compliance

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET row_security = on;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- User workspaces for multi-tenancy
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Leads and prospects managed by agents
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Basic identification
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  title TEXT,
  company_name TEXT,
  company_domain TEXT,
  
  -- Contact information
  phone TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  
  -- Company information (enriched by VEA)
  company_size TEXT,
  company_industry TEXT,
  company_location TEXT,
  company_revenue TEXT,
  company_funding TEXT,
  technologies JSONB DEFAULT '[]'::jsonb,
  
  -- AI-generated insights
  lead_score INTEGER DEFAULT 0,
  intent_signals JSONB DEFAULT '{}'::jsonb,
  personality_profile JSONB DEFAULT '{}'::jsonb,
  engagement_history JSONB DEFAULT '[]'::jsonb,
  
  -- Data source tracking
  source TEXT, -- apollo, hunter, linkedin, etc.
  source_id TEXT,
  data_sources JSONB DEFAULT '[]'::jsonb,
  
  -- Validation status (managed by VEA)
  email_validated BOOLEAN DEFAULT false,
  phone_validated BOOLEAN DEFAULT false,
  data_quality_score DECIMAL(3,2) DEFAULT 0.0,
  last_validated_at TIMESTAMPTZ,
  
  -- Agent workflow state
  discovery_status TEXT DEFAULT 'pending', -- pending, discovered, validated, enriched
  personalization_status TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed
  outreach_status TEXT DEFAULT 'not_started', -- not_started, scheduled, sent, replied, bounced
  
  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and indexes
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company_domain ON leads(company_domain);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Campaigns for orchestrating multi-agent workflows
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Campaign details
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'outbound', -- outbound, nurture, follow_up
  status TEXT DEFAULT 'draft', -- draft, active, paused, completed, archived
  
  -- Target criteria
  icp_criteria JSONB DEFAULT '{}'::jsonb, -- Ideal Customer Profile
  target_count INTEGER DEFAULT 0,
  leads_discovered INTEGER DEFAULT 0,
  leads_validated INTEGER DEFAULT 0,
  leads_personalized INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  
  -- Campaign configuration
  discovery_config JSONB DEFAULT '{}'::jsonb, -- PDA configuration
  validation_config JSONB DEFAULT '{}'::jsonb, -- VEA configuration
  personalization_config JSONB DEFAULT '{}'::jsonb, -- OPA configuration
  execution_config JSONB DEFAULT '{}'::jsonb, -- CEA configuration
  
  -- Workflow orchestration
  workflow_id TEXT, -- Temporal workflow ID
  current_stage TEXT DEFAULT 'discovery', -- discovery, validation, personalization, execution, analysis
  stages_completed JSONB DEFAULT '[]'::jsonb,
  
  -- Performance metrics (managed by AFLA)
  metrics JSONB DEFAULT '{}'::jsonb,
  analytics_summary JSONB DEFAULT '{}'::jsonb,
  
  -- Compliance tracking (managed by CGN)
  compliance_status TEXT DEFAULT 'pending', -- pending, approved, rejected, requires_review
  compliance_checks JSONB DEFAULT '[]'::jsonb,
  gdpr_consent_obtained BOOLEAN DEFAULT false,
  
  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and indexes
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_campaigns_workspace_id ON campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_current_stage ON campaigns(current_stage);

-- Campaign leads (many-to-many relationship)
CREATE TABLE IF NOT EXISTS campaign_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Agent processing status for this campaign
  pda_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  vea_status TEXT DEFAULT 'pending',
  opa_status TEXT DEFAULT 'pending',
  cea_status TEXT DEFAULT 'pending',
  
  -- Stage-specific data
  discovery_data JSONB DEFAULT '{}'::jsonb,
  validation_data JSONB DEFAULT '{}'::jsonb,
  personalization_data JSONB DEFAULT '{}'::jsonb,
  execution_data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps for each stage
  discovered_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  personalized_at TIMESTAMPTZ,
  contacted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, lead_id)
);

-- Enable RLS and indexes
ALTER TABLE campaign_leads ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_id ON campaign_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_lead_id ON campaign_leads(lead_id);

-- Agent execution logs and state management
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Agent identification
  agent_type TEXT NOT NULL, -- PDA, VEA, OPA, CEA, AFLA, CGN, CRM
  agent_instance_id TEXT NOT NULL,
  
  -- Execution context
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  workflow_id TEXT, -- Temporal workflow ID
  activity_id TEXT, -- Temporal activity ID
  
  -- Execution details
  task_type TEXT NOT NULL,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  
  -- Status and timing
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed, retrying
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Error handling
  error_message TEXT,
  error_details JSONB DEFAULT '{}'::jsonb,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Metrics and monitoring
  metrics JSONB DEFAULT '{}'::jsonb,
  traces JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and indexes
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_agent_executions_workspace_id ON agent_executions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_type ON agent_executions(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_executions_campaign_id ON agent_executions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON agent_executions(status);
CREATE INDEX IF NOT EXISTS idx_agent_executions_started_at ON agent_executions(started_at DESC);

-- Outreach activities (emails, calls, messages)
CREATE TABLE IF NOT EXISTS outreach_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Activity details
  type TEXT NOT NULL, -- email, call, linkedin_message, sms
  channel TEXT NOT NULL, -- gmail, outlook, phone, linkedin, etc.
  subject TEXT,
  content TEXT,
  content_personalized TEXT, -- OPA-generated personalized version
  
  -- Scheduling and execution
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled', -- scheduled, sent, delivered, opened, clicked, replied, bounced, failed
  
  -- Engagement tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  reply_content TEXT,
  
  -- AI personalization metadata
  personalization_method TEXT, -- openai, anthropic, template
  personalization_data JSONB DEFAULT '{}'::jsonb,
  sentiment_score DECIMAL(3,2),
  
  -- Compliance tracking
  compliance_approved BOOLEAN DEFAULT false,
  compliance_checks JSONB DEFAULT '[]'::jsonb,
  unsubscribe_link TEXT,
  
  -- External IDs for tracking
  external_message_id TEXT,
  external_thread_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and indexes
ALTER TABLE outreach_activities ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_outreach_activities_workspace_id ON outreach_activities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_outreach_activities_campaign_id ON outreach_activities(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_activities_lead_id ON outreach_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_activities_type ON outreach_activities(type);
CREATE INDEX IF NOT EXISTS idx_outreach_activities_status ON outreach_activities(status);
CREATE INDEX IF NOT EXISTS idx_outreach_activities_scheduled_at ON outreach_activities(scheduled_at);

-- Analytics and performance metrics (managed by AFLA)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Event classification
  event_type TEXT NOT NULL, -- lead_discovered, email_sent, meeting_booked, deal_closed, etc.
  event_category TEXT NOT NULL, -- discovery, validation, outreach, conversion
  
  -- Context
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  agent_type TEXT, -- Which agent generated this event
  
  -- Event data
  properties JSONB DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  
  -- Attribution
  source TEXT,
  medium TEXT,
  attribution_data JSONB DEFAULT '{}'::jsonb,
  
  -- Timing
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and indexes
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_analytics_events_workspace_id ON analytics_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign_id ON analytics_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred_at ON analytics_events(occurred_at DESC);

-- Compliance audit trail (managed by CGN)
CREATE TABLE IF NOT EXISTS compliance_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Audit context
  entity_type TEXT NOT NULL, -- lead, campaign, outreach_activity
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- created, updated, processed, contacted, opted_out
  
  -- Compliance details
  compliance_type TEXT NOT NULL, -- gdpr, ccpa, can_spam
  rule_applied TEXT NOT NULL,
  compliance_status TEXT NOT NULL, -- approved, rejected, flagged
  
  -- Risk assessment
  risk_score DECIMAL(3,2) DEFAULT 0.0,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  
  -- Audit trail (immutable)
  audit_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  previous_state JSONB,
  new_state JSONB,
  
  -- System metadata
  agent_type TEXT, -- Which agent performed the action
  user_id UUID, -- If action was performed by a user
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and indexes (read-only after creation)
ALTER TABLE compliance_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_workspace_id ON compliance_audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_entity_type ON compliance_audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_entity_id ON compliance_audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_compliance_type ON compliance_audit_logs(compliance_type);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_created_at ON compliance_audit_logs(created_at DESC);

-- Knowledge base for CRM (Cognitive Reflection Module)
CREATE TABLE IF NOT EXISTS agent_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Knowledge classification
  knowledge_type TEXT NOT NULL, -- pattern, insight, optimization, failure_analysis
  source_agent TEXT NOT NULL, -- Which agent generated this knowledge
  target_agents TEXT[] DEFAULT '{}', -- Which agents can benefit from this knowledge
  
  -- Knowledge content
  title TEXT NOT NULL,
  description TEXT,
  insights JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB DEFAULT '[]'::jsonb,
  
  -- Performance impact
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  impact_score DECIMAL(3,2) DEFAULT 0.0,
  validation_status TEXT DEFAULT 'pending', -- pending, validated, rejected
  
  -- Application tracking
  applied_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0.0,
  
  -- Learning metadata
  learning_context JSONB DEFAULT '{}'::jsonb,
  data_sources JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and indexes
ALTER TABLE agent_knowledge ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_workspace_id ON agent_knowledge(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_source_agent ON agent_knowledge(source_agent);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_target_agents ON agent_knowledge USING GIN(target_agents);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_confidence_score ON agent_knowledge(confidence_score DESC);

-- System health and monitoring
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Component identification
  component_type TEXT NOT NULL, -- agent, orchestrator, workflow, external_service
  component_id TEXT NOT NULL,
  
  -- Health metrics
  status TEXT NOT NULL, -- healthy, degraded, unhealthy, offline
  response_time_ms INTEGER,
  error_rate DECIMAL(5,4) DEFAULT 0.0,
  throughput_per_minute INTEGER DEFAULT 0,
  
  -- Resource utilization
  cpu_usage DECIMAL(5,2),
  memory_usage DECIMAL(5,2),
  queue_length INTEGER DEFAULT 0,
  
  -- Custom metrics
  custom_metrics JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for health monitoring
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_component ON system_health_metrics(component_type, component_id);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_status ON system_health_metrics(status);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_recorded_at ON system_health_metrics(recorded_at DESC);

-- Row Level Security (RLS) Policies

-- Workspaces: Users can only access their own workspace
CREATE POLICY "Users can only access own workspace" ON workspaces
  FOR ALL USING (auth.uid()::text = ANY(SELECT unnest(string_to_array(settings->>'user_ids', ','))));

-- Leads: Access restricted to workspace members
CREATE POLICY "Workspace members can access leads" ON leads
  FOR ALL USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w 
      WHERE auth.uid()::text = ANY(SELECT unnest(string_to_array(w.settings->>'user_ids', ',')))
    )
  );

-- Similar policies for all other tables...
CREATE POLICY "Workspace members can access campaigns" ON campaigns
  FOR ALL USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w 
      WHERE auth.uid()::text = ANY(SELECT unnest(string_to_array(w.settings->>'user_ids', ',')))
    )
  );

CREATE POLICY "Workspace members can access campaign_leads" ON campaign_leads
  FOR ALL USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN workspaces w ON c.workspace_id = w.id
      WHERE auth.uid()::text = ANY(SELECT unnest(string_to_array(w.settings->>'user_ids', ',')))
    )
  );

CREATE POLICY "Workspace members can access agent_executions" ON agent_executions
  FOR ALL USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w 
      WHERE auth.uid()::text = ANY(SELECT unnest(string_to_array(w.settings->>'user_ids', ',')))
    )
  );

CREATE POLICY "Workspace members can access outreach_activities" ON outreach_activities
  FOR ALL USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w 
      WHERE auth.uid()::text = ANY(SELECT unnest(string_to_array(w.settings->>'user_ids', ',')))
    )
  );

CREATE POLICY "Workspace members can access analytics_events" ON analytics_events
  FOR ALL USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w 
      WHERE auth.uid()::text = ANY(SELECT unnest(string_to_array(w.settings->>'user_ids', ',')))
    )
  );

CREATE POLICY "Workspace members can access compliance_audit_logs" ON compliance_audit_logs
  FOR ALL USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w 
      WHERE auth.uid()::text = ANY(SELECT unnest(string_to_array(w.settings->>'user_ids', ',')))
    )
  );

CREATE POLICY "Workspace members can access agent_knowledge" ON agent_knowledge
  FOR ALL USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w 
      WHERE auth.uid()::text = ANY(SELECT unnest(string_to_array(w.settings->>'user_ids', ',')))
    )
  );

-- System health metrics are accessible to all authenticated users (for monitoring)
CREATE POLICY "Authenticated users can read system health" ON system_health_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_leads_updated_at BEFORE UPDATE ON campaign_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_activities_updated_at BEFORE UPDATE ON outreach_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_knowledge_updated_at BEFORE UPDATE ON agent_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();