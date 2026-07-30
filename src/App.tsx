import React, { useState, lazy, Suspense } from "react";
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import TrustIndicators from "./components/TrustIndicators";
import ServicesSection from "./components/ServicesSection";
import PortfolioSection from "./components/PortfolioSection";
import ProcessSection from "./components/ProcessSection";
import PricingSection from "./components/PricingSection";
import TestimonialsSection from "./components/TestimonialsSection";
import FaqSection from "./components/FaqSection";
import VisitorActivityBar from "./components/VisitorActivityBar";

// High-performance Code Splitting via Dynamic Lazy Loading
const AuditWizard = lazy(() => import("./components/AuditWizard"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AboutSection = lazy(() => import("./components/AboutSection"));
const ContactSection = lazy(() => import("./components/ContactSection"));

function SectionLoader() {
  return (
    <div className="py-24 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]" role="status" aria-live="polite">
      <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Compiling viewport assets...</p>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [currency, setCurrencyState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("nextsitehub_currency");
      if (saved && ["INR", "USD", "EUR"].includes(saved)) {
        return saved;
      }
      
      // Auto-select based on location heuristics (timezone and language)
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz.includes("Kolkata") || tz.includes("Calcutta") || tz.includes("Asia/Kolkata") || tz.includes("Indian")) {
        return "INR";
      }
      if (tz.includes("Europe") || tz.includes("Paris") || tz.includes("Berlin") || tz.includes("Rome") || tz.includes("Madrid") || tz.includes("Amsterdam")) {
        return "EUR";
      }
      
      const lang = navigator.language || "";
      if (lang.includes("-IN") || lang.startsWith("en-IN") || lang === "hi") {
        return "INR";
      }
      if (lang.includes("-DE") || lang.includes("-FR") || lang.includes("-ES") || lang.includes("-IT") || lang.includes("-NL")) {
        return "EUR";
      }
    } catch (e) {
      console.warn("Could not determine geolocation currency heuristic", e);
    }
    return "USD";
  });

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem("nextsitehub_currency", curr);
    } catch (e) {
      console.error("Local storage error saving currency", e);
    }
  };

  const [adminOpen, setAdminOpen] = useState<boolean>(false);

  const handleAdminToggle = () => {
    setAdminOpen(!adminOpen);
  };

  return (
    <div className="min-h-screen bg-[#111827] text-slate-50 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-white">
      
      {/* Top Glassmorphic Navigation */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currency={currency}
        setCurrency={setCurrency}
        onAdminToggle={handleAdminToggle}
        adminOpen={adminOpen}
      />

      {/* Main Page Layout Container */}
      <main className="flex-grow">
        {currentPage === "home" && (
          <div className="animate-fadeIn">
            <VisitorActivityBar />
            <Hero setCurrentPage={setCurrentPage} />
            <TrustIndicators />
            <ServicesSection setCurrentPage={setCurrentPage} />
            <PortfolioSection />
            <ProcessSection />
            <PricingSection
              currency={currency}
              setCurrency={setCurrency}
              setCurrentPage={setCurrentPage}
            />
            <TestimonialsSection />
            <FaqSection />
            <Suspense fallback={<SectionLoader />}>
              <ContactSection currency={currency} />
            </Suspense>
          </div>
        )}

        {currentPage === "services" && (
          <div className="animate-fadeIn pt-12">
            <ServicesSection setCurrentPage={setCurrentPage} />
          </div>
        )}

        {currentPage === "portfolio" && (
          <div className="animate-fadeIn pt-12">
            <PortfolioSection />
          </div>
        )}

        {currentPage === "about" && (
          <div className="animate-fadeIn pt-12">
            <Suspense fallback={<SectionLoader />}>
              <AboutSection />
            </Suspense>
          </div>
        )}

        {currentPage === "pricing" && (
          <div className="animate-fadeIn pt-12">
            <PricingSection
              currency={currency}
              setCurrency={setCurrency}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}

        {currentPage === "contact" && (
          <div className="animate-fadeIn pt-12">
            <Suspense fallback={<SectionLoader />}>
              <ContactSection currency={currency} />
            </Suspense>
          </div>
        )}

        {currentPage === "audit" && (
          <div className="animate-fadeIn">
            <Suspense fallback={<SectionLoader />}>
              <AuditWizard />
            </Suspense>
          </div>
        )}
      </main>

      {/* Leads CRM Admin overlay Panel */}
      {adminOpen && (
        <Suspense fallback={<SectionLoader />}>
          <AdminDashboard onClose={() => setAdminOpen(false)} />
        </Suspense>
      )}

      {/* Standardized Footing details */}
      <Footer 
        setCurrentPage={setCurrentPage} 
        onAdminToggle={handleAdminToggle} 
      />

      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </div>
  );
}
