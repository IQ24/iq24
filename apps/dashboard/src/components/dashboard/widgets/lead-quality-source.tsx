"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@iq24/ui/card";
import { Badge } from "@iq24/ui/badge";
import { Button } from "@iq24/ui/button";
import { Progress } from "@iq24/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@iq24/ui/tabs";
import { 
  Target, 
  Users, 
  TrendingUp,
  TrendingDown,
  Star,
  Globe,
  Mail,
  Search,
  Share2,
  Smartphone,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Zap,
  Award,
  CheckCircle
} from "lucide-react";
import { cn } from "@iq24/ui/utils/cn";
import * as React from "react";
import { 
  generateLeadQualityData,
  formatNumber,
  formatPercentage,
  type LeadQualityData,
  type LeadSource,
  type QualityMetric
} from "./utils/mock-data";

/**
 * Lead Quality & Source Widget
 * Analyzes lead sources and their quality metrics for marketing optimization
 */

interface LeadSourceCardProps {
  source: LeadSource;
  rank: number;
  onSelect: (source: LeadSource) => void;
  isSelected: boolean;
}

function LeadSourceCard({ source, rank, onSelect, isSelected }: LeadSourceCardProps) {
  const qualityColor = source.qualityScore >= 8 ? "text-green-500" : 
                      source.qualityScore >= 6 ? "text-blue-500" : 
                      source.qualityScore >= 4 ? "text-yellow-500" : "text-red-500";
  
  const trendColor = source.trend === "up" ? "text-green-500" : 
                    source.trend === "down" ? "text-red-500" : 
                    "text-muted-foreground";
  
  const TrendIcon = source.trend === "up" ? TrendingUp : 
                   source.trend === "down" ? TrendingDown : 
                   Target;

  return (
    <div 
      className={cn(
        "relative group cursor-pointer transition-all duration-300",
        "p-4 rounded-lg border bg-card hover:shadow-md",
        isSelected ? "border-accent bg-accent/5" : "border-border/50 hover:border-accent/30"
      )}
      onClick={() => onSelect(source)}
    >
      {/* Rank badge */}
      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-accent text-background flex items-center justify-center text-xs font-bold">
        {rank}
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-accent/10">
            {source.icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold">{source.name}</h4>
            <p className="text-xs text-muted-foreground">{source.description}</p>
          </div>
        </div>
        
        <div className={cn("flex items-center space-x-1 text-xs", trendColor)}>
          <TrendIcon className="h-3 w-3" />
          <span className="font-medium">{source.changePercent}%</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-sm font-bold">{formatNumber(source.totalLeads)}</div>
          <div className="text-xs text-muted-foreground">Leads</div>
        </div>
        <div className="text-center">
          <div className={cn("text-sm font-bold", qualityColor)}>
            {source.qualityScore.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">Quality</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold">{formatPercentage(source.conversionRate)}</div>
          <div className="text-xs text-muted-foreground">Convert</div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Volume</span>
          <span className="font-medium">{formatPercentage(source.volumePercent)}</span>
        </div>
        <Progress value={source.volumePercent} className="h-1.5" />
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Quality</span>
          <span className={cn("font-medium", qualityColor)}>
            {formatPercentage((source.qualityScore / 10) * 100)}
          </span>
        </div>
        <Progress 
          value={(source.qualityScore / 10) * 100} 
          className="h-1.5"
        />
      </div>

      {/* Cost per lead */}
      <div className="mt-3 pt-3 border-t flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Cost per Lead</span>
        <span className="text-sm font-bold">${source.costPerLead}</span>
      </div>
    </div>
  );
}

interface QualityInsightsProps {
  metrics: QualityMetric[];
  selectedSource?: LeadSource;
}

function QualityInsights({ metrics, selectedSource }: QualityInsightsProps) {
  return (
    <div className="space-y-4">
      {selectedSource && (
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="h-4 w-4 text-accent" />
            <h4 className="text-sm font-semibold">
              Selected: {selectedSource.name}
            </h4>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• {selectedSource.insights.performance}</p>
            <p>• {selectedSource.insights.recommendation}</p>
            <p>• {selectedSource.insights.opportunity}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <h4 className="text-sm font-semibold flex items-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>Quality Insights</span>
        </h4>
        
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-sm bg-accent/10">
                {React.cloneElement(metric.icon as React.ReactElement, {
                  className: "h-3 w-3",
                  style: { color: "hsl(var(--numora-accent))" }
                })}
              </div>
              <div>
                <div className="text-sm font-medium">{metric.label}</div>
                <div className="text-xs text-muted-foreground">{metric.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-sm font-bold", {
                "text-green-500": metric.status === "excellent",
                "text-blue-500": metric.status === "good",
                "text-yellow-500": metric.status === "warning",
                "text-red-500": metric.status === "critical"
              })}>
                {metric.value}
              </div>
              <div className={cn("text-xs", {
                "text-green-500": metric.trend === "up",
                "text-red-500": metric.trend === "down",
                "text-muted-foreground": metric.trend === "neutral"
              })}>
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeadQualitySource() {
  const [data, setData] = React.useState<LeadQualityData | null>(null);
  const [selectedSource, setSelectedSource] = React.useState<LeadSource | null>(null);
  const [viewMode, setViewMode] = React.useState<"quality" | "volume" | "cost">("quality");
  const [isLoading, setIsLoading] = React.useState(true);

  // Load data
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      const newData = generateLeadQualityData();
      setData(newData);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleRefresh = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newData = generateLeadQualityData();
    setData(newData);
    setSelectedSource(null);
    setIsLoading(false);
  };

  const sortedSources = React.useMemo(() => {
    if (!data) return [];
    
    return [...data.sources].sort((a, b) => {
      switch (viewMode) {
        case "quality":
          return b.qualityScore - a.qualityScore;
        case "volume":
          return b.totalLeads - a.totalLeads;
        case "cost":
          return a.costPerLead - b.costPerLead; // Lower cost is better
        default:
          return b.qualityScore - a.qualityScore;
      }
    });
  }, [data, viewMode]);

  if (isLoading || !data) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Lead Quality & Source</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="animate-spin">
                <RefreshCw className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-sm text-muted-foreground">Loading lead quality data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Lead Quality & Source</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Analyze lead sources and optimize acquisition strategies
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {data.totalSources} sources
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-7 px-2"
            >
              <RefreshCw className={cn("h-3 w-3", { "animate-spin": isLoading })} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="h-8">
              <TabsTrigger value="quality" className="text-xs px-3">Quality</TabsTrigger>
              <TabsTrigger value="volume" className="text-xs px-3">Volume</TabsTrigger>
              <TabsTrigger value="cost" className="text-xs px-3">Cost</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Sorted by {viewMode}</span>
            </div>
          </div>

          <TabsContent value={viewMode} className="mt-0 space-y-4">
            {/* Lead Sources Grid */}
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {sortedSources.map((source, index) => (
                <LeadSourceCard
                  key={source.id}
                  source={source}
                  rank={index + 1}
                  onSelect={setSelectedSource}
                  isSelected={selectedSource?.id === source.id}
                />
              ))}
            </div>

            {/* Quality Insights */}
            <div className="border-t pt-4">
              <QualityInsights 
                metrics={data.qualityMetrics} 
                selectedSource={selectedSource}
              />
            </div>

            {/* Summary Stats */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold">{formatNumber(data.totalLeads)}</div>
                  <div className="text-xs text-muted-foreground">Total Leads</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-500">{data.avgQuality.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Avg Quality</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{formatPercentage(data.avgConversion)}</div>
                  <div className="text-xs text-muted-foreground">Avg Convert</div>
                </div>
                <div>
                  <div className="text-lg font-bold">${data.avgCostPerLead}</div>
                  <div className="text-xs text-muted-foreground">Avg Cost</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default LeadQualitySource;