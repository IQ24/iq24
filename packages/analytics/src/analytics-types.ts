export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
  sessionId?: string;
  deviceId?: string;
  source?: string;
}

export interface UserProperties {
  userId: string;
  email?: string;
  name?: string;
  plan?: string;
  createdAt?: Date;
  lastLogin?: Date;
  properties?: Record<string, any>;
}

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  timestamp?: Date;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface AnalyticsProvider {
  name: string;
  initialize(config: any): Promise<void>;
  track(event: AnalyticsEvent): Promise<void>;
  identify(user: UserProperties): Promise<void>;
  page(page: string, properties?: Record<string, any>): Promise<void>;
  group(groupId: string, properties?: Record<string, any>): Promise<void>;
  alias(userId: string, previousId: string): Promise<void>;
  reset(): Promise<void>;
}

export interface AnalyticsConfig {
  providers: {
    mixpanel?: {
      token: string;
      enabled: boolean;
    };
    googleAnalytics?: {
      measurementId: string;
      enabled: boolean;
    };
    segment?: {
      writeKey: string;
      enabled: boolean;
    };
    custom?: {
      endpoint: string;
      apiKey: string;
      enabled: boolean;
    };
  };
  defaultProperties?: Record<string, any>;
  enableBatching?: boolean;
  batchSize?: number;
  flushInterval?: number;
}
