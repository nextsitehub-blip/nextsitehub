import React, { useState } from "react";
import { 
  Laptop, CheckCircle2, AlertTriangle, Play, Sparkles, 
  ArrowRight, RefreshCw, BarChart2, Eye, ShieldCheck, Zap, Mail
} from "lucide-react";
import { saveAuditReport } from "../lib/firebase";
import { WebsiteAudit } from "../types";
import { useToast } from "./Toast";

export default function AuditWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [industry, setIndustry] = useState<string>("Technology");
  const [servicesNeeded, setServicesNeeded] = useState<string[]>([]);
  
  const [report, setReport] = useState<WebsiteAudit | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const industries = [
    "Technology & SaaS", "Finance & Fintech", "Healthcare & Biotech", 
    "E-Commerce & Retail", "Professional Services", "Entertainment & Media", "Real Estate & Construction"
  ];

  const serviceOptions = [
    "Custom Web Development", "UI/UX Layout Overhaul", "Technical SEO Audits", "Automated Lead Capture"
  ];

  const handleServiceToggle = (svc: string) => {
    if (servicesNeeded.includes(svc)) {
      setServicesNeeded(servicesNeeded.filter(s => s !== svc));
    } else {
      setServicesNeeded([...servicesNeeded, svc]);
    }
  };

  const runAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanUrl = url.trim();
    const cleanEmail = email.trim();

    if (cleanUrl && (!cleanUrl.includes(".") || cleanUrl.length < 4)) {
      setErrorMsg("Please enter a valid website URL address.");
      toast("Invalid website URL format.", "error");
      return;
    }

    if (!cleanEmail) {
      setErrorMsg("Please provide your contact email address.");
      toast("Email address is required.", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address format.");
      toast("Invalid email address format.", "error");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setStep(2); // Show audit progress
    toast("AI Audit Engine initialized. Gathering SEO metrics...", "info");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl || "No Website (Strategy Audit)", description, industry, servicesNeeded, email: cleanEmail })
      });

      if (!response.ok) {
        throw new Error("Failed to process audit through server");
      }

      const data = await response.json();
      
      const auditResult: WebsiteAudit = {
        ...data,
        email: cleanEmail,
        url: cleanUrl || "No Website (Strategy Audit)",
        description,
        industry,
        servicesNeeded,
        timestamp: new Date().toISOString(),
        status: "New"
      };

      // Save report in Firestore or LocalStorage
      await saveAuditReport(auditResult);
      
      setReport(auditResult);
      setStep(3); // Show finished report
      toast("Bespoke SEO and UX audit compiled successfully!", "success");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to communicate with AI Audit engine. Please retry.");
      toast("AI Audit generation failed. Please check network connection.", "error");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setUrl("");
    setEmail("");
    setDescription("");
    setServicesNeeded([]);
    setReport(null);
  };

  const getSeverityColor = (imp: string) => {
    if (imp === "High") return "text-red-400 bg-red-500/10 border-red-500/20";
    if (imp === "Medium") return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
  };

  return (
    <div className="bg-[#111827] min-h-screen py-16 md:py-24 font-sans relative overflow-hidden" id="audit-page">
      {/* Visual background decor */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[90px]" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[90px]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        
        {/* Step 1: Submission Input Form */}
        {step === 1 && (
          <div className="space-y-10 animate-fadeIn">
            
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#06B6D4] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded-full">
                bespoke diagnostic
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Run Instant Website Audit
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Discover precise technical design improvements, load latencies, and conversion leaks. Powered server-side by NextSiteHub Consulting metrics.
              </p>
            </div>

            <form onSubmit={runAudit} noValidate className="bg-[#0F172A]/50 border border-white/5 p-8 rounded-2xl space-y-6 shadow-2xl" id="audit-form">
              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Website URL */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Website URL (Optional)</label>
                  <div className="relative">
                    <Laptop className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="url"
                      placeholder="https://yourbrand.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-[#2563EB]/50"
                    />
                  </div>
                </div>

                {/* Contact Email */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Your Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="your@brand.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-[#2563EB]/50"
                    />
                  </div>
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Primary Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-[#2563EB]/50 cursor-pointer"
                  >
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Business Short description */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Business Strategy & Target Audience</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly state your core value prop or goals (e.g. 'B2B automation services targeting mid-size HR directors...')"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-[#2563EB]/50"
                  />
                </div>

              </div>

              {/* Service interested options checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">Areas to focus critique</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {serviceOptions.map((opt) => {
                    const checked = servicesNeeded.includes(opt);
                    return (
                      <div
                        key={opt}
                        onClick={() => handleServiceToggle(opt)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          checked
                            ? "bg-cyan-500/10 border-[#2563EB]/40 text-white font-semibold"
                            : "bg-slate-950/40 border border-white/5 text-slate-400 hover:border-slate-800"
                        }`}
                      >
                        <span className="text-xs">{opt}</span>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          checked ? "bg-cyan-400 border-cyan-400 text-slate-950" : "border-slate-700"
                        }`}>
                          {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#2563EB]/15 flex items-center justify-center gap-2 transition-all mt-6"
              >
                <span>Initialize AI Critique Scan</span>
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              </button>

            </form>
          </div>
        )}

        {/* Step 2: Processing Report Loader */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto my-8">
            {/* Elegant Status Card */}
            <div className="bg-[#0F172A] border border-white/5 p-8 rounded-2xl text-center space-y-6 shadow-2xl max-w-xl mx-auto">
              <div className="relative w-16 h-16 mx-auto">
                <RefreshCw className="w-16 h-16 text-cyan-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-lg sm:text-xl font-bold text-white">Compiling AI Audit Report...</h3>
                <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">AUDITING TARGET: {url}</p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5 relative">
                <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 h-1.5 rounded-full absolute top-0 left-0 w-1/2 animate-pulse" style={{ animationDuration: '1.5s' }} />
              </div>

              <div className="space-y-2 text-xs text-slate-400 font-mono text-left max-w-sm mx-auto bg-slate-950 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>&gt; establishing connection to semantic analyzer...</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>&gt; scanning layout DOM contrast ratios...</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>&gt; invoking Gemini 2.5-Flash model pipelines...</span>
                </div>
              </div>
            </div>

            {/* Skeleton Loaders of the Final Report Layout */}
            <div className="space-y-4 pt-4">
              <div className="text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">PREVIEWING REPORT STRUCTURE</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-30 select-none pointer-events-none">
                {/* Skeleton Card 1 */}
                <div className="bg-[#0F172A] border border-white/5 p-6 rounded-2xl space-y-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-4 bg-slate-800 rounded w-1/3" />
                      <div className="h-3 bg-slate-800 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-800 rounded w-5/6" />
                    <div className="h-3 bg-slate-800 rounded w-4/5" />
                  </div>
                </div>

                {/* Skeleton Card 2 */}
                <div className="bg-[#0F172A] border border-white/5 p-6 rounded-2xl space-y-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-4 bg-slate-800 rounded w-1/2" />
                      <div className="h-3 bg-slate-800 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-800 rounded w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Finished Diagnostic Report */}
        {step === 3 && report && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Report Header card */}
            <div className="bg-[#0F172A]/50 border border-white/5 p-8 rounded-2xl relative overflow-hidden shadow-2xl space-y-6">
              
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                  <span className="font-mono text-[10px] font-bold text-emerald-400 tracking-widest uppercase">DIAGNOSTIC REPORT GENERATED</span>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">NextSiteHub Strategic Audit</h1>
                  <p className="text-xs text-slate-400 mt-1 font-mono">TARGET URL: <span className="text-cyan-400 font-semibold">{report.url}</span></p>
                </div>

                <button
                  onClick={resetWizard}
                  className="px-4 py-2 bg-slate-950/40 border border-white/5 text-slate-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0 self-start sm:self-center"
                >
                  Run New Audit
                </button>
              </div>

              {/* Dynamic Scores circle grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* SEO Score */}
                <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">SEO INDEX</span>
                  <span className={`text-3xl font-extrabold font-display ${report.scores.seo >= 80 ? 'text-emerald-400' : report.scores.seo >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {report.scores.seo}
                  </span>
                  <div className="w-full h-1 bg-slate-900 rounded-full mt-2">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${report.scores.seo}%` }} />
                  </div>
                </div>

                {/* UX Index */}
                <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">UX SCORE</span>
                  <span className={`text-3xl font-extrabold font-display ${report.scores.ux >= 80 ? 'text-emerald-400' : report.scores.ux >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {report.scores.ux}
                  </span>
                  <div className="w-full h-1 bg-slate-900 rounded-full mt-2">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${report.scores.ux}%` }} />
                  </div>
                </div>

                {/* Performance Index */}
                <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">LOAD SPEED</span>
                  <span className={`text-3xl font-extrabold font-display ${report.scores.performance >= 80 ? 'text-emerald-400' : report.scores.performance >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {report.scores.performance}
                  </span>
                  <div className="w-full h-1 bg-slate-900 rounded-full mt-2">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${report.scores.performance}%` }} />
                  </div>
                </div>

                {/* Conversion optimization index */}
                <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">CONVERSION INDEX</span>
                  <span className={`text-3xl font-extrabold font-display ${report.scores.conversion >= 80 ? 'text-emerald-400' : report.scores.conversion >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {report.scores.conversion}
                  </span>
                  <div className="w-full h-1 bg-slate-900 rounded-full mt-2">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${report.scores.conversion}%` }} />
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2 bg-slate-950/40 p-6 rounded-xl border border-white/5 text-left">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">EXECUTIVE STRATEGIC SUMMARY</span>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">{report.summary}</p>
              </div>

              {/* Current Positives */}
              <div className="space-y-3 text-left">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Foundational Strengths Detected</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {report.positives?.map((pos, i) => (
                    <div key={i} className="bg-[#111827]/40 p-4 rounded-xl border border-white/5 flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-300 leading-relaxed">{pos}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Detailed SEO, UX and Conversion Audits */}
            <div className="space-y-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/5 pb-3 text-left">
                Diagnostic Findings Breakdown
              </h2>

              {/* SEO finding box */}
              <div className="bg-[#0F172A]/50 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">TECHNICAL SEARCH ENGINE AUDIT</span>
                  <span className="text-xs font-mono px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg font-semibold uppercase">
                    Status: {report.seoAudit.status}
                  </span>
                </div>

                <div className="space-y-4">
                  {report.seoAudit.issues?.map((iss, i) => (
                    <div key={i} className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm sm:text-base font-bold text-white">{iss.title}</h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${getSeverityColor(iss.impact)} uppercase font-bold`}>
                          Impact: {iss.impact}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{iss.description}</p>
                      <div className="text-xs bg-[#2563EB]/5 p-3 rounded-lg border border-white/5 text-slate-300">
                        <strong className="text-cyan-400">Action:</strong> {iss.solution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* UX finding box */}
              <div className="bg-[#0F172A]/50 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">INTERFACE & INTERACTION CRITIQUE</span>
                  <span className="text-xs font-mono px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg font-semibold uppercase">
                    Status: {report.uxAudit.status}
                  </span>
                </div>

                <div className="space-y-4">
                  {report.uxAudit.issues?.map((iss, i) => (
                    <div key={i} className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm sm:text-base font-bold text-white">{iss.title}</h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${getSeverityColor(iss.impact)} uppercase font-bold`}>
                          Impact: {iss.impact}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{iss.description}</p>
                      <div className="text-xs bg-[#2563EB]/5 p-3 rounded-lg border border-white/5 text-slate-300">
                        <strong className="text-cyan-400">Action:</strong> {iss.solution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion optimization finding box */}
              <div className="bg-[#0F172A]/50 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">CONVERSION FUNNEL HOLES</span>
                  <span className="text-xs font-mono px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg font-semibold uppercase">
                    Status: {report.conversionAudit.status}
                  </span>
                </div>

                <div className="space-y-4">
                  {report.conversionAudit.issues?.map((iss, i) => (
                    <div key={i} className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm sm:text-base font-bold text-white">{iss.title}</h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${getSeverityColor(iss.impact)} uppercase font-bold`}>
                          Impact: {iss.impact}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{iss.description}</p>
                      <div className="text-xs bg-[#2563EB]/5 p-3 rounded-lg border border-white/5 text-slate-300">
                        <strong className="text-cyan-400">Action:</strong> {iss.solution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Strategic Action Plan timeline */}
            <div className="bg-[#0F172A]/50 border border-white/5 rounded-2xl p-8 space-y-8 text-left">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest">NEXTSTEPS BLUEPRINT</span>
                <h3 className="font-display text-xl font-bold text-white">Recommended Implementation Timeline</h3>
                <p className="text-xs text-slate-400">Strategic phases required to close all detected leaks and drive conversion metrics.</p>
              </div>

              <div className="relative border-l border-white/5 ml-4 space-y-6">
                {report.actionPlan?.map((plan, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute -left-[13px] top-0.5 w-6 h-6 rounded-lg bg-slate-950/40 border border-white/5 text-[10px] font-mono font-bold text-slate-300 flex items-center justify-center">
                      {plan.step}
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2.5 flex-wrap">
                        <h4 className="font-display text-sm font-bold text-white">{plan.title}</h4>
                        <span className="text-[10px] font-mono text-slate-500">Timeline: <strong className="text-slate-400 font-semibold">{plan.duration}</strong></span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{plan.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Estimated Impact Box */}
              <div className="p-5 bg-emerald-500/5 rounded-xl border border-emerald-500/15 flex items-start space-x-4">
                <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest block uppercase">PROJECTED METRIC ADVANCEMENT</span>
                  <p className="text-sm font-bold text-white font-display mt-0.5">{report.estimatedImpact}</p>
                </div>
              </div>

              {/* Conversion Callout Form wrapper */}
              <div className="p-8 bg-slate-950/40 border border-white/5 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
                <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-widest uppercase">HIRE NEXTSITEHUB EXPERTS</span>
                <h4 className="font-display text-base sm:text-lg font-bold text-white">Let us implement these fixes for you</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Avoid allocating your own internal engineering schedules. We deploy optimized React assets directly to your system within days.
                </p>
                <div className="pt-2">
                  <a
                    href="#contact"
                    onClick={(e) => {
                      // Navigate smooth to contact
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#2563EB]/15"
                  >
                    <span>Request Free Consult Call</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
