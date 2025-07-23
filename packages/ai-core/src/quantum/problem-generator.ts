/**
 * Problem Generator
 *
 * Generates optimization problems for different scenarios in the IQ24.ai platform.
 * Creates campaign optimization, resource allocation, and prospect prioritization problems
 * with realistic constraints and objectives.
 */

import {
  OptimizationProblem,
  CampaignOptimizationProblem,
  ResourceAllocationProblem,
  ProspectPrioritizationProblem,
  ChannelOptimizationProblem,
  TimingOptimizationProblem,
  OptimizationObjective,
  OptimizationConstraint,
  Channel,
  Resource,
  Prospect,
  ScoringCriterion,
} from "./types";

export interface ProblemGeneratorConfig {
  randomSeed?: number;
  defaultTimeHorizon: number;
  defaultBudgetRange: [number, number];
  defaultProspectCount: number;
  defaultChannelCount: number;
  defaultResourceCount: number;
}

export interface CampaignGenerationParams {
  channels: string[];
  budget: number;
  timeHorizon: number;
  objectives: string[];
  constraints: Record<string, any>;
  targetAudience?: {
    size: number;
    segments: string[];
    characteristics: Record<string, any>;
  };
}

export interface ResourceGenerationParams {
  resources: Array<{
    id: string;
    type: "human" | "financial" | "technological";
    capacity: number;
    cost: number;
  }>;
  totalBudget: number;
  constraints: Record<string, any>;
}

export interface ProspectGenerationParams {
  prospectCount: number;
  scoringCriteria: string[];
  industryFilter?: string[];
  sizeFilter?: string[];
  locationFilter?: string[];
}

export class ProblemGenerator {
  private config: ProblemGeneratorConfig;
  private random: () => number;

  constructor(config: Partial<ProblemGeneratorConfig> = {}) {
    this.config = {
      randomSeed: config.randomSeed || Date.now(),
      defaultTimeHorizon: 30, // 30 days
      defaultBudgetRange: [1000, 100000],
      defaultProspectCount: 1000,
      defaultChannelCount: 5,
      defaultResourceCount: 10,
      ...config,
    };

    // Seeded random number generator
    let seed = this.config.randomSeed!;
    this.random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  /**
   * Generate a campaign optimization problem
   */
  generateCampaignOptimizationProblem(
    id: string,
    params?: Partial<CampaignGenerationParams>,
  ): CampaignOptimizationProblem {
    const defaultParams: CampaignGenerationParams = {
      channels: ["email", "linkedin", "phone", "direct_mail", "social_media"],
      budget: this.randomBetween(
        this.config.defaultBudgetRange[0],
        this.config.defaultBudgetRange[1],
      ),
      timeHorizon: this.config.defaultTimeHorizon,
      objectives: ["conversion_rate", "cost_per_lead", "roi"],
      constraints: {},
    };

    const finalParams = { ...defaultParams, ...params };

    // Generate channels
    const channels: Channel[] = finalParams.channels.map(
      (channelName, index) => ({
        id: `channel_${index}`,
        name: channelName,
        cost: this.randomBetween(0.5, 5.0),
        capacity: this.randomBetween(100, 1000),
        effectiveness: this.random(),
        constraints: {
          minBudget: this.randomBetween(100, 500),
          maxBudget: finalParams.budget * 0.5,
          availableTimeSlots: this.generateTimeSlots(),
        },
      }),
    );

    // Generate objectives
    const objectives: OptimizationObjective[] = finalParams.objectives.map(
      (objName) => ({
        name: objName,
        weight: this.random(),
        target: this.generateObjectiveTarget(objName),
        constraint: this.generateObjectiveConstraint(objName),
      }),
    );

    // Generate constraints
    const constraints: OptimizationConstraint[] = [
      {
        name: "budget_constraint",
        type: "inequality",
        expression: "sum(channel_budgets) <= total_budget",
        limit: finalParams.budget,
        penalty: 1000,
      },
      {
        name: "channel_minimum",
        type: "inequality",
        expression: "each(channel_budget) >= channel_min_budget",
        limit: 0,
        penalty: 500,
      },
      {
        name: "time_constraint",
        type: "inequality",
        expression: "campaign_duration <= max_duration",
        limit: finalParams.timeHorizon,
        penalty: 100,
      },
    ];

    return {
      id,
      type: "campaign_optimization",
      name: `Campaign Optimization - ${id}`,
      description:
        "Optimize B2B campaign across multiple channels for maximum ROI",
      objectives,
      constraints,
      variables: {
        channelBudgets: channels.map((c) => ({
          name: c.id,
          type: "continuous",
          min: 0,
          max: finalParams.budget,
        })),
        messagingStrategy: {
          name: "messaging_strategy",
          type: "discrete",
          values: [
            "direct",
            "educational",
            "consultative",
            "social_proof",
            "urgency",
          ],
        },
        timing: {
          name: "timing",
          type: "discrete",
          values: this.generateTimingOptions(),
        },
        sequenceSteps: {
          name: "sequence_steps",
          type: "integer",
          min: 1,
          max: 10,
        },
      },
      channels,
      targetAudience:
        finalParams.targetAudience || this.generateTargetAudience(),
      timeHorizon: finalParams.timeHorizon,
      budget: finalParams.budget,
      expectedROI: this.randomBetween(1.5, 5.0),
      metadata: {
        createdAt: Date.now(),
        difficulty: "medium",
        estimatedSolutionTime: 30000,
      },
    };
  }

  /**
   * Generate a resource allocation problem
   */
  generateResourceAllocationProblem(
    id: string,
    params?: Partial<ResourceGenerationParams>,
  ): ResourceAllocationProblem {
    const resourceCount =
      params?.resources?.length || this.config.defaultResourceCount;
    const totalBudget =
      params?.totalBudget || this.randomBetween(50000, 500000);

    // Generate resources
    const resources: Resource[] = (
      params?.resources || this.generateDefaultResources(resourceCount)
    ).map((res, index) => ({
      id: res.id || `resource_${index}`,
      name: res.id || `Resource ${index + 1}`,
      type: res.type,
      capacity: res.capacity,
      cost: res.cost,
      efficiency: this.random(),
      availability: this.random() * 0.5 + 0.5, // 50-100% availability
      constraints: {
        minAllocation: res.cost * 0.1,
        maxAllocation: totalBudget * 0.3,
        requiredSkills: this.generateSkillRequirements(res.type),
      },
    }));

    // Generate objectives
    const objectives: OptimizationObjective[] = [
      {
        name: "maximize_output",
        weight: 0.4,
        target: totalBudget * 2, // 200% output target
        constraint: { type: "inequality", operator: ">=", value: totalBudget },
      },
      {
        name: "minimize_cost",
        weight: 0.3,
        target: totalBudget * 0.8, // 80% of budget
        constraint: { type: "inequality", operator: "<=", value: totalBudget },
      },
      {
        name: "balance_utilization",
        weight: 0.3,
        target: 0.8, // 80% utilization target
        constraint: { type: "equality", operator: "==", value: 0.8 },
      },
    ];

    // Generate constraints
    const constraints: OptimizationConstraint[] = [
      {
        name: "budget_constraint",
        type: "equality",
        expression: "sum(resource_allocations) <= total_budget",
        limit: totalBudget,
        penalty: 2000,
      },
      {
        name: "capacity_constraint",
        type: "inequality",
        expression: "allocation <= capacity * availability",
        limit: 1,
        penalty: 1000,
      },
      {
        name: "minimum_allocation",
        type: "inequality",
        expression: "allocation >= min_allocation",
        limit: 0,
        penalty: 500,
      },
    ];

    return {
      id,
      type: "resource_allocation",
      name: `Resource Allocation - ${id}`,
      description: "Optimize resource allocation across teams and channels",
      objectives,
      constraints,
      variables: {
        allocation: resources.map((r) => ({
          name: r.id,
          type: "continuous",
          min: r.constraints.minAllocation,
          max: r.constraints.maxAllocation,
        })),
      },
      resources,
      totalBudget,
      allocationPeriod: 30, // 30 days
      priority: "high",
      metadata: {
        createdAt: Date.now(),
        difficulty: "high",
        estimatedSolutionTime: 45000,
      },
    };
  }

  /**
   * Generate a prospect prioritization problem
   */
  generateProspectPrioritizationProblem(
    id: string,
    params?: Partial<ProspectGenerationParams>,
  ): ProspectPrioritizationProblem {
    const defaultParams: ProspectGenerationParams = {
      prospectCount: this.config.defaultProspectCount,
      scoringCriteria: [
        "company_size",
        "industry_fit",
        "budget_authority",
        "timing",
        "pain_points",
        "engagement_level",
      ],
    };

    const finalParams = { ...defaultParams, ...params };

    // Generate prospects
    const prospects: Prospect[] = Array.from(
      { length: finalParams.prospectCount },
      (_, index) => ({
        id: `prospect_${index}`,
        name: `Company ${index + 1}`,
        industry: this.selectRandomElement([
          "technology",
          "healthcare",
          "finance",
          "retail",
          "manufacturing",
        ]),
        size: this.selectRandomElement([
          "startup",
          "small",
          "medium",
          "large",
          "enterprise",
        ]),
        location: this.selectRandomElement([
          "north_america",
          "europe",
          "asia_pacific",
          "latin_america",
        ]),
        attributes: {
          revenue: this.randomBetween(1000000, 1000000000),
          employees: this.randomBetween(10, 50000),
          growthRate: this.random(),
          techAdoption: this.random(),
          budgetCycle: this.selectRandomElement(["q1", "q2", "q3", "q4"]),
          decisionTimeframe: this.randomBetween(30, 365),
        },
        engagementHistory: {
          emailOpens: Math.floor(this.random() * 10),
          websiteVisits: Math.floor(this.random() * 20),
          contentDownloads: Math.floor(this.random() * 5),
          socialEngagement: this.random(),
        },
        contactInfo: {
          email: `contact@company${index + 1}.com`,
          phone: `+1-555-${String(Math.floor(this.random() * 10000)).padStart(4, "0")}`,
          linkedinUrl: `https://linkedin.com/company/company${index + 1}`,
        },
      }),
    );

    // Generate scoring criteria
    const scoringCriteria: ScoringCriterion[] = finalParams.scoringCriteria.map(
      (criterionName) => ({
        name: criterionName,
        weight: this.random(),
        type: this.getCriterionType(criterionName),
        scale: [0, 100],
        threshold: this.randomBetween(20, 80),
      }),
    );

    // Generate objectives
    const objectives: OptimizationObjective[] = [
      {
        name: "maximize_conversion_probability",
        weight: 0.5,
        target: 0.25, // 25% conversion target
        constraint: { type: "inequality", operator: ">=", value: 0.1 },
      },
      {
        name: "optimize_resource_efficiency",
        weight: 0.3,
        target: 0.8, // 80% efficiency target
        constraint: { type: "inequality", operator: ">=", value: 0.6 },
      },
      {
        name: "balance_risk_reward",
        weight: 0.2,
        target: 0.7, // 70% risk-adjusted return
        constraint: { type: "inequality", operator: ">=", value: 0.5 },
      },
    ];

    // Generate constraints
    const constraints: OptimizationConstraint[] = [
      {
        name: "capacity_constraint",
        type: "inequality",
        expression: "sum(selected_prospects) <= max_capacity",
        limit: Math.floor(finalParams.prospectCount * 0.2), // Only 20% can be high priority
        penalty: 1500,
      },
      {
        name: "diversity_constraint",
        type: "inequality",
        expression: "industry_diversity >= min_diversity",
        limit: 0.3, // At least 30% diversity
        penalty: 800,
      },
      {
        name: "quality_threshold",
        type: "inequality",
        expression: "prospect_score >= min_score",
        limit: 60, // Minimum score of 60
        penalty: 1200,
      },
    ];

    return {
      id,
      type: "prospect_prioritization",
      name: `Prospect Prioritization - ${id}`,
      description:
        "Prioritize prospects based on conversion probability and resource efficiency",
      objectives,
      constraints,
      variables: {
        scores: prospects.map((p) => ({
          name: `score_${p.id}`,
          type: "continuous",
          min: 0,
          max: 100,
        })),
        priorities: prospects.map((p) => ({
          name: `priority_${p.id}`,
          type: "discrete",
          values: ["low", "medium", "high"],
        })),
      },
      prospects,
      scoringCriteria,
      targetConversionRate: 0.25,
      maxCapacity: Math.floor(finalParams.prospectCount * 0.2),
      metadata: {
        createdAt: Date.now(),
        difficulty: "medium",
        estimatedSolutionTime: 25000,
      },
    };
  }

  /**
   * Generate a channel optimization problem
   */
  generateChannelOptimizationProblem(
    id: string,
    channels: string[] = ["email", "linkedin", "phone", "direct_mail"],
  ): ChannelOptimizationProblem {
    const channelData: Channel[] = channels.map((channelName, index) => ({
      id: `channel_${index}`,
      name: channelName,
      cost: this.randomBetween(0.5, 5.0),
      capacity: this.randomBetween(100, 1000),
      effectiveness: this.random(),
      constraints: {
        minBudget: this.randomBetween(100, 500),
        maxBudget: 10000,
        availableTimeSlots: this.generateTimeSlots(),
      },
    }));

    const objectives: OptimizationObjective[] = [
      {
        name: "maximize_reach",
        weight: 0.4,
        target: 5000,
        constraint: { type: "inequality", operator: ">=", value: 1000 },
      },
      {
        name: "optimize_cost_efficiency",
        weight: 0.6,
        target: 2.0, // $2 per lead target
        constraint: { type: "inequality", operator: "<=", value: 5.0 },
      },
    ];

    const constraints: OptimizationConstraint[] = [
      {
        name: "channel_synergy",
        type: "inequality",
        expression: "channel_combination_effect >= min_synergy",
        limit: 1.2,
        penalty: 800,
      },
    ];

    return {
      id,
      type: "channel_optimization",
      name: `Channel Optimization - ${id}`,
      description:
        "Optimize channel mix and sequencing for maximum effectiveness",
      objectives,
      constraints,
      variables: {
        channelWeights: channelData.map((c) => ({
          name: c.id,
          type: "continuous",
          min: 0,
          max: 1,
        })),
        sequenceOrder: channelData.map((c, i) => ({
          name: `order_${c.id}`,
          type: "integer",
          min: 1,
          max: channels.length,
        })),
      },
      channels: channelData,
      synergies: this.generateChannelSynergies(channelData),
      targetAudience: this.generateTargetAudience(),
      metadata: {
        createdAt: Date.now(),
        difficulty: "low",
        estimatedSolutionTime: 15000,
      },
    };
  }

  /**
   * Generate a timing optimization problem
   */
  generateTimingOptimizationProblem(
    id: string,
    timeHorizon: number = 30,
  ): TimingOptimizationProblem {
    const timeSlots = this.generateDetailedTimeSlots(timeHorizon);

    const objectives: OptimizationObjective[] = [
      {
        name: "maximize_engagement",
        weight: 0.5,
        target: 0.15, // 15% engagement rate
        constraint: { type: "inequality", operator: ">=", value: 0.05 },
      },
      {
        name: "optimize_timing_spread",
        weight: 0.3,
        target: 0.8, // 80% time coverage
        constraint: { type: "inequality", operator: ">=", value: 0.5 },
      },
      {
        name: "minimize_overlap",
        weight: 0.2,
        target: 0.1, // 10% maximum overlap
        constraint: { type: "inequality", operator: "<=", value: 0.2 },
      },
    ];

    const constraints: OptimizationConstraint[] = [
      {
        name: "frequency_limit",
        type: "inequality",
        expression: "contacts_per_day <= max_daily_contacts",
        limit: 10,
        penalty: 1000,
      },
      {
        name: "business_hours",
        type: "inequality",
        expression: "contact_time in business_hours",
        limit: 1,
        penalty: 500,
      },
    ];

    return {
      id,
      type: "timing_optimization",
      name: `Timing Optimization - ${id}`,
      description: "Optimize outreach timing across time zones and schedules",
      objectives,
      constraints,
      variables: {
        timeSlots: timeSlots.map((ts) => ({
          name: ts.id,
          type: "binary",
          min: 0,
          max: 1,
        })),
        frequency: { name: "frequency", type: "integer", min: 1, max: 5 },
      },
      timeSlots,
      timeZones: [
        "America/New_York",
        "America/Los_Angeles",
        "Europe/London",
        "Asia/Tokyo",
      ],
      businessHours: { start: 9, end: 17 },
      metadata: {
        createdAt: Date.now(),
        difficulty: "medium",
        estimatedSolutionTime: 20000,
      },
    };
  }

  /**
   * Generate a batch of mixed optimization problems
   */
  generateProblemBatch(
    count: number,
    types: Array<
      "campaign" | "resource" | "prospect" | "channel" | "timing"
    > = ["campaign", "resource", "prospect"],
  ): OptimizationProblem[] {
    const problems: OptimizationProblem[] = [];

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const id = `${type}_problem_${i}`;

      switch (type) {
        case "campaign":
          problems.push(this.generateCampaignOptimizationProblem(id));
          break;
        case "resource":
          problems.push(this.generateResourceAllocationProblem(id));
          break;
        case "prospect":
          problems.push(this.generateProspectPrioritizationProblem(id));
          break;
        case "channel":
          problems.push(this.generateChannelOptimizationProblem(id));
          break;
        case "timing":
          problems.push(this.generateTimingOptimizationProblem(id));
          break;
      }
    }

    return problems;
  }

  // Helper methods
  private randomBetween(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  private selectRandomElement<T>(array: T[]): T {
    return array[Math.floor(this.random() * array.length)];
  }

  private generateObjectiveTarget(objectiveName: string): number {
    const targets: Record<string, number> = {
      conversion_rate: this.randomBetween(0.05, 0.25),
      cost_per_lead: this.randomBetween(10, 200),
      roi: this.randomBetween(1.5, 5.0),
      engagement_rate: this.randomBetween(0.1, 0.3),
      response_rate: this.randomBetween(0.02, 0.15),
    };
    return targets[objectiveName] || this.random();
  }

  private generateObjectiveConstraint(objectiveName: string): any {
    return {
      type: "inequality",
      operator: objectiveName.includes("cost") ? "<=" : ">=",
      value: this.generateObjectiveTarget(objectiveName) * 0.8,
    };
  }

  private generateTimeSlots(): string[] {
    return ["9:00-11:00", "11:00-13:00", "13:00-15:00", "15:00-17:00"];
  }

  private generateDetailedTimeSlots(
    days: number,
  ): Array<{ id: string; day: number; hour: number; effectiveness: number }> {
    const slots = [];
    for (let day = 0; day < days; day++) {
      for (let hour = 9; hour < 17; hour++) {
        slots.push({
          id: `slot_${day}_${hour}`,
          day,
          hour,
          effectiveness: this.random(),
        });
      }
    }
    return slots;
  }

  private generateTimingOptions(): string[] {
    return [
      "morning_weekday",
      "afternoon_weekday",
      "morning_weekend",
      "afternoon_weekend",
      "evening_weekday",
    ];
  }

  private generateTargetAudience(): any {
    return {
      size: Math.floor(this.randomBetween(1000, 100000)),
      segments: ["enterprise", "mid_market", "small_business"],
      characteristics: {
        industries: ["technology", "healthcare", "finance"],
        roles: ["ceo", "cto", "marketing_director", "sales_director"],
        companySize: [100, 5000],
        revenue: [1000000, 100000000],
      },
    };
  }

  private generateDefaultResources(
    count: number,
  ): Array<{
    id: string;
    type: "human" | "financial" | "technological";
    capacity: number;
    cost: number;
  }> {
    const resources = [];
    const types: Array<"human" | "financial" | "technological"> = [
      "human",
      "financial",
      "technological",
    ];

    for (let i = 0; i < count; i++) {
      resources.push({
        id: `resource_${i}`,
        type: types[i % types.length],
        capacity: this.randomBetween(100, 1000),
        cost: this.randomBetween(1000, 50000),
      });
    }

    return resources;
  }

  private generateSkillRequirements(
    type: "human" | "financial" | "technological",
  ): string[] {
    const skillMap = {
      human: ["sales", "marketing", "customer_success", "business_development"],
      financial: ["budgeting", "forecasting", "analysis", "reporting"],
      technological: [
        "data_analysis",
        "automation",
        "integration",
        "optimization",
      ],
    };
    return skillMap[type] || [];
  }

  private getCriterionType(
    criterionName: string,
  ): "numerical" | "categorical" | "boolean" {
    const numericalCriteria = [
      "company_size",
      "budget_authority",
      "engagement_level",
    ];
    const categoricalCriteria = ["industry_fit", "pain_points"];

    if (numericalCriteria.includes(criterionName)) return "numerical";
    if (categoricalCriteria.includes(criterionName)) return "categorical";
    return "boolean";
  }

  private generateChannelSynergies(
    channels: Channel[],
  ): Array<{ channel1: string; channel2: string; synergy: number }> {
    const synergies = [];
    for (let i = 0; i < channels.length; i++) {
      for (let j = i + 1; j < channels.length; j++) {
        synergies.push({
          channel1: channels[i].id,
          channel2: channels[j].id,
          synergy: this.randomBetween(0.8, 1.5), // Synergy multiplier
        });
      }
    }
    return synergies;
  }

  /**
   * Validate generated problem
   */
  validateProblem(problem: OptimizationProblem): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required fields
    if (!problem.id) errors.push("Problem ID is required");
    if (!problem.type) errors.push("Problem type is required");
    if (!problem.objectives || problem.objectives.length === 0)
      errors.push("At least one objective is required");
    if (!problem.constraints) errors.push("Constraints are required");
    if (!problem.variables) errors.push("Variables are required");

    // Validate objectives
    const totalWeight = problem.objectives.reduce(
      (sum, obj) => sum + obj.weight,
      0,
    );
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      errors.push("Objective weights must sum to 1.0");
    }

    // Validate constraints
    for (const constraint of problem.constraints) {
      if (!constraint.name) errors.push("Constraint name is required");
      if (!constraint.expression)
        errors.push("Constraint expression is required");
      if (constraint.penalty <= 0)
        errors.push("Constraint penalty must be positive");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get problem statistics
   */
  getProblemStatistics(problems: OptimizationProblem[]): {
    totalProblems: number;
    byType: Record<string, number>;
    avgObjectives: number;
    avgConstraints: number;
    complexityDistribution: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    let totalObjectives = 0;
    let totalConstraints = 0;
    const complexityDistribution: Record<string, number> = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    for (const problem of problems) {
      byType[problem.type] = (byType[problem.type] || 0) + 1;
      totalObjectives += problem.objectives.length;
      totalConstraints += problem.constraints.length;

      const difficulty = problem.metadata?.difficulty || "medium";
      complexityDistribution[difficulty] =
        (complexityDistribution[difficulty] || 0) + 1;
    }

    return {
      totalProblems: problems.length,
      byType,
      avgObjectives: totalObjectives / problems.length,
      avgConstraints: totalConstraints / problems.length,
      complexityDistribution,
    };
  }
}
