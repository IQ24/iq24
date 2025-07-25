/**
 * IQ24.ai Database Type Definitions
 * Generated TypeScript types for Supabase database schema
 */

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          workspace_id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          full_name: string | null;
          title: string | null;
          company_name: string | null;
          company_domain: string | null;
          phone: string | null;
          linkedin_url: string | null;
          twitter_url: string | null;
          company_size: string | null;
          company_industry: string | null;
          company_location: string | null;
          company_revenue: string | null;
          company_funding: string | null;
          technologies: any[] | null;
          lead_score: number | null;
          intent_signals: Record<string, any> | null;
          personality_profile: Record<string, any> | null;
          engagement_history: any[] | null;
          source: string | null;
          source_id: string | null;
          data_sources: any[] | null;
          email_validated: boolean | null;
          phone_validated: boolean | null;
          data_quality_score: number | null;
          last_validated_at: string | null;
          discovery_status: string | null;
          personalization_status: string | null;
          outreach_status: string | null;
          tags: any[] | null;
          custom_fields: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          title?: string | null;
          company_name?: string | null;
          company_domain?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          company_size?: string | null;
          company_industry?: string | null;
          company_location?: string | null;
          company_revenue?: string | null;
          company_funding?: string | null;
          technologies?: any[] | null;
          lead_score?: number | null;
          intent_signals?: Record<string, any> | null;
          personality_profile?: Record<string, any> | null;
          engagement_history?: any[] | null;
          source?: string | null;
          source_id?: string | null;
          data_sources?: any[] | null;
          email_validated?: boolean | null;
          phone_validated?: boolean | null;
          data_quality_score?: number | null;
          last_validated_at?: string | null;
          discovery_status?: string | null;
          personalization_status?: string | null;
          outreach_status?: string | null;
          tags?: any[] | null;
          custom_fields?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          title?: string | null;
          company_name?: string | null;
          company_domain?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          company_size?: string | null;
          company_industry?: string | null;
          company_location?: string | null;
          company_revenue?: string | null;
          company_funding?: string | null;
          technologies?: any[] | null;
          lead_score?: number | null;
          intent_signals?: Record<string, any> | null;
          personality_profile?: Record<string, any> | null;
          engagement_history?: any[] | null;
          source?: string | null;
          source_id?: string | null;
          data_sources?: any[] | null;
          email_validated?: boolean | null;
          phone_validated?: boolean | null;
          data_quality_score?: number | null;
          last_validated_at?: string | null;
          discovery_status?: string | null;
          personalization_status?: string | null;
          outreach_status?: string | null;
          tags?: any[] | null;
          custom_fields?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          type: string | null;
          status: string | null;
          icp_criteria: Record<string, any> | null;
          target_count: number | null;
          leads_discovered: number | null;
          leads_validated: number | null;
          leads_personalized: number | null;
          leads_contacted: number | null;
          discovery_config: Record<string, any> | null;
          validation_config: Record<string, any> | null;
          personalization_config: Record<string, any> | null;
          execution_config: Record<string, any> | null;
          workflow_id: string | null;
          current_stage: string | null;
          stages_completed: any[] | null;
          metrics: Record<string, any> | null;
          analytics_summary: Record<string, any> | null;
          compliance_status: string | null;
          compliance_checks: any[] | null;
          gdpr_consent_obtained: boolean | null;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          type?: string | null;
          status?: string | null;
          icp_criteria?: Record<string, any> | null;
          target_count?: number | null;
          leads_discovered?: number | null;
          leads_validated?: number | null;
          leads_personalized?: number | null;
          leads_contacted?: number | null;
          discovery_config?: Record<string, any> | null;
          validation_config?: Record<string, any> | null;
          personalization_config?: Record<string, any> | null;
          execution_config?: Record<string, any> | null;
          workflow_id?: string | null;
          current_stage?: string | null;
          stages_completed?: any[] | null;
          metrics?: Record<string, any> | null;
          analytics_summary?: Record<string, any> | null;
          compliance_status?: string | null;
          compliance_checks?: any[] | null;
          gdpr_consent_obtained?: boolean | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          type?: string | null;
          status?: string | null;
          icp_criteria?: Record<string, any> | null;
          target_count?: number | null;
          leads_discovered?: number | null;
          leads_validated?: number | null;
          leads_personalized?: number | null;
          leads_contacted?: number | null;
          discovery_config?: Record<string, any> | null;
          validation_config?: Record<string, any> | null;
          personalization_config?: Record<string, any> | null;
          execution_config?: Record<string, any> | null;
          workflow_id?: string | null;
          current_stage?: string | null;
          stages_completed?: any[] | null;
          metrics?: Record<string, any> | null;
          analytics_summary?: Record<string, any> | null;
          compliance_status?: string | null;
          compliance_checks?: any[] | null;
          gdpr_consent_obtained?: boolean | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaign_leads: {
        Row: {
          id: string;
          campaign_id: string;
          lead_id: string;
          pda_status: string | null;
          vea_status: string | null;
          opa_status: string | null;
          cea_status: string | null;
          discovery_data: Record<string, any> | null;
          validation_data: Record<string, any> | null;
          personalization_data: Record<string, any> | null;
          execution_data: Record<string, any> | null;
          discovered_at: string | null;
          validated_at: string | null;
          personalized_at: string | null;
          contacted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          lead_id: string;
          pda_status?: string | null;
          vea_status?: string | null;
          opa_status?: string | null;
          cea_status?: string | null;
          discovery_data?: Record<string, any> | null;
          validation_data?: Record<string, any> | null;
          personalization_data?: Record<string, any> | null;
          execution_data?: Record<string, any> | null;
          discovered_at?: string | null;
          validated_at?: string | null;
          personalized_at?: string | null;
          contacted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          lead_id?: string;
          pda_status?: string | null;
          vea_status?: string | null;
          opa_status?: string | null;
          cea_status?: string | null;
          discovery_data?: Record<string, any> | null;
          validation_data?: Record<string, any> | null;
          personalization_data?: Record<string, any> | null;
          execution_data?: Record<string, any> | null;
          discovered_at?: string | null;
          validated_at?: string | null;
          personalized_at?: string | null;
          contacted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      agent_executions: {
        Row: {
          id: string;
          workspace_id: string;
          agent_type: string;
          agent_instance_id: string;
          campaign_id: string | null;
          lead_id: string | null;
          workflow_id: string | null;
          activity_id: string | null;
          task_type: string;
          input_data: Record<string, any> | null;
          output_data: Record<string, any> | null;
          status: string | null;
          started_at: string;
          completed_at: string | null;
          duration_ms: number | null;
          error_message: string | null;
          error_details: Record<string, any> | null;
          retry_count: number | null;
          max_retries: number | null;
          metrics: Record<string, any> | null;
          traces: any[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          agent_type: string;
          agent_instance_id: string;
          campaign_id?: string | null;
          lead_id?: string | null;
          workflow_id?: string | null;
          activity_id?: string | null;
          task_type: string;
          input_data?: Record<string, any> | null;
          output_data?: Record<string, any> | null;
          status?: string | null;
          started_at?: string;
          completed_at?: string | null;
          duration_ms?: number | null;
          error_message?: string | null;
          error_details?: Record<string, any> | null;
          retry_count?: number | null;
          max_retries?: number | null;
          metrics?: Record<string, any> | null;
          traces?: any[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          agent_type?: string;
          agent_instance_id?: string;
          campaign_id?: string | null;
          lead_id?: string | null;
          workflow_id?: string | null;
          activity_id?: string | null;
          task_type?: string;
          input_data?: Record<string, any> | null;
          output_data?: Record<string, any> | null;
          status?: string | null;
          started_at?: string;
          completed_at?: string | null;
          duration_ms?: number | null;
          error_message?: string | null;
          error_details?: Record<string, any> | null;
          retry_count?: number | null;
          max_retries?: number | null;
          metrics?: Record<string, any> | null;
          traces?: any[] | null;
          created_at?: string;
        };
      };
      outreach_activities: {
        Row: {
          id: string;
          workspace_id: string;
          campaign_id: string;
          lead_id: string;
          type: string;
          channel: string;
          subject: string | null;
          content: string | null;
          content_personalized: string | null;
          scheduled_at: string | null;
          sent_at: string | null;
          status: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          replied_at: string | null;
          reply_content: string | null;
          personalization_method: string | null;
          personalization_data: Record<string, any> | null;
          sentiment_score: number | null;
          compliance_approved: boolean | null;
          compliance_checks: any[] | null;
          unsubscribe_link: string | null;
          external_message_id: string | null;
          external_thread_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          campaign_id: string;
          lead_id: string;
          type: string;
          channel: string;
          subject?: string | null;
          content?: string | null;
          content_personalized?: string | null;
          scheduled_at?: string | null;
          sent_at?: string | null;
          status?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          replied_at?: string | null;
          reply_content?: string | null;
          personalization_method?: string | null;
          personalization_data?: Record<string, any> | null;
          sentiment_score?: number | null;
          compliance_approved?: boolean | null;
          compliance_checks?: any[] | null;
          unsubscribe_link?: string | null;
          external_message_id?: string | null;
          external_thread_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          campaign_id?: string;
          lead_id?: string;
          type?: string;
          channel?: string;
          subject?: string | null;
          content?: string | null;
          content_personalized?: string | null;
          scheduled_at?: string | null;
          sent_at?: string | null;
          status?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          replied_at?: string | null;
          reply_content?: string | null;
          personalization_method?: string | null;
          personalization_data?: Record<string, any> | null;
          sentiment_score?: number | null;
          compliance_approved?: boolean | null;
          compliance_checks?: any[] | null;
          unsubscribe_link?: string | null;
          external_message_id?: string | null;
          external_thread_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          workspace_id: string;
          event_type: string;
          event_category: string;
          campaign_id: string | null;
          lead_id: string | null;
          agent_type: string | null;
          properties: Record<string, any> | null;
          metrics: Record<string, any> | null;
          source: string | null;
          medium: string | null;
          attribution_data: Record<string, any> | null;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          event_type: string;
          event_category: string;
          campaign_id?: string | null;
          lead_id?: string | null;
          agent_type?: string | null;
          properties?: Record<string, any> | null;
          metrics?: Record<string, any> | null;
          source?: string | null;
          medium?: string | null;
          attribution_data?: Record<string, any> | null;
          occurred_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          event_type?: string;
          event_category?: string;
          campaign_id?: string | null;
          lead_id?: string | null;
          agent_type?: string | null;
          properties?: Record<string, any> | null;
          metrics?: Record<string, any> | null;
          source?: string | null;
          medium?: string | null;
          attribution_data?: Record<string, any> | null;
          occurred_at?: string;
          created_at?: string;
        };
      };
      compliance_audit_logs: {
        Row: {
          id: string;
          workspace_id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          compliance_type: string;
          rule_applied: string;
          compliance_status: string;
          risk_score: number | null;
          risk_factors: any[] | null;
          audit_data: Record<string, any>;
          previous_state: Record<string, any> | null;
          new_state: Record<string, any> | null;
          agent_type: string | null;
          user_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          compliance_type: string;
          rule_applied: string;
          compliance_status: string;
          risk_score?: number | null;
          risk_factors?: any[] | null;
          audit_data: Record<string, any>;
          previous_state?: Record<string, any> | null;
          new_state?: Record<string, any> | null;
          agent_type?: string | null;
          user_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          entity_type?: string;
          entity_id?: string;
          action?: string;
          compliance_type?: string;
          rule_applied?: string;
          compliance_status?: string;
          risk_score?: number | null;
          risk_factors?: any[] | null;
          audit_data?: Record<string, any>;
          previous_state?: Record<string, any> | null;
          new_state?: Record<string, any> | null;
          agent_type?: string | null;
          user_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      agent_knowledge: {
        Row: {
          id: string;
          workspace_id: string;
          knowledge_type: string;
          source_agent: string;
          target_agents: string[] | null;
          title: string;
          description: string | null;
          insights: Record<string, any>;
          recommendations: any[] | null;
          confidence_score: number | null;
          impact_score: number | null;
          validation_status: string | null;
          applied_count: number | null;
          success_rate: number | null;
          learning_context: Record<string, any> | null;
          data_sources: any[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          knowledge_type: string;
          source_agent: string;
          target_agents?: string[] | null;
          title: string;
          description?: string | null;
          insights: Record<string, any>;
          recommendations?: any[] | null;
          confidence_score?: number | null;
          impact_score?: number | null;
          validation_status?: string | null;
          applied_count?: number | null;
          success_rate?: number | null;
          learning_context?: Record<string, any> | null;
          data_sources?: any[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          knowledge_type?: string;
          source_agent?: string;
          target_agents?: string[] | null;
          title?: string;
          description?: string | null;
          insights?: Record<string, any>;
          recommendations?: any[] | null;
          confidence_score?: number | null;
          impact_score?: number | null;
          validation_status?: string | null;
          applied_count?: number | null;
          success_rate?: number | null;
          learning_context?: Record<string, any> | null;
          data_sources?: any[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      system_health_metrics: {
        Row: {
          id: string;
          component_type: string;
          component_id: string;
          status: string;
          response_time_ms: number | null;
          error_rate: number | null;
          throughput_per_minute: number | null;
          cpu_usage: number | null;
          memory_usage: number | null;
          queue_length: number | null;
          custom_metrics: Record<string, any> | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          component_type: string;
          component_id: string;
          status: string;
          response_time_ms?: number | null;
          error_rate?: number | null;
          throughput_per_minute?: number | null;
          cpu_usage?: number | null;
          memory_usage?: number | null;
          queue_length?: number | null;
          custom_metrics?: Record<string, any> | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          component_type?: string;
          component_id?: string;
          status?: string;
          response_time_ms?: number | null;
          error_rate?: number | null;
          throughput_per_minute?: number | null;
          cpu_usage?: number | null;
          memory_usage?: number | null;
          queue_length?: number | null;
          custom_metrics?: Record<string, any> | null;
          recorded_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
