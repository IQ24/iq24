/**
 * Comprehensive Error Recovery and Resilience System for IQ24.ai AI Core
 * Implements circuit breakers, retry policies, graceful degradation, and system healing
 */

import { EventEmitter } from 'events';
import { BaseAgent } from '../base/agent';
import { ConfigManager } from '../config';
import { DatabaseClient } from '../database/client';

export interface RecoveryStrategy {
  name: string;
  priority: number;
  condition: (error: Error, context: RecoveryContext) => boolean;
  execute: (error: Error, context: RecoveryContext) => Promise<RecoveryResult>;
  timeout?: number;
}

export interface RecoveryContext {
  agentId: string;
  agentType: string;
  operation: string;
  attempt: number;
  maxAttempts: number;
  metadata?: Record<string, any>;
}

export interface RecoveryResult {
  success: boolean;
  action: string;
  metadata?: Record<string, any>;
  retry?: boolean;
  delay?: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeoutMs: number;
  resetTimeoutMs: number;
  monitoringPeriodMs: number;
}

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

/**
 * Circuit Breaker Implementation
 */
export class CircuitBreaker extends EventEmitter {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;
  private config: CircuitBreakerConfig;

  constructor(
    private name: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    super();
    this.config = {
      failureThreshold: 5,
      timeoutMs: 60000, // 1 minute
      resetTimeoutMs: 300000, // 5 minutes
      monitoringPeriodMs: 60000, // 1 minute
      ...config
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.emit('state-change', { from: CircuitState.OPEN, to: CircuitState.HALF_OPEN });
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    try {
      const result = await this.executeWithTimeout(operation);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Circuit breaker ${this.name} operation timed out`));
      }, this.config.timeoutMs);

      operation()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.successCount++;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.emit('state-change', { from: CircuitState.HALF_OPEN, to: CircuitState.CLOSED });
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.emit('state-change', { from: CircuitState.CLOSED, to: CircuitState.OPEN });
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.resetTimeoutMs;
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Retry Policy Implementation
 */
export class RetryPolicy {
  constructor(
    private maxAttempts: number = 3,
    private baseDelayMs: number = 1000,
    private maxDelayMs: number = 30000,
    private backoffMultiplier: number = 2,
    private jitter: boolean = true
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    shouldRetry: (error: Error, attempt: number) => boolean = () => true
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxAttempts || !shouldRetry(lastError, attempt)) {
          throw lastError;
        }
        
        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  private calculateDelay(attempt: number): number {
    let delay = this.baseDelayMs * Math.pow(this.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, this.maxDelayMs);
    
    if (this.jitter) {
      delay *= (0.5 + Math.random() * 0.5); // Add 0-50% jitter
    }
    
    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * System Health Monitor
 */
export class HealthMonitor extends EventEmitter {
  private healthChecks = new Map<string, () => Promise<boolean>>();
  private healthStatus = new Map<string, boolean>();
  private monitoring = false;
  private intervalId?: NodeJS.Timeout;

  constructor(private intervalMs: number = 30000) {
    super();
  }

  registerHealthCheck(name: string, check: () => Promise<boolean>): void {
    this.healthChecks.set(name, check);
    this.healthStatus.set(name, true);
  }

  start(): void {
    if (this.monitoring) return;
    
    this.monitoring = true;
    this.intervalId = setInterval(() => {
      this.performHealthChecks();
    }, this.intervalMs);
    
    // Perform initial check
    this.performHealthChecks();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.monitoring = false;
  }

  private async performHealthChecks(): Promise<void> {
    for (const [name, check] of this.healthChecks) {
      try {
        const isHealthy = await check();
        const wasHealthy = this.healthStatus.get(name);
        
        this.healthStatus.set(name, isHealthy);
        
        if (wasHealthy && !isHealthy) {
          this.emit('health-degraded', { component: name });
        } else if (!wasHealthy && isHealthy) {
          this.emit('health-recovered', { component: name });
        }
      } catch (error) {
        this.healthStatus.set(name, false);
        this.emit('health-check-error', { component: name, error });
      }
    }
  }

  getOverallHealth(): boolean {
    return Array.from(this.healthStatus.values()).every(status => status);
  }

  getHealthStatus(): Record<string, boolean> {
    return Object.fromEntries(this.healthStatus);
  }
}

/**
 * Main Error Recovery Manager
 */
export class ErrorRecoveryManager extends EventEmitter {
  private strategies: RecoveryStrategy[] = [];
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private retryPolicies = new Map<string, RetryPolicy>();
  private healthMonitor: HealthMonitor;
  private config: ConfigManager;
  private db: DatabaseClient;

  constructor() {
    super();
    this.config = new ConfigManager();
    this.db = DatabaseClient.getInstance();
    this.healthMonitor = new HealthMonitor();
    
    this.initializeDefaultStrategies();
    this.setupHealthMonitoring();
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultStrategies(): void {
    // Network timeout recovery
    this.addStrategy({
      name: 'network-timeout-recovery',
      priority: 1,
      condition: (error) => error.message.includes('timeout') || error.message.includes('ETIMEDOUT'),
      execute: async (error, context) => {
        const retryPolicy = this.getRetryPolicy('network-operations');
        
        return {
          success: true,
          action: 'retry-with-backoff',
          retry: true,
          delay: 2000 + Math.random() * 3000, // 2-5 second delay
          metadata: { strategy: 'network-timeout-recovery' }
        };
      }
    });

    // Database connection recovery
    this.addStrategy({
      name: 'database-connection-recovery',
      priority: 1,
      condition: (error) => error.message.includes('connection') && error.message.includes('database'),
      execute: async (error, context) => {
        try {
          // Attempt to reconnect
          await this.db.reconnect();
          
          return {
            success: true,
            action: 'database-reconnected',
            retry: true,
            delay: 1000,
            metadata: { reconnected: true }
          };
        } catch (reconnectError) {
          return {
            success: false,
            action: 'database-reconnect-failed',
            metadata: { reconnectError: reconnectError.message }
          };
        }
      }
    });

    // External service unavailable recovery
    this.addStrategy({
      name: 'external-service-recovery',
      priority: 2,
      condition: (error) => error.message.includes('Service unavailable') || error.message.includes('503'),
      execute: async (error, context) => {
        // Enable graceful degradation
        const serviceName = this.extractServiceName(error.message);
        if (serviceName) {
          await this.enableGracefulDegradation(serviceName, context);
        }
        
        return {
          success: true,
          action: 'graceful-degradation-enabled',
          retry: false,
          metadata: { degradedService: serviceName }
        };
      }
    });

    // Memory pressure recovery
    this.addStrategy({
      name: 'memory-pressure-recovery',
      priority: 1,
      condition: (error) => error.message.includes('out of memory') || error.message.includes('heap'),
      execute: async (error, context) => {
        // Force garbage collection
        if (global.gc) {
          global.gc();
        }
        
        // Reduce agent concurrency temporarily
        await this.reduceSystemLoad();
        
        return {
          success: true,
          action: 'memory-pressure-relief',
          retry: true,
          delay: 5000,
          metadata: { garbageCollected: true, loadReduced: true }
        };
      }
    });

    // Rate limiting recovery
    this.addStrategy({
      name: 'rate-limit-recovery',
      priority: 1,
      condition: (error) => error.message.includes('rate limit') || error.message.includes('429'),
      execute: async (error, context) => {
        // Extract retry-after header if available
        const retryAfter = this.extractRetryAfter(error.message);
        const delay = retryAfter || (30000 + Math.random() * 30000); // 30-60 seconds
        
        return {
          success: true,
          action: 'rate-limit-backoff',
          retry: true,
          delay,
          metadata: { retryAfter }
        };
      }
    });
  }

  /**
   * Setup health monitoring for system components
   */
  private setupHealthMonitoring(): void {
    // Database health check
    this.healthMonitor.registerHealthCheck('database', async () => {
      try {
        await this.db.testConnection();
        return true;
      } catch {
        return false;
      }
    });

    // Memory health check
    this.healthMonitor.registerHealthCheck('memory', async () => {
      const memUsage = process.memoryUsage();
      const heapUsedPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      return heapUsedPercentage < 90; // Less than 90% heap usage
    });

    // CPU health check (basic)
    this.healthMonitor.registerHealthCheck('system', async () => {
      const cpuUsage = process.cpuUsage();
      // Simple heuristic: if we've used less than 90% of available time
      return (cpuUsage.user + cpuUsage.system) < 900000; // 90% of 1 second in microseconds
    });

    // Setup event handlers
    this.healthMonitor.on('health-degraded', (data) => {
      this.emit('system-health-degraded', data);
      this.handleHealthDegradation(data.component);
    });

    this.healthMonitor.on('health-recovered', (data) => {
      this.emit('system-health-recovered', data);
    });

    this.healthMonitor.start();
  }

  /**
   * Add a recovery strategy
   */
  addStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Attempt to recover from an error
   */
  async recover(error: Error, context: RecoveryContext): Promise<RecoveryResult> {
    // Find applicable strategy
    const strategy = this.strategies.find(s => s.condition(error, context));
    
    if (!strategy) {
      return {
        success: false,
        action: 'no-strategy-found',
        metadata: { error: error.message, context }
      };
    }

    try {
      const result = await this.executeStrategy(strategy, error, context);
      
      // Log recovery attempt
      await this.logRecoveryAttempt(strategy, error, context, result);
      
      return result;
    } catch (recoveryError) {
      return {
        success: false,
        action: 'strategy-execution-failed',
        metadata: { 
          strategy: strategy.name,
          originalError: error.message,
          recoveryError: recoveryError.message
        }
      };
    }
  }

  /**
   * Execute a recovery strategy with timeout
   */
  private async executeStrategy(
    strategy: RecoveryStrategy,
    error: Error,
    context: RecoveryContext
  ): Promise<RecoveryResult> {
    const timeout = strategy.timeout || 30000; // 30 second default
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Recovery strategy ${strategy.name} timed out`));
      }, timeout);

      strategy.execute(error, context)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Get or create circuit breaker for a service
   */
  getCircuitBreaker(serviceName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      const breaker = new CircuitBreaker(serviceName, config);
      this.circuitBreakers.set(serviceName, breaker);
      
      // Setup event forwarding
      breaker.on('state-change', (data) => {
        this.emit('circuit-breaker-state-change', { service: serviceName, ...data });
      });
    }
    
    return this.circuitBreakers.get(serviceName)!;
  }

  /**
   * Get or create retry policy
   */
  getRetryPolicy(operationType: string): RetryPolicy {
    if (!this.retryPolicies.has(operationType)) {
      const config = this.config.get(`recovery.retry_policies.${operationType}`) || {};
      this.retryPolicies.set(operationType, new RetryPolicy(
        config.maxAttempts,
        config.baseDelayMs,
        config.maxDelayMs,
        config.backoffMultiplier,
        config.jitter
      ));
    }
    
    return this.retryPolicies.get(operationType)!;
  }

  /**
   * Enable graceful degradation for a service
   */
  private async enableGracefulDegradation(serviceName: string, context: RecoveryContext): Promise<void> {
    const degradationConfig = {
      service: serviceName,
      enabled: true,
      timestamp: new Date().toISOString(),
      context
    };

    // Update configuration to disable service
    this.config.set(`external_services.${serviceName}.enabled`, false);
    this.config.set(`external_services.${serviceName}.degraded`, true);
    
    // Log degradation event
    await this.db.systemEvents.create({
      event_type: 'service_degradation',
      component: serviceName,
      details: degradationConfig,
      severity: 'warning'
    });

    this.emit('service-degraded', { service: serviceName, context });
  }

  /**
   * Handle system health degradation
   */
  private async handleHealthDegradation(component: string): Promise<void> {
    switch (component) {
      case 'memory':
        await this.handleMemoryPressure();
        break;
      case 'database':
        await this.handleDatabaseIssues();
        break;
      case 'system':
        await this.handleSystemPressure();
        break;
    }
  }

  /**
   * Handle memory pressure
   */
  private async handleMemoryPressure(): Promise<void> {
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }

    // Reduce system load
    await this.reduceSystemLoad();
    
    // Alert monitoring systems
    this.emit('memory-pressure-detected', {
      memoryUsage: process.memoryUsage(),
      action: 'load-reduction'
    });
  }

  /**
   * Handle database issues
   */
  private async handleDatabaseIssues(): Promise<void> {
    try {
      await this.db.reconnect();
      this.emit('database-reconnected');
    } catch (error) {
      this.emit('database-reconnection-failed', { error: error.message });
    }
  }

  /**
   * Handle system pressure
   */
  private async handleSystemPressure(): Promise<void> {
    // Reduce system load and pause non-critical operations
    await this.reduceSystemLoad();
    
    this.emit('system-pressure-detected', {
      cpuUsage: process.cpuUsage(),
      action: 'load-reduction'
    });
  }

  /**
   * Reduce system load by pausing non-critical operations
   */
  private async reduceSystemLoad(): Promise<void> {
    // This would integrate with the ALO to reduce agent concurrency
    this.emit('load-reduction-requested', {
      timestamp: new Date().toISOString(),
      reason: 'system-pressure'
    });
  }

  /**
   * Log recovery attempt
   */
  private async logRecoveryAttempt(
    strategy: RecoveryStrategy,
    error: Error,
    context: RecoveryContext,
    result: RecoveryResult
  ): Promise<void> {
    try {
      await this.db.systemEvents.create({
        event_type: 'error_recovery_attempt',
        component: context.agentType,
        details: {
          strategy: strategy.name,
          originalError: error.message,
          context,
          result,
          timestamp: new Date().toISOString()
        },
        severity: result.success ? 'info' : 'warning'
      });
    } catch (logError) {
      // Don't fail recovery due to logging issues
      console.error('Failed to log recovery attempt:', logError);
    }
  }

  /**
   * Extract service name from error message
   */
  private extractServiceName(errorMessage: string): string | null {
    const serviceNames = ['apollo', 'hunter', 'openai', 'anthropic', 'temporal'];
    return serviceNames.find(name => errorMessage.toLowerCase().includes(name)) || null;
  }

  /**
   * Extract retry-after value from error message
   */
  private extractRetryAfter(errorMessage: string): number | null {
    const match = errorMessage.match(/retry.after[:\s]+(\d+)/i);
    return match ? parseInt(match[1]) * 1000 : null; // Convert to milliseconds
  }

  /**
   * Get system health status
   */
  getSystemHealth() {
    return {
      overall: this.healthMonitor.getOverallHealth(),
      components: this.healthMonitor.getHealthStatus(),
      circuitBreakers: Object.fromEntries(
        Array.from(this.circuitBreakers.entries()).map(([name, breaker]) => [
          name,
          breaker.getStats()
        ])
      )
    };
  }

  /**
   * Shutdown error recovery manager
   */
  async shutdown(): Promise<void> {
    this.healthMonitor.stop();
    this.removeAllListeners();
  }
}

export default ErrorRecoveryManager;