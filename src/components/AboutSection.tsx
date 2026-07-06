import React from "react";
import { Laptop, Cpu, ShieldCheck, HeartHandshake, Eye, Award } from "lucide-react";

export default function AboutSection() {
  const pillars = [
    {
      id: "pil-1",
      title: "Pixel-Perfect Code Integrity",
      description: "We hand-code every script. No bloated plugins or dynamic page builders that slow down Core Web Vitals. We optimize every markup line.",
      icon: <Cpu className="w-5 h-5 text-blue-400" />
    },
    {
      id: "pil-2",
      title: "Swiss Modern Aesthetics",
      description: "We build layouts defined by generous negative space, strong visual typographic hierarchy, eye-safe slate backgrounds, and smooth transitions.",
      icon: <Eye className="w-5 h-5 text-cyan-400" />
    },
    {
      id: "pil-3",
      title: "Direct Engineering Access",
      description: "Collaborate directly with our visual architect and tech leads on Slack and Figma. No frustrating project management layers.",
      icon: <HeartHandshake className="w-5 h-5 text-emerald-400" />
    }
  ];

  return (
    <section className="bg-[#111827] py-20 md:py-28 font-sans" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6 text-left">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded-full">
              STUDIO PHILOSOPHY
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
              We Are NextSiteHub.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              We are an elite digital engineering studio composed of senior UI/UX designers, React core developers, and technical SEO strategists. We do not operate like standard high-volume agencies.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our core mission is straightforward: to engineer custom digital solutions that establish unquestionable brand authority, minimize cognitive user friction, and maximize enterprise lead generation pipelines.
            </p>

            <div className="flex gap-6 pt-4 border-t border-white/5">
              <div>
                <span className="text-2xl font-bold text-white font-display">120+</span>
                <span className="text-xs text-slate-500 font-mono block mt-0.5 uppercase tracking-wider">PROJECTS SHIPPED</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white font-display">99%</span>
                <span className="text-xs text-slate-500 font-mono block mt-0.5 uppercase tracking-wider">PAGESPEED TARGETS</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white font-display">15+</span>
                <span className="text-xs text-slate-500 font-mono block mt-0.5 uppercase tracking-wider">GLOBAL DESIGN AWARDS</span>
              </div>
            </div>
          </div>

          {/* Right Image/Banner Mockup */}
          <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#0F172A] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">OUR MANIFESTO</span>
              <h4 className="font-display text-base font-bold text-white">We Reject Low-Value AI Slop & Sluggish Templates</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Modern software has become cluttered with unrequested telemetry logs, heavy cookie builders, and identical visual templates. NextSiteHub champions simplicity, performance, and clean, bespoke custom assets.
              </p>
            </div>

            <div className="p-4 bg-[#111827] rounded-xl border border-white/5 text-left font-mono text-[10px] text-slate-500 space-y-1">
              <span className="text-cyan-400"># NextSiteHub Quality Standard</span>
              <br />
              <span>✔ Standard React functional modular compilation</span>
              <br />
              <span>✔ Fully optimized media compression protocols</span>
              <br />
              <span>✔ Structured LocalBusiness structured schema deployment</span>
              <br />
              <span>✔ Absolute custom code compliance</span>
            </div>
          </div>
        </div>

        {/* Pillars Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pil) => (
            <div
              key={pil.id}
              className="p-6 rounded-2xl bg-[#0F172A]/50 border border-white/5 flex flex-col items-start gap-4 hover:border-white/10 transition-colors"
            >
              <div className="p-3 bg-[#111827] border border-white/5 rounded-xl">
                {pil.icon}
              </div>
              <div className="text-left space-y-1.5">
                <h4 className="font-display text-sm sm:text-base font-bold text-white">{pil.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{pil.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
