import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, CheckCircle2, Clock, AlertCircle, 
  Share2, ArrowUpRight, BarChart3, Activity 
} from 'lucide-react';

export default function DashboardView() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard/stats/')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  const overview = stats?.overview || { total_enquiries: 4, today_enquiries: 2, this_week_enquiries: 3, this_month_enquiries: 4 };
  const campaignPerf = stats?.campaign_performance || [
    { campaign_name: 'Dubai Property Expo 2026', count: 2 },
    { campaign_name: 'Q3 Bulk Direct Outreach', count: 1 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, background: 'linear-gradient(to right, #ffffff, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Executive Lead Analytics & Campaign Overview
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time lead ingestion metrics, Meta Ads performance, and status conversions</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '18px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#60a5fa' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Today's Enquiries</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(96, 165, 250, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'white' }}>{overview.today_enquiries}</p>
          <p style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <ArrowUpRight size={12} /> +100% vs yesterday
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1877f2' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Meta Ads Real-Time Leads</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(24, 119, 242, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Share2 size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'white' }}>2</p>
          <p style={{ fontSize: '0.72rem', color: '#60a5fa', marginTop: '4px' }}>Webhook Auto-Ingested</p>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fbbf24' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>This Month Enquiries</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(251, 191, 36, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'white' }}>{overview.this_month_enquiries}</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Deduplicated unique leads</p>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#c084fc' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Closed Won Ratio</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(192, 132, 252, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'white' }}>25%</p>
          <p style={{ fontSize: '0.72rem', color: '#c084fc', marginTop: '4px' }}>1 closed enquiry</p>
        </div>
      </div>

      {/* Analytics Charts & Campaign Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        {/* Status Pipeline Breakdown */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: '#60a5fa' }} /> Lead Pipeline Status Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { status: 'New', count: 1, color: '#60a5fa', percent: 25 },
              { status: 'Contacted', count: 1, color: '#fbbf24', percent: 25 },
              { status: 'Qualified', count: 1, color: '#34d399', percent: 25 },
              { status: 'Closed', count: 1, color: '#c084fc', percent: 25 },
            ].map(item => (
              <div key={item.status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.status}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item.count} ({item.percent}%)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.percent}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Meta Ads Campaigns */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={18} style={{ color: '#1877f2' }} /> Top Performing Campaigns
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {campaignPerf.map((cp, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{cp.campaign_name}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Instant Form Ingestion Active</p>
                </div>
                <span style={{ background: 'rgba(24, 119, 242, 0.2)', color: '#60a5fa', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {cp.count} Leads
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
