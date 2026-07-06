import React, { useState } from "react";
import { Laptop, Send, CheckCircle2, MessageSquare, Phone, MapPin, Mail, Github, Twitter, Linkedin, Instagram, Clock } from "lucide-react";
import { submitContactLead } from "../lib/firebase";
import logoImg from "../assets/images/nextsitehub_clean_logo_1782965304404.jpg";

interface FooterProps {
  setCurrentPage: (page: string) => void;
  onAdminToggle: () => void;
}

export default function Footer({ setCurrentPage, onAdminToggle }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await submitContactLead({
        name: "Newsletter Subscriber",
        email: email,
        message: "Subscribed to NextSiteHub newsletter updates.",
        services: ["Newsletter Subscription"],
        budget: "N/A",
        currency: "USD"
      });
      setSubscribed(true);
      setEmail("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-white/5 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top visual grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/5">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div 
              onClick={() => handleLinkClick("home")}
              className="flex items-center space-x-2.5 cursor-pointer group"
              id="footer-logo"
            >
              <img 
                src={logoImg} 
                alt="NextSiteHub Logo" 
                className="w-10 h-10 rounded-full border border-white/10 group-hover:rotate-12 transition-all duration-300 object-cover shadow-lg shadow-[#2563EB]/15"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="font-display text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  NextSiteHub
                </span>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Designing and building the next generation of premium, high-converting digital products and web frameworks for ambitious enterprises.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a 
                href="https://instagram.com/nextsitehub" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-[#111827] border border-white/5 text-slate-400 hover:text-pink-500 hover:border-pink-500/40 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="mailto:nextsitehub@gmail.com" 
                className="p-2 rounded-lg bg-[#111827] border border-white/5 text-slate-400 hover:text-[#2563EB] hover:border-[#2563EB]/40 transition-colors"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a 
                href="https://github.com/nextsitehub-blip" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-[#111827] border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-white tracking-wider uppercase mb-5">Navigational Map</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => handleLinkClick("home")} className="hover:text-[#06B6D4] text-slate-400 transition-colors text-left">
                  Homepage Introduction
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("services")} className="hover:text-[#06B6D4] text-slate-400 transition-colors text-left">
                  Agency Offerings
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("portfolio")} className="hover:text-[#06B6D4] text-slate-400 transition-colors text-left">
                  Curated Case Studies
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("about")} className="hover:text-[#06B6D4] text-slate-400 transition-colors text-left">
                  Our Studio Philosophy
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("pricing")} className="hover:text-[#06B6D4] text-slate-400 transition-colors text-left">
                  Flexible Tiered Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-display text-sm font-semibold text-white tracking-wider uppercase mb-5">Contact Hub</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-[#06B6D4] mt-0.5 shrink-0" />
                <a href="mailto:nextsitehub@gmail.com" className="text-slate-400 hover:text-[#2563EB] transition-colors break-all">
                  nextsitehub@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-2.5">
                <Instagram className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
                <a 
                  href="https://instagram.com/nextsitehub" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-pink-500 transition-colors"
                >
                  @nextsitehub
                </a>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-slate-400">Bengaluru, Karnataka, India</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-slate-400">Typically within 24 hours</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-white tracking-wider uppercase mb-5">Join our Intelligence list</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive raw industry insights, UI/UX breakdowns, and modern web engineering updates. No spam, ever.
            </p>

            {subscribed ? (
              <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>You are subscribed to our list!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex space-x-1.5" id="newsletter-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-[#111827] border border-white/5 text-slate-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none focus:border-[#2563EB]/40"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shadow-md shadow-[#2563EB]/15"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-slate-500 font-mono">
          <p>© 2026 NextSiteHub Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <button 
              id="footer-admin-btn"
              onClick={onAdminToggle}
              className="hover:text-slate-300 text-left transition-colors flex items-center space-x-1 text-slate-600"
            >
              <span>[Admin Portal]</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
