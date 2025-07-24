"use client";

import { Hero } from "@/components/hero";
import { SectionFive } from "@/components/section-five";
import { SectionFour } from "@/components/section-four";
import { SectionOne } from "@/components/section-one";
import { SectionSeven } from "@/components/section-seven";
import { SectionSix } from "@/components/section-six";
import { SectionThree } from "@/components/section-three";
import { SectionTwo } from "@/components/section-two";
import { Testimonials } from "@/components/testimonials";
import SectionStories from "./section-stories";
import { SectionVideo } from "./section-video";
import { Section, Container, SectionHeader, FeatureCard, TestimonialCard, MarketingAccordion } from "./ui";
import { motion, useScroll, useSpring, useTransform, useMotionValue } from "framer-motion";
import { Bot, Zap, TrendingUp } from "lucide-react";
import React from "react";

// Scroll Progress Component
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-[#65FFD8] transform-gpu z-50"
      style={{ scaleX, transformOrigin: "0%" }}
    />
  );
}

// Social Proof Component
function SocialProof() {
  const companies = [
    "TechCorp",
    "DataFlow", 
    "ScaleUp Inc",
    "GrowthLabs",
    "InnovateAI",
    "NextGen"
  ];

  return (
    <Section className="py-16 border-b border-[#2A2F36]/50">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            title="The Intelligence Behind Leading Growth Teams"
            centered={true}
            className="mb-12"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {companies.map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.05 }}
                className="group flex items-center justify-center h-12 text-[#A2A8B4] font-mono font-medium text-lg opacity-60 hover:opacity-100 transition-opacity duration-300"
              >
                {company}
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#65FFD8]/30 to-transparent" />
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}

// Benefits Section Component
function Benefits() {
  const benefits = [
    {
      title: "Automate 80% of Manual Work",
      description: "Free your team from the manual drudgery of prospecting and data entry. Our PDA and VEA agents work 24/7 to discover, validate, and enrich high-quality leads.",
      icon: <Bot size={24} />,
      mockup: (
        <div className="w-full max-w-sm bg-gradient-to-b from-[#1A1D21] to-[#0F1113] rounded-xl border border-[#2A2F36] p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#A2A8B4]">Lead Discovery</span>
              <span className="text-xs font-mono text-[#65FFD8]">ACTIVE</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#65FFD8] rounded-full animate-pulse" />
                <span className="text-sm text-white">Processing 847 prospects...</span>
              </div>
              <div className="bg-[#2A2F36] rounded-lg p-3">
                <div className="text-xs text-[#A2A8B4] mb-1">High Intent Score: 94%</div>
                <div className="text-sm text-white font-mono">TechCorp - Series B</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Increase Conversions with True Personalization",
      description: "Move beyond mail merge. Our OPA agent uses advanced LLMs and MSEO capabilities to craft unique, context-aware messages that break through the noise and resonate with prospects.",
      icon: <Zap size={24} />,
      mockup: (
        <div className="w-full max-w-sm bg-gradient-to-b from-[#1A1D21] to-[#0F1113] rounded-xl border border-[#2A2F36] p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#A2A8B4]">AI Assistant</span>
              <span className="text-xs font-mono text-[#65FFD8]">CRAFTING</span>
            </div>
            <div className="space-y-2">
              <div className="bg-[#2A2F36] rounded-lg p-3 text-sm text-white">
                <div className="text-xs text-[#65FFD8] mb-2">📧 Personalized Email Draft</div>
                <div className="text-xs text-[#A2A8B4] leading-relaxed">
                  "Hi Sarah, I noticed TechCorp just raised $50M Series B. Congratulations! Given your expansion into AI..."
                </div>
              </div>
              <div className="flex space-x-2 text-xs">
                <span className="bg-[#65FFD8]/10 text-[#65FFD8] px-2 py-1 rounded">Recent Funding</span>
                <span className="bg-[#65FFD8]/10 text-[#65FFD8] px-2 py-1 rounded">New Role</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Drive Growth with Actionable Intelligence",
      description: "Stop guessing what works. Our AFLA and ALO agents provide real-time analytics and automatically optimize your campaigns, ensuring every action is data-driven and ROI-focused.",
      icon: <TrendingUp size={24} />,
      mockup: (
        <div className="w-full max-w-sm bg-gradient-to-b from-[#1A1D21] to-[#0F1113] rounded-xl border border-[#2A2F36] p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#A2A8B4]">Campaign Performance</span>
              <span className="text-xs font-mono text-[#65FFD8]">↗ +24%</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A2A8B4]">Response Rate</span>
                <span className="text-white font-mono">12.4%</span>
              </div>
              <div className="bg-[#2A2F36] rounded-lg h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-[#65FFD8] to-[#4DFFCC] h-full w-3/4 animate-pulse" />
              </div>
              <div className="flex items-center justify-between text-xs text-[#A2A8B4]">
                <span>Positive Sentiment: 89%</span>
                <span>ROI: 340%</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Section className="py-24">
      <Container>
        <SectionHeader
          pill="Benefits"
          title="A Proactive Engine, Not a Reactive Tool."
          description="Transform your sales process with intelligent automation that works around the clock to identify, engage, and convert your highest-value prospects."
        />
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <FeatureCard
              key={index}
              title={benefit.title}
              description={benefit.description}
              mockup={benefit.mockup}
              gradient={true}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

// Features Section Component
function Features() {
  const features = [
    {
      title: "Automated Lead Scoring & Enrichment",
      description: "Our system doesn't just find names; it finds signals. The Prospect Discovery and Validation Agents analyze thousands of data points to score leads based on predicted intent, ensuring your team always focuses on the highest-potential opportunities.",
      imagePosition: "right" as const,
      mockup: (
        <div className="w-full bg-gradient-to-b from-[#1A1D21] to-[#0F1113] rounded-xl border border-[#2A2F36] p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono text-[#A2A8B4]">Lead Management</h3>
              <span className="text-xs font-mono text-[#65FFD8] bg-[#65FFD8]/10 px-2 py-1 rounded">AI POWERED</span>
            </div>
            <div className="space-y-3">
              {[
                { company: "TechCorp Inc.", score: 94, status: "High Intent", funding: "Series B" },
                { company: "DataFlow Ltd.", score: 87, status: "Medium Intent", funding: "Series A" },
                { company: "CloudSync Co.", score: 92, status: "High Intent", funding: "Seed" }
              ].map((lead, idx) => (
                <div key={idx} className="bg-[#2A2F36] rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{lead.company}</div>
                    <div className="text-xs text-[#A2A8B4] flex items-center space-x-2">
                      <span>{lead.status}</span>
                      <span>•</span>
                      <span>{lead.funding}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-[#65FFD8]">{lead.score}%</div>
                    <div className="w-12 bg-[#1A1D21] rounded-full h-2 mt-1">
                      <div 
                        className="bg-gradient-to-r from-[#65FFD8] to-[#4DFFCC] h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${lead.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-[#A2A8B4] pt-2 border-t border-[#2A2F36]">
              <span>847 prospects analyzed</span>
              <span className="text-[#65FFD8]">↗ +23% this week</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Conversational AI & Multi-Sensory Outreach",
      description: "Engage prospects with natural, human-level interactions. Query your data, draft emails, and get strategic advice using our AI Assistant. With MSEO, you can even orchestrate campaigns that include AI-generated voice notes and personalized visuals.",
      imagePosition: "left" as const,
      mockup: (
        <div className="w-full bg-gradient-to-b from-[#1A1D21] to-[#0F1113] rounded-xl border border-[#2A2F36] p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#65FFD8] to-[#4DFFCC] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-[#1A1D21]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <h3 className="text-sm font-mono text-[#A2A8B4]">AI Assistant</h3>
              <div className="flex-1" />
              <div className="w-2 h-2 bg-[#65FFD8] rounded-full animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="bg-[#2A2F36] rounded-lg p-3">
                <div className="text-xs text-[#65FFD8] mb-2">You</div>
                <div className="text-sm text-white">Draft a follow-up email for Sarah at TechCorp</div>
              </div>
              <div className="bg-gradient-to-r from-[#65FFD8]/10 to-[#4DFFCC]/10 border border-[#65FFD8]/20 rounded-lg p-3">
                <div className="text-xs text-[#65FFD8] mb-2">AI Assistant</div>
                <div className="text-sm text-white leading-relaxed">
                  "Hi Sarah, I noticed TechCorp just raised $50M Series B. Congratulations! Given your expansion into AI infrastructure, I thought you'd be interested in how similar companies have reduced their customer acquisition costs by 40%..."
                </div>
                <div className="flex space-x-2 mt-3">
                  <span className="text-xs bg-[#65FFD8]/10 text-[#65FFD8] px-2 py-1 rounded">Personalized</span>
                  <span className="text-xs bg-[#65FFD8]/10 text-[#65FFD8] px-2 py-1 rounded">Context-Aware</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-[#A2A8B4]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z" />
                </svg>
                <span>Voice note generated</span>
                <span>•</span>
                <span>Visual assets ready</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Proactive Compliance Guardian",
      description: "Operate with confidence. The CGN agent automatically screens every outbound message against global regulations like GDPR and CCPA. It's compliance, built-in and automated, not an afterthought.",
      imagePosition: "right" as const,
      mockup: (
        <div className="w-full bg-gradient-to-b from-[#1A1D21] to-[#0F1113] rounded-xl border border-[#2A2F36] p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-sm font-mono text-[#A2A8B4]">Compliance Guardian</h3>
              <div className="flex-1" />
              <span className="text-xs font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded">ACTIVE</span>
            </div>
            <div className="space-y-3">
              <div className="bg-[#2A2F36] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#A2A8B4]">Message Draft</span>
                  <span className="text-xs text-[#22C55E]">Scanning...</span>
                </div>
                <div className="text-sm text-white bg-[#1A1D21] rounded p-2 font-mono text-xs">
                  "Hi John, I'd like to discuss how our AI platform can help optimize your data processing workflows..."
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#22C55E]/10 to-[#16A34A]/10 border border-[#22C55E]/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-[#22C55E]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-[#22C55E]">Compliance Check: Passed</span>
                </div>
                <div className="space-y-1 text-xs text-[#A2A8B4]">
                  <div className="flex items-center justify-between">
                    <span>GDPR Compliance</span>
                    <span className="text-[#22C55E]">✓ Verified</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CCPA Compliance</span>
                    <span className="text-[#22C55E]">✓ Verified</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CAN-SPAM Act</span>
                    <span className="text-[#22C55E]">✓ Verified</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-[#A2A8B4] text-center">
                ✓ Ready to send • All regulations checked
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Section className="py-24">
      <Container>
        <SectionHeader
          pill="Features"
          title="Smarter Sales. Faster Growth. Stronger Teams."
          description="Our AI agents work together to transform every aspect of your sales process, from lead discovery to deal closure."
        />
        
        <div className="space-y-24">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                feature.imagePosition === "left" ? "lg:grid-cols-2" : "lg:grid-cols-2"
              }`}
            >
              <div className={`space-y-6 ${
                feature.imagePosition === "left" ? "lg:order-2" : "lg:order-1"
              }`}>
                <div className="space-y-4">
                  <h3 className="text-2xl font-medium text-white leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-[#A2A8B4] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className={`${
                feature.imagePosition === "left" ? "lg:order-1" : "lg:order-2"
              }`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#65FFD8]/20 to-[#4DFFCC]/20 rounded-xl blur-xl opacity-50" />
                  <div className="relative">
                    {feature.mockup}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "IQ24.ai transformed our lead generation process. The AI agents work around the clock, discovering and qualifying prospects we never would have found manually. Our conversion rate increased by 300% in the first quarter.",
      author: "Sarah Chen",
      title: "VP of Sales",
      company: "TechFlow Solutions",
      logo: "/logos/techflow.png"
    },
    {
      quote: "The personalization capabilities are incredible. Each outreach message feels genuinely crafted for the recipient. Our reply rates went from 3% to 24% overnight. It's like having a team of expert copywriters working 24/7.",
      author: "Marcus Rodriguez",
      title: "Head of Growth",
      company: "ScaleUp Ventures",
      logo: "/logos/scaleup.png"
    },
    {
      quote: "Compliance was always our biggest concern with automated outreach. IQ24.ai's built-in compliance guardian gives us complete confidence. Every message is automatically screened against GDPR and CCPA - it's compliance made effortless.",
      author: "Emily Watson",
      title: "Chief Revenue Officer",
      company: "GlobalReach Corp",
      logo: "/logos/globalreach.png"
    }
  ];

  return (
    <Section className="py-24 bg-gradient-to-b from-[#0A0B0C] to-[#1A1D21]">
      <Container>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-[#1A1D21] border border-[#2A2D31] rounded-full mb-6"
          >
            <span className="text-sm font-medium text-white">Testimonials</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-5xl font-semibold text-white mb-4 leading-tight"
          >
            What Our Early Adopters Are Saying
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <TestimonialCard
                quote={testimonial.quote}
                author={testimonial.author}
                title={testimonial.title}
                company={testimonial.company}
                companyLogo={
                  <div className="w-8 h-8 bg-[#2A2F36] rounded-lg flex items-center justify-center text-xs font-mono text-[#A2A8B4]">
                    {testimonial.company.charAt(0)}
                  </div>
                }
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// Final CTA Section
function FinalCTA() {
  return (
    <Section className="py-32 relative overflow-hidden">
      {/* Glowing grid background */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(101, 255, 216, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(101, 255, 216, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#65FFD8]/5 to-transparent" />
      </div>

      <Container className="relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight"
          >
            Supercharge Your Growth Engine.
            <br />
            <span className="bg-gradient-to-r from-[#65FFD8] to-[#4DFFCC] bg-clip-text text-transparent">
              Today.
            </span>
          </motion.h2>
        </div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
          style={{ perspective: '1000px' }}
        >
          <div 
            className="transform transition-transform duration-700 hover:scale-105"
            style={{ 
              transform: 'rotateX(2deg)',
              transformStyle: 'preserve-3d'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotateX(1deg) scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotateX(2deg)';
            }}
          >
            <div className="relative max-w-6xl mx-auto">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#65FFD8]/20 via-[#4DFFCC]/20 to-[#65FFD8]/20 rounded-3xl blur-2xl" />
              
              {/* Dashboard frame */}
              <div className="relative bg-gradient-to-b from-[#1A1D21] to-[#0F1113] rounded-2xl border border-[#2A2F36] overflow-hidden shadow-2xl">
                {/* Header bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2F36] bg-[#1A1D21]/50 backdrop-blur-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <div className="text-sm font-mono text-[#A2A8B4]">IQ24.ai Dashboard</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#65FFD8] rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-[#65FFD8]">AI ACTIVE</span>
                  </div>
                </div>

                {/* Dashboard content grid */}
                <div className="p-6 grid lg:grid-cols-3 gap-6">
                  {/* Campaign Performance Chart */}
                  <div className="lg:col-span-2 bg-[#0F1113] rounded-xl border border-[#2A2F36] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Campaign Performance</h3>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-[#65FFD8]">↗ +47%</div>
                        <div className="text-xs text-[#A2A8B4]">vs last month</div>
                      </div>
                    </div>
                    <div className="h-32 flex items-end space-x-2">
                      {[40, 65, 45, 80, 95, 70, 88, 92, 85, 98, 105, 112].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-[#65FFD8] to-[#4DFFCC] rounded-t transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="bg-[#0F1113] rounded-xl border border-[#2A2F36] p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">AI Insights</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#65FFD8]/10 rounded-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#65FFD8] rounded-full" />
                        </div>
                        <div>
                          <div className="text-sm text-white">High-intent leads detected</div>
                          <div className="text-xs text-[#A2A8B4]">23 new prospects</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#65FFD8]/10 rounded-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#4DFFCC] rounded-full" />
                        </div>
                        <div>
                          <div className="text-sm text-white">Optimal send time</div>
                          <div className="text-xs text-[#A2A8B4]">2:30 PM identified</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#65FFD8]/10 rounded-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#FFD865] rounded-full" />
                        </div>
                        <div>
                          <div className="text-sm text-white">Message optimization</div>
                          <div className="text-xs text-[#A2A8B4]">+12% response rate</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lead Quality Score */}
                  <div className="bg-[#0F1113] rounded-xl border border-[#2A2F36] p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Lead Quality</h3>
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="transform -rotate-90 w-24 h-24">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#2A2F36"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#65FFD8"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40 * 0.87} ${2 * Math.PI * 40}`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">87%</span>
                      </div>
                    </div>
                    <div className="text-center text-sm text-[#A2A8B4]">High Intent Prospects</div>
                  </div>

                  {/* Live Activity Feed */}
                  <div className="lg:col-span-2 bg-[#0F1113] rounded-xl border border-[#2A2F36] p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Live Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-[#1A1D21] rounded-lg">
                        <div className="w-2 h-2 bg-[#65FFD8] rounded-full animate-pulse" />
                        <div className="flex-1">
                          <div className="text-sm text-white">AI generated personalized email for Sarah Chen</div>
                          <div className="text-xs text-[#A2A8B4]">TechCorp • 2 minutes ago</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-[#1A1D21] rounded-lg">
                        <div className="w-2 h-2 bg-[#4DFFCC] rounded-full" />
                        <div className="flex-1">
                          <div className="text-sm text-white">New high-intent lead discovered</div>
                          <div className="text-xs text-[#A2A8B4]">InnovateAI • 5 minutes ago</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-[#1A1D21] rounded-lg">
                        <div className="w-2 h-2 bg-[#FFD865] rounded-full" />
                        <div className="flex-1">
                          <div className="text-sm text-white">Campaign optimization completed</div>
                          <div className="text-xs text-[#A2A8B4]">Growth Series • 12 minutes ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button className="group relative inline-flex items-center justify-center px-12 py-4 bg-gradient-to-r from-[#65FFD8] to-[#4DFFCC] text-[#0A0B0C] font-semibold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#65FFD8]/25">
            <span className="relative z-10">Request Early Access</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#4DFFCC] to-[#65FFD8] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </motion.div>
      </Container>
    </Section>
  );
}

// FAQ Section
function FAQSection() {
  const faqItems = [
    {
      question: "How does your AI improve my sales process?",
      answer: "Our multi-agent AI system automates lead discovery, validates prospects, crafts personalized outreach, and continuously optimizes your campaigns. The AI works 24/7 to identify high-intent leads, create context-aware messages, and provide real-time analytics to maximize your conversion rates."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade encryption, comply with SOC 2 Type II standards, and never share your data with third parties. All data is processed securely and stored with military-grade protection. Our Compliance Guardian agent also ensures all outreach meets GDPR, CCPA, and other regulatory requirements."
    },
    {
      question: "Can I integrate this with my existing CRM?",
      answer: "Yes! IQ24.ai seamlessly integrates with all major CRMs including Salesforce, HubSpot, Pipedrive, and more. Our system can sync lead data, update contact records, and track campaign performance directly within your existing workflow without disrupting your current processes."
    },
    {
      question: "Is there a free trial?",
      answer: "We offer an exclusive early access program for qualified businesses. During this program, you'll get hands-on support from our team to ensure successful implementation. Contact us to see if your company qualifies for early access with custom pricing and setup assistance."
    },
    {
      question: "How quickly can I see results?",
      answer: "Most customers see significant improvements within the first 2-4 weeks. Lead quality improvements are typically visible within days, while conversion rate optimization continues to improve over time as our AI learns your ideal customer profile and refines outreach strategies."
    },
    {
      question: "What makes this different from other sales automation tools?",
      answer: "Unlike traditional tools that just send bulk emails, IQ24.ai uses advanced AI agents that think, reason, and optimize. Our system provides true personalization at scale, predictive lead scoring, compliance automation, and multi-sensory outreach capabilities including AI-generated voice and visual content."
    }
  ];

  return (
    <Section className="py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-[#1A1D21] border border-[#2A2D31] rounded-full mb-6"
            >
              <span className="text-sm font-medium text-white">FAQ</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-5xl font-semibold text-white mb-4 leading-tight"
            >
              Everything You Need to Know
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-[#A2A8B4] leading-relaxed"
            >
              Common questions about our AI-powered sales platform
            </motion.p>
          </div>

          <MarketingAccordion items={faqItems} />
        </div>
      </Container>
    </Section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="relative bg-black/50 backdrop-blur-md border-t border-[#2A2D31] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white font-mono">IQ24.ai</h3>
              <p className="text-[#A2A8B4] mt-3 leading-relaxed">
                The AI-Native B2B Growth Engine. Automate prospecting, deliver hyper-personalized outreach, and optimize your entire sales funnel with advanced AI agents.
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-[#1A1D21] border border-[#2A2D31] rounded-full flex items-center justify-center text-white hover:bg-[#65FFD8] hover:text-black transition-all duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-[#1A1D21] border border-[#2A2D31] rounded-full flex items-center justify-center text-white hover:bg-[#65FFD8] hover:text-black transition-all duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-[#1A1D21] border border-[#2A2D31] rounded-full flex items-center justify-center text-white hover:bg-[#65FFD8] hover:text-black transition-all duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 font-mono">Product</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  AI Agents
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 font-mono">Company</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div>
            <h4 className="text-white font-semibold mb-6 font-mono">Legal</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-[#A2A8B4] hover:text-[#65FFD8] transition-colors duration-300">
                  GDPR
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2A2D31] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#A2A8B4] text-sm mb-4 md:mb-0">
            © 2025 IQ24.ai. All rights reserved.
          </p>
          <p className="text-[#A2A8B4] text-sm">
            Built with AI-powered precision.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function StartPage() {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  
  // Add smooth scroll behavior and mouse tracking
  React.useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    // Add floating effect on scroll
    const handleScroll = () => {
      const elements = document.querySelectorAll('.float-on-scroll');
      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
          const translateY = Math.sin(scrollPercent * Math.PI) * 10;
          (el as HTMLElement).style.transform = `translateY(${translateY}px)`;
        }
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />
      
      {/* Enhanced Cursor Glow Effect */}
      <div
        className="fixed w-96 h-96 pointer-events-none z-10 opacity-20"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: 'radial-gradient(circle, rgba(101, 255, 216, 0.15) 0%, rgba(77, 255, 204, 0.1) 40%, transparent 70%)',
          transition: 'all 0.1s ease-out',
          filter: 'blur(1px)',
        }}
      />
      
      {/* Secondary smaller cursor effect */}
      <div
        className="fixed w-24 h-24 pointer-events-none z-10 opacity-40"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          background: 'radial-gradient(circle, rgba(101, 255, 216, 0.3) 0%, transparent 60%)',
          transition: 'all 0.05s ease-out',
        }}
      />
      
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10">
        {/* Enhanced animated background gradient with parallax */}
        <motion.div 
          className="absolute inset-0 bg-gradient-radial from-[#1A1D21] via-[#0F1013] to-[#0A0B0C]"
          style={{ y: y1 }}
        />
        
        {/* Additional atmospheric layers */}
        <motion.div 
          className="absolute inset-0 bg-gradient-radial from-transparent via-[#65FFD8]/[0.01] to-transparent"
          style={{ y: y2 }}
        />
        
        {/* Enhanced floating particles effect with more variety */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => {
            const size = i % 4 === 0 ? Math.random() * 4 + 2 : Math.random() * 2 + 1;
            const initialX = Math.random() * 100;
            const initialY = Math.random() * 100;
            const color = i % 3 === 0 ? '#65FFD8' : i % 3 === 1 ? '#4DFFCC' : '#87CEEB';
            
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${initialX}%`,
                  top: `${initialY}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 ${size * 2}px ${color}20`,
                }}
                animate={{
                  y: [-40, 40, -40],
                  x: [-20, 20, -20],
                  opacity: [0.02, 0.3, 0.02],
                  scale: [0.6, 1.4, 0.6],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 6 + Math.random() * 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 3,
                }}
              />
            );
          })}
        </div>
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(101, 255, 216, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(101, 255, 216, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <Hero />
      <SocialProof />
      <Benefits />
      <Features />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
