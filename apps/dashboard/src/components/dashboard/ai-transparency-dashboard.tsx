"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@iq24/ui/card";
import { Badge } from "@iq24/ui/badge";
import { Button } from "@iq24/ui/button";
import { Progress } from "@iq24/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@iq24/ui/tabs";
import {
  Activity,
  Brain,
  Settings,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  Zap,
  BarChart3,
} from "lucide-react";
import { AIDecisionExplainer } from "@iq24/ui/ai-transparency/ai-decision-explainer";
import { AIControlPanel } from "@iq24/ui/ai-transparency/ai-control-panel";
import { AIActivityMonitor } from "@iq24/ui/ai-transparency/ai-activity-monitor";

interface CampaignInsight {
  id: string;
  type: "optimization" | "alert" | "recommendation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  timestamp: Date;
  aiAgent: string;
  confidence: number;
}

interface PerformanceMetric {
  name: string;
  current: number;
  previous: number;
  trend: "up" | "down" | "stable";
  aiContribution: number;
}

export function AITransparencyDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [realTimeInsights, setRealTimeInsights] = useState<CampaignInsight[]>(
    [],
  );
  const [performanceMetrics, setPerformanceMetrics] = useState<
    PerformanceMetric[]
  >([]);
  const [systemHealth, setSystemHealth] = useState({
    overall: 98.5,
    agents: {
      pda: 99,
      vea: 97,
      opa: 98,
      cea: 96,
      afla: 99,
      cgn: 100,
      crm: 95,
    },
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeInsights((prev) => [
        {
          id: Date.now().toString(),
          type:
            Math.random() > 0.7
              ? "alert"
              : Math.random() > 0.5
                ? "optimization"
                : "recommendation",
          title: `AI ${Math.random() > 0.5 ? "optimized campaign targeting" : "detected engagement pattern"}`,
          description: `${Math.random() > 0.5 ? "Increased" : "Improved"} performance by ${Math.floor(Math.random() * 30 + 10)}%`,
          impact:
            Math.random() > 0.6
              ? "high"
              : Math.random() > 0.3
                ? "medium"
                : "low",
          timestamp: new Date(),
          aiAgent: ["PDA", "OPA", "AFLA", "ALO"][Math.floor(Math.random() * 4)],
          confidence: Math.floor(Math.random() * 30 + 70),
        },
        ...prev.slice(0, 9),
      ]);
    }, 5000);

    // Initialize performance metrics
    setPerformanceMetrics([
      {
        name: "Email Open Rate",
        current: 24.8,
        previous: 21.3,
        trend: "up",
        aiContribution: 85,
      },
      {
        name: "Response Rate",
        current: 8.7,
        previous: 6.2,
        trend: "up",
        aiContribution: 92,
      },
      {
        name: "Meeting Conversion",
        current: 12.4,
        previous: 9.8,
        trend: "up",
        aiContribution: 78,
      },
      {
        name: "Lead Quality Score",
        current: 87.3,
        previous: 79.1,
        trend: "up",
        aiContribution: 95,
      },
    ]);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "optimization":
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Target className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AI Transparency Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete visibility and control over your AI-powered growth engine
        </p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <span className="font-medium">System Health</span>
              </div>
              <Badge
                variant={systemHealth.overall > 95 ? "default" : "secondary"}
              >
                {systemHealth.overall}%
              </Badge>
            </div>
            <Progress value={systemHealth.overall} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-500" />
                <span className="font-medium">Active Agents</span>
              </div>
              <Badge variant="default">7/7</Badge>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              All agents operational
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Active Campaigns</span>
              </div>
              <Badge variant="default">23</Badge>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              +3 from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Compliance</span>
              </div>
              <Badge variant="default">100%</Badge>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              All checks passed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="decisions"
            className="flex items-center space-x-2"
          >
            <Brain className="h-4 w-4" />
            <span>AI Decisions</span>
          </TabsTrigger>
          <TabsTrigger value="control" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Control Panel</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Live Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>AI-Enhanced Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {performanceMetrics.map((metric) => (
                  <div key={metric.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{metric.name}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="text-2xl font-bold">{metric.current}%</div>
                    <div className="text-sm text-muted-foreground">
                      vs {metric.previous}% previous
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="text-xs text-muted-foreground">
                        AI Impact:
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {metric.aiContribution}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Real-time AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realTimeInsights.slice(0, 5).map((insight) => (
                  <div
                    key={insight.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg"
                  >
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">
                          {insight.title}
                        </span>
                        <Badge
                          variant={
                            insight.impact === "high" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {insight.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Agent: {insight.aiAgent}</span>
                        <span>Confidence: {insight.confidence}%</span>
                        <span>{insight.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agent Health Status */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(systemHealth.agents).map(([agent, health]) => (
                  <div key={agent} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium uppercase">
                        {agent}
                      </span>
                      <Badge variant={health > 95 ? "default" : "secondary"}>
                        {health}%
                      </Badge>
                    </div>
                    <Progress value={health} className="h-2" />
                    <div className="mt-1 text-xs text-muted-foreground">
                      {health > 95
                        ? "Optimal"
                        : health > 90
                          ? "Good"
                          : "Needs attention"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions">
          <AIDecisionExplainer />
        </TabsContent>

        <TabsContent value="control">
          <AIControlPanel />
        </TabsContent>

        <TabsContent value="activity">
          <AIActivityMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
