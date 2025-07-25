import { Badge } from "@iq24/ui/badge";

export function Features() {
  return (
    <section className="relative py-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 bg-white/5 border-white/10 text-[#65FFD8]">
            Features
          </Badge>
          <h2 className="text-5xl font-semibold text-white mb-6 font-mono">
            Smarter Sales. Faster Growth.<br />Stronger Teams.
          </h2>
        </div>

        {/* Features Grid - Alternating Layout */}
        <div className="space-y-32">
          {/* Feature 1 - Image Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-medium text-white font-mono">
                Automated Lead Scoring & Enrichment
              </h3>
              <p className="text-lg text-[#A2A8B4] leading-relaxed">
                Our system doesn't just find names; it finds signals. The Prospect Discovery and 
                Validation Agents analyze thousands of data points to score leads based on predicted 
                intent, ensuring your team always focuses on the highest-potential opportunities.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#65FFD8]/20 blur-3xl rounded-full"></div>
              <div className="relative bg-[#1A1D21]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A2A8B4] font-mono">Lead Quality Dashboard</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#65FFD8] rounded-full"></div>
                      <span className="text-xs text-[#65FFD8] font-mono">LIVE</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white font-mono">High Intent Leads</span>
                      <span className="text-[#65FFD8] font-mono">87%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white font-mono">Conversion Rate</span>
                      <span className="text-[#65FFD8] font-mono">24.3%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white font-mono">Data Enrichment</span>
                      <span className="text-[#65FFD8] font-mono">98.7%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - Image Left */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative lg:order-1">
              <div className="absolute inset-0 bg-[#65FFD8]/20 blur-3xl rounded-full"></div>
              <div className="relative bg-[#1A1D21]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A2A8B4] font-mono">AI Assistant</span>
                    <div className="w-3 h-3 bg-[#65FFD8] rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[#65FFD8]/20 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-[#65FFD8] rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-white/5 rounded-lg p-3">
                        <p className="text-white text-sm font-mono">
                          "Draft a personalized outreach for John Smith at TechCorp, referencing their recent Series B funding"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-[#65FFD8] text-xs font-mono">AI</span>
                      </div>
                      <div className="flex-1 bg-[#65FFD8]/10 rounded-lg p-3">
                        <p className="text-white text-sm font-mono">
                          "Subject: Congrats on TechCorp's $50M Series B! 🎉
                          
                          Hi John, saw the exciting news about your Series B. With this growth, you might be scaling your team..."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 lg:order-2">
              <h3 className="text-2xl font-medium text-white font-mono">
                Conversational AI & Multi-Sensory Outreach
              </h3>
              <p className="text-lg text-[#A2A8B4] leading-relaxed">
                Engage prospects with natural, human-level interactions. Query your data, draft emails, 
                and get strategic advice using our AI Assistant. With MSEO, you can even orchestrate 
                campaigns that include AI-generated voice notes and personalized visuals.
              </p>
            </div>
          </div>

          {/* Feature 3 - Image Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-medium text-white font-mono">
                Proactive Compliance Guardian
              </h3>
              <p className="text-lg text-[#A2A8B4] leading-relaxed">
                Operate with confidence. The CGN agent automatically screens every outbound message 
                against global regulations like GDPR and CCPA. It's compliance, built-in and automated, 
                not an afterthought.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#65FFD8]/20 blur-3xl rounded-full"></div>
              <div className="relative bg-[#1A1D21]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A2A8B4] font-mono">Compliance Check</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-500 font-mono">PASSED</span>
                    </div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-green-400 font-mono text-sm font-medium">All Checks Passed</p>
                        <p className="text-green-400/80 font-mono text-xs">GDPR, CCPA, CAN-SPAM Compliant</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#A2A8B4] font-mono">
                    Message screened against 127 compliance rules
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