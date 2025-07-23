/**
 * Comprehensive System Monitoring and Health Dashboard for IQ24.ai AI Core
 * Real-time monitoring, alerting, and performance analytics
 */

import { EventEmitter } from "events";
import { ConfigManager } from "../config";
import { DatabaseClient } from "../database/client";
import { ErrorRecoveryManager } from "../recovery/error-recovery";

export interface MetricValue {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
}

export interface Alert {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  component: string;
  timestamp: number;
  resolved?: boolean;
  resolvedAt?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    heapUsed: number;
    heapTotal: number;
  };
  network: {
    connections: number;
    bytesIn: number;
    bytesOut: number;
  };
  agents: {
    active: number;
    processing: number;
    idle: number;
    failed: number;
  };
  workflows: {
    running: number;
    completed: number;
    failed: number;
    avgDuration: number;
  };
  database: {
    connections: number;
    queries: number;
    avgResponseTime: number;
  };
  external_services: Record<
    string,
    {
      available: boolean;
      responseTime: number;
      errorRate: number;
    }
  >;
}

export interface SystemHealthStatus {
  overall: "healthy" | "degraded" | "critical";
  components: Record<
    string,
    {
      status: "healthy" | "degraded" | "critical";
      details: string;
      lastCheck: number;
    }
  >;
  alerts: Alert[];
  metrics: PerformanceMetrics;
  uptime: number;
  version: string;
}

/**
 * Metrics Collector - Gathers system and application metrics
 */
export class MetricsCollector extends EventEmitter {
  private metrics = new Map<string, MetricValue[]>();
  private readonly maxMetricHistory = 1000; // Keep last 1000 data points
  private intervalId?: NodeJS.Timeout;
  private collecting = false;

  constructor(private intervalMs: number = 10000) {
    super();
  }

  start(): void {
    if (this.collecting) return;

    this.collecting = true;
    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, this.intervalMs);

    // Collect initial metrics
    this.collectMetrics();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.collecting = false;
  }

  private async collectMetrics(): Promise<void> {
    const timestamp = Date.now();

    try {
      // System metrics
      await this.collectSystemMetrics(timestamp);

      // Application metrics
      await this.collectApplicationMetrics(timestamp);

      // External service metrics
      await this.collectExternalServiceMetrics(timestamp);

      this.emit("metrics-collected", { timestamp, count: this.metrics.size });
    } catch (error) {
      this.emit("metrics-collection-error", { error, timestamp });
    }
  }

  private async collectSystemMetrics(timestamp: number): Promise<void> {
    // CPU metrics
    const cpuUsage = process.cpuUsage();
    this.recordMetric("system.cpu.user", {
      timestamp,
      value: cpuUsage.user / 1000000, // Convert to seconds
      tags: { type: "user" },
    });

    this.recordMetric("system.cpu.system", {
      timestamp,
      value: cpuUsage.system / 1000000,
      tags: { type: "system" },
    });

    // Memory metrics
    const memUsage = process.memoryUsage();
    this.recordMetric("system.memory.heap_used", {
      timestamp,
      value: memUsage.heapUsed,
      tags: { unit: "bytes" },
    });

    this.recordMetric("system.memory.heap_total", {
      timestamp,
      value: memUsage.heapTotal,
      tags: { unit: "bytes" },
    });

    this.recordMetric("system.memory.external", {
      timestamp,
      value: memUsage.external,
      tags: { unit: "bytes" },
    });

    // Process metrics
    this.recordMetric("system.uptime", {
      timestamp,
      value: process.uptime(),
      tags: { unit: "seconds" },
    });
  }

  private async collectApplicationMetrics(timestamp: number): Promise<void> {
    // This would integrate with the AI Engine to get agent metrics
    // For now, we'll simulate some metrics

    // Agent metrics (would come from AI Engine)
    this.recordMetric("agents.active", {
      timestamp,
      value: Math.floor(Math.random() * 10) + 5, // 5-15 active agents
      tags: { component: "ai-engine" },
    });

    this.recordMetric("agents.processing", {
      timestamp,
      value: Math.floor(Math.random() * 5) + 1, // 1-6 processing
      tags: { component: "ai-engine" },
    });

    // Workflow metrics (would come from Campaign Workflow)
    this.recordMetric("workflows.running", {
      timestamp,
      value: Math.floor(Math.random() * 3) + 1, // 1-4 running
      tags: { component: "workflow-engine" },
    });

    this.recordMetric("workflows.completed_today", {
      timestamp,
      value: Math.floor(Math.random() * 50) + 20, // 20-70 completed today
      tags: { component: "workflow-engine", period: "daily" },
    });

    // Database metrics (would come from DatabaseClient)
    this.recordMetric("database.active_connections", {
      timestamp,
      value: Math.floor(Math.random() * 5) + 1, // 1-6 connections
      tags: { component: "database" },
    });

    this.recordMetric("database.query_count", {
      timestamp,
      value: this.getRandomIncreasing("database.query_count", 100),
      tags: { component: "database", type: "total" },
    });
  }

  private async collectExternalServiceMetrics(
    timestamp: number,
  ): Promise<void> {
    const services = ["apollo", "hunter", "openai", "anthropic", "temporal"];

    for (const service of services) {
      // Simulate service availability check
      const isAvailable = Math.random() > 0.1; // 90% availability
      const responseTime = isAvailable ? Math.random() * 500 + 100 : 0; // 100-600ms

      this.recordMetric(`external_services.${service}.availability`, {
        timestamp,
        value: isAvailable ? 1 : 0,
        tags: { service, component: "external-services" },
      });

      if (isAvailable) {
        this.recordMetric(`external_services.${service}.response_time`, {
          timestamp,
          value: responseTime,
          tags: { service, component: "external-services", unit: "ms" },
        });
      }
    }
  }

  private recordMetric(name: string, metric: MetricValue): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only recent metrics
    if (metrics.length > this.maxMetricHistory) {
      metrics.shift();
    }
  }

  private getRandomIncreasing(
    metricName: string,
    maxIncrease: number = 10,
  ): number {
    const current = this.getLatestMetric(metricName)?.value || 0;
    return current + Math.floor(Math.random() * maxIncrease);
  }

  getLatestMetric(name: string): MetricValue | null {
    const metrics = this.metrics.get(name);
    return metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
  }

  getMetricHistory(name: string, since?: number): MetricValue[] {
    const metrics = this.metrics.get(name) || [];
    return since ? metrics.filter((m) => m.timestamp >= since) : metrics;
  }

  getAllMetrics(): Record<string, MetricValue[]> {
    return Object.fromEntries(this.metrics);
  }
}

/**
 * Alert Manager - Handles system alerts and notifications
 */
export class AlertManager extends EventEmitter {
  private alerts = new Map<string, Alert>();
  private rules: AlertRule[] = [];
  private db: DatabaseClient;

  constructor() {
    super();
    this.db = DatabaseClient.getInstance();
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // High memory usage alert
    this.addRule({
      name: "high-memory-usage",
      condition: (metrics) => {
        const memMetric = metrics.get("system.memory.heap_used");
        const totalMetric = metrics.get("system.memory.heap_total");
        if (!memMetric || !totalMetric) return false;

        const usage = memMetric.value / totalMetric.value;
        return usage > 0.9; // 90% memory usage
      },
      severity: "high",
      title: "High Memory Usage",
      message: "System memory usage is above 90%",
      component: "system",
    });

    // Service unavailable alert
    this.addRule({
      name: "service-unavailable",
      condition: (metrics) => {
        const services = ["apollo", "hunter", "openai", "anthropic"];
        return services.some((service) => {
          const metric = metrics.get(
            `external_services.${service}.availability`,
          );
          return metric && metric.value === 0;
        });
      },
      severity: "medium",
      title: "External Service Unavailable",
      message: "One or more external services are unavailable",
      component: "external-services",
    });

    // High error rate alert
    this.addRule({
      name: "high-error-rate",
      condition: (metrics) => {
        const errorMetric = metrics.get("system.errors.rate");
        return errorMetric && errorMetric.value > 0.1; // 10% error rate
      },
      severity: "critical",
      title: "High Error Rate",
      message: "System error rate is above 10%",
      component: "system",
    });

    // Workflow failure alert
    this.addRule({
      name: "workflow-failures",
      condition: (metrics) => {
        const failedMetric = metrics.get("workflows.failed");
        const totalMetric = metrics.get("workflows.total");
        if (!failedMetric || !totalMetric) return false;

        const failureRate = failedMetric.value / totalMetric.value;
        return failureRate > 0.2; // 20% failure rate
      },
      severity: "high",
      title: "High Workflow Failure Rate",
      message: "Workflow failure rate is above 20%",
      component: "workflow-engine",
    });
  }

  addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  async evaluateAlerts(metrics: Map<string, MetricValue>): Promise<void> {
    for (const rule of this.rules) {
      try {
        const shouldAlert = rule.condition(metrics);
        const existingAlert = this.alerts.get(rule.name);

        if (shouldAlert && !existingAlert) {
          // Create new alert
          const alert: Alert = {
            id: `${rule.name}-${Date.now()}`,
            severity: rule.severity,
            title: rule.title,
            message: rule.message,
            component: rule.component,
            timestamp: Date.now(),
            metadata: rule.metadata,
          };

          this.alerts.set(rule.name, alert);
          await this.persistAlert(alert);
          this.emit("alert-created", alert);
        } else if (!shouldAlert && existingAlert && !existingAlert.resolved) {
          // Resolve existing alert
          existingAlert.resolved = true;
          existingAlert.resolvedAt = Date.now();

          await this.persistAlert(existingAlert);
          this.emit("alert-resolved", existingAlert);
        }
      } catch (error) {
        console.error(`Error evaluating alert rule ${rule.name}:`, error);
      }
    }
  }

  private async persistAlert(alert: Alert): Promise<void> {
    try {
      await this.db.systemEvents.create({
        event_type: alert.resolved ? "alert_resolved" : "alert_created",
        component: alert.component,
        details: alert,
        severity:
          alert.severity === "critical"
            ? "error"
            : alert.severity === "high"
              ? "warning"
              : "info",
      });
    } catch (error) {
      console.error("Failed to persist alert:", error);
    }
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter((alert) => !alert.resolved);
  }

  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = Array.from(this.alerts.values()).find(
      (a) => a.id === alertId,
    );
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      await this.persistAlert(alert);
      this.emit("alert-resolved", alert);
      return true;
    }
    return false;
  }
}

interface AlertRule {
  name: string;
  condition: (metrics: Map<string, MetricValue>) => boolean;
  severity: Alert["severity"];
  title: string;
  message: string;
  component: string;
  metadata?: Record<string, any>;
}

/**
 * Main System Monitor - Orchestrates monitoring, metrics, and alerts
 */
export class SystemMonitor extends EventEmitter {
  private metricsCollector: MetricsCollector;
  private alertManager: AlertManager;
  private errorRecovery: ErrorRecoveryManager;
  private config: ConfigManager;
  private db: DatabaseClient;
  private startTime: number;

  constructor() {
    super();
    this.config = new ConfigManager();
    this.db = DatabaseClient.getInstance();
    this.metricsCollector = new MetricsCollector(
      this.config.get("monitoring.metrics_interval_ms", 10000),
    );
    this.alertManager = new AlertManager();
    this.errorRecovery = new ErrorRecoveryManager();
    this.startTime = Date.now();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Metrics events
    this.metricsCollector.on("metrics-collected", (data) => {
      this.evaluateAlertsFromMetrics();
      this.emit("metrics-updated", data);
    });

    this.metricsCollector.on("metrics-collection-error", (data) => {
      console.error("Metrics collection error:", data);
      this.emit("monitoring-error", data);
    });

    // Alert events
    this.alertManager.on("alert-created", (alert) => {
      console.warn(`🚨 ALERT: ${alert.title} - ${alert.message}`);
      this.emit("alert", alert);
      this.handleCriticalAlert(alert);
    });

    this.alertManager.on("alert-resolved", (alert) => {
      console.info(`✅ RESOLVED: ${alert.title}`);
      this.emit("alert-resolved", alert);
    });

    // Error recovery events
    this.errorRecovery.on("system-health-degraded", (data) => {
      console.warn(`⚠️  System health degraded: ${data.component}`);
    });

    this.errorRecovery.on("system-health-recovered", (data) => {
      console.info(`✅ System health recovered: ${data.component}`);
    });
  }

  async start(): Promise<void> {
    console.log("🔍 Starting IQ24.ai System Monitor...");

    this.metricsCollector.start();

    // Start periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds

    console.log("✅ System Monitor started successfully");
  }

  async stop(): Promise<void> {
    console.log("🛑 Stopping System Monitor...");

    this.metricsCollector.stop();
    await this.errorRecovery.shutdown();
    this.removeAllListeners();

    console.log("✅ System Monitor stopped");
  }

  private async evaluateAlertsFromMetrics(): Promise<void> {
    const metricsMap = new Map<string, MetricValue>();
    const allMetrics = this.metricsCollector.getAllMetrics();

    // Convert to Map with latest values
    for (const [name, values] of Object.entries(allMetrics)) {
      if (values.length > 0) {
        metricsMap.set(name, values[values.length - 1]);
      }
    }

    await this.alertManager.evaluateAlerts(metricsMap);
  }

  private async performHealthCheck(): Promise<void> {
    const health = this.errorRecovery.getSystemHealth();

    if (!health.overall) {
      this.emit("health-check-failed", health);
    } else {
      this.emit("health-check-passed", health);
    }
  }

  private async handleCriticalAlert(alert: Alert): Promise<void> {
    if (alert.severity === "critical") {
      // Trigger automated recovery if possible
      this.emit("critical-alert", alert);

      // Could trigger specific recovery actions based on alert type
      switch (alert.component) {
        case "system":
          // System-level recovery
          break;
        case "database":
          // Database recovery
          break;
        case "external-services":
          // Service recovery
          break;
      }
    }
  }

  /**
   * Get comprehensive system health status
   */
  getSystemHealth(): SystemHealthStatus {
    const uptime = Date.now() - this.startTime;
    const systemHealth = this.errorRecovery.getSystemHealth();
    const alerts = this.alertManager.getActiveAlerts();
    const allMetrics = this.metricsCollector.getAllMetrics();

    // Build performance metrics from collected data
    const metrics: PerformanceMetrics = {
      cpu: {
        usage: this.getLatestMetricValue(allMetrics, "system.cpu.user") || 0,
        loadAverage: [0, 0, 0], // Would come from OS
      },
      memory: {
        used:
          this.getLatestMetricValue(allMetrics, "system.memory.heap_used") || 0,
        total:
          this.getLatestMetricValue(allMetrics, "system.memory.heap_total") ||
          0,
        percentage: 0,
        heapUsed:
          this.getLatestMetricValue(allMetrics, "system.memory.heap_used") || 0,
        heapTotal:
          this.getLatestMetricValue(allMetrics, "system.memory.heap_total") ||
          0,
      },
      network: {
        connections: 0,
        bytesIn: 0,
        bytesOut: 0,
      },
      agents: {
        active: this.getLatestMetricValue(allMetrics, "agents.active") || 0,
        processing:
          this.getLatestMetricValue(allMetrics, "agents.processing") || 0,
        idle: 0,
        failed: 0,
      },
      workflows: {
        running:
          this.getLatestMetricValue(allMetrics, "workflows.running") || 0,
        completed:
          this.getLatestMetricValue(allMetrics, "workflows.completed_today") ||
          0,
        failed: 0,
        avgDuration: 0,
      },
      database: {
        connections:
          this.getLatestMetricValue(
            allMetrics,
            "database.active_connections",
          ) || 0,
        queries:
          this.getLatestMetricValue(allMetrics, "database.query_count") || 0,
        avgResponseTime: 0,
      },
      external_services: {},
    };

    // Calculate memory percentage
    if (metrics.memory.total > 0) {
      metrics.memory.percentage =
        (metrics.memory.used / metrics.memory.total) * 100;
    }

    // Build external services metrics
    const services = ["apollo", "hunter", "openai", "anthropic", "temporal"];
    for (const service of services) {
      metrics.external_services[service] = {
        available:
          this.getLatestMetricValue(
            allMetrics,
            `external_services.${service}.availability`,
          ) === 1,
        responseTime:
          this.getLatestMetricValue(
            allMetrics,
            `external_services.${service}.response_time`,
          ) || 0,
        errorRate: 0,
      };
    }

    // Determine overall health
    let overallHealth: SystemHealthStatus["overall"] = "healthy";
    const criticalAlerts = alerts.filter((a) => a.severity === "critical");
    const highAlerts = alerts.filter((a) =>
      ["high", "critical"].includes(a.severity),
    );

    if (criticalAlerts.length > 0) {
      overallHealth = "critical";
    } else if (highAlerts.length > 0 || !systemHealth.overall) {
      overallHealth = "degraded";
    }

    return {
      overall: overallHealth,
      components: Object.fromEntries(
        Object.entries(systemHealth.components).map(([name, healthy]) => [
          name,
          {
            status: healthy ? "healthy" : "degraded",
            details: healthy ? "Operating normally" : "Performance degraded",
            lastCheck: Date.now(),
          },
        ]),
      ),
      alerts,
      metrics,
      uptime,
      version: this.config.get("system.version", "1.0.0"),
    };
  }

  private getLatestMetricValue(
    allMetrics: Record<string, MetricValue[]>,
    metricName: string,
  ): number | null {
    const metrics = allMetrics[metricName];
    return metrics && metrics.length > 0
      ? metrics[metrics.length - 1].value
      : null;
  }

  /**
   * Get metrics for a specific time period
   */
  getMetrics(since?: number): Record<string, MetricValue[]> {
    const allMetrics = this.metricsCollector.getAllMetrics();

    if (!since) return allMetrics;

    return Object.fromEntries(
      Object.entries(allMetrics).map(([name, values]) => [
        name,
        values.filter((v) => v.timestamp >= since),
      ]),
    );
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alertManager.getActiveAlerts();
  }

  /**
   * Resolve an alert manually
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    return this.alertManager.resolveAlert(alertId);
  }
}

export default SystemMonitor;
