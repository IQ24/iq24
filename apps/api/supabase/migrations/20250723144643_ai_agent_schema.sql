-- IQ24.ai Database Schema for AI Agent Orchestration
-- Migration to add AI-specific tables to existing Supabase schema

-- Add AI-specific enums
CREATE TYPE "public"."discovery_status" AS ENUM (
    'pending',
    'discovered',
    'validated',
    'enriched'
);

CREATE TYPE "public"."outreach_status" AS ENUM (
    'not_started',
    'scheduled',
    'sent',
    'replied',
    'bounced'
);

CREATE TYPE "public"."campaign_status" AS ENUM (
    'draft',
    'active',
    'paused',
    'completed',
    'archived'
);

CREATE TYPE "public"."campaign_stage" AS ENUM (
    'discovery',
    'validation',
    'personalization',
    'execution',
    'analysis'
);

CREATE TYPE "public"."agent_status" AS ENUM (
    'pending',
    'running',
    'completed',
    'failed',
    'retrying'
);

CREATE TYPE "public"."compliance_status" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'requires_review'
);

-- AI Workspaces (multi-tenancy for AI features)
CREATE TABLE "public"."ai_workspaces" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  ai_models_config JSONB DEFAULT '{}'::jsonb,
  compliance_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "public"."ai_workspaces" ENABLE ROW LEVEL SECURITY;

-- Leads and prospects managed by agents
CREATE TABLE "public"."leads" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
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
  discovery_status discovery_status DEFAULT 'pending',
  personalization_status agent_status DEFAULT 'pending',
  outreach_status outreach_status DEFAULT 'not_started',
  
  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and indexes
ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX idx_leads_team_id ON leads(team_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_company_domain ON leads(company_domain);
CREATE INDEX idx_leads_lead_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_source ON leads(source);

-- AI Campaigns for orchestrating multi-agent workflows
CREATE TABLE "public"."ai_campaigns" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Campaign details
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'outbound', -- outbound, nurture, follow_up
  status campaign_status DEFAULT 'draft',
  
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
  workflow_id TEXT, -- AI workflow ID
  current_stage campaign_stage DEFAULT 'discovery',
  stages_completed JSONB DEFAULT '[]'::jsonb,
  
  -- Performance metrics (managed by AFLA)
  metrics JSONB DEFAULT '{}'::jsonb,
  analytics_summary JSONB DEFAULT '{}'::jsonb,
  
  -- Compliance tracking (managed by CGN)
  compliance_status compliance_status DEFAULT 'pending',
  compliance_checks JSONB DEFAULT '[]'::jsonb,
  gdpr_consent_obtained BOOLEAN DEFAULT false,
  
  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and indexes
ALTER TABLE "public"."ai_campaigns" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ai_campaigns_workspace_id ON ai_campaigns(workspace_id);
CREATE INDEX idx_ai_campaigns_team_id ON ai_campaigns(team_id);
CREATE INDEX idx_ai_campaigns_status ON ai_campaigns(status);
CREATE INDEX idx_ai_campaigns_current_stage ON ai_campaigns(current_stage);
CREATE INDEX idx_ai_campaigns_created_by ON ai_campaigns(created_by);

-- Campaign leads (many-to-many relationship)
CREATE TABLE "public"."campaign_leads" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES ai_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Agent processing status for this campaign
  pda_status agent_status DEFAULT 'pending',
  vea_status agent_status DEFAULT 'pending',
  opa_status agent_status DEFAULT 'pending',
  cea_status agent_status DEFAULT 'pending',
  
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
ALTER TABLE "public"."campaign_leads" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_campaign_leads_campaign_id ON campaign_leads(campaign_id);
CREATE INDEX idx_campaign_leads_lead_id ON campaign_leads(lead_id);
CREATE INDEX idx_campaign_leads_team_id ON campaign_leads(team_id);

-- Agent execution logs and state management
CREATE TABLE "public"."agent_executions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Agent identification
  agent_type TEXT NOT NULL, -- PDA, VEA, OPA, CEA, AFLA, CGN, CRM
  agent_instance_id TEXT NOT NULL,
  
  -- Execution context
  campaign_id UUID REFERENCES ai_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  workflow_id TEXT, -- AI workflow ID
  activity_id TEXT, -- AI activity ID
  
  -- Execution details
  task_type TEXT NOT NULL,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  
  -- Status and timing
  status agent_status DEFAULT 'pending',
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
ALTER TABLE "public"."agent_executions" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_agent_executions_workspace_id ON agent_executions(workspace_id);
CREATE INDEX idx_agent_executions_team_id ON agent_executions(team_id);
CREATE INDEX idx_agent_executions_agent_type ON agent_executions(agent_type);
CREATE INDEX idx_agent_executions_campaign_id ON agent_executions(campaign_id);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_started_at ON agent_executions(started_at DESC);

-- Outreach activities (emails, calls, messages)
CREATE TABLE "public"."outreach_activities" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES ai_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
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
ALTER TABLE "public"."outreach_activities" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_outreach_activities_workspace_id ON outreach_activities(workspace_id);
CREATE INDEX idx_outreach_activities_campaign_id ON outreach_activities(campaign_id);
CREATE INDEX idx_outreach_activities_lead_id ON outreach_activities(lead_id);
CREATE INDEX idx_outreach_activities_team_id ON outreach_activities(team_id);
CREATE INDEX idx_outreach_activities_type ON outreach_activities(type);
CREATE INDEX idx_outreach_activities_status ON outreach_activities(status);
CREATE INDEX idx_outreach_activities_scheduled_at ON outreach_activities(scheduled_at);

-- Analytics and performance metrics (managed by AFLA)
CREATE TABLE "public"."analytics_events" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Event classification
  event_type TEXT NOT NULL, -- lead_discovered, email_sent, meeting_booked, deal_closed, etc.
  event_category TEXT NOT NULL, -- discovery, validation, outreach, conversion
  
  -- Context
  campaign_id UUID REFERENCES ai_campaigns(id) ON DELETE CASCADE,
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
ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_analytics_events_workspace_id ON analytics_events(workspace_id);
CREATE INDEX idx_analytics_events_team_id ON analytics_events(team_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_campaign_id ON analytics_events(campaign_id);
CREATE INDEX idx_analytics_events_occurred_at ON analytics_events(occurred_at DESC);

-- Compliance audit trail (managed by CGN)
CREATE TABLE "public"."compliance_audit_logs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
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
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and indexes (read-only after creation)
ALTER TABLE "public"."compliance_audit_logs" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_compliance_audit_logs_workspace_id ON compliance_audit_logs(workspace_id);
CREATE INDEX idx_compliance_audit_logs_team_id ON compliance_audit_logs(team_id);
CREATE INDEX idx_compliance_audit_logs_entity_type ON compliance_audit_logs(entity_type);
CREATE INDEX idx_compliance_audit_logs_entity_id ON compliance_audit_logs(entity_id);
CREATE INDEX idx_compliance_audit_logs_compliance_type ON compliance_audit_logs(compliance_type);
CREATE INDEX idx_compliance_audit_logs_created_at ON compliance_audit_logs(created_at DESC);

-- Knowledge base for CRM (Cognitive Reflection Module)
CREATE TABLE "public"."agent_knowledge" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
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
ALTER TABLE "public"."agent_knowledge" ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_agent_knowledge_workspace_id ON agent_knowledge(workspace_id);
CREATE INDEX idx_agent_knowledge_team_id ON agent_knowledge(team_id);
CREATE INDEX idx_agent_knowledge_source_agent ON agent_knowledge(source_agent);
CREATE INDEX idx_agent_knowledge_target_agents ON agent_knowledge USING GIN(target_agents);
CREATE INDEX idx_agent_knowledge_confidence_score ON agent_knowledge(confidence_score DESC);

-- System health and monitoring
CREATE TABLE "public"."system_health_metrics" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  
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
CREATE INDEX idx_system_health_metrics_workspace_id ON system_health_metrics(workspace_id);
CREATE INDEX idx_system_health_metrics_component ON system_health_metrics(component_type, component_id);
CREATE INDEX idx_system_health_metrics_status ON system_health_metrics(status);
CREATE INDEX idx_system_health_metrics_recorded_at ON system_health_metrics(recorded_at DESC);

-- Row Level Security (RLS) Policies

-- AI Workspaces: Users can only access workspaces of teams they belong to
CREATE POLICY "Team members can access AI workspaces" ON ai_workspaces
  FOR ALL USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN users_on_team uot ON uot.team_id = t.id
      WHERE uot.user_id = auth.uid()
    )
  );

-- Leads: Access restricted to team members
CREATE POLICY "Team members can access leads" ON leads
  FOR ALL USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN users_on_team uot ON uot.team_id = t.id
      WHERE uot.user_id = auth.uid()
    )
  );

-- AI Campaigns: Access restricted to team members
CREATE POLICY "Team members can access AI campaigns" ON ai_campaigns
  FOR ALL USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN users_on_team uot ON uot.team_id = t.id
      WHERE uot.user_id = auth.uid()
    )
  );

-- Campaign Leads: Access restricted to team members
CREATE POLICY "Team members can access campaign leads" ON campaign_leads
  FOR ALL USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN users_on_team uot ON uot.team_id = t.id
      WHERE uot.user_id = auth.uid()
    )
  );

-- Agent Executions: Access restricted to team members
CREATE POLICY "Team members can access agent executions" ON agent_executions
  FOR ALL USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN users_on_team uot ON uot.team_id = t.id
      WHERE uot.user_id = auth.uid()
    )
  );

-- Outreach Activities: Access restricted to team members
CREATE POLICY "Team members can access outreach activities" ON outreach_activities
  FOR ALL USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN users_on_team uot ON uot.team_id = t.id
      WHERE uot.user_id = auth.uid()
    )
  );

-- Analytics Events: Access restricted to team members
CREATE POLICY "Team members can access analytics events" ON analytics_events
  FOR ALL USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN users_on_team uot ON uot.team_id = t.id
      WHERE uot.user_id = auth.uid()
    )
  );

-- Compliance Audit Logs: Access restricted to team members
CREATE POLICY "Team members can access compliance audit logs" ON compliance_audit_logs
  FOR ALL USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN users_on_team uot ON uot.team_id = t.id
      WHERE uot.user_id = auth.uid()
    )
  );

-- Agent Knowledge: Access restricted to team members
CREATE POLICY "Team members can access agent knowledge" ON agent_knowledge
  FOR ALL USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN users_on_team uot ON uot.team_id = t.id
      WHERE uot.user_id = auth.uid()
    )
  );

-- System Health Metrics: Access restricted to workspace members
CREATE POLICY "Workspace members can access system health metrics" ON system_health_metrics
  FOR ALL USING (
    workspace_id IN (
      SELECT aw.id FROM ai_workspaces aw
      JOIN teams t ON t.id = aw.team_id
      JOIN users_on_team uot ON uot.team_id = t.id
      WHERE uot.user_id = auth.uid()
    )
  );

-- Add updated_at trigger functions for tables that need automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_ai_workspaces_updated_at BEFORE UPDATE ON ai_workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_campaigns_updated_at BEFORE UPDATE ON ai_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_leads_updated_at BEFORE UPDATE ON campaign_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_activities_updated_at BEFORE UPDATE ON outreach_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_knowledge_updated_at BEFORE UPDATE ON agent_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();