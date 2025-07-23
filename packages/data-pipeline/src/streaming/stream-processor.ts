/**
 * Real-time Stream Processing System
 * 
 * Provides high-throughput, low-latency stream processing capabilities:
 * - Kafka/Redis Streams integration
 * - Real-time feature computation
 * - Event-driven ML pipeline triggers
 * - Scalable parallel processing
 * - Fault-tolerant stream recovery
 */

import {
  StreamConfig,
  StreamMessage,
  StreamProcessor as IStreamProcessor,
  StreamConsumer,
  StreamProducer,
  ProcessingResult,
  StreamMetrics,
  StreamEvent,
  HealthStatus,
  StreamPartition,
  CheckpointData
} from '../types';
import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { Redis } from 'ioredis';
import { Kafka, Consumer, Producer, EachMessagePayload } from 'kafkajs';
import { IFeatureStore } from '../stores/feature-store';
import { ITransformationEngine } from '../transformations/transformation-engine';

export interface IStreamProcessor {
  // Stream Management
  createStream(name: string, config: StreamConfig): Promise<void>;
  deleteStream(name: string): Promise<void>;
  listStreams(): Promise<string[]>;
  
  // Producers
  createProducer(streamName: string, config?: ProducerConfig): Promise<StreamProducer>;
  
  // Consumers
  createConsumer(streamName: string, groupId: string, config?: ConsumerConfig): Promise<StreamConsumer>;
  
  // Processing
  startProcessing(streamName: string, processor: MessageProcessor): Promise<void>;
  stopProcessing(streamName: string): Promise<void>;
  
  // Monitoring
  getMetrics(streamName?: string): Promise<StreamMetrics>;
  getHealth(): Promise<HealthStatus>;
  
  // Checkpointing
  createCheckpoint(streamName: string, data: CheckpointData): Promise<void>;
  restoreFromCheckpoint(streamName: string): Promise<CheckpointData | null>;
}

interface ProducerConfig {
  batch_size?: number;
  compression?: 'gzip' | 'snappy' | 'lz4';
  acks?: 'all' | 'leader' | 'none';
  retries?: number;
}

interface ConsumerConfig {
  max_poll_records?: number;
  auto_offset_reset?: 'earliest' | 'latest';
  enable_auto_commit?: boolean;
  session_timeout?: number;
}

interface MessageProcessor {
  process(message: StreamMessage): Promise<ProcessingResult>;
  onError?(error: Error, message: StreamMessage): Promise<void>;
  onSuccess?(result: ProcessingResult, message: StreamMessage): Promise<void>;
}

export class StreamProcessorImpl implements IStreamProcessor {
  private kafka: Kafka;
  private redis: Redis;
  private producers: Map<string, Producer> = new Map();
  private consumers: Map<string, Consumer> = new Map();
  private processors: Map<string, MessageProcessor> = new Map();
  private metrics: Map<string, StreamMetrics> = new Map();
  private eventEmitter: EventEmitter;
  private isRunning: boolean = false;

  constructor(
    private config: {
      kafka: {
        brokers: string[];
        client_id: string;
        retry: {
          initial_retry_time: number;
          retries: number;
        };
      };
      redis: {
        host: string;
        port: number;
        password?: string;
      };
      processing: {
        batch_size: number;
        max_parallel_processes: number;
        checkpoint_interval: number;
      };
    },
    private featureStore: IFeatureStore,
    private transformationEngine: ITransformationEngine,
    private logger: Logger
  ) {
    this.eventEmitter = new EventEmitter();
    this.initializeClients();
    this.setupEventHandlers();
  }

  private initializeClients(): void {
    // Initialize Kafka client
    this.kafka = new Kafka({
      clientId: this.config.kafka.client_id,
      brokers: this.config.kafka.brokers,
      retry: this.config.kafka.retry
    });

    // Initialize Redis client
    this.redis = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100
    });
  }

  private setupEventHandlers(): void {
    this.eventEmitter.on('message:processed', this.handleMessageProcessed.bind(this));
    this.eventEmitter.on('stream:error', this.handleStreamError.bind(this));
    this.eventEmitter.on('checkpoint:created', this.handleCheckpointCreated.bind(this));
    
    // Graceful shutdown handling
    process.on('SIGTERM', this.shutdown.bind(this));
    process.on('SIGINT', this.shutdown.bind(this));
  }

  async createStream(name: string, config: StreamConfig): Promise<void> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      await admin.createTopics({
        topics: [{
          topic: name,
          numPartitions: config.partitions || 3,
          replicationFactor: config.replication_factor || 1,
          configEntries: [
            { name: 'retention.ms', value: (config.retention_hours * 3600 * 1000).toString() },
            { name: 'cleanup.policy', value: config.cleanup_policy || 'delete' }
          ]
        }]
      });
      
      await admin.disconnect();
      
      // Initialize stream metrics
      this.metrics.set(name, {
        stream_name: name,
        messages_produced: 0,
        messages_consumed: 0,
        processing_rate: 0,
        error_rate: 0,
        avg_latency: 0,
        last_processed: new Date(),
        consumer_lag: 0
      });
      
      this.logger.info('Stream created successfully', {
        streamName: name,
        partitions: config.partitions,
        replicationFactor: config.replication_factor
      });
      
      this.eventEmitter.emit('stream:created', { name, config });
    } catch (error) {
      this.logger.error('Failed to create stream', { error, streamName: name });
      throw error;
    }
  }

  async createProducer(streamName: string, config: ProducerConfig = {}): Promise<StreamProducer> {
    try {
      const producer = this.kafka.producer({
        maxInFlightRequests: 1,
        idempotent: true,
        transactionTimeout: 30000
      });
      
      await producer.connect();
      this.producers.set(streamName, producer);
      
      const streamProducer: StreamProducer = {
        send: async (message: StreamMessage) => {
          const startTime = Date.now();
          
          try {
            await producer.send({
              topic: streamName,
              messages: [{
                key: message.key,
                value: JSON.stringify(message.data),
                partition: message.partition,
                timestamp: message.timestamp?.toISOString(),
                headers: message.headers
              }]
            });
            
            // Update metrics
            const metrics = this.metrics.get(streamName)!;
            metrics.messages_produced++;
            metrics.avg_latency = (metrics.avg_latency + (Date.now() - startTime)) / 2;
            
            this.eventEmitter.emit('message:sent', { streamName, message });
            
          } catch (error) {
            this.logger.error('Failed to send message', { error, streamName, messageKey: message.key });
            throw error;
          }
        },
        
        sendBatch: async (messages: StreamMessage[]) => {
          const startTime = Date.now();
          
          try {
            const kafkaMessages = messages.map(msg => ({
              key: msg.key,
              value: JSON.stringify(msg.data),
              partition: msg.partition,
              timestamp: msg.timestamp?.toISOString(),
              headers: msg.headers
            }));
            
            await producer.send({
              topic: streamName,
              messages: kafkaMessages
            });
            
            // Update metrics
            const metrics = this.metrics.get(streamName)!;
            metrics.messages_produced += messages.length;
            metrics.avg_latency = (metrics.avg_latency + (Date.now() - startTime)) / 2;
            
            this.eventEmitter.emit('batch:sent', { streamName, count: messages.length });
            
          } catch (error) {
            this.logger.error('Failed to send batch', { error, streamName, count: messages.length });
            throw error;
          }
        },
        
        close: async () => {
          await producer.disconnect();
          this.producers.delete(streamName);
        }
      };
      
      this.logger.info('Producer created', { streamName });
      return streamProducer;
      
    } catch (error) {
      this.logger.error('Failed to create producer', { error, streamName });
      throw error;
    }
  }

  async createConsumer(streamName: string, groupId: string, config: ConsumerConfig = {}): Promise<StreamConsumer> {
    try {
      const consumer = this.kafka.consumer({
        groupId,
        sessionTimeout: config.session_timeout || 30000,
        heartbeatInterval: 3000,
        maxBytesPerPartition: 1048576, // 1MB
        ...config
      });
      
      await consumer.connect();
      await consumer.subscribe({ topic: streamName, fromBeginning: config.auto_offset_reset === 'earliest' });
      
      this.consumers.set(`${streamName}:${groupId}`, consumer);
      
      const streamConsumer: StreamConsumer = {
        consume: async (processor: MessageProcessor) => {
          await consumer.run({
            eachMessage: async (payload: EachMessagePayload) => {
              const startTime = Date.now();
              
              try {
                const message: StreamMessage = {
                  key: payload.message.key?.toString() || '',
                  data: JSON.parse(payload.message.value?.toString() || '{}'),
                  timestamp: new Date(Number(payload.message.timestamp)),
                  partition: payload.partition,
                  offset: payload.message.offset,
                  headers: payload.message.headers
                };
                
                const result = await processor.process(message);
                
                if (processor.onSuccess) {
                  await processor.onSuccess(result, message);
                }
                
                // Update metrics
                const metrics = this.metrics.get(streamName)!;
                metrics.messages_consumed++;
                metrics.processing_rate = 1000 / (Date.now() - startTime); // messages per second
                metrics.last_processed = new Date();
                
                this.eventEmitter.emit('message:processed', { streamName, message, result });
                
              } catch (error) {
                this.logger.error('Message processing failed', {
                  error,
                  streamName,
                  partition: payload.partition,
                  offset: payload.message.offset
                });
                
                if (processor.onError) {
                  const message: StreamMessage = {
                    key: payload.message.key?.toString() || '',
                    data: JSON.parse(payload.message.value?.toString() || '{}'),
                    timestamp: new Date(Number(payload.message.timestamp)),
                    partition: payload.partition,
                    offset: payload.message.offset,
                    headers: payload.message.headers
                  };
                  
                  await processor.onError(error, message);
                }
                
                // Update error metrics
                const metrics = this.metrics.get(streamName)!;
                metrics.error_rate++;
                
                this.eventEmitter.emit('stream:error', { streamName, error, payload });
              }
            }
          });
        },
        
        pause: async () => {
          consumer.pause([{ topic: streamName }]);
        },
        
        resume: async () => {
          consumer.resume([{ topic: streamName }]);
        },
        
        close: async () => {
          await consumer.disconnect();
          this.consumers.delete(`${streamName}:${groupId}`);
        }
      };
      
      this.logger.info('Consumer created', { streamName, groupId });
      return streamConsumer;
      
    } catch (error) {
      this.logger.error('Failed to create consumer', { error, streamName, groupId });
      throw error;
    }
  }

  async startProcessing(streamName: string, processor: MessageProcessor): Promise<void> {
    try {
      this.processors.set(streamName, processor);
      this.isRunning = true;
      
      // Create consumer for processing
      const consumer = await this.createConsumer(streamName, `${streamName}-processor`, {
        auto_offset_reset: 'latest',
        enable_auto_commit: true
      });
      
      // Start consuming and processing
      await consumer.consume(processor);
      
      // Start checkpoint creation
      this.startCheckpointing(streamName);
      
      this.logger.info('Stream processing started', { streamName });
      this.eventEmitter.emit('processing:started', { streamName });
      
    } catch (error) {
      this.logger.error('Failed to start processing', { error, streamName });
      throw error;
    }
  }

  async stopProcessing(streamName: string): Promise<void> {
    try {
      this.processors.delete(streamName);
      
      // Stop consumer
      const consumerKey = `${streamName}-processor`;
      const consumer = this.consumers.get(consumerKey);
      if (consumer) {
        await consumer.disconnect();
        this.consumers.delete(consumerKey);
      }
      
      this.logger.info('Stream processing stopped', { streamName });
      this.eventEmitter.emit('processing:stopped', { streamName });
      
    } catch (error) {
      this.logger.error('Failed to stop processing', { error, streamName });
      throw error;
    }
  }

  async getMetrics(streamName?: string): Promise<StreamMetrics> {
    if (streamName) {
      const metrics = this.metrics.get(streamName);
      if (!metrics) {
        throw new Error(`Stream not found: ${streamName}`);
      }
      return metrics;
    }
    
    // Aggregate metrics for all streams
    const allMetrics = Array.from(this.metrics.values());
    
    return {
      stream_name: 'all',
      messages_produced: allMetrics.reduce((sum, m) => sum + m.messages_produced, 0),
      messages_consumed: allMetrics.reduce((sum, m) => sum + m.messages_consumed, 0),
      processing_rate: allMetrics.reduce((sum, m) => sum + m.processing_rate, 0) / allMetrics.length,
      error_rate: allMetrics.reduce((sum, m) => sum + m.error_rate, 0),
      avg_latency: allMetrics.reduce((sum, m) => sum + m.avg_latency, 0) / allMetrics.length,
      last_processed: new Date(Math.max(...allMetrics.map(m => m.last_processed.getTime()))),
      consumer_lag: allMetrics.reduce((sum, m) => sum + m.consumer_lag, 0)
    };
  }

  async getHealth(): Promise<HealthStatus> {
    try {
      const kafkaHealthy = await this.checkKafkaHealth();
      const redisHealthy = await this.checkRedisHealth();
      
      const activeProducers = this.producers.size;
      const activeConsumers = this.consumers.size;
      const activeProcessors = this.processors.size;
      
      const status: HealthStatus = {
        status: kafkaHealthy && redisHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date(),
        details: {
          kafka_healthy: kafkaHealthy,
          redis_healthy: redisHealthy,
          active_producers: activeProducers,
          active_consumers: activeConsumers,
          active_processors: activeProcessors,
          total_streams: this.metrics.size
        }
      };
      
      return status;
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message
      };
    }
  }

  async createCheckpoint(streamName: string, data: CheckpointData): Promise<void> {
    try {
      const checkpointKey = `checkpoint:${streamName}:${Date.now()}`;
      
      await this.redis.setex(
        checkpointKey,
        3600, // 1 hour TTL
        JSON.stringify({
          ...data,
          created_at: new Date(),
          stream_name: streamName
        })
      );
      
      // Keep reference to latest checkpoint
      await this.redis.set(`checkpoint:${streamName}:latest`, checkpointKey);
      
      this.logger.info('Checkpoint created', { streamName, checkpointKey });
      this.eventEmitter.emit('checkpoint:created', { streamName, checkpointKey, data });
      
    } catch (error) {
      this.logger.error('Failed to create checkpoint', { error, streamName });
      throw error;
    }
  }

  async restoreFromCheckpoint(streamName: string): Promise<CheckpointData | null> {
    try {
      const latestCheckpointKey = await this.redis.get(`checkpoint:${streamName}:latest`);
      if (!latestCheckpointKey) {
        return null;
      }
      
      const checkpointData = await this.redis.get(latestCheckpointKey);
      if (!checkpointData) {
        return null;
      }
      
      const checkpoint = JSON.parse(checkpointData);
      
      this.logger.info('Checkpoint restored', { streamName, checkpointKey: latestCheckpointKey });
      this.eventEmitter.emit('checkpoint:restored', { streamName, checkpoint });
      
      return checkpoint;
    } catch (error) {
      this.logger.error('Failed to restore checkpoint', { error, streamName });
      return null;
    }
  }

  async deleteStream(streamName: string): Promise<void> {
    try {
      // Stop any active processing
      await this.stopProcessing(streamName);
      
      // Delete Kafka topic
      const admin = this.kafka.admin();
      await admin.connect();
      await admin.deleteTopics({
        topics: [streamName],
        timeout: 5000
      });
      await admin.disconnect();
      
      // Clean up metrics and checkpoints
      this.metrics.delete(streamName);
      await this.redis.del(`checkpoint:${streamName}:latest`);
      
      this.logger.info('Stream deleted', { streamName });
      this.eventEmitter.emit('stream:deleted', { streamName });
      
    } catch (error) {
      this.logger.error('Failed to delete stream', { error, streamName });
      throw error;
    }
  }

  async listStreams(): Promise<string[]> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      const metadata = await admin.fetchTopicMetadata();
      const topics = metadata.topics.map(topic => topic.name);
      
      await admin.disconnect();
      
      return topics;
    } catch (error) {
      this.logger.error('Failed to list streams', { error });
      throw error;
    }
  }

  // Private helper methods
  private async checkKafkaHealth(): Promise<boolean> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      await admin.listTopics();
      await admin.disconnect();
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  private startCheckpointing(streamName: string): void {
    const interval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }
      
      try {
        const metrics = this.metrics.get(streamName);
        if (metrics) {
          await this.createCheckpoint(streamName, {
            offset: metrics.messages_consumed,
            timestamp: new Date(),
            metrics: metrics
          });
        }
      } catch (error) {
        this.logger.error('Checkpoint creation failed', { error, streamName });
      }
    }, this.config.processing.checkpoint_interval);
  }

  private async handleMessageProcessed(event: { streamName: string; message: StreamMessage; result: ProcessingResult }): Promise<void> {
    // Handle successful message processing
    if (event.result.features) {
      // Store computed features in feature store
      await this.featureStore.setFeatures(
        event.result.entity_id || event.message.key,
        event.result.features
      );
    }
    
    if (event.result.trigger_pipeline) {
      // Trigger downstream ML pipeline
      this.eventEmitter.emit('pipeline:trigger', {
        streamName: event.streamName,
        entityId: event.result.entity_id,
        pipelineId: event.result.pipeline_id
      });
    }
  }

  private async handleStreamError(event: { streamName: string; error: Error; payload: any }): Promise<void> {
    this.logger.error('Stream processing error', {
      streamName: event.streamName,
      error: event.error.message,
      payload: event.payload
    });
    
    // Implement error recovery strategies
    // - Dead letter queue
    // - Retry with backoff
    // - Circuit breaker pattern
  }

  private async handleCheckpointCreated(event: { streamName: string; checkpointKey: string; data: CheckpointData }): Promise<void> {
    this.logger.debug('Checkpoint created successfully', {
      streamName: event.streamName,
      checkpointKey: event.checkpointKey,
      offset: event.data.offset
    });
  }

  private async shutdown(): Promise<void> {
    this.logger.info('Shutting down stream processor...');
    this.isRunning = false;
    
    // Close all producers
    for (const [name, producer] of this.producers) {
      try {
        await producer.disconnect();
        this.logger.info(`Producer disconnected: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to disconnect producer: ${name}`, { error });
      }
    }
    
    // Close all consumers
    for (const [name, consumer] of this.consumers) {
      try {
        await consumer.disconnect();
        this.logger.info(`Consumer disconnected: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to disconnect consumer: ${name}`, { error });
      }
    }
    
    // Close Redis connection
    try {
      await this.redis.quit();
      this.logger.info('Redis connection closed');
    } catch (error) {
      this.logger.error('Failed to close Redis connection', { error });
    }
    
    this.logger.info('Stream processor shutdown complete');
  }
}