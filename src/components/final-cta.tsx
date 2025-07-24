"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FinalCTA() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      
      {/* Glowing Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#65FFD8] to-transparent opacity-10" />
        <div className="h-full w-full bg-grid-white/[0.02] bg-grid-small" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-6">
            Ready to Transform Your Sales?
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Supercharge Your Growth Engine.
            <br />
            <span className="text-[#65FFD8]">Today.</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Join the AI revolution and transform your B2B sales process with our multi-agent intelligence platform.
          </p>
          <Button size="lg" className="bg-[#65FFD8] text-black hover:bg-[#4FDDBA] text-lg px-8 py-6">
            Request Early Access
          </Button>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-[#65FFD8] opacity-20 blur-3xl rounded-3xl" />
          
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl transform perspective-1000 rotate-x-12">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[#65FFD8] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">IQ24.ai Dashboard</h3>
                  <p className="text-gray-400 text-sm">AI-Native B2B Growth Engine</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#65FFD8] rounded-full animate-pulse" />
                <span className="text-[#65FFD8] text-sm">Live</span>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Campaign Performance */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">Campaign Performance</h4>
                  <span className="text-[#65FFD8] text-sm">↗ +24%</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Response Rate</span>
                    <span className="text-white">12.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lead Quality</span>
                    <span className="text-white">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conversion</span>
                    <span className="text-white">8.2%</span>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">AI Insights</h4>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-300">
                    "Tech companies show 3x higher engagement on Tuesday mornings"
                  </div>
                  <div className="text-sm text-gray-300">
                    "Personalized subject lines increase open rates by 47%"
                  </div>
                  <div className="text-sm text-gray-300">
                    "Financial sector prospects prefer LinkedIn over email"
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">Recent Activity</h4>
                  <span className="text-gray-400 text-sm">2 min ago</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#65FFD8] rounded-full" />
                    <span className="text-gray-300 text-sm">Lead scored: Sarah Chen (94%)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-gray-300 text-sm">Email personalized for TechFlow Inc</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-gray-300 text-sm">Compliance check passed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#65FFD8]">24.5K</div>
                  <div className="text-sm text-gray-400">Leads Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#65FFD8]">1.2K</div>
                  <div className="text-sm text-gray-400">Campaigns Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#65FFD8]">94%</div>
                  <div className="text-sm text-gray-400">Accuracy Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#65FFD8]">3.2x</div>
                  <div className="text-sm text-gray-400">ROI Increase</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}