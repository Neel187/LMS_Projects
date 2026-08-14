import React, { useState } from 'react';
import { 
  Sparkles, Share2, Layers, ShieldCheck, Zap, ArrowRight, CheckCircle2, 
  Users, Filter, PhoneCall, TrendingUp, BarChart3, Database, Lock, Globe 
} from 'lucide-react';
import AuthModal from './AuthModal';

export default function LandingPage({ onLoginSuccess }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      
      {/* Public Landing Navbar */}
      <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50, position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 0 16px rgba(59,130,246,0.5)' }}>
            ⚡
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PioneerTech LMS
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Operating System for Businesses That Generate Leads Online
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <a href="#specs" style={{ color: 'inherit', textDecoration: 'none' }}>Specifications</a>
          <a href="#usecases" style={{ color: 'inherit', textDecoration: 'none' }}>Use Cases & Benefits</a>
          <a href="#howitworks" style={{ color: 'inherit', textDecoration: 'none' }}>How It Works</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="login-btn-signin"
            onClick={() => setIsAuthModalOpen(true)}
          >
            Sign In
          </button>
          
          <button className="login-btn-cta" onClick={() => setIsAuthModalOpen(true)}>
            <Sparkles size={16} />
            <span>Get Started Free</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 20px 60px 20px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '6px 16px', borderRadius: '30px', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>
          <Zap size={15} /> Not another CRM — The Lead Generation Operating System
        </div>

        <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.15, background: 'linear-gradient(to right, #ffffff, #93c5fd, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Every Lead Ingested Automatically, Deduplicated Intelligently & Ready for Instant Follow-up.
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '760px', lineHeight: 1.6 }}>
          Stop losing leads between Meta Ads, Instant Forms, CSVs, and sales reps. PioneerTech LMS unifies your lead acquisition channels, deduplicates unique contacts, and eliminates training bloat so reps are productive in under 30 minutes.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
          <button className="login-btn-cta" onClick={() => setIsAuthModalOpen(true)} style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
            <span>Launch Live LMS Workspace</span>
            <ArrowRight size={18} />
          </button>

          <button className="login-btn-social" onClick={() => setIsAuthModalOpen(true)}>
            <Share2 size={18} />
            <span>Sign In with Google / Meta</span>
          </button>
        </div>
      </section>

      {/* Feature Specs Grid */}
      <section id="specs" style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>Product Specifications & Core Architecture</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>Built on Django REST Framework, React Vite, and a hybrid MySQL + MongoDB data store</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '16px' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Master Contact Repository</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Read-only master repository of unique contacts. Automatically created and updated whenever a new enquiry is received. Uses intelligent Phone and Email deduplication.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
            <div style={{ background: 'rgba(24, 119, 242, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1877f2', marginBottom: '16px' }}>
              <Share2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Direct Meta Ads Ingestion</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Direct OAuth connection with Meta Graph API. Ingests leads in real-time from Instant Forms, preserving raw field responses (Budget, Location, Property Type) into MongoDB collections.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: '16px' }}>
              <Filter size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Smart Views & Filters</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Prebuilt grouped views (All Enquiries, Campaign Wise, Form Wise, Follow-ups Due, Overdue Calls) and custom multi-condition saved views with sidebar pinning.
            </p>
          </div>

        </div>
      </section>

      {/* Use Cases & Benefits */}
      <section id="usecases" style={{ padding: '60px 40px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>Industry Use Cases & Measurable Benefits</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>Designed for sales teams, marketing agencies, and high-volume online lead generators</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Real Estate Developers', desc: 'Manage property expo leads, Instant Form budget preferences, and villa enquiries without manual entry.' },
              { title: 'Performance Agencies', desc: 'Direct Meta Ads webhooks track performance per campaign, ad set, and specific instant form.' },
              { title: 'Financial Services & Insurance', desc: 'Deduplicate client phone numbers instantly to prevent multiple reps from calling the same prospect.' },
              { title: 'E-Commerce & High-Ticket B2B', desc: 'Track sales rep response time, schedule follow-up calls, and measure conversion ratios per source.' }
            ].map((uc, i) => (
              <div key={i} className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                  <CheckCircle2 size={16} /> Use Case #{i+1}
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: '6px' }}>{uc.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section id="howitworks" style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>How It Works — Step-by-Step Workflow</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>From lead click to closed conversion in 4 automated steps</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { step: '01', title: 'Direct Webhook Ingestion', desc: 'Leads from Meta Instant Forms, CSVs, or web forms trigger automatic real-time API webhooks.' },
            { step: '02', title: 'AI Contact Deduplication', desc: 'System checks phone/email in master contact repository, updating existing contacts or creating new ones.' },
            { step: '03', title: 'Smart View Assignment', desc: 'Enquiries are categorized into Smart Views and assigned to primary & secondary sales owners.' },
            { step: '04', title: 'Instant Follow-up Action', desc: 'Reps use quick action WhatsApp, Call, and Note shortcuts to reach prospects in under 5 minutes.' }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '24px', borderRadius: '12px', position: 'relative' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'rgba(59, 130, 246, 0.2)', position: 'absolute', right: '16px', top: '16px' }}>{item.step}</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#93c5fd', marginBottom: '8px' }}>{item.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '30px 40px', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        © 2026 PioneerTech LMS • Operating System for Businesses That Generate Leads Online
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setIsAuthModalOpen(false);
          onLoginSuccess(user);
        }}
      />
    </div>
  );
}
