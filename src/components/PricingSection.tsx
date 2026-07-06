import React, { useState, useEffect } from "react";
import { CheckCircle2, Sparkles, RefreshCw, Zap, Award, Globe, Coins } from "lucide-react";
import { fetchPricingPlans } from "../lib/firebase";
import { PricingPlan } from "../types";

interface PricingSectionProps {
  currency: string;
  setCurrency: (curr: string) => void;
  setCurrentPage: (page: string) => void;
}

export default function PricingSection({ currency, setCurrency, setCurrentPage }: PricingSectionProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagesNeeded, setPagesNeeded] = useState<number>(5);

  useEffect(() => {
    async function loadPlans() {
      setLoading(true);
      try {
        const data = await fetchPricingPlans();
        setPlans(data);
      } catch (err) {
        console.error("Failed to fetch plans", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  // Determine active plan selection based on pages slider matching
  const getSelectedPlanId = (pages: number) => {
    if (pages <= 3) return "starter";
    if (pages <= 8) return "growth";
    return "premium";
  };

  const activePlanId = getSelectedPlanId(pagesNeeded);

  // Helper to format currency accurately using local formatting rules
  const formatPrice = (plan: PricingPlan) => {
    if (currency === "INR") {
      return "₹" + plan.priceINR.toLocaleString("en-IN");
    } else if (currency === "EUR") {
      return "€" + plan.priceEUR.toLocaleString("de-DE");
    } else {
      return "$" + plan.priceUSD.toLocaleString("en-US");
    }
  };

  return (
    <section className="bg-[#111827] py-20 md:py-28 font-sans border-y border-white/5 relative overflow-hidden animate-fadeIn" id="pricing">
      {/* Visual atmospheric accents */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3.5 py-1.5 rounded-full">
            Transparent Scaling
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Transparent Pricing. Curated Value.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Bespoke rates defined manually per region. Choose the perfect operational level to fit your commercial ambitions.
          </p>
        </div>

        {/* Dynamic Interactive Pages Slider */}
        <div className="bg-[#0F172A]/50 border border-white/5 p-6 sm:p-8 rounded-2xl max-w-2xl mx-auto mb-16 space-y-6 shadow-xl shadow-[#0F172A]/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="font-mono text-[10px] uppercase text-[#06B6D4] font-bold tracking-wider">Plan Calculator</span>
              <h4 className="font-display text-base font-bold text-white">How many pages does your scope require?</h4>
              <p className="text-xs text-slate-400">Drag the slider to match your estimated digital footprint requirements.</p>
            </div>
            
            {/* Dynamic Counter Bubble */}
            <div className="px-5 py-3 rounded-xl bg-slate-950 border border-white/5 text-center shrink-0">
              <span className="text-2xl font-extrabold font-display text-[#06B6D4]">{pagesNeeded}</span>
              <span className="text-xs font-mono text-slate-500 block">PAGES</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min="1"
              max="20"
              value={pagesNeeded}
              onChange={(e) => setPagesNeeded(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#06B6D4] focus:outline-none"
              title="Estimate Pages"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
              <span>1 Page MVP</span>
              <span>8 Modular Pages</span>
              <span>20+ Custom Platform</span>
            </div>
          </div>

          {!loading && plans.length > 0 && (
            <div className="p-3 bg-[#2563EB]/5 rounded-xl border border-white/5 text-xs text-slate-300 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#06B6D4] shrink-0" />
              <span>Recommended tier based on selection: <strong className="text-white uppercase tracking-wider">{plans.find(p => p.id === activePlanId)?.name || "Growth Framework"}</strong></span>
            </div>
          )}
        </div>

        {/* Pricing Grid */}
        {loading ? (
          /* Skeleton Loaders */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-[#0F172A]/40 border border-white/5 p-8 rounded-2xl flex flex-col justify-between space-y-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-6 bg-slate-800 rounded w-1/2" />
                  <div className="h-3 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-5/6" />
                  <div className="h-10 bg-slate-800 rounded w-2/3 pt-4" />
                  <div className="space-y-2 pt-4">
                    {[1, 2, 3, 4].map((f) => (
                      <div key={f} className="h-3 bg-slate-800 rounded w-full" />
                    ))}
                  </div>
                </div>
                <div className="h-11 bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          /* Dynamic Grid loaded from Firestore */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-14">
            {plans.map((plan) => {
              const isRecommended = plan.id === activePlanId;
              const hasBadge = plan.badge || (plan.id === "growth" ? "Best Value" : undefined);
              
              return (
                <div
                  key={plan.id}
                  id={`pricing-card-${plan.id}`}
                  className={`p-8 rounded-2xl flex flex-col justify-between relative transition-all duration-300 ${
                    isRecommended
                      ? "bg-[#0F172A] border-2 border-[#2563EB] shadow-2xl shadow-[#2563EB]/5 -translate-y-2"
                      : "bg-[#0F172A]/50 border border-white/5 hover:border-white/10 hover:bg-[#0F172A]/70"
                  }`}
                >
                  {/* Floating Custom Badge */}
                  {hasBadge && (
                    <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-mono text-[9px] uppercase font-bold px-3 py-1 rounded-full shadow-lg">
                      {hasBadge}
                    </span>
                  )}

                  {/* Matching state visual label */}
                  {isRecommended && !hasBadge && (
                    <span className="absolute -top-3.5 right-6 bg-emerald-500 text-slate-950 font-mono text-[9px] uppercase font-extrabold px-3 py-1 rounded-full shadow-lg">
                      Matched Ideal
                    </span>
                  )}

                  <div>
                    <h3 className="font-display text-lg font-bold text-white mb-2 flex items-center gap-2">
                      {plan.id === "starter" && <Zap className="w-4 h-4 text-cyan-400" />}
                      {plan.id === "growth" && <Award className="w-4 h-4 text-amber-400" />}
                      {plan.id === "premium" && <Sparkles className="w-4 h-4 text-[#10B981]" />}
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 min-h-[48px] leading-relaxed mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold text-white tracking-tight font-display">
                        {formatPrice(plan)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono"> {currency} rate</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-400 mb-6 bg-slate-950 p-2.5 rounded-lg border border-white/5">
                      <span className="text-[#06B6D4]">⏱ Timeline:</span>
                      <span>{plan.timeline}</span>
                    </div>

                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start space-x-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="https://ig.me/m/nextsitehub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 text-center block ${
                      isRecommended
                        ? "bg-[#10B981] hover:bg-[#0da472] text-white shadow-lg shadow-[#10B981]/20 hover:scale-[1.01]"
                        : "bg-slate-950 hover:bg-slate-900 text-slate-200 border border-white/5"
                    }`}
                  >
                    Book free consultation
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Premium Currency Selector Section */}
        <div className="max-w-md mx-auto text-center space-y-4 border-t border-white/5 pt-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Operational Currency Selector</span>
          </div>
          
          {/* Segmented Selector */}
          <div className="inline-flex bg-slate-950 p-1.5 rounded-xl border border-white/5 shadow-inner">
            {[
              { code: "INR", label: "₹ INR (India)", desc: "Rupee local" },
              { code: "USD", label: "$ USD (Global)", desc: "US Dollar" },
              { code: "EUR", label: "€ EUR (Europe)", desc: "Euro union" }
            ].map((opt) => {
              const isActive = currency === opt.code;
              return (
                <button
                  key={opt.code}
                  onClick={() => setCurrency(opt.code)}
                  className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 flex flex-col items-center justify-center ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/15"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  title={`Switch pricing to ${opt.code}`}
                >
                  <span className="font-bold">{opt.label}</span>
                  <span className={`text-[9px] font-mono mt-0.5 font-normal ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
            All prices are manual and customized for your location. No dynamically inflating conversion fees are added.
          </p>
        </div>

      </div>
    </section>
  );
}
