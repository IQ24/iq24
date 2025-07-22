import { 
  RegulationRuleType, 
  ComplianceRegulationType, 
  ContentAnalysisResultType,
  ComplianceRiskLevelType,
  ComplianceActionType,
  ComplianceConfigType,
  RegulatoryUpdateType
} from './types';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

/**
 * Regulation Engine
 * Manages compliance rules, content analysis, and regulatory updates
 */
export class RegulationEngine extends EventEmitter {
  private rules: Map<string, RegulationRuleType> = new Map();
  private mlClassifier: any; // AI/ML model for content classification
  private config: ComplianceConfigType;
  private isInitialized = false;

  constructor(config: ComplianceConfigType) {
    super();
    this.config = config;
  }

  /**
   * Initialize the regulation engine
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Regulation Engine');
      
      // Load ML model for content classification
      await this.loadMLClassifier();
      
      // Initialize rule sets
      await this.loadRules();
      
      // Set up dynamic rule updates
      this.setupRuleUpdates();
      
      this.isInitialized = true;
      logger.info('Regulation Engine initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize Regulation Engine', { error });
      throw error;
    }
  }

  /**
   * Load machine learning classifier for content analysis
   */
  private async loadMLClassifier(): Promise<void> {
    // This would typically load a trained model from a model registry
    // For now, we'll use a placeholder that simulates ML analysis
    this.mlClassifier = {
      classify: async (content: string) => {
        // Simulated ML classification
        const features = this.extractFeatures(content);
        return {
          riskScore: features.riskScore,
          categories: features.categories,
          confidence: features.confidence
        };
      }
    };
  }

  /**
   * Extract features from content for ML classification
   */
  private extractFeatures(content: string): { riskScore: number; categories: string[]; confidence: number } {
    const text = content.toLowerCase();
    let riskScore = 0;
    const categories: string[] = [];
    
    // Check for high-risk patterns
    const highRiskPatterns = [
      /urgent.{0,10}act now/i,
      /limited.{0,10}time.{0,10}offer/i,
      /guarantee.{0,10}income/i,
      /make money fast/i,
      /no questions asked/i,
      /100% guaranteed/i,
      /risk.?free/i,
      /call now/i,
      /act immediately/i
    ];

    const personalDataPatterns = [
      /social security/i,
      /ssn/i,
      /credit card/i,
      /bank account/i,
      /passport/i,
      /driver.?license/i,
      /medical record/i
    ];

    const financialPatterns = [
      /loan/i,
      /credit/i,
      /investment/i,
      /mortgage/i,
      /insurance/i,
      /financial/i,
      /money/i,
      /payment/i
    ];

    // Calculate risk score
    highRiskPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        riskScore += 0.3;
        categories.push('HIGH_PRESSURE_TACTICS');
      }
    });

    personalDataPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        riskScore += 0.4;
        categories.push('PERSONAL_DATA');
      }
    });

    financialPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        riskScore += 0.2;
        categories.push('FINANCIAL_CONTENT');
      }
    });

    // Check content length and structure
    if (text.length > 2000) {
      riskScore += 0.1;
      categories.push('LENGTHY_CONTENT');
    }

    // Check for excessive capitalization
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.3) {
      riskScore += 0.2;
      categories.push('EXCESSIVE_CAPS');
    }

    // Normalize risk score
    riskScore = Math.min(riskScore, 1.0);

    return {
      riskScore,
      categories: [...new Set(categories)],
      confidence: 0.85 // Simulated confidence
    };
  }

  /**
   * Load regulation rules from configuration
   */
  async loadRules(): Promise<void> {
    const rules = await this.getDefaultRules();
    
    for (const rule of rules) {
      this.rules.set(rule.id, rule);
    }
    
    logger.info(`Loaded ${rules.length} regulation rules`);
  }

  /**
   * Get default regulation rules
   */
  private async getDefaultRules(): Promise<RegulationRuleType[]> {
    return [
      // GDPR Rules
      {
        id: 'gdpr_consent_required',
        regulation: 'GDPR',
        category: 'CONSENT',
        name: 'Explicit Consent Required',
        description: 'Processing personal data requires explicit consent',
        severity: 'HIGH',
        patterns: ['personal data', 'processing', 'email marketing'],
        suggestions: ['Obtain explicit consent', 'Provide clear opt-out mechanism'],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.0'
      },
      {
        id: 'gdpr_data_minimization',
        regulation: 'GDPR',
        category: 'DATA_MINIMIZATION',
        name: 'Data Minimization Principle',
        description: 'Only collect necessary personal data',
        severity: 'MEDIUM',
        patterns: ['excessive data collection', 'unnecessary information'],
        suggestions: ['Limit data collection to necessary fields', 'Justify data collection purpose'],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.0'
      },
      
      // CAN-SPAM Rules
      {
        id: 'canspam_sender_identification',
        regulation: 'CAN_SPAM',
        category: 'IDENTIFICATION',
        name: 'Clear Sender Identification',
        description: 'Emails must clearly identify the sender',
        severity: 'HIGH',
        patterns: ['from:', 'sender:', 'reply-to:'],
        suggestions: ['Include clear sender name', 'Use valid reply-to address', 'Include physical address'],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.0'
      },
      {
        id: 'canspam_subject_truthful',
        regulation: 'CAN_SPAM',
        category: 'SUBJECT_LINE',
        name: 'Truthful Subject Lines',
        description: 'Subject lines must not be misleading',
        severity: 'HIGH',
        patterns: ['misleading', 'deceptive', 'false claim'],
        suggestions: ['Use accurate subject lines', 'Avoid misleading claims', 'Match content to subject'],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.0'
      },
      {
        id: 'canspam_unsubscribe',
        regulation: 'CAN_SPAM',
        category: 'UNSUBSCRIBE',
        name: 'Clear Unsubscribe Mechanism',
        description: 'Must provide easy way to unsubscribe',
        severity: 'CRITICAL',
        patterns: ['unsubscribe', 'opt-out', 'remove'],
        suggestions: ['Include clear unsubscribe link', 'Process unsubscribe requests within 10 days'],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.0'
      },

      // CCPA Rules
      {
        id: 'ccpa_data_rights',
        regulation: 'CCPA',
        category: 'CONSUMER_RIGHTS',
        name: 'Consumer Data Rights',
        description: 'Inform consumers about their data rights',
        severity: 'HIGH',
        patterns: ['california resident', 'personal information', 'data rights'],
        suggestions: ['Provide privacy notice', 'Inform about deletion rights', 'Enable data portability'],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.0'
      },

      // CASL Rules
      {
        id: 'casl_express_consent',
        regulation: 'CASL',
        category: 'CONSENT',
        name: 'Express Consent Required',
        description: 'Commercial messages require express consent',
        severity: 'CRITICAL',
        patterns: ['canadian recipient', 'commercial message', 'electronic message'],
        suggestions: ['Obtain express consent', 'Keep consent records', 'Provide identification information'],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.0'
      },

      // General Compliance Rules
      {
        id: 'sensitive_data_detection',
        regulation: 'GDPR',
        category: 'SENSITIVE_DATA',
        name: 'Sensitive Data Detection',
        description: 'Detect and flag sensitive personal data',
        severity: 'CRITICAL',
        patterns: [
          'social security number', 'ssn', 'credit card', 'passport',
          'medical record', 'health information', 'racial origin', 'political opinion'
        ],
        suggestions: ['Remove sensitive data', 'Obtain special consent', 'Implement extra safeguards'],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.0'
      },
      {
        id: 'high_pressure_tactics',
        regulation: 'CAN_SPAM',
        category: 'MARKETING_PRACTICES',
        name: 'High Pressure Tactics Detection',
        description: 'Detect high-pressure or misleading marketing tactics',
        severity: 'HIGH',
        patterns: [
          'urgent', 'act now', 'limited time', 'expires today', 'last chance',
          'guaranteed income', 'make money fast', 'risk-free', '100% guaranteed'
        ],
        suggestions: ['Use honest marketing language', 'Avoid pressure tactics', 'Provide realistic expectations'],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.0'
      }
    ];
  }

  /**
   * Analyze content against regulation rules
   */
  async analyzeContent(
    content: string, 
    contentType: string, 
    targetRegulations: ComplianceRegulationType[]
  ): Promise<ContentAnalysisResultType> {
    
    if (!this.isInitialized) {
      throw new Error('Regulation Engine not initialized');
    }

    const contentId = this.generateContentId();
    const analysisTimestamp = new Date();
    
    // Get ML classification
    const mlResult = await this.mlClassifier.classify(content);
    
    // Apply regulation rules
    const risks = await this.applyRegulationRules(content, contentType, targetRegulations);
    
    // Calculate overall risk level
    const overallRiskLevel = this.calculateOverallRiskLevel(risks, mlResult.riskScore);
    
    // Determine recommended action
    const recommendedAction = this.determineRecommendedAction(overallRiskLevel, risks);
    
    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(risks, mlResult.riskScore);
    
    // Generate required modifications
    const requiredModifications = this.generateModificationSuggestions(risks);
    
    // Determine approved regulations
    const approvedRegulations = this.getApprovedRegulations(risks, targetRegulations);

    const result: ContentAnalysisResultType = {
      contentId,
      contentType: contentType as any,
      content,
      analysisTimestamp,
      risks,
      overallRiskLevel,
      recommendedAction,
      complianceScore,
      requiredModifications,
      approvedRegulations
    };

    // Log analysis
    logger.info('Content analysis completed', {
      contentId,
      overallRiskLevel,
      complianceScore,
      riskCount: risks.length
    });

    return result;
  }

  /**
   * Apply regulation rules to content
   */
  private async applyRegulationRules(
    content: string, 
    contentType: string, 
    targetRegulations: ComplianceRegulationType[]
  ): Promise<any[]> {
    const risks: any[] = [];
    const lowerContent = content.toLowerCase();

    for (const rule of this.rules.values()) {
      // Skip rules not in target regulations
      if (!targetRegulations.includes(rule.regulation)) continue;
      
      // Skip inactive rules
      if (!rule.isActive) continue;

      // Check if any patterns match
      const matchedPatterns = rule.patterns.filter(pattern => 
        lowerContent.includes(pattern.toLowerCase())
      );

      if (matchedPatterns.length > 0) {
        // Check for exceptions
        const hasException = rule.exceptions?.some(exception => 
          lowerContent.includes(exception.toLowerCase())
        );

        if (!hasException) {
          risks.push({
            regulation: rule.regulation,
            riskLevel: rule.severity,
            riskType: rule.category,
            description: rule.description,
            suggestions: rule.suggestions,
            confidence: this.calculatePatternConfidence(matchedPatterns, content),
            matchedPatterns,
            ruleName: rule.name
          });
        }
      }
    }

    return risks;
  }

  /**
   * Calculate confidence score for pattern matches
   */
  private calculatePatternConfidence(matchedPatterns: string[], content: string): number {
    const contentLength = content.length;
    const patternDensity = matchedPatterns.length / Math.max(contentLength / 100, 1);
    
    // Base confidence on pattern density and specificity
    let confidence = Math.min(0.5 + (patternDensity * 0.3), 0.95);
    
    // Adjust for pattern specificity
    const specificPatterns = matchedPatterns.filter(p => p.length > 10);
    confidence += specificPatterns.length * 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate overall risk level
   */
  private calculateOverallRiskLevel(risks: any[], mlRiskScore: number): ComplianceRiskLevelType {
    if (risks.length === 0 && mlRiskScore < 0.3) return 'LOW';
    
    const criticalRisks = risks.filter(r => r.riskLevel === 'CRITICAL').length;
    const highRisks = risks.filter(r => r.riskLevel === 'HIGH').length;
    
    if (criticalRisks > 0 || mlRiskScore > 0.8) return 'CRITICAL';
    if (highRisks > 0 || mlRiskScore > 0.6) return 'HIGH';
    if (risks.length > 0 || mlRiskScore > 0.3) return 'MEDIUM';
    
    return 'LOW';
  }

  /**
   * Determine recommended action
   */
  private determineRecommendedAction(
    overallRiskLevel: ComplianceRiskLevelType, 
    risks: any[]
  ): ComplianceActionType {
    switch (overallRiskLevel) {
      case 'CRITICAL':
        return 'REJECT';
      case 'HIGH':
        return this.config.strictMode ? 'REJECT' : 'REQUIRE_REVIEW';
      case 'MEDIUM':
        return 'REQUIRE_REVIEW';
      case 'LOW':
        return 'APPROVE';
      default:
        return 'REQUIRE_REVIEW';
    }
  }

  /**
   * Calculate compliance score (0-1, higher is better)
   */
  private calculateComplianceScore(risks: any[], mlRiskScore: number): number {
    const riskPenalty = risks.reduce((penalty, risk) => {
      switch (risk.riskLevel) {
        case 'CRITICAL': return penalty + 0.4;
        case 'HIGH': return penalty + 0.2;
        case 'MEDIUM': return penalty + 0.1;
        case 'LOW': return penalty + 0.05;
        default: return penalty;
      }
    }, 0);

    const mlPenalty = mlRiskScore * 0.3;
    const totalPenalty = Math.min(riskPenalty + mlPenalty, 1.0);
    
    return Math.max(1.0 - totalPenalty, 0.0);
  }

  /**
   * Generate modification suggestions
   */
  private generateModificationSuggestions(risks: any[]): string[] {
    const suggestions = new Set<string>();
    
    risks.forEach(risk => {
      risk.suggestions.forEach((suggestion: string) => suggestions.add(suggestion));
    });
    
    return Array.from(suggestions);
  }

  /**
   * Get approved regulations (those with no critical violations)
   */
  private getApprovedRegulations(risks: any[], targetRegulations: ComplianceRegulationType[]): ComplianceRegulationType[] {
    const violatedRegulations = new Set(
      risks
        .filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH')
        .map(r => r.regulation)
    );
    
    return targetRegulations.filter(reg => !violatedRegulations.has(reg));
  }

  /**
   * Set up dynamic rule updates
   */
  private setupRuleUpdates(): void {
    // This would typically connect to a regulatory update service
    // For now, we'll simulate periodic checks
    setInterval(async () => {
      await this.checkForRegulatoryUpdates();
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  /**
   * Check for regulatory updates
   */
  private async checkForRegulatoryUpdates(): Promise<void> {
    try {
      // This would typically call an external regulatory update service
      const updates = await this.fetchRegulatoryUpdates();
      
      for (const update of updates) {
        await this.processRegulatoryUpdate(update);
      }
    } catch (error) {
      logger.error('Failed to check for regulatory updates', { error });
    }
  }

  /**
   * Fetch regulatory updates from external service
   */
  private async fetchRegulatoryUpdates(): Promise<RegulatoryUpdateType[]> {
    // Simulated regulatory updates
    return [];
  }

  /**
   * Process a regulatory update
   */
  private async processRegulatoryUpdate(update: RegulatoryUpdateType): Promise<void> {
    logger.info('Processing regulatory update', { 
      regulation: update.regulation, 
      updateType: update.updateType 
    });

    // Update rules based on regulatory change
    switch (update.updateType) {
      case 'NEW_RULE':
        await this.addNewRule(update);
        break;
      case 'RULE_MODIFICATION':
        await this.modifyRule(update);
        break;
      case 'RULE_REMOVAL':
        await this.removeRule(update);
        break;
    }

    // Emit update event
    this.emit('regulationUpdated', {
      regulation: update.regulation,
      updateType: update.updateType,
      impact: update.impact,
      actionRequired: update.actionRequired
    });
  }

  /**
   * Add new regulation rule
   */
  private async addNewRule(update: RegulatoryUpdateType): Promise<void> {
    // Implementation would create new rule based on update
    logger.info('Adding new regulation rule', { regulation: update.regulation });
  }

  /**
   * Modify existing regulation rule
   */
  private async modifyRule(update: RegulatoryUpdateType): Promise<void> {
    // Implementation would modify existing rules
    logger.info('Modifying regulation rule', { regulation: update.regulation });
  }

  /**
   * Remove regulation rule
   */
  private async removeRule(update: RegulatoryUpdateType): Promise<void> {
    // Implementation would remove/deactivate rules
    logger.info('Removing regulation rule', { regulation: update.regulation });
  }

  /**
   * Generate unique content ID
   */
  private generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get regulation statistics
   */
  getRegulationStats(): any {
    const stats = {
      totalRules: this.rules.size,
      activeRules: 0,
      rulesByRegulation: new Map<ComplianceRegulationType, number>(),
      rulesByCategory: new Map<string, number>(),
      rulesBySeverity: new Map<string, number>()
    };

    for (const rule of this.rules.values()) {
      if (rule.isActive) stats.activeRules++;
      
      // Count by regulation
      const regCount = stats.rulesByRegulation.get(rule.regulation) || 0;
      stats.rulesByRegulation.set(rule.regulation, regCount + 1);
      
      // Count by category
      const catCount = stats.rulesByCategory.get(rule.category) || 0;
      stats.rulesByCategory.set(rule.category, catCount + 1);
      
      // Count by severity
      const sevCount = stats.rulesBySeverity.get(rule.severity) || 0;
      stats.rulesBySeverity.set(rule.severity, sevCount + 1);
    }

    return {
      ...stats,
      rulesByRegulation: Object.fromEntries(stats.rulesByRegulation),
      rulesByCategory: Object.fromEntries(stats.rulesByCategory),
      rulesBySeverity: Object.fromEntries(stats.rulesBySeverity)
    };
  }

  /**
   * Shutdown the regulation engine
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Regulation Engine');
    this.isInitialized = false;
    this.removeAllListeners();
  }
}