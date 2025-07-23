"use client";

import { cn } from "@iq24/ui/utils/cn";
import * as React from "react";

/**
 * Main Dashboard Layout Component
 * Grid-based layout system for Numora AI marketing dashboard
 * Supports responsive breakpoints and flexible widget placement
 */

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

interface DashboardWidgetProps {
  children: React.ReactNode;
  className?: string;
  gridArea?: string;
  size?: "small" | "medium" | "large" | "extra-large";
}

/**
 * Main dashboard grid container
 * Uses CSS Grid for precise layout control
 */
export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        // Base grid setup
        "grid gap-6",
        // Mobile layout - single column
        "grid-cols-1",
        // Tablet layout - 2 columns
        "md:grid-cols-2",
        // Desktop layout - 4 columns
        "lg:grid-cols-4",
        // Large desktop layout - 6 columns
        "xl:grid-cols-6",
        // Extra large layout - 8 columns
        "2xl:grid-cols-8",
        // Responsive grid rows with min heights
        "auto-rows-min",
        // Padding and spacing
        "p-6 md:p-8",
        // Background using Numora theme
        "bg-background",
        className
      )}
      style={{
        gridTemplateRows: "repeat(auto-fit, minmax(280px, auto))"
      }}
    >
      {children}
    </div>
  );
}

/**
 * Dashboard widget wrapper
 * Handles grid positioning and sizing
 */
export function DashboardWidget({ 
  children, 
  className, 
  gridArea,
  size = "medium" 
}: DashboardWidgetProps) {
  const sizeClasses = {
    small: {
      // 1x1 on all screens
      base: "col-span-1 row-span-1",
      md: "md:col-span-1",
      lg: "lg:col-span-1", 
      xl: "xl:col-span-1",
      "2xl": "2xl:col-span-1"
    },
    medium: {
      // 1x1 mobile, 2x1 tablet+
      base: "col-span-1 row-span-1",
      md: "md:col-span-2",
      lg: "lg:col-span-2",
      xl: "xl:col-span-2", 
      "2xl": "2xl:col-span-2"
    },
    large: {
      // 1x2 mobile, 2x2 tablet+
      base: "col-span-1 row-span-2",
      md: "md:col-span-2 md:row-span-2",
      lg: "lg:col-span-3 lg:row-span-2",
      xl: "xl:col-span-3 xl:row-span-2",
      "2xl": "2xl:col-span-4 2xl:row-span-2"
    },
    "extra-large": {
      // Full width on mobile, spans most columns on larger screens
      base: "col-span-1 row-span-2",
      md: "md:col-span-2 md:row-span-3",
      lg: "lg:col-span-4 lg:row-span-3",
      xl: "xl:col-span-4 xl:row-span-3",
      "2xl": "2xl:col-span-6 2xl:row-span-3"
    }
  };

  const selectedSize = sizeClasses[size];

  return (
    <div
      className={cn(
        // Base widget styling
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        "transition-all duration-200 hover:shadow-md",
        // Size-based grid positioning
        selectedSize.base,
        selectedSize.md,
        selectedSize.lg,
        selectedSize.xl,
        selectedSize["2xl"],
        // Custom grid area if provided
        gridArea && `[grid-area:${gridArea}]`,
        className
      )}
      style={gridArea ? { gridArea } : undefined}
    >
      <div className="h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}

/**
 * Dashboard header section
 * Contains title, actions, and navigation elements
 */
export function DashboardHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0",
      "p-6 md:p-8 pb-0",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Dashboard section divider
 * Visual separator between content sections
 */
export function DashboardDivider({ className }: { className?: string }) {
  return (
    <div className={cn(
      "col-span-full h-px bg-border my-2",
      className
    )} />
  );
}

/**
 * Responsive dashboard container
 * Main wrapper for dashboard content
 */
export function DashboardContainer({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "min-h-screen bg-background",
      // Ensure proper text color in dark theme
      "text-foreground",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Pre-defined dashboard layouts for common use cases
 */
export const DashboardLayouts = {
  /**
   * Standard marketing dashboard layout
   * - Performance charts (large)
   * - Key metrics (small widgets)
   * - Activity feeds (medium widgets)
   */
  marketing: {
    areas: {
      performanceChart: "performance-chart",
      campaignMetrics: "campaign-metrics", 
      leadQuality: "lead-quality",
      activityHeatmap: "activity-heatmap",
      engagementVolume: "engagement-volume",
      channelMix: "channel-mix",
      aiAssistant: "ai-assistant"
    },
    template: `
      "performance-chart performance-chart performance-chart campaign-metrics"
      "activity-heatmap lead-quality engagement-volume channel-mix"
      "ai-assistant ai-assistant . ."
    `
  },

  /**
   * Executive summary layout
   * - Key metrics at the top
   * - Supporting charts below
   */
  executive: {
    areas: {
      kpiSummary: "kpi-summary",
      trendChart: "trend-chart",
      comparison: "comparison",
      insights: "insights"
    },
    template: `
      "kpi-summary kpi-summary kpi-summary kpi-summary"
      "trend-chart trend-chart comparison insights"
    `
  }
} as const;