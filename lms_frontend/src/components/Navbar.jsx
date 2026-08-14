import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Search, Bell, User, Share2, Plus, LogOut, ChevronDown, Shield, Settings, UserCircle } from 'lucide-react';

export default function Navbar({ currentUser, onLogout, onOpenMetaModal, onOpenCreateModal, searchTerm, setSearchTerm, todaysActionCount, onOpenTodaysActions }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userRole = currentUser?.role || 'Sales Agent';
  const roleClass = userRole === 'Admin' ? 'admin' : 'sales';

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50, position: 'sticky', top: 0 }}>
      {/* Brand & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 0 15px rgba(59,130,246,0.5)' }}>
          ⚡
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            PioneerTech LMS
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Lead OS • Deduplicated & Ready for Instant Follow-up
          </p>
        </div>
      </div>

      {/* Global Search */}
      <div style={{ position: 'relative', width: '360px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Global search (Contacts, Enquiries, Phone, Campaign)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px 8px 38px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Direct Meta Connect Button */}
        <button className="meta-button pulse-glow" onClick={onOpenMetaModal}>
          <Share2 size={16} />
          <span>⚡ Connect Meta Account</span>
        </button>

        {/* Create Enquiry Button */}
        <button className="glass-button" onClick={onOpenCreateModal}>
          <Plus size={16} />
          <span>New Enquiry</span>
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }}></div>

        {/* Notification Bell */}
        <button
          className="notification-bell"
          onClick={onOpenTodaysActions}
          title="Today's Actions"
        >
          <Bell size={18} />
          {todaysActionCount > 0 && (
            <span className="badge-count">{todaysActionCount > 9 ? '9+' : todaysActionCount}</span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="user-profile-trigger"
            onClick={() => { setShowDropdown(!showDropdown); setShowProfile(false); }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%' }} />
              ) : (
                <User size={16} style={{ color: '#9ca3af' }} />
              )}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>{currentUser?.first_name || 'User'}</p>
              <span className={`user-role-badge ${roleClass}`}>{userRole}</span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-dim)', transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && !showProfile && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <User size={18} style={{ color: '#9ca3af' }} />
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{currentUser?.first_name} {currentUser?.last_name || ''}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{currentUser?.email}</p>
                </div>
              </div>

              <button className="user-dropdown-item" onClick={() => setShowProfile(true)}>
                <UserCircle size={16} style={{ color: '#60a5fa' }} />
                View Details
              </button>

              <div className="user-dropdown-divider" />

              <button className="user-dropdown-item danger" onClick={() => { setShowDropdown(false); onLogout(); }}>
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}

          {/* Profile Details Card */}
          {showDropdown && showProfile && (
            <div className="user-dropdown" style={{ width: '280px' }}>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
                  <button
                    onClick={() => setShowProfile(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem', padding: '2px 6px', borderRadius: '4px' }}
                  >
                    ← Back
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>Profile Details</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
                    {currentUser?.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <User size={24} style={{ color: 'white' }} />
                    )}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{currentUser?.first_name} {currentUser?.last_name || ''}</p>
                    <span className={`user-role-badge ${roleClass}`}>{userRole}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</p>
                    <p style={{ color: 'white', fontWeight: 500 }}>{currentUser?.username || '—'}</p>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</p>
                    <p style={{ color: '#60a5fa', fontWeight: 500 }}>{currentUser?.email || '—'}</p>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</p>
                    <p style={{ color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={13} style={{ color: userRole === 'Admin' ? '#fbbf24' : '#34d399' }} />
                      {userRole}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
