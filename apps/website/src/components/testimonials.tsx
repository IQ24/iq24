import { Badge } from "@iq24/ui/badge";

const testimonials = [
  {
    name: "Sarah Chen",
    title: "VP of Sales, TechFlow Solutions",
    company: "TechFlow Solutions",
    companyLogo: "https://via.placeholder.com/100x40/65FFD8/000000?text=TF",
    avatarUrl: "https://via.placeholder.com/64x64/A2A8B4/FFFFFF?text=SC",
    quote: "IQ24.ai transformed our sales process overnight. Our conversion rates increased by 340% in the first quarter, and our team is finally focused on closing deals instead of manual prospecting.",
  },
  {
    name: "Marcus Rodriguez",
    title: "CEO, GrowthScale Inc",
    company: "GrowthScale Inc",
    companyLogo: "https://via.placeholder.com/100x40/65FFD8/000000?text=GS",
    avatarUrl: "https://via.placeholder.com/64x64/A2A8B4/FFFFFF?text=MR",
    quote: "The AI agents work 24/7, qualifying leads while we sleep. It's like having a team of expert SDRs that never take a break. Our pipeline has never been healthier.",
  },
  {
    name: "Emily Watson",
    title: "Head of Revenue Operations, DataVault",
    company: "DataVault",
    companyLogo: "https://via.placeholder.com/100x40/65FFD8/000000?text=DV",
    avatarUrl: "https://via.placeholder.com/64x64/A2A8B4/FFFFFF?text=EW",
    quote: "Compliance was our biggest concern with automated outreach. IQ24.ai's built-in compliance guardian gave us the confidence to scale without legal worries. Game changer.",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 bg-white/5 border-white/10 text-[#65FFD8]">
            Testimonials
          </Badge>
          <h2 className="text-5xl font-semibold text-white mb-6 font-mono">
            What Our Early Adopters Are Saying
          </h2>
        </div>

        {/* Three-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#1E2329] border border-[#2D3748] rounded-2xl p-8 space-y-6 hover:border-[#65FFD8]/30 transition-colors duration-300"
            >
              {/* Company Logo */}
              <div className="flex items-center">
                <img
                  src={testimonial.companyLogo}
                  alt={`${testimonial.company} logo`}
                  className="h-8 opacity-80"
                />
              </div>

              {/* Quote */}
              <blockquote className="text-[#A2A8B4] text-lg leading-relaxed font-mono">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center space-x-4 pt-4 border-t border-[#2D3748]">
                <img
                  src={testimonial.avatarUrl}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-white font-medium font-mono">{testimonial.name}</p>
                  <p className="text-[#A2A8B4] text-sm font-mono">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
