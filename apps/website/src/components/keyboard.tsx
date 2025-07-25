"use client";

import { Assistant } from "@/components/assistant";
import { motion } from "framer-motion";
import keyboardLight from "public/keyboard-light.png";
import keyboardDark from "public/keyboard.png";
import { DynamicImage } from "./dynamic-image";

export function Keyboard() {
  return (
    <div className="relative mb-[100px] text-left">
      <motion.div
        className="absolute -right-[175px] -top-[130px] md:-top-[90px] lg:-top-9 xl:-top-4 md:-right-[200px] z-20 bg-gradient-to-l md:from-[#fbfbfb] dark:bg-gradient-to-l dark:md:from-[#0C0C0C]"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="scale-[0.40] md:scale-[0.55] lg:scale-[0.7] xl:scale-[0.84] shadow-2xl">
          <Assistant />
        </div>
      </motion.div>

      <div className="h-full w-[500px] duration-200 ease-out transition-all absolute left-[1px] right-[1px] top-[1px] z-[15] bottom-[1px] bg-background/80" />

      <DynamicImage
        darkSrc={keyboardDark}
        lightSrc={keyboardLight}
        alt="Download iq24"
        width={1092}
        height={448}
        className="z-10 relative"
        quality={90}
        priority
      />
    </div>
  );
}
