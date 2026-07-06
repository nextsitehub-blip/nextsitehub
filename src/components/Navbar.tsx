import React, { useState } from "react";
import { Menu, X, Laptop, ShieldCheck, TrendingUp, Cpu, Globe, KeyRound } from "lucide-react";
import logoImg from "../assets/images/nextsitehub_clean_logo_1782965304404.jpg";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  currency: string;
  setCurrency: (curr: string) => void;
  onAdminToggle: () => void;
  adminOpen: boolean;
}

export default function Navbar({
  currentPage,
  setCurrentPage,
  currency,
  setCurrency,
  onAdminToggle,
  adminOpen
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "portfolio", label: "Portfolio" },
    { id: "about", label: "About Us" },
    { id: "pricing", label: "Pricing" },
    { id: "contact", label: "Contact" },
    { id: "audit", label: "Free Audit", highlight: true },
  ];

  const currencies = [
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "GBP", symbol: "£" },
    { code: "AUD", symbol: "A$" }
  ];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#111827] border-b border-white/5 transition-all duration-300 shadow-sm shadow-[#0F172A]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <button 
            onClick={() => handleNavClick("home")}
            className="flex items-center space-x-2.5 text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-cyan-500/20 rounded-xl p-1"
            id="nav-logo"
            type="button"
            aria-label="NextSiteHub Home Page"
          >
            <img 
              src={logoImg} 
              alt="NextSiteHub Logo" 
              className="w-10 h-10 rounded-full border border-white/10 group-hover:rotate-12 transition-all duration-300 object-cover shadow-lg shadow-[#2563EB]/15"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-display text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                NextSiteHub
              </span>
              <p className="text-[9px] font-mono tracking-widest text-[#94A3B8] uppercase">Enterprise Digital</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/35 ${
                  item.highlight
                    ? "bg-[#10B981] hover:bg-[#0da472] text-white font-semibold shadow-lg shadow-[#10B981]/20 hover:scale-[1.02]"
                    : currentPage === item.id
                    ? "text-[#06B6D4] font-semibold bg-cyan-950/30 border border-cyan-500/25 shadow-sm shadow-cyan-950/15"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Utilities (Admin Toggle Only) */}
          <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-white/5">
            {/* Admin Key Indicator Toggle */}
            <button
              id="admin-dashboard-btn"
              onClick={onAdminToggle}
              title="Toggle Lead Panel"
              className={`p-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/35 ${
                adminOpen 
                  ? "bg-[#2563EB]/20 text-[#06B6D4] border-[#2563EB]/40 shadow-md shadow-[#2563EB]/10" 
                  : "bg-[#0F172A]/80 text-slate-400 border-white/5 hover:text-white hover:border-white/20"
              }`}
            >
              <KeyRound className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center space-x-2">

            <button
              id="mobile-admin-toggle"
              onClick={onAdminToggle}
              className={`p-1.5 rounded-lg border text-slate-400 ${
                adminOpen ? "bg-blue-600/10 border-blue-500/30 text-blue-400" : "bg-slate-900 border-slate-800"
              }`}
              title="Admin Toggle"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-fadeIn" id="mobile-nav-panel">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-item-mob-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${
                item.highlight
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold"
                  : currentPage === item.id
                  ? "text-cyan-400 bg-cyan-950/20 border border-cyan-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
