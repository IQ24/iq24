"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Badge } from '../badge';
import { Button } from '../button';
import { Textarea } from '../textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { Progress } from '../progress';
import { 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Eye,
  Edit,
  ArrowRight,
  Brain,
  Lightbulb,
  Shield
} from 'lucide-react';

interface HumanReviewTask {
  id: string;
  type: 'content_review' | 'decision_override' | 'compliance_check' | 'strategy_approval';
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  aiAgent: string;
  aiDecision: string;
  aiConfidence: number;
  context: any;
  createdAt: Date;
  estimatedTime: number;
  requester: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'modified';
}

interface ReviewAction {
  type: 'approve' | 'reject' | 'modify' | 'escalate';
  reason?: string;
  modifications?: string;
  feedback?: string;
}

const mockTasks: HumanReviewTask[] = [
  {
    id: '1',
    type: 'content_review',
    title: 'High-Risk Email Content Detected',
    description: 'AI generated email contains language that may trigger spam filters',
    priority: 'high',
    aiAgent: 'OPA',
    aiDecision: 'Flag for human review before sending',
    aiConfidence: 67,
    context: {
      recipientCompany: 'TechCorp Inc.',
      emailSubject: 'Transform your sales process today!',
      riskFactors: ['Urgent language', 'Multiple exclamation marks', 'Sales-heavy terminology']
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    estimatedTime: 5,
    requester: 'Campaign: Q1 Enterprise Outreach',
    status: 'pending'
  },
  {
    id: '2',
    type: 'decision_override',
    title: 'Lead Scoring Disagreement',
    description: 'Human marked lead as high-value, but AI scored as low-priority',
    priority: 'medium',
    aiAgent: 'PDA',
    aiDecision: 'Score: 3/10 (Low Priority)',
    aiConfidence: 89,
    context: {
      leadName: 'Sarah Chen',
      company: 'DataFlow Solutions',
      humanScore: 9,
      aiFactors: ['Small company size', 'Low engagement history', 'Industry mismatch']
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    estimatedTime: 10,
    requester: 'Sales Rep: Mike Johnson',
    status: 'in_review'
  },
  {
    id: '3',
    type: 'compliance_check',
    title: 'GDPR Consent Verification',
    description: 'Verify consent status for EU prospects before outreach',
    priority: 'urgent',
    aiAgent: 'CGN',
    aiDecision: 'Block outreach - insufficient consent documentation',
    aiConfidence: 95,
    context: {
      region: 'European Union',
      prospects: 23,
      consentSource: 'Website form',
      dataAge: '45 days'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    estimatedTime: 15,
    requester: 'Compliance System',
    status: 'pending'
  }
];

export function HumanInTheLoop() {
  const [tasks, setTasks] = useState<HumanReviewTask[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<HumanReviewTask | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>({ type: 'approve' });
  const [activeTab, setActiveTab] = useState('pending');

  const handleTaskAction = (taskId: string, action: ReviewAction) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: action.type === 'approve' ? 'approved' : 
                   action.type === 'reject' ? 'rejected' : 
                   action.type === 'modify' ? 'modified' : task.status
          }
        : task
    ));
    setSelectedTask(null);
    setReviewAction({ type: 'approve' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'modified': return <Edit className="h-4 w-4 text-blue-500" />;
      case 'in_review': return <Eye className="h-4 w-4 text-amber-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content_review': return <MessageSquare className="h-4 w-4" />;
      case 'decision_override': return <Brain className="h-4 w-4" />;
      case 'compliance_check': return <Shield className="h-4 w-4" />;
      case 'strategy_approval': return <Lightbulb className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    switch (activeTab) {
      case 'pending': return task.status === 'pending';
      case 'in_review': return task.status === 'in_review';
      case 'completed': return ['approved', 'rejected', 'modified'].includes(task.status);
      default: return true;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Human-in-the-Loop Reviews</h2>
        <p className="text-muted-foreground">
          AI decisions requiring human oversight and approval
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span className="font-medium">Pending</span>
              </div>
              <Badge variant="secondary">
                {tasks.filter(t => t.status === 'pending').length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-500" />
                <span className="font-medium">In Review</span>
              </div>
              <Badge variant="secondary">
                {tasks.filter(t => t.status === 'in_review').length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Completed</span>
              </div>
              <Badge variant="secondary">
                {tasks.filter(t => ['approved', 'rejected', 'modified'].includes(t.status)).length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">Urgent</span>
              </div>
              <Badge variant="destructive">
                {tasks.filter(t => t.priority === 'urgent' && t.status === 'pending').length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_review">In Review</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTypeIcon(task.type)}
                          <h3 className="font-semibold">{task.title}</h3>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                          {getStatusIcon(task.status)}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{task.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">AI Agent</div>
                            <Badge variant="secondary">{task.aiAgent}</Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">AI Decision</div>
                            <div className="text-sm">{task.aiDecision}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Confidence</div>
                            <div className="flex items-center space-x-2">
                              <Progress value={task.aiConfidence} className="flex-1 h-2" />
                              <span className="text-sm">{task.aiConfidence}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Requester: {task.requester}</span>
                          <span>Est. Time: {task.estimatedTime}min</span>
                          <span>Created: {task.createdAt.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTask(task)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                {getTypeIcon(task.type)}
                                <span>{task.title}</span>
                              </DialogTitle>
                            </DialogHeader>
                            
                            {selectedTask && (
                              <div className="space-y-6">
                                {/* AI Decision Analysis */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">AI Analysis</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div>
                                      <div className="text-sm font-medium mb-1">Decision</div>
                                      <div className="p-3 bg-muted rounded-lg">{selectedTask.aiDecision}</div>
                                    </div>
                                    
                                    <div>
                                      <div className="text-sm font-medium mb-1">Confidence Level</div>
                                      <div className="flex items-center space-x-2">
                                        <Progress value={selectedTask.aiConfidence} className="flex-1" />
                                        <span className="text-sm font-medium">{selectedTask.aiConfidence}%</span>
                                      </div>
                                    </div>

                                    {selectedTask.context && (
                                      <div>
                                        <div className="text-sm font-medium mb-2">Context & Factors</div>
                                        <div className="space-y-2">
                                          {Object.entries(selectedTask.context).map(([key, value]) => (
                                            <div key={key} className="flex justify-between py-1 border-b border-border/50">
                                              <span className="text-sm text-muted-foreground">{key}:</span>
                                              <span className="text-sm">
                                                {Array.isArray(value) ? value.join(', ') : String(value)}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Human Review Actions */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Your Review</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      <Button
                                        variant={reviewAction.type === 'approve' ? 'default' : 'outline'}
                                        className="w-full"
                                        onClick={() => setReviewAction({ type: 'approve' })}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        variant={reviewAction.type === 'reject' ? 'destructive' : 'outline'}
                                        className="w-full"
                                        onClick={() => setReviewAction({ type: 'reject' })}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                      <Button
                                        variant={reviewAction.type === 'modify' ? 'default' : 'outline'}
                                        className="w-full"
                                        onClick={() => setReviewAction({ type: 'modify' })}
                                      >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Modify
                                      </Button>
                                      <Button
                                        variant={reviewAction.type === 'escalate' ? 'secondary' : 'outline'}
                                        className="w-full"
                                        onClick={() => setReviewAction({ type: 'escalate' })}
                                      >
                                        <ArrowRight className="h-4 w-4 mr-1" />
                                        Escalate
                                      </Button>
                                    </div>

                                    {(reviewAction.type === 'reject' || reviewAction.type === 'escalate') && (
                                      <div>
                                        <label className="text-sm font-medium">Reason</label>
                                        <Textarea
                                          placeholder="Please explain your decision..."
                                          value={reviewAction.reason || ''}
                                          onChange={(e) => setReviewAction({
                                            ...reviewAction,
                                            reason: e.target.value
                                          })}
                                          className="mt-1"
                                        />
                                      </div>
                                    )}

                                    {reviewAction.type === 'modify' && (
                                      <div>
                                        <label className="text-sm font-medium">Modifications</label>
                                        <Textarea
                                          placeholder="Describe the changes you want to make..."
                                          value={reviewAction.modifications || ''}
                                          onChange={(e) => setReviewAction({
                                            ...reviewAction,
                                            modifications: e.target.value
                                          })}
                                          className="mt-1"
                                        />
                                      </div>
                                    )}

                                    <div>
                                      <label className="text-sm font-medium">Feedback for AI (Optional)</label>
                                      <Textarea
                                        placeholder="Provide feedback to help improve AI decisions..."
                                        value={reviewAction.feedback || ''}
                                        onChange={(e) => setReviewAction({
                                          ...reviewAction,
                                          feedback: e.target.value
                                        })}
                                        className="mt-1"
                                      />
                                    </div>

                                    <div className="flex justify-end space-x-2 pt-4">
                                      <Button variant="outline">Cancel</Button>
                                      <Button onClick={() => handleTaskAction(selectedTask.id, reviewAction)}>
                                        Submit Review
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {task.status === 'pending' && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTaskAction(task.id, { type: 'approve' })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTaskAction(task.id, { type: 'reject' })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks found for this category
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}