import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { fetchTestimonials } from "../lib/firebase";
import { TestimonialItem } from "../types";

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const fetched = await fetchTestimonials();
        setReviews(fetched);
      } catch (err) {
        console.error("Error loading testimonials:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTestimonials();
  }, []);

  return (
    <section className="bg-[#111827] py-20 md:py-28 font-sans" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded-full">
            CLIENT ADVOCACY
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Endorsed by Technical Leaders
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Read direct feedback from VPs, CTOs, and startup founders who turned to NextSiteHub to overhaul their web performance.
          </p>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 font-mono text-xs gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#06B6D4]" />
            <span>RETRIEVING CLIENT ADVOCACY RECORDS...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-mono text-xs">
            No testimonials found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                id={`testimonial-card-${rev.id}`}
                className="p-8 rounded-2xl bg-[#0F172A]/50 border border-white/5 flex flex-col justify-between hover:bg-[#0F172A]/85 transition-all duration-300 group"
              >
                <div className="space-y-6">
                  
                  {/* Rating Stars */}
                  <div className="flex items-center space-x-1.5">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    "{rev.content}"
                  </p>
                </div>

                {/* Profile Card */}
                <div className="flex items-center space-x-4 pt-6 border-t border-white/5 mt-8">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover border border-white/5 shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">{rev.name}</h4>
                    <p className="text-[11px] font-mono text-slate-500 uppercase mt-0.5">
                      {rev.role} at <strong className="text-slate-400 font-semibold">{rev.company}</strong>
                    </p>
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
