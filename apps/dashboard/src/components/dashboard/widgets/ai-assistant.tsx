"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@iq24/ui/card";
import { Button } from "@iq24/ui/button";
import { Input } from "@iq24/ui/input";
import { Badge } from "@iq24/ui/badge";
import { ScrollArea } from "@iq24/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@iq24/ui/tabs";
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Target,
  BarChart3,
  MessageSquare,
  Zap,
  Brain,
  ArrowRight,
  Clock,
  CheckCircle,
  Users,
  DollarSign
} from "lucide-react";
import { cn } from "@iq24/ui/utils/cn";
import { 
  subtleHover, 
  buttonPress, 
  cardEntrance, 
  accentGlow,
  staggerChildren,
  modalEntrance,
  shimmer
} from "./utils/animation-utils";

// Types for AI Assistant
interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface Insight {
  id: string;
  type: "opportunity" | "warning" | "recommendation" | "trend";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionable: boolean;
  metrics?: {
    label: string;
    value: string;
    change?: string;
  }[];
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "optimization" | "analysis" | "reporting";
}

// Mock data generators
const generateInsights = (): Insight[] => [
  {
    id: "1",
    type: "opportunity",
    title: "Email Campaign Optimization",
    description: "Your email campaigns have 35% higher CTR than industry average. Consider increasing email budget allocation.",
    impact: "high",
    actionable: true,
    metrics: [
      { label: "Current CTR", value: "4.2%", change: "+12%" },
      { label: "Potential Uplift", value: "$8,400" }
    ]
  },
  {
    id: "2", 
    type: "warning",
    title: "Social Media Performance Drop",
    description: "Social engagement has decreased by 18% over the last 7 days. Consider refreshing creative assets.",
    impact: "medium",
    actionable: true,
    metrics: [
      { label: "Engagement Rate", value: "2.1%", change: "-18%" },
      { label: "Reach Impact", value: "-12,500" }
    ]
  },
  {
    id: "3",
    type: "trend",
    title: "Search Traffic Growing",
    description: "Organic search traffic increased 22% month-over-month. SEO efforts are paying off.",
    impact: "high",
    actionable: false,
    metrics: [
      { label: "Traffic Growth", value: "+22%", change: "+22%" },
      { label: "Conversion Impact", value: "+$3,200" }
    ]
  },
  {
    id: "4",
    type: "recommendation",
    title: "Cross-Channel Attribution",
    description: "Users touching 3+ channels convert 40% more. Focus on multi-channel customer journeys.",
    impact: "medium",
    actionable: true,
    metrics: [
      { label: "Multi-touch CVR", value: "8.4%" },
      { label: "Single-touch CVR", value: "6.1%" }
    ]
  }
];

const generateQuickActions = (): QuickAction[] => [
  {
    id: "1",
    title: "Campaign Performance Review",
    description: "Analyze top performing campaigns",
    icon: <BarChart3 className="w-4 h-4" />,
    category: "analysis"
  },
  {
    id: "2",
    title: "Budget Optimization",
    description: "Get AI recommendations for budget reallocation",
    icon: <Target className="w-4 h-4" />,
    category: "optimization"
  },
  {
    id: "3",
    title: "Audience Insights",
    description: "Deep dive into audience segments",
    icon: <Users className="w-4 h-4" />,
    category: "analysis"
  },
  {
    id: "4",
    title: "Weekly Report",
    description: "Generate automated performance report",
    icon: <DollarSign className="w-4 h-4" />,
    category: "reporting"
  }
];

// Sample conversation for demo
const generateSampleMessages = (): Message[] => [
  {
    id: "1",
    type: "assistant",
    content: "👋 Hi! I'm your AI Marketing Assistant. I can help you analyze campaign performance, optimize budgets, and provide actionable insights. What would you like to know?",
    timestamp: new Date(Date.now() - 300000),
    suggestions: ["Show me top performing campaigns", "What's my ROI this month?", "Optimize my ad spend"]
  }
];

// Component for individual insight cards
const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
  const getInsightIcon = () => {
    switch (insight.type) {
      case "opportunity": return <TrendingUp className="w-4 h-4" />;
      case "warning": return <AlertTriangle className="w-4 h-4" />;
      case "recommendation": return <Lightbulb className="w-4 h-4" />;
      case "trend": return <Sparkles className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = () => {
    switch (insight.type) {
      case "opportunity": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "warning": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "recommendation": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "trend": return "text-numora-accent bg-numora-accent/10 border-numora-accent/20";
    }
  };

  const getImpactBadge = () => {
    const colors = {
      high: "bg-red-500/10 text-red-400 border-red-500/20",
      medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      low: "bg-green-500/10 text-green-400 border-green-500/20"
    };
    return colors[insight.impact];
  };

  return (
    <div className="p-4 rounded-lg border border-numora-gray-800/50 bg-numora-gray-900/30 hover:bg-numora-gray-900/50 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getInsightColor()}`}>
            {getInsightIcon()}
          </div>
          <div>
            <h4 className="font-medium text-white">{insight.title}</h4>
            <Badge variant="outline" className={getImpactBadge()}>
              {insight.impact} impact
            </Badge>
          </div>
        </div>
        {insight.actionable && (
          <Button size="sm" variant="outline" className="text-numora-accent border-numora-accent/20 hover:bg-numora-accent/10">
            <ArrowRight className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      <p className="text-sm text-numora-gray-300 mb-3">{insight.description}</p>
      
      {insight.metrics && (
        <div className="grid grid-cols-2 gap-3">
          {insight.metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-numora-gray-400">{metric.label}</div>
              <div className="font-medium text-white flex items-center justify-center gap-1">
                {metric.value}
                {metric.change && (
                  <span className={`text-xs ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Chat message component
const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.type === "user";
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-numora-accent/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-numora-accent" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div className={`p-3 rounded-lg ${
          isUser 
          ? 'bg-numora-accent text-black ml-auto' 
          : 'bg-numora-gray-800/50 text-white'
        }`}>
          <p className="text-sm">{message.content}</p>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-numora-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        {message.suggestions && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs text-numora-accent border-numora-accent/20 hover:bg-numora-accent/10"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-numora-gray-700 flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

// Main AI Assistant Widget
export const AIAssistantWidget: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>(generateSampleMessages());
  const [inputValue, setInputValue] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("chat");

  const insights = React.useMemo(() => generateInsights(), []);
  const quickActions = React.useMemo(() => generateQuickActions(), []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user", 
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on your recent campaign data, I recommend focusing on email marketing as it's showing the highest ROI at 4.2x return on ad spend.",
        "Your search campaigns are performing well with a 22% increase in traffic. Consider expanding keyword targeting in high-converting categories.",
        "I've analyzed your audience segments and found that users aged 25-34 have 40% higher conversion rates. Consider reallocating budget to target this demographic.",
        "Your social media engagement has dropped recently. I suggest A/B testing new creative formats and posting at optimal times based on your audience activity.",
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: randomResponse,
        timestamp: new Date(),
        suggestions: ["Tell me more", "Show me the data", "What's next?"]
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: action.title,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setActiveTab("chat");
  };

  return (
    <Card className={cn("w-full h-full bg-numora-gray-900/50 border-numora-gray-800/50 backdrop-blur-sm flex flex-col", cardEntrance)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-numora-accent/10">
              <Bot className="w-5 h-5 text-numora-accent" />
            </div>
            <div>
              <CardTitle className="text-white">AI Assistant</CardTitle>
              <p className="text-sm text-numora-gray-400 mt-1">
                Marketing insights and recommendations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-numora-gray-800/50">
            <TabsTrigger 
              value="chat"
              className="data-[state=active]:bg-numora-accent data-[state=active]:text-black"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="insights"
              className="data-[state=active]:bg-numora-accent data-[state=active]:text-black"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger 
              value="actions"
              className="data-[state=active]:bg-numora-accent data-[state=active]:text-black"
            >
              <Zap className="w-4 h-4 mr-2" />
              Actions
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
            <ScrollArea className="flex-1 pr-4">
              <div className={cn("space-y-4", staggerChildren)}>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-numora-accent/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-numora-accent" />
                    </div>
                    <div className="bg-numora-gray-800/50 text-white p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-numora-accent rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-numora-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-numora-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="mt-4 flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your campaigns..."
                className="flex-1 bg-numora-gray-800/50 border-numora-gray-700 text-white placeholder:text-numora-gray-400"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className={cn("bg-numora-accent hover:bg-numora-accent/90 text-black", buttonPress)}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="flex-1 mt-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="flex-1 mt-4">
            <div className="space-y-4">
              {quickActions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className={cn("p-4 rounded-lg border border-numora-gray-800/50 bg-numora-gray-900/30 cursor-pointer group", subtleHover)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-numora-accent/10 text-numora-accent group-hover:bg-numora-accent/20 transition-colors">
                        {action.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{action.title}</h4>
                        <p className="text-sm text-numora-gray-400">{action.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-numora-accent border-numora-accent/20">
                      {action.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIAssistantWidget;