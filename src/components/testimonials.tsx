"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      quote: "IQ24.ai transformed our sales process completely. We're seeing 3x more qualified leads and our conversion rates have never been higher. The AI agents work around the clock, giving us a competitive edge we never had before.",
      author: "Sarah Chen",
      title: "VP of Sales",
      company: "TechFlow Solutions",
      avatar: "SC",
      rating: 5,
      companyLogo: "TF",
    },
    {
      quote: "The personalization capabilities are incredible. Our prospects actually respond because the messages feel genuinely relevant. It's like having a team of expert sales researchers working 24/7.",
      author: "Marcus Rodriguez",
      title: "Head of Growth",
      company: "DataCore Industries",
      avatar: "MR",
      rating: 5,
      companyLogo: "DC",
    },
    {
      quote: "Finally, a solution that understands compliance isn't optional. The automatic GDPR and CCPA checks give us peace of mind while we scale globally. ROI was positive within the first month.",
      author: "Emma Thompson",
      title: "Chief Revenue Officer",
      company: "GlobalReach Corp",
      avatar: "ET",
      rating: 5,
      companyLogo: "GR",
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 bg-[#65FFD8]/10 border border-[#65FFD8]/20 rounded-full text-[#65FFD8] text-sm font-medium mb-6">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">
            What Our Early Adopters{" "}
            <span className="text-[#A2A8B4]">Are Saying</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-[#65FFD8]/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Card */}
              <div className="relative p-8 bg-[#1E2128]/80 backdrop-blur-sm border border-[#2A2D35] rounded-2xl hover:border-[#65FFD8]/30 transition-all duration-300 h-full flex flex-col">
                {/* Company Logo */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-[#A2A8B4]/20 border border-[#A2A8B4]/30 rounded-lg flex items-center justify-center">
                    <span className="text-[#A2A8B4] font-bold text-sm">
                      {testimonial.companyLogo}
                    </span>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#65FFD8] text-[#65FFD8]"
                      />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <div className="flex-1 mb-6">
                  <Quote className="w-8 h-8 text-[#65FFD8]/40 mb-4" />
                  <blockquote className="text-white leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                </div>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#65FFD8] to-[#4ADECD] rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {testimonial.author}
                    </p>
                    <p className="text-[#A2A8B4] text-sm">
                      {testimonial.title}
                    </p>
                    <p className="text-[#65FFD8] text-sm">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-6 px-8 py-4 bg-[#1E2128]/50 border border-[#2A2D35] rounded-full">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {["JD", "AM", "KL", "RB"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-br from-[#65FFD8] to-[#4ADECD] rounded-full flex items-center justify-center border-2 border-[#1E2128]"
                  >
                    <span className="text-black font-semibold text-xs">
                      {initials}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-[#A2A8B4] text-sm">+47 more</span>
            </div>
            
            <div className="w-px h-6 bg-[#2A2D35]" />
            
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[#65FFD8] text-[#65FFD8]"
                  />
                ))}
              </div>
              <span className="text-[#A2A8B4] text-sm">4.9/5 average rating</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}