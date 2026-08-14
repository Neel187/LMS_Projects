import React, { useState, useEffect } from 'react';
import { Bell, Clock, FileText, Calendar, CheckCircle2, RefreshCw, User } from 'lucide-react';

export default function TodaysActions({ currentUser, onSelectEnquiry }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'reminders', 'notes'

  useEffect(() => {
    fetchTodaysActions();
  }, [currentUser]);

  const fetchTodaysActions = () => {
    setLoading(true);
    // Fetch enquiries that have follow-up dates for today and recent notes
    // We'll build the actions from the enquiries data
    fetch('/api/enquiries/?format=json')
      .then(res => res.json())
      .then(data => {
        const allEnquiries = data.results || data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayActions = [];

        allEnquiries.forEach(enquiry => {
          // Filter by current user ownership (role-based)
          const isOwner = enquiry.primary_owner_details &&
            (enquiry.primary_owner_details.username === currentUser?.username ||
             enquiry.primary_owner_details.email === currentUser?.email);

          // For admin role, show all; for sales, show only their own
          const isAdmin = currentUser?.role === 'Admin';
          if (!isAdmin && !isOwner) return;

          // Check follow-up reminders due today
          if (enquiry.follow_up_date) {
            const followUpDate = new Date(enquiry.follow_up_date);
            if (followUpDate >= today && followUpDate < tomorrow) {
              todayActions.push({
                id: `reminder-${enquiry.id}`,
                type: 'reminder',
                enquiry,
                title: `Follow-up: ${enquiry.contact_details?.first_name || ''} ${enquiry.contact_details?.last_name || ''}`.trim(),
                subtitle: enquiry.title || 'Enquiry',
                time: followUpDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sortDate: followUpDate
              });
            }
          }

          // Check notes added today
          if (enquiry.notes_summary && enquiry.updated_at) {
            const updatedDate = new Date(enquiry.updated_at);
            if (updatedDate >= today && updatedDate < tomorrow && enquiry.notes_summary.trim()) {
              todayActions.push({
                id: `note-${enquiry.id}`,
                type: 'note',
                enquiry,
                title: `Note on: ${enquiry.contact_details?.first_name || ''} ${enquiry.contact_details?.last_name || ''}`.trim(),
                subtitle: enquiry.notes_summary.split('\n').pop().replace(/^- /, ''),
                time: updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sortDate: updatedDate
              });
            }
          }
        });

        // Sort by time
        todayActions.sort((a, b) => a.sortDate - b.sortDate);
        setActions(todayActions);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const filteredActions = actions.filter(a => {
    if (filter === 'reminders') return a.type === 'reminder';
    if (filter === 'notes') return a.type === 'note';
    return true;
  });

  const reminderCount = actions.filter(a => a.type === 'reminder').length;
  const noteCount = actions.filter(a => a.type === 'note').length;

  return (
    <div className="todays-actions-container">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div className="todays-actions-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} style={{ color: '#60a5fa' }} />
                Today's Actions
              </h2>
              <span style={{ fontSize: '0.72rem', padding: '2px 10px', borderRadius: '12px', fontWeight: 600, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={12} />
              Showing tasks for <strong style={{ color: 'white' }}>{currentUser?.first_name || 'You'}</strong>
              <span className={`user-role-badge ${currentUser?.role === 'Admin' ? 'admin' : 'sales'}`}>
                {currentUser?.role || 'Sales Agent'}
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Filter Pills */}
            {[
              { key: 'all', label: `All (${actions.length})` },
              { key: 'reminders', label: `Reminders (${reminderCount})` },
              { key: 'notes', label: `Notes (${noteCount})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
                  border: '1px solid',
                  borderColor: filter === f.key ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-color)',
                  background: filter === f.key ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: filter === f.key ? '#60a5fa' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            ))}

            <button
              onClick={fetchTodaysActions}
              style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {loading ? (
          <div className="empty-state">
            <div className="icon"><RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>
            <p>Loading your tasks...</p>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><CheckCircle2 size={28} /></div>
            <p style={{ fontWeight: 600, color: 'white', fontSize: '1rem' }}>All clear for today!</p>
            <p style={{ fontSize: '0.82rem' }}>No pending {filter === 'reminders' ? 'reminders' : filter === 'notes' ? 'notes' : 'actions'} for today.</p>
          </div>
        ) : (
          <div className="todays-actions-cards">
            {filteredActions.map(action => (
              <div
                key={action.id}
                className="action-card"
                onClick={() => onSelectEnquiry && onSelectEnquiry(action.enquiry)}
              >
                <div className={`action-card-icon ${action.type}`}>
                  {action.type === 'reminder' ? <Clock size={18} /> : <FileText size={18} />}
                </div>
                <div className="action-card-body">
                  <div className="title">{action.title}</div>
                  <div className="subtitle">{action.subtitle}</div>
                </div>
                <div className="action-card-time">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={11} />
                    {action.time}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`status-badge status-${(action.enquiry.status || 'new').toLowerCase()}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                      {action.enquiry.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
