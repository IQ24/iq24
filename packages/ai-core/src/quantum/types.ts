/**
 * Quantum-Inspired Optimization Engine (QOE) Type Definitions
 *
 * Defines types for quantum-inspired algorithms used in campaign optimization,
 * resource allocation, and multi-objective decision making for IQ24.ai platform.
 */

// ==================== Core Quantum Types ====================

/**
 * Represents a quantum-inspired state with probability amplitudes
 */
export interface QuantumState {
  readonly id: string;
  readonly amplitudes: Complex[];
  readonly dimensions: number;
  readonly measurementProbabilities: number[];
  readonly entanglements: QuantumEntanglement[];
}

/**
 * Complex number representation for quantum amplitudes
 */
export interface Complex {
  readonly real: number;
  readonly imaginary: number;
}

/**
 * Quantum entanglement between different optimization variables
 */
export interface QuantumEntanglement {
  readonly variableA: string;
  readonly variableB: string;
  readonly correlationStrength: number;
  readonly type: "positive" | "negative" | "complex";
}

// ==================== Optimization Problem Types ====================

/**
 * Multi-objective optimization problem definition
 */
export interface OptimizationProblem {
  readonly id: string;
  readonly name: string;
  readonly type: OptimizationProblemType;
  readonly objectives: OptimizationObjective[];
  readonly constraints: OptimizationConstraint[];
  readonly variables: OptimizationVariable[];
  readonly quantumProperties: QuantumProblemProperties;
}

export type OptimizationProblemType =
  | "campaign_strategy"
  | "resource_allocation"
  | "prospect_prioritization"
  | "channel_optimization"
  | "timing_optimization"
  | "content_optimization"
  | "budget_allocation"
  | "pipeline_optimization";

/**
 * Individual optimization objective
 */
export interface OptimizationObjective {
  readonly id: string;
  readonly name: string;
  readonly type: ObjectiveType;
  readonly weight: number;
  readonly target: number;
  readonly minimizeOrMaximize: "minimize" | "maximize";
  readonly quantumInfluence: number; // 0-1 scale of quantum effects
}

export type ObjectiveType =
  | "conversion_rate"
  | "cost_per_lead"
  | "engagement_rate"
  | "pipeline_velocity"
  | "roi"
  | "compliance_score"
  | "customer_satisfaction"
  | "resource_efficiency";

/**
 * Optimization constraint definition
 */
export interface OptimizationConstraint {
  readonly id: string;
  readonly name: string;
  readonly type: ConstraintType;
  readonly bounds: ConstraintBounds;
  readonly quantumFlexibility: number; // 0-1 scale allowing quantum tunneling through constraints
}

export type ConstraintType =
  | "budget_limit"
  | "time_limit"
  | "resource_capacity"
  | "compliance_requirement"
  | "quality_threshold"
  | "rate_limit";

export interface ConstraintBounds {
  readonly min?: number;
  readonly max?: number;
  readonly exact?: number;
  readonly allowedValues?: number[];
}

/**
 * Optimization variable with quantum properties
 */
export interface OptimizationVariable {
  readonly id: string;
  readonly name: string;
  readonly type: VariableType;
  readonly domain: VariableDomain;
  readonly quantumSuperposition: boolean;
  readonly coherenceTime: number; // Time before quantum decoherence
}

export type VariableType =
  | "continuous"
  | "discrete"
  | "binary"
  | "categorical"
  | "quantum_superposition";

export interface VariableDomain {
  readonly min?: number;
  readonly max?: number;
  readonly allowedValues?: (string | number)[];
  readonly probabilityDistribution?: ProbabilityDistribution;
}

export interface ProbabilityDistribution {
  readonly type: "uniform" | "normal" | "exponential" | "custom";
  readonly parameters: Record<string, number>;
}

/**
 * Quantum-specific properties of optimization problem
 */
export interface QuantumProblemProperties {
  readonly useQuantumAnnealing: boolean;
  readonly useQuantumApproximation: boolean;
  readonly useQuantumWalk: boolean;
  readonly quantumDepth: number;
  readonly entanglementMap: QuantumEntanglement[];
  readonly decoherenceRate: number;
}

// ==================== Algorithm Types ====================

/**
 * Quantum-inspired algorithm configuration
 */
export interface QuantumAlgorithmConfig {
  readonly algorithm: QuantumAlgorithmType;
  readonly parameters: QuantumAlgorithmParameters;
  readonly hybridClassical: boolean;
  readonly quantumAdvantage: boolean;
}

export type QuantumAlgorithmType =
  | "quantum_annealing"
  | "quantum_approximate_optimization"
  | "quantum_walk"
  | "variational_quantum_eigensolver"
  | "quantum_neural_network"
  | "adiabatic_quantum_computation";

/**
 * Algorithm-specific parameters
 */
export interface QuantumAlgorithmParameters {
  readonly iterations: number;
  readonly temperature?: number; // For annealing
  readonly coolingSchedule?: CoolingSchedule;
  readonly circuitDepth?: number; // For QAOA
  readonly variationalParameters?: number[];
  readonly quantumWalkSteps?: number;
  readonly convergenceThreshold: number;
}

export interface CoolingSchedule {
  readonly type: "linear" | "exponential" | "logarithmic" | "adaptive";
  readonly initialTemperature: number;
  readonly finalTemperature: number;
  readonly rate: number;
}

// ==================== Solution Types ====================

/**
 * Quantum optimization solution
 */
export interface QuantumOptimizationSolution {
  readonly id: string;
  readonly problemId: string;
  readonly algorithm: QuantumAlgorithmType;
  readonly solution: OptimizationSolution;
  readonly quantumMetrics: QuantumSolutionMetrics;
  readonly classicalComparison?: ClassicalSolutionComparison;
  readonly timestamp: Date;
  readonly computationTime: number;
}

/**
 * Classical optimization solution structure
 */
export interface OptimizationSolution {
  readonly variables: Record<string, number | string>;
  readonly objectiveValues: Record<string, number>;
  readonly overallScore: number;
  readonly feasible: boolean;
  readonly confidence: number;
  readonly alternativeSolutions: AlternativeSolution[];
}

export interface AlternativeSolution {
  readonly variables: Record<string, number | string>;
  readonly score: number;
  readonly probability: number;
  readonly description: string;
}

/**
 * Quantum-specific solution metrics
 */
export interface QuantumSolutionMetrics {
  readonly quantumAdvantage: number; // Speedup vs classical
  readonly coherenceUtilization: number;
  readonly entanglementUtilization: number;
  readonly quantumErrorRate: number;
  readonly superpositionStates: number;
  readonly measurementResults: QuantumMeasurement[];
}

export interface QuantumMeasurement {
  readonly state: string;
  readonly probability: number;
  readonly energy: number;
  readonly measurementCount: number;
}

/**
 * Comparison with classical algorithms
 */
export interface ClassicalSolutionComparison {
  readonly classicalScore: number;
  readonly quantumScore: number;
  readonly improvement: number;
  readonly classicalAlgorithm: string;
  readonly classicalComputationTime: number;
  readonly quantumSpeedup: number;
}

// ==================== QOE Engine Configuration ====================

/**
 * Main Quantum Optimization Engine configuration
 */
export interface QOEConfig {
  readonly enabled: boolean;
  readonly quantumSimulator: QuantumSimulatorConfig;
  readonly algorithms: QuantumAlgorithmConfig[];
  readonly optimization: QOEOptimizationConfig;
  readonly performance: QOEPerformanceConfig;
  readonly fallback: QOEFallbackConfig;
}

export interface QuantumSimulatorConfig {
  readonly type: "local_simulator" | "cloud_simulator" | "hybrid";
  readonly qubits: number;
  readonly noiseModel: QuantumNoiseModel;
  readonly provider?: "qiskit" | "cirq" | "pennylane" | "custom";
}

export interface QuantumNoiseModel {
  readonly enabled: boolean;
  readonly gateErrorRate: number;
  readonly measurementErrorRate: number;
  readonly decoherenceTime: number;
  readonly thermalNoise: boolean;
}

export interface QOEOptimizationConfig {
  readonly defaultAlgorithm: QuantumAlgorithmType;
  readonly maxIterations: number;
  readonly convergenceThreshold: number;
  readonly parallelExecution: boolean;
  readonly hybridOptimization: boolean;
  readonly quantumClassicalRatio: number;
}

export interface QOEPerformanceConfig {
  readonly caching: {
    readonly enabled: boolean;
    readonly maxCacheSize: number;
    readonly ttl: number;
  };
  readonly precomputation: {
    readonly enabled: boolean;
    readonly commonProblems: string[];
  };
  readonly monitoring: {
    readonly enabled: boolean;
    readonly metricsCollection: boolean;
    readonly alertThresholds: Record<string, number>;
  };
}

export interface QOEFallbackConfig {
  readonly useClassicalFallback: boolean;
  readonly fallbackTriggers: FallbackTrigger[];
  readonly classicalAlgorithms: ClassicalAlgorithmType[];
}

export interface FallbackTrigger {
  readonly condition:
    | "timeout"
    | "error"
    | "poor_convergence"
    | "resource_limit";
  readonly threshold: number;
  readonly action: "switch_to_classical" | "hybrid_mode" | "simplified_quantum";
}

export type ClassicalAlgorithmType =
  | "genetic_algorithm"
  | "simulated_annealing"
  | "particle_swarm"
  | "gradient_descent"
  | "nelder_mead"
  | "differential_evolution";

// ==================== Campaign-Specific Types ====================

/**
 * Campaign optimization problem with IQ24.ai-specific context
 */
export interface CampaignOptimizationProblem extends OptimizationProblem {
  readonly campaignId: string;
  readonly prospectCount: number;
  readonly channels: CampaignChannel[];
  readonly timeline: CampaignTimeline;
  readonly budget: CampaignBudget;
  readonly compliance: ComplianceRequirements;
}

export interface CampaignChannel {
  readonly id: string;
  readonly type:
    | "email"
    | "linkedin"
    | "phone"
    | "direct_mail"
    | "video"
    | "voice";
  readonly capacity: number;
  readonly costPerContact: number;
  readonly averageResponseRate: number;
  readonly quantumOptimizable: boolean;
}

export interface CampaignTimeline {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly phases: CampaignPhase[];
  readonly quantumScheduling: boolean;
}

export interface CampaignPhase {
  readonly id: string;
  readonly name: string;
  readonly duration: number;
  readonly dependencies: string[];
  readonly quantumFlexibility: number;
}

export interface CampaignBudget {
  readonly total: number;
  readonly channelAllocation: Record<string, number>;
  readonly quantumReallocation: boolean;
  readonly flexibilityMargin: number;
}

export interface ComplianceRequirements {
  readonly gdprCompliant: boolean;
  readonly ccpaCompliant: boolean;
  readonly canSpamCompliant: boolean;
  readonly customRequirements: string[];
  readonly quantumCompliance: boolean;
}

// ==================== Real-time Optimization Types ====================

/**
 * Real-time quantum optimization context
 */
export interface RealTimeOptimizationContext {
  readonly campaignId: string;
  readonly currentMetrics: CampaignMetrics;
  readonly marketConditions: MarketConditions;
  readonly competitorActivity: CompetitorActivity;
  readonly quantumState: QuantumState;
  readonly lastOptimization: Date;
}

export interface CampaignMetrics {
  readonly responseRate: number;
  readonly conversionRate: number;
  readonly costPerLead: number;
  readonly roi: number;
  readonly engagementScore: number;
  readonly complianceScore: number;
}

export interface MarketConditions {
  readonly sentiment: number;
  readonly volatility: number;
  readonly trend: "bullish" | "bearish" | "sideways";
  readonly seasonality: number;
  readonly quantumMarketEffects: number;
}

export interface CompetitorActivity {
  readonly activityLevel: number;
  readonly messagingOverlap: number;
  readonly timingConflicts: number;
  readonly quantumInterference: number;
}

// ==================== Events and Monitoring ====================

/**
 * QOE system events
 */
export type QOEEvent =
  | OptimizationStartedEvent
  | OptimizationCompletedEvent
  | OptimizationFailedEvent
  | QuantumAdvantageDetectedEvent
  | FallbackTriggeredEvent
  | PerformanceAlertEvent;

export interface OptimizationStartedEvent {
  readonly type: "optimization_started";
  readonly problemId: string;
  readonly algorithm: QuantumAlgorithmType;
  readonly timestamp: Date;
}

export interface OptimizationCompletedEvent {
  readonly type: "optimization_completed";
  readonly problemId: string;
  readonly solutionId: string;
  readonly algorithm: QuantumAlgorithmType;
  readonly computationTime: number;
  readonly quantumAdvantage: number;
  readonly timestamp: Date;
}

export interface OptimizationFailedEvent {
  readonly type: "optimization_failed";
  readonly problemId: string;
  readonly algorithm: QuantumAlgorithmType;
  readonly error: string;
  readonly fallbackUsed: boolean;
  readonly timestamp: Date;
}

export interface QuantumAdvantageDetectedEvent {
  readonly type: "quantum_advantage_detected";
  readonly problemId: string;
  readonly advantage: number;
  readonly classicalTime: number;
  readonly quantumTime: number;
  readonly timestamp: Date;
}

export interface FallbackTriggeredEvent {
  readonly type: "fallback_triggered";
  readonly problemId: string;
  readonly trigger: FallbackTrigger;
  readonly fallbackAlgorithm: ClassicalAlgorithmType;
  readonly timestamp: Date;
}

export interface PerformanceAlertEvent {
  readonly type: "performance_alert";
  readonly metric: string;
  readonly value: number;
  readonly threshold: number;
  readonly severity: "low" | "medium" | "high" | "critical";
  readonly timestamp: Date;
}

// ==================== Analytics and Reporting ====================

/**
 * QOE analytics and performance metrics
 */
export interface QOEAnalytics {
  readonly systemMetrics: QOESystemMetrics;
  readonly algorithmPerformance: AlgorithmPerformanceMetrics;
  readonly quantumAdvantageAnalysis: QuantumAdvantageAnalysis;
  readonly costBenefitAnalysis: CostBenefitAnalysis;
  readonly reportingPeriod: ReportingPeriod;
}

export interface QOESystemMetrics {
  readonly totalOptimizations: number;
  readonly successRate: number;
  readonly averageComputationTime: number;
  readonly quantumUtilization: number;
  readonly fallbackRate: number;
  readonly errorRate: number;
}

export interface AlgorithmPerformanceMetrics {
  readonly byAlgorithm: Record<QuantumAlgorithmType, AlgorithmStats>;
  readonly hybridPerformance: HybridAlgorithmStats;
  readonly convergenceAnalysis: ConvergenceAnalysis;
}

export interface AlgorithmStats {
  readonly usageCount: number;
  readonly successRate: number;
  readonly averageTime: number;
  readonly averageQuality: number;
  readonly quantumAdvantage: number;
}

export interface HybridAlgorithmStats {
  readonly quantumClassicalBalance: number;
  readonly hybridAdvantage: number;
  readonly switchingFrequency: number;
  readonly optimalRatio: number;
}

export interface ConvergenceAnalysis {
  readonly averageIterations: number;
  readonly convergenceRate: number;
  readonly prematureConvergence: number;
  readonly oscillationDetection: number;
}

export interface QuantumAdvantageAnalysis {
  readonly overallAdvantage: number;
  readonly advantageByProblemType: Record<OptimizationProblemType, number>;
  readonly advantageByComplexity: Record<string, number>;
  readonly advantageTrends: AdvantageTimeSeries[];
}

export interface AdvantageTimeSeries {
  readonly timestamp: Date;
  readonly advantage: number;
  readonly problemComplexity: number;
  readonly quantumResources: number;
}

export interface CostBenefitAnalysis {
  readonly quantumComputeCost: number;
  readonly classicalComputeCost: number;
  readonly solutionQualityImprovement: number;
  readonly timeToSolutionImprovement: number;
  readonly roi: number;
}

export interface ReportingPeriod {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly granularity: "hourly" | "daily" | "weekly" | "monthly";
}
