"use client";

import * as React from "react";
import { Button } from "@iq24/ui/button";
import { cn } from "@iq24/ui/cn";
import { motion } from "framer-motion";

interface MarketingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "lg";
  children: React.ReactNode;
  className?: string;
}

const MarketingButton = React.forwardRef<HTMLButtonElement, MarketingButtonProps>(
  ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
    const baseClasses = "font-mono font-medium transition-all duration-200 relative overflow-hidden group";
    
    const variantClasses = {
      primary: "bg-[#65FFD8] text-[#0A0B0C] hover:bg-[#4DFFCC] hover:shadow-lg hover:shadow-[#65FFD8]/25",
      secondary: "border border-[#65FFD8] text-[#65FFD8] bg-transparent hover:bg-[#65FFD8]/10 hover:shadow-lg hover:shadow-[#65FFD8]/20",
      ghost: "text-[#A2A8B4] hover:text-white bg-transparent"
    };

    const sizeClasses = {
      default: "h-12 px-6 text-sm",
      lg: "h-14 px-8 text-base"
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <Button
          ref={ref}
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
          {children}
        </Button>
      </motion.div>
    );
  }
);

MarketingButton.displayName = "MarketingButton";

export { MarketingButton };