import React, { useState } from "react";
import {
  Sparkles,
  Share2,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  Filter,
  PhoneCall,
  TrendingUp,
  BarChart3,
  Database,
  Lock,
  Globe,
} from "lucide-react";
import AuthModal from "./AuthModal";

export default function LandingPage({ onLoginSuccess, onToast }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-300 flex flex-col overflow-x-hidden selection:bg-blue-500/30">
      {/* --- Public Landing Navbar --- */}
      <header className="sticky top-0 z-50 glass-panel border-t-0 border-x-0 border-b border-white/5 bg-[rgba(11,15,25,0.85)] backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xl shadow-[0_0_16px_rgba(59,130,246,0.4)]">
            ⚡
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent leading-tight">
              PioneerTech LMS
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight -mt-0.5">
              Lead Management OS
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#specs" className="hover:text-white transition-colors">
            Specifications
          </a>
          <a href="#usecases" className="hover:text-white transition-colors">
            Use Cases
          </a>
          <a href="#howitworks" className="hover:text-white transition-colors">
            How It Works
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="hidden sm:inline-block px-5 py-2 text-sm font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/30 rounded-lg transition-all"
          >
            Sign In
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg shadow-lg shadow-blue-500/25 transition-all"
          >
            <Sparkles size={16} className="hidden sm:block" />
            <span>Get Started</span>
          </button>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <section className="pt-20 sm:pt-28 pb-16 sm:pb-24 px-4 text-center max-w-4xl mx-auto flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-400 text-xs sm:text-sm font-semibold">
          <Zap size={14} />
          Not another CRM — The Lead Gen OS
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
          Every Lead Ingested Automatically, <br className="hidden sm:block" />
          Deduplicated & Ready for Follow-up.
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Stop losing leads between Meta Ads, Instant Forms, CSVs, and sales
          reps. PioneerTech LMS unifies your acquisition channels, deduplicates
          unique contacts, and gets reps productive in under 30 minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            <span>Launch Live Workspace</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/30 rounded-xl transition-all"
          >
            <Share2 size={18} />
            <span>Sign In with SSO</span>
          </button>
        </div>
      </section>

      {/* --- Feature Specs Grid --- */}
      <section
        id="specs"
        className="py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full"
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Product Specifications
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Built on Django REST, React Vite, and a hybrid MySQL + MongoDB data
            store
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Master Contact Repository
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Read-only master repository of unique contacts. Automatically
              created using intelligent Phone and Email deduplication.
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#1877f2]/15 text-[#1877f2] flex items-center justify-center mb-4">
              <Share2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Direct Meta Ads Ingestion
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Direct OAuth connection with Meta Graph API. Ingests leads from
              Instant Forms in real-time into MongoDB collections.
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
              <Filter size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Smart Views & Filters
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Prebuilt grouped views (Campaign Wise, Follow-ups Due) and custom
              multi-condition saved views with sidebar pinning.
            </p>
          </div>
        </div>
      </section>

      {/* --- Use Cases & Benefits --- */}
      <section
        id="usecases"
        className="py-16 sm:py-20 px-4 sm:px-8 bg-black/30 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Industry Use Cases
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Designed for high-volume online lead generators
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: "Real Estate Developers",
                desc: "Manage property expo leads and villa enquiries without manual entry.",
              },
              {
                title: "Performance Agencies",
                desc: "Direct Meta Ads webhooks track performance per campaign and ad set.",
              },
              {
                title: "Financial Services",
                desc: "Deduplicate client phone numbers instantly to prevent double calls.",
              },
              {
                title: "High-Ticket B2B",
                desc: "Track sales rep response time and measure conversion ratios per source.",
              },
            ].map((uc, i) => (
              <div
                key={i}
                className="glass-panel p-5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
                  <CheckCircle2 size={14} /> Use Case #{i + 1}
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  {uc.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {uc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- How It Works Flow --- */}
      <section
        id="howitworks"
        className="py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full"
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            From lead click to closed conversion in 4 automated steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              step: "01",
              title: "Direct Webhook Ingestion",
              desc: "Leads from Meta Instant Forms trigger automatic real-time API webhooks.",
            },
            {
              step: "02",
              title: "AI Contact Deduplication",
              desc: "System checks phone/email in master repository, updating or creating contacts.",
            },
            {
              step: "03",
              title: "Smart View Assignment",
              desc: "Enquiries are categorized into Smart Views and assigned to sales owners.",
            },
            {
              step: "04",
              title: "Instant Follow-up Action",
              desc: "Reps use WhatsApp, Call, and Note shortcuts to reach prospects instantly.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all relative group"
            >
              <span className="absolute right-4 top-4 text-3xl font-black text-blue-500/20 group-hover:text-blue-500/30 transition-colors">
                {item.step}
              </span>
              <h4 className="text-base font-bold text-blue-300 mb-2">
                {item.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-8 px-4 sm:px-8 border-t border-white/5 text-center text-slate-500 text-xs sm:text-sm">
        © {new Date().getFullYear()} PioneerTech LMS • Operating System for
        Businesses That Generate Leads Online
      </footer>

      {/* --- Auth Modal --- */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onToast={onToast}
        onLoginSuccess={(user) => {
          setIsAuthModalOpen(false);
          onLoginSuccess(user);
        }}
      />
    </div>
  );
}
