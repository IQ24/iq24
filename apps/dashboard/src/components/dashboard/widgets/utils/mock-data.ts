/**
 * Mock data utilities for dashboard widgets
 * In production, this would be replaced with real API calls
 */

import * as React from "react";
import { 
  Eye, 
  Clock, 
  MousePointer,
  Activity,
  Users,
  Zap,
  TrendingUp,
  DollarSign,
  Globe,
  Mail,
  Search,
  Share2,
  Smartphone,
  Target,
  Star,
  Award,
  CheckCircle,
  Heart,
  MessageCircle,
  ThumbsUp,
  BarChart3,
  Volume2
} from "lucide-react";

export interface CampaignMetrics {
  id: string;
  name: string;
  revenue: number;
  conversions: number;
  impressions: number;
  clicks: number;
  spend: number;
  date: string;
}

export interface PerformanceSnapshot {
  activeCampaigns: number;
  totalImpressions: number;
  clickThroughRate: number;
  costPerClick: number;
  conversionRate: number;
  returnOnAdSpend: number;
}

export interface ActivityData {
  date: string;
  activity: number;
  engagement: number;
}

export interface LeadSource {
  name: string;
  quality: number;
  leads: number;
  conversionRate: number;
}

export interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  totalEngagements: number;
  engagementRate: number;
}

export interface ChannelData {
  name: string;
  percentage: number;
  revenue: number;
  growth: number;
}

// Mock data generators
export function generateCampaignData(days: number = 7): CampaignMetrics[] {
  const data: CampaignMetrics[] = [];
  const baseDate = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // Generate realistic campaign data with some variation
    const baseRevenue = 8000 + Math.random() * 6000;
    const baseConversions = 200 + Math.random() * 200;
    const baseImpressions = 80000 + Math.random() * 40000;
    const baseClicks = 2500 + Math.random() * 1500;
    const baseSpend = 1200 + Math.random() * 600;
    
    data.push({
      id: `campaign-${i}`,
      name: `Campaign ${i + 1}`,
      revenue: Math.round(baseRevenue),
      conversions: Math.round(baseConversions),
      impressions: Math.round(baseImpressions),
      clicks: Math.round(baseClicks),
      spend: Math.round(baseSpend),
      date: date.toISOString().split('T')[0]
    });
  }
  
  return data;
}

export function generatePerformanceSnapshot(): PerformanceSnapshot {
  const data = generateCampaignData(30);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalConversions = data.reduce((sum, item) => sum + item.conversions, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
  const totalSpend = data.reduce((sum, item) => sum + item.spend, 0);
  
  return {
    activeCampaigns: 24,
    totalImpressions: totalImpressions,
    clickThroughRate: (totalClicks / totalImpressions) * 100,
    costPerClick: totalSpend / totalClicks,
    conversionRate: (totalConversions / totalClicks) * 100,
    returnOnAdSpend: (totalRevenue / totalSpend) * 100
  };
}

export function generateActivityHeatmap(weeks: number = 5): ActivityData[] {
  const data: ActivityData[] = [];
  const baseDate = new Date();
  
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // Generate activity patterns (higher on weekdays, lower on weekends)
    const dayOfWeek = date.getDay();
    const baseActivity = dayOfWeek === 0 || dayOfWeek === 6 ? 0.3 : 0.7;
    const activity = baseActivity + Math.random() * 0.3;
    
    data.push({
      date: date.toISOString().split('T')[0],
      activity: Math.round(activity * 100),
      engagement: Math.round((activity * 0.8 + Math.random() * 0.2) * 100)
    });
  }
  
  return data;
}

export function generateLeadSources(): LeadSource[] {
  return [
    {
      name: "Organic Search",
      quality: 8.5,
      leads: 124,
      conversionRate: 12.4
    },
    {
      name: "Social Media",
      quality: 7.2,
      leads: 87,
      conversionRate: 8.9
    },
    {
      name: "Email Campaign",
      quality: 9.1,
      leads: 56,
      conversionRate: 15.2
    },
    {
      name: "Paid Ads",
      quality: 6.8,
      leads: 203,
      conversionRate: 6.7
    },
    {
      name: "Direct Traffic",
      quality: 8.9,
      leads: 45,
      conversionRate: 18.3
    }
  ];
}

export function generateSentimentData(): SentimentData {
  const total = 47200;
  const positive = Math.round(total * 0.72);
  const neutral = Math.round(total * 0.18);
  const negative = total - positive - neutral;
  
  return {
    positive: (positive / total) * 100,
    neutral: (neutral / total) * 100,
    negative: (negative / total) * 100,
    totalEngagements: total,
    engagementRate: 4.8
  };
}

export function generateChannelMix(): ChannelData[] {
  return [
    {
      name: "Email",
      percentage: 35,
      revenue: 42350,
      growth: 12.3
    },
    {
      name: "Social",
      percentage: 28,
      revenue: 33840,
      growth: 8.7
    },
    {
      name: "Search",
      percentage: 22,
      revenue: 26620,
      growth: 15.2
    },
    {
      name: "Direct",
      percentage: 15,
      revenue: 18150,
      growth: 5.4
    }
  ];
}

// Utility functions for data manipulation
export function calculateTrend(current: number, previous: number): {
  percentage: number;
  direction: "up" | "down" | "neutral";
} {
  if (previous === 0) {
    return { percentage: 0, direction: "neutral" };
  }
  
  const percentage = ((current - previous) / previous) * 100;
  const direction = percentage > 0 ? "up" : percentage < 0 ? "down" : "neutral";
  
  return {
    percentage: Math.abs(percentage),
    direction
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPercentage(num: number, decimals: number = 1): string {
  return `${num.toFixed(decimals)}%`;
}

// Activity Heatmap Types
export interface HeatmapDay {
  date: string;
  value: number;
  label: string;
  dayOfWeek: number;
  weekOfYear: number;
}

export interface ActivityMetric {
  label: string;
  description: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  iconName: string;
}

export interface ActivityHeatmapData {
  heatmapData: HeatmapDay[];
  metrics: ActivityMetric[];
  totalActivity: number;
  avgDaily: number;
  peakDay: number;
  totalDays: number;
  period: "week" | "month" | "quarter";
  metric: "visits" | "engagement" | "conversions";
}

// Activity Heatmap Data Generator
export function generateActivityHeatmapData(
  period: "week" | "month" | "quarter" = "month",
  metric: "visits" | "engagement" | "conversions" = "visits"
): ActivityHeatmapData {
  const today = new Date();
  const daysCount = period === "week" ? 7 : period === "month" ? 30 : 90;
  
  // Generate heatmap data
  const heatmapData: HeatmapDay[] = [];
  const baseValue = metric === "visits" ? 1000 : metric === "engagement" ? 500 : 50;
  
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic patterns
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMonday = dayOfWeek === 1;
    
    // Weekend and Monday patterns
    let multiplier = 1;
    if (isWeekend) {
      multiplier = 0.3 + Math.random() * 0.4; // Lower weekend activity
    } else if (isMonday) {
      multiplier = 1.2 + Math.random() * 0.3; // Higher Monday activity
    } else {
      multiplier = 0.8 + Math.random() * 0.6; // Normal weekday variation
    }
    
    // Add some seasonal variation
    const seasonalMultiplier = 0.8 + Math.sin(i / 7) * 0.4;
    
    const value = Math.floor(baseValue * multiplier * seasonalMultiplier);
    
    heatmapData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value,
      label: metric,
      dayOfWeek,
      weekOfYear: Math.floor(i / 7)
    });
  }
  
  // Calculate metrics
  const totalActivity = heatmapData.reduce((sum, day) => sum + day.value, 0);
  const avgDaily = Math.floor(totalActivity / daysCount);
  const peakDay = Math.max(...heatmapData.map(day => day.value));
  
  // Generate activity metrics based on selected metric type
  const metrics: ActivityMetric[] = [];
  
  if (metric === "visits") {
    metrics.push(
      {
        label: "Total Visits",
        description: "Unique page visits",
        value: formatNumber(totalActivity),
        change: "+12.3%",
        trend: "up",
        iconName: "Eye"
      },
      {
        label: "Peak Hour",
        description: "2-3 PM daily",
        value: "14:30",
        change: "Consistent",
        trend: "neutral",
        iconName: "Clock"
      },
      {
        label: "Bounce Rate",
        description: "Pages per session",
        value: "34.2%",
        change: "-2.1%",
        trend: "up",
        iconName: "MousePointer"
      }
    );
  } else if (metric === "engagement") {
    metrics.push(
      {
        label: "Total Interactions",
        description: "Clicks, shares, comments",
        value: formatNumber(totalActivity),
        change: "+18.7%",
        trend: "up",
        iconName: "Activity"
      },
      {
        label: "Avg Session",
        description: "Time spent engaging",
        value: "4m 32s",
        change: "+8.2%",
        trend: "up",
        iconName: "Clock"
      },
      {
        label: "Active Users",
        description: "Users with 3+ actions",
        value: formatNumber(Math.floor(totalActivity * 0.6)),
        change: "+5.4%",
        trend: "up",
        iconName: "Users"
      }
    );
  } else {
    metrics.push(
      {
        label: "Total Conversions",
        description: "Goal completions",
        value: formatNumber(totalActivity),
        change: "+24.1%",
        trend: "up",
        iconName: "Zap"
      },
      {
        label: "Conversion Rate",
        description: "Visits to conversions",
        value: "3.2%",
        change: "+0.4%",
        trend: "up",
        iconName: "TrendingUp"
      },
      {
        label: "Avg Order Value",
        description: "Per conversion",
        value: "$127",
        change: "+$12",
        trend: "up",
        iconName: "DollarSign"
      }
    );
  }
  
  return {
    heatmapData,
    metrics,
    totalActivity,
    avgDaily,
    peakDay,
    totalDays: daysCount,
    period,
    metric
  };
}

// Lead Quality & Source Types
export interface LeadSource {
  id: string;
  name: string;
  description: string;
  iconName: string;
  totalLeads: number;
  qualityScore: number;
  conversionRate: number;
  costPerLead: number;
  volumePercent: number;
  changePercent: number;
  trend: "up" | "down" | "neutral";
  insights: {
    performance: string;
    recommendation: string;
    opportunity: string;
  };
}

export interface QualityMetric {
  label: string;
  description: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  status: "excellent" | "good" | "warning" | "critical";
  iconName: string;
}

export interface LeadQualityData {
  sources: LeadSource[];
  qualityMetrics: QualityMetric[];
  totalLeads: number;
  totalSources: number;
  avgQuality: number;
  avgConversion: number;
  avgCostPerLead: number;
}

// Lead Quality Data Generator
export function generateLeadQualityData(): LeadQualityData {
  const sources: LeadSource[] = [
    {
      id: "organic-search",
      name: "Organic Search",
      description: "SEO & content marketing",
      iconName: "Search",
      totalLeads: 1247,
      qualityScore: 8.7,
      conversionRate: 12.4,
      costPerLead: 0, // Organic is free
      volumePercent: 35.2,
      changePercent: 12.3,
      trend: "up",
      insights: {
        performance: "Highest quality leads with excellent conversion rates",
        recommendation: "Increase content marketing and SEO optimization",
        opportunity: "Target long-tail keywords for untapped segments"
      }
    },
    {
      id: "social-media",
      name: "Social Media",
      description: "LinkedIn, Twitter, Facebook",
      iconName: "Share2",
      totalLeads: 892,
      qualityScore: 7.2,
      conversionRate: 8.9,
      costPerLead: 15,
      volumePercent: 25.1,
      changePercent: 8.7,
      trend: "up",
      insights: {
        performance: "Good volume with moderate quality scores",
        recommendation: "Focus on LinkedIn for B2B lead generation",
        opportunity: "Improve targeting to increase lead quality"
      }
    },
    {
      id: "email-campaigns",
      name: "Email Campaigns",
      description: "Newsletter & nurture sequences",
      iconName: "Mail",
      totalLeads: 634,
      qualityScore: 9.1,
      conversionRate: 15.2,
      costPerLead: 5,
      volumePercent: 17.9,
      changePercent: 15.4,
      trend: "up",
      insights: {
        performance: "Highest conversion rates among all channels",
        recommendation: "Scale email marketing and improve segmentation",
        opportunity: "Develop more targeted nurture sequences"
      }
    },
    {
      id: "paid-ads",
      name: "Paid Advertising",
      description: "Google Ads, Facebook Ads",
      iconName: "Globe",
      totalLeads: 1156,
      qualityScore: 6.8,
      conversionRate: 6.7,
      costPerLead: 45,
      volumePercent: 32.6,
      changePercent: -3.2,
      trend: "down",
      insights: {
        performance: "High volume but lower quality and conversion",
        recommendation: "Optimize ad targeting and improve landing pages",
        opportunity: "Test different ad creatives and audiences"
      }
    },
    {
      id: "referrals",
      name: "Referrals",
      description: "Word-of-mouth & partnerships",
      iconName: "Users",
      totalLeads: 218,
      qualityScore: 9.4,
      conversionRate: 18.6,
      costPerLead: 12,
      volumePercent: 6.1,
      changePercent: 22.1,
      trend: "up",
      insights: {
        performance: "Excellent quality with highest conversion rates",
        recommendation: "Expand referral program and partnerships",
        opportunity: "Incentivize existing customers for more referrals"
      }
    },
    {
      id: "mobile-app",
      name: "Mobile App",
      description: "In-app registrations",
      iconName: "Smartphone",
      totalLeads: 387,
      qualityScore: 7.8,
      conversionRate: 11.3,
      costPerLead: 8,
      volumePercent: 10.9,
      changePercent: 5.6,
      trend: "up",
      insights: {
        performance: "Good quality with growing engagement",
        recommendation: "Improve in-app conversion flow",
        opportunity: "Add more lead capture points in app"
      }
    }
  ];

  // Calculate totals
  const totalLeads = sources.reduce((sum, source) => sum + source.totalLeads, 0);
  const avgQuality = sources.reduce((sum, source) => sum + source.qualityScore, 0) / sources.length;
  const avgConversion = sources.reduce((sum, source) => sum + source.conversionRate, 0) / sources.length;
  const avgCostPerLead = Math.round(
    sources.reduce((sum, source) => sum + source.costPerLead, 0) / sources.length
  );

  // Generate quality metrics
  const qualityMetrics: QualityMetric[] = [
    {
      label: "Lead Score Average",
      description: "Overall lead quality rating",
      value: avgQuality.toFixed(1),
      change: "+0.3",
      trend: "up",
      status: "excellent",
      iconName: "Star"
    },
    {
      label: "Qualification Rate",
      description: "Leads that meet criteria",
      value: "73.2%",
      change: "+2.1%",
      trend: "up",
      status: "good",
      iconName: "CheckCircle"
    },
    {
      label: "Response Time",
      description: "Average first response",
      value: "2.3 hrs",
      change: "-0.5 hrs",
      trend: "up",
      status: "good",
      iconName: "Clock"
    },
    {
      label: "Pipeline Velocity",
      description: "Lead to close speed",
      value: "18.5 days",
      change: "-1.2 days",
      trend: "up",
      status: "excellent",
      iconName: "TrendingUp"
    },
    {
      label: "Budget Qualification",
      description: "Leads with adequate budget",
      value: "68.4%",
      change: "+4.2%",
      trend: "up",
      status: "good",
      iconName: "DollarSign"
    }
  ];

  return {
    sources,
    qualityMetrics,
    totalLeads,
    totalSources: sources.length,
    avgQuality,
    avgConversion,
    avgCostPerLead
  };
}

// Engagement Volume & Sentiment Types
export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
  score: number;
  totalEngagements: number;
  engagementRate: number;
}

export interface VolumeData {
  period: string;
  volume: number;
  change: number;
}

export interface EngagementMetric {
  label: string;
  description: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  status: "excellent" | "good" | "warning" | "critical";
  icon: React.ReactNode;
}

export interface EngagementSentimentData {
  sentiment: SentimentBreakdown;
  volumeData: VolumeData[];
  engagementMetrics: EngagementMetric[];
  totalEngagements: number;
  peakEngagement: number;
  avgDaily: number;
  growthRate: number;
  period: "daily" | "weekly" | "monthly";
}

// Engagement & Sentiment Data Generator
export function generateEngagementSentimentData(
  period: "daily" | "weekly" | "monthly" = "daily"
): EngagementSentimentData {
  // Generate volume data based on period
  const volumeData: VolumeData[] = [];
  const dataPoints = period === "daily" ? 7 : period === "weekly" ? 4 : 12;
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const baseVolume = 2500 + Math.random() * 1500;
    const change = -10 + Math.random() * 20; // -10% to +10%
    
    let periodLabel = "";
    if (period === "daily") {
      const date = new Date();
      date.setDate(date.getDate() - i);
      periodLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (period === "weekly") {
      periodLabel = `Week ${dataPoints - i}`;
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = (new Date().getMonth() - i + 12) % 12;
      periodLabel = monthNames[monthIndex];
    }
    
    volumeData.push({
      period: periodLabel,
      volume: Math.floor(baseVolume),
      change: Math.round(change * 10) / 10
    });
  }
  
  // Calculate totals
  const totalEngagements = volumeData.reduce((sum, data) => sum + data.volume, 0);
  const peakEngagement = Math.max(...volumeData.map(d => d.volume));
  const avgDaily = Math.floor(totalEngagements / volumeData.length);
  const growthRate = 12.5;
  
  // Generate sentiment data
  const sentiment: SentimentBreakdown = {
    positive: Math.floor(totalEngagements * 0.68), // 68% positive
    neutral: Math.floor(totalEngagements * 0.22),  // 22% neutral
    negative: Math.floor(totalEngagements * 0.10), // 10% negative
    score: 7.8,
    totalEngagements,
    engagementRate: 5.4
  };
  
  // Generate engagement metrics
  const engagementMetrics: EngagementMetric[] = [
    {
      label: "Engagement Rate",
      description: "Total engagements vs reach",
      value: "5.4%",
      change: "+0.8%",
      trend: "up",
      status: "good",
      iconName: "Heart"
    },
    {
      label: "Comment Rate",
      description: "Comments per post",
      value: "2.1%",
      change: "+0.3%",
      trend: "up",
      status: "excellent",
      iconName: "MessageCircle"
    },
    {
      label: "Share Rate",
      description: "Shares and reposts",
      value: "0.8%",
      change: "+0.1%",
      trend: "up",
      status: "good",
      iconName: "Share2"
    },
    {
      label: "Response Time",
      description: "Average reply time",
      value: "23m",
      change: "-8m",
      trend: "up",
      status: "excellent",
      iconName: "Clock"
    },
    {
      label: "Reach Growth",
      description: "Audience expansion",
      value: "14.2%",
      change: "+2.1%",
      trend: "up",
      status: "excellent",
      iconName: "TrendingUp"
    },
    {
      label: "Active Users",
      description: "Regular engagers",
      value: formatNumber(Math.floor(totalEngagements * 0.35)),
      change: "+156",
      trend: "up",
      status: "good",
      iconName: "Users"
    }
  ];
  
  return {
    sentiment,
    volumeData,
    engagementMetrics,
    totalEngagements,
    peakEngagement,
    avgDaily,
    growthRate,
    period
  };
}