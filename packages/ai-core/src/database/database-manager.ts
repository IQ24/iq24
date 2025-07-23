/**
 * Database Manager - Unified database access layer for PostgreSQL and Redis
 * 
 * This service provides a unified interface to interact with both PostgreSQL
 * and Redis, handling connections, transactions, caching, and data persistence.
 */

import { Pool, PoolClient, QueryResult } from "pg";
import Redis from "ioredis";
import { EventEmitter } from "events";
import { Logger } from "../utils/logger";

export interface DatabaseConfig {
  postgres: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    maxConnections?: number;
    idleTimeoutMillis?: number;
    retryAttempts?: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    retryAttempts?: number;
    maxRetriesPerRequest?: number;
  };
}

export interface QueryOptions {
  transaction?: boolean;
  cache?: {
    key: string;
    ttl: number; // seconds
  };
  timeout?: number;
}

export interface CacheOptions {
  ttl?: number; // seconds
  nx?: boolean; // only set if not exists
}

export class DatabaseManager extends EventEmitter {
  private static instance: DatabaseManager;
  private pgPool: Pool | null = null;
  private redis: Redis | null = null;
  private logger: Logger;
  private config: DatabaseConfig | null = null;
  private isConnected = false;

  private constructor() {
    super();
    this.logger = new Logger("DatabaseManager");
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize database connections
   */
  async initialize(config: DatabaseConfig): Promise<void> {
    try {
      this.logger.info("Initializing Database Manager...");
      this.config = config;

      // Initialize PostgreSQL
      await this.initializePostgreSQL();
      
      // Initialize Redis
      await this.initializeRedis();

      // Test connections
      await this.testConnections();

      this.isConnected = true;
      this.logger.info("Database Manager initialized successfully");
      this.emit("connected");
    } catch (error) {
      this.logger.error("Failed to initialize Database Manager:", error);
      throw error;
    }
  }

  /**
   * Initialize PostgreSQL connection pool
   */
  private async initializePostgreSQL(): Promise<void> {
    if (!this.config?.postgres) {
      throw new Error("PostgreSQL configuration is required");
    }

    const { postgres } = this.config;
    
    this.pgPool = new Pool({
      host: postgres.host,
      port: postgres.port,
      database: postgres.database,
      user: postgres.username,
      password: postgres.password,
      ssl: postgres.ssl ? { rejectUnauthorized: false } : false,
      max: postgres.maxConnections || 20,
      idleTimeoutMillis: postgres.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: 10000,
    });

    // Handle pool events
    this.pgPool.on("error", (err) => {
      this.logger.error("PostgreSQL pool error:", err);
      this.emit("error", { type: "postgresql", error: err });
    });

    this.pgPool.on("connect", () => {
      this.logger.debug("New PostgreSQL client connected");
    });

    this.logger.info("PostgreSQL connection pool initialized");
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    if (!this.config?.redis) {
      throw new Error("Redis configuration is required");
    }

    const { redis } = this.config;

    this.redis = new Redis({
      host: redis.host,
      port: redis.port,
      password: redis.password,
      db: redis.db || 0,
      keyPrefix: redis.keyPrefix || "iq24:",
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: redis.maxRetriesPerRequest || 3,
      lazyConnect: true,
    });

    // Handle Redis events
    this.redis.on("connect", () => {
      this.logger.info("Redis connected");
    });

    this.redis.on("error", (err) => {
      this.logger.error("Redis error:", err);
      this.emit("error", { type: "redis", error: err });
    });

    this.redis.on("reconnecting", () => {
      this.logger.warn("Redis reconnecting...");
    });

    await this.redis.connect();
    this.logger.info("Redis connection initialized");
  }

  /**
   * Test database connections
   */
  private async testConnections(): Promise<void> {
    // Test PostgreSQL
    if (this.pgPool) {
      const result = await this.pgPool.query("SELECT NOW() as timestamp");
      this.logger.info(`PostgreSQL test query successful: ${result.rows[0].timestamp}`);
    }

    // Test Redis  
    if (this.redis) {
      await this.redis.ping();
      this.logger.info("Redis ping successful");
    }
  }

  // ============================================================================
  // PostgreSQL Operations
  // ============================================================================

  /**
   * Execute a SQL query
   */
  async query<T = any>(
    text: string, 
    params?: any[], 
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    if (!this.pgPool) {
      throw new Error("PostgreSQL not initialized");
    }

    // Check cache first if enabled
    if (options.cache) {
      const cached = await this.get(options.cache.key);
      if (cached) {
        this.logger.debug(`Cache hit for key: ${options.cache.key}`);
        return JSON.parse(cached);
      }
    }

    let client: PoolClient | null = null;
    
    try {
      if (options.transaction) {
        client = await this.pgPool.connect();
        await client.query("BEGIN");
      }

      const startTime = Date.now();
      const result = options.transaction && client
        ? await client.query(text, params)
        : await this.pgPool.query(text, params);
      
      const duration = Date.now() - startTime;
      this.logger.debug(`Query executed in ${duration}ms: ${text.substring(0, 100)}...`);

      if (options.transaction && client) {
        await client.query("COMMIT");
      }

      // Cache result if enabled
      if (options.cache && result.rows.length > 0) {
        await this.set(
          options.cache.key, 
          JSON.stringify(result), 
          { ttl: options.cache.ttl }
        );
      }

      this.emit("queryExecuted", { query: text, duration, rowCount: result.rowCount });
      return result;
    } catch (error) {
      if (options.transaction && client) {
        await client.query("ROLLBACK");
      }
      this.logger.error("Query failed:", error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pgPool) {
      throw new Error("PostgreSQL not initialized");
    }

    const client = await this.pgPool.connect();
    
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      
      this.logger.debug("Transaction committed successfully");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      this.logger.error("Transaction rolled back due to error:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================================
  // Redis Operations  
  // ============================================================================

  /**
   * Set a key-value pair in Redis
   */
  async set(key: string, value: string, options: CacheOptions = {}): Promise<void> {
    if (!this.redis) {
      throw new Error("Redis not initialized");
    }

    try {
      if (options.ttl) {
        if (options.nx) {
          await this.redis.set(key, value, "EX", options.ttl, "NX");
        } else {
          await this.redis.setex(key, options.ttl, value);
        }
      } else {
        if (options.nx) {
          await this.redis.setnx(key, value);
        } else {
          await this.redis.set(key, value);
        }
      }
      
      this.logger.debug(`Set cache key: ${key} (TTL: ${options.ttl || 'none'})`);
    } catch (error) {
      this.logger.error(`Failed to set cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value from Redis
   */
  async get(key: string): Promise<string | null> {
    if (!this.redis) {
      throw new Error("Redis not initialized");
    }

    try {
      const value = await this.redis.get(key);
      this.logger.debug(`Get cache key: ${key} (${value ? 'hit' : 'miss'})`);
      return value;
    } catch (error) {
      this.logger.error(`Failed to get cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key from Redis
   */
  async del(key: string): Promise<void> {
    if (!this.redis) {
      throw new Error("Redis not initialized");
    }

    try {
      await this.redis.del(key);
      this.logger.debug(`Deleted cache key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set JSON object in Redis
   */
  async setJSON(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    await this.set(key, JSON.stringify(value), options);
  }

  /**
   * Get JSON object from Redis
   */
  async getJSON<T = any>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Failed to parse JSON for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Increment a counter in Redis
   */
  async incr(key: string, ttl?: number): Promise<number> {
    if (!this.redis) {
      throw new Error("Redis not initialized");
    }

    try {
      const value = await this.redis.incr(key);
      if (ttl && value === 1) {
        await this.redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      this.logger.error(`Failed to increment key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Add items to a Redis list
   */
  async lpush(key: string, ...values: string[]): Promise<number> {
    if (!this.redis) {
      throw new Error("Redis not initialized");
    }

    try {
      return await this.redis.lpush(key, ...values);
    } catch (error) {
      this.logger.error(`Failed to push to list ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get items from a Redis list
   */
  async lrange(key: string, start: number = 0, stop: number = -1): Promise<string[]> {
    if (!this.redis) {
      throw new Error("Redis not initialized");
    }

    try {
      return await this.redis.lrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to get list ${key}:`, error);
      return [];
    }
  }

  // ============================================================================
  // High-level Operations
  // ============================================================================

  /**
   * Create database tables if they don't exist
   */
  async initializeTables(): Promise<void> {
    const tables = [
      // Users and workspaces
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS workspaces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      // AI campaigns and prospects
      `CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        config JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS prospects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        position VARCHAR(255),
        linkedin_url TEXT,
        phone VARCHAR(50),
        lead_score INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'new',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      // AI agent tasks and workflows
      `CREATE TABLE IF NOT EXISTS agent_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payload JSONB NOT NULL,
        result JSONB,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        steps JSONB NOT NULL,
        current_step INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )`,

      // Analytics and metrics
      `CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      )`,
    ];

    try {
      this.logger.info("Initializing database tables...");
      
      for (const table of tables) {
        await this.query(table);
      }
      
      // Create indexes
      const indexes = [
        "CREATE INDEX IF NOT EXISTS idx_campaigns_workspace_id ON campaigns(workspace_id)",
        "CREATE INDEX IF NOT EXISTS idx_prospects_campaign_id ON prospects(campaign_id)",
        "CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects(email)",
        "CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status)",
        "CREATE INDEX IF NOT EXISTS idx_workflows_campaign_id ON workflows(campaign_id)",
        "CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign_id ON analytics_events(campaign_id)",
        "CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp)",
      ];

      for (const index of indexes) {
        await this.query(index);
      }

      this.logger.info("Database tables initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize database tables:", error);
      throw error;
    }
  }

  /**
   * Get system health and statistics
   */
  async getSystemHealth() {
    const health: any = {
      connected: this.isConnected,
      timestamp: new Date(),
    };

    try {
      // PostgreSQL health
      if (this.pgPool) {
        const pgResult = await this.pgPool.query("SELECT NOW() as timestamp, version() as version");
        health.postgresql = {
          connected: true,
          version: pgResult.rows[0].version,
          totalConnections: this.pgPool.totalCount,
          idleConnections: this.pgPool.idleCount,
          waitingConnections: this.pgPool.waitingCount,
        };
      }

      // Redis health
      if (this.redis) {
        const redisInfo = await this.redis.info();
        health.redis = {
          connected: true,
          info: redisInfo,
        };
      }
    } catch (error) {
      health.error = error instanceof Error ? error.message : "Unknown error";
    }

    return health;
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    try {
      this.logger.info("Closing database connections...");

      if (this.pgPool) {
        await this.pgPool.end();
        this.pgPool = null;
        this.logger.info("PostgreSQL pool closed");
      }

      if (this.redis) {
        await this.redis.quit();
        this.redis = null;
        this.logger.info("Redis connection closed");
      }

      this.isConnected = false;
      this.emit("disconnected");
      this.logger.info("All database connections closed");
    } catch (error) {
      this.logger.error("Error closing database connections:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();