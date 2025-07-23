import {
  QualityCheck,
  QualityCheckResult,
  QualityMetrics,
  QualityRule,
  QualityThreshold,
  DataRecord,
  DataSchema,
  QualityAlert,
  QualityReport,
  QualityMonitorConfig,
} from "../types";
import { EventEmitter } from "events";
import { Logger } from "../utils/logger";

/**
 * Quality Check Executor
 * Executes individual quality checks on data records
 */
export class QualityCheckExecutor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async executeCheck(
    records: DataRecord[],
    check: QualityCheck,
    schema?: DataSchema,
  ): Promise<QualityCheckResult> {
    const startTime = Date.now();
    let passedRecords = 0;
    let failedRecords = 0;
    const failureReasons: string[] = [];
    const violations: Array<{
      recordId: string;
      field?: string;
      reason: string;
    }> = [];

    try {
      this.logger.debug("Executing quality check", {
        checkId: check.id,
        type: check.type,
        recordCount: records.length,
      });

      for (const record of records) {
        try {
          const passed = await this.evaluateRecord(record, check, schema);

          if (passed) {
            passedRecords++;
          } else {
            failedRecords++;
            const reason = this.getFailureReason(record, check);
            failureReasons.push(reason);
            violations.push({
              recordId: record.id,
              field: check.field,
              reason,
            });
          }
        } catch (error) {
          failedRecords++;
          const reason = `Check execution failed: ${error.message}`;
          failureReasons.push(reason);
          violations.push({
            recordId: record.id,
            field: check.field,
            reason,
          });
        }
      }

      const executionTime = Date.now() - startTime;
      const successRate =
        records.length > 0 ? passedRecords / records.length : 1;
      const qualityScore = this.calculateQualityScore(
        successRate,
        check.weight || 1,
      );

      const result: QualityCheckResult = {
        checkId: check.id,
        checkType: check.type,
        field: check.field,
        totalRecords: records.length,
        passedRecords,
        failedRecords,
        successRate,
        qualityScore,
        executionTime,
        violations: violations.slice(0, 100), // Limit violations to prevent memory issues
        failureReasons: [...new Set(failureReasons)], // Deduplicate reasons
        threshold: check.threshold,
        passed: successRate >= (check.threshold?.minSuccessRate || 0.95),
        timestamp: new Date(),
      };

      this.logger.debug("Quality check completed", {
        checkId: check.id,
        successRate,
        qualityScore,
        passed: result.passed,
      });

      return result;
    } catch (error) {
      this.logger.error("Quality check execution failed", {
        checkId: check.id,
        error: error.message,
      });

      return {
        checkId: check.id,
        checkType: check.type,
        field: check.field,
        totalRecords: records.length,
        passedRecords: 0,
        failedRecords: records.length,
        successRate: 0,
        qualityScore: 0,
        executionTime: Date.now() - startTime,
        violations: [],
        failureReasons: [error.message],
        threshold: check.threshold,
        passed: false,
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  private async evaluateRecord(
    record: DataRecord,
    check: QualityCheck,
    schema?: DataSchema,
  ): Promise<boolean> {
    switch (check.type) {
      case "completeness":
        return this.checkCompleteness(record, check);

      case "uniqueness":
        return this.checkUniqueness(record, check);

      case "validity":
        return this.checkValidity(record, check);

      case "consistency":
        return this.checkConsistency(record, check);

      case "accuracy":
        return this.checkAccuracy(record, check);

      case "timeliness":
        return this.checkTimeliness(record, check);

      case "range":
        return this.checkRange(record, check);

      case "format":
        return this.checkFormat(record, check);

      case "schema_compliance":
        return this.checkSchemaCompliance(record, check, schema);

      case "custom":
        return this.checkCustomRule(record, check);

      default:
        throw new Error(`Unsupported quality check type: ${check.type}`);
    }
  }

  private checkCompleteness(record: DataRecord, check: QualityCheck): boolean {
    const field = check.field;
    if (!field) return true;

    const value = record.data[field];
    return value !== undefined && value !== null && value !== "";
  }

  private checkUniqueness(record: DataRecord, check: QualityCheck): boolean {
    // This would require access to other records or a uniqueness cache
    // For now, assume all records are unique
    return true;
  }

  private checkValidity(record: DataRecord, check: QualityCheck): boolean {
    const field = check.field;
    if (!field) return true;

    const value = record.data[field];
    const rule = check.rule;

    if (!rule) return true;

    switch (rule.type) {
      case "email":
        return (
          typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        );

      case "phone":
        return (
          typeof value === "string" && /^\+?[\d\s\-\(\)]{10,}$/.test(value)
        );

      case "url":
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }

      case "date":
        return !isNaN(Date.parse(value));

      case "number":
        return !isNaN(Number(value));

      case "regex":
        return (
          typeof value === "string" &&
          new RegExp(rule.pattern || "").test(value)
        );

      default:
        return true;
    }
  }

  private checkConsistency(record: DataRecord, check: QualityCheck): boolean {
    // Check consistency between related fields
    const field = check.field;
    const relatedField = check.rule?.relatedField;

    if (!field || !relatedField) return true;

    const value1 = record.data[field];
    const value2 = record.data[relatedField];

    switch (check.rule?.consistencyType) {
      case "date_order":
        const date1 = new Date(value1);
        const date2 = new Date(value2);
        return date1 <= date2;

      case "numerical_relationship":
        const num1 = Number(value1);
        const num2 = Number(value2);
        const operator = check.rule?.operator || "<=";

        switch (operator) {
          case "<":
            return num1 < num2;
          case "<=":
            return num1 <= num2;
          case ">":
            return num1 > num2;
          case ">=":
            return num1 >= num2;
          case "==":
            return num1 === num2;
          default:
            return true;
        }

      default:
        return true;
    }
  }

  private checkAccuracy(record: DataRecord, check: QualityCheck): boolean {
    // Accuracy checks would typically involve external data sources
    // For now, assume all data is accurate
    return true;
  }

  private checkTimeliness(record: DataRecord, check: QualityCheck): boolean {
    const field = check.field;
    if (!field) return true;

    const value = record.data[field];
    const timestamp = new Date(value);

    if (isNaN(timestamp.getTime())) return false;

    const now = new Date();
    const maxAge = check.threshold?.maxAgeMinutes || 60;
    const ageMinutes = (now.getTime() - timestamp.getTime()) / (1000 * 60);

    return ageMinutes <= maxAge;
  }

  private checkRange(record: DataRecord, check: QualityCheck): boolean {
    const field = check.field;
    if (!field) return true;

    const value = Number(record.data[field]);
    if (isNaN(value)) return false;

    const min = check.threshold?.minValue;
    const max = check.threshold?.maxValue;

    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;

    return true;
  }

  private checkFormat(record: DataRecord, check: QualityCheck): boolean {
    const field = check.field;
    if (!field) return true;

    const value = String(record.data[field]);
    const pattern = check.rule?.pattern;

    if (!pattern) return true;

    return new RegExp(pattern).test(value);
  }

  private checkSchemaCompliance(
    record: DataRecord,
    check: QualityCheck,
    schema?: DataSchema,
  ): boolean {
    if (!schema) return true;

    for (const schemaField of schema.fields) {
      const value = record.data[schemaField.name];

      // Check required fields
      if (schemaField.required && (value === undefined || value === null)) {
        return false;
      }

      // Check data types
      if (value !== undefined && !this.isValidType(value, schemaField.type)) {
        return false;
      }
    }

    return true;
  }

  private checkCustomRule(record: DataRecord, check: QualityCheck): boolean {
    const customFunction = check.rule?.customFunction;
    if (!customFunction) return true;

    try {
      // Execute custom validation function
      const validationFunction = eval(customFunction);
      return validationFunction(record, check);
    } catch (error) {
      this.logger.warn("Custom quality check failed", {
        checkId: check.id,
        recordId: record.id,
        error: error.message,
      });
      return false;
    }
  }

  private isValidType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number" && !isNaN(value);
      case "boolean":
        return typeof value === "boolean";
      case "date":
        return value instanceof Date || !isNaN(Date.parse(value));
      case "array":
        return Array.isArray(value);
      case "object":
        return (
          typeof value === "object" && value !== null && !Array.isArray(value)
        );
      default:
        return true;
    }
  }

  private getFailureReason(record: DataRecord, check: QualityCheck): string {
    const field = check.field || "unknown";
    const value = check.field ? record.data[check.field] : "N/A";

    switch (check.type) {
      case "completeness":
        return `Field '${field}' is empty or missing`;
      case "validity":
        return `Field '${field}' has invalid value: ${value}`;
      case "range":
        return `Field '${field}' value ${value} is outside acceptable range`;
      case "format":
        return `Field '${field}' value ${value} does not match required format`;
      default:
        return `Quality check '${check.type}' failed for field '${field}'`;
    }
  }

  private calculateQualityScore(successRate: number, weight: number): number {
    return Math.max(0, Math.min(1, successRate * weight));
  }
}

/**
 * Quality Monitor
 * Orchestrates quality checks and monitors data quality across pipelines
 */
export class QualityMonitor extends EventEmitter {
  private executor: QualityCheckExecutor;
  private logger: Logger;
  private config: QualityMonitorConfig;
  private metrics: Map<string, QualityMetrics> = new Map();
  private alerts: QualityAlert[] = [];
  private isMonitoring: boolean = false;

  constructor(config: QualityMonitorConfig, logger: Logger) {
    super();
    this.config = config;
    this.logger = logger;
    this.executor = new QualityCheckExecutor(logger);
  }

  async executeQualityChecks(
    records: DataRecord[],
    checks: QualityCheck[],
    schema?: DataSchema,
    context?: { pipelineId?: string; batchId?: string },
  ): Promise<QualityReport> {
    const startTime = Date.now();
    const checkResults: QualityCheckResult[] = [];
    let overallScore = 0;
    let criticalFailures = 0;

    try {
      this.logger.info("Starting quality checks execution", {
        recordCount: records.length,
        checkCount: checks.length,
        pipelineId: context?.pipelineId,
        batchId: context?.batchId,
      });

      // Execute all quality checks
      for (const check of checks) {
        try {
          const result = await this.executor.executeCheck(
            records,
            check,
            schema,
          );
          checkResults.push(result);

          // Update overall score
          overallScore += result.qualityScore * (check.weight || 1);

          // Track critical failures
          if (!result.passed && check.severity === "critical") {
            criticalFailures++;
          }

          // Generate alerts if needed
          if (!result.passed && this.shouldGenerateAlert(check, result)) {
            const alert = this.createAlert(check, result, context);
            this.alerts.push(alert);
            this.emit("qualityAlert", alert);
          }
        } catch (error) {
          this.logger.error("Quality check execution failed", {
            checkId: check.id,
            error: error.message,
          });

          // Create failed result
          const failedResult: QualityCheckResult = {
            checkId: check.id,
            checkType: check.type,
            field: check.field,
            totalRecords: records.length,
            passedRecords: 0,
            failedRecords: records.length,
            successRate: 0,
            qualityScore: 0,
            executionTime: 0,
            violations: [],
            failureReasons: [error.message],
            threshold: check.threshold,
            passed: false,
            timestamp: new Date(),
            error: error.message,
          };

          checkResults.push(failedResult);

          if (check.severity === "critical") {
            criticalFailures++;
          }
        }
      }

      const totalWeight = checks.reduce(
        (sum, check) => sum + (check.weight || 1),
        0,
      );
      overallScore = totalWeight > 0 ? overallScore / totalWeight : 0;

      const executionTime = Date.now() - startTime;
      const passed =
        criticalFailures === 0 &&
        overallScore >= (this.config.minimumQualityScore || 0.8);

      const report: QualityReport = {
        id: this.generateReportId(),
        pipelineId: context?.pipelineId,
        batchId: context?.batchId,
        timestamp: new Date(),
        recordCount: records.length,
        checkCount: checks.length,
        overallScore,
        passed,
        criticalFailures,
        executionTime,
        checkResults,
        summary: this.generateSummary(checkResults),
        recommendations: this.generateRecommendations(checkResults),
      };

      // Update metrics
      this.updateMetrics(report);

      this.logger.info("Quality checks execution completed", {
        reportId: report.id,
        overallScore,
        passed,
        criticalFailures,
        executionTime,
      });

      this.emit("qualityReportGenerated", report);

      return report;
    } catch (error) {
      this.logger.error("Quality checks execution failed", {
        recordCount: records.length,
        checkCount: checks.length,
        error: error.message,
      });
      throw error;
    }
  }

  async startContinuousMonitoring(
    pipelineId: string,
    checks: QualityCheck[],
    interval: number = 60000,
  ): Promise<void> {
    if (this.isMonitoring) {
      throw new Error("Quality monitoring is already running");
    }

    this.isMonitoring = true;
    this.logger.info("Starting continuous quality monitoring", {
      pipelineId,
      checkCount: checks.length,
      interval,
    });

    const monitoringLoop = async () => {
      if (!this.isMonitoring) return;

      try {
        // This would typically fetch recent data from the pipeline
        const recentRecords = await this.fetchRecentRecords(pipelineId);

        if (recentRecords.length > 0) {
          const report = await this.executeQualityChecks(
            recentRecords,
            checks,
            undefined,
            { pipelineId },
          );

          // Handle monitoring results
          if (!report.passed) {
            this.logger.warn("Quality monitoring detected issues", {
              pipelineId,
              overallScore: report.overallScore,
              criticalFailures: report.criticalFailures,
            });
          }
        }
      } catch (error) {
        this.logger.error("Quality monitoring iteration failed", {
          pipelineId,
          error: error.message,
        });
      }

      // Schedule next iteration
      setTimeout(monitoringLoop, interval);
    };

    // Start monitoring loop
    monitoringLoop();
  }

  async stopContinuousMonitoring(): Promise<void> {
    this.isMonitoring = false;
    this.logger.info("Stopped continuous quality monitoring");
  }

  async getQualityMetrics(
    pipelineId?: string,
  ): Promise<QualityMetrics | Map<string, QualityMetrics>> {
    if (pipelineId) {
      return this.metrics.get(pipelineId) || this.createEmptyMetrics();
    }

    return new Map(this.metrics);
  }

  async getQualityTrends(
    pipelineId: string,
    timeRange: { start: Date; end: Date },
  ): Promise<Array<{ timestamp: Date; score: number; issues: number }>> {
    // This would typically query a time-series database
    // For now, return empty trends
    return [];
  }

  async getRecentAlerts(limit: number = 10): Promise<QualityAlert[]> {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private async fetchRecentRecords(pipelineId: string): Promise<DataRecord[]> {
    // This would typically query the data pipeline or storage system
    // For now, return empty array
    return [];
  }

  private shouldGenerateAlert(
    check: QualityCheck,
    result: QualityCheckResult,
  ): boolean {
    if (result.passed) return false;

    // Generate alert based on severity and threshold
    switch (check.severity) {
      case "critical":
        return true;
      case "high":
        return result.successRate < 0.9;
      case "medium":
        return result.successRate < 0.8;
      case "low":
        return result.successRate < 0.7;
      default:
        return false;
    }
  }

  private createAlert(
    check: QualityCheck,
    result: QualityCheckResult,
    context?: { pipelineId?: string; batchId?: string },
  ): QualityAlert {
    return {
      id: this.generateAlertId(),
      checkId: check.id,
      pipelineId: context?.pipelineId,
      batchId: context?.batchId,
      severity: check.severity || "medium",
      message: `Quality check '${check.id}' failed with success rate ${(result.successRate * 100).toFixed(1)}%`,
      details: {
        checkType: check.type,
        field: check.field,
        successRate: result.successRate,
        failedRecords: result.failedRecords,
        totalRecords: result.totalRecords,
        failureReasons: result.failureReasons,
      },
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  private updateMetrics(report: QualityReport): void {
    const pipelineId = report.pipelineId || "default";
    const existingMetrics =
      this.metrics.get(pipelineId) || this.createEmptyMetrics();

    const updatedMetrics: QualityMetrics = {
      totalRecordsProcessed:
        existingMetrics.totalRecordsProcessed + report.recordCount,
      averageQualityScore:
        (existingMetrics.averageQualityScore + report.overallScore) / 2,
      checksExecuted: existingMetrics.checksExecuted + report.checkCount,
      checksPassed:
        existingMetrics.checksPassed +
        report.checkResults.filter((r) => r.passed).length,
      checksFailed:
        existingMetrics.checksFailed +
        report.checkResults.filter((r) => !r.passed).length,
      criticalFailures:
        existingMetrics.criticalFailures + report.criticalFailures,
      averageExecutionTime:
        (existingMetrics.averageExecutionTime + report.executionTime) / 2,
      lastUpdated: new Date(),
    };

    this.metrics.set(pipelineId, updatedMetrics);
  }

  private createEmptyMetrics(): QualityMetrics {
    return {
      totalRecordsProcessed: 0,
      averageQualityScore: 0,
      checksExecuted: 0,
      checksPassed: 0,
      checksFailed: 0,
      criticalFailures: 0,
      averageExecutionTime: 0,
      lastUpdated: new Date(),
    };
  }

  private generateSummary(results: QualityCheckResult[]): string {
    const totalChecks = results.length;
    const passedChecks = results.filter((r) => r.passed).length;
    const failedChecks = totalChecks - passedChecks;

    return `${passedChecks}/${totalChecks} quality checks passed. ${failedChecks} checks failed.`;
  }

  private generateRecommendations(results: QualityCheckResult[]): string[] {
    const recommendations: string[] = [];

    const failedResults = results.filter((r) => !r.passed);

    if (failedResults.length > 0) {
      recommendations.push(
        "Review and fix data quality issues in failed checks",
      );

      const completenessFailures = failedResults.filter(
        (r) => r.checkType === "completeness",
      );
      if (completenessFailures.length > 0) {
        recommendations.push(
          "Implement data completeness validation at source",
        );
      }

      const validityFailures = failedResults.filter(
        (r) => r.checkType === "validity",
      );
      if (validityFailures.length > 0) {
        recommendations.push("Add input validation and data cleansing steps");
      }

      const formatFailures = failedResults.filter(
        (r) => r.checkType === "format",
      );
      if (formatFailures.length > 0) {
        recommendations.push("Standardize data formats across all sources");
      }
    }

    return recommendations;
  }

  private generateReportId(): string {
    return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async shutdown(): Promise<void> {
    await this.stopContinuousMonitoring();
    this.removeAllListeners();
    this.logger.info("Quality monitor shut down");
  }
}
