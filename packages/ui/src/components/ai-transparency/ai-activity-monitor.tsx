"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "../badge";
import { Button } from "../button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { Progress } from "../progress";
import { ScrollArea } from "../scroll-area";
import {
  Activity,
  Brain,
  Target,
  MessageSquare,
  Clock,
  Zap,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  Play,
  Pause,
  Eye,
  TrendingUp,
  Users,
  Mail,
  Phone,
  Globe,
  Database,
  Cpu,
  Network,
  BarChart3,
} from "lucide-react";
import { cn } from "../../utils/cn";

interface AIActivity {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  status: "running" | "completed" | "failed" | "queued" | "paused";
  startTime: Date;
  endTime?: Date;
  progress?: number;
  details: {
    input?: any;
    output?: any;
    metrics?: Record<string, number>;
    logs?: Array<{
      timestamp: Date;
      level: "info" | "warn" | "error";
      message: string;
    }>;
  };
  priority: "high" | "medium" | "low";
  category:
    | "discovery"
    | "validation"
    | "personalization"
    | "execution"
    | "analysis"
    | "compliance";
}

interface SystemMetrics {
  totalActivities: number;
  runningActivities: number;
  completedToday: number;
  failureRate: number;
  averageExecutionTime: number;
  queueLength: number;
  cpuUsage: number;
  memoryUsage: number;
  apiCallsPerMinute: number;
  successRate: number;
}

interface AIActivityMonitorProps {
  activities: AIActivity[];
  metrics: SystemMetrics;
  onPauseActivity?: (activityId: string) => void;
  onRetryActivity?: (activityId: string) => void;
  onViewDetails?: (activityId: string) => void;
  className?: string;
}

const getActivityIcon = (category: AIActivity["category"]) => {
  switch (category) {
    case "discovery":
      return <Target className="h-4 w-4" />;
    case "validation":
      return <CheckCircle className="h-4 w-4" />;
    case "personalization":
      return <MessageSquare className="h-4 w-4" />;
    case "execution":
      return <Zap className="h-4 w-4" />;
    case "analysis":
      return <BarChart3 className="h-4 w-4" />;
    case "compliance":
      return <Shield className="h-4 w-4" />;
    default:
      return <Brain className="h-4 w-4" />;
  }
};

const getStatusColor = (status: AIActivity["status"]) => {
  switch (status) {
    case "running":
      return "text-blue-600 dark:text-blue-400";
    case "completed":
      return "text-green-600 dark:text-green-400";
    case "failed":
      return "text-red-600 dark:text-red-400";
    case "queued":
      return "text-yellow-600 dark:text-yellow-400";
    case "paused":
      return "text-gray-600 dark:text-gray-400";
  }
};

const getPriorityBadgeVariant = (priority: AIActivity["priority"]) => {
  switch (priority) {
    case "high":
      return "destructive" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "outline" as const;
  }
};

export function AIActivityMonitor({
  activities,
  metrics,
  onPauseActivity,
  onRetryActivity,
  onViewDetails,
  className,
}: AIActivityMonitorProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | AIActivity["status"]>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const filteredActivities = activities.filter(
    (activity) => filter === "all" || activity.status === filter,
  );

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const duration = end.getTime() - startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // This would normally trigger a refresh of activities
      console.log("Refreshing activities...");
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              AI Activity Monitor
            </h2>
            <p className="text-muted-foreground">
              Real-time view of AI agent activities
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center space-x-2"
          >
            {autoRefresh ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{autoRefresh ? "Pause" : "Resume"} Updates</span>
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Active Tasks</p>
                <p className="text-2xl font-bold">
                  {metrics.runningActivities}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.queueLength} queued
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(metrics.successRate)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.completedToday} completed today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Avg Duration</p>
                <p className="text-2xl font-bold">
                  {Math.round(metrics.averageExecutionTime)}s
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.apiCallsPerMinute} API calls/min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Network className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">System Load</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>CPU</span>
                    <span>{metrics.cpuUsage}%</span>
                  </div>
                  <Progress value={metrics.cpuUsage} className="h-1" />
                  <div className="flex justify-between text-xs">
                    <span>Memory</span>
                    <span>{metrics.memoryUsage}%</span>
                  </div>
                  <Progress value={metrics.memoryUsage} className="h-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Filter */}
      <div className="flex space-x-2">
        {(
          ["all", "running", "completed", "failed", "queued", "paused"] as const
        ).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
            {status === "all" && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activities.length}
              </Badge>
            )}
            {status !== "all" && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activities.filter((a) => a.status === status).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Activity List */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active & Recent Activities</CardTitle>
            <CardDescription>
              {filteredActivities.length} activities
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-3">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                      selectedActivity === activity.id &&
                        "bg-muted ring-2 ring-primary",
                    )}
                    onClick={() => setSelectedActivity(activity.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getActivityIcon(activity.category)}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm">
                              {activity.action}
                            </p>
                            <Badge
                              variant={getPriorityBadgeVariant(
                                activity.priority,
                              )}
                              className="text-xs"
                            >
                              {activity.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {activity.agentName}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDuration(
                                activity.startTime,
                                activity.endTime,
                              )}
                            </span>
                            <span>•</span>
                            <span className={getStatusColor(activity.status)}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {activity.status === "running" && onPauseActivity && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPauseActivity(activity.id);
                            }}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        {activity.status === "failed" && onRetryActivity && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRetryActivity(activity.id);
                            }}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        {onViewDetails && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(activity.id);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {activity.progress !== undefined &&
                      activity.status === "running" && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{Math.round(activity.progress)}%</span>
                          </div>
                          <Progress value={activity.progress} className="h-1" />
                        </div>
                      )}
                  </div>
                ))}
                {filteredActivities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activities found</p>
                    <p className="text-sm">
                      Activities will appear here when AI agents start working
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Activity Details */}
        {selectedActivity && (
          <Card>
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const activity = activities.find(
                  (a) => a.id === selectedActivity,
                );
                if (!activity) return <p>Activity not found</p>;

                return (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <div>
                        <p className="text-sm font-medium">Action</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.action}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Agent</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.agentName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <Badge
                          variant={
                            activity.status === "completed"
                              ? "default"
                              : activity.status === "failed"
                                ? "destructive"
                                : activity.status === "running"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {activity.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDuration(activity.startTime, activity.endTime)}
                        </p>
                      </div>
                    </div>

                    {activity.details.metrics &&
                      Object.keys(activity.details.metrics).length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Metrics</p>
                          <div className="space-y-2">
                            {Object.entries(activity.details.metrics).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="capitalize">
                                    {key.replace(/_/g, " ")}
                                  </span>
                                  <span className="font-mono">{value}</span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {activity.details.logs &&
                      activity.details.logs.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Logs</p>
                          <ScrollArea className="h-32 border rounded p-2">
                            <div className="space-y-1">
                              {activity.details.logs.map((log, index) => (
                                <div key={index} className="text-xs font-mono">
                                  <span className="text-muted-foreground">
                                    {log.timestamp.toLocaleTimeString()}
                                  </span>
                                  <span
                                    className={cn(
                                      "ml-2 px-1 rounded text-xs",
                                      log.level === "error" &&
                                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                                      log.level === "warn" &&
                                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                                      log.level === "info" &&
                                        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                                    )}
                                  >
                                    {log.level.toUpperCase()}
                                  </span>
                                  <span className="ml-2">{log.message}</span>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}

                    {activity.details.input && (
                      <div>
                        <p className="text-sm font-medium mb-2">Input</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(activity.details.input, null, 2)}
                        </pre>
                      </div>
                    )}

                    {activity.details.output && (
                      <div>
                        <p className="text-sm font-medium mb-2">Output</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(activity.details.output, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
