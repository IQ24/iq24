"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, MessageSquare, TrendingUp, Target } from "lucide-react";

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#65FFD8] rounded-full opacity-40"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-8xl font-semibold text-white mb-6 tracking-tight">
            The AI-Native{" "}
            <span className="bg-gradient-to-r from-[#65FFD8] to-[#4ADECD] bg-clip-text text-transparent">
              B2B Growth Engine
            </span>
          </h1>
        </motion.div>

        {/* Sub-headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-xl md:text-2xl text-[#A2A8B4] mb-12 max-w-4xl mx-auto leading-relaxed">
            IQ24.ai deploys a multi-agent AI system to automate prospecting, 
            deliver hyper-personalized outreach, and dynamically optimize your entire sales funnel.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <button className="group relative bg-[#65FFD8] text-[#1A1D21] px-8 py-4 rounded-lg font-medium text-lg hover:bg-[#4ADECD] transition-all duration-300 flex items-center justify-center">
            Request Early Access
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <button className="group border border-[#65FFD8] text-[#65FFD8] px-8 py-4 rounded-lg font-medium text-lg hover:bg-[#65FFD8]/10 transition-all duration-300 flex items-center justify-center">
            View Demo
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>

        {/* Floating UI Cards */}
        <div className="relative">
          {/* AI Assistant Card */}
          <motion.div
            className="absolute -left-32 -top-16 w-80 p-6 bg-[#1E2128]/80 backdrop-blur-sm border border-[#2A2D35] rounded-xl shadow-2xl"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            }}
            initial={{ opacity: 0, x: -100, rotate: -5 }}
            animate={{ opacity: 1, x: 0, rotate: -5 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="absolute inset-0 bg-[#65FFD8]/10 rounded-xl blur-xl" />
            <div className="relative">
              <div className="flex items-center mb-3">
                <MessageSquare className="w-5 h-5 text-[#65FFD8] mr-2" />
                <span className="text-sm font-medium text-[#A2A8B4]">AI Assistant</span>
              </div>
              <p className="text-white text-sm mb-2">
                "Based on recent funding activity, I've identified 47 high-intent prospects in your target segment."
              </p>
              <div className="flex items-center text-xs text-[#65FFD8]">
                <div className="w-2 h-2 bg-[#65FFD8] rounded-full mr-2 animate-pulse" />
                Live insights
              </div>
            </div>
          </motion.div>

          {/* Campaign Performance Card */}
          <motion.div
            className="absolute -right-40 top-8 w-72 p-6 bg-[#1E2128]/80 backdrop-blur-sm border border-[#2A2D35] rounded-xl shadow-2xl"
            style={{
              transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            }}
            initial={{ opacity: 0, x: 100, rotate: 3 }}
            animate={{ opacity: 1, x: 0, rotate: 3 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="absolute inset-0 bg-[#65FFD8]/10 rounded-xl blur-xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-[#65FFD8] mr-2" />
                  <span className="text-sm font-medium text-[#A2A8B4]">Campaign Performance</span>
                </div>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">+127%</span>
              </div>
              {/* Mini chart */}
              <div className="h-16 flex items-end space-x-1">
                {[40, 65, 45, 80, 95, 70, 120].map((height, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-t from-[#65FFD8] to-[#4ADECD] rounded-sm flex-1"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-[#A2A8B4] mt-2">Response rate increased 127% this quarter</p>
            </div>
          </motion.div>

          {/* Lead Quality Card */}
          <motion.div
            className="absolute -left-16 bottom-16 w-64 p-6 bg-[#1E2128]/80 backdrop-blur-sm border border-[#2A2D35] rounded-xl shadow-2xl"
            style={{
              transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            }}
            initial={{ opacity: 0, y: 100, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <div className="absolute inset-0 bg-[#65FFD8]/10 rounded-xl blur-xl" />
            <div className="relative">
              <div className="flex items-center mb-3">
                <Target className="w-5 h-5 text-[#65FFD8] mr-2" />
                <span className="text-sm font-medium text-[#A2A8B4]">Lead Quality</span>
              </div>
              <div className="flex items-center justify-center mb-2">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#2A2D35"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#65FFD8"
                      strokeWidth="2"
                      strokeDasharray="85, 100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">85%</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#A2A8B4] text-center">High Intent Prospects</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-[#65FFD8]/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-[#65FFD8] rounded-full mt-2 animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
}