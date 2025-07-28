import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Section component - Main container for page sections
export function Section({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-24", className)}>
      {children}
    </section>
  );
}

// Container component - Centered content container
export function Container({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

// SectionHeader component - Header with pill and title
export function SectionHeader({ 
  pill, 
  title, 
  className 
}: { 
  pill: string;
  title: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-center mb-16", className)}>
      {/* Pill Tag */}
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#2A2D31] border border-[#3A3D41] mb-6">
        <span className="text-sm font-medium text-[#FFFFFF]">{pill}</span>
      </div>
      
      {/* Title */}
      <h2 className="text-4xl md:text-5xl font-semibold text-[#FFFFFF] leading-tight">
        {title}
      </h2>
    </div>
  );
}

// BenefitCard component - Individual benefit card with icon and visual
export function BenefitCard({ 
  title, 
  description, 
  icon: Icon, 
  visual, 
  index 
}: { 
  title: string;
  description: string;
  icon: LucideIcon;
  visual: string;
  index: number;
}) {
  return (
    <div className="group relative">
      {/* Card Container */}
      <div className="relative h-full rounded-2xl bg-[#1A1D21] border border-[#2A2D31] p-8 hover:border-[#65FFD8]/20 transition-all duration-300">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#65FFD8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#65FFD8]/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#65FFD8]" />
            </div>
          </div>
          
          {/* Visual Mockup */}
          <div className="mb-6">
            <div className="h-48 rounded-lg bg-[#0F1115] border border-[#2A2D31] p-4 flex items-center justify-center">
              {visual === "heatmap" && (
                <div className="w-full h-full bg-gradient-to-r from-[#65FFD8]/20 to-[#65FFD8]/40 rounded opacity-80 flex items-center justify-center">
                  <span className="text-[#65FFD8] text-sm font-mono">Activity Heatmap</span>
                </div>
              )}
              {visual === "assistant" && (
                <div className="w-full h-full bg-[#1A1D21] rounded border border-[#2A2D31] p-3 flex flex-col justify-between">
                  <div className="text-[#A2A8B4] text-xs">AI Assistant</div>
                  <div className="text-[#65FFD8] text-sm">Crafting personalized message...</div>
                </div>
              )}
              {visual === "analytics" && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-16 bg-[#65FFD8]/20 rounded flex items-end justify-center space-x-1">
                    <div className="w-2 h-8 bg-[#65FFD8] rounded-t" />
                    <div className="w-2 h-12 bg-[#65FFD8] rounded-t" />
                    <div className="w-2 h-6 bg-[#65FFD8] rounded-t" />
                    <div className="w-2 h-10 bg-[#65FFD8] rounded-t" />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-[#FFFFFF] mb-3">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-[#A2A8B4] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}