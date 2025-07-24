"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

const faqData = [
  {
    question: "How does your AI improve my sales process?",
    answer: "Our multi-agent AI system automates 80% of manual prospecting work, provides real-time lead scoring, and crafts hyper-personalized outreach messages. The system continuously learns from your successful campaigns to optimize performance over time."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption, comply with SOC 2 Type II standards, and maintain GDPR/CCPA compliance. Your data is stored in secure, geographically distributed data centers with 99.9% uptime guarantee."
  },
  {
    question: "Can I integrate this with my CRM?",
    answer: "Yes, we offer native integrations with all major CRMs including Salesforce, HubSpot, Pipedrive, and 50+ other platforms. Our API allows for custom integrations, and data syncs in real-time bidirectionally."
  },
  {
    question: "Is there a free trial?",
    answer: "We offer a 14-day free trial with full access to all features. No credit card required. During the trial, you'll have access to our dedicated onboarding team to help you get started."
  },
  {
    question: "How quickly will I see results?",
    answer: "Most customers see significant improvements within the first 30 days. Lead quality typically improves by 40-60%, and response rates increase by 3-5x once the AI learns your ideal customer profile."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We provide 24/7 technical support, dedicated customer success managers for enterprise clients, comprehensive documentation, video tutorials, and regular training webinars."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-transparent to-gray-900/50">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Get answers to the most common questions about our AI-native B2B growth platform.
          </p>
        </motion.div>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Graphic/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="hidden md:flex items-center justify-center"
          >
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-[#65FFD8] to-[#4FDDBA] opacity-10 rounded-full blur-3xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 max-w-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#65FFD8] rounded-full animate-pulse" />
                      <span className="text-white font-medium">AI Assistant Active</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div className="h-2 bg-[#65FFD8] rounded-full w-4/5 animate-pulse" />
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div className="h-2 bg-[#65FFD8] rounded-full w-3/5 animate-pulse" />
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div className="h-2 bg-[#65FFD8] rounded-full w-2/3 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">Processing customer queries...</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden backdrop-blur-sm"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                >
                  <h3 className="text-lg font-medium text-white pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}