"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Badge } from '../badge';
import { Button } from '../button';
import { Progress } from '../progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { Input } from '../input';
import { Textarea } from '../textarea';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  ThumbsUp, 
  ThumbsDown,
  MessageCircle,
  BarChart3,
  Activity,
  Lightbulb,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface FeedbackMetric {
  id: string;
  agentType: string;
  metricName: string;
  currentValue: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  improvementRate: number;
  feedbackCount: number;
  lastUpdated: Date;
}

interface UserFeedback {
  id: string;
  type: 'positive' | 'negative' | 'suggestion';
  agentType: string;
  category: string;
  description: string;
  userRole: string;
  timestamp: Date;
  aiResponse?: string;
  status: 'new' | 'reviewed' | 'implemented' | 'dismissed';
  impact?: 'high' | 'medium' | 'low';
}

interface LearningInsight {
  id: string;
  title: string;
  description: string;
  agentType: string;
  confidenceImprovement: number;
  accuracyImprovement: number;
  implementedAt: Date;
  feedbackSource: string;
}

const mockMetrics: FeedbackMetric[] = [
  {
    id: '1',
    agentType: 'PDA',
    metricName: 'Lead Quality Score',
    currentValue: 87.3,
    previousValue: 82.1,
    trend: 'up',
    improvementRate: 6.3,
    feedbackCount: 245,
    lastUpdated: new Date()
  },
  {
    id: '2',
    agentType: 'OPA',
    metricName: 'Message Personalization',
    currentValue: 91.7,
    previousValue: 89.2,
    trend: 'up',
    improvementRate: 2.8,
    feedbackCount: 189,
    lastUpdated: new Date()
  },
  {
    id: '3',
    agentType: 'AFLA',
    metricName: 'Prediction Accuracy',
    currentValue: 84.5,
    previousValue: 86.1,
    trend: 'down',
    improvementRate: -1.9,
    feedbackCount: 156,
    lastUpdated: new Date()
  },
  {
    id: '4',
    agentType: 'CEA',
    metricName: 'Campaign Effectiveness',
    currentValue: 78.9,
    previousValue: 78.9,
    trend: 'stable',
    improvementRate: 0,
    feedbackCount: 203,
    lastUpdated: new Date()
  }
];

const mockFeedback: UserFeedback[] = [
  {
    id: '1',
    type: 'positive',
    agentType: 'OPA',
    category: 'Personalization',
    description: 'The AI did an excellent job personalizing the email based on the prospect\'s recent LinkedIn activity.',
    userRole: 'Sales Rep',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'reviewed',
    impact: 'high'
  },
  {
    id: '2',
    type: 'negative',
    agentType: 'PDA',
    category: 'Lead Scoring',
    description: 'The AI scored this lead as low priority, but they turned out to be a qualified buyer.',
    userRole: 'Account Executive',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'new',
    impact: 'medium'
  },
  {
    id: '3',
    type: 'suggestion',
    agentType: 'AFLA',
    category: 'Analytics',
    description: 'Could we add industry-specific benchmarks to the performance reports?',
    userRole: 'Marketing Manager',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    status: 'reviewed',
    impact: 'medium'
  }
];

const mockInsights: LearningInsight[] = [
  {
    id: '1',
    title: 'Improved LinkedIn Activity Detection',
    description: 'Enhanced personalization by better detecting recent prospect activities on LinkedIn',
    agentType: 'OPA',
    confidenceImprovement: 12.5,
    accuracyImprovement: 8.3,
    implementedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    feedbackSource: 'User feedback analysis'
  },
  {
    id: '2',
    title: 'Refined Lead Scoring Algorithm',
    description: 'Adjusted weights for company size and engagement metrics based on conversion data',
    agentType: 'PDA',
    confidenceImprovement: 9.7,
    accuracyImprovement: 15.2,
    implementedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    feedbackSource: 'Performance analytics'
  }
];

export function AIFeedbackLearning() {
  const [metrics, setMetrics] = useState<FeedbackMetric[]>(mockMetrics);
  const [feedback, setFeedback] = useState<UserFeedback[]>(mockFeedback);
  const [insights, setInsights] = useState<LearningInsight[]>(mockInsights);
  const [newFeedback, setNewFeedback] = useState({
    type: 'positive' as 'positive' | 'negative' | 'suggestion',
    agentType: 'PDA',
    category: '',
    description: ''
  });
  const [activeTab, setActiveTab] = useState('overview');

  const getTrendIcon = (trend: string, value: number) => {
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'positive': return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default: return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleSubmitFeedback = () => {
    if (newFeedback.description.trim()) {
      const feedback: UserFeedback = {
        id: Date.now().toString(),
        ...newFeedback,
        userRole: 'Current User',
        timestamp: new Date(),
        status: 'new'
      };
      setFeedback(prev => [feedback, ...prev]);
      setNewFeedback({
        type: 'positive',
        agentType: 'PDA',
        category: '',
        description: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Learning & Feedback</h2>
        <p className="text-muted-foreground">
          Monitor AI performance improvements and provide feedback to enhance system capabilities
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
          <TabsTrigger value="insights">Learning Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">AI Accuracy</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">87.4%</div>
                    <div className="text-xs text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3" />
                      +2.8%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <span className="font-medium">User Satisfaction</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">92.1%</div>
                    <div className="text-xs text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3" />
                      +1.2%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Feedback Volume</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-xs text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3" />
                      +15.3%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Improvements</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">23</div>
                    <div className="text-xs text-muted-foreground">This month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Learning Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Recent Learning Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{insight.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="secondary">{insight.agentType}</Badge>
                        <div className="text-sm text-muted-foreground">
                          +{insight.accuracyImprovement}% accuracy
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {insight.implementedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agent Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric) => (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{metric.agentType}</Badge>
                      {getTrendIcon(metric.trend, metric.improvementRate)}
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">{metric.metricName}</div>
                      <div className="text-2xl font-bold">{metric.currentValue}%</div>
                      <div className="text-sm text-muted-foreground">
                        {metric.improvementRate > 0 ? '+' : ''}{metric.improvementRate}% from last period
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {metric.feedbackCount} feedback points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {metrics.map((metric) => (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{metric.metricName}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{metric.agentType}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Last updated: {metric.lastUpdated.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{metric.currentValue}%</div>
                        <div className={`text-sm flex items-center justify-end ${
                          metric.trend === 'up' ? 'text-green-500' : 
                          metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {getTrendIcon(metric.trend, metric.improvementRate)}
                          {metric.improvementRate > 0 ? '+' : ''}{metric.improvementRate}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Current Value</div>
                        <Progress value={metric.currentValue} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Previous Value</div>
                        <Progress value={metric.previousValue} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Feedback Points</div>
                        <div className="text-lg font-semibold mt-1">{metric.feedbackCount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {/* Submit New Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Feedback Type</label>
                  <select 
                    value={newFeedback.type}
                    onChange={(e) => setNewFeedback({...newFeedback, type: e.target.value as any})}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="suggestion">Suggestion</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">AI Agent</label>
                  <select 
                    value={newFeedback.agentType}
                    onChange={(e) => setNewFeedback({...newFeedback, agentType: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="PDA">PDA - Prospect Discovery</option>
                    <option value="VEA">VEA - Validation & Enrichment</option>
                    <option value="OPA">OPA - Outreach Personalization</option>
                    <option value="CEA">CEA - Campaign Execution</option>
                    <option value="AFLA">AFLA - Analytics & Feedback</option>
                    <option value="CGN">CGN - Compliance Guardian</option>
                    <option value="ALO">ALO - Orchestration</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={newFeedback.category}
                    onChange={(e) => setNewFeedback({...newFeedback, category: e.target.value})}
                    placeholder="e.g., Personalization, Lead Scoring"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newFeedback.description}
                  onChange={(e) => setNewFeedback({...newFeedback, description: e.target.value})}
                  placeholder="Describe your feedback in detail..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <Button onClick={handleSubmitFeedback} className="w-full">
                Submit Feedback
              </Button>
            </CardContent>
          </Card>

          {/* Feedback History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getFeedbackIcon(item.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline">{item.agentType}</Badge>
                            <Badge variant="secondary">{item.category}</Badge>
                            <span className="text-sm text-muted-foreground">
                              by {item.userRole}
                            </span>
                          </div>
                          <p className="text-sm">{item.description}</p>
                          <div className="text-xs text-muted-foreground mt-2">
                            {item.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={item.status === 'implemented' ? 'default' : 'secondary'}
                        >
                          {item.status}
                        </Badge>
                        {item.impact && (
                          <Badge 
                            variant={item.impact === 'high' ? 'default' : 'secondary'}
                          >
                            {item.impact} impact
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Insights & Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{insight.title}</h3>
                        <p className="text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                      <Badge variant="outline">{insight.agentType}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Confidence Improvement</div>
                        <div className="text-xl font-bold text-green-600">
                          +{insight.confidenceImprovement}%
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Accuracy Improvement</div>
                        <div className="text-xl font-bold text-blue-600">
                          +{insight.accuracyImprovement}%
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Implemented</div>
                        <div className="text-sm font-medium">
                          {insight.implementedAt.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Source: {insight.feedbackSource}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}