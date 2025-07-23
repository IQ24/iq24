/**
 * Authentication Middleware for Hono.js
 * 
 * Provides:
 * - API Key authentication
 * - JWT token authentication
 * - Rate limiting per user/key
 * - Permission checking
 * - API versioning support
 * - Security headers
 * - Request logging and audit
 */

import { Context, Next } from 'hono';
import { authManager, AuthContext } from './auth-manager';

// Middleware types
export interface AuthOptions {
  required?: boolean;
  permissions?: { resource: string; action: string }[];
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
  };
  apiVersion?: string;
}

// Request context extension
declare module 'hono' {
  interface ContextVariableMap {
    auth?: AuthContext;
    apiVersion?: string;
  }
}

/**
 * Main authentication middleware
 */
export const authenticate = (options: AuthOptions = {}) => {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    
    try {
      // Extract request metadata
      const metadata = {
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
        userAgent: c.req.header('user-agent') || 'unknown',
        apiVersion: c.req.header('x-api-version') || options.apiVersion || 'v1',
        method: c.req.method,
        path: c.req.url,
        timestamp: new Date(),
      };

      // Check if IP is blacklisted
      if (authManager.isIpBlacklisted(metadata.ipAddress)) {
        return c.json({
          error: 'Access denied',
          code: 'IP_BLACKLISTED',
          timestamp: new Date().toISOString(),
        }, 403);
      }

      // Try to authenticate using different methods
      let authContext: AuthContext | null = null;

      // 1. Try API Key authentication
      const apiKey = extractApiKey(c);
      if (apiKey) {
        try {
          authContext = await authManager.authenticateApiKey(apiKey, metadata);
        } catch (error) {
          if (options.required) {
            return c.json({
              error: 'Invalid API key',
              code: 'INVALID_API_KEY',
              timestamp: new Date().toISOString(),
            }, 401);
          }
        }
      }

      // 2. Try JWT authentication if no API key
      if (!authContext) {
        const jwt = extractJwtToken(c);
        if (jwt) {
          try {
            authContext = await authManager.verifyJwtToken(jwt, metadata);
          } catch (error) {
            if (options.required) {
              return c.json({
                error: 'Invalid or expired token',
                code: 'INVALID_JWT',
                timestamp: new Date().toISOString(),
              }, 401);
            }
          }
        }
      }

      // Check if authentication is required
      if (options.required && !authContext) {
        return c.json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
          message: 'Please provide a valid API key or JWT token',
          timestamp: new Date().toISOString(),
        }, 401);
      }

      // Check permissions if specified
      if (authContext && options.permissions) {
        for (const permission of options.permissions) {
          if (!authManager.hasPermission(authContext, permission.resource, permission.action)) {
            return c.json({
              error: 'Insufficient permissions',
              code: 'INSUFFICIENT_PERMISSIONS',
              required: permission,
              timestamp: new Date().toISOString(),
            }, 403);
          }
        }
      }

      // Set context variables
      if (authContext) {
        c.set('auth', authContext);
      }
      c.set('apiVersion', metadata.apiVersion);

      // Add security headers
      c.header('X-Content-Type-Options', 'nosniff');
      c.header('X-Frame-Options', 'DENY');
      c.header('X-XSS-Protection', '1; mode=block');
      c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      c.header('X-API-Version', metadata.apiVersion);

      await next();

      // Log successful request
      const responseTime = Date.now() - startTime;
      console.log(`${metadata.method} ${metadata.path} - ${c.res.status} - ${responseTime}ms - ${authContext?.userId || 'anonymous'}`);

    } catch (error) {
      console.error('Authentication middleware error:', error);
      return c.json({
        error: 'Authentication failed',
        code: 'AUTH_ERROR',
        timestamp: new Date().toISOString(),
      }, 500);
    }
  };
};

/**
 * Rate limiting middleware
 */
export const rateLimit = (config: {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  keyGenerator?: (c: Context) => string;
}) => {
  const store = new Map<string, { count: number; resetTime: number }>();
  
  return async (c: Context, next: Next) => {
    const auth = c.get('auth');
    const key = config.keyGenerator ? config.keyGenerator(c) : 
               auth ? `user:${auth.userId}` : 
               `ip:${c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'}`;
    
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const resetTime = Math.floor(now / windowMs) * windowMs + windowMs;
    
    const current = store.get(key);
    const limit = config.requestsPerMinute || (auth?.rateLimits?.requestsPerMinute) || 100;
    
    if (current && current.resetTime > now) {
      if (current.count >= limit) {
        return c.json({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          limit,
          remaining: 0,
          resetTime: new Date(current.resetTime).toISOString(),
          timestamp: new Date().toISOString(),
        }, 429);
      }
      current.count++;
    } else {
      store.set(key, { count: 1, resetTime });
    }
    
    // Set rate limit headers
    const entry = store.get(key)!;
    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, limit - entry.count).toString());
    c.header('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
    
    await next();
  };
};

/**
 * API versioning middleware
 */
export const apiVersion = (supportedVersions: string[] = ['v1']) => {
  return async (c: Context, next: Next) => {
    const requestedVersion = c.req.header('x-api-version') || 
                           c.req.query('version') || 
                           'v1';
    
    if (!supportedVersions.includes(requestedVersion)) {
      return c.json({
        error: 'Unsupported API version',
        code: 'UNSUPPORTED_VERSION',
        supportedVersions,
        requestedVersion,
        timestamp: new Date().toISOString(),
      }, 400);
    }
    
    c.set('apiVersion', requestedVersion);
    c.header('X-API-Version', requestedVersion);
    
    await next();
  };
};

/**
 * Request logging middleware
 */
export const requestLogger = () => {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const auth = c.get('auth');
    
    // Log request start
    console.log(`🔄 ${c.req.method} ${c.req.url} - User: ${auth?.userId || 'anonymous'} - IP: ${c.req.header('x-forwarded-for') || 'unknown'}`);
    
    await next();
    
    // Log request completion
    const responseTime = Date.now() - startTime;
    const status = c.res.status;
    const statusEmoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
    
    console.log(`${statusEmoji} ${c.req.method} ${c.req.url} - ${status} - ${responseTime}ms - User: ${auth?.userId || 'anonymous'}`);
  };
};

/**
 * CORS middleware with authentication awareness
 */
export const corsWithAuth = () => {
  return async (c: Context, next: Next) => {
    const origin = c.req.header('origin');
    const auth = c.get('auth');
    
    // Basic CORS headers
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-API-Version');
    c.header('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-API-Version');
    
    // Set origin based on authentication status
    if (auth && auth.user.settings.ipWhitelist.length > 0) {
      // Strict CORS for authenticated users with IP restrictions
      c.header('Access-Control-Allow-Origin', origin || '*');
    } else {
      // More permissive for public endpoints
      c.header('Access-Control-Allow-Origin', '*');
    }
    
    if (c.req.method === 'OPTIONS') {
      return c.text('', 204);
    }
    
    await next();
  };
};

/**
 * Permission checking helper
 */
export const requirePermission = (resource: string, action: string) => {
  return authenticate({
    required: true,
    permissions: [{ resource, action }],
  });
};

/**
 * Admin-only access helper
 */
export const requireAdmin = () => {
  return authenticate({
    required: true,
    permissions: [{ resource: '*', action: '*' }],
  });
};

// Helper functions
function extractApiKey(c: Context): string | null {
  // Try multiple headers and query parameters
  return c.req.header('x-api-key') ||
         c.req.header('authorization')?.replace(/^Bearer\s+/, '') ||
         c.req.query('api_key') ||
         null;
}

function extractJwtToken(c: Context): string | null {
  const authHeader = c.req.header('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Simple check to distinguish JWT from API key (JWTs have dots)
    if (token.includes('.')) {
      return token;
    }
  }
  return null;
}

/**
 * Get current authenticated user context
 */
export function getAuthContext(c: Context): AuthContext | null {
  return c.get('auth') || null;
}

/**
 * Get current API version
 */
export function getApiVersion(c: Context): string {
  return c.get('apiVersion') || 'v1';
}

/**
 * Check if user has specific permission
 */
export function hasPermission(c: Context, resource: string, action: string): boolean {
  const auth = getAuthContext(c);
  if (!auth) return false;
  return authManager.hasPermission(auth, resource, action);
}