import { Button } from "@iq24/ui/button";

export function FinalCTA() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#65FFD8]/5 to-transparent"></div>
        <svg 
          className="absolute inset-0 w-full h-full opacity-20" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path 
                d="M 40 0 L 0 0 0 40" 
                fill="none" 
                stroke="rgba(101, 255, 216, 0.1)" 
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Main Content */}
        <div className="text-center mb-16">
          <h2 className="text-6xl font-semibold text-white mb-8 font-mono">
            Supercharge Your Growth<br />Engine. Today.
          </h2>
          <p className="text-xl text-[#A2A8B4] mb-12 max-w-2xl mx-auto leading-relaxed">
            Join forward-thinking teams who've already transformed their sales process with AI-native intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-[#65FFD8] text-[#0A0B0D] hover:bg-[#65FFD8]/90 font-mono font-medium px-8 py-4 text-lg"
            >
              Request Early Access
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-[#65FFD8] text-[#65FFD8] hover:bg-[#65FFD8]/10 font-mono font-medium px-8 py-4 text-lg"
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Dashboard Mockup - "Money Shot" */}
        <div className="relative max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-[#65FFD8]/20 blur-3xl rounded-full"></div>
          
          {/* Main Dashboard Container */}
          <div className="relative perspective-1000">
            <div className="transform rotate-x-12 bg-[#0A0B0D]/90 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
              {/* Dashboard Header */}
              <div className="bg-[#1A1D21]/80 border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-white font-mono text-sm">IQ24.ai Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#65FFD8] rounded-full animate-pulse"></div>
                    <span className="text-[#65FFD8] font-mono text-xs">LIVE</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Performance Metrics */}
                <div className="bg-[#1A1D21]/60 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#A2A8B4] font-mono text-sm">Performance</span>
                    <div className="text-[#65FFD8] font-mono text-xs">+247%</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white font-mono text-xs">Conversion Rate</span>
                      <span className="text-[#65FFD8] font-mono text-xs">24.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white font-mono text-xs">Lead Quality</span>
                      <span className="text-[#65FFD8] font-mono text-xs">94.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white font-mono text-xs">Response Rate</span>
                      <span className="text-[#65FFD8] font-mono text-xs">67.8%</span>
                    </div>
                  </div>
                </div>

                {/* AI Agent Status */}
                <div className="bg-[#1A1D21]/60 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#A2A8B4] font-mono text-sm">AI Agents</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white font-mono text-xs">PDA Agent</span>
                      <span className="text-green-400 font-mono text-xs">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white font-mono text-xs">OPA Agent</span>
                      <span className="text-green-400 font-mono text-xs">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white font-mono text-xs">CGN Agent</span>
                      <span className="text-green-400 font-mono text-xs">Active</span>
                    </div>
                  </div>
                </div>

                {/* Campaign Status */}
                <div className="bg-[#1A1D21]/60 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#A2A8B4] font-mono text-sm">Campaigns</span>
                    <div className="text-[#65FFD8] font-mono text-xs">12 Active</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white font-mono text-xs">Sent Today</span>
                      <span className="text-[#65FFD8] font-mono text-xs">2,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white font-mono text-xs">Opened</span>
                      <span className="text-[#65FFD8] font-mono text-xs">1,923</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white font-mono text-xs">Replied</span>
                      <span className="text-[#65FFD8] font-mono text-xs">467</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Chart Area */}
              <div className="px-6 pb-6">
                <div className="bg-[#1A1D21]/60 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#A2A8B4] font-mono text-sm">Revenue Growth</span>
                    <span className="text-[#65FFD8] font-mono text-xs">Last 30 days</span>
                  </div>
                  {/* Simplified Chart Visualization */}
                  <div className="flex items-end space-x-1 h-16">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-[#65FFD8]/30 flex-1 rounded-t"
                        style={{ 
                          height: `${Math.random() * 60 + 20}%`,
                          background: i > 20 ? '#65FFD8' : 'rgba(101, 255, 216, 0.3)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}