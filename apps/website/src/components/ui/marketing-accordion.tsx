"use client";

import * as React from "react";
import { cn } from "@iq24/ui/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  question: string;
  answer: string;
}

interface MarketingAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AccordionItem[];
}

const MarketingAccordion = React.forwardRef<HTMLDivElement, MarketingAccordionProps>(
  ({ className, items, ...props }, ref) => {
    const [openItems, setOpenItems] = React.useState<Set<number>>(new Set());

    const toggleItem = (index: number) => {
      const newOpenItems = new Set(openItems);
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
      setOpenItems(newOpenItems);
    };

    return (
      <div
        ref={ref}
        className={cn("space-y-4", className)}
        {...props}
      >
        {items.map((item, index) => {
          const isOpen = openItems.has(index);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group overflow-hidden rounded-2xl border border-[#2A2F36] bg-gradient-to-b from-[#1A1D21] to-[#141618] transition-all duration-300 hover:border-[#65FFD8]/20"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-8 py-6 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#65FFD8]/20 focus:ring-offset-2 focus:ring-offset-[#0A0B0C]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-mono font-medium text-white text-lg pr-4 group-hover:text-[#65FFD8] transition-colors duration-300">
                    {item.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-shrink-0 text-[#A2A8B4] group-hover:text-[#65FFD8] transition-colors duration-300"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </div>
              </button>

              {/* Answer Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6 pt-0">
                      <div className="border-t border-[#2A2F36] pt-6">
                        <p className="text-[#A2A8B4] leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    );
  }
);

MarketingAccordion.displayName = "MarketingAccordion";

export { MarketingAccordion };
export type { AccordionItem };