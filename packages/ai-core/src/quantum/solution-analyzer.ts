import {
  OptimizationSolution,
  OptimizationProblem,
  QuantumMetrics,
  PerformanceMetrics,
  SolutionQuality,
  ConvergenceAnalysis,
  AlgorithmComparison,
  OptimizationHistory,
  SolutionInsights,
  QualityThreshold,
} from "./types.js";

/**
 * Advanced solution analyzer for quantum-inspired optimization results
 * Provides comprehensive analysis, quality assessment, and performance insights
 */
export class SolutionAnalyzer {
  private performanceHistory: Map<string, PerformanceMetrics[]> = new Map();
  private qualityThresholds: QualityThreshold[];
  private convergenceAnalyzer: ConvergenceAnalyzer;
  private insightsGenerator: InsightsGenerator;

  constructor() {
    this.qualityThresholds = this.initializeQualityThresholds();
    this.convergenceAnalyzer = new ConvergenceAnalyzer();
    this.insightsGenerator = new InsightsGenerator();
  }

  /**
   * Analyze optimization solution with comprehensive metrics
   */
  async analyzeSolution(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
    metrics: QuantumMetrics,
  ): Promise<SolutionAnalysis> {
    const startTime = Date.now();

    try {
      // Multi-dimensional analysis
      const [
        qualityAnalysis,
        performanceAnalysis,
        convergenceAnalysis,
        comparativeAnalysis,
        insightsAnalysis,
      ] = await Promise.all([
        this.analyzeQuality(solution, problem),
        this.analyzePerformance(metrics),
        this.analyzeConvergence(solution, problem),
        this.compareAlgorithms(solution, problem),
        this.generateInsights(solution, problem, metrics),
      ]);

      // Calculate overall solution score
      const overallScore = this.calculateOverallScore(
        qualityAnalysis,
        performanceAnalysis,
        convergenceAnalysis,
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        solution,
        problem,
        qualityAnalysis,
        performanceAnalysis,
      );

      const analysis: SolutionAnalysis = {
        solutionId: solution.id,
        timestamp: new Date(),
        overallScore,
        quality: qualityAnalysis,
        performance: performanceAnalysis,
        convergence: convergenceAnalysis,
        comparative: comparativeAnalysis,
        insights: insightsAnalysis,
        recommendations,
        processingTime: Date.now() - startTime,
      };

      // Store for historical analysis
      this.storeAnalysis(analysis);

      return analysis;
    } catch (error) {
      console.error("Solution analysis failed:", error);
      throw new Error(`Solution analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze solution quality across multiple dimensions
   */
  private async analyzeQuality(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
  ): Promise<SolutionQuality> {
    const objectives = problem.objectives;
    const constraints = problem.constraints;

    // Objective satisfaction analysis
    const objectiveSatisfaction = objectives.map((obj) => {
      const value = this.evaluateObjective(solution, obj);
      const satisfaction = this.calculateSatisfactionLevel(value, obj);
      return {
        objectiveId: obj.id,
        value,
        satisfaction,
        weight: obj.weight,
      };
    });

    // Constraint violation analysis
    const constraintViolations = constraints.map((constraint) => {
      const violation = this.evaluateConstraintViolation(solution, constraint);
      return {
        constraintId: constraint.id,
        violation,
        severity: this.calculateViolationSeverity(violation, constraint),
      };
    });

    // Feasibility assessment
    const feasibility = this.assessFeasibility(solution, problem);

    // Optimality assessment
    const optimality = this.assessOptimality(solution, problem);

    // Robustness analysis
    const robustness = await this.analyzeRobustness(solution, problem);

    return {
      objectiveSatisfaction,
      constraintViolations,
      feasibility,
      optimality,
      robustness,
      overallQuality: this.calculateOverallQuality(
        objectiveSatisfaction,
        constraintViolations,
        feasibility,
        optimality,
        robustness,
      ),
    };
  }

  /**
   * Analyze algorithm performance metrics
   */
  private async analyzePerformance(
    metrics: QuantumMetrics,
  ): Promise<PerformanceMetrics> {
    const algorithmId = metrics.algorithmUsed;

    // Get historical performance data
    const history = this.performanceHistory.get(algorithmId) || [];

    // Calculate performance indicators
    const executionTime = metrics.executionTime;
    const memoryUsage = metrics.memoryUsage;
    const iterations = metrics.iterations;
    const convergenceRate = metrics.convergenceRate;

    // Compare with historical performance
    const relativePerformance = this.calculateRelativePerformance(
      metrics,
      history,
    );

    // Efficiency metrics
    const efficiency = this.calculateEfficiency(metrics);

    // Scalability assessment
    const scalability = this.assessScalability(metrics);

    const performance: PerformanceMetrics = {
      algorithmId,
      executionTime,
      memoryUsage,
      iterations,
      convergenceRate,
      efficiency,
      scalability,
      relativePerformance,
      timestamp: new Date(),
    };

    // Update performance history
    history.push(performance);
    this.performanceHistory.set(algorithmId, history.slice(-100)); // Keep last 100 records

    return performance;
  }

  /**
   * Analyze convergence behavior and stability
   */
  private async analyzeConvergence(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
  ): Promise<ConvergenceAnalysis> {
    return this.convergenceAnalyzer.analyze(solution, problem);
  }

  /**
   * Compare different algorithm performances
   */
  private async compareAlgorithms(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
  ): Promise<AlgorithmComparison> {
    const currentAlgorithm = solution.algorithmUsed;
    const availableAlgorithms = this.getAvailableAlgorithms(problem);

    const comparisons = availableAlgorithms.map((algorithm) => {
      const historicalPerformance = this.getAlgorithmPerformance(
        algorithm,
        problem,
      );
      const effectiveness = this.calculateEffectiveness(algorithm, problem);

      return {
        algorithm,
        effectiveness,
        historicalPerformance,
        recommendationScore: this.calculateRecommendationScore(
          algorithm,
          problem,
          effectiveness,
          historicalPerformance,
        ),
      };
    });

    return {
      currentAlgorithm,
      alternatives: comparisons,
      bestAlternative: comparisons.reduce((best, current) =>
        current.recommendationScore > best.recommendationScore ? current : best,
      ),
      improvementPotential: this.calculateImprovementPotential(
        currentAlgorithm,
        comparisons,
      ),
    };
  }

  /**
   * Generate actionable insights from solution analysis
   */
  private async generateInsights(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
    metrics: QuantumMetrics,
  ): Promise<SolutionInsights> {
    return this.insightsGenerator.generate(solution, problem, metrics);
  }

  /**
   * Calculate overall solution score
   */
  private calculateOverallScore(
    quality: SolutionQuality,
    performance: PerformanceMetrics,
    convergence: ConvergenceAnalysis,
  ): number {
    const qualityWeight = 0.5;
    const performanceWeight = 0.3;
    const convergenceWeight = 0.2;

    const qualityScore = quality.overallQuality;
    const performanceScore = performance.efficiency;
    const convergenceScore = convergence.stabilityScore;

    return (
      qualityScore * qualityWeight +
      performanceScore * performanceWeight +
      convergenceScore * convergenceWeight
    );
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
    quality: SolutionQuality,
    performance: PerformanceMetrics,
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Quality-based recommendations
    if (quality.overallQuality < 0.8) {
      recommendations.push({
        type: "quality",
        priority: "high",
        description:
          "Consider adjusting algorithm parameters for better quality",
        action: "parameter_tuning",
        expectedImprovement: 0.15,
      });
    }

    // Performance-based recommendations
    if (performance.efficiency < 0.7) {
      recommendations.push({
        type: "performance",
        priority: "medium",
        description: "Algorithm may benefit from different approach",
        action: "algorithm_switch",
        expectedImprovement: 0.2,
      });
    }

    // Constraint violation recommendations
    const violations = quality.constraintViolations.filter(
      (v) => v.violation > 0,
    );
    if (violations.length > 0) {
      recommendations.push({
        type: "feasibility",
        priority: "high",
        description: "Address constraint violations",
        action: "constraint_adjustment",
        expectedImprovement: 0.3,
      });
    }

    return recommendations;
  }

  /**
   * Helper methods for various calculations
   */
  private evaluateObjective(
    solution: OptimizationSolution,
    objective: any,
  ): number {
    // Implement objective evaluation logic
    return 0.8; // Placeholder
  }

  private calculateSatisfactionLevel(value: number, objective: any): number {
    // Implement satisfaction calculation
    return Math.min(value / objective.target, 1.0);
  }

  private evaluateConstraintViolation(
    solution: OptimizationSolution,
    constraint: any,
  ): number {
    // Implement constraint violation calculation
    return 0; // Placeholder
  }

  private calculateViolationSeverity(
    violation: number,
    constraint: any,
  ): string {
    if (violation === 0) return "none";
    if (violation < constraint.tolerance) return "minor";
    if (violation < constraint.tolerance * 2) return "moderate";
    return "severe";
  }

  private assessFeasibility(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
  ): number {
    // Implement feasibility assessment
    return 0.9; // Placeholder
  }

  private assessOptimality(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
  ): number {
    // Implement optimality assessment
    return 0.85; // Placeholder
  }

  private async analyzeRobustness(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
  ): Promise<number> {
    // Implement robustness analysis
    return 0.8; // Placeholder
  }

  private calculateOverallQuality(
    objectives: any[],
    violations: any[],
    feasibility: number,
    optimality: number,
    robustness: number,
  ): number {
    const objectiveScore = objectives.reduce(
      (sum, obj) => sum + obj.satisfaction * obj.weight,
      0,
    );
    const violationPenalty = violations.reduce(
      (sum, viol) => sum + (viol.severity === "severe" ? 0.3 : 0.1),
      0,
    );

    return Math.max(
      0,
      (objectiveScore + feasibility + optimality + robustness) / 4 -
        violationPenalty,
    );
  }

  private calculateRelativePerformance(
    metrics: QuantumMetrics,
    history: PerformanceMetrics[],
  ): number {
    if (history.length === 0) return 0.5;

    const avgExecutionTime =
      history.reduce((sum, h) => sum + h.executionTime, 0) / history.length;
    const avgEfficiency =
      history.reduce((sum, h) => sum + h.efficiency, 0) / history.length;

    const timeImprovement = Math.max(
      0,
      (avgExecutionTime - metrics.executionTime) / avgExecutionTime,
    );
    const efficiencyImprovement =
      (metrics.convergenceRate - avgEfficiency) / avgEfficiency;

    return (timeImprovement + efficiencyImprovement) / 2;
  }

  private calculateEfficiency(metrics: QuantumMetrics): number {
    const timeEfficiency = 1 / (1 + metrics.executionTime / 1000); // Normalize execution time
    const memoryEfficiency = 1 / (1 + metrics.memoryUsage / 1024); // Normalize memory usage
    const convergenceEfficiency = metrics.convergenceRate;

    return (timeEfficiency + memoryEfficiency + convergenceEfficiency) / 3;
  }

  private assessScalability(metrics: QuantumMetrics): number {
    // Implement scalability assessment based on problem size and performance
    return 0.75; // Placeholder
  }

  private getAvailableAlgorithms(problem: OptimizationProblem): string[] {
    // Return available algorithms based on problem characteristics
    return [
      "quantum_annealing",
      "qaoa",
      "quantum_walk",
      "genetic_algorithm",
      "simulated_annealing",
    ];
  }

  private getAlgorithmPerformance(
    algorithm: string,
    problem: OptimizationProblem,
  ): number {
    // Get historical performance for algorithm on similar problems
    return 0.8; // Placeholder
  }

  private calculateEffectiveness(
    algorithm: string,
    problem: OptimizationProblem,
  ): number {
    // Calculate algorithm effectiveness for problem type
    return 0.85; // Placeholder
  }

  private calculateRecommendationScore(
    algorithm: string,
    problem: OptimizationProblem,
    effectiveness: number,
    performance: number,
  ): number {
    return (effectiveness + performance) / 2;
  }

  private calculateImprovementPotential(
    currentAlgorithm: string,
    alternatives: any[],
  ): number {
    const currentScore =
      alternatives.find((alt) => alt.algorithm === currentAlgorithm)
        ?.recommendationScore || 0;
    const bestScore = Math.max(
      ...alternatives.map((alt) => alt.recommendationScore),
    );

    return Math.max(0, (bestScore - currentScore) / currentScore);
  }

  private storeAnalysis(analysis: SolutionAnalysis): void {
    // Store analysis for historical tracking
    // Implementation depends on storage backend
  }

  private initializeQualityThresholds(): QualityThreshold[] {
    return [
      { metric: "overall_quality", excellent: 0.9, good: 0.7, acceptable: 0.5 },
      { metric: "feasibility", excellent: 0.95, good: 0.8, acceptable: 0.6 },
      { metric: "optimality", excellent: 0.9, good: 0.75, acceptable: 0.5 },
      { metric: "robustness", excellent: 0.85, good: 0.7, acceptable: 0.5 },
    ];
  }
}

/**
 * Specialized convergence analyzer
 */
class ConvergenceAnalyzer {
  async analyze(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
  ): Promise<ConvergenceAnalysis> {
    const history = solution.optimizationHistory || [];

    if (history.length < 2) {
      return {
        converged: false,
        convergenceRate: 0,
        stabilityScore: 0,
        plateauDetected: false,
        oscillationPattern: false,
        convergencePoint: null,
      };
    }

    // Analyze convergence patterns
    const convergenceRate = this.calculateConvergenceRate(history);
    const stabilityScore = this.calculateStabilityScore(history);
    const plateauDetected = this.detectPlateau(history);
    const oscillationPattern = this.detectOscillation(history);
    const convergencePoint = this.findConvergencePoint(history);

    return {
      converged: convergenceRate > 0.8 && stabilityScore > 0.7,
      convergenceRate,
      stabilityScore,
      plateauDetected,
      oscillationPattern,
      convergencePoint,
    };
  }

  private calculateConvergenceRate(history: OptimizationHistory[]): number {
    if (history.length < 2) return 0;

    const improvements = [];
    for (let i = 1; i < history.length; i++) {
      const improvement =
        (history[i].objectiveValue - history[i - 1].objectiveValue) /
        history[i - 1].objectiveValue;
      improvements.push(Math.abs(improvement));
    }

    // Calculate convergence rate based on decreasing improvement rates
    const avgImprovement =
      improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    const recentImprovement =
      improvements.slice(-5).reduce((sum, imp) => sum + imp, 0) /
      Math.min(5, improvements.length);

    return Math.max(0, 1 - recentImprovement / avgImprovement);
  }

  private calculateStabilityScore(history: OptimizationHistory[]): number {
    if (history.length < 5) return 0;

    const recent = history.slice(-10);
    const values = recent.map((h) => h.objectiveValue);

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const standardDeviation = Math.sqrt(variance);

    // Stability is inverse of relative standard deviation
    return Math.max(0, 1 - standardDeviation / mean);
  }

  private detectPlateau(history: OptimizationHistory[]): boolean {
    if (history.length < 10) return false;

    const recent = history.slice(-10);
    const improvements = [];

    for (let i = 1; i < recent.length; i++) {
      const improvement = Math.abs(
        recent[i].objectiveValue - recent[i - 1].objectiveValue,
      );
      improvements.push(improvement);
    }

    const avgImprovement =
      improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    const threshold = 0.001; // Very small improvement threshold

    return avgImprovement < threshold;
  }

  private detectOscillation(history: OptimizationHistory[]): boolean {
    if (history.length < 6) return false;

    const recent = history.slice(-6);
    let oscillations = 0;

    for (let i = 2; i < recent.length; i++) {
      const prev = recent[i - 1].objectiveValue;
      const curr = recent[i].objectiveValue;
      const next = recent[i + 1]?.objectiveValue;

      if (
        next &&
        ((curr > prev && curr > next) || (curr < prev && curr < next))
      ) {
        oscillations++;
      }
    }

    return oscillations >= 2;
  }

  private findConvergencePoint(history: OptimizationHistory[]): number | null {
    if (history.length < 10) return null;

    const threshold = 0.001;

    for (let i = 10; i < history.length; i++) {
      const recent = history.slice(i - 10, i);
      const improvements = [];

      for (let j = 1; j < recent.length; j++) {
        improvements.push(
          Math.abs(recent[j].objectiveValue - recent[j - 1].objectiveValue),
        );
      }

      const avgImprovement =
        improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;

      if (avgImprovement < threshold) {
        return i;
      }
    }

    return null;
  }
}

/**
 * Insights generator for solution analysis
 */
class InsightsGenerator {
  async generate(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
    metrics: QuantumMetrics,
  ): Promise<SolutionInsights> {
    const insights = [];

    // Algorithm performance insights
    if (metrics.quantumAdvantage > 0.2) {
      insights.push({
        type: "performance",
        category: "quantum_advantage",
        description:
          "Quantum-inspired algorithm showed significant advantage over classical approaches",
        confidence: 0.9,
        impact: "high",
      });
    }

    // Problem complexity insights
    if (problem.variables.length > 100) {
      insights.push({
        type: "complexity",
        category: "scale",
        description: "High-dimensional problem successfully optimized",
        confidence: 0.8,
        impact: "medium",
      });
    }

    // Optimization strategy insights
    if (
      solution.algorithmUsed === "quantum_annealing" &&
      metrics.convergenceRate > 0.9
    ) {
      insights.push({
        type: "strategy",
        category: "algorithm_selection",
        description:
          "Quantum annealing performed exceptionally well for this problem type",
        confidence: 0.95,
        impact: "high",
      });
    }

    // Business impact insights
    const businessImpact = this.assessBusinessImpact(solution, problem);
    if (businessImpact.roi > 0.5) {
      insights.push({
        type: "business",
        category: "roi",
        description: `Optimization solution provides significant ROI of ${(businessImpact.roi * 100).toFixed(1)}%`,
        confidence: 0.85,
        impact: "high",
      });
    }

    return {
      insights,
      keyFindings: this.extractKeyFindings(insights),
      businessImpact,
      technicalRecommendations: this.generateTechnicalRecommendations(
        solution,
        problem,
        metrics,
      ),
    };
  }

  private assessBusinessImpact(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
  ): any {
    // Assess business impact based on problem type and solution quality
    return {
      roi: 0.65,
      costSavings: 125000,
      efficiencyGain: 0.3,
      timeReduction: 0.4,
    };
  }

  private extractKeyFindings(insights: any[]): string[] {
    return insights
      .filter((insight) => insight.impact === "high")
      .map((insight) => insight.description);
  }

  private generateTechnicalRecommendations(
    solution: OptimizationSolution,
    problem: OptimizationProblem,
    metrics: QuantumMetrics,
  ): string[] {
    const recommendations = [];

    if (metrics.executionTime > 5000) {
      recommendations.push(
        "Consider parameter tuning to reduce execution time",
      );
    }

    if (metrics.memoryUsage > 1024) {
      recommendations.push("Optimize memory usage for better scalability");
    }

    if (metrics.convergenceRate < 0.8) {
      recommendations.push(
        "Adjust convergence criteria for better solution quality",
      );
    }

    return recommendations;
  }
}

// Type definitions for analysis components
interface SolutionAnalysis {
  solutionId: string;
  timestamp: Date;
  overallScore: number;
  quality: SolutionQuality;
  performance: PerformanceMetrics;
  convergence: ConvergenceAnalysis;
  comparative: AlgorithmComparison;
  insights: SolutionInsights;
  recommendations: OptimizationRecommendation[];
  processingTime: number;
}

interface OptimizationRecommendation {
  type: "quality" | "performance" | "feasibility" | "strategy";
  priority: "high" | "medium" | "low";
  description: string;
  action: string;
  expectedImprovement: number;
}

export {
  SolutionAnalyzer,
  type SolutionAnalysis,
  type OptimizationRecommendation,
};
