import React from "react";
import { Compass, Lightbulb, Code2, Rocket, Settings2 } from "lucide-react";

export default function ProcessSection() {
  const steps = [
    {
      num: "01",
      title: "Tactical Research & Audit",
      description: "We deep-dive into your current architecture, analyze competitor ranks, map user friction zones, and build a concrete optimization roadmap.",
      icon: <Compass className="w-5 h-5 text-blue-400" />,
      subSteps: ["Competitive keyword maps", "Interface heat-mapping studies", "Critical path assessments"]
    },
    {
      num: "02",
      title: "Modern UI/UX Blueprinting",
      description: "We establish a high-fidelity visual concept in Figma. Standard layout modules are customized for peak optical balance and perfect typography.",
      icon: <Lightbulb className="w-5 h-5 text-cyan-400" />,
      subSteps: ["Visual Swiss modernist frames", "Design token definitions", "High-fidelity clickable flowmaps"]
    },
    {
      num: "03",
      title: "Clean React Engineering",
      description: "We compile semantic TypeScript on top of lightweight React setups, bypassing heavy bloated dependencies to maximize structural fidelity.",
      icon: <Code2 className="w-5 h-5 text-emerald-400" />,
      subSteps: ["Standard TypeScript models", "Fluid responsive viewport grids", "Tailwind styling compilations"]
    },
    {
      num: "04",
      title: "Performance Optimization",
      description: "We strip unused script latencies, apply image compressions, optimize local index schemas, and guarantee green 95+ Core Web Vitals scores.",
      icon: <Settings2 className="w-5 h-5 text-purple-400" />,
      subSteps: ["Static asset pre-caches", "Dynamic payload pre-allocations", "SEO crawler configurations"]
    },
    {
      num: "05",
      title: "Continuous Lead Generation",
      description: "We launch the system live, synchronize form collections directly into CRM/lead databases, and analyze conversion performance.",
      icon: <Rocket className="w-5 h-5 text-pink-400" />,
      subSteps: ["Firestore real-time captures", "Continuous conversion monitoring", "Post-launch speed verification"]
    }
  ];

  return (
    <section className="bg-[#111827] py-20 md:py-28 font-sans" id="process">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded-full">
            HOW WE WORK
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Our Streamlined Delivery Protocol
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Five clear, structured milestones designed to move your digital product from general idea to a world-class, high-converting platform.
          </p>
        </div>

        {/* Vertical/Horizontal Timeline */}
        <div className="relative border-l border-white/5 ml-4 sm:ml-8 md:ml-12 max-w-4xl mx-auto space-y-12">
          
          {steps.map((step, idx) => (
            <div 
              key={step.num} 
              className="relative pl-10 md:pl-16 group"
              id={`process-step-${idx}`}
            >
              
              {/* Floating Step Number Node */}
              <div className="absolute -left-[21px] top-0.5 w-10 h-10 rounded-xl bg-[#0F172A] border border-white/5 text-slate-300 font-mono text-sm font-semibold flex items-center justify-center group-hover:border-[#2563EB]/40 group-hover:bg-[#111827] transition-colors duration-300 shadow-md">
                {step.num}
              </div>

              {/* Step Card Content */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-[#0F172A] border border-white/5 text-slate-400 group-hover:text-cyan-400 transition-colors">
                    {step.icon}
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-slate-200 transition-colors">
                    {step.title}
                  </h3>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                  {step.description}
                </p>

                {/* Sub features bullet items */}
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {step.subSteps.map((sub, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] font-mono font-medium text-slate-400 bg-[#0F172A]/50 border border-white/5 px-3 py-1.5 rounded-lg"
                    >
                      ✓ {sub}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
