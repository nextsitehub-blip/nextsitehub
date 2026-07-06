import React from "react";
import { ArrowUpRight, ShieldCheck, Zap, Sparkles, Code, LayoutGrid } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  setCurrentPage: (page: string) => void;
}

export default function Hero({ setCurrentPage }: HeroProps) {
  return (
    <div className="relative bg-[#0F172A] pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-12 right-12 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 shadow-xl"
            id="hero-badge"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs font-semibold tracking-wide font-mono">NEXTSITEHUB STUDIO</span>
            <span className="text-slate-500">|</span>
            <span className="text-xs font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Webflow & Enterprise Engineering
            </span>
          </motion.div>

          {/* Main Display Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]"
            id="hero-heading"
          >
            Engineering Premium Digital Products That {" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Drive Scale & Trust
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed"
            id="hero-description"
          >
            NextSiteHub is a premier design-and-development agency. We deliver high-performing web platforms, scalable SaaS products, SEO architecture, and enterprise digital marketing.
          </motion.p>

          {/* Core Interactive Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
            id="hero-ctas"
          >
            <button
              onClick={() => {
                setCurrentPage("contact");
                window.scrollTo({ top: document.getElementById("contact")?.offsetTop || 0, behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-2 group transition-all"
            >
              <span>Get Started Now</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setCurrentPage("audit");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 active:scale-[0.98] font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Get Free AI Audit</span>
            </button>
          </motion.div>

          {/* Static Value Props */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-900 w-full mt-8 max-w-3xl"
          >
            <div className="flex items-center justify-center gap-2">
              <Code className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-400 font-mono tracking-wide">CUSTOM CODE ONLY</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-400 font-mono tracking-wide">99+ PAGESPEED SCORES</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <LayoutGrid className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-400 font-mono tracking-wide">PIXEL-PERFECT UX</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-400 font-mono tracking-wide">ENTERPRISE SECURITY</span>
            </div>
          </motion.div>

        </div>

        {/* Hero Illustration / Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="mt-16 md:mt-20 max-w-5xl mx-auto rounded-2xl border border-slate-800/80 bg-[#0B0F19] p-2.5 sm:p-4 shadow-2xl shadow-blue-500/5 relative overflow-hidden"
          id="hero-mockup"
        >
          {/* Mock Window Header */}
          <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-800/60 mb-3 sm:mb-4">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
              <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
            </div>
            <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
              https://nextsitehub.com/dashboard/analytics
            </div>
            <div className="w-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stat Item 1 */}
            <div className="bg-slate-900/60 border border-slate-800/50 p-5 rounded-xl flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 font-mono">WEEKLY ORGANIC TRAFFIC</span>
                <p className="text-2xl font-bold font-display text-white mt-1">45,820</p>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5 mt-2">
                  +12.4% vs last week
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Zap className="w-4 h-4 animate-bounce" />
              </div>
            </div>

            {/* Stat Item 2 */}
            <div className="bg-slate-900/60 border border-slate-800/50 p-5 rounded-xl flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 font-mono">CONVERSION INCREASE</span>
                <p className="text-2xl font-bold font-display text-white mt-1">325.8%</p>
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-0.5 mt-2">
                  After Hub redesign
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </div>

            {/* Stat Item 3 */}
            <div className="bg-slate-900/60 border border-slate-800/50 p-5 rounded-xl flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 font-mono">AVERAGE PAGESPEED SCORE</span>
                <p className="text-2xl font-bold font-display text-white mt-1">100 / 100</p>
                <span className="text-xs font-semibold text-blue-400 flex items-center gap-0.5 mt-2">
                  Core Web Vitals green
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Code className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="mt-4 bg-slate-900/40 border border-slate-800/40 p-4 rounded-xl text-left font-mono text-[11px] text-slate-400 overflow-x-auto space-y-1.5 scrollbar-thin">
            <span className="text-cyan-500">const</span> <span className="text-white">hubConfig</span> = &#123; <span className="text-slate-500">framework</span>: <span className="text-emerald-400">"React + Vite"</span>, <span className="text-slate-500">styling</span>: <span className="text-emerald-400">"TailwindCSS"</span> &#125;;
            <br />
            <span className="text-cyan-500">const</span> <span className="text-white">launchCampaign</span> = (<span className="text-orange-300">agency</span>) =&gt; <span className="text-emerald-400">"Seamless performance, beautiful design, robust leads"</span>;
            <br />
            <span className="text-slate-500">// Result: Perfect Core Web Vitals, immediate conversion growth</span>
            <br />
            <span className="text-blue-400">launchCampaign</span>(NextSiteHub); <span className="text-slate-500">// &gt; SUCCESS: 4.8s Faster Load Speed, +210% User retention</span>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
