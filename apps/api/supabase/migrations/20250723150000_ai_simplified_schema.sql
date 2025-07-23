-- IQ24.ai Simplified Database Schema for AI Agent Orchestration
-- Simplified migration that works with standard PostgreSQL

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
  source TEXT,
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

-- AI Campaigns for orchestrating multi-agent workflows
CREATE TABLE "public"."ai_campaigns" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Campaign details
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'outbound',
  status campaign_status DEFAULT 'draft',
  
  -- Target criteria
  icp_criteria JSONB DEFAULT '{}'::jsonb,
  target_count INTEGER DEFAULT 0,
  leads_discovered INTEGER DEFAULT 0,
  leads_validated INTEGER DEFAULT 0,
  leads_personalized INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  
  -- Campaign configuration
  discovery_config JSONB DEFAULT '{}'::jsonb,
  validation_config JSONB DEFAULT '{}'::jsonb,
  personalization_config JSONB DEFAULT '{}'::jsonb,
  execution_config JSONB DEFAULT '{}'::jsonb,
  
  -- Workflow orchestration
  workflow_id TEXT,
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

-- Agent execution logs and state management
CREATE TABLE "public"."agent_executions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Agent identification
  agent_type TEXT NOT NULL,
  agent_instance_id TEXT NOT NULL,
  
  -- Execution context
  campaign_id UUID REFERENCES ai_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  workflow_id TEXT,
  activity_id TEXT,
  
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

-- Add indexes for performance
CREATE INDEX idx_ai_workspaces_team_id ON ai_workspaces(team_id);
CREATE INDEX idx_ai_workspaces_slug ON ai_workspaces(slug);

CREATE INDEX idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX idx_leads_team_id ON leads(team_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_company_domain ON leads(company_domain);
CREATE INDEX idx_leads_lead_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_source ON leads(source);

CREATE INDEX idx_ai_campaigns_workspace_id ON ai_campaigns(workspace_id);
CREATE INDEX idx_ai_campaigns_team_id ON ai_campaigns(team_id);
CREATE INDEX idx_ai_campaigns_status ON ai_campaigns(status);
CREATE INDEX idx_ai_campaigns_current_stage ON ai_campaigns(current_stage);
CREATE INDEX idx_ai_campaigns_created_by ON ai_campaigns(created_by);

CREATE INDEX idx_campaign_leads_campaign_id ON campaign_leads(campaign_id);
CREATE INDEX idx_campaign_leads_lead_id ON campaign_leads(lead_id);
CREATE INDEX idx_campaign_leads_team_id ON campaign_leads(team_id);

CREATE INDEX idx_agent_executions_workspace_id ON agent_executions(workspace_id);
CREATE INDEX idx_agent_executions_team_id ON agent_executions(team_id);
CREATE INDEX idx_agent_executions_agent_type ON agent_executions(agent_type);
CREATE INDEX idx_agent_executions_campaign_id ON agent_executions(campaign_id);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_started_at ON agent_executions(started_at DESC);

-- Create functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for automatic updated_at timestamps
CREATE TRIGGER update_ai_workspaces_updated_at BEFORE UPDATE ON ai_workspaces FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_campaigns_updated_at BEFORE UPDATE ON ai_campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_campaign_leads_updated_at BEFORE UPDATE ON campaign_leads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();