import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Users, TrendingUp } from "lucide-react";
import { recordVisitorAndGetCount } from "../lib/firebase";

export default function VisitorActivityBar() {
  const [count, setCount] = useState<number>(21);
  const [displayCount, setDisplayCount] = useState<number>(21);
  const [pulse, setPulse] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initVisitorTrack() {
      try {
        // Calculate dynamic calendar month ID (YYYY-MM)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const monthId = `${year}-${month}`; // e.g. "2026-06"

        const localKey = `nextsitehub_visited_${monthId}`;
        const hasVisitedThisMonth = localStorage.getItem(localKey) === "true";

        let finalCount: number;
        if (!hasVisitedThisMonth) {
          // New visit recorded for this month
          localStorage.setItem(localKey, "true");
          finalCount = await recordVisitorAndGetCount(monthId, true);
          setPulse(true);
          setTimeout(() => setPulse(false), 800);
        } else {
          // Already visited this month, just get current count
          finalCount = await recordVisitorAndGetCount(monthId, false);
        }

        setCount(finalCount);
        setDisplayCount(finalCount);
      } catch (err) {
        console.error("Failed to track visitor count:", err);
      } finally {
        setLoading(false);
      }
    }

    initVisitorTrack();
  }, []);

  // Smooth count increment transition (200–400 ms)
  useEffect(() => {
    if (loading) return;
    let start = displayCount;
    const end = count;
    if (start === end) return;

    const duration = 300; // ms
    const range = end - start;
    const stepTime = Math.max(Math.floor(duration / Math.abs(range)), 15);

    const timer = setInterval(() => {
      if (start < end) {
        start++;
        setDisplayCount(start);
      } else if (start > end) {
        start--;
        setDisplayCount(start);
      } else {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [count, loading]);

  if (loading) {
    return null; // Smooth render with no layout shifts
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full flex justify-center px-4 mt-6 -mb-2 relative z-20"
      id="visitor-bar-container"
    >
      <div 
        className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl py-2.5 px-6 shadow-lg shadow-slate-950/10 flex items-center space-x-3 max-w-lg select-none hover:scale-[1.01] transition-transform duration-300"
        id="visitor-activity-bar"
        role="status"
        aria-live="polite"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-4 h-4 text-[#2563EB]" />
          </div>
          {/* Subtle live pulse indicator */}
          <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
          </span>
        </div>

        <div className="text-sm font-sans text-[#475569] leading-tight">
          <motion.span 
            animate={pulse ? { scale: [1, 1.25, 1], color: ["#0F172A", "#06B6D4", "#0F172A"] } : {}}
            transition={{ duration: 0.5 }}
            className="font-display font-semibold text-[#0F172A] text-base inline-block mr-1"
          >
            {displayCount}
          </motion.span>{" "}
          people have visited{" "}
          <span className="font-display font-medium text-[#0F172A]">NextSiteHub</span>{" "}
          this month.
        </div>

        <div className="flex items-center space-x-1 pl-3 border-l border-slate-200 shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase tracking-wider">Live</span>
        </div>
      </div>
    </motion.div>
  );
}
