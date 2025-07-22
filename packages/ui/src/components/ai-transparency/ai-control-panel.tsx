"use client"

import React, { useState } from 'react'
import { Badge } from "../badge"
import { Button } from "../button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card"
import { Label } from "../label"
import { Slider } from "../slider"
import { Switch } from "../switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select"
import { Textarea } from "../textarea"
import { 
  Settings, 
  Brain, 
  Target, 
  MessageSquare, 
  Clock, 
  Zap, 
  Shield, 
  Play, 
  Pause, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info,
  Sliders
} from "lucide-react"
import { cn } from "../../utils/cn"

interface AIAgentConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  autonomyLevel: number // 0-100
  aggressiveness: number // 0-100
  customInstructions?: string
  constraints: Array<{
    type: string
    value: any
    description: string
  }>
}

interface AISystemConfig {
  globalSettings: {
    masterSwitch: boolean
    humanApprovalRequired: boolean
    maxDailyActions: number
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    fallbackBehavior: 'pause' | 'continue' | 'notify'
  }
  agents: AIAgentConfig[]
  complianceSettings: {
    strictMode: boolean
    requiredApprovals: string[]
    blockedDomains: string[]
    contentFilters: Array<{
      type: string
      enabled: boolean
      sensitivity: number
    }>
  }
}

interface AIControlPanelProps {
  config: AISystemConfig
  onConfigChange: (config: AISystemConfig) => void
  className?: string
}

const agentIcons: Record<string, React.ReactNode> = {
  'prospect-discovery': <Target className="h-4 w-4" />,
  'validation-enrichment': <CheckCircle className="h-4 w-4" />,
  'personalization': <MessageSquare className="h-4 w-4" />,
  'campaign-execution': <Zap className="h-4 w-4" />,
  'analytics-feedback': <Info className="h-4 w-4" />,
  'compliance': <Shield className="h-4 w-4" />,
  'orchestration': <Brain className="h-4 w-4" />
}

export function AIControlPanel({ config, onConfigChange, className }: AIControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'agents' | 'compliance'>('global')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const updateGlobalSetting = <K extends keyof AISystemConfig['globalSettings']>(
    key: K,
    value: AISystemConfig['globalSettings'][K]
  ) => {
    onConfigChange({
      ...config,
      globalSettings: {
        ...config.globalSettings,
        [key]: value
      }
    })
  }

  const updateAgentConfig = (agentId: string, updates: Partial<AIAgentConfig>) => {
    onConfigChange({
      ...config,
      agents: config.agents.map(agent =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      )
    })
  }

  const updateComplianceSetting = <K extends keyof AISystemConfig['complianceSettings']>(
    key: K,
    value: AISystemConfig['complianceSettings'][K]
  ) => {
    onConfigChange({
      ...config,
      complianceSettings: {
        ...config.complianceSettings,
        [key]: value
      }
    })
  }

  const emergencyStop = () => {
    onConfigChange({
      ...config,
      globalSettings: {
        ...config.globalSettings,
        masterSwitch: false,
        fallbackBehavior: 'pause'
      },
      agents: config.agents.map(agent => ({ ...agent, enabled: false }))
    })
  }

  const resetToDefaults = () => {
    // Implementation would reset to system defaults
    console.log('Reset to defaults requested')
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Control Panel</h2>
          <p className="text-muted-foreground">
            Configure and monitor your AI agents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={config.globalSettings.masterSwitch ? "default" : "destructive"}>
            {config.globalSettings.masterSwitch ? "Active" : "Paused"}
          </Badge>
          <Button
            variant="destructive"
            size="sm"
            onClick={emergencyStop}
            className="flex items-center space-x-2"
          >
            <Pause className="h-4 w-4" />
            <span>Emergency Stop</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 p-1 bg-muted rounded-lg">
        {(['global', 'agents', 'compliance'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="flex-1 capitalize"
          >
            {tab === 'global' && <Settings className="h-4 w-4 mr-2" />}
            {tab === 'agents' && <Brain className="h-4 w-4 mr-2" />}
            {tab === 'compliance' && <Shield className="h-4 w-4 mr-2" />}
            {tab}
          </Button>
        ))}
      </div>

      {/* Global Settings Tab */}
      {activeTab === 'global' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>System Control</span>
              </CardTitle>
              <CardDescription>
                Master controls for the entire AI system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="master-switch">Master AI Switch</Label>
                <Switch
                  id="master-switch"
                  checked={config.globalSettings.masterSwitch}
                  onCheckedChange={(checked) => updateGlobalSetting('masterSwitch', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="approval-required">Require Human Approval</Label>
                <Switch
                  id="approval-required"
                  checked={config.globalSettings.humanApprovalRequired}
                  onCheckedChange={(checked) => updateGlobalSetting('humanApprovalRequired', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Daily Actions</Label>
                <Slider
                  value={[config.globalSettings.maxDailyActions]}
                  onValueChange={([value]) => updateGlobalSetting('maxDailyActions', value)}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground text-right">
                  {config.globalSettings.maxDailyActions} actions/day
                </div>
              </div>

              <div className="space-y-2">
                <Label>Risk Tolerance</Label>
                <Select
                  value={config.globalSettings.riskTolerance}
                  onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') =>
                    updateGlobalSetting('riskTolerance', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fallback Behavior</Label>
                <Select
                  value={config.globalSettings.fallbackBehavior}
                  onValueChange={(value: 'pause' | 'continue' | 'notify') =>
                    updateGlobalSetting('fallbackBehavior', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pause">Pause Operations</SelectItem>
                    <SelectItem value="continue">Continue with Caution</SelectItem>
                    <SelectItem value="notify">Notify and Wait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>
                Emergency controls and system management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={emergencyStop}
              >
                <Pause className="h-4 w-4 mr-2" />
                Emergency Stop All Agents
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={resetToDefaults}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>

              <div className="pt-4 border-t">
                <div className="text-sm font-medium mb-2">System Status</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Agents:</span>
                    <span>{config.agents.filter(a => a.enabled).length}/{config.agents.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Actions Today:</span>
                    <span>247/{config.globalSettings.maxDailyActions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>System Health:</span>
                    <Badge variant="default" className="text-xs">Optimal</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {config.agents.map((agent) => (
              <Card 
                key={agent.id} 
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedAgent === agent.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {agentIcons[agent.id] || <Brain className="h-4 w-4" />}
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                    </div>
                    <Switch
                      checked={agent.enabled}
                      onCheckedChange={(checked) => updateAgentConfig(agent.id, { enabled: checked })}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <CardDescription className="text-sm">
                    {agent.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Autonomy Level</span>
                        <span>{agent.autonomyLevel}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${agent.autonomyLevel}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Aggressiveness</span>
                        <span>{agent.aggressiveness}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${agent.aggressiveness}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Agent Details */}
          {selectedAgent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sliders className="h-5 w-5" />
                  <span>Configure {config.agents.find(a => a.id === selectedAgent)?.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(() => {
                  const agent = config.agents.find(a => a.id === selectedAgent)
                  if (!agent) return null

                  return (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Autonomy Level ({agent.autonomyLevel}%)</Label>
                          <Slider
                            value={[agent.autonomyLevel]}
                            onValueChange={([value]) => updateAgentConfig(agent.id, { autonomyLevel: value })}
                            max={100}
                            min={0}
                            step={5}
                          />
                          <p className="text-xs text-muted-foreground">
                            Higher values allow more independent decision-making
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Aggressiveness ({agent.aggressiveness}%)</Label>
                          <Slider
                            value={[agent.aggressiveness]}
                            onValueChange={([value]) => updateAgentConfig(agent.id, { aggressiveness: value })}
                            max={100}
                            min={0}
                            step={5}
                          />
                          <p className="text-xs text-muted-foreground">
                            Controls how assertive the agent is in its actions
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Custom Instructions</Label>
                        <Textarea
                          placeholder="Add specific instructions for this agent..."
                          value={agent.customInstructions || ''}
                          onChange={(e) => updateAgentConfig(agent.id, { customInstructions: e.target.value })}
                          rows={4}
                        />
                      </div>

                      {agent.constraints && agent.constraints.length > 0 && (
                        <div className="space-y-3">
                          <Label>Active Constraints</Label>
                          {agent.constraints.map((constraint, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-sm">{constraint.type}</div>
                                  <div className="text-xs text-muted-foreground">{constraint.description}</div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {typeof constraint.value === 'boolean' 
                                    ? (constraint.value ? 'Enabled' : 'Disabled')
                                    : String(constraint.value)
                                  }
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Compliance Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Strict Compliance Mode</Label>
                <Switch
                  checked={config.complianceSettings.strictMode}
                  onCheckedChange={(checked) => updateComplianceSetting('strictMode', checked)}
                />
              </div>

              <div className="space-y-3">
                <Label>Content Filters</Label>
                {config.complianceSettings.contentFilters.map((filter, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={filter.enabled}
                        onCheckedChange={(checked) => {
                          const newFilters = [...config.complianceSettings.contentFilters]
                          newFilters[index] = { ...filter, enabled: checked }
                          updateComplianceSetting('contentFilters', newFilters)
                        }}
                      />
                      <span className="text-sm capitalize">{filter.type}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {filter.sensitivity}% sensitivity
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {config.complianceSettings.requiredApprovals.map((approval, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm">{approval}</span>
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </div>
                ))}
                {config.complianceSettings.requiredApprovals.length === 0 && (
                  <p className="text-sm text-muted-foreground">No approvals required</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}