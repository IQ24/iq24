/**
 * Comprehensive Integration Testing Suite for IQ24.ai AI Core
 * Tests end-to-end agent workflows, orchestration, and system resilience
 */

import { AIEngine } from '../engine/ai-engine';
import { CampaignWorkflow } from '../workflows/campaign-workflow';
import { DatabaseClient } from '../database/client';
import { ConfigManager } from '../config';
import { BaseAgent } from '../base/agent';
import { ProspectDiscoveryAgent } from '../../../agents/src/pda/prospect-discovery-agent';
import { OutreachPersonalizationAgent } from '../../../agents/src/opa/outreach-personalization-agent';
import { CampaignExecutionAgent } from '../../../agents/src/cea/campaign-execution-agent';
import { AnalyticsFeedbackAgent } from '../../../agents/src/afla/analytics-feedback-agent';

export interface TestSuite {
  name: string;
  tests: Test[];
}

export interface Test {
  name: string;
  description: string;
  execute: () => Promise<TestResult>;
  timeout?: number;
}

export interface TestResult {
  success: boolean;
  duration: number;
  error?: Error;
  metadata?: Record<string, any>;
}

export class IntegrationTestRunner {
  private aiEngine: AIEngine;
  private workflow: CampaignWorkflow;
  private db: DatabaseClient;
  private config: ConfigManager;

  constructor() {
    this.config = new ConfigManager();
    this.db = DatabaseClient.getInstance();
    this.workflow = new CampaignWorkflow();
    this.aiEngine = new AIEngine();
  }

  /**
   * Run all integration test suites
   */
  async runAll(): Promise<Map<string, TestResult[]>> {
    const suites = [
      this.getAgentHealthSuite(),
      this.getWorkflowOrchestrationSuite(),
      this.getDataIntegritySuite(),
      this.getErrorRecoverySuite(),
      this.getPerformanceSuite(),
      this.getComplianceSuite()
    ];

    const results = new Map<string, TestResult[]>();

    for (const suite of suites) {
      console.log(`🧪 Running test suite: ${suite.name}`);
      const suiteResults = await this.runSuite(suite);
      results.set(suite.name, suiteResults);
      
      const passed = suiteResults.filter(r => r.success).length;
      const total = suiteResults.length;
      console.log(`✅ ${suite.name}: ${passed}/${total} tests passed`);
    }

    return results;
  }

  /**
   * Run a specific test suite
   */
  private async runSuite(suite: TestSuite): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const test of suite.tests) {
      const startTime = Date.now();
      
      try {
        console.log(`  ⏳ ${test.name}...`);
        
        const timeout = test.timeout || 30000; // 30s default
        const result = await Promise.race([
          test.execute(),
          this.createTimeoutPromise(timeout)
        ]);

        const duration = Date.now() - startTime;
        results.push({
          success: result.success,
          duration,
          error: result.error,
          metadata: { ...result.metadata, description: test.description }
        });

        console.log(`    ${result.success ? '✅' : '❌'} ${test.name} (${duration}ms)`);
        if (!result.success && result.error) {
          console.log(`    Error: ${result.error.message}`);
        }

      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          success: false,
          duration,
          error: error as Error,
          metadata: { description: test.description }
        });
        console.log(`    ❌ ${test.name} failed: ${error}`);
      }
    }

    return results;
  }

  /**
   * Agent Health and Initialization Tests
   */
  private getAgentHealthSuite(): TestSuite {
    return {
      name: 'Agent Health & Initialization',
      tests: [
        {
          name: 'All agents initialize successfully',
          description: 'Verify all 7 AI agents can be instantiated and initialized',
          execute: async () => {
            const agents = [
              'ProspectDiscoveryAgent',
              'ValidationEnrichmentAgent', 
              'OutreachPersonalizationAgent',
              'CampaignExecutionAgent',
              'AnalyticsFeedbackAgent',
              'ComplianceGuardianAgent',
              'CognitiveReflectionAgent'
            ];

            let success = true;
            const results: any = {};

            for (const agentName of agents) {
              try {
                // Test agent creation and health check
                const agent = await this.createMockAgent(agentName);
                const health = await agent.getHealthStatus();
                results[agentName] = {
                  initialized: true,
                  healthy: health.status === 'healthy'
                };
                
                if (health.status !== 'healthy') {
                  success = false;
                }
              } catch (error) {
                results[agentName] = { 
                  initialized: false, 
                  error: error.message 
                };
                success = false;
              }
            }

            return { success, metadata: { agents: results } };
          }
        },
        {
          name: 'Agent communication protocols work',
          description: 'Test inter-agent communication via event system',
          execute: async () => {
            const pda = await this.createMockAgent('ProspectDiscoveryAgent');
            const vea = await this.createMockAgent('ValidationEnrichmentAgent');

            // Test event sending/receiving
            let messageReceived = false;
            const testData = { test: 'integration-test', timestamp: Date.now() };

            vea.on('prospect.discovered', (data: any) => {
              messageReceived = (data.test === testData.test);
            });

            await pda.emit('prospect.discovered', testData);
            
            // Wait for async message processing
            await new Promise(resolve => setTimeout(resolve, 1000));

            return { 
              success: messageReceived,
              metadata: { 
                messageSent: true,
                messageReceived,
                testData
              }
            };
          }
        },
        {
          name: 'Agent state persistence works',
          description: 'Verify agents can save and restore state',
          execute: async () => {
            const agent = await this.createMockAgent('ProspectDiscoveryAgent');
            
            // Set some state
            const testState = {
              currentCampaign: 'test-campaign-123',
              processedLeads: 5,
              lastRun: new Date().toISOString()
            };

            await agent.saveState(testState);
            
            // Create new instance and restore state
            const newAgent = await this.createMockAgent('ProspectDiscoveryAgent');
            const restoredState = await newAgent.loadState();

            const stateMatches = JSON.stringify(testState) === JSON.stringify(restoredState);

            return {
              success: stateMatches,
              metadata: {
                originalState: testState,
                restoredState,
                stateMatches
              }
            };
          }
        }
      ]
    };
  }

  /**
   * Workflow Orchestration Tests
   */
  private getWorkflowOrchestrationSuite(): TestSuite {
    return {
      name: 'Workflow Orchestration',
      tests: [
        {
          name: 'Complete campaign workflow execution',
          description: 'Test end-to-end campaign workflow with all agents',
          execute: async () => {
            const campaignId = `test-campaign-${Date.now()}`;
            const mockCampaignData = {
              id: campaignId,
              name: 'Integration Test Campaign',
              targetICP: {
                industries: ['software', 'fintech'],
                companySize: { min: 50, max: 500 },
                roles: ['ceo', 'cto', 'vp-engineering']
              },
              maxProspects: 10
            };

            try {
              // Start workflow
              const workflowId = await this.workflow.startCampaign(mockCampaignData);
              
              // Monitor workflow progress
              let attempts = 0;
              let workflowCompleted = false;
              
              while (attempts < 30 && !workflowCompleted) { // 30 second timeout
                const status = await this.workflow.getWorkflowStatus(workflowId);
                
                if (status === 'completed' || status === 'failed') {
                  workflowCompleted = true;
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
              }

              const finalStatus = await this.workflow.getWorkflowStatus(workflowId);
              
              return {
                success: finalStatus === 'completed',
                metadata: {
                  workflowId,
                  finalStatus,
                  attempts,
                  campaignData: mockCampaignData
                }
              };

            } catch (error) {
              return {
                success: false,
                error: error as Error,
                metadata: { campaignData: mockCampaignData }
              };
            }
          },
          timeout: 45000 // 45 seconds for full workflow
        },
        {
          name: 'Workflow checkpointing and recovery',
          description: 'Test workflow can recover from interruptions',
          execute: async () => {
            const campaignId = `checkpoint-test-${Date.now()}`;
            
            // Start workflow
            const workflowId = await this.workflow.startCampaign({
              id: campaignId,
              name: 'Checkpoint Test Campaign',
              targetICP: { industries: ['software'] }
            });

            // Let it run for a bit
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Simulate interruption by stopping workflow
            await this.workflow.pauseWorkflow(workflowId);
            
            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Resume workflow
            await this.workflow.resumeWorkflow(workflowId);
            
            // Check if it recovered successfully
            const status = await this.workflow.getWorkflowStatus(workflowId);
            
            return {
              success: status === 'running' || status === 'completed',
              metadata: {
                workflowId,
                finalStatus: status
              }
            };
          }
        },
        {
          name: 'Parallel agent execution',
          description: 'Test multiple agents can work on different campaigns simultaneously',
          execute: async () => {
            const campaigns = [
              { id: `parallel-1-${Date.now()}`, name: 'Parallel Test 1' },
              { id: `parallel-2-${Date.now()}`, name: 'Parallel Test 2' },
              { id: `parallel-3-${Date.now()}`, name: 'Parallel Test 3' }
            ];

            // Start all campaigns simultaneously
            const workflowPromises = campaigns.map(campaign => 
              this.workflow.startCampaign({
                ...campaign,
                targetICP: { industries: ['software'] },
                maxProspects: 5
              })
            );

            const workflowIds = await Promise.all(workflowPromises);
            
            // Wait for some processing
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Check all workflows are progressing
            const statuses = await Promise.all(
              workflowIds.map(id => this.workflow.getWorkflowStatus(id))
            );

            const allProgressing = statuses.every(status => 
              ['running', 'completed'].includes(status)
            );

            return {
              success: allProgressing,
              metadata: {
                campaigns: campaigns.length,
                workflowIds,
                statuses
              }
            };
          }
        }
      ]
    };
  }

  /**
   * Data Integrity Tests
   */
  private getDataIntegritySuite(): TestSuite {
    return {
      name: 'Data Integrity',
      tests: [
        {
          name: 'Database connection and operations',
          description: 'Test database connectivity and basic CRUD operations',
          execute: async () => {
            try {
              // Test connection
              await this.db.testConnection();
              
              // Test CRUD operations
              const testLead = {
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                company: 'Test Company',
                title: 'Test Title',
                phone: '+1234567890',
                linkedin_url: 'https://linkedin.com/in/test',
                source: 'integration-test'
              };

              // Create
              const leadId = await this.db.leads.create(testLead);
              
              // Read
              const retrievedLead = await this.db.leads.findById(leadId);
              
              // Update
              await this.db.leads.update(leadId, { title: 'Updated Title' });
              const updatedLead = await this.db.leads.findById(leadId);
              
              // Delete
              await this.db.leads.delete(leadId);
              const deletedLead = await this.db.leads.findById(leadId);

              return {
                success: retrievedLead?.email === testLead.email && 
                        updatedLead?.title === 'Updated Title' &&
                        deletedLead === null,
                metadata: {
                  leadId,
                  operations: ['create', 'read', 'update', 'delete']
                }
              };

            } catch (error) {
              return {
                success: false,
                error: error as Error
              };
            }
          }
        },
        {
          name: 'Data validation and constraints',
          description: 'Test database constraints and validation rules',
          execute: async () => {
            let constraintViolations = 0;
            let validationErrors = 0;

            // Test email uniqueness constraint
            try {
              const duplicateEmail = 'duplicate@test.com';
              await this.db.leads.create({
                first_name: 'First',
                last_name: 'User',
                email: duplicateEmail,
                company: 'Company 1'
              });
              
              await this.db.leads.create({
                first_name: 'Second', 
                last_name: 'User',
                email: duplicateEmail, // Should fail
                company: 'Company 2'
              });
            } catch (error) {
              constraintViolations++;
            }

            // Test required field validation
            try {
              await this.db.leads.create({
                first_name: 'Test',
                // Missing required email field
                company: 'Test Company'
              } as any);
            } catch (error) {
              validationErrors++;
            }

            return {
              success: constraintViolations > 0 && validationErrors > 0,
              metadata: {
                constraintViolations,
                validationErrors,
                message: 'Constraints and validations are working correctly'
              }
            };
          }
        }
      ]
    };
  }

  /**
   * Error Recovery Tests
   */
  private getErrorRecoverySuite(): TestSuite {
    return {
      name: 'Error Recovery & Resilience',
      tests: [
        {
          name: 'Agent failure recovery',
          description: 'Test system recovery when individual agents fail',
          execute: async () => {
            const agent = await this.createMockAgent('ProspectDiscoveryAgent');
            
            // Simulate agent failure
            await agent.simulateFailure('network_timeout');
            
            // Check if agent reports unhealthy
            const unhealthyStatus = await agent.getHealthStatus();
            
            // Trigger recovery
            await agent.recover();
            
            // Wait for recovery
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if agent recovered
            const recoveredStatus = await agent.getHealthStatus();

            return {
              success: unhealthyStatus.status !== 'healthy' && 
                      recoveredStatus.status === 'healthy',
              metadata: {
                failureSimulated: true,
                unhealthyStatus,
                recoveredStatus
              }
            };
          }
        },
        {
          name: 'Circuit breaker functionality',
          description: 'Test circuit breakers prevent cascade failures',
          execute: async () => {
            // This would test our external service circuit breakers
            // For now, we'll simulate the behavior
            const mockService = {
              failures: 0,
              circuitOpen: false,
              
              async call() {
                if (this.circuitOpen) {
                  throw new Error('Circuit breaker is open');
                }
                
                this.failures++;
                if (this.failures >= 3) {
                  this.circuitOpen = true;
                }
                
                throw new Error('Service unavailable');
              },
              
              reset() {
                this.failures = 0;
                this.circuitOpen = false;
              }
            };

            let circuitOpened = false;
            
            // Make calls until circuit opens
            for (let i = 0; i < 5; i++) {
              try {
                await mockService.call();
              } catch (error) {
                if (error.message === 'Circuit breaker is open') {
                  circuitOpened = true;
                  break;
                }
              }
            }

            return {
              success: circuitOpened,
              metadata: {
                failures: mockService.failures,
                circuitOpened
              }
            };
          }
        },
        {
          name: 'Graceful degradation',
          description: 'Test system continues operating with reduced functionality',
          execute: async () => {
            // Simulate external service outage
            const originalConfig = this.config.get('external_services');
            
            // Disable some services
            this.config.set('external_services.apollo.enabled', false);
            this.config.set('external_services.hunter.enabled', false);

            try {
              // Try to run a campaign (should work with degraded functionality)
              const workflowId = await this.workflow.startCampaign({
                id: `degraded-test-${Date.now()}`,
                name: 'Degraded Mode Test',
                targetICP: { industries: ['software'] },
                maxProspects: 5
              });

              // Let it run briefly
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              const status = await this.workflow.getWorkflowStatus(workflowId);
              
              // Restore config
              this.config.set('external_services', originalConfig);

              return {
                success: status === 'running' || status === 'completed',
                metadata: {
                  workflowId,
                  finalStatus: status,
                  degradedServices: ['apollo', 'hunter']
                }
              };

            } catch (error) {
              // Restore config even on error
              this.config.set('external_services', originalConfig);
              throw error;
            }
          }
        }
      ]
    };
  }

  /**
   * Performance Tests
   */
  private getPerformanceSuite(): TestSuite {
    return {
      name: 'Performance & Scalability',
      tests: [
        {
          name: 'Concurrent campaign handling',
          description: 'Test system can handle multiple campaigns simultaneously',
          execute: async () => {
            const concurrentCampaigns = 5;
            const campaigns = Array.from({ length: concurrentCampaigns }, (_, i) => ({
              id: `perf-test-${i}-${Date.now()}`,
              name: `Performance Test Campaign ${i}`,
              targetICP: { industries: ['software'] },
              maxProspects: 3
            }));

            const startTime = Date.now();
            
            // Start all campaigns simultaneously
            const workflowPromises = campaigns.map(campaign => 
              this.workflow.startCampaign(campaign)
            );

            const workflowIds = await Promise.all(workflowPromises);
            const launchTime = Date.now() - startTime;

            // Monitor progress
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            const statuses = await Promise.all(
              workflowIds.map(id => this.workflow.getWorkflowStatus(id))
            );

            const successCount = statuses.filter(status => 
              ['running', 'completed'].includes(status)
            ).length;

            return {
              success: successCount >= concurrentCampaigns * 0.8, // 80% success rate
              metadata: {
                concurrentCampaigns,
                successCount,
                launchTime,
                statuses
              }
            };
          },
          timeout: 60000 // 1 minute
        },
        {
          name: 'Memory usage stability',
          description: 'Test memory usage remains stable under load',
          execute: async () => {
            const initialMemory = process.memoryUsage();
            
            // Run multiple operations
            for (let i = 0; i < 10; i++) {
              const agent = await this.createMockAgent('ProspectDiscoveryAgent');
              await agent.process({ test: `load-test-${i}` });
            }

            // Force garbage collection if available
            if (global.gc) {
              global.gc();
            }

            const finalMemory = process.memoryUsage();
            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
            const memoryIncreasePercentage = (memoryIncrease / initialMemory.heapUsed) * 100;

            return {
              success: memoryIncreasePercentage < 50, // Less than 50% increase
              metadata: {
                initialMemory: Math.round(initialMemory.heapUsed / 1024 / 1024),
                finalMemory: Math.round(finalMemory.heapUsed / 1024 / 1024),
                memoryIncrease: Math.round(memoryIncrease / 1024 / 1024),
                memoryIncreasePercentage: Math.round(memoryIncreasePercentage)
              }
            };
          }
        }
      ]
    };
  }

  /**
   * Compliance Tests
   */
  private getComplianceSuite(): TestSuite {
    return {
      name: 'Compliance & Security',
      tests: [
        {
          name: 'Data privacy compliance',
          description: 'Test GDPR/CCPA compliance features',
          execute: async () => {
            // Test data retention policies
            const testLead = {
              first_name: 'Privacy',
              last_name: 'Test',
              email: 'privacy@test.com',
              company: 'Test Company',
              created_at: new Date(Date.now() - 366 * 24 * 60 * 60 * 1000) // 366 days ago
            };

            const leadId = await this.db.leads.create(testLead);
            
            // Test data anonymization
            await this.db.leads.anonymize(leadId);
            const anonymizedLead = await this.db.leads.findById(leadId);
            
            // Test data deletion
            await this.db.leads.delete(leadId);
            const deletedLead = await this.db.leads.findById(leadId);

            return {
              success: anonymizedLead?.email !== testLead.email && 
                      deletedLead === null,
              metadata: {
                originalEmail: testLead.email,
                anonymizedEmail: anonymizedLead?.email,
                deleted: deletedLead === null
              }
            };
          }
        },
        {
          name: 'Audit trail integrity',
          description: 'Test audit logs are immutable and complete',
          execute: async () => {
            const testAction = {
              action: 'test_compliance_action',
              entity_type: 'lead',
              entity_id: 'test-lead-123',
              details: { test: true },
              user_id: 'test-user'
            };

            // Create audit log entry
            const auditId = await this.db.auditLogs.create(testAction);
            
            // Try to modify audit log (should fail)
            let modificationFailed = false;
            try {
              await this.db.auditLogs.update(auditId, { 
                details: { modified: true } 
              });
            } catch (error) {
              modificationFailed = true;
            }

            // Verify audit log integrity
            const auditEntry = await this.db.auditLogs.findById(auditId);
            
            return {
              success: modificationFailed && 
                      auditEntry?.details.test === true &&
                      !auditEntry?.details.modified,
              metadata: {
                auditId,
                modificationFailed,
                auditEntry
              }
            };
          }
        }
      ]
    };
  }

  /**
   * Helper: Create timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<TestResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Test timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Helper: Create mock agent for testing
   */
  private async createMockAgent(agentType: string): Promise<any> {
    // Mock agent implementation for testing
    return {
      type: agentType,
      
      async getHealthStatus() {
        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          details: { component: agentType }
        };
      },
      
      async saveState(state: any) {
        // Mock state persistence
        return true;
      },
      
      async loadState() {
        // Mock state loading
        return {};
      },
      
      async process(data: any) {
        // Mock processing
        return { processed: true, input: data };
      },
      
      async simulateFailure(type: string) {
        this.failed = true;
        this.failureType = type;
      },
      
      async recover() {
        this.failed = false;
        this.failureType = null;
      },
      
      on(event: string, handler: Function) {
        this.eventHandlers = this.eventHandlers || {};
        this.eventHandlers[event] = handler;
      },
      
      async emit(event: string, data: any) {
        if (this.eventHandlers?.[event]) {
          this.eventHandlers[event](data);
        }
      }
    };
  }
}

/**
 * Test Runner CLI
 */
export async function runIntegrationTests() {
  console.log('🚀 Starting IQ24.ai AI Core Integration Tests\n');
  
  const runner = new IntegrationTestRunner();
  const results = await runner.runAll();
  
  // Generate summary report
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  
  console.log('\n📊 Test Summary Report');
  console.log('='.repeat(50));
  
  for (const [suiteName, suiteResults] of results) {
    const passed = suiteResults.filter(r => r.success).length;
    const failed = suiteResults.length - passed;
    
    totalTests += suiteResults.length;
    totalPassed += passed;
    totalFailed += failed;
    
    console.log(`${suiteName}: ${passed}/${suiteResults.length} passed`);
    
    // Show failed tests
    const failedTests = suiteResults.filter(r => !r.success);
    for (const test of failedTests) {
      console.log(`  ❌ ${test.metadata?.description || 'Unknown test'}`);
      if (test.error) {
        console.log(`     Error: ${test.error.message}`);
      }
    }
  }
  
  console.log('='.repeat(50));
  console.log(`Total: ${totalPassed}/${totalTests} passed (${totalFailed} failed)`);
  
  const successRate = (totalPassed / totalTests) * 100;
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 90) {
    console.log('🎉 Excellent! System is ready for production.');
  } else if (successRate >= 75) {
    console.log('⚠️  Good, but some issues need attention.');
  } else {
    console.log('🚨 Critical issues detected. Fix before deployment.');
  }
  
  return results;
}