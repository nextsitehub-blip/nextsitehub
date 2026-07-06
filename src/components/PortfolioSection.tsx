import React, { useState, useEffect } from "react";
import { Project } from "../types";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { fetchProjects } from "../lib/firebase";

export default function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const fetched = await fetchProjects();
        setProjects(fetched);
      } catch (err) {
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const categories = ["All", "Web Development", "Web Apps", "UI/UX Design", "Branding"];

  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <section className="bg-[#111827] py-20 md:py-28 font-sans" id="portfolio">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4 max-w-2xl">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded-full">
              OUR SELECTED PORTFOLIO
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Case Studies in Elite Web Redesigns
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore concrete examples of how we optimize conversion layouts, overhaul code structure, and drive enterprise growth metrics.
            </p>
          </div>

          {/* Filtering Buttons */}
          <div className="flex flex-wrap gap-2 self-start md:self-end">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 border ${
                  activeCategory === cat
                    ? "bg-[#2563EB] text-white border-transparent shadow-lg shadow-[#2563EB]/20"
                    : "bg-[#0F172A]/50 text-[#94A3B8] border border-white/5 hover:text-white hover:border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 w-full text-slate-500 font-mono text-xs col-span-2 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span>SYNCING PORTFOLIO DATA...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-mono text-xs col-span-2">
            No portfolio projects found.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                id={`portfolio-card-${proj.id}`}
                className="bg-[#0F172A]/50 border border-white/5 rounded-2xl overflow-hidden group hover:border-[#2563EB]/40 transition-all duration-300 flex flex-col justify-between"
              >
                
                {/* Media Container */}
                {proj.title === "Acme Enterprise SaaS Suite" || proj.id === "proj-1" || proj.title === "Aura Luxury Lifestyle Engine" || proj.id === "proj-2" || proj.title === "Apex Fintech Dashboard" || proj.id === "proj-3" || proj.title === "EcoSphere Core Brand Blueprint" || proj.id === "proj-4" || (proj.liveUrl && proj.liveUrl !== "#") ? (
                  <a
                    href={
                      proj.title === "Acme Enterprise SaaS Suite" || proj.id === "proj-1"
                        ? "https://acme-enterprise-saa-s-suite.vercel.app"
                        : proj.title === "Aura Luxury Lifestyle Engine" || proj.id === "proj-2"
                        ? "https://aura-luxury-lifestyle-engine.vercel.app"
                        : proj.title === "Apex Fintech Dashboard" || proj.id === "proj-3"
                        ? "https://apex-fintech-dashboard-phi.vercel.app"
                        : proj.title === "EcoSphere Core Brand Blueprint" || proj.id === "proj-4"
                        ? "https://eco-sphere-core-brand-blueprint.vercel.app"
                        : proj.liveUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                      proj.title === "Acme Enterprise SaaS Suite" || proj.id === "proj-1"
                        ? "Open Acme Enterprise SaaS Suite project"
                        : proj.title === "Aura Luxury Lifestyle Engine" || proj.id === "proj-2"
                        ? "Open Aura Luxury Lifestyle Engine project"
                        : proj.title === "Apex Fintech Dashboard" || proj.id === "proj-3"
                        ? "Open Apex Fintech Dashboard project"
                        : proj.title === "EcoSphere Core Brand Blueprint" || proj.id === "proj-4"
                        ? "Open EcoSphere Core Brand Blueprint project"
                        : `Open ${proj.title} project`
                    }
                    className="relative aspect-video overflow-hidden border-b border-white/5 bg-slate-950 block cursor-pointer"
                  >
                    <img
                      src={proj.image}
                      alt={proj.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                    />
                    
                    {/* Live Action button on hover */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-[#06B6D4] text-slate-950 flex items-center justify-center shadow-lg shadow-[#06B6D4]/25">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Performance Badge floating */}
                    <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-mono tracking-wider uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {proj.category}
                    </div>
                  </a>
                ) : (
                  <div className="relative aspect-video overflow-hidden border-b border-white/5 bg-slate-950">
                    <img
                      src={proj.image}
                      alt={proj.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                    />
                    
                    {/* Live Action button on hover */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-[#06B6D4] text-slate-950 flex items-center justify-center shadow-lg shadow-[#06B6D4]/25">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Performance Badge floating */}
                    <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-mono tracking-wider uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {proj.category}
                    </div>
                  </div>
                )}

                {/* Information Container */}
                <div className="p-6 sm:p-8 space-y-6 flex-grow flex flex-col justify-between">
                  
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-500 font-mono tracking-widest uppercase">
                      CLIENT: {proj.client}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white group-hover:text-[#06B6D4] transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  {/* Static Metrics panel inside project */}
                  <div className="p-4 rounded-xl bg-[#111827] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                        {proj.metricsLabel}
                      </span>
                      <span className="text-base font-bold text-white font-display mt-0.5 block">
                        {proj.metrics}
                      </span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  </div>

                  {/* Tags row */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {proj.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-mono text-slate-400 bg-[#111827]/60 border border-white/5 px-2.5 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
