/**
 * Data Lineage Tracking System
 * 
 * Provides comprehensive data lineage and provenance tracking:
 * - End-to-end data flow visualization
 * - Impact analysis and dependency mapping
 * - Audit trail for compliance
 * - Schema evolution tracking
 * - Performance impact analysis
 */

import {
  LineageNode,
  LineageEdge,
  LineageGraph,
  DataAsset,
  Transformation,
  LineageMetadata,
  ImpactAnalysis,
  LineageQuery,
  HealthStatus,
  LineageEvent
} from '../types';
import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { Neo4j } from 'neo4j-driver';

export interface ILineageTracker {
  // Asset Management
  registerAsset(asset: DataAsset): Promise<string>;
  updateAsset(assetId: string, updates: Partial<DataAsset>): Promise<void>;
  getAsset(assetId: string): Promise<DataAsset | null>;
  listAssets(filter?: Partial<DataAsset>): Promise<DataAsset[]>;
  deleteAsset(assetId: string): Promise<void>;
  
  // Lineage Tracking
  trackTransformation(transformation: Transformation): Promise<void>;
  createLineageEdge(source: string, target: string, metadata: LineageMetadata): Promise<void>;
  
  // Querying
  getUpstreamLineage(assetId: string, depth?: number): Promise<LineageGraph>;
  getDownstreamLineage(assetId: string, depth?: number): Promise<LineageGraph>;
  getFullLineage(assetId: string): Promise<LineageGraph>;
  queryLineage(query: LineageQuery): Promise<LineageGraph>;
  
  // Impact Analysis
  analyzeImpact(assetId: string, changeType: string): Promise<ImpactAnalysis>;
  getDataDependencies(assetId: string): Promise<string[]>;
  findCriticalPath(sourceId: string, targetId: string): Promise<string[]>;
  
  // Schema Evolution
  trackSchemaChange(assetId: string, oldSchema: any, newSchema: any): Promise<void>;
  getSchemaHistory(assetId: string): Promise<SchemaVersion[]>;
  validateSchemaCompatibility(assetId: string, newSchema: any): Promise<CompatibilityResult>;
  
  // Audit & Compliance
  getAuditTrail(assetId: string, timeRange?: TimeRange): Promise<AuditEntry[]>;
  generateComplianceReport(scope: string[]): Promise<ComplianceReport>;
  
  // Health & Monitoring
  getHealth(): Promise<HealthStatus>;
  getLineageHealth(assetId: string): Promise<HealthStatus>;
}

interface SchemaVersion {
  version: string;
  schema: any;
  timestamp: Date;
  changes: SchemaChange[];
}

interface SchemaChange {
  type: 'added' | 'removed' | 'modified';
  field: string;
  old_value?: any;
  new_value?: any;
}

interface CompatibilityResult {
  compatible: boolean;
  breaking_changes: SchemaChange[];
  warnings: string[];
  recommendations: string[];
}

interface AuditEntry {
  id: string;
  asset_id: string;
  action: string;
  user: string;
  timestamp: Date;
  details: any;
  impact_score: number;
}

interface ComplianceReport {
  scope: string[];
  assets_covered: number;
  compliance_score: number;
  violations: ComplianceViolation[];
  recommendations: string[];
  generated_at: Date;
}

interface ComplianceViolation {
  asset_id: string;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
}

interface TimeRange {
  start: Date;
  end: Date;
}

export class LineageTrackerImpl implements ILineageTracker {
  private driver: Neo4j.Driver;
  private assets: Map<string, DataAsset> = new Map();
  private lineageGraph: Map<string, LineageNode> = new Map();
  private eventEmitter: EventEmitter;

  constructor(
    private config: {
      neo4j: {
        uri: string;
        username: string;
        password: string;
      };
      retention: {
        audit_days: number;
        lineage_days: number;
      };
      analysis: {
        max_depth: number;
        impact_threshold: number;
      };
    },
    private logger: Logger
  ) {
    this.eventEmitter = new EventEmitter();
    this.initializeDatabase();
    this.setupEventHandlers();
  }

  private initializeDatabase(): void {
    // Initialize Neo4j driver
    this.driver = Neo4j.driver(
      this.config.neo4j.uri,
      Neo4j.auth.basic(this.config.neo4j.username, this.config.neo4j.password)
    );
    
    // Create indexes and constraints
    this.createDatabaseSchema();
  }

  private async createDatabaseSchema(): Promise<void> {
    const session = this.driver.session();
    
    try {
      // Create constraints
      await session.run(`
        CREATE CONSTRAINT asset_id_unique IF NOT EXISTS
        FOR (a:Asset) REQUIRE a.id IS UNIQUE
      `);
      
      await session.run(`
        CREATE CONSTRAINT transformation_id_unique IF NOT EXISTS
        FOR (t:Transformation) REQUIRE t.id IS UNIQUE
      `);
      
      // Create indexes
      await session.run(`
        CREATE INDEX asset_type_index IF NOT EXISTS
        FOR (a:Asset) ON (a.type)
      `);
      
      await session.run(`
        CREATE INDEX asset_owner_index IF NOT EXISTS
        FOR (a:Asset) ON (a.owner)
      `);
      
      await session.run(`
        CREATE INDEX transformation_timestamp_index IF NOT EXISTS
        FOR (t:Transformation) ON (t.timestamp)
      `);
      
      this.logger.info('Database schema initialized');
    } catch (error) {
      this.logger.error('Failed to initialize database schema', { error });
      throw error;
    } finally {
      await session.close();
    }
  }

  private setupEventHandlers(): void {
    this.eventEmitter.on('asset:registered', this.handleAssetRegistered.bind(this));
    this.eventEmitter.on('transformation:tracked', this.handleTransformationTracked.bind(this));
    this.eventEmitter.on('schema:changed', this.handleSchemaChanged.bind(this));
  }

  async registerAsset(asset: DataAsset): Promise<string> {
    const session = this.driver.session();
    
    try {
      const assetId = asset.id || `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const enrichedAsset: DataAsset = {
        ...asset,
        id: assetId,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Store in Neo4j
      await session.run(`
        CREATE (a:Asset {
          id: $id,
          name: $name,
          type: $type,
          owner: $owner,
          description: $description,
          schema: $schema,
          location: $location,
          tags: $tags,
          created_at: datetime($created_at),
          updated_at: datetime($updated_at)
        })
      `, {
        id: assetId,
        name: enrichedAsset.name,
        type: enrichedAsset.type,
        owner: enrichedAsset.owner,
        description: enrichedAsset.description || '',
        schema: JSON.stringify(enrichedAsset.schema || {}),
        location: enrichedAsset.location || '',
        tags: enrichedAsset.tags || [],
        created_at: enrichedAsset.created_at.toISOString(),
        updated_at: enrichedAsset.updated_at.toISOString()
      });
      
      // Store in memory cache
      this.assets.set(assetId, enrichedAsset);
      
      // Create lineage node
      const lineageNode: LineageNode = {
        id: assetId,
        type: 'asset',
        name: enrichedAsset.name,
        metadata: {
          asset_type: enrichedAsset.type,
          owner: enrichedAsset.owner,
          created_at: enrichedAsset.created_at
        }
      };
      
      this.lineageGraph.set(assetId, lineageNode);
      
      this.logger.info('Asset registered', {
        assetId,
        name: enrichedAsset.name,
        type: enrichedAsset.type
      });
      
      this.eventEmitter.emit('asset:registered', { asset: enrichedAsset });
      
      return assetId;
    } catch (error) {
      this.logger.error('Failed to register asset', { error, asset: asset.name });
      throw error;
    } finally {
      await session.close();
    }
  }

  async trackTransformation(transformation: Transformation): Promise<void> {
    const session = this.driver.session();
    
    try {
      const transformationId = `transform_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create transformation node
      await session.run(`
        CREATE (t:Transformation {
          id: $id,
          name: $name,
          type: $type,
          code: $code,
          config: $config,
          timestamp: datetime($timestamp)
        })
      `, {
        id: transformationId,
        name: transformation.name,
        type: transformation.type,
        code: transformation.code || '',
        config: JSON.stringify(transformation.config || {}),
        timestamp: new Date().toISOString()
      });
      
      // Create lineage edges for inputs and outputs
      for (const inputId of transformation.inputs) {
        await session.run(`
          MATCH (input:Asset {id: $inputId})
          MATCH (t:Transformation {id: $transformationId})
          CREATE (input)-[:FEEDS]->(t)
        `, { inputId, transformationId });
      }
      
      for (const outputId of transformation.outputs) {
        await session.run(`
          MATCH (t:Transformation {id: $transformationId})
          MATCH (output:Asset {id: $outputId})
          CREATE (t)-[:PRODUCES]->(output)
        `, { transformationId, outputId });
      }
      
      // Create direct asset-to-asset lineage
      for (const inputId of transformation.inputs) {
        for (const outputId of transformation.outputs) {
          await this.createLineageEdge(inputId, outputId, {
            transformation_id: transformationId,
            transformation_type: transformation.type,
            timestamp: new Date()
          });
        }
      }
      
      this.logger.info('Transformation tracked', {
        transformationId,
        name: transformation.name,
        inputs: transformation.inputs.length,
        outputs: transformation.outputs.length
      });
      
      this.eventEmitter.emit('transformation:tracked', { transformation, transformationId });
      
    } catch (error) {
      this.logger.error('Failed to track transformation', { error, transformation: transformation.name });
      throw error;
    } finally {
      await session.close();
    }
  }

  async createLineageEdge(source: string, target: string, metadata: LineageMetadata): Promise<void> {
    const session = this.driver.session();
    
    try {
      await session.run(`
        MATCH (source:Asset {id: $sourceId})
        MATCH (target:Asset {id: $targetId})
        CREATE (source)-[:LINEAGE {
          transformation_id: $transformationId,
          transformation_type: $transformationType,
          timestamp: datetime($timestamp),
          metadata: $metadata
        }]->(target)
      `, {
        sourceId: source,
        targetId: target,
        transformationId: metadata.transformation_id,
        transformationType: metadata.transformation_type,
        timestamp: metadata.timestamp.toISOString(),
        metadata: JSON.stringify(metadata)
      });
      
      this.logger.debug('Lineage edge created', { source, target, metadata });
      
    } catch (error) {
      this.logger.error('Failed to create lineage edge', { error, source, target });
      throw error;
    } finally {
      await session.close();
    }
  }

  async getUpstreamLineage(assetId: string, depth: number = 5): Promise<LineageGraph> {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH path = (target:Asset {id: $assetId})<-[:LINEAGE*1..${depth}]-(source:Asset)
        RETURN path
      `, { assetId });
      
      const graph = this.buildLineageGraphFromPaths(result.records);
      
      this.logger.debug('Upstream lineage retrieved', {
        assetId,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length
      });
      
      return graph;
    } catch (error) {
      this.logger.error('Failed to get upstream lineage', { error, assetId });
      throw error;
    } finally {
      await session.close();
    }
  }

  async getDownstreamLineage(assetId: string, depth: number = 5): Promise<LineageGraph> {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH path = (source:Asset {id: $assetId})-[:LINEAGE*1..${depth}]->(target:Asset)
        RETURN path
      `, { assetId });
      
      const graph = this.buildLineageGraphFromPaths(result.records);
      
      this.logger.debug('Downstream lineage retrieved', {
        assetId,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length
      });
      
      return graph;
    } catch (error) {
      this.logger.error('Failed to get downstream lineage', { error, assetId });
      throw error;
    } finally {
      await session.close();
    }
  }

  async analyzeImpact(assetId: string, changeType: string): Promise<ImpactAnalysis> {
    try {
      // Get downstream lineage to understand impact
      const downstreamGraph = await this.getDownstreamLineage(assetId);
      
      // Calculate impact scores based on asset types and relationships
      const impactedAssets = downstreamGraph.nodes.map(node => ({
        asset_id: node.id,
        impact_score: this.calculateImpactScore(node, changeType),
        risk_level: this.assessRiskLevel(node, changeType)
      }));
      
      // Find critical path dependencies
      const criticalAssets = impactedAssets
        .filter(asset => asset.impact_score > this.config.analysis.impact_threshold)
        .map(asset => asset.asset_id);
      
      const analysis: ImpactAnalysis = {
        source_asset: assetId,
        change_type: changeType,
        impacted_assets: impactedAssets,
        critical_assets: criticalAssets,
        estimated_impact_score: impactedAssets.reduce((sum, asset) => sum + asset.impact_score, 0),
        recommendations: this.generateImpactRecommendations(impactedAssets, changeType),
        analysis_timestamp: new Date()
      };
      
      this.logger.info('Impact analysis completed', {
        assetId,
        changeType,
        impactedCount: impactedAssets.length,
        criticalCount: criticalAssets.length
      });
      
      return analysis;
    } catch (error) {
      this.logger.error('Failed to analyze impact', { error, assetId, changeType });
      throw error;
    }
  }

  async trackSchemaChange(assetId: string, oldSchema: any, newSchema: any): Promise<void> {
    const session = this.driver.session();
    
    try {
      const changes = this.compareSchemas(oldSchema, newSchema);
      const version = `v${Date.now()}`;
      
      // Store schema version
      await session.run(`
        MATCH (a:Asset {id: $assetId})
        CREATE (a)-[:HAS_SCHEMA]->(s:Schema {
          version: $version,
          schema: $schema,
          timestamp: datetime($timestamp),
          changes: $changes
        })
      `, {
        assetId,
        version,
        schema: JSON.stringify(newSchema),
        timestamp: new Date().toISOString(),
        changes: JSON.stringify(changes)
      });
      
      // Update asset schema
      await session.run(`
        MATCH (a:Asset {id: $assetId})
        SET a.schema = $schema, a.updated_at = datetime($timestamp)
      `, {
        assetId,
        schema: JSON.stringify(newSchema),
        timestamp: new Date().toISOString()
      });
      
      this.logger.info('Schema change tracked', {
        assetId,
        version,
        changesCount: changes.length
      });
      
      this.eventEmitter.emit('schema:changed', { assetId, oldSchema, newSchema, changes });
      
    } catch (error) {
      this.logger.error('Failed to track schema change', { error, assetId });
      throw error;
    } finally {
      await session.close();
    }
  }

  async getAuditTrail(assetId: string, timeRange?: TimeRange): Promise<AuditEntry[]> {
    const session = this.driver.session();
    
    try {
      let query = `
        MATCH (a:Asset {id: $assetId})-[:HAS_AUDIT]->(audit:AuditEntry)
      `;
      
      const params: any = { assetId };
      
      if (timeRange) {
        query += ` WHERE audit.timestamp >= datetime($startTime) AND audit.timestamp <= datetime($endTime)`;
        params.startTime = timeRange.start.toISOString();
        params.endTime = timeRange.end.toISOString();
      }
      
      query += ` RETURN audit ORDER BY audit.timestamp DESC`;
      
      const result = await session.run(query, params);
      
      const auditTrail = result.records.map(record => {
        const audit = record.get('audit').properties;
        return {
          id: audit.id,
          asset_id: assetId,
          action: audit.action,
          user: audit.user,
          timestamp: new Date(audit.timestamp),
          details: JSON.parse(audit.details || '{}'),
          impact_score: audit.impact_score || 0
        };
      });
      
      this.logger.debug('Audit trail retrieved', {
        assetId,
        entryCount: auditTrail.length
      });
      
      return auditTrail;
    } catch (error) {
      this.logger.error('Failed to get audit trail', { error, assetId });
      throw error;
    } finally {
      await session.close();
    }
  }

  // Private helper methods
  private buildLineageGraphFromPaths(records: any[]): LineageGraph {
    const nodes: LineageNode[] = [];
    const edges: LineageEdge[] = [];
    const nodeIds = new Set<string>();
    
    for (const record of records) {
      const path = record.get('path');
      
      // Extract nodes
      for (const node of path.segments) {
        const startNode = node.start.properties;
        const endNode = node.end.properties;
        
        if (!nodeIds.has(startNode.id)) {
          nodes.push({
            id: startNode.id,
            type: 'asset',
            name: startNode.name,
            metadata: {
              asset_type: startNode.type,
              owner: startNode.owner
            }
          });
          nodeIds.add(startNode.id);
        }
        
        if (!nodeIds.has(endNode.id)) {
          nodes.push({
            id: endNode.id,
            type: 'asset',
            name: endNode.name,
            metadata: {
              asset_type: endNode.type,
              owner: endNode.owner
            }
          });
          nodeIds.add(endNode.id);
        }
        
        // Extract edges
        const relationship = node.relationship.properties;
        edges.push({
          source: startNode.id,
          target: endNode.id,
          type: 'lineage',
          metadata: JSON.parse(relationship.metadata || '{}')
        });
      }
    }
    
    return { nodes, edges };
  }

  private calculateImpactScore(node: LineageNode, changeType: string): number {
    // Simplified impact scoring - in reality would be much more sophisticated
    let score = 1;
    
    if (node.metadata.asset_type === 'table') score *= 2;
    if (node.metadata.asset_type === 'api') score *= 3;
    if (changeType === 'schema_breaking') score *= 5;
    if (changeType === 'data_quality') score *= 2;
    
    return Math.min(score, 10); // Cap at 10
  }

  private assessRiskLevel(node: LineageNode, changeType: string): 'low' | 'medium' | 'high' | 'critical' {
    const impactScore = this.calculateImpactScore(node, changeType);
    
    if (impactScore >= 8) return 'critical';
    if (impactScore >= 6) return 'high';
    if (impactScore >= 3) return 'medium';
    return 'low';
  }

  private generateImpactRecommendations(impactedAssets: any[], changeType: string): string[] {
    const recommendations: string[] = [];
    
    const criticalCount = impactedAssets.filter(a => a.risk_level === 'critical').length;
    const highCount = impactedAssets.filter(a => a.risk_level === 'high').length;
    
    if (criticalCount > 0) {
      recommendations.push(`${criticalCount} critical assets will be impacted. Consider phased rollout.`);
    }
    
    if (highCount > 0) {
      recommendations.push(`${highCount} high-risk assets require careful monitoring during deployment.`);
    }
    
    if (changeType === 'schema_breaking') {
      recommendations.push('Schema breaking change detected. Ensure backward compatibility or coordinate with downstream teams.');
    }
    
    return recommendations;
  }

  private compareSchemas(oldSchema: any, newSchema: any): SchemaChange[] {
    const changes: SchemaChange[] = [];
    
    // Simplified schema comparison - in reality would be much more sophisticated
    const oldFields = Object.keys(oldSchema || {});
    const newFields = Object.keys(newSchema || {});
    
    // Find added fields
    for (const field of newFields) {
      if (!oldFields.includes(field)) {
        changes.push({
          type: 'added',
          field,
          new_value: newSchema[field]
        });
      }
    }
    
    // Find removed fields
    for (const field of oldFields) {
      if (!newFields.includes(field)) {
        changes.push({
          type: 'removed',
          field,
          old_value: oldSchema[field]
        });
      }
    }
    
    // Find modified fields
    for (const field of oldFields) {
      if (newFields.includes(field) && JSON.stringify(oldSchema[field]) !== JSON.stringify(newSchema[field])) {
        changes.push({
          type: 'modified',
          field,
          old_value: oldSchema[field],
          new_value: newSchema[field]
        });
      }
    }
    
    return changes;
  }

  private async handleAssetRegistered(event: { asset: DataAsset }): Promise<void> {
    this.logger.debug('Asset registered event handled', { assetId: event.asset.id });
  }

  private async handleTransformationTracked(event: { transformation: Transformation; transformationId: string }): Promise<void> {
    this.logger.debug('Transformation tracked event handled', { transformationId: event.transformationId });
  }

  private async handleSchemaChanged(event: { assetId: string; oldSchema: any; newSchema: any; changes: SchemaChange[] }): Promise<void> {
    // Trigger impact analysis for schema changes
    if (event.changes.some(change => change.type === 'removed' || change.type === 'modified')) {
      await this.analyzeImpact(event.assetId, 'schema_breaking');
    }
  }

  // Implement remaining interface methods
  async updateAsset(assetId: string, updates: Partial<DataAsset>): Promise<void> {
    const asset = this.assets.get(assetId);
    if (!asset) throw new Error(`Asset not found: ${assetId}`);
    
    const updatedAsset = { ...asset, ...updates, updated_at: new Date() };
    this.assets.set(assetId, updatedAsset);
  }

  async getAsset(assetId: string): Promise<DataAsset | null> {
    return this.assets.get(assetId) || null;
  }

  async listAssets(filter?: Partial<DataAsset>): Promise<DataAsset[]> {
    const assets = Array.from(this.assets.values());
    if (!filter) return assets;
    
    return assets.filter(asset => 
      Object.entries(filter).every(([key, value]) => 
        asset[key as keyof DataAsset] === value
      )
    );
  }

  async deleteAsset(assetId: string): Promise<void> {
    this.assets.delete(assetId);
    this.lineageGraph.delete(assetId);
  }

  async getFullLineage(assetId: string): Promise<LineageGraph> {
    const upstream = await this.getUpstreamLineage(assetId);
    const downstream = await this.getDownstreamLineage(assetId);
    
    // Merge graphs
    const allNodes = [...upstream.nodes, ...downstream.nodes];
    const allEdges = [...upstream.edges, ...downstream.edges];
    
    // Remove duplicates
    const uniqueNodes = allNodes.filter((node, index, array) => 
      array.findIndex(n => n.id === node.id) === index
    );
    
    const uniqueEdges = allEdges.filter((edge, index, array) => 
      array.findIndex(e => e.source === edge.source && e.target === edge.target) === index
    );
    
    return { nodes: uniqueNodes, edges: uniqueEdges };
  }

  async queryLineage(query: LineageQuery): Promise<LineageGraph> {
    // Implement custom lineage queries
    return { nodes: [], edges: [] };
  }

  async getDataDependencies(assetId: string): Promise<string[]> {
    const upstream = await this.getUpstreamLineage(assetId);
    return upstream.nodes.map(node => node.id);
  }

  async findCriticalPath(sourceId: string, targetId: string): Promise<string[]> {
    // Implement shortest path algorithm
    return [];
  }

  async getSchemaHistory(assetId: string): Promise<SchemaVersion[]> {
    // Implement schema history retrieval
    return [];
  }

  async validateSchemaCompatibility(assetId: string, newSchema: any): Promise<CompatibilityResult> {
    // Implement schema compatibility validation
    return {
      compatible: true,
      breaking_changes: [],
      warnings: [],
      recommendations: []
    };
  }

  async generateComplianceReport(scope: string[]): Promise<ComplianceReport> {
    // Implement compliance reporting
    return {
      scope,
      assets_covered: 0,
      compliance_score: 1.0,
      violations: [],
      recommendations: [],
      generated_at: new Date()
    };
  }

  async getHealth(): Promise<HealthStatus> {
    try {
      // Check Neo4j connection
      const session = this.driver.session();
      await session.run('RETURN 1');
      await session.close();
      
      return {
        status: 'healthy',
        timestamp: new Date(),
        details: {
          database_status: 'connected',
          total_assets: this.assets.size,
          total_lineage_nodes: this.lineageGraph.size
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message
      };
    }
  }

  async getLineageHealth(assetId: string): Promise<HealthStatus> {
    const asset = await this.getAsset(assetId);
    
    return {
      status: asset ? 'healthy' : 'unhealthy',
      timestamp: new Date(),
      details: {
        asset_exists: !!asset,
        has_upstream: !!(await this.getUpstreamLineage(assetId)).nodes.length,
        has_downstream: !!(await this.getDownstreamLineage(assetId)).nodes.length
      }
    };
  }
}