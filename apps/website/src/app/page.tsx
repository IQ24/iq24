import { Hero } from "@/components/hero";
import { SocialProof } from "@/components/social-proof";
import { Benefits } from "@/components/benefits";
import { Features } from "@/components/features";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { FinalCTA } from "@/components/final-cta";

export default function Page() {
  return (
    <div className="relative">
      {/* Atmospheric background gradient */}
      <div className="fixed inset-0 bg-gradient-radial from-[#1A1D21] via-[#0F1115] to-[#101214] -z-10" />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Social Proof */}
      <SocialProof />
      
      {/* Benefits Section */}
      <Benefits />
      
      {/* Features Section */}
      <Features />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* FAQ */}
      <FAQ />
      
      {/* Final CTA */}
      <FinalCTA />
    </div>
  );
}