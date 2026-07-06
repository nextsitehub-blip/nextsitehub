import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, 
  MapPin, 
  Instagram, 
  Clock, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight,
  Loader2
} from "lucide-react";
import { submitContactLead } from "../lib/firebase";
import { useToast } from "./Toast";

interface ContactSectionProps {
  currency: string;
}

export default function ContactSection({ currency }: ContactSectionProps) {
  const { toast } = useToast();
  
  // State for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [details, setDetails] = useState("");
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const serviceOptions = [
    "Web App Development",
    "SaaS Platform Design",
    "SEO & Marketing Boost",
    "Brand & Visual Systems"
  ];

  // Dynamically formatted budgets based on currency choice
  const getBudgetOptions = () => {
    const symbol = currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$";
    if (currency === "INR") {
      return [
        { label: "< ₹5,000", value: "under-5k" },
        { label: "₹5,000 - ₹10,000", value: "5k-10k" },
        { label: "₹10,000 - ₹19,000", value: "10k-19k" },
        { label: "₹19,000+", value: "19k-plus" }
      ];
    }
    return [
      { label: `< ${symbol}2,500`, value: "under-2.5k" },
      { label: `${symbol}2,500 - ${symbol}5,000`, value: "2.5k-5k" },
      { label: `${symbol}5,000 - ${symbol}12,500`, value: "5k-12.5k" },
      { label: `${symbol}12,500+`, value: "12.5k-plus" }
    ];
  };

  const budgetOptions = getBudgetOptions();

  const handleServiceToggle = (serviceName: string) => {
    if (selectedServices.includes(serviceName)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceName));
    } else {
      setSelectedServices([...selectedServices, serviceName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Field-level verification
    if (!name.trim()) {
      setErrorMsg("Please provide your full name so we can address you correctly.");
      toast("Name is required.", "warning");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("An email address is required so we can send you our project proposal.");
      toast("Email address is required.", "warning");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Please enter a valid, active email address.");
      toast("Invalid email address format.", "error");
      return;
    }
    if (selectedServices.length === 0) {
      setErrorMsg("Please select at least one service category you need help with.");
      toast("Please select a required service.", "warning");
      return;
    }
    if (!budget) {
      setErrorMsg("Please estimate your project budget to help us customize our proposal.");
      toast("Please choose a budget range.", "warning");
      return;
    }
    if (!details.trim()) {
      setErrorMsg("Please share brief details of your project context.");
      toast("Project details are required.", "warning");
      return;
    }

    setLoading(true);

    try {
      // Save contact inquiry to Firebase Firestore
      await submitContactLead({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || "Individual",
        message: details.trim(),
        services: selectedServices,
        budget: budget,
        currency: currency
      });

      setSuccess(true);
      toast("Inquiry submitted successfully! A product lead has been assigned.", "success");
      
      // Clear fields upon success
      setName("");
      setEmail("");
      setCompany("");
      setSelectedServices([]);
      setBudget("");
      setDetails("");
    } catch (err: any) {
      console.error("Firestore submit contact lead failure:", err);
      setErrorMsg("An unexpected connection issue occurred. Please email us directly at nextsitehub@gmail.com.");
      toast("Submission failed. Connection issue.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Micro-interaction motion settings
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as any } 
    }
  };

  return (
    <section 
      id="contact" 
      className="bg-[#F8FAFC] text-[#0F172A] py-24 md:py-32 font-sans border-t border-slate-200/60 relative overflow-hidden"
    >
      {/* Decorative architectural background details */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#2563EB]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#06B6D4]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#2563EB]/10 text-[#2563EB] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#06B6D4] animate-pulse" />
            Connect With Us
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Let's Build Something Exceptional
          </h2>
          <p className="font-sans text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Whether you're launching a new business, redesigning your website, or looking to grow online, we're here to help.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Premium Contact Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-5 space-y-6 lg:sticky lg:top-28"
          >
            <div className="space-y-3">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0F172A]">
                Start your NextSiteHub experience
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Connect directly with our engineering and visual architecture team. We perform meticulous custom reviews on every inquiry before schedule discovery calls.
              </p>
            </div>

            {/* Premium Contact Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 pt-4">
              
              {/* Email Card */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -3, boxShadow: "0 12px 28px -6px rgba(15, 23, 42, 0.05)" }}
                className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:border-slate-200 transition-all duration-300 group flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:bg-[#2563EB] group-hover:text-white transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Direct Email
                  </span>
                  <a 
                    href="mailto:nextsitehub@gmail.com" 
                    className="text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors break-all block"
                  >
                    nextsitehub@gmail.com
                  </a>
                </div>
              </motion.div>

              {/* Location Card */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -3, boxShadow: "0 12px 28px -6px rgba(15, 23, 42, 0.05)" }}
                className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:border-slate-200 transition-all duration-300 group flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center shrink-0 group-hover:bg-[#06B6D4] group-hover:text-white transition-colors duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Our Location
                  </span>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    Bengaluru, Karnataka, India
                  </p>
                </div>
              </motion.div>

              {/* Instagram Card */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -3, boxShadow: "0 12px 28px -6px rgba(15, 23, 42, 0.05)" }}
                className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:border-slate-200 transition-all duration-300 group flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0 group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Social Channel
                  </span>
                  <a 
                    href="https://instagram.com/nextsitehub" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-semibold text-[#0F172A] hover:text-pink-600 inline-flex items-center gap-1 transition-colors"
                  >
                    @nextsitehub
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </motion.div>

              {/* Response Time Card */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -3, boxShadow: "0 12px 28px -6px rgba(15, 23, 42, 0.05)" }}
                className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:border-slate-200 transition-all duration-300 group flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Response Clock
                  </span>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    Typically within 24 hours
                  </p>
                </div>
              </motion.div>

            </div>

            {/* Elegant trust badges underneath */}
            <div className="pt-6 border-t border-slate-200/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                The NextSiteHub Guarantee
              </span>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#10B981] stroke-[3]" />
                  Fast Response
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#10B981] stroke-[3]" />
                  Professional Support
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#10B981] stroke-[3]" />
                  Tailored Solutions
                </span>
              </div>
            </div>

          </motion.div>

          {/* RIGHT COLUMN: Premium Contact Form */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Form Container Card */}
            <div className="bg-white border border-slate-100 rounded-[16px] p-6 sm:p-10 shadow-lg shadow-slate-200/50 relative overflow-hidden">
              
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="text-center py-10 space-y-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-2 max-w-md mx-auto">
                      <h3 className="font-display text-2xl font-bold text-[#0F172A]">
                        Inquiry Received
                      </h3>
                      <p className="font-sans text-sm text-slate-500 leading-relaxed">
                        Thank you for sharing your project parameters. A design lead from **NextSiteHub** has queued your inquiry and will contact you shortly with a personalized action plan.
                      </p>
                    </div>
                    <div className="pt-4">
                      <button
                        onClick={() => setSuccess(false)}
                        className="px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-colors"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    
                    {errorMsg && (
                      <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-600 text-xs rounded-xl flex items-center gap-2.5 animate-fadeIn">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                        <span className="font-medium">{errorMsg}</span>
                      </div>
                    )}

                    {/* Full Name & Business Name Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
                          Full Name <span className="text-[#2563EB]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
                          Business Name <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Acme Corp"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
                        Email Address <span className="text-[#2563EB]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      />
                    </div>

                    {/* Service Required (Tag-Select Layout) */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
                        Service Required <span className="text-[#2563EB]">*</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {serviceOptions.map((opt) => {
                          const isChecked = selectedServices.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleServiceToggle(opt)}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all duration-200 flex items-center justify-between focus:outline-none ${
                                isChecked
                                  ? "bg-[#2563EB]/5 border-[#2563EB] text-[#2563EB]"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              <span>{opt}</span>
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                                isChecked 
                                  ? "bg-[#2563EB] border-[#2563EB] text-white" 
                                  : "border-slate-300 bg-white"
                              }`}>
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Estimated Budget Selector */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
                        Estimated Budget <span className="text-[#2563EB]">*</span>
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {budgetOptions.map((opt) => {
                          const isSelected = budget === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setBudget(opt.value)}
                              className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 focus:outline-none ${
                                isSelected
                                  ? "bg-[#2563EB] border-transparent text-white shadow-md shadow-[#2563EB]/15"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
                        Project Details <span className="text-[#2563EB]">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about your project goals, current performance struggles, or specific timelines..."
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
                      />
                    </div>

                    {/* Send Project Inquiry Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ borderRadius: "12px" }}
                      className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#2563EB]/15 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 cursor-pointer transform active:scale-[0.995]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Submitting Project Parameters...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Project Inquiry</span>
                        </>
                      )}
                    </button>

                  </form>
                )}
              </AnimatePresence>

            </div>

            {/* Highlighted Consultation CTA Card */}
            <div className="bg-[#111827] border border-slate-800 text-white rounded-[16px] p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#10B981]/20 text-[#10B981]">
                    Quick Connect
                  </div>
                  <h4 className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
                    Start Your Free Consultation
                  </h4>
                  <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Have questions or want to discuss your project? Connect with us directly on Instagram for a quick, friendly conversation about your goals and the best solution for your business.
                  </p>
                </div>
                
                <a 
                  href="https://instagram.com/nextsitehub" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ backgroundColor: "#10B981" }}
                  className="w-full sm:w-auto px-5 py-3.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#059669] hover:shadow-lg hover:shadow-[#10B981]/20 transition-all duration-300 flex items-center justify-center gap-2 group shrink-0"
                >
                  <Instagram className="w-4.5 h-4.5 text-white group-hover:scale-110 transition-transform" />
                  <span>Message Us on Instagram</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* Footer note & remote support */}
            <p className="text-center text-xs text-slate-400 font-medium">
              Serving businesses locally in Bengaluru and remotely worldwide.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}
