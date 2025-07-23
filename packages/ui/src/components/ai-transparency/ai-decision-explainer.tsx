"use client";

import React, { useState } from "react";
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
import { Icons } from "../icons";
import { cn } from "../../utils/cn";

interface AIDecisionFactor {
  factor: string;
  weight: number;
  impact: "positive" | "negative" | "neutral";
  confidence: number;
  description: string;
  details?: string[];
}

interface AIDecision {
  id: string;
  decision: string;
  confidence: number;
  timestamp: Date;
  agent: string;
  category:
    | "lead_scoring"
    | "message_generation"
    | "timing_optimization"
    | "channel_selection"
    | "compliance_check";
  factors: AIDecisionFactor[];
  outcome?: "pending" | "success" | "failure" | "partial";
  userFeedback?: "positive" | "negative" | null;
  reasoning: string;
  alternatives?: Array<{
    option: string;
    score: number;
    reasoning: string;
  }>;
}

interface AIDecisionExplainerProps {
  decision: AIDecision;
  onFeedback?: (decisionId: string, feedback: "positive" | "negative") => void;
  onOverride?: (decisionId: string, newDecision: string) => void;
  className?: string;
}

const getDecisionIcon = (category: AIDecision["category"]) => {
  switch (category) {
    case "lead_scoring":
      return <Icons.Target className="h-4 w-4" />;
    case "message_generation":
      return <Icons.Brain className="h-4 w-4" />;
    case "timing_optimization":
      return <Icons.Clock className="h-4 w-4" />;
    case "channel_selection":
      return <Icons.Zap className="h-4 w-4" />;
    case "compliance_check":
      return <Icons.AlertTriangle className="h-4 w-4" />;
    default:
      return <Icons.Info className="h-4 w-4" />;
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return "text-green-600 dark:text-green-400";
  if (confidence >= 0.6) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

const getImpactColor = (impact: AIDecisionFactor["impact"]) => {
  switch (impact) {
    case "positive":
      return "text-green-600 dark:text-green-400";
    case "negative":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

export function AIDecisionExplainer({
  decision,
  onFeedback,
  onOverride,
  className,
}: AIDecisionExplainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const handleFeedback = (feedback: "positive" | "negative") => {
    onFeedback?.(decision.id, feedback);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getDecisionIcon(decision.category)}
            <div>
              <CardTitle className="text-lg">
                AI Decision: {decision.decision}
              </CardTitle>
              <CardDescription className="mt-1">
                Made by {decision.agent} • {decision.timestamp.toLocaleString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={
                decision.confidence >= 0.8
                  ? "default"
                  : decision.confidence >= 0.6
                    ? "secondary"
                    : "destructive"
              }
              className="ml-2"
            >
              {Math.round(decision.confidence * 100)}% confident
            </Badge>
            {decision.outcome && (
              <Badge
                variant={
                  decision.outcome === "success"
                    ? "default"
                    : decision.outcome === "failure"
                      ? "destructive"
                      : "secondary"
                }
              >
                {decision.outcome}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Reasoning */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            AI Reasoning
          </h4>
          <p className="text-sm text-muted-foreground">{decision.reasoning}</p>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Confidence Level</span>
            <span
              className={cn(
                "text-sm font-bold",
                getConfidenceColor(decision.confidence),
              )}
            >
              {Math.round(decision.confidence * 100)}%
            </span>
          </div>
          <Progress value={decision.confidence * 100} className="h-2" />
        </div>

        {/* Key Factors */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between p-0 h-auto"
          >
            <span className="font-medium">
              Key Decision Factors ({decision.factors.length})
            </span>
            {isExpanded ? (
              <Icons.ChevronDown className="h-4 w-4" />
            ) : (
              <Icons.ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {isExpanded && (
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              {decision.factors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{factor.factor}</span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={cn("text-xs", getImpactColor(factor.impact))}
                      >
                        {factor.impact}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(factor.weight * 100)}% weight
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {factor.description}
                  </p>
                  <Progress value={factor.confidence * 100} className="h-1" />
                  {factor.details && (
                    <ul className="text-xs text-muted-foreground ml-4">
                      {factor.details.map((detail, i) => (
                        <li key={i} className="list-disc">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alternative Options */}
        {decision.alternatives && decision.alternatives.length > 0 && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="w-full justify-between p-0 h-auto"
            >
              <span className="font-medium">
                Alternative Options ({decision.alternatives.length})
              </span>
              {showAlternatives ? (
                <Icons.ChevronDown className="h-4 w-4" />
              ) : (
                <Icons.ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {showAlternatives && (
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                {decision.alternatives.map((alt, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{alt.option}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(alt.score * 100)}% score
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {alt.reasoning}
                    </p>
                    {onOverride && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => onOverride(decision.id, alt.option)}
                      >
                        Use This Option
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Feedback */}
        {onFeedback && (
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm font-medium">
              Was this decision helpful?
            </span>
            <div className="flex space-x-2">
              <Button
                variant={
                  decision.userFeedback === "positive" ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleFeedback("positive")}
                className="flex items-center space-x-1"
              >
                <Icons.ThumbsUp className="h-3 w-3" />
                <span>Yes</span>
              </Button>
              <Button
                variant={
                  decision.userFeedback === "negative"
                    ? "destructive"
                    : "outline"
                }
                size="sm"
                onClick={() => handleFeedback("negative")}
                className="flex items-center space-x-1"
              >
                <Icons.ThumbsDown className="h-3 w-3" />
                <span>No</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example usage component
export function AIDecisionExplainerExample() {
  const exampleDecision: AIDecision = {
    id: "dec_123",
    decision: "Prioritize lead: Sarah Johnson (TechCorp)",
    confidence: 0.87,
    timestamp: new Date(),
    agent: "Prospect Discovery Agent",
    category: "lead_scoring",
    reasoning:
      "This lead shows high intent signals with recent website visits to pricing page, matches ideal customer profile, and has decision-making authority in her role as CTO.",
    factors: [
      {
        factor: "Intent Score",
        weight: 0.35,
        impact: "positive",
        confidence: 0.92,
        description: "High engagement with pricing content and product demos",
        details: [
          "Visited pricing page 3 times in last week",
          "Downloaded product whitepaper",
          "Attended webinar on enterprise features",
        ],
      },
      {
        factor: "ICP Match",
        weight: 0.25,
        impact: "positive",
        confidence: 0.89,
        description: "Strong alignment with ideal customer profile",
        details: [
          "Company size: 500+ employees (target: 100-1000)",
          "Industry: SaaS/Technology (target industry)",
          "Revenue: $50M+ (meets minimum threshold)",
        ],
      },
      {
        factor: "Decision Authority",
        weight: 0.2,
        impact: "positive",
        confidence: 0.85,
        description: "Has budget and technical decision-making power",
        details: [
          "CTO role with reported direct budget control",
          "Previously involved in similar technology purchases",
          "No approval hierarchy for tools under $100K",
        ],
      },
      {
        factor: "Timing",
        weight: 0.2,
        impact: "neutral",
        confidence: 0.7,
        description: "Company in potential evaluation phase",
        details: [
          "Recent job postings for DevOps roles",
          "Mentioned scaling challenges in recent interview",
          "Current contract with competitor expires in Q2",
        ],
      },
    ],
    alternatives: [
      {
        option: "Schedule for follow-up in 2 weeks",
        score: 0.65,
        reasoning:
          "Lower urgency approach to avoid seeming pushy, but may miss current evaluation window",
      },
      {
        option: "Add to nurture campaign",
        score: 0.43,
        reasoning:
          "Safe option but likely to result in lost opportunity due to active evaluation signals",
      },
    ],
    outcome: "pending",
    userFeedback: null,
  };

  const handleFeedback = (
    decisionId: string,
    feedback: "positive" | "negative",
  ) => {
    console.log("Feedback received:", decisionId, feedback);
    // Handle feedback logic here
  };

  const handleOverride = (decisionId: string, newDecision: string) => {
    console.log("Override requested:", decisionId, newDecision);
    // Handle override logic here
  };

  return (
    <AIDecisionExplainer
      decision={exampleDecision}
      onFeedback={handleFeedback}
      onOverride={handleOverride}
    />
  );
}
