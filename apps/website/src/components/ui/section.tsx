import * as React from "react";
import { cn } from "@iq24/ui/cn";

// Section wrapper component for consistent spacing and layout
const Section = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn("py-24 px-4 sm:px-6 lg:px-8", className)}
    {...props}
  />
));
Section.displayName = "Section";

// Container for content with max-width and centering
const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mx-auto max-w-7xl", className)}
    {...props}
  />
));
Container.displayName = "Container";

// Section header with pill tag, title, and description
interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  pill?: string;
  title: string;
  description?: string;
  centered?: boolean;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, pill, title, description, centered = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mb-16",
        centered && "text-center",
        className
      )}
      {...props}
    >
      {pill && (
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full bg-[#1A1D21] border border-[#2A2F36] px-3 py-1 text-xs font-mono font-medium text-white">
            {pill}
          </span>
        </div>
      )}
      <h2 className="text-4xl md:text-5xl font-mono font-semibold text-white mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-[#A2A8B4] max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
);
SectionHeader.displayName = "SectionHeader";

export { Section, Container, SectionHeader };