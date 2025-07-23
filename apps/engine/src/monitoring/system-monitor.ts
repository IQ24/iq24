/**
 * IQ24 AI Engine - System Monitor
 * 
 * Comprehensive real-time system monitoring including performance metrics,
 * resource usage, AI model performance, error tracking, and alert management.
 */

import { EventEmitter } from "events";

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    heap: {
      used: number;
      total: number;
    };
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
    rps: number; // requests per second
  };
  ai: {
    totalRequests: number;
    averageLatency: number;
    errorRate: number;
    costToday: number;
    modelsUsed: string[];
  };
  database: {
    connections: number;
    queries: number;
    slowQueries: number;
    averageQueryTime: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: '>' | '<' | '==' | '!=' | '>=' | '<=';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: Date;
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  context: Record<string, any>;
}

export interface PerformanceThresholds {
  maxResponseTime: number;
  maxErrorRate: number;
  maxMemoryUsage: number;
  maxCpuUsage: number;
  maxDatabaseConnections: number;
  maxAILatency: number;
}

export class SystemMonitor extends EventEmitter {
  private static instance: SystemMonitor;
  private metrics: SystemMetrics[] = [];
  private alerts: Map<string, Alert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private thresholds: PerformanceThresholds;
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  
  // Performance counters
  private requestCount = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private totalResponseTime = 0;
  private aiRequestCount = 0;
  private aiTotalLatency = 0;
  private aiErrors = 0;
  private aiCostToday = 0;
  private databaseQueries = 0;
  private slowQueries = 0;
  private totalQueryTime = 0;

  private constructor(thresholds: PerformanceThresholds) {
    super();
    this.thresholds = thresholds;
    this.initializeDefaultAlertRules();
  }

  public static getInstance(thresholds?: PerformanceThresholds): SystemMonitor {
    if (!SystemMonitor.instance) {
      if (!thresholds) {
        throw new Error("SystemMonitor thresholds required for first initialization");
      }
      SystemMonitor.instance = new SystemMonitor(thresholds);
    }
    return SystemMonitor.instance;
  }

  /**
   * Start system monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      console.log("System monitoring is already running");
      return;
    }

    console.log(`Starting system monitoring with ${intervalMs}ms interval`);
    
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.checkAlertRules();
    }, intervalMs);

    this.isMonitoring = true;
    this.emit("monitoringStarted");
  }

  /**
   * Stop system monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log("System monitoring stopped");
    this.emit("monitoringStopped");
  }

  /**
   * Record API request metrics
   */
  recordRequest(responseTime: number, success: boolean): void {
    this.requestCount++;
    this.totalResponseTime += responseTime;
    
    if (success) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }
  }

  /**
   * Record AI operation metrics
   */
  recordAIOperation(latency: number, cost: number, success: boolean, model: string): void {
    this.aiRequestCount++;
    this.aiTotalLatency += latency;
    this.aiCostToday += cost;
    
    if (!success) {
      this.aiErrors++;
    }
  }

  /**
   * Record database query metrics
   */
  recordDatabaseQuery(queryTime: number, isSlow: boolean = false): void {
    this.databaseQueries++;
    this.totalQueryTime += queryTime;
    
    if (isSlow) {
      this.slowQueries++;
    }
  }

  /**
   * Get current system status
   */
  async getSystemStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    currentMetrics: SystemMetrics;
    activeAlerts: Alert[];
    performance: {
      responseTime: number;
      errorRate: number;
      availability: number;
    };
  }> {
    const currentMetrics = await this.getCurrentMetrics();
    const activeAlerts = Array.from(this.alerts.values()).filter(a => !a.resolvedAt);
    
    // Determine overall system status
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    const highAlerts = activeAlerts.filter(a => a.severity === 'high');
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (criticalAlerts.length > 0) {
      status = 'unhealthy';
    } else if (highAlerts.length > 0 || activeAlerts.length > 5) {
      status = 'degraded';
    }

    // Calculate performance metrics
    const errorRate = this.requestCount > 0 ? (this.failedRequests / this.requestCount) * 100 : 0;
    const avgResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
    const availability = this.requestCount > 0 ? (this.successfulRequests / this.requestCount) * 100 : 100;

    return {
      status,
      uptime: process.uptime(),
      currentMetrics,
      activeAlerts,
      performance: {
        responseTime: avgResponseTime,
        errorRate,
        availability,
      },
    };
  }

  /**
   * Get historical metrics
   */
  getHistoricalMetrics(hours: number = 24): SystemMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const id = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const alertRule: AlertRule = { id, ...rule };
    
    this.alertRules.set(id, alertRule);
    console.log(`Added alert rule: ${rule.name}`);
    
    return id;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      this.alerts.set(alertId, alert);
      
      console.log(`Alert ${alertId} acknowledged by ${acknowledgedBy}`);
      this.emit("alertAcknowledged", alert);
      return true;
    }
    return false;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolvedAt) {
      alert.resolvedAt = new Date();
      this.alerts.set(alertId, alert);
      
      console.log(`Alert ${alertId} resolved`);
      this.emit("alertResolved", alert);
      return true;
    }
    return false;
  }

  /**
   * Get system health dashboard data
   */
  async getDashboardData(): Promise<{
    overview: {
      status: string;
      uptime: number;
      totalRequests: number;
      errorRate: number;
      averageResponseTime: number;
    };
    alerts: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    performance: {
      cpu: number;
      memory: number;
      aiLatency: number;
      databasePerformance: number;
    };
    trends: {
      requestTrend: number[];
      errorTrend: number[];
      responseTrend: number[];
    };
  }> {
    const systemStatus = await this.getSystemStatus();
    const recentMetrics = this.getHistoricalMetrics(1); // Last hour
    
    // Calculate trends
    const requestTrend = recentMetrics.map(m => m.requests.rps);
    const errorTrend = recentMetrics.map(m => (m.requests.failed / m.requests.total) * 100);
    const responseTrend = recentMetrics.map(m => m.requests.averageResponseTime);

    // Count alerts by severity
    const activeAlerts = Array.from(this.alerts.values()).filter(a => !a.resolvedAt);
    const alertCounts = {
      critical: activeAlerts.filter(a => a.severity === 'critical').length,
      high: activeAlerts.filter(a => a.severity === 'high').length,
      medium: activeAlerts.filter(a => a.severity === 'medium').length,
      low: activeAlerts.filter(a => a.severity === 'low').length,
    };

    return {
      overview: {
        status: systemStatus.status,
        uptime: systemStatus.uptime,
        totalRequests: this.requestCount,
        errorRate: systemStatus.performance.errorRate,
        averageResponseTime: systemStatus.performance.responseTime,
      },
      alerts: alertCounts,
      performance: {
        cpu: systemStatus.currentMetrics.cpu.usage,
        memory: systemStatus.currentMetrics.memory.percentage,
        aiLatency: systemStatus.currentMetrics.ai.averageLatency,
        databasePerformance: systemStatus.currentMetrics.database.averageQueryTime,
      },
      trends: {
        requestTrend,
        errorTrend,
        responseTrend,
      },
    };
  }

  // Private methods
  private async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.getCurrentMetrics();
      
      // Store metrics (keep last 1000 entries)
      this.metrics.push(metrics);
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      this.emit("metricsCollected", metrics);
    } catch (error) {
      console.error("Failed to collect metrics:", error);
    }
  }

  private async getCurrentMetrics(): Promise<SystemMetrics> {
    const memoryUsage = process.memoryUsage();
    
    return {
      timestamp: new Date(),
      cpu: {
        usage: await this.getCpuUsage(),
        loadAverage: [1.2, 1.1, 1.0], // Mock load average
        cores: 4, // Mock core count
      },
      memory: {
        used: memoryUsage.rss,
        total: memoryUsage.rss * 2, // Mock total memory
        percentage: (memoryUsage.rss / (memoryUsage.rss * 2)) * 100,
        heap: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
        },
      },
      requests: {
        total: this.requestCount,
        successful: this.successfulRequests,
        failed: this.failedRequests,
        averageResponseTime: this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0,
        rps: this.calculateRPS(),
      },
      ai: {
        totalRequests: this.aiRequestCount,
        averageLatency: this.aiRequestCount > 0 ? this.aiTotalLatency / this.aiRequestCount : 0,
        errorRate: this.aiRequestCount > 0 ? (this.aiErrors / this.aiRequestCount) * 100 : 0,
        costToday: this.aiCostToday,
        modelsUsed: ['gpt-4', 'claude-3'], // Mock models
      },
      database: {
        connections: 10, // Mock connection count
        queries: this.databaseQueries,
        slowQueries: this.slowQueries,
        averageQueryTime: this.databaseQueries > 0 ? this.totalQueryTime / this.databaseQueries : 0,
      },
    };
  }

  private async getCpuUsage(): Promise<number> {
    // Mock CPU usage - in production this would use actual system metrics
    return 15 + Math.random() * 20; // 15-35% usage
  }

  private calculateRPS(): number {
    // Calculate requests per second over the last minute
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= oneMinuteAgo);
    
    if (recentMetrics.length < 2) return 0;
    
    const oldest = recentMetrics[0];
    const newest = recentMetrics[recentMetrics.length - 1];
    const timeDiff = newest.timestamp.getTime() - oldest.timestamp.getTime();
    const requestDiff = newest.requests.total - oldest.requests.total;
    
    return timeDiff > 0 ? (requestDiff / timeDiff) * 1000 : 0;
  }

  private async checkAlertRules(): Promise<void> {
    const currentMetrics = await this.getCurrentMetrics();
    
    for (const [ruleId, rule] of this.alertRules) {
      if (!rule.enabled) continue;
      
      // Check cooldown period
      if (rule.lastTriggered) {
        const cooldownExpiry = new Date(rule.lastTriggered.getTime() + rule.cooldownMinutes * 60000);
        if (new Date() < cooldownExpiry) continue;
      }

      const metricValue = this.getMetricValue(currentMetrics, rule.metric);
      const shouldTrigger = this.evaluateCondition(metricValue, rule.operator, rule.threshold);
      
      if (shouldTrigger) {
        await this.triggerAlert(rule, metricValue, currentMetrics);
      }
    }
  }

  private getMetricValue(metrics: SystemMetrics, metricPath: string): number {
    const parts = metricPath.split('.');
    let value: any = metrics;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return typeof value === 'number' ? value : 0;
  }

  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      case '!=': return value !== threshold;
      default: return false;
    }
  }

  private async triggerAlert(rule: AlertRule, metricValue: number, context: SystemMetrics): Promise<void> {
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      severity: rule.severity,
      message: `${rule.name}: ${rule.metric} is ${metricValue} (threshold: ${rule.threshold})`,
      triggeredAt: new Date(),
      acknowledged: false,
      context: {
        metricValue,
        threshold: rule.threshold,
        operator: rule.operator,
        systemMetrics: context,
      },
    };

    this.alerts.set(alertId, alert);
    
    // Update rule's last triggered time
    rule.lastTriggered = new Date();
    this.alertRules.set(rule.id, rule);

    console.warn(`ALERT TRIGGERED: ${alert.message}`);
    this.emit("alertTriggered", alert);
  }

  private initializeDefaultAlertRules(): void {
    const defaultRules: Omit<AlertRule, 'id'>[] = [
      {
        name: "High CPU Usage",
        metric: "cpu.usage",
        operator: ">",
        threshold: this.thresholds.maxCpuUsage,
        severity: "high",
        enabled: true,
        cooldownMinutes: 5,
      },
      {
        name: "High Memory Usage",
        metric: "memory.percentage",
        operator: ">",
        threshold: this.thresholds.maxMemoryUsage,
        severity: "high",
        enabled: true,
        cooldownMinutes: 5,
      },
      {
        name: "High Error Rate",
        metric: "requests.failed",
        operator: ">",
        threshold: this.thresholds.maxErrorRate,
        severity: "critical",
        enabled: true,
        cooldownMinutes: 2,
      },
      {
        name: "Slow Response Time",
        metric: "requests.averageResponseTime",
        operator: ">",
        threshold: this.thresholds.maxResponseTime,
        severity: "medium",
        enabled: true,
        cooldownMinutes: 5,
      },
      {
        name: "High AI Latency",
        metric: "ai.averageLatency",
        operator: ">",
        threshold: this.thresholds.maxAILatency,
        severity: "medium",
        enabled: true,
        cooldownMinutes: 10,
      },
    ];

    defaultRules.forEach(rule => this.addAlertRule(rule));
    console.log(`Initialized ${defaultRules.length} default alert rules`);
  }
}

// Also export a default instance for backward compatibility
export const systemMonitor = SystemMonitor.getInstance({
  maxResponseTime: 5000, // 5 seconds
  maxErrorRate: 5, // 5%
  maxMemoryUsage: 80, // 80%
  maxCpuUsage: 70, // 70%
  maxDatabaseConnections: 50,
  maxAILatency: 10000, // 10 seconds
});