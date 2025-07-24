"use client";

import * as React from "react";
import { cn } from "@iq24/ui/utils";
import { motion } from "framer-motion";

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  mockup?: React.ReactNode;
  gradient?: boolean;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, title, description, icon, mockup, gradient = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        whileHover={{ y: -4 }}
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-[#2A2F36] bg-gradient-to-b from-[#1A1D21] to-[#141618] p-8 transition-all duration-300",
          "hover:border-[#65FFD8]/30 hover:shadow-xl hover:shadow-[#65FFD8]/10",
          gradient && "bg-gradient-to-br from-[#1A1D21] via-[#141618] to-[#0F1113]",
          className
        )}
        {...props}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#65FFD8]/5 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon or Mockup */}
          {mockup ? (
            <div className="mb-8 flex justify-center">
              <div className="relative">
                {mockup}
                {/* Glow behind mockup */}
                <div className="absolute inset-0 bg-[#65FFD8]/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>
            </div>
          ) : icon && (
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#65FFD8]/10 text-[#65FFD8] group-hover:bg-[#65FFD8]/20 transition-colors duration-300">
              {icon}
            </div>
          )}

          {/* Text Content */}
          <div className="space-y-4">
            <h3 className="text-xl font-mono font-medium text-white group-hover:text-[#65FFD8] transition-colors duration-300">
              {title}
            </h3>
            <p className="text-[#A2A8B4] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#65FFD8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

export { FeatureCard };