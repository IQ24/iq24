"use client";

import { motion } from "framer-motion";

export function SocialProof() {
  const partners = [
    { name: "Microsoft", logo: "M" },
    { name: "Salesforce", logo: "SF" },
    { name: "HubSpot", logo: "HS" },
    { name: "Stripe", logo: "S" },
    { name: "Zoom", logo: "Z" },
    { name: "Slack", logo: "SL" },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl font-medium text-white mb-12">
            The Intelligence Behind Leading Growth Teams
          </h2>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-[#A2A8B4]/20 border border-[#A2A8B4]/30 rounded-lg flex items-center justify-center mb-2 group-hover:border-[#65FFD8]/50 transition-colors duration-300">
                  <span className="text-[#A2A8B4] font-bold text-lg group-hover:text-[#65FFD8] transition-colors duration-300">
                    {partner.logo}
                  </span>
                </div>
                <span className="text-xs text-[#A2A8B4] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {partner.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
