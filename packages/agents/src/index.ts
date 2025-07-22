// IQ24.ai AI Agents Package
// Comprehensive suite of specialized AI agents for B2B growth automation

// Base Agent Class
export { BaseAgent } from './base/agent.js';

// Core AI Agents
export { ProspectDiscoveryAgent } from './prospect-discovery/prospect-discovery-agent.js';
export { ValidationEnrichmentAgent } from './validation-enrichment/vea-agent.js';
export { OutreachPersonalizationAgent } from './outreach-personalization/opa-agent.js';
export { CampaignExecutionAgent } from './campaign-execution/cea-agent.js';
export { AnalyticsFeedbackAgent } from './analytics-feedback/afla-agent.js';
export { ComplianceGuardianAgent } from './compliance-guardian/cgn-agent.js';
export { CognitiveReflectionAgent } from './cognitive-reflection/crm-agent.js';

// Agent Factory and Management
export class AgentFactory {
  private static instances = new Map<string, any>();

  static createAgent(agentType: string, config: any) {
    switch (agentType) {
      case 'pda':
        return new ProspectDiscoveryAgent(config);
      case 'vea':
        return new ValidationEnrichmentAgent(config);
      case 'opa':
        return new OutreachPersonalizationAgent(config);
      case 'cea':
        return new CampaignExecutionAgent(config);
      case 'afla':
        return new AnalyticsFeedbackAgent();
      case 'cgn':
        return new ComplianceGuardianAgent();
      case 'crm':
        return new CognitiveReflectionAgent();
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }

  static getAgent(agentId: string) {
    return this.instances.get(agentId);
  }

  static registerAgent(agentId: string, agent: any) {
    this.instances.set(agentId, agent);
  }

  static getAllAgents() {
    return Array.from(this.instances.values());
  }
}

// Agent Types and Configurations
export type AgentType = 'pda' | 'vea' | 'opa' | 'cea' | 'afla' | 'cgn' | 'crm';

export interface AgentRegistry {
  pda: ProspectDiscoveryAgent;
  vea: ValidationEnrichmentAgent;
  opa: OutreachPersonalizationAgent;
  cea: CampaignExecutionAgent;
  afla: AnalyticsFeedbackAgent;
  cgn: ComplianceGuardianAgent;
  crm: CognitiveReflectionAgent;
}

// Multi-Agent System Orchestrator
export class MultiAgentSystem {
  private agents: Map<AgentType, any> = new Map();
  private initialized = false;

  async initialize(configs: Record<AgentType, any>) {
    if (this.initialized) {
      throw new Error('Multi-Agent System already initialized');
    }

    // Initialize all agents
    for (const [agentType, config] of Object.entries(configs)) {
      const agent = AgentFactory.createAgent(agentType, config);
      this.agents.set(agentType as AgentType, agent);
      AgentFactory.registerAgent(agentType, agent);
    }

    this.initialized = true;
  }

  getAgent<T extends AgentType>(agentType: T): AgentRegistry[T] {
    if (!this.initialized) {
      throw new Error('Multi-Agent System not initialized');
    }
    
    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new Error(`Agent ${agentType} not found`);
    }
    
    return agent;
  }

  async shutdown() {
    // Gracefully shutdown all agents
    for (const agent of this.agents.values()) {
      if (agent.shutdown) {
        await agent.shutdown();
      }
    }
    
    this.agents.clear();
    this.initialized = false;
  }

  getSystemStatus() {
    const status: Record<string, any> = {};
    
    for (const [agentType, agent] of this.agents) {
      status[agentType] = {
        initialized: true,
        healthy: agent.isHealthy ? agent.isHealthy() : true,
        metrics: agent.getMetrics ? agent.getMetrics() : null
      };
    }
    
    return {
      initialized: this.initialized,
      agentCount: this.agents.size,
      agents: status
    };
  }
}

// Export singleton instance
export const multiAgentSystem = new MultiAgentSystem();