"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@iq24/ui/card";
import { Badge } from "@iq24/ui/badge";
import { Button } from "@iq24/ui/button";
import { Progress } from "@iq24/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@iq24/ui/tabs";
import { 
  Heart, 
  MessageCircle, 
  Share2,
  ThumbsUp,
  ThumbsDown,
  Meh,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  BarChart3,
  PieChart,
  RefreshCw,
  Calendar,
  Filter,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Volume2
} from "lucide-react";
import { cn } from "@iq24/ui/utils/cn";
import * as React from "react";
import { 
  generateEngagementSentimentData,
  formatNumber,
  formatPercentage,
  type EngagementSentimentData,
  type SentimentBreakdown,
  type EngagementMetric,
  type VolumeData
} from "./utils/mock-data";

/**
 * Engagement Volume & Sentiment Widget
 * Analyzes audience engagement patterns and sentiment across channels
 */

interface SentimentIndicatorProps {
  sentiment: SentimentBreakdown;
  showDetails?: boolean;
}

function SentimentIndicator({ sentiment, showDetails = false }: SentimentIndicatorProps) {
  const total = sentiment.positive + sentiment.neutral + sentiment.negative;
  const positivePercent = (sentiment.positive / total) * 100;
  const neutralPercent = (sentiment.neutral / total) * 100;
  const negativePercent = (sentiment.negative / total) * 100;

  return (
    <div className="space-y-3">
      {/* Sentiment Overview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-accent/10">
            {positivePercent > 60 ? (
              <ThumbsUp className="h-4 w-4 text-green-500" />
            ) : negativePercent > 30 ? (
              <ThumbsDown className="h-4 w-4 text-red-500" />
            ) : (
              <Meh className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold">Overall Sentiment</h4>
            <p className="text-xs text-muted-foreground">
              {positivePercent > 60 ? "Mostly Positive" : 
               negativePercent > 30 ? "Mixed Sentiment" : "Neutral"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{sentiment.score.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Score</div>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="space-y-2">
        {/* Positive */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <ThumbsUp className="h-3 w-3 text-green-500" />
            <span>Positive</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500 font-medium">{formatNumber(sentiment.positive)}</span>
            <span className="text-muted-foreground">({formatPercentage(positivePercent)})</span>
          </div>
        </div>
        <Progress value={positivePercent} className="h-2 bg-muted">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${positivePercent}%` }} />
        </Progress>

        {/* Neutral */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Meh className="h-3 w-3 text-yellow-500" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500 font-medium">{formatNumber(sentiment.neutral)}</span>
            <span className="text-muted-foreground">({formatPercentage(neutralPercent)})</span>
          </div>
        </div>
        <Progress value={neutralPercent} className="h-2 bg-muted">
          <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${neutralPercent}%` }} />
        </Progress>

        {/* Negative */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <ThumbsDown className="h-3 w-3 text-red-500" />
            <span>Negative</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-500 font-medium">{formatNumber(sentiment.negative)}</span>
            <span className="text-muted-foreground">({formatPercentage(negativePercent)})</span>
          </div>
        </div>
        <Progress value={negativePercent} className="h-2 bg-muted">
          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${negativePercent}%` }} />
        </Progress>
      </div>

      {showDetails && (
        <div className="pt-3 border-t space-y-2">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-sm font-bold">{formatNumber(sentiment.totalEngagements)}</div>
              <div className="text-xs text-muted-foreground">Total Engagements</div>
            </div>
            <div>
              <div className="text-sm font-bold">{formatPercentage(sentiment.engagementRate)}</div>
              <div className="text-xs text-muted-foreground">Engagement Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface VolumeChartProps {
  data: VolumeData[];
  selectedPeriod: string;
}

function VolumeChart({ data, selectedPeriod }: VolumeChartProps) {
  const maxValue = Math.max(...data.map(d => d.volume));
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>Engagement Volume</span>
        </h4>
        <Badge variant="outline" className="text-xs">
          {selectedPeriod}
        </Badge>
      </div>
      
      <div className="space-y-2">
        {data.map((item, index) => {
          const heightPercent = (item.volume / maxValue) * 100;
          const isHighlight = item.volume > maxValue * 0.8;
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-xs text-muted-foreground">{item.period}</div>
              <div className="flex-1 flex items-center space-x-2">
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isHighlight ? "bg-accent" : "bg-accent/70"
                    )}
                    style={{ width: `${heightPercent}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground">
                      {formatNumber(item.volume)}
                    </span>
                  </div>
                </div>
                <div className={cn("text-xs", {
                  "text-green-500": item.change > 0,
                  "text-red-500": item.change < 0,
                  "text-muted-foreground": item.change === 0
                })}>
                  {item.change > 0 ? "+" : ""}{item.change}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface EngagementMetricsProps {
  metrics: EngagementMetric[];
}

function EngagementMetrics({ metrics }: EngagementMetricsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center space-x-2">
        <Zap className="h-4 w-4" />
        <span>Engagement Insights</span>
      </h4>
      
      <div className="space-y-3">
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

export function EngagementVolumeSentiment() {
  const [data, setData] = React.useState<EngagementSentimentData | null>(null);
  const [selectedView, setSelectedView] = React.useState<"volume" | "sentiment" | "metrics">("volume");
  const [selectedPeriod, setSelectedPeriod] = React.useState<"daily" | "weekly" | "monthly">("daily");
  const [isLoading, setIsLoading] = React.useState(true);

  // Load data
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      const newData = generateEngagementSentimentData(selectedPeriod);
      setData(newData);
      setIsLoading(false);
    };

    loadData();
  }, [selectedPeriod]);

  const handleRefresh = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 900));
    const newData = generateEngagementSentimentData(selectedPeriod);
    setData(newData);
    setIsLoading(false);
  };

  if (isLoading || !data) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Engagement Volume & Sentiment</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="animate-spin">
                <RefreshCw className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-sm text-muted-foreground">Loading engagement data...</div>
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
              <Volume2 className="h-4 w-4" />
              <span>Engagement Volume & Sentiment</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Monitor audience engagement patterns and sentiment trends
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {formatNumber(data.totalEngagements)} engagements
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
        <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="h-8">
              <TabsTrigger value="volume" className="text-xs px-3">Volume</TabsTrigger>
              <TabsTrigger value="sentiment" className="text-xs px-3">Sentiment</TabsTrigger>
              <TabsTrigger value="metrics" className="text-xs px-3">Insights</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedPeriod === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("daily")}
                className="h-7 px-2 text-xs"
              >
                Daily
              </Button>
              <Button
                variant={selectedPeriod === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("weekly")}
                className="h-7 px-2 text-xs"
              >
                Weekly
              </Button>
              <Button
                variant={selectedPeriod === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("monthly")}
                className="h-7 px-2 text-xs"
              >
                Monthly
              </Button>
            </div>
          </div>

          <TabsContent value="volume" className="mt-0 space-y-4">
            <VolumeChart data={data.volumeData} selectedPeriod={selectedPeriod} />
            
            {/* Quick Volume Stats */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-500">{formatNumber(data.peakEngagement)}</div>
                  <div className="text-xs text-muted-foreground">Peak Day</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{formatNumber(data.avgDaily)}</div>
                  <div className="text-xs text-muted-foreground">Daily Avg</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-500">+{data.growthRate}%</div>
                  <div className="text-xs text-muted-foreground">Growth</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="mt-0 space-y-4">
            <SentimentIndicator sentiment={data.sentiment} showDetails={true} />
            
            {/* Sentiment Trends */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Sentiment Trends</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Positive sentiment trending</span>
                  <span className="text-green-500 font-medium">+8.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Negative feedback decreasing</span>
                  <span className="text-green-500 font-medium">-3.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Response time improving</span>
                  <span className="text-blue-500 font-medium">-12m avg</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="mt-0 space-y-4">
            <EngagementMetrics metrics={data.engagementMetrics} />
            
            {/* Action Items */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Recommended Actions</span>
              </h4>
              <div className="space-y-2">
                <div className="p-2 rounded-md bg-green-50 border border-green-200 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="font-medium text-green-800">Continue current content strategy</span>
                  </div>
                  <p className="text-green-700 text-xs ml-5">Positive sentiment is trending upward</p>
                </div>
                <div className="p-2 rounded-md bg-blue-50 border border-blue-200 text-sm">
                  <div className="flex items-center space-x-2">
                    <Info className="h-3 w-3 text-blue-500" />
                    <span className="font-medium text-blue-800">Optimize posting times</span>
                  </div>
                  <p className="text-blue-700 text-xs ml-5">Peak engagement at 2-4 PM daily</p>
                </div>
                <div className="p-2 rounded-md bg-yellow-50 border border-yellow-200 text-sm">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span className="font-medium text-yellow-800">Monitor weekend performance</span>
                  </div>
                  <p className="text-yellow-700 text-xs ml-5">Lower engagement on weekends</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default EngagementVolumeSentiment;