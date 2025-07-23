"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@iq24/ui/card";
import { Badge } from "@iq24/ui/badge";
import { Button } from "@iq24/ui/button";
import { Progress } from "@iq24/ui/progress";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Users,
  MousePointer,
  DollarSign,
  Eye,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BarChart3,
  Calendar,
  RefreshCw
} from "lucide-react";
import { cn } from "@iq24/ui/utils/cn";
import * as React from "react";
import { 
  generatePerformanceSnapshot,
  formatCurrency, 
  formatNumber, 
  formatPercentage,
  calculateTrend,
  type PerformanceSnapshot as PerformanceSnapshotType
} from "./utils/mock-data";
import { 
  subtleHover, 
  buttonPress, 
  cardEntrance, 
  accentGlow,
  staggerChildren,
  progressBarGrowth,
  badgeNotification,
  iconRotation
} from "./utils/animation-utils";

/**
 * Performance Snapshot Widget
 * Comprehensive KPI overview with trends and insights
 */

interface MetricItem {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  change: number;
  trend: "up" | "down" | "neutral";
  target?: number;
  status: "excellent" | "good" | "warning" | "critical";
  icon: React.ReactNode;
  description?: string;
  unit?: string;
}

interface InsightItem {
  id: string;
  type: "positive" | "negative" | "neutral";
  title: string;
  description: string;
  action?: string;
  priority: "high" | "medium" | "low";
}

function getStatusColor(status: MetricItem["status"]) {
  switch (status) {
    case "excellent":
      return "text-green-500";
    case "good":
      return "text-blue-500";
    case "warning":
      return "text-yellow-500";
    case "critical":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

function getStatusIcon(status: MetricItem["status"]) {
  switch (status) {
    case "excellent":
      return <CheckCircle className="h-3 w-3" />;
    case "good":
      return <CheckCircle className="h-3 w-3" />;
    case "warning":
      return <AlertTriangle className="h-3 w-3" />;
    case "critical":
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return <Activity className="h-3 w-3" />;
  }
}

function MetricCard({ metric }: { metric: MetricItem }) {
  const trendColor = metric.trend === "up" ? "text-green-500" : 
                    metric.trend === "down" ? "text-red-500" : 
                    "text-muted-foreground";
  
  const TrendIcon = metric.trend === "up" ? TrendingUp : 
                   metric.trend === "down" ? TrendingDown : 
                   Activity;

  const progressValue = metric.target ? (metric.rawValue / metric.target) * 100 : 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Could trigger a detail view or action
      console.log(`Metric card activated: ${metric.label}`);
    }
  };

  return (
    <div className="relative group" role="listitem">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
      
      <div 
        className={cn("relative p-4 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm", subtleHover, cardEntrance)}
        tabIndex={0}
        role="button"
        aria-label={`${metric.label}: ${metric.value}, ${metric.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(metric.change)}%`}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={cn("p-1.5 rounded-md bg-accent/10", accentGlow)}>
              {React.cloneElement(metric.icon as React.ReactElement, {
                className: "h-4 w-4",
                style: { color: "hsl(var(--numora-accent))" }
              })}
            </div>
            <div className={cn("flex items-center space-x-1", getStatusColor(metric.status), badgeNotification)}>
              {getStatusIcon(metric.status)}
              <span className="text-xs font-medium capitalize">{metric.status}</span>
            </div>
          </div>
          
          <div className={cn("flex items-center space-x-1 text-xs", trendColor, iconRotation)}>
            <TrendIcon className="h-3 w-3" />
            <span className="font-medium">{Math.abs(metric.change)}%</span>
          </div>
        </div>

        {/* Value and Label */}
        <div className="space-y-1 mb-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {metric.label}
          </h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight">{metric.value}</span>
            {metric.unit && (
              <span className="text-sm text-muted-foreground">{metric.unit}</span>
            )}
          </div>
          {metric.description && (
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          )}
        </div>

        {/* Progress Bar (if target exists) */}
        {metric.target && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress to target</span>
              <span className="font-medium">{Math.round(progressValue)}%</span>
            </div>
            <Progress 
              value={progressValue} 
              className={cn("h-1.5", progressBarGrowth)}
              style={{
                backgroundColor: "hsl(var(--muted))"
              }}
            />
            <div className="text-xs text-muted-foreground">
              Target: {formatNumber(metric.target)}{metric.unit}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: InsightItem }) {
  const typeColors = {
    positive: "border-green-500/20 bg-green-500/5",
    negative: "border-red-500/20 bg-red-500/5",
    neutral: "border-blue-500/20 bg-blue-500/5"
  };

  const typeIcons = {
    positive: <TrendingUp className="h-4 w-4 text-green-500" />,
    negative: <TrendingDown className="h-4 w-4 text-red-500" />,
    neutral: <Activity className="h-4 w-4 text-blue-500" />
  };

  const priorityBadgeVariants = {
    high: "destructive",
    medium: "secondary",
    low: "outline"
  } as const;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Could trigger insight detail view or action
      console.log(`Insight activated: ${insight.title}`);
    }
  };

  return (
    <div 
      className={cn("p-3 rounded-lg border", typeColors[insight.type], cardEntrance, subtleHover)}
      role="listitem"
      tabIndex={0}
      aria-label={`${insight.type} insight: ${insight.title}`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {typeIcons[insight.type]}
          <h4 className="text-sm font-medium">{insight.title}</h4>
        </div>
        <Badge variant={priorityBadgeVariants[insight.priority]} className={cn("text-xs", badgeNotification)}>
          {insight.priority}
        </Badge>
      </div>
      
      <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
      
      {insight.action && (
        <Button variant="outline" size="sm" className={cn("text-xs h-7", buttonPress)}>
          {insight.action}
          <ArrowUpRight className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
}

function QuickStats({ data }: { data: PerformanceSnapshotType }) {
  const stats = [
    {
      label: "Active Campaigns",
      value: data.activeCampaigns,
      icon: <Target className="h-4 w-4" />
    },
    {
      label: "Total Impressions",
      value: formatNumber(data.totalImpressions),
      icon: <Eye className="h-4 w-4" />
    },
    {
      label: "Avg CTR",
      value: formatPercentage(data.clickThroughRate),
      icon: <MousePointer className="h-4 w-4" />
    },
    {
      label: "Avg CPC",
      value: formatCurrency(data.costPerClick),
      icon: <DollarSign className="h-4 w-4" />
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <div key={index} className={cn("flex items-center space-x-3 p-2 rounded-md bg-muted/30", cardEntrance, subtleHover)}>
          <div className={cn("p-1 rounded bg-background", accentGlow)}>
            {React.cloneElement(stat.icon, {
              style: { color: "hsl(var(--numora-accent))" }
            })}
          </div>
          <div>
            <p className="text-sm font-semibold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PerformanceSnapshot() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<PerformanceSnapshotType>(() => generatePerformanceSnapshot());
  const [timeRange, setTimeRange] = React.useState("7d");

  // Generate metrics from data
  const metrics: MetricItem[] = [
    {
      id: "ctr",
      label: "Click-Through Rate",
      value: formatPercentage(data.clickThroughRate),
      rawValue: data.clickThroughRate,
      change: 8.3,
      trend: "up",
      target: 3.5,
      status: data.clickThroughRate > 3 ? "excellent" : data.clickThroughRate > 2 ? "good" : "warning",
      icon: <MousePointer className="h-4 w-4" />,
      description: "vs. industry avg 2.1%",
      unit: "%"
    },
    {
      id: "cvr",
      label: "Conversion Rate",
      value: formatPercentage(data.conversionRate),
      rawValue: data.conversionRate,
      change: 12.7,
      trend: "up",
      target: 4.0,
      status: data.conversionRate > 3.5 ? "excellent" : data.conversionRate > 2.5 ? "good" : "warning",
      icon: <Target className="h-4 w-4" />,
      description: "vs. last period",
      unit: "%"
    },
    {
      id: "cpc",
      label: "Cost Per Click",
      value: formatCurrency(data.costPerClick),
      rawValue: data.costPerClick,
      change: -5.2,
      trend: "up", // Lower CPC is better, so up trend for negative change
      target: 0.50,
      status: data.costPerClick < 0.75 ? "excellent" : data.costPerClick < 1.0 ? "good" : "warning",
      icon: <DollarSign className="h-4 w-4" />,
      description: "optimized spend",
      unit: ""
    },
    {
      id: "roas",
      label: "Return on Ad Spend",
      value: formatPercentage(data.returnOnAdSpend, 0),
      rawValue: data.returnOnAdSpend,
      change: 15.8,
      trend: "up",
      target: 400,
      status: data.returnOnAdSpend > 350 ? "excellent" : data.returnOnAdSpend > 250 ? "good" : "warning",
      icon: <TrendingUp className="h-4 w-4" />,
      description: "revenue per $1 spend",
      unit: "%"
    }
  ];

  // Generate insights
  const insights: InsightItem[] = [
    {
      id: "ctr-improvement",
      type: "positive",
      title: "CTR Above Industry Average",
      description: "Your click-through rate is 35% higher than industry benchmark.",
      action: "Scale winning ads",
      priority: "medium"
    },
    {
      id: "conversion-optimization",
      type: "neutral",
      title: "Conversion Rate Opportunity",
      description: "Landing page optimization could improve CVR by up to 20%.",
      action: "Run A/B test",
      priority: "high"
    },
    {
      id: "cost-efficiency",
      type: "positive",
      title: "Cost Optimization Success",
      description: "CPC reduced by 15% while maintaining quality traffic.",
      priority: "low"
    }
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setData(generatePerformanceSnapshot());
    setIsLoading(false);
  };

  return (
    <Card className="h-full" role="region" aria-labelledby="performance-snapshot-title">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-lg">
              <BarChart3 className="h-5 w-5" style={{ color: "hsl(var(--numora-accent))" }} />
            </div>
            <div>
              <CardTitle id="performance-snapshot-title" className="text-lg font-semibold">Performance Snapshot</CardTitle>
              <p className="text-sm text-muted-foreground">Key metrics overview</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Last {timeRange}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isLoading} 
              className={buttonPress}
              aria-label="Refresh performance data"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2" style={{ color: "hsl(var(--numora-accent))" }} />
            Quick Stats
          </h3>
          <QuickStats data={data} />
        </div>

        {/* Key Metrics */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2" style={{ color: "hsl(var(--numora-accent))" }} />
            Key Performance Indicators
          </h3>
          <div className={cn("grid grid-cols-1 gap-3", staggerChildren)} role="list" aria-label="Performance metrics">
            {metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Activity className="h-4 w-4 mr-2" style={{ color: "hsl(var(--numora-accent))" }} />
            AI Insights
          </h3>
          <div className={cn("space-y-3", staggerChildren)} role="list" aria-label="AI insights">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Updated {new Date().toLocaleTimeString()}
          </div>
          <Button variant="outline" size="sm" className={cn("text-xs", buttonPress)} aria-label="View detailed performance metrics">
            <Calendar className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}