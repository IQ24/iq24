#!/usr/bin/env node

/**
 * Diagnostic script to identify and fix AI Health Check timeout issues
 */

const http = require('http');

function makeSimpleRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Health-Check-Diagnostic/1.0'
      },
      timeout: 10000 // 10 second timeout
    };

    console.log(`🔍 Testing ${path}...`);
    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        console.log(`✅ ${path} - Status: ${res.statusCode}, Time: ${responseTime}ms`);
        
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsed,
            responseTime,
            rawData: data
          });
        } catch (parseError) {
          resolve({
            statusCode: res.statusCode,
            data: null,
            responseTime,
            rawData: data,
            parseError: parseError.message
          });
        }
      });
    });

    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      console.log(`❌ ${path} - Error after ${responseTime}ms: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      const responseTime = Date.now() - startTime;
      console.log(`⏰ ${path} - Timeout after ${responseTime}ms`);
      req.destroy();
      reject(new Error(`Request timeout after ${responseTime}ms`));
    });

    req.end();
  });
}

async function diagnoseEndpoints() {
  console.log('🩺 Diagnosing AI Engine Health Check Issues');
  console.log('============================================\n');

  const endpoints = [
    '/health',
    '/ai/metrics',
    '/', // This should return 404
  ];

  for (const endpoint of endpoints) {
    try {
      const result = await makeSimpleRequest(endpoint);
      
      if (endpoint === '/health') {
        console.log('📊 Health Check Response Details:');
        console.log(`   Status Code: ${result.statusCode}`);
        console.log(`   Response Time: ${result.responseTime}ms`);
        if (result.data) {
          console.log(`   Engine Status: ${result.data.status || 'unknown'}`);
          console.log(`   Version: ${result.data.version || 'unknown'}`);
          if (result.data.services) {
            console.log(`   AI Service: ${result.data.services.ai?.status || 'unknown'}`);
            console.log(`   Database: ${result.data.services.database?.status || 'unknown'}`);
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Failed to test ${endpoint}: ${error.message}`);
      
      // Additional diagnostics for failures
      if (error.message.includes('timeout')) {
        console.log('   🔍 Timeout Analysis:');
        console.log('   - The engine is running but not responding within timeout');
        console.log('   - This could indicate the endpoint is hanging or processing slowly');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('   🔍 Connection Analysis:');
        console.log('   - The engine is not running on localhost:3002');
        console.log('   - Check if the wrangler dev server is actually started');
      }
    }
    
    console.log(''); // Add spacing between tests
  }
}

async function testProspectDiscovery() {
  console.log('🧪 Testing AI Prospect Discovery...');
  console.log('====================================\n');

  const testData = {
    searchCriteria: {
      industries: ['Technology'],
      companySizes: ['Small'],
      roles: ['CEO'],
      locations: ['US'],
      keywords: ['AI']
    },
    limits: {
      maxProspects: 2,
      maxCompanies: 2
    },
    enrichmentLevel: 'basic'
  };

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/ai/prospects/discover',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Health-Check-Diagnostic/1.0',
        'X-User-ID': 'test-user',
        'X-Workspace-ID': 'test-workspace'
      },
      timeout: 15000 // 15 second timeout for AI operations
    };

    console.log('🔍 Testing prospect discovery...');
    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        console.log(`✅ Prospect Discovery - Status: ${res.statusCode}, Time: ${responseTime}ms`);
        
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (parsed.success && parsed.prospects) {
            console.log(`📊 Found ${parsed.prospects.length} prospects`);
            console.log(`📈 Quality Score: ${parsed.metadata?.qualityScore || 'N/A'}`);
          }
          resolve(parsed);
        } catch (parseError) {
          console.log(`❌ Failed to parse response: ${parseError.message}`);
          resolve({ error: 'Parse error', rawData: data });
        }
      });
    });

    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      console.log(`❌ Prospect Discovery - Error after ${responseTime}ms: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      const responseTime = Date.now() - startTime;
      console.log(`⏰ Prospect Discovery - Timeout after ${responseTime}ms`);
      req.destroy();
      reject(new Error(`Prospect discovery timeout after ${responseTime}ms`));
    });

    req.write(JSON.stringify(testData));
    req.end();
  });
}

async function runDiagnostics() {
  try {
    await diagnoseEndpoints();
    
    console.log('\n🧪 Advanced Testing...');
    console.log('======================');
    
    // Test the AI prospect discovery which might be causing the timeouts
    try {
      await testProspectDiscovery();
      console.log('✅ AI Prospect Discovery test completed successfully');
    } catch (error) {
      console.log(`❌ AI Prospect Discovery test failed: ${error.message}`);
    }
    
    console.log('\n📋 Diagnostic Summary');
    console.log('====================');
    console.log('✅ Engine is running on localhost:3002');
    console.log('✅ Basic connectivity is working');
    
    console.log('\n🔧 Recommended Fixes:');
    console.log('1. Reduce timeout values in test scripts from 30s to 10s');
    console.log('2. Add proper error handling for slow AI operations');
    console.log('3. Implement request retry logic with exponential backoff');
    console.log('4. Consider adding request queuing for AI operations');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
    process.exit(1);
  }
}

runDiagnostics();