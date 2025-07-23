import { 
  DashboardContainer, 
  DashboardGrid, 
  DashboardWidget, 
  DashboardHeader, 
  DashboardDivider 
} from "@/components/dashboard/main-dashboard-layout";
import { CampaignPerformanceChart } from "@/components/dashboard/widgets/campaign-performance-chart";
import { PerformanceSnapshot } from "@/components/dashboard/widgets/performance-snapshot";
import { ActivityHeatmap } from "@/components/dashboard/widgets/activity-heatmap";
import { LeadQualitySource } from "@/components/dashboard/widgets/lead-quality-source";
import { EngagementVolumeSentiment } from "@/components/dashboard/widgets/engagement-volume-sentiment";
import { ChannelMixWidget } from "@/components/dashboard/widgets/channel-mix";
import { AIAssistantWidget } from "@/components/dashboard/widgets/ai-assistant";
import { Button } from "@iq24/ui/button";
import { Badge } from "@iq24/ui/badge";
import { Calendar, Settings, Download, RefreshCw } from "lucide-react";
import type { Metadata } from "next";

// NOTE: GoCardLess serverAction needs this currently
// (Fetch accounts takes up to 20s and default limit is 15s)
export const maxDuration = 30;

export const metadata: Metadata = {
  title: "AI Marketing Dashboard | IQ24.ai",
  description: "Comprehensive AI-powered marketing analytics and campaign management dashboard"
};

export default async function MarketingDashboard({ searchParams }) {
  // Simulate loading state - in production this would come from API
  const isLoading = false;
  const hasData = true;

  return (
    <DashboardContainer>
      {/* Dashboard Header */}
      <DashboardHeader>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            AI Marketing Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your marketing campaigns and performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Live Data
          </Badge>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </DashboardHeader>

      {/* Main Dashboard Grid */}
      <DashboardGrid>
        {/* Campaign Performance Chart - Extra Large Widget */}
        <DashboardWidget size="extra-large">
          <CampaignPerformanceChart />
        </DashboardWidget>

        {/* Performance Snapshot - Medium Widget */}
        <DashboardWidget size="medium">
          <PerformanceSnapshot />
        </DashboardWidget>

        {/* Activity Heatmap - Medium Widget */}
        <DashboardWidget size="medium">
          <ActivityHeatmap />
        </DashboardWidget>

        {/* Lead Quality & Source - Medium Widget */}
        <DashboardWidget size="medium">
          <LeadQualitySource />
        </DashboardWidget>

        {/* Engagement Volume & Sentiment - Medium Widget */}
        <DashboardWidget size="medium">
          <EngagementVolumeSentiment />
        </DashboardWidget>

        {/* Channel Mix - Medium Widget */}
        <DashboardWidget size="medium">
          <ChannelMixWidget />
        </DashboardWidget>

        {/* AI Assistant - Large Widget */}
        <DashboardWidget size="large">
          <AIAssistantWidget />
        </DashboardWidget>
      </DashboardGrid>
    </DashboardContainer>
  );
}
