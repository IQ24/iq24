"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@iq24/ui/card";
import { Progress } from "@iq24/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@iq24/ui/tabs";
import { Badge } from "@iq24/ui/badge";
import { 
  Mail, 
  Share2, 
  Search, 
  MousePointer, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  DollarSign,
  Activity,
  Eye
} from "lucide-react";
import { generateChannelMix, ChannelData, formatCurrency, formatPercentage } from "./utils/mock-data";

// Enhanced channel data with icons and descriptions
interface EnhancedChannelData extends ChannelData {
  icon: React.ReactNode;
  description: string;
  conversionRate: number;
  cpm: number;
  ctr: number;
  engagementRate: number;
}

// Channel metrics view types
type ChannelViewType = "overview" | "performance" | "trends";

// Component for individual channel cards
const ChannelCard: React.FC<{ channel: EnhancedChannelData; isExpanded?: boolean }> = ({ 
  channel, 
  isExpanded = false 
}) => {
  return (
    <div className="group p-4 rounded-lg border border-numora-gray-800/50 bg-numora-gray-900/30 hover:bg-numora-gray-900/50 transition-all duration-200 hover:border-numora-accent/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-numora-accent/10 text-numora-accent group-hover:bg-numora-accent/20 transition-colors">
            {channel.icon}
          </div>
          <div>
            <h4 className="font-medium text-white">{channel.name}</h4>
            <p className="text-sm text-numora-gray-400">{channel.description}</p>
          </div>
        </div>
        <Badge 
          variant={channel.growth > 0 ? "default" : "secondary"}
          className={channel.growth > 0 ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}
        >
          {channel.growth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {formatPercentage(Math.abs(channel.growth))}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {/* Revenue and Percentage */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-numora-gray-400">Revenue Share</span>
          <span className="font-medium text-white">{formatCurrency(channel.revenue)}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-numora-gray-400">Share</span>
            <span className="text-white font-medium">{formatPercentage(channel.percentage)}</span>
          </div>
          <Progress 
            value={channel.percentage} 
            className="h-2" 
            style={{
              background: "rgb(52, 55, 59)",
            }}
          />
        </div>

        {isExpanded && (
          <div className="pt-3 border-t border-numora-gray-800/50 grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-sm text-numora-gray-400">CVR</div>
              <div className="font-medium text-white">{formatPercentage(channel.conversionRate)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-numora-gray-400">CTR</div>
              <div className="font-medium text-white">{formatPercentage(channel.ctr)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-numora-gray-400">CPM</div>
              <div className="font-medium text-white">{formatCurrency(channel.cpm)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-numora-gray-400">Engagement</div>
              <div className="font-medium text-white">{formatPercentage(channel.engagementRate)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Channel Mix Widget Component
export const ChannelMixWidget: React.FC = () => {
  const [activeView, setActiveView] = React.useState<ChannelViewType>("overview");
  const [expandedChannels, setExpandedChannels] = React.useState<Set<string>>(new Set());

  // Generate enhanced channel data with icons and additional metrics
  const channelData = React.useMemo((): EnhancedChannelData[] => {
    const baseData = generateChannelMix();
    
    const channelIcons: Record<string, React.ReactNode> = {
      Email: <Mail className="w-4 h-4" />,
      Social: <Share2 className="w-4 h-4" />,
      Search: <Search className="w-4 h-4" />,
      Direct: <MousePointer className="w-4 h-4" />
    };

    const channelDescriptions: Record<string, string> = {
      Email: "Newsletter campaigns & automation",
      Social: "Social media advertising & organic",
      Search: "SEO & paid search campaigns",
      Direct: "Direct traffic & referrals"
    };

    return baseData.map(channel => ({
      ...channel,
      icon: channelIcons[channel.name] || <Activity className="w-4 h-4" />,
      description: channelDescriptions[channel.name] || "Marketing channel",
      conversionRate: 2.1 + Math.random() * 4.5, // 2.1% - 6.6%
      cpm: 8 + Math.random() * 20, // $8 - $28
      ctr: 1.2 + Math.random() * 3.5, // 1.2% - 4.7%
      engagementRate: 3.5 + Math.random() * 8.2 // 3.5% - 11.7%
    }));
  }, []);

  // Calculate summary metrics
  const totalRevenue = channelData.reduce((sum, channel) => sum + channel.revenue, 0);
  const avgGrowth = channelData.reduce((sum, channel) => sum + channel.growth, 0) / channelData.length;
  const topPerformer = channelData.reduce((top, channel) => 
    channel.revenue > top.revenue ? channel : top
  );

  const toggleChannelExpansion = (channelName: string) => {
    setExpandedChannels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channelName)) {
        newSet.delete(channelName);
      } else {
        newSet.add(channelName);
      }
      return newSet;
    });
  };

  return (
    <Card className="w-full h-full bg-numora-gray-900/50 border-numora-gray-800/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-numora-accent/10">
              <BarChart3 className="w-5 h-5 text-numora-accent" />
            </div>
            <div>
              <CardTitle className="text-white">Channel Mix</CardTitle>
              <p className="text-sm text-numora-gray-400 mt-1">
                Revenue distribution across channels
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-numora-gray-800/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-numora-accent" />
              <span className="text-sm text-numora-gray-400">Total Revenue</span>
            </div>
            <div className="font-bold text-white">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-numora-gray-800/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-numora-gray-400">Avg Growth</span>
            </div>
            <div className="font-bold text-white">{formatPercentage(avgGrowth)}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-numora-gray-800/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-numora-accent" />
              <span className="text-sm text-numora-gray-400">Top Channel</span>
            </div>
            <div className="font-bold text-white">{topPerformer.name}</div>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-numora-gray-800/50">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-numora-accent data-[state=active]:text-black"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="performance"
              className="data-[state=active]:bg-numora-accent data-[state=active]:text-black"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="trends"
              className="data-[state=active]:bg-numora-accent data-[state=active]:text-black"
            >
              Trends
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {channelData.map((channel) => (
                <div 
                  key={channel.name}
                  onClick={() => toggleChannelExpansion(channel.name)}
                  className="cursor-pointer"
                >
                  <ChannelCard 
                    channel={channel} 
                    isExpanded={expandedChannels.has(channel.name)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4 mt-6">
            <div className="space-y-4">
              {channelData
                .sort((a, b) => b.revenue - a.revenue)
                .map((channel, index) => (
                <div key={channel.name} className="flex items-center justify-between p-4 rounded-lg bg-numora-gray-900/30 border border-numora-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-numora-accent/10 flex items-center justify-center text-sm font-bold text-numora-accent">
                      {index + 1}
                    </div>
                    <div className="p-2 rounded-lg bg-numora-accent/10 text-numora-accent">
                      {channel.icon}
                    </div>
                    <div>
                      <div className="font-medium text-white">{channel.name}</div>
                      <div className="text-sm text-numora-gray-400">{formatPercentage(channel.conversionRate)} CVR</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{formatCurrency(channel.revenue)}</div>
                    <div className="text-sm text-numora-gray-400">{formatPercentage(channel.percentage)} share</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4 mt-6">
            <div className="space-y-4">
              {channelData
                .sort((a, b) => b.growth - a.growth)
                .map((channel) => (
                <div key={channel.name} className="p-4 rounded-lg bg-numora-gray-900/30 border border-numora-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-numora-accent/10 text-numora-accent">
                        {channel.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white">{channel.name}</div>
                        <div className="text-sm text-numora-gray-400">{channel.description}</div>
                      </div>
                    </div>
                    <Badge 
                      variant={channel.growth > 0 ? "default" : "secondary"}
                      className={channel.growth > 0 ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}
                    >
                      {channel.growth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {formatPercentage(Math.abs(channel.growth))}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div>
                      <div className="text-sm text-numora-gray-400">Revenue</div>
                      <div className="font-medium text-white">{formatCurrency(channel.revenue)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-numora-gray-400">CTR</div>
                      <div className="font-medium text-white">{formatPercentage(channel.ctr)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-numora-gray-400">CPM</div>
                      <div className="font-medium text-white">{formatCurrency(channel.cpm)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-numora-gray-400">Engagement</div>
                      <div className="font-medium text-white">{formatPercentage(channel.engagementRate)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Insights */}
        <div className="p-4 rounded-lg bg-numora-accent/5 border border-numora-accent/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-numora-accent/10">
              <Activity className="w-4 h-4 text-numora-accent" />
            </div>
            <div>
              <h4 className="font-Medium text-white mb-1">Channel Insights</h4>
              <p className="text-sm text-numora-gray-300">
                {topPerformer.name} is your top performing channel with {formatCurrency(topPerformer.revenue)} revenue. 
                {avgGrowth > 0 
                  ? ` Overall channel performance is growing at ${formatPercentage(avgGrowth)} on average.`
                  : ` Consider optimizing underperforming channels to improve overall growth.`
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChannelMixWidget;