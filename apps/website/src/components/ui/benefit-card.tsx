"use client";

import * as React from "react";
import { cn } from "@iq24/ui/utils";
import { motion } from "framer-motion";
import { MessageSquare, BarChart3 } from "lucide-react";

interface BenefitCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  visual: "heatmap" | "assistant" | "analytics";
  index?: number;
}

const BenefitCard = React.forwardRef<HTMLDivElement, BenefitCardProps>(
  ({ className, title, description, icon: Icon, visual, index = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: index * 0.2 }}
        viewport={{ once: true }}
        className={cn("group relative", className)}
        {...props}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-[#65FFD8]/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Card */}
        <div className="relative p-8 bg-[#1E2128]/50 border border-[#2A2D35] rounded-2xl hover:border-[#65FFD8]/30 transition-all duration-300">
          {/* Visual Mockup */}
          <div className="mb-8 h-48 bg-[#0F1115] rounded-xl border border-[#2A2D35] flex items-center justify-center relative overflow-hidden">
            {visual === "heatmap" && (
              <div className="grid grid-cols-7 gap-1 p-4">
                {[...Array(35)].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-sm"
                    style={{
                      backgroundColor: `hsl(${170 + Math.random() * 20}, 70%, ${30 + Math.random() * 40}%)`,
                    }}
                  />
                ))}
              </div>
            )}
            
            {visual === "assistant" && (
              <div className="w-full p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#65FFD8] rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#2A2D35] rounded-lg p-3">
                      <p className="text-sm text-white">
                        "Hi John, I noticed your company just raised Series A. Congratulations! I'd love to discuss how..."
                      </p>
                    </div>
                    <div className="text-xs text-[#65FFD8] mt-2">
                      ✓ Personalized with recent funding data
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {visual === "analytics" && (
              <div className="w-full p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[#A2A8B4]">Campaign Performance</span>
                  <span className="text-sm text-green-400">+127%</span>
                </div>
                <div className="h-20 flex items-end space-x-2">
                  {[20, 35, 28, 45, 60, 38, 75, 85].map((height, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-[#65FFD8] to-[#4ADECD] rounded-sm flex-1"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#65FFD8]/10 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#65FFD8]" />
              </div>
              <h3 className="text-xl font-semibold text-white group-hover:text-[#65FFD8] transition-colors duration-300">
                {title}
              </h3>
            </div>
            <p className="text-[#A2A8B4] leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }
);

BenefitCard.displayName = "BenefitCard";

export { BenefitCard };