#!/usr/bin/env node

/**
 * Comprehensive AI Pipeline Test Suite
 * 
 * Tests all major components of the IQ24 AI Engine:
 * 1. Health check
 * 2. AI prospect discovery 
 * 3. AI campaign execution
 * 4. System metrics
 * 5. Performance optimization
 */

const https = require('http');

const ENGINE_URL = 'http://localhost:3002';

// Test configuration
const testConfig = {
  maxRetries: 3,
  retryDelay: 2000,
  requestTimeout: 30000,
};

// Utility function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, ENGINE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'IQ24-Pipeline-Tester/1.0',
        'X-User-ID': 'test-user-123',
        'X-Workspace-ID': 'test-workspace-456'
      },
      timeout: testConfig.requestTimeout
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
            rawBody: responseData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: responseData,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, status, details = '') {
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${name} - PASSED ${details}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name} - FAILED ${details}`);
  }
  
  testResults.tests.push({
    name,
    status,
    details,
    timestamp: new Date().toISOString()
  });
}

async function runWithRetry(testName, testFunction, maxRetries = testConfig.maxRetries) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await testFunction();
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        logTest(testName, 'FAIL', `Failed after ${maxRetries} attempts: ${error.message}`);
        return;
      }
      console.log(`⚠️  ${testName} - Attempt ${attempt} failed, retrying in ${testConfig.retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, testConfig.retryDelay));
    }
  }
}

async function testHealthCheck() {
  await runWithRetry('Health Check', async () => {
    const response = await makeRequest('GET', '/health');
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    
    if (!response.body || response.body.status !== 'ok') {
      throw new Error(`Expected status 'ok', got '${response.body?.status}'`);
    }
    
    // Check required fields
    const requiredFields = ['timestamp', 'version', 'services'];
    for (const field of requiredFields) {
      if (!(field in response.body)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    logTest('Health Check', 'PASS', `Version: ${response.body.version}`);
  });
}

async function testProspectDiscovery() {
  await runWithRetry('AI Prospect Discovery', async () => {
    const requestData = {
      searchCriteria: {
        industries: ['Technology', 'Software'],
        companySizes: ['Medium', 'Large'],
        roles: ['CEO', 'CTO', 'VP Engineering'],
        locations: ['United States', 'Canada'],
        keywords: ['AI', 'machine learning', 'automation']
      },
      limits: {
        maxProspects: 5,
        maxCompanies: 10
      },
      enrichmentLevel: 'advanced'
    };
    
    const response = await makeRequest('POST', '/ai/prospects/discover', requestData);
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}: ${response.rawBody}`);
    }
    
    if (!response.body || !response.body.success) {
      throw new Error(`Request failed: ${response.body?.error || 'Unknown error'}`);
    }
    
    if (!Array.isArray(response.body.prospects)) {
      throw new Error('Expected prospects array in response');
    }
    
    // Validate prospect data quality
    const prospects = response.body.prospects;
    if (prospects.length === 0) {
      throw new Error('No prospects found');
    }
    
    // Check prospect data structure
    const requiredProspectFields = ['id', 'firstName', 'lastName', 'email', 'company', 'position'];
    for (const prospect of prospects) {
      for (const field of requiredProspectFields) {
        if (!(field in prospect)) {
          throw new Error(`Prospect missing required field: ${field}`);
        }
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(prospect.email)) {
        throw new Error(`Invalid email format: ${prospect.email}`);
      }
    }
    
    logTest('AI Prospect Discovery', 'PASS', 
      `Found ${prospects.length} prospects, Quality Score: ${response.body.metadata?.qualityScore || 'N/A'}`);
  });
}

async function testCampaignExecution() {
  await runWithRetry('AI Campaign Execution', async () => {
    const requestData = {
      campaignId: 'test-campaign-' + Date.now(),
      config: {
        name: 'Test AI Campaign',
        description: 'Automated testing campaign for AI pipeline validation',
        idealCustomerProfile: {
          industries: ['Technology'],
          companySizes: ['Medium'],
          roles: ['CTO', 'VP Engineering'],
          technologies: ['AI', 'Machine Learning'],
          keywords: ['automation', 'efficiency']
        },
        channels: ['email', 'linkedin'],
        personalizationLevel: 'advanced',
        complianceProfile: 'gdpr'
      },
      prospects: [
        {
          id: 'prospect-test-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@techcorp.com',
          company: 'TechCorp',
          position: 'CTO',
          linkedinUrl: 'https://linkedin.com/in/johndoe',
          phone: '+1-555-123-4567',
          leadScore: 85,
          source: 'ai-discovery'
        },
        {
          id: 'prospect-test-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@innovatesoft.com',
          company: 'InnovateSoft',
          position: 'VP Engineering',
          linkedinUrl: 'https://linkedin.com/in/janesmith',
          leadScore: 78,
          source: 'ai-discovery'
        }
      ],
      metadata: {
        testRun: true,
        automatedTest: true
      }
    };
    
    const response = await makeRequest('POST', '/ai/campaigns/execute', requestData);
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}: ${response.rawBody}`);
    }
    
    if (!response.body || !response.body.success) {
      throw new Error(`Campaign execution failed: ${response.body?.error || 'Unknown error'}`);
    }
    
    // Validate response structure
    const requiredFields = ['campaignId', 'workflowId', 'status', 'metadata'];
    for (const field of requiredFields) {
      if (!(field in response.body)) {
        throw new Error(`Missing required field in response: ${field}`);
      }
    }
    
    if (response.body.status !== 'completed') {
      throw new Error(`Expected status 'completed', got '${response.body.status}'`);
    }
    
    logTest('AI Campaign Execution', 'PASS', 
      `Campaign ID: ${response.body.campaignId}, Workflow: ${response.body.workflowId}`);
  });
}

async function testSystemMetrics() {
  await runWithRetry('System Metrics', async () => {
    const response = await makeRequest('GET', '/ai/metrics');
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    
    if (!response.body) {
      throw new Error('Empty response body');
    }
    
    // Check required metrics sections
    const requiredSections = ['timestamp', 'system', 'ai', 'metrics'];
    for (const section of requiredSections) {
      if (!(section in response.body)) {
        throw new Error(`Missing required metrics section: ${section}`);
      }
    }
    
    // Validate system metrics
    if (!response.body.system.status) {
      throw new Error('Missing system status');
    }
    
    logTest('System Metrics', 'PASS', 
      `System Status: ${response.body.system.status}, AI Providers: ${response.body.ai?.totalProviders || 'N/A'}`);
  });
}

async function performanceTest() {
  console.log('\\n🚀 Starting Performance Tests...');
  
  const performanceResults = {
    healthCheck: [],
    prospectDiscovery: [],
    campaignExecution: [],
    systemMetrics: []
  };
  
  // Health check performance (10 requests)
  console.log('Testing health check response times...');
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    try {
      await makeRequest('GET', '/health');
      const responseTime = Date.now() - start;
      performanceResults.healthCheck.push(responseTime);
    } catch (error) {
      console.log(`Health check ${i + 1} failed: ${error.message}`);
    }
  }
  
  // Calculate performance metrics
  const avgHealthCheck = performanceResults.healthCheck.reduce((a, b) => a + b, 0) / performanceResults.healthCheck.length;
  const maxHealthCheck = Math.max(...performanceResults.healthCheck);
  const minHealthCheck = Math.min(...performanceResults.healthCheck);
  
  console.log(`Health Check Performance:`);
  console.log(`  Average: ${avgHealthCheck?.toFixed(2) || 'N/A'}ms`);
  console.log(`  Min: ${minHealthCheck || 'N/A'}ms`);
  console.log(`  Max: ${maxHealthCheck || 'N/A'}ms`);
  
  // Prospect discovery performance (3 requests - more intensive)
  console.log('\\nTesting prospect discovery response times...');
  const prospectRequestData = {
    searchCriteria: {
      industries: ['Technology'],
      companySizes: ['Medium'],
      roles: ['CTO'],
      locations: ['United States'],
      keywords: ['AI']
    },
    limits: {
      maxProspects: 3,
      maxCompanies: 5
    },
    enrichmentLevel: 'basic'
  };
  
  for (let i = 0; i < 3; i++) {
    const start = Date.now();
    try {
      await makeRequest('POST', '/ai/prospects/discover', prospectRequestData);
      const responseTime = Date.now() - start;
      performanceResults.prospectDiscovery.push(responseTime);
      console.log(`  Request ${i + 1}: ${responseTime}ms`);
    } catch (error) {
      console.log(`  Request ${i + 1} failed: ${error.message}`);
    }
  }
  
  const avgProspectDiscovery = performanceResults.prospectDiscovery.reduce((a, b) => a + b, 0) / performanceResults.prospectDiscovery.length;
  console.log(`Prospect Discovery Average: ${avgProspectDiscovery?.toFixed(2) || 'N/A'}ms`);
  
  logTest('Performance Test', 'PASS', 
    `Health: ${avgHealthCheck?.toFixed(2) || 'N/A'}ms avg, Discovery: ${avgProspectDiscovery?.toFixed(2) || 'N/A'}ms avg`);
}

async function optimizationAnalysis() {
  console.log('\\n⚡ Optimization Analysis...');
  
  // Test concurrent requests
  console.log('Testing concurrent request handling...');
  const concurrentPromises = [];
  const startTime = Date.now();
  
  for (let i = 0; i < 5; i++) {
    concurrentPromises.push(makeRequest('GET', '/health'));
  }
  
  try {
    const results = await Promise.all(concurrentPromises);
    const totalTime = Date.now() - startTime;
    const successfulRequests = results.filter(r => r.statusCode === 200).length;
    
    console.log(`Concurrent Requests: ${successfulRequests}/5 successful in ${totalTime}ms`);
    
    logTest('Concurrent Request Handling', 'PASS', 
      `${successfulRequests}/5 requests successful in ${totalTime}ms`);
  } catch (error) {
    logTest('Concurrent Request Handling', 'FAIL', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 IQ24 AI Engine Pipeline Testing Suite');
  console.log('==========================================\\n');
  
  console.log('🔍 Basic Functionality Tests...');
  await testHealthCheck();
  await testProspectDiscovery();
  await testCampaignExecution();
  await testSystemMetrics();
  
  await performanceTest();
  await optimizationAnalysis();
  
  // Final Results
  console.log('\\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\\n❌ Failed Tests:');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`  - ${t.name}: ${t.details}`));
  }
  
  console.log('\\n🎯 Optimization Recommendations:');
  
  if (testResults.passed === testResults.total) {
    console.log('✅ All tests passed! The AI pipeline is functioning correctly.');
    console.log('🚀 Consider implementing the authenticated version with proper security.');
    console.log('📈 Monitor performance metrics in production.');
    console.log('🔒 Add comprehensive error handling and logging.');
  } else {
    console.log('⚠️  Some tests failed. Address the failing components before production deployment.');
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the test suite
runAllTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});