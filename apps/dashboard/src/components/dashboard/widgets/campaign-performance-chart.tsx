"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@iq24/ui/card";
import { Badge } from "@iq24/ui/badge";
import { Button } from "@iq24/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@iq24/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  MousePointer,
  Target,
  Calendar,
  RefreshCw,
  Download,
  MoreHorizontal,
  Eye,
  Clock
} from "lucide-react";
import { cn } from "@iq24/ui/utils/cn";
import * as React from "react";
import { 
  generateCampaignData, 
  formatCurrency, 
  formatNumber, 
  formatPercentage,
  type CampaignMetrics 
} from "./utils/mock-data";
import { 
  subtleHover, 
  buttonPress, 
  cardEntrance, 
  accentGlow,
  staggerChildren,
  tabSwitching,
  chartBarGrowth,
  tooltipEntrance
} from "./utils/animation-utils";

/**
 * Campaign Performance Chart Widget
 * Comprehensive performance tracking with interactive charts and metrics
 */

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  description?: string;
}

// Using CampaignMetrics from mock-data utils

interface ChartDataPoint {
  name: string;
  value: number;
  change: number;
}

// Sample data - in production this would come from API
const generateSampleData = (period: string) => {
  const days = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;
  return generateCampaignData(days);
};

const topCampaigns: ChartDataPoint[] = [
  { name: "Summer Sale 2024", value: 24650, change: 15.2 },
  { name: "Product Launch", value: 18340, change: 8.7 },
  { name: "Black Friday", value: 16890, change: -2.1 },
  { name: "Holiday Campaign", value: 12450, change: 12.8 },
  { name: "Brand Awareness", value: 9820, change: 5.4 }
];

function MetricCard({ title, value, change, trend, icon, description }: MetricCardProps) {
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Clock;

  return (
    <div className={cn("flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50", subtleHover, cardEntrance)}>
      <div className="flex items-center space-x-3">
        <div className={cn("p-2 bg-background rounded-md border", accentGlow)}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className={cn("flex items-center space-x-1", trendColor)}>
        <TrendIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{change}</span>
      </div>
    </div>
  );
}

function SimpleBarChart({ data, height = 200 }: { data: CampaignMetrics[]; height?: number }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full space-x-2 px-2">
        {data.map((item, index) => {
          const heightPercent = (item.revenue / maxRevenue) * 100;
          const date = new Date(item.date).getDate();
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center space-y-2">
              <div 
                className={cn("w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm cursor-pointer relative group min-h-[20px]", chartBarGrowth)}
                style={{ 
                  height: `${Math.max(heightPercent, 15)}%`,
                  backgroundColor: "hsl(var(--numora-accent))",
                  backgroundImage: `linear-gradient(to top, hsl(var(--numora-accent-muted)), hsl(var(--numora-accent)))`
                }}
                title={`${date}: $${item.revenue.toLocaleString()}`}
              >
                {/* Tooltip on hover */}
                <div className={cn("absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-background border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 z-10", tooltipEntrance)}>
                  ${item.revenue.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CampaignRankingList({ campaigns }: { campaigns: ChartDataPoint[] }) {
  return (
    <div className={cn("space-y-3", staggerChildren)}>
      {campaigns.map((campaign, index) => (
        <div key={index} className={cn("flex items-center justify-between p-3 bg-muted/20 rounded-lg", subtleHover)}>
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-background"
              style={{ backgroundColor: "hsl(var(--numora-accent))" }}
            >
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-sm">{campaign.name}</p>
              <p className="text-xs text-muted-foreground">
                ${campaign.value.toLocaleString()} revenue
              </p>
            </div>
          </div>
          <div className={cn(
            "flex items-center space-x-1 text-sm font-medium",
            campaign.change >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {campaign.change >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(campaign.change)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CampaignPerformanceChart() {
  const [selectedPeriod, setSelectedPeriod] = React.useState("7d");
  const [isLoading, setIsLoading] = React.useState(false);
  const [campaignData, setCampaignData] = React.useState(() => generateSampleData("7d"));

  // Update data when period changes
  React.useEffect(() => {
    setCampaignData(generateSampleData(selectedPeriod));
  }, [selectedPeriod]);

  // Calculate total metrics
  const totalRevenue = campaignData.reduce((sum, item) => sum + item.revenue, 0);
  const totalConversions = campaignData.reduce((sum, item) => sum + item.conversions, 0);
  const totalClicks = campaignData.reduce((sum, item) => sum + item.clicks, 0);
  const totalImpressions = campaignData.reduce((sum, item) => sum + item.impressions, 0);
  const totalSpend = campaignData.reduce((sum, item) => sum + item.spend, 0);

  // Calculate rates
  const conversionRate = ((totalConversions / totalClicks) * 100).toFixed(2);
  const clickThroughRate = ((totalClicks / totalImpressions) * 100).toFixed(2);
  const costPerAcquisition = (totalSpend / totalConversions).toFixed(2);
  const returnOnAdSpend = ((totalRevenue / totalSpend) * 100).toFixed(0);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCampaignData(generateSampleData(selectedPeriod));
    setIsLoading(false);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-lg">
              <BarChart3 className="h-5 w-5" style={{ color: "hsl(var(--numora-accent))" }} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Campaign Performance</CardTitle>
              <p className="text-sm text-muted-foreground">Real-time marketing analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Live
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Time Period Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Time Period:</span>
          </div>
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="24h" className="text-xs">24H</TabsTrigger>
              <TabsTrigger value="7d" className="text-xs">7D</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs">30D</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs">90D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            change="+12.5%"
            trend="up"
            icon={<DollarSign className="h-4 w-4" style={{ color: "hsl(var(--numora-accent))" }} />}
            description="vs. last period"
          />
          <MetricCard
            title="Conversions"
            value={formatNumber(totalConversions)}
            change="+8.3%"
            trend="up"
            icon={<Target className="h-4 w-4" style={{ color: "hsl(var(--numora-accent))" }} />}
            description={`${formatPercentage(Number(conversionRate))} CVR`}
          />
          <MetricCard
            title="Total Clicks"
            value={formatNumber(totalClicks)}
            change="+15.7%"
            trend="up"
            icon={<MousePointer className="h-4 w-4" style={{ color: "hsl(var(--numora-accent))" }} />}
            description={`${formatPercentage(Number(clickThroughRate))} CTR`}
          />
          <MetricCard
            title="ROAS"
            value={`${returnOnAdSpend}%`}
            change="+4.2%"
            trend="up"
            icon={<TrendingUp className="h-4 w-4" style={{ color: "hsl(var(--numora-accent))" }} />}
            description={`${formatCurrency(Number(costPerAcquisition))} CPA`}
          />
        </div>

        {/* Main Chart and Campaign Rankings */}
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className={cn("grid w-full grid-cols-2", tabSwitching)}>
            <TabsTrigger value="performance">Performance Chart</TabsTrigger>
            <TabsTrigger value="campaigns">Top Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Revenue Trend</h4>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--numora-accent))" }} />
                  <span>Revenue</span>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <SimpleBarChart data={campaignData} height={240} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{formatNumber(totalImpressions)}</p>
                <p className="text-xs text-muted-foreground">Impressions</p>
              </div>
              <div>
                <p className="text-lg font-bold">{formatNumber(totalClicks)}</p>
                <p className="text-xs text-muted-foreground">Clicks</p>
              </div>
              <div>
                <p className="text-lg font-bold">{formatNumber(totalConversions)}</p>
                <p className="text-xs text-muted-foreground">Conversions</p>
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(totalSpend)}</p>
                <p className="text-xs text-muted-foreground">Ad Spend</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Campaign Rankings</h4>
              <Button variant="outline" size="sm" className={buttonPress}>
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            <CampaignRankingList campaigns={topCampaigns} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}