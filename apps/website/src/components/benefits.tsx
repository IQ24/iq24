"use client";

import { Zap, MessageSquare, BarChart3 } from "lucide-react";
import { Section, Container, SectionHeader, BenefitCard } from "@/components/ui";

export function Benefits() {
  const benefits = [
    {
      icon: Zap,
      title: "Automate 80% of Manual Work",
      description: "Free your team from the manual drudgery of prospecting and data entry. Our PDA and VEA agents work 24/7 to discover, validate, and enrich high-quality leads.",
      visual: "heatmap",
    },
    {
      icon: MessageSquare,
      title: "Increase Conversions with True Personalization",
      description: "Move beyond mail merge. Our OPA agent uses advanced LLMs and MSEO capabilities to craft unique, context-aware messages that break through the noise and resonate with prospects.",
      visual: "assistant",
    },
    {
      icon: BarChart3,
      title: "Drive Growth with Actionable Intelligence",
      description: "Stop guessing what works. Our AFLA and ALO agents provide real-time analytics and automatically optimize your campaigns, ensuring every action is data-driven and ROI-focused.",
      visual: "analytics",
    },
  ];

  return (
    <Section>
      <Container>
        <SectionHeader
          pill="Benefits"
          title={<>A Proactive Engine, <span className="text-[#A2A8B4]">Not a Reactive Tool.</span></>}
        />

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={benefit.title}
              title={benefit.title}
              description={benefit.description}
              icon={benefit.icon}
              visual={benefit.visual}
              index={index}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
