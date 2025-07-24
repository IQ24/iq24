"use client";

import * as React from "react";
import { cn } from "@iq24/ui/utils";
import { motion } from "framer-motion";

interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  quote: string;
  author: string;
  title: string;
  company: string;
  avatar?: string;
  companyLogo?: React.ReactNode;
}

const TestimonialCard = React.forwardRef<HTMLDivElement, TestimonialCardProps>(
  ({ className, quote, author, title, company, avatar, companyLogo, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -2 }}
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-[#2A2F36] bg-gradient-to-b from-[#1A1D21] to-[#141618] p-8 transition-all duration-300",
          "hover:border-[#65FFD8]/20 hover:shadow-lg hover:shadow-[#65FFD8]/5",
          className
        )}
        {...props}
      >
        {/* Quote */}
        <div className="mb-8">
          <div className="mb-4 text-[#65FFD8] opacity-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
          </div>
          <blockquote className="text-lg text-white leading-relaxed">
            "{quote}"
          </blockquote>
        </div>

        {/* Author Info */}
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={author}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-[#2A2F36] group-hover:ring-[#65FFD8]/30 transition-all duration-300"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#65FFD8]/20 to-[#65FFD8]/5 flex items-center justify-center text-[#65FFD8] font-mono font-medium">
                {author.charAt(0)}
              </div>
            )}
          </div>

          {/* Author Details */}
          <div className="flex-1 min-w-0">
            <p className="font-mono font-medium text-white truncate">
              {author}
            </p>
            <p className="text-sm text-[#A2A8B4] truncate">
              {title} at {company}
            </p>
          </div>

          {/* Company Logo */}
          {companyLogo && (
            <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              {companyLogo}
            </div>
          )}
        </div>

        {/* Subtle hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#65FFD8]/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>
    );
  }
);

TestimonialCard.displayName = "TestimonialCard";

export { TestimonialCard };