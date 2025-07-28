export function SocialProof() {
  const partners = [
    "Microsoft",
    "Salesforce", 
    "HubSpot",
    "Stripe",
    "Zoom",
    "Slack"
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center">
          <h3 className="text-xl font-mono text-[#A2A8B4] mb-8">
            The Intelligence Behind Leading Growth Teams
          </h3>
          
          {/* Simple, elegant logo strip */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {partners.map((partner, index) => (
              <div
                key={partner}
                className="group opacity-60 hover:opacity-100 transition-opacity duration-300"
              >
                <span className="text-[#A2A8B4] font-mono text-lg font-medium tracking-wider group-hover:text-white transition-colors duration-300">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
