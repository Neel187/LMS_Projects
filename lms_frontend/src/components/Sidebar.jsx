import React from 'react';
import { 
  LayoutDashboard, Users, FileText, PhoneCall, Filter, Bookmark, 
  Share2, Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight, Settings, Bell 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentFilter, setCurrentFilter, savedViews, todaysActionCount }) {
  return (
    <aside style={{ width: '260px', borderRight: '1px solid var(--border-color)', background: 'rgba(11, 15, 25, 0.95)', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
      
      {/* Navigation Sections */}
      <div>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
          Main Workspace
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('enquiries')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px',
              border: 'none', background: activeTab === 'enquiries' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'enquiries' ? '#60a5fa' : 'var(--text-muted)', fontWeight: activeTab === 'enquiries' ? 600 : 400,
              cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s ease'
            }}
          >
            <FileText size={18} />
            <span>Enquiries (Primary)</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px',
              border: 'none', background: activeTab === 'dashboard' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'dashboard' ? '#60a5fa' : 'var(--text-muted)', fontWeight: activeTab === 'dashboard' ? 600 : 400,
              cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s ease'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Analytics Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px',
              border: 'none', background: activeTab === 'contacts' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'contacts' ? '#60a5fa' : 'var(--text-muted)', fontWeight: activeTab === 'contacts' ? 600 : 400,
              cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s ease'
            }}
          >
            <Users size={18} />
            <span>Master Contacts (Read-Only)</span>
          </button>

          <button
            onClick={() => setActiveTab('todaysActions')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 12px', borderRadius: '8px',
              border: 'none', background: activeTab === 'todaysActions' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'todaysActions' ? '#60a5fa' : 'var(--text-muted)', fontWeight: activeTab === 'todaysActions' ? 600 : 400,
              cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={18} />
              <span>Today's Actions</span>
            </div>
            {todaysActionCount > 0 && (
              <span className="sidebar-badge">{todaysActionCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Smart Views Group */}
      <div>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
          ⭐ Smart Views
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[
            { id: 'all', label: 'All Enquiries', icon: FileText, filter: {} },
            { id: 'meta_ads', label: 'Meta Ads Enquiries', icon: Share2, filter: { source: 'Meta Ads' } },
            { id: 'new', label: 'New Leads (Unassigned)', icon: AlertCircle, filter: { status: 'New' } },
            { id: 'contacted', label: 'In Follow-up', icon: Clock, filter: { status: 'Contacted' } },
            { id: 'qualified', label: 'Qualified Opportunities', icon: CheckCircle2, filter: { status: 'Qualified' } },
            { id: 'dubai_expo', label: 'Campaign: Dubai Expo', icon: Filter, filter: { campaign: 'Dubai Property Expo 2026' } },
          ].map(view => (
            <button
              key={view.id}
              onClick={() => {
                setActiveTab('enquiries');
                setCurrentFilter(view.filter);
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '6px',
                border: 'none', background: currentFilter.status === view.filter.status && currentFilter.source === view.filter.source ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: 'var(--text-main)', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left', width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <view.icon size={14} style={{ color: '#9bc5ff' }} />
                <span>{view.label}</span>
              </div>
              <ChevronRight size={12} style={{ color: 'var(--text-dim)' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Saved Views */}
      <div>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
          📌 Saved Views
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {savedViews.map(sv => (
            <button
              key={sv.id}
              onClick={() => {
                setActiveTab('enquiries');
                setCurrentFilter(sv.filters_config);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px',
                border: 'none', background: 'transparent', color: '#cbd5e1', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', width: '100%'
              }}
            >
              <Bookmark size={13} style={{ color: '#fbbf24' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sv.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
