"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function Features() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4">
            Smarter Sales. Faster Growth.
            <br />
            Stronger Teams.
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-24">
          {/* Feature 1 - Automated Lead Scoring */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">
                Automated Lead Scoring & Enrichment
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Our system doesn't just find names; it finds signals. The Prospect Discovery and 
                Validation Agents analyze thousands of data points to score leads based on 
                predicted intent, ensuring your team always focuses on the highest-potential opportunities.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="absolute inset-0 bg-[#65FFD8] opacity-5 rounded-2xl blur-xl" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Lead Pipeline</span>
                    <span className="text-sm text-[#65FFD8]">Live</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Sarah Chen", company: "TechFlow Inc", score: "94%", status: "High Intent" },
                      { name: "Michael Rodriguez", company: "DataVault", score: "89%", status: "High Intent" },
                      { name: "Emma Thompson", company: "CloudSync", score: "76%", status: "Medium Intent" },
                    ].map((lead, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{lead.name}</div>
                          <div className="text-sm text-gray-400">{lead.company}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#65FFD8] font-semibold">{lead.score}</div>
                          <div className="text-xs text-gray-400">{lead.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2 - Conversational AI */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="relative order-2 md:order-1">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="absolute inset-0 bg-[#65FFD8] opacity-5 rounded-2xl blur-xl" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">AI Assistant</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#65FFD8] rounded-full animate-pulse" />
                      <span className="text-sm text-[#65FFD8]">Active</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-white text-sm">
                        "Draft a personalized email for Sarah Chen at TechFlow Inc"
                      </p>
                    </div>
                    <div className="p-3 bg-[#65FFD8] bg-opacity-10 rounded-lg border border-[#65FFD8] border-opacity-20">
                      <p className="text-white text-sm">
                        I've crafted a personalized email highlighting TechFlow's recent Series A funding and 
                        how our AI automation can help scale their sales operations...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <h3 className="text-2xl font-semibold text-white">
                Conversational AI & Multi-Sensory Outreach
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Engage prospects with natural, human-level interactions. Query your data, draft emails, 
                and get strategic advice using our AI Assistant. With MSEO, you can even orchestrate 
                campaigns that include AI-generated voice notes and personalized visuals.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 - Compliance Guardian */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">
                Proactive Compliance Guardian
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Operate with confidence. The CGN agent automatically screens every outbound message 
                against global regulations like GDPR and CCPA. It's compliance, built-in and automated, 
                not an afterthought.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="absolute inset-0 bg-[#65FFD8] opacity-5 rounded-2xl blur-xl" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Compliance Check</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-green-500">Passed</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">GDPR Compliance</div>
                        <div className="text-sm text-gray-400">All regulations met</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">
                      ✓ Consent mechanisms verified<br />
                      ✓ Data processing justified<br />
                      ✓ Opt-out options included
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}