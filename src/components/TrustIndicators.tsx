import React from "react";
import { ShieldAlert, Users, HeartHandshake, Award } from "lucide-react";

export default function TrustIndicators() {
  const brands = [
    { name: "Stripe", class: "text-slate-400 hover:text-white" },
    { name: "Vercel", class: "text-slate-400 hover:text-white" },
    { name: "Linear", class: "text-slate-400 hover:text-white" },
    { name: "Webflow", class: "text-slate-400 hover:text-white" },
    { name: "Retool", class: "text-slate-400 hover:text-white" },
    { name: "Figma", class: "text-slate-400 hover:text-white" }
  ];

  return (
    <div className="bg-[#111827] py-14 border-y border-white/5 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sub text */}
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.25em] text-slate-500 font-semibold mb-8">
          TRUSTED BY LEADERS AT AMBITIOUS DIGITAL TEAMS
        </p>

        {/* Marquee row */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:justify-between opacity-70">
          {brands.map((brand, i) => (
            <div 
              key={i} 
              className="text-lg font-bold font-display tracking-tight text-slate-400 hover:text-white transition-colors cursor-default"
              id={`brand-logo-${i}`}
            >
              {brand.name}
            </div>
          ))}
        </div>

        {/* Core Value Props Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/5 max-w-4xl mx-auto">
          
          <div className="flex items-start space-x-3 text-left">
            <div className="p-2 bg-[#2563EB]/10 text-[#2563EB] rounded-lg shrink-0 border border-[#2563EB]/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white font-display">Client-First Partnership</h5>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Direct Slack and Figma access. We operate as your dedicated product strategy and growth engine.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-left">
            <div className="p-2 bg-[#06B6D4]/10 text-[#06B6D4] rounded-lg shrink-0 border border-[#06B6D4]/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white font-display">Elite Quality Focus</h5>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">No generic templates or sloppy builders. Custom high-performance code engineered to maximize load speed and conversion.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-left">
            <div className="p-2 bg-[#10B981]/10 text-[#10B981] rounded-lg shrink-0 border border-[#10B981]/20">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white font-display">Proven Metrics and Growth</h5>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Over +180% average inbound inquiry increase recorded for client rebuilds within the first 60 days of launch.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
