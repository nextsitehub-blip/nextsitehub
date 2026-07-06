import React from "react";
import { Laptop, Layers, TrendingUp, Search, ShieldCheck, ArrowRight } from "lucide-react";

interface ServicesSectionProps {
  setCurrentPage: (page: string) => void;
}

export default function ServicesSection({ setCurrentPage }: ServicesSectionProps) {
  const services = [
    {
      id: "web-dev",
      title: "Enterprise Web Development",
      description: "Custom digital infrastructure built for supreme load velocities, elegant typography, and absolute responsiveness.",
      icon: <Laptop className="w-6 h-6 text-blue-400" />,
      features: [
        "React & Premium Vite custom compilation",
        "100/100 Core Web Vitals score execution",
        "Headless CMS & structured content design",
        "Subtle Framer Motion viewport triggers"
      ],
      color: "border-blue-500/10 hover:border-blue-500/30"
    },
    {
      id: "ui-ux",
      title: "High-Fidelity UI/UX Design",
      description: "Artisanal visual designs that speak with professional authority, establish immediate trust, and lower cognitive friction.",
      icon: <Layers className="w-6 h-6 text-cyan-400" />,
      features: [
        "High-fidelity interactive Figma wireframes",
        "Swiss modernist layouts & spacing guides",
        "Custom SVG vectors & visual design blueprints",
        "Interactive animation and click prototype maps"
      ],
      color: "border-cyan-500/10 hover:border-cyan-500/30"
    },
    {
      id: "seo",
      title: "Technical SEO & Schema",
      description: "Engineered keyword maps, metadata indexing setups, and local search signals that position you above direct rivals.",
      icon: <Search className="w-6 h-6 text-emerald-400" />,
      features: [
        "Structured JSON-LD schema markups",
        "Sitemap indexation & crawler optimizations",
        "Core Web Vitals & speed ranking boost",
        "Inbound intent keyword layout strategies"
      ],
      color: "border-emerald-500/10 hover:border-emerald-500/30"
    },
    {
      id: "growth",
      title: "Conversion Optimization",
      description: "Deep funnel analytics, form optimizations, and automated client onboarding pipelines that turn simple traffic into revenue.",
      icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
      features: [
        "Multi-step interactive form funnels",
        "A/B test deployment frameworks",
        "Heatmap tracking & user friction studies",
        "Automated CRM synchronization systems"
      ],
      color: "border-purple-500/10 hover:border-purple-500/30"
    }
  ];

  return (
    <section className="bg-[#111827] py-20 md:py-28 font-sans" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded-full">
            OUR CAPABILITIES
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Artisanal Code & Design For Ambitious Teams
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            We operate at the razor-thin junction of high-performance backend architecture and bespoke, breathtaking user interfaces. No shortcuts, ever.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((svc) => (
            <div
              key={svc.id}
              id={`service-card-${svc.id}`}
              className="p-8 rounded-2xl bg-[#0F172A]/50 border border-white/5 hover:border-[#2563EB]/40 hover:bg-[#0F172A]/80 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3.5 rounded-xl bg-[#111827] border border-white/5">
                    {svc.icon}
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {svc.title}
                  </h3>
                </div>

                <p className="text-slate-400 text-sm sm:text-sm leading-relaxed mb-6">
                  {svc.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {svc.features.map((feat, i) => (
                    <li key={i} className="flex items-center space-x-2.5 text-xs text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setCurrentPage("contact");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center space-x-2 text-xs font-semibold font-mono tracking-wider uppercase text-cyan-400 hover:text-cyan-300 transition-colors w-max"
              >
                <span>Initiate project</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Audit Incentive Callout */}
        <div className="mt-16 bg-[#0F172A]/80 border border-white/5 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="font-display text-base sm:text-lg font-bold text-white">
              Unsure where your current website is lagging?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Get an instant technical and visual critique from our AI Engine. No phone call or sign-up necessary. Takes 15 seconds.
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentPage("audit");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#0da472] text-white font-bold text-xs tracking-wider uppercase shrink-0 transition-colors shadow-lg shadow-[#10B981]/20"
          >
            Run Free Audit
          </button>
        </div>

      </div>
    </section>
  );
}
