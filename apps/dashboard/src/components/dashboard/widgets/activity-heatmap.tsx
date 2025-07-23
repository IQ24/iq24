"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@iq24/ui/card";
import { Badge } from "@iq24/ui/badge";
import { Button } from "@iq24/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@iq24/ui/tabs";
import { 
  Activity, 
  Clock, 
  Users, 
  MousePointer,
  Eye,
  Calendar,
  RefreshCw,
  TrendingUp,
  Zap,
  Filter,
  Download,
  Info
} from "lucide-react";
import { cn } from "@iq24/ui/utils/cn";
import * as React from "react";
import { 
  generateActivityHeatmapData,
  formatNumber,
  formatPercentage,
  type ActivityHeatmapData,
  type HeatmapDay,
  type ActivityMetric
} from "./utils/mock-data";

/**
 * Activity Heatmap Widget
 * Shows user activity patterns over time periods with visual intensity mapping
 */

interface HeatmapCellProps {
  day: HeatmapDay;
  maxValue: number;
  onHover: (day: HeatmapDay | null) => void;
  onClick: (day: HeatmapDay) => void;
}

function HeatmapCell({ day, maxValue, onHover, onClick }: HeatmapCellProps) {
  const intensity = maxValue > 0 ? (day.value / maxValue) : 0;
  const opacityClass = intensity === 0 ? "opacity-10" : 
                      intensity < 0.25 ? "opacity-30" : 
                      intensity < 0.5 ? "opacity-50" : 
                      intensity < 0.75 ? "opacity-75" : "opacity-100";
  
  const sizeClass = intensity === 0 ? "w-2 h-2" : 
                   intensity < 0.5 ? "w-2.5 h-2.5" : 
                   intensity < 0.75 ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <div 
      className={cn(
        "rounded-sm bg-accent transition-all duration-200 cursor-pointer hover:scale-110 hover:opacity-100",
        opacityClass,
        sizeClass
      )}
      onMouseEnter={() => onHover(day)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(day)}
      title={`${day.date}: ${formatNumber(day.value)} ${day.label}`}
    />
  );
}

interface HeatmapGridProps {
  data: HeatmapDay[];
  onDaySelect: (day: HeatmapDay) => void;
  className?: string;
}

function HeatmapGrid({ data, onDaySelect, className }: HeatmapGridProps) {
  const [hoveredDay, setHoveredDay] = React.useState<HeatmapDay | null>(null);
  const maxValue = Math.max(...data.map(d => d.value));

  // Group data by weeks (7 days each)
  const weeks = React.useMemo(() => {
    const weekArray = [];
    for (let i = 0; i < data.length; i += 7) {
      weekArray.push(data.slice(i, i + 7));
    }
    return weekArray;
  }, [data]);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Day labels */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>Mon</span>
        <span>Wed</span>
        <span>Fri</span>
        <span>Sun</span>
      </div>
      
      {/* Heatmap grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex justify-between items-center gap-1">
            {week.map((day, dayIndex) => (
              <HeatmapCell
                key={`${weekIndex}-${dayIndex}`}
                day={day}
                maxValue={maxValue}
                onHover={setHoveredDay}
                onClick={onDaySelect}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Intensity scale */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>Less</span>
        <div className="flex items-center gap-1">
          {[0.1, 0.3, 0.5, 0.7, 1.0].map((opacity, index) => (
            <div
              key={index}
              className={cn("w-2 h-2 rounded-sm bg-accent", {
                "opacity-10": opacity === 0.1,
                "opacity-30": opacity === 0.3,
                "opacity-50": opacity === 0.5,
                "opacity-75": opacity === 0.7,
                "opacity-100": opacity === 1.0,
              })}
            />
          ))}
        </div>
        <span>More</span>
      </div>
      
      {/* Hover tooltip */}
      {hoveredDay && (
        <div className="mt-2 p-2 rounded-md bg-accent/10 border border-accent/20">
          <div className="text-sm font-medium">{hoveredDay.date}</div>
          <div className="text-xs text-muted-foreground">
            {formatNumber(hoveredDay.value)} {hoveredDay.label}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricsSummaryProps {
  metrics: ActivityMetric[];
}

function MetricsSummary({ metrics }: MetricsSummaryProps) {
  return (
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
            <div className="text-sm font-bold">{metric.value}</div>
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
  );
}

export function ActivityHeatmap() {
  const [data, setData] = React.useState<ActivityHeatmapData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = React.useState<"week" | "month" | "quarter">("month");
  const [selectedMetric, setSelectedMetric] = React.useState<"visits" | "engagement" | "conversions">("visits");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDay, setSelectedDay] = React.useState<HeatmapDay | null>(null);

  // Load data
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newData = generateActivityHeatmapData(selectedPeriod, selectedMetric);
      setData(newData);
      setIsLoading(false);
    };

    loadData();
  }, [selectedPeriod, selectedMetric]);

  const handleRefresh = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newData = generateActivityHeatmapData(selectedPeriod, selectedMetric);
    setData(newData);
    setIsLoading(false);
  };

  const handleDaySelect = (day: HeatmapDay) => {
    setSelectedDay(day);
  };

  if (isLoading || !data) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Activity Heatmap</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="animate-spin">
                <RefreshCw className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center h-48">
            <div className="text-sm text-muted-foreground">Loading activity data...</div>
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
              <Activity className="h-4 w-4" />
              <span>Activity Heatmap</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Visual representation of user activity over time
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {data.totalDays} days
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
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="h-8">
              <TabsTrigger value="week" className="text-xs px-3">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3">Month</TabsTrigger>
              <TabsTrigger value="quarter" className="text-xs px-3">Quarter</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedMetric === "visits" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("visits")}
                className="h-7 px-2 text-xs"
              >
                Visits
              </Button>
              <Button
                variant={selectedMetric === "engagement" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("engagement")}
                className="h-7 px-2 text-xs"
              >
                Engagement
              </Button>
              <Button
                variant={selectedMetric === "conversions" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("conversions")}
                className="h-7 px-2 text-xs"
              >
                Conversions
              </Button>
            </div>
          </div>

          <TabsContent value={selectedPeriod} className="mt-0 space-y-4">
            {/* Main Heatmap */}
            <div className="relative">
              <HeatmapGrid
                data={data.heatmapData}
                onDaySelect={handleDaySelect}
                className="mb-4"
              />
            </div>

            {/* Metrics Summary */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>Activity Insights</span>
                </h4>
                {selectedDay && (
                  <Badge variant="secondary" className="text-xs">
                    Selected: {selectedDay.date}
                  </Badge>
                )}
              </div>
              
              <MetricsSummary metrics={data.metrics} />
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold">{formatNumber(data.totalActivity)}</div>
                  <div className="text-xs text-muted-foreground">Total Activity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{formatNumber(data.avgDaily)}</div>
                  <div className="text-xs text-muted-foreground">Daily Avg</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{formatNumber(data.peakDay)}</div>
                  <div className="text-xs text-muted-foreground">Peak Day</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ActivityHeatmap;