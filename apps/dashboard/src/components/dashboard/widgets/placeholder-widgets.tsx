"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@iq24/ui/card";
import { Skeleton } from "@iq24/ui/skeleton";
import { Badge } from "@iq24/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  MessageSquare, 
  BarChart3,
  Bot,
  Target,
  Eye,
  Mail
} from "lucide-react";
import * as React from "react";

/**
 * Placeholder widget components for the Numora AI marketing dashboard
 * These will be replaced with fully functional widgets in subsequent tasks
 */

export function CampaignPerformanceChartPlaceholder() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-numora-accent" />
          Campaign Performance
        </CardTitle>
        <Badge variant="secondary" className="text-xs">Live</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-numora-accent">$12,847</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
            <div className="flex items-center text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+12.5%</span>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="text-lg font-bold">847</p>
              <p className="text-xs text-muted-foreground">Conversions</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">3.2%</p>
              <p className="text-xs text-muted-foreground">CVR</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">$15.18</p>
              <p className="text-xs text-muted-foreground">CPA</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceSnapshotPlaceholder() {
  const metrics = [
    { label: "Active Campaigns", value: "24", change: "+3", trend: "up" },
    { label: "Total Impressions", value: "1.2M", change: "+8.7%", trend: "up" },
    { label: "Click-through Rate", value: "2.84%", change: "-0.3%", trend: "down" },
    { label: "Cost per Click", value: "$0.67", change: "-12%", trend: "up" }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-numora-accent" />
          Performance Snapshot
        </CardTitle>
        <Badge variant="outline" className="text-xs">Last 7 days</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{metric.label}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
              <div className={`flex items-center ${
                metric.trend === "up" ? "text-green-500" : "text-red-500"
              }`}>
                {metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium ml-1">{metric.change}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityHeatmapPlaceholder() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-numora-accent" />
          Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm bg-muted"
                style={{
                  backgroundColor: `hsl(var(--numora-accent) / ${Math.random() * 0.8})`
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less active</span>
            <span>More active</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Peak Activity</span>
              <span className="text-sm font-medium">2:00 PM - 4:00 PM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Best Day</span>
              <span className="text-sm font-medium">Tuesday</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LeadQualitySourcePlaceholder() {
  const sources = [
    { name: "Organic Search", quality: 8.5, leads: 124, color: "hsl(var(--numora-accent))" },
    { name: "Social Media", quality: 7.2, leads: 87, color: "hsl(166, 100%, 60%)" },
    { name: "Email Campaign", quality: 9.1, leads: 56, color: "hsl(166, 100%, 50%)" },
    { name: "Paid Ads", quality: 6.8, leads: 203, color: "hsl(166, 100%, 40%)" }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-numora-accent" />
          Lead Quality & Source
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sources.map((source, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{source.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{source.leads} leads</span>
                  <Badge variant="secondary" className="text-xs">
                    {source.quality}/10
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${source.quality * 10}%`,
                    backgroundColor: source.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function EngagementVolumeSentimentPlaceholder() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-numora-accent" />
          Engagement & Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">72%</p>
              <p className="text-xs text-muted-foreground">Positive</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">18%</p>
              <p className="text-xs text-muted-foreground">Neutral</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">10%</p>
              <p className="text-xs text-muted-foreground">Negative</p>
            </div>
          </div>
          <div className="h-[120px] w-full">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Engagements</span>
              <span className="text-sm font-medium">47.2K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Engagement Rate</span>
              <span className="text-sm font-medium">4.8%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChannelMixPlaceholder() {
  const channels = [
    { name: "Email", percentage: 35, color: "hsl(var(--numora-accent))" },
    { name: "Social", percentage: 28, color: "hsl(166, 100%, 60%)" },
    { name: "Search", percentage: 22, color: "hsl(166, 100%, 50%)" },
    { name: "Direct", percentage: 15, color: "hsl(166, 100%, 40%)" }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4 text-numora-accent" />
          Channel Mix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[120px] w-full flex items-center justify-center">
            <div className="relative w-24 h-24">
              <Skeleton className="w-full h-full rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">100%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {channels.map((channel, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: channel.color }}
                  />
                  <span className="text-sm">{channel.name}</span>
                </div>
                <span className="text-sm font-medium">{channel.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AIAssistantPlaceholder() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4 text-numora-accent" />
          AI Assistant
        </CardTitle>
        <Badge variant="secondary" className="text-xs">Online</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm">
              Based on your campaign data, I recommend increasing the budget for your 
              "Summer Sale" campaign by 20% to maximize conversions during peak hours.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">3 optimization suggestions</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">2 audience insights</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">1 performance alert</span>
            </div>
          </div>
          <button 
            className="w-full rounded-md py-2 px-4 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "hsl(var(--numora-accent))",
              color: "hsl(var(--numora-background))"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "hsl(var(--numora-accent-muted))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "hsl(var(--numora-accent))";
            }}
          >
            Open Assistant
          </button>
        </div>
      </CardContent>
    </Card>
  );
}