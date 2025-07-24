"use client";

import { useState } from "react";
import { Badge } from "@iq24/ui/badge";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does your AI improve my sales process?",
    answer: "IQ24.ai deploys multiple specialized AI agents that work together to automate prospecting, validate leads, craft personalized outreach, and continuously optimize your campaigns. Our system learns from your data and interactions to improve performance over time, typically increasing conversion rates by 3-5x within the first 90 days."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption, SOC 2 Type II compliance, and zero-trust architecture. Your data is processed in secure, isolated environments and never used to train models for other customers. We also maintain GDPR and CCPA compliance through our automated Compliance Guardian Network."
  },
  {
    question: "Can I integrate this with my CRM?",
    answer: "Yes, IQ24.ai integrates seamlessly with all major CRMs including Salesforce, HubSpot, Pipedrive, and more. Our API-first approach means we can connect to virtually any system your team uses. Setup typically takes less than 30 minutes with our guided integration wizard."
  },
  {
    question: "Is there a free trial?",
    answer: "We offer a 14-day pilot program where you can test IQ24.ai with your actual data and prospects. This isn't a limited demo - you get full access to all features and can see real results with your campaigns. Most teams see measurable improvements within the first week."
  },
  {
    question: "How quickly will I see results?",
    answer: "Most customers see initial improvements within 48 hours of setup. Lead qualification accuracy improves immediately, and you'll start receiving higher-quality prospects within the first week. Full optimization typically occurs within 30-60 days as the AI learns your ideal customer profile and messaging preferences."
  },
  {
    question: "What makes this different from other sales tools?",
    answer: "Unlike traditional sales tools that require manual work, IQ24.ai is a fully automated intelligence engine. Our multi-agent system doesn't just help you work faster - it thinks proactively, identifies opportunities you'd miss, and continuously optimizes itself. It's like having a team of expert sales analysts working 24/7."
  }
];

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="relative py-32 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 bg-white/5 border-white/10 text-[#65FFD8]">
            FAQ
          </Badge>
          <h2 className="text-5xl font-semibold text-white mb-6 font-mono">
            Everything You Need to Know
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column - Decorative Element */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <div className="relative">
                <div className="absolute inset-0 bg-[#65FFD8]/10 blur-2xl rounded-full"></div>
                <div className="relative bg-[#1A1D21]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-[#65FFD8] rounded-full"></div>
                      <span className="text-[#65FFD8] font-mono text-sm">AI Agent Status</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 font-mono text-xs">PDA Agent</span>
                        <span className="text-[#65FFD8] font-mono text-xs">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 font-mono text-xs">OPA Agent</span>
                        <span className="text-[#65FFD8] font-mono text-xs">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 font-mono text-xs">CGN Agent</span>
                        <span className="text-[#65FFD8] font-mono text-xs">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ Accordion */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-[#1A1D21]/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
                  >
                    <h3 className="text-white font-mono font-medium text-lg pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown 
                      className={`w-5 h-5 text-[#65FFD8] transition-transform duration-200 flex-shrink-0 ${
                        openItems.includes(index) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openItems.includes(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-5">
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-[#A2A8B4] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}