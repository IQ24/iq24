#!/usr/bin/env node

/**
 * Simple Node.js server to test health endpoints
 * This bypasses Wrangler/Cloudflare Workers to test basic connectivity
 */

const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID, X-Workspace-ID');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health' && req.method === 'GET') {
    const healthResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0-simple-node",
      service: "IQ24 AI Engine (Simple Node.js Test)",
      engine: "running",
      uptime: Math.floor(process.uptime()),
      services: {
        ai: { status: "healthy", provider: "mock" },
        database: { status: "healthy", type: "mock" },
      },
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(healthResponse, null, 2));
    return;
  }

  if (req.url === '/' && req.method === 'GET') {
    const rootResponse = {
      name: "IQ24 AI Engine Test Server",
      version: "1.0.0-simple-node",
      status: "operational",
      timestamp: new Date().toISOString(),
      endpoints: [
        "GET /health - Health check",
        "POST /ai/prospects/discover - AI-powered prospect discovery (mock)",
      ],
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(rootResponse, null, 2));
    return;
  }

  if (req.url === '/ai/prospects/discover' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const requestData = body ? JSON.parse(body) : {};
        
        const mockResponse = {
          success: true,
          taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: "completed",
          prospects: [
            {
              id: `prospect-${Date.now()}-1`,
              firstName: "John",
              lastName: "Smith",
              email: "john.smith@techcorp.com",
              company: "TechCorp Inc.",
              position: "CTO",
              industry: "Technology",
              linkedinUrl: "https://linkedin.com/in/john-smith",
              leadScore: 85,
              source: "ai-discovery",
              discoveredAt: new Date(),
            }
          ],
          metadata: {
            totalFound: 1,
            qualityScore: 85,
            processingTime: 500,
            aiProvider: "simple-node-mock",
            searchCriteria: requestData.searchCriteria || {},
          },
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(mockResponse, null, 2));
      } catch (error) {
        const errorResponse = {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
        
        res.writeHead(500);
        res.end(JSON.stringify(errorResponse, null, 2));
      }
    });
    return;
  }

  // 404 for unknown routes
  const notFoundResponse = {
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      "GET /health",
      "GET /",
      "POST /ai/prospects/discover"
    ]
  };
  
  res.writeHead(404);
  res.end(JSON.stringify(notFoundResponse, null, 2));
});

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`🚀 Simple Health Test Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/ai/prospects/discover`);
  console.log(``);
  console.log(`💡 This server bypasses Cloudflare Workers to test basic functionality`);
  console.log(`   Use this to verify if the issue is with the Wrangler environment`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📛 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📛 Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});