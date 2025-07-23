/**
 * Classical Optimization Engine
 *
 * Fallback algorithms for when quantum approaches fail or are not optimal.
 * Provides genetic algorithms, simulated annealing, particle swarm optimization,
 * and other classical optimization techniques.
 */

import {
  OptimizationProblem,
  OptimizationSolution,
  ClassicalAlgorithmType,
  OptimizationConfig,
  OptimizationMetrics,
  CampaignOptimizationProblem,
  ResourceAllocationProblem,
  ProspectPrioritizationProblem,
} from "./types";

export interface ClassicalOptimizerConfig {
  defaultAlgorithm: ClassicalAlgorithmType;
  populationSize: number;
  maxGenerations: number;
  convergenceThreshold: number;
  mutationRate: number;
  crossoverRate: number;
  coolingRate: number;
  initialTemperature: number;
  particleCount: number;
  inertiaWeight: number;
  socialWeight: number;
  cognitiveWeight: number;
  timeout: number;
}

export interface GeneticAlgorithmParams {
  populationSize: number;
  maxGenerations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismRate: number;
  tournamentSize: number;
}

export interface SimulatedAnnealingParams {
  initialTemperature: number;
  coolingRate: number;
  minTemperature: number;
  maxIterations: number;
  neighborhoodSize: number;
}

export interface ParticleSwarmParams {
  particleCount: number;
  maxIterations: number;
  inertiaWeight: number;
  socialWeight: number;
  cognitiveWeight: number;
  velocityClamp: number;
}

export class ClassicalOptimizer {
  private config: ClassicalOptimizerConfig;
  private metrics: Map<string, OptimizationMetrics>;

  constructor(config: Partial<ClassicalOptimizerConfig> = {}) {
    this.config = {
      defaultAlgorithm: "genetic_algorithm",
      populationSize: 100,
      maxGenerations: 1000,
      convergenceThreshold: 1e-6,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      coolingRate: 0.95,
      initialTemperature: 1000,
      particleCount: 50,
      inertiaWeight: 0.7,
      socialWeight: 1.4,
      cognitiveWeight: 1.4,
      timeout: 30000, // 30 seconds
      ...config,
    };
    this.metrics = new Map();
  }

  /**
   * Optimize using the most appropriate classical algorithm
   */
  async optimize(
    problem: OptimizationProblem,
    config?: Partial<OptimizationConfig>,
  ): Promise<OptimizationSolution> {
    const startTime = Date.now();
    const algorithm =
      (config?.algorithm as ClassicalAlgorithmType) ||
      this.config.defaultAlgorithm;

    try {
      let solution: OptimizationSolution;

      switch (algorithm) {
        case "genetic_algorithm":
          solution = await this.geneticAlgorithm(problem, config);
          break;
        case "simulated_annealing":
          solution = await this.simulatedAnnealing(problem, config);
          break;
        case "particle_swarm":
          solution = await this.particleSwarmOptimization(problem, config);
          break;
        case "hill_climbing":
          solution = await this.hillClimbing(problem, config);
          break;
        case "tabu_search":
          solution = await this.tabuSearch(problem, config);
          break;
        case "differential_evolution":
          solution = await this.differentialEvolution(problem, config);
          break;
        default:
          throw new Error(`Unsupported classical algorithm: ${algorithm}`);
      }

      // Record metrics
      const executionTime = Date.now() - startTime;
      this.recordMetrics(problem.id, algorithm, solution, executionTime);

      return solution;
    } catch (error) {
      throw new Error(`Classical optimization failed: ${error.message}`);
    }
  }

  /**
   * Genetic Algorithm implementation
   */
  private async geneticAlgorithm(
    problem: OptimizationProblem,
    config?: Partial<OptimizationConfig>,
  ): Promise<OptimizationSolution> {
    const params: GeneticAlgorithmParams = {
      populationSize: config?.populationSize || this.config.populationSize,
      maxGenerations: config?.maxIterations || this.config.maxGenerations,
      mutationRate: this.config.mutationRate,
      crossoverRate: this.config.crossoverRate,
      elitismRate: 0.1,
      tournamentSize: 5,
    };

    // Initialize population
    let population = this.initializePopulation(problem, params.populationSize);
    let bestSolution = this.evaluatePopulation(population, problem)[0];
    const fitnessHistory: number[] = [];

    for (let generation = 0; generation < params.maxGenerations; generation++) {
      // Selection
      const parents = this.tournamentSelection(
        population,
        problem,
        params.tournamentSize,
      );

      // Crossover
      const offspring = this.crossover(parents, params.crossoverRate, problem);

      // Mutation
      this.mutate(offspring, params.mutationRate, problem);

      // Combine populations
      const combined = [...population, ...offspring];

      // Evaluate and select survivors
      population = this.evaluatePopulation(combined, problem).slice(
        0,
        params.populationSize,
      );

      const currentBest = population[0];
      if (currentBest.fitness > bestSolution.fitness) {
        bestSolution = currentBest;
      }

      fitnessHistory.push(bestSolution.fitness);

      // Check convergence
      if (
        this.checkConvergence(fitnessHistory, this.config.convergenceThreshold)
      ) {
        break;
      }
    }

    return this.convertToOptimizationSolution(
      bestSolution,
      problem,
      "genetic_algorithm",
    );
  }

  /**
   * Simulated Annealing implementation
   */
  private async simulatedAnnealing(
    problem: OptimizationProblem,
    config?: Partial<OptimizationConfig>,
  ): Promise<OptimizationSolution> {
    const params: SimulatedAnnealingParams = {
      initialTemperature: this.config.initialTemperature,
      coolingRate: this.config.coolingRate,
      minTemperature: 1,
      maxIterations: config?.maxIterations || 10000,
      neighborhoodSize: 0.1,
    };

    // Initialize solution
    let currentSolution = this.generateRandomSolution(problem);
    let bestSolution = { ...currentSolution };
    let temperature = params.initialTemperature;

    for (
      let iteration = 0;
      iteration < params.maxIterations && temperature > params.minTemperature;
      iteration++
    ) {
      // Generate neighbor
      const neighbor = this.generateNeighbor(
        currentSolution,
        problem,
        params.neighborhoodSize,
      );

      // Calculate acceptance probability
      const deltaFitness = neighbor.fitness - currentSolution.fitness;
      const acceptanceProbability =
        deltaFitness > 0 ? 1 : Math.exp(deltaFitness / temperature);

      // Accept or reject
      if (Math.random() < acceptanceProbability) {
        currentSolution = neighbor;

        if (neighbor.fitness > bestSolution.fitness) {
          bestSolution = { ...neighbor };
        }
      }

      // Cool down
      temperature *= params.coolingRate;
    }

    return this.convertToOptimizationSolution(
      bestSolution,
      problem,
      "simulated_annealing",
    );
  }

  /**
   * Particle Swarm Optimization implementation
   */
  private async particleSwarmOptimization(
    problem: OptimizationProblem,
    config?: Partial<OptimizationConfig>,
  ): Promise<OptimizationSolution> {
    const params: ParticleSwarmParams = {
      particleCount: this.config.particleCount,
      maxIterations: config?.maxIterations || 1000,
      inertiaWeight: this.config.inertiaWeight,
      socialWeight: this.config.socialWeight,
      cognitiveWeight: this.config.cognitiveWeight,
      velocityClamp: 0.5,
    };

    // Initialize swarm
    const particles = this.initializeSwarm(problem, params.particleCount);
    let globalBest = this.findBestParticle(particles);

    for (let iteration = 0; iteration < params.maxIterations; iteration++) {
      for (const particle of particles) {
        // Update velocity
        this.updateParticleVelocity(particle, globalBest, params);

        // Update position
        this.updateParticlePosition(particle, problem);

        // Evaluate fitness
        particle.fitness = this.evaluateSolution(particle, problem);

        // Update personal best
        if (particle.fitness > particle.personalBest.fitness) {
          particle.personalBest = { ...particle };
        }

        // Update global best
        if (particle.fitness > globalBest.fitness) {
          globalBest = { ...particle };
        }
      }
    }

    return this.convertToOptimizationSolution(
      globalBest,
      problem,
      "particle_swarm",
    );
  }

  /**
   * Hill Climbing implementation
   */
  private async hillClimbing(
    problem: OptimizationProblem,
    config?: Partial<OptimizationConfig>,
  ): Promise<OptimizationSolution> {
    let currentSolution = this.generateRandomSolution(problem);
    let improved = true;
    const maxIterations = config?.maxIterations || 1000;
    let iteration = 0;

    while (improved && iteration < maxIterations) {
      improved = false;
      const neighbors = this.generateAllNeighbors(currentSolution, problem);

      for (const neighbor of neighbors) {
        if (neighbor.fitness > currentSolution.fitness) {
          currentSolution = neighbor;
          improved = true;
          break;
        }
      }
      iteration++;
    }

    return this.convertToOptimizationSolution(
      currentSolution,
      problem,
      "hill_climbing",
    );
  }

  /**
   * Tabu Search implementation
   */
  private async tabuSearch(
    problem: OptimizationProblem,
    config?: Partial<OptimizationConfig>,
  ): Promise<OptimizationSolution> {
    const tabuListSize = 20;
    const maxIterations = config?.maxIterations || 1000;

    let currentSolution = this.generateRandomSolution(problem);
    let bestSolution = { ...currentSolution };
    const tabuList: any[] = [];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const neighbors = this.generateAllNeighbors(currentSolution, problem);
      let bestNeighbor = null;

      // Find best non-tabu neighbor
      for (const neighbor of neighbors) {
        if (
          !this.isTabu(neighbor, tabuList) ||
          neighbor.fitness > bestSolution.fitness
        ) {
          if (!bestNeighbor || neighbor.fitness > bestNeighbor.fitness) {
            bestNeighbor = neighbor;
          }
        }
      }

      if (bestNeighbor) {
        currentSolution = bestNeighbor;

        // Update tabu list
        tabuList.push(this.createTabuMove(currentSolution, bestNeighbor));
        if (tabuList.length > tabuListSize) {
          tabuList.shift();
        }

        // Update best solution
        if (bestNeighbor.fitness > bestSolution.fitness) {
          bestSolution = { ...bestNeighbor };
        }
      }
    }

    return this.convertToOptimizationSolution(
      bestSolution,
      problem,
      "tabu_search",
    );
  }

  /**
   * Differential Evolution implementation
   */
  private async differentialEvolution(
    problem: OptimizationProblem,
    config?: Partial<OptimizationConfig>,
  ): Promise<OptimizationSolution> {
    const populationSize = config?.populationSize || this.config.populationSize;
    const maxGenerations = config?.maxIterations || this.config.maxGenerations;
    const F = 0.8; // Scaling factor
    const CR = 0.9; // Crossover probability

    let population = this.initializePopulation(problem, populationSize);
    let bestSolution = this.evaluatePopulation(population, problem)[0];

    for (let generation = 0; generation < maxGenerations; generation++) {
      const newPopulation = [];

      for (let i = 0; i < populationSize; i++) {
        // Select three random individuals
        const indices = this.selectRandomIndices(populationSize, i, 3);
        const [a, b, c] = indices.map((idx) => population[idx]);

        // Create mutant vector
        const mutant = this.createMutantVector(a, b, c, F, problem);

        // Crossover
        const trial = this.crossoverDE(population[i], mutant, CR, problem);

        // Selection
        if (trial.fitness > population[i].fitness) {
          newPopulation.push(trial);
          if (trial.fitness > bestSolution.fitness) {
            bestSolution = { ...trial };
          }
        } else {
          newPopulation.push(population[i]);
        }
      }

      population = newPopulation;
    }

    return this.convertToOptimizationSolution(
      bestSolution,
      problem,
      "differential_evolution",
    );
  }

  /**
   * Helper methods for genetic algorithm
   */
  private initializePopulation(
    problem: OptimizationProblem,
    size: number,
  ): any[] {
    const population = [];
    for (let i = 0; i < size; i++) {
      population.push(this.generateRandomSolution(problem));
    }
    return population;
  }

  private generateRandomSolution(problem: OptimizationProblem): any {
    const solution: any = { variables: {}, fitness: 0 };

    switch (problem.type) {
      case "campaign_optimization":
        const campProblem = problem as CampaignOptimizationProblem;
        solution.variables = {
          channelWeights: this.generateRandomWeights(
            campProblem.channels.length,
          ),
          messagingStrategy: Math.floor(Math.random() * 5),
          timing: {
            hour: Math.floor(Math.random() * 24),
            dayOfWeek: Math.floor(Math.random() * 7),
          },
          budget: Math.random() * campProblem.constraints.maxBudget,
          sequenceSteps: Math.floor(Math.random() * 10) + 1,
        };
        break;

      case "resource_allocation":
        const resProblem = problem as ResourceAllocationProblem;
        solution.variables = {
          allocation: this.generateRandomAllocation(
            resProblem.resources,
            resProblem.constraints.totalBudget,
          ),
        };
        break;

      case "prospect_prioritization":
        const prosProblem = problem as ProspectPrioritizationProblem;
        solution.variables = {
          scores: prosProblem.prospects.map(() => Math.random()),
          weights: this.generateRandomWeights(
            prosProblem.scoringCriteria.length,
          ),
        };
        break;
    }

    solution.fitness = this.evaluateSolution(solution, problem);
    return solution;
  }

  private generateRandomWeights(count: number): number[] {
    const weights = Array(count)
      .fill(0)
      .map(() => Math.random());
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map((w) => w / sum);
  }

  private generateRandomAllocation(
    resources: any[],
    totalBudget: number,
  ): { [key: string]: number } {
    const allocation: { [key: string]: number } = {};
    const weights = this.generateRandomWeights(resources.length);

    resources.forEach((resource, index) => {
      allocation[resource.id] = weights[index] * totalBudget;
    });

    return allocation;
  }

  private evaluateSolution(
    solution: any,
    problem: OptimizationProblem,
  ): number {
    // This would typically call the problem's objective function
    // For now, return a placeholder based on solution complexity
    return Math.random() * 100;
  }

  private evaluatePopulation(
    population: any[],
    problem: OptimizationProblem,
  ): any[] {
    return population
      .map((individual) => ({
        ...individual,
        fitness: this.evaluateSolution(individual, problem),
      }))
      .sort((a, b) => b.fitness - a.fitness);
  }

  private tournamentSelection(
    population: any[],
    problem: OptimizationProblem,
    tournamentSize: number,
  ): any[] {
    const parents = [];
    const populationSize = population.length;

    for (let i = 0; i < populationSize; i++) {
      const tournament = [];
      for (let j = 0; j < tournamentSize; j++) {
        const randomIndex = Math.floor(Math.random() * populationSize);
        tournament.push(population[randomIndex]);
      }

      tournament.sort((a, b) => b.fitness - a.fitness);
      parents.push(tournament[0]);
    }

    return parents;
  }

  private crossover(
    parents: any[],
    crossoverRate: number,
    problem: OptimizationProblem,
  ): any[] {
    const offspring = [];

    for (let i = 0; i < parents.length - 1; i += 2) {
      if (Math.random() < crossoverRate) {
        const [child1, child2] = this.performCrossover(
          parents[i],
          parents[i + 1],
          problem,
        );
        offspring.push(child1, child2);
      } else {
        offspring.push({ ...parents[i] }, { ...parents[i + 1] });
      }
    }

    return offspring;
  }

  private performCrossover(
    parent1: any,
    parent2: any,
    problem: OptimizationProblem,
  ): [any, any] {
    const child1 = { ...parent1 };
    const child2 = { ...parent2 };

    // Perform crossover based on problem type
    switch (problem.type) {
      case "campaign_optimization":
        // Uniform crossover for channel weights
        for (let i = 0; i < parent1.variables.channelWeights.length; i++) {
          if (Math.random() < 0.5) {
            child1.variables.channelWeights[i] =
              parent2.variables.channelWeights[i];
            child2.variables.channelWeights[i] =
              parent1.variables.channelWeights[i];
          }
        }
        break;
    }

    return [child1, child2];
  }

  private mutate(
    population: any[],
    mutationRate: number,
    problem: OptimizationProblem,
  ): void {
    for (const individual of population) {
      if (Math.random() < mutationRate) {
        this.performMutation(individual, problem);
      }
    }
  }

  private performMutation(individual: any, problem: OptimizationProblem): void {
    switch (problem.type) {
      case "campaign_optimization":
        // Gaussian mutation for channel weights
        const index = Math.floor(
          Math.random() * individual.variables.channelWeights.length,
        );
        individual.variables.channelWeights[index] +=
          (Math.random() - 0.5) * 0.1;
        individual.variables.channelWeights[index] = Math.max(
          0,
          Math.min(1, individual.variables.channelWeights[index]),
        );

        // Normalize weights
        const sum = individual.variables.channelWeights.reduce(
          (a: number, b: number) => a + b,
          0,
        );
        individual.variables.channelWeights =
          individual.variables.channelWeights.map((w: number) => w / sum);
        break;
    }
  }

  private checkConvergence(
    fitnessHistory: number[],
    threshold: number,
  ): boolean {
    if (fitnessHistory.length < 10) return false;

    const recent = fitnessHistory.slice(-10);
    const variance = this.calculateVariance(recent);
    return variance < threshold;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  // Particle Swarm helpers
  private initializeSwarm(
    problem: OptimizationProblem,
    particleCount: number,
  ): any[] {
    const swarm = [];
    for (let i = 0; i < particleCount; i++) {
      const particle = {
        ...this.generateRandomSolution(problem),
        velocity: this.initializeVelocity(problem),
        personalBest: null as any,
      };
      particle.personalBest = { ...particle };
      swarm.push(particle);
    }
    return swarm;
  }

  private initializeVelocity(problem: OptimizationProblem): any {
    // Initialize random velocity based on problem type
    return {
      channelWeights: Array(5)
        .fill(0)
        .map(() => (Math.random() - 0.5) * 0.1),
    };
  }

  private findBestParticle(particles: any[]): any {
    return particles.reduce((best, particle) =>
      particle.fitness > best.fitness ? particle : best,
    );
  }

  private updateParticleVelocity(
    particle: any,
    globalBest: any,
    params: ParticleSwarmParams,
  ): void {
    const r1 = Math.random();
    const r2 = Math.random();

    // Update velocity components
    if (
      particle.velocity.channelWeights &&
      particle.personalBest.variables.channelWeights
    ) {
      for (let i = 0; i < particle.velocity.channelWeights.length; i++) {
        particle.velocity.channelWeights[i] =
          params.inertiaWeight * particle.velocity.channelWeights[i] +
          params.cognitiveWeight *
            r1 *
            (particle.personalBest.variables.channelWeights[i] -
              particle.variables.channelWeights[i]) +
          params.socialWeight *
            r2 *
            (globalBest.variables.channelWeights[i] -
              particle.variables.channelWeights[i]);

        // Clamp velocity
        particle.velocity.channelWeights[i] = Math.max(
          -params.velocityClamp,
          Math.min(params.velocityClamp, particle.velocity.channelWeights[i]),
        );
      }
    }
  }

  private updateParticlePosition(
    particle: any,
    problem: OptimizationProblem,
  ): void {
    if (particle.velocity.channelWeights && particle.variables.channelWeights) {
      for (let i = 0; i < particle.variables.channelWeights.length; i++) {
        particle.variables.channelWeights[i] +=
          particle.velocity.channelWeights[i];
        particle.variables.channelWeights[i] = Math.max(
          0,
          Math.min(1, particle.variables.channelWeights[i]),
        );
      }

      // Normalize weights
      const sum = particle.variables.channelWeights.reduce(
        (a: number, b: number) => a + b,
        0,
      );
      particle.variables.channelWeights = particle.variables.channelWeights.map(
        (w: number) => w / sum,
      );
    }
  }

  // Helper methods for other algorithms
  private generateNeighbor(
    solution: any,
    problem: OptimizationProblem,
    neighborhoodSize: number,
  ): any {
    const neighbor = JSON.parse(JSON.stringify(solution));
    this.performMutation(neighbor, problem);
    neighbor.fitness = this.evaluateSolution(neighbor, problem);
    return neighbor;
  }

  private generateAllNeighbors(
    solution: any,
    problem: OptimizationProblem,
  ): any[] {
    const neighbors = [];
    // Generate a reasonable number of neighbors
    for (let i = 0; i < 10; i++) {
      neighbors.push(this.generateNeighbor(solution, problem, 0.1));
    }
    return neighbors;
  }

  private isTabu(solution: any, tabuList: any[]): boolean {
    return tabuList.some((tabuMove) => this.solutionsEqual(solution, tabuMove));
  }

  private createTabuMove(from: any, to: any): any {
    return {
      from: JSON.stringify(from.variables),
      to: JSON.stringify(to.variables),
    };
  }

  private solutionsEqual(solution1: any, solution2: any): boolean {
    return (
      JSON.stringify(solution1.variables) ===
      JSON.stringify(solution2.variables)
    );
  }

  private selectRandomIndices(
    populationSize: number,
    exclude: number,
    count: number,
  ): number[] {
    const indices = [];
    while (indices.length < count) {
      const index = Math.floor(Math.random() * populationSize);
      if (index !== exclude && !indices.includes(index)) {
        indices.push(index);
      }
    }
    return indices;
  }

  private createMutantVector(
    a: any,
    b: any,
    c: any,
    F: number,
    problem: OptimizationProblem,
  ): any {
    const mutant = JSON.parse(JSON.stringify(a));

    // Apply differential evolution mutation
    if (
      a.variables.channelWeights &&
      b.variables.channelWeights &&
      c.variables.channelWeights
    ) {
      for (let i = 0; i < a.variables.channelWeights.length; i++) {
        mutant.variables.channelWeights[i] =
          a.variables.channelWeights[i] +
          F * (b.variables.channelWeights[i] - c.variables.channelWeights[i]);
        mutant.variables.channelWeights[i] = Math.max(
          0,
          Math.min(1, mutant.variables.channelWeights[i]),
        );
      }

      // Normalize
      const sum = mutant.variables.channelWeights.reduce(
        (a: number, b: number) => a + b,
        0,
      );
      mutant.variables.channelWeights = mutant.variables.channelWeights.map(
        (w: number) => w / sum,
      );
    }

    mutant.fitness = this.evaluateSolution(mutant, problem);
    return mutant;
  }

  private crossoverDE(
    target: any,
    mutant: any,
    CR: number,
    problem: OptimizationProblem,
  ): any {
    const trial = JSON.parse(JSON.stringify(target));

    if (target.variables.channelWeights && mutant.variables.channelWeights) {
      for (let i = 0; i < target.variables.channelWeights.length; i++) {
        if (Math.random() < CR) {
          trial.variables.channelWeights[i] =
            mutant.variables.channelWeights[i];
        }
      }
    }

    trial.fitness = this.evaluateSolution(trial, problem);
    return trial;
  }

  private convertToOptimizationSolution(
    solution: any,
    problem: OptimizationProblem,
    algorithm: ClassicalAlgorithmType,
  ): OptimizationSolution {
    return {
      problemId: problem.id,
      algorithm: algorithm,
      fitness: solution.fitness,
      variables: solution.variables,
      constraints: problem.constraints,
      convergenceHistory: [],
      metadata: {
        algorithm,
        executionTime: 0,
        iterations: 0,
        converged: true,
      },
    };
  }

  private recordMetrics(
    problemId: string,
    algorithm: ClassicalAlgorithmType,
    solution: OptimizationSolution,
    executionTime: number,
  ): void {
    const metrics: OptimizationMetrics = {
      problemId,
      algorithm,
      executionTime,
      fitness: solution.fitness,
      iterations: solution.metadata?.iterations || 0,
      convergenceRate: 1.0,
      memoryUsage: process.memoryUsage().heapUsed,
      timestamp: Date.now(),
    };

    this.metrics.set(`${problemId}_${algorithm}`, metrics);
  }

  /**
   * Get optimization metrics
   */
  getMetrics(problemId?: string): OptimizationMetrics[] {
    if (problemId) {
      return Array.from(this.metrics.values()).filter(
        (m) => m.problemId === problemId,
      );
    }
    return Array.from(this.metrics.values());
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }
}
