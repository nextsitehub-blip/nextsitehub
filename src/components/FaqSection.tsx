import React, { useState, useEffect } from "react";
import { FAQItem } from "../types";
import { Plus, Minus, HelpCircle, Loader2 } from "lucide-react";
import { fetchFAQs } from "../lib/firebase";

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FAQItem["category"]>("general");
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFAQs() {
      try {
        const fetched = await fetchFAQs();
        setFaqs(fetched);
        // Auto open the first FAQ in general
        const generalFirst = fetched.find(f => f.category === "general");
        if (generalFirst) {
          setOpenId(generalFirst.id);
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFAQs();
  }, []);

  const categories: { id: FAQItem["category"]; label: string }[] = [
    { id: "general", label: "General" },
    { id: "services", label: "Capabilities" },
    { id: "process", label: "Delivery" },
    { id: "pricing", label: "Settlements" }
  ];

  const filteredFaqs = faqs.filter(faq => faq.category === activeTab);

  const toggleOpen = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="bg-[#111827] py-20 md:py-28 font-sans border-t border-white/5" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded-full">
            INTELLIGENCE DESK
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Explored Inquiries
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Get straightforward, objective answers about our engineering process, pricing structures, and visual designs.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                // Auto-open first item in category if available
                const firstOfCat = faqs.find(f => f.category === cat.id);
                setOpenId(firstOfCat ? firstOfCat.id : null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase border transition-all duration-200 ${
                activeTab === cat.id
                  ? "bg-[#2563EB] border-transparent text-white shadow-lg shadow-[#2563EB]/15"
                  : "bg-[#0F172A]/50 text-[#94A3B8] border border-white/5 hover:text-white hover:border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 font-mono text-xs gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#06B6D4]" />
              <span>SYNCING ACCORDION INTELLIGENCE RECORDS...</span>
            </div>
          ) : filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className="bg-[#0F172A]/50 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleOpen(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-body-${faq.id}`}
                    id={`faq-btn-${faq.id}`}
                    className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 rounded-2xl"
                  >
                    <div className="flex items-center space-x-3.5">
                      <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span id={`faq-title-${faq.id}`} className="font-display text-sm sm:text-base font-bold text-white tracking-tight">
                        {faq.question}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#111827] border border-white/5 text-slate-400 shrink-0">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Body Expandable Panel */}
                  {isOpen && (
                    <div
                      id={`faq-body-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-title-${faq.id}`}
                      className="px-6 pb-7 sm:px-7 sm:pb-8 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4 bg-[#0F172A]/25"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center text-slate-500 text-xs py-8 font-mono">No queries listed in this folder currently.</p>
          )}
        </div>

      </div>
    </section>
  );
}
