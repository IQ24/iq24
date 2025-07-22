import {
  DataTransformation,
  TransformationContext,
  TransformationConfig,
  TransformationResult,
  TransformationMetrics,
  DataRecord,
  DataSchema,
  ValidationRule,
  QualityCheck,
  EnrichmentSource,
  EnrichmentConfig
} from '../types';
import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';

/**
 * Individual Transformation Processor
 * Handles specific data transformation operations
 */
export class TransformationProcessor {
  private config: TransformationConfig;
  private logger: Logger;
  private metrics: TransformationMetrics;

  constructor(config: TransformationConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.metrics = {
      recordsProcessed: 0,
      recordsSucceeded: 0,
      recordsFailed: 0,
      avgProcessingTime: 0,
      errorRate: 0,
      qualityScore: 1.0,
      lastExecuted: new Date()
    };
  }

  async process(records: DataRecord[], context: TransformationContext): Promise<TransformationResult> {
    const startTime = Date.now();
    const processedRecords: DataRecord[] = [];
    const errors: Array<{ record: DataRecord; error: string }> = [];

    try {
      this.logger.info('Starting transformation processing', {
        transformationType: this.config.type,
        recordCount: records.length,
        batchId: context.batchId
      });

      // Apply transformation based on type
      for (const record of records) {
        try {
          const transformedRecord = await this.applyTransformation(record, context);
          
          // Validate transformed record
          if (await this.validateRecord(transformedRecord, context)) {
            processedRecords.push(transformedRecord);
            this.metrics.recordsSucceeded++;
          } else {
            errors.push({ record, error: 'Validation failed' });
            this.metrics.recordsFailed++;
          }
        } catch (error) {
          this.logger.warn('Record transformation failed', {
            recordId: record.id,
            error: error.message
          });
          errors.push({ record, error: error.message });
          this.metrics.recordsFailed++;
        }
        
        this.metrics.recordsProcessed++;
      }

      const processingTime = Date.now() - startTime;
      this.updateMetrics(processingTime);

      const result: TransformationResult = {
        transformationId: this.config.id,
        batchId: context.batchId,
        inputRecords: records.length,
        outputRecords: processedRecords.length,
        errorCount: errors.length,
        processingTime,
        records: processedRecords,
        errors,
        metrics: { ...this.metrics },
        timestamp: new Date()
      };

      this.logger.info('Transformation processing completed', {
        transformationId: this.config.id,
        inputRecords: records.length,
        outputRecords: processedRecords.length,
        errorCount: errors.length,
        processingTime
      });

      return result;
    } catch (error) {
      this.logger.error('Transformation processing failed', {
        transformationId: this.config.id,
        error: error.message
      });
      throw error;
    }
  }

  private async applyTransformation(record: DataRecord, context: TransformationContext): Promise<DataRecord> {
    const transformedRecord = { ...record };

    switch (this.config.type) {
      case 'field_mapping':
        return this.applyFieldMapping(transformedRecord);
      
      case 'aggregation':
        return this.applyAggregation(transformedRecord, context);
      
      case 'enrichment':
        return await this.applyEnrichment(transformedRecord, context);
      
      case 'validation':
        return await this.applyValidation(transformedRecord);
      
      case 'normalization':
        return this.applyNormalization(transformedRecord);
      
      case 'feature_engineering':
        return await this.applyFeatureEngineering(transformedRecord, context);
      
      case 'custom':
        return await this.applyCustomTransformation(transformedRecord, context);
      
      default:
        throw new Error(`Unsupported transformation type: ${this.config.type}`);
    }
  }

  private applyFieldMapping(record: DataRecord): DataRecord {
    const mappingRules = this.config.parameters?.fieldMappings || {};
    const mappedRecord = { ...record };

    for (const [sourceField, targetField] of Object.entries(mappingRules)) {
      if (record.data[sourceField] !== undefined) {
        mappedRecord.data[targetField as string] = record.data[sourceField];
        
        // Remove source field if it's a rename operation
        if (sourceField !== targetField && this.config.parameters?.removeSourceFields) {
          delete mappedRecord.data[sourceField];
        }
      }
    }

    return mappedRecord;
  }

  private applyAggregation(record: DataRecord, context: TransformationContext): DataRecord {
    const aggregationConfig = this.config.parameters?.aggregation;
    if (!aggregationConfig) {
      throw new Error('Aggregation configuration missing');
    }

    const aggregatedRecord = { ...record };
    const groupKey = aggregationConfig.groupBy;
    const aggregateFields = aggregationConfig.fields || [];

    // Apply aggregation functions
    for (const field of aggregateFields) {
      const value = record.data[field.name];
      if (value !== undefined) {
        switch (field.function) {
          case 'sum':
            aggregatedRecord.data[`${field.name}_sum`] = this.calculateSum(value, context);
            break;
          case 'avg':
            aggregatedRecord.data[`${field.name}_avg`] = this.calculateAverage(value, context);
            break;
          case 'count':
            aggregatedRecord.data[`${field.name}_count`] = this.calculateCount(value, context);
            break;
          case 'min':
            aggregatedRecord.data[`${field.name}_min`] = this.calculateMin(value, context);
            break;
          case 'max':
            aggregatedRecord.data[`${field.name}_max`] = this.calculateMax(value, context);
            break;
        }
      }
    }

    return aggregatedRecord;
  }

  private async applyEnrichment(record: DataRecord, context: TransformationContext): Promise<DataRecord> {
    const enrichmentConfig = this.config.parameters?.enrichment;
    if (!enrichmentConfig) {
      throw new Error('Enrichment configuration missing');
    }

    const enrichedRecord = { ...record };

    for (const enrichment of enrichmentConfig.sources || []) {
      try {
        const enrichmentData = await this.fetchEnrichmentData(record, enrichment, context);
        
        // Merge enrichment data
        if (enrichmentData) {
          for (const [key, value] of Object.entries(enrichmentData)) {
            enrichedRecord.data[key] = value;
          }
        }
      } catch (error) {
        this.logger.warn('Enrichment failed', {
          source: enrichment.source,
          recordId: record.id,
          error: error.message
        });
        
        // Continue with other enrichments
        continue;
      }
    }

    return enrichedRecord;
  }

  private async applyValidation(record: DataRecord): Promise<DataRecord> {
    const validationRules = this.config.parameters?.validationRules || [];
    const validatedRecord = { ...record, validationResults: [] };

    for (const rule of validationRules) {
      const isValid = await this.validateField(record.data[rule.field], rule);
      
      validatedRecord.validationResults!.push({
        field: rule.field,
        rule: rule.type,
        valid: isValid,
        message: isValid ? 'Valid' : rule.errorMessage || `Validation failed for ${rule.field}`
      });

      if (!isValid && rule.required) {
        throw new Error(`Required field validation failed: ${rule.field}`);
      }
    }

    return validatedRecord;
  }

  private applyNormalization(record: DataRecord): DataRecord {
    const normalizationConfig = this.config.parameters?.normalization;
    if (!normalizationConfig) {
      throw new Error('Normalization configuration missing');
    }

    const normalizedRecord = { ...record };

    for (const [field, config] of Object.entries(normalizationConfig.fields || {})) {
      const value = record.data[field];
      
      if (value !== undefined) {
        switch (config.type) {
          case 'lowercase':
            normalizedRecord.data[field] = String(value).toLowerCase();
            break;
          case 'uppercase':
            normalizedRecord.data[field] = String(value).toUpperCase();
            break;
          case 'trim':
            normalizedRecord.data[field] = String(value).trim();
            break;
          case 'phone':
            normalizedRecord.data[field] = this.normalizePhoneNumber(String(value));
            break;
          case 'email':
            normalizedRecord.data[field] = this.normalizeEmail(String(value));
            break;
          case 'url':
            normalizedRecord.data[field] = this.normalizeUrl(String(value));
            break;
        }
      }
    }

    return normalizedRecord;
  }

  private async applyFeatureEngineering(record: DataRecord, context: TransformationContext): Promise<DataRecord> {
    const featureConfig = this.config.parameters?.featureEngineering;
    if (!featureConfig) {
      throw new Error('Feature engineering configuration missing');
    }

    const engineeredRecord = { ...record };

    // Apply feature engineering transformations
    for (const feature of featureConfig.features || []) {
      try {
        const featureValue = await this.calculateFeature(record, feature, context);
        engineeredRecord.data[feature.name] = featureValue;
      } catch (error) {
        this.logger.warn('Feature engineering failed', {
          feature: feature.name,
          recordId: record.id,
          error: error.message
        });
      }
    }

    return engineeredRecord;
  }

  private async applyCustomTransformation(record: DataRecord, context: TransformationContext): Promise<DataRecord> {
    const customConfig = this.config.parameters?.custom;
    if (!customConfig?.function) {
      throw new Error('Custom transformation function missing');
    }

    // Execute custom transformation function
    // This would typically be a sandboxed execution environment
    try {
      const transformationFunction = eval(customConfig.function);
      return await transformationFunction(record, context, this.logger);
    } catch (error) {
      throw new Error(`Custom transformation failed: ${error.message}`);
    }
  }

  private async validateRecord(record: DataRecord, context: TransformationContext): Promise<boolean> {
    if (!this.config.outputSchema) {
      return true; // No schema validation required
    }

    try {
      // Validate against output schema
      return this.validateAgainstSchema(record, this.config.outputSchema);
    } catch (error) {
      this.logger.warn('Record validation failed', {
        recordId: record.id,
        error: error.message
      });
      return false;
    }
  }

  private validateAgainstSchema(record: DataRecord, schema: DataSchema): boolean {
    // Simplified schema validation
    for (const field of schema.fields) {
      const value = record.data[field.name];
      
      if (field.required && (value === undefined || value === null)) {
        return false;
      }
      
      if (value !== undefined && !this.isValidType(value, field.type)) {
        return false;
      }
    }
    
    return true;
  }

  private isValidType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  private async validateField(value: any, rule: ValidationRule): Promise<boolean> {
    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== '';
      
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      
      case 'phone':
        return typeof value === 'string' && /^\+?[\d\s\-\(\)]{10,}$/.test(value);
      
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      
      case 'range':
        const numValue = Number(value);
        return !isNaN(numValue) && 
               numValue >= (rule.min || -Infinity) && 
               numValue <= (rule.max || Infinity);
      
      case 'length':
        const strValue = String(value);
        return strValue.length >= (rule.minLength || 0) && 
               strValue.length <= (rule.maxLength || Infinity);
      
      case 'pattern':
        return typeof value === 'string' && new RegExp(rule.pattern || '').test(value);
      
      default:
        return true;
    }
  }

  private async fetchEnrichmentData(
    record: DataRecord,
    enrichment: EnrichmentSource,
    context: TransformationContext
  ): Promise<Record<string, any> | null> {
    // Implementation would depend on the enrichment source
    // This could be API calls, database lookups, or other external services
    
    switch (enrichment.source) {
      case 'apollo':
        return this.enrichFromApollo(record, enrichment);
      
      case 'hunter':
        return this.enrichFromHunter(record, enrichment);
      
      case 'clearbit':
        return this.enrichFromClearbit(record, enrichment);
      
      case 'database':
        return this.enrichFromDatabase(record, enrichment);
      
      default:
        this.logger.warn('Unknown enrichment source', { source: enrichment.source });
        return null;
    }
  }

  private async enrichFromApollo(record: DataRecord, enrichment: EnrichmentSource): Promise<Record<string, any> | null> {
    // Implementation would make Apollo API calls
    return null; // Placeholder
  }

  private async enrichFromHunter(record: DataRecord, enrichment: EnrichmentSource): Promise<Record<string, any> | null> {
    // Implementation would make Hunter API calls
    return null; // Placeholder
  }

  private async enrichFromClearbit(record: DataRecord, enrichment: EnrichmentSource): Promise<Record<string, any> | null> {
    // Implementation would make Clearbit API calls
    return null; // Placeholder
  }

  private async enrichFromDatabase(record: DataRecord, enrichment: EnrichmentSource): Promise<Record<string, any> | null> {
    // Implementation would query database
    return null; // Placeholder
  }

  private async calculateFeature(record: DataRecord, feature: any, context: TransformationContext): Promise<any> {
    // Feature engineering calculations
    switch (feature.type) {
      case 'derived':
        return this.calculateDerivedFeature(record, feature);
      
      case 'aggregated':
        return this.calculateAggregatedFeature(record, feature, context);
      
      case 'temporal':
        return this.calculateTemporalFeature(record, feature, context);
      
      default:
        throw new Error(`Unknown feature type: ${feature.type}`);
    }
  }

  private calculateDerivedFeature(record: DataRecord, feature: any): any {
    // Simple derived feature calculation
    const expression = feature.expression;
    // This would need a safe expression evaluator
    return null; // Placeholder
  }

  private calculateAggregatedFeature(record: DataRecord, feature: any, context: TransformationContext): any {
    // Aggregated feature calculation
    return null; // Placeholder
  }

  private calculateTemporalFeature(record: DataRecord, feature: any, context: TransformationContext): any {
    // Temporal feature calculation
    return null; // Placeholder
  }

  // Utility functions for aggregations
  private calculateSum(value: any, context: TransformationContext): number {
    return typeof value === 'number' ? value : 0;
  }

  private calculateAverage(value: any, context: TransformationContext): number {
    return typeof value === 'number' ? value : 0;
  }

  private calculateCount(value: any, context: TransformationContext): number {
    return value !== undefined && value !== null ? 1 : 0;
  }

  private calculateMin(value: any, context: TransformationContext): number {
    return typeof value === 'number' ? value : 0;
  }

  private calculateMax(value: any, context: TransformationContext): number {
    return typeof value === 'number' ? value : 0;
  }

  // Normalization utility functions
  private normalizePhoneNumber(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private normalizeUrl(url: string): string {
    try {
      const normalized = new URL(url);
      return normalized.toString();
    } catch {
      return url;
    }
  }

  private updateMetrics(processingTime: number): void {
    this.metrics.avgProcessingTime = 
      (this.metrics.avgProcessingTime + processingTime) / 2;
    this.metrics.errorRate = 
      this.metrics.recordsFailed / Math.max(this.metrics.recordsProcessed, 1);
    this.metrics.qualityScore = Math.max(0, 1 - this.metrics.errorRate);
    this.metrics.lastExecuted = new Date();
  }

  getMetrics(): TransformationMetrics {
    return { ...this.metrics };
  }
}

/**
 * Transformation Engine
 * Orchestrates multiple transformation processors in complex data processing workflows
 */
export class TransformationEngine extends EventEmitter {
  private processors: Map<string, TransformationProcessor> = new Map();
  private logger: Logger;
  private isRunning: boolean = false;

  constructor(logger: Logger) {
    super();
    this.logger = logger;
  }

  async registerTransformation(config: TransformationConfig): Promise<void> {
    try {
      const processor = new TransformationProcessor(config, this.logger);
      this.processors.set(config.id, processor);
      
      this.logger.info('Transformation registered', {
        transformationId: config.id,
        type: config.type
      });
      
      this.emit('transformationRegistered', { config });
    } catch (error) {
      this.logger.error('Failed to register transformation', { config, error });
      throw error;
    }
  }

  async executeTransformationChain(
    transformationIds: string[],
    records: DataRecord[],
    context: TransformationContext
  ): Promise<TransformationResult[]> {
    try {
      this.isRunning = true;
      const results: TransformationResult[] = [];
      let currentRecords = records;

      this.logger.info('Starting transformation chain execution', {
        transformationIds,
        recordCount: records.length,
        batchId: context.batchId
      });

      // Execute transformations in sequence
      for (const transformationId of transformationIds) {
        const processor = this.processors.get(transformationId);
        if (!processor) {
          throw new Error(`Transformation not found: ${transformationId}`);
        }

        const result = await processor.process(currentRecords, {
          ...context,
          stage: `transformation_${transformationId}`
        });

        results.push(result);
        currentRecords = result.records;

        // Emit progress event
        this.emit('transformationCompleted', {
          transformationId,
          result,
          progress: results.length / transformationIds.length
        });

        this.logger.info('Transformation completed', {
          transformationId,
          inputRecords: result.inputRecords,
          outputRecords: result.outputRecords,
          errorCount: result.errorCount
        });
      }

      this.logger.info('Transformation chain execution completed', {
        transformationIds,
        totalResults: results.length,
        finalRecordCount: currentRecords.length
      });

      this.emit('chainCompleted', { transformationIds, results });
      return results;
    } catch (error) {
      this.logger.error('Transformation chain execution failed', {
        transformationIds,
        error: error.message
      });
      this.emit('chainFailed', { transformationIds, error });
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async executeParallelTransformations(
    transformationConfigs: TransformationConfig[],
    records: DataRecord[],
    context: TransformationContext
  ): Promise<Map<string, TransformationResult>> {
    try {
      this.isRunning = true;
      const results = new Map<string, TransformationResult>();

      this.logger.info('Starting parallel transformation execution', {
        transformationCount: transformationConfigs.length,
        recordCount: records.length,
        batchId: context.batchId
      });

      // Execute all transformations in parallel
      const promises = transformationConfigs.map(async (config) => {
        let processor = this.processors.get(config.id);
        if (!processor) {
          processor = new TransformationProcessor(config, this.logger);
          this.processors.set(config.id, processor);
        }

        const result = await processor.process(records, {
          ...context,
          stage: `transformation_${config.id}`
        });

        results.set(config.id, result);
        
        this.emit('transformationCompleted', {
          transformationId: config.id,
          result
        });

        return result;
      });

      await Promise.all(promises);

      this.logger.info('Parallel transformation execution completed', {
        transformationCount: transformationConfigs.length,
        resultsCount: results.size
      });

      this.emit('parallelExecutionCompleted', { results });
      return results;
    } catch (error) {
      this.logger.error('Parallel transformation execution failed', {
        transformationConfigs: transformationConfigs.map(c => c.id),
        error: error.message
      });
      this.emit('parallelExecutionFailed', { error });
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async getTransformationMetrics(transformationId: string): Promise<TransformationMetrics | null> {
    const processor = this.processors.get(transformationId);
    return processor ? processor.getMetrics() : null;
  }

  async getAllMetrics(): Promise<Map<string, TransformationMetrics>> {
    const metrics = new Map<string, TransformationMetrics>();
    
    for (const [id, processor] of this.processors) {
      metrics.set(id, processor.getMetrics());
    }
    
    return metrics;
  }

  getRegisteredTransformations(): string[] {
    return Array.from(this.processors.keys());
  }

  isProcessing(): boolean {
    return this.isRunning;
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down transformation engine');
    this.processors.clear();
    this.removeAllListeners();
  }
}