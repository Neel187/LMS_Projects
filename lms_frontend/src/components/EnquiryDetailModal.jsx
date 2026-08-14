import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone, Mail, Clock, Calendar, CheckCircle2, 
  MessageSquare, Plus, FileText, Share2, Shield, Send 
} from 'lucide-react';

export default function EnquiryDetailModal({ enquiry, onClose, onRefresh }) {
  const [newNote, setNewNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [activities, setActivities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (enquiry) {
      // Mock or fetch activities for enquiry
      setActivities([
        { id: 1, type: 'ENQUIRY_CREATED', title: 'Enquiry Created', description: `Captured via ${enquiry.source}`, created_at: enquiry.created_at },
        { id: 2, type: 'NOTE_ADDED', title: 'Note Added', description: enquiry.notes_summary || 'No initial notes.', created_at: enquiry.updated_at }
      ]);
    }
  }, [enquiry]);

  if (!enquiry) return null;
  const contact = enquiry.contact_details || {};
  const formData = enquiry.raw_form_data || {};

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/enquiries/${enquiry.id}/add_note/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote })
      });
      setNewNote('');
      setIsSubmitting(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleScheduleFollowup = async (e) => {
    e.preventDefault();
    if (!followUpDate) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/enquiries/${enquiry.id}/schedule_followup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ follow_up_date: followUpDate })
      });
      setFollowUpDate('');
      setIsSubmitting(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 90, display: 'flex', justifyContent: 'flex-end' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '640px', height: '100vh', background: '#0b0f19', borderRadius: 0, borderRight: 0, borderTop: 0, borderBottom: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(18, 24, 38, 0.9)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{enquiry.title}</h2>
              <span className={`status-badge status-${(enquiry.status || 'new').toLowerCase()}`}>
                {enquiry.status}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Enquiry ID #{enquiry.id} • Created {new Date(enquiry.created_at).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Contact Card */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} /> Contact Details (Master Repo)
              </h4>
              <span style={{ fontSize: '0.7rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                Deduplicated (Phone Match)
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Full Name</p>
                <p style={{ fontWeight: 600, color: 'white' }}>{contact.first_name} {contact.last_name || ''}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Phone Number</p>
                <p style={{ fontWeight: 600, color: '#60a5fa' }}>{contact.phone}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Email Address</p>
                <p style={{ fontWeight: 600, color: '#60a5fa' }}>{contact.email || '—'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Primary Lead Source</p>
                <p style={{ fontWeight: 600, color: 'white' }}>{contact.primary_lead_source}</p>
              </div>
            </div>
          </div>

          {/* Dynamic Meta Form Responses Card */}
          {Object.keys(formData).length > 0 && (
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '10px', background: 'rgba(24, 119, 242, 0.05)', border: '1px solid rgba(24, 119, 242, 0.2)' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#60a5fa', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={16} /> Raw Meta Instant Form Submissions
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                {Object.entries(formData).map(([k, v]) => (
                  <div key={k} style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>{k}</p>
                    <p style={{ fontWeight: 600, color: 'white', marginTop: '2px' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Note & Follow-up Action Forms */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <form onSubmit={handleAddNote} className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: '#cbd5e1' }}>+ Add Note</p>
              <textarea
                placeholder="Log activity, call details..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                style={{ width: '100%', height: '60px', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.8rem', resize: 'none' }}
              />
              <button className="glass-button" type="submit" disabled={isSubmitting} style={{ marginTop: '8px', width: '100%', justifyContent: 'center', padding: '6px', fontSize: '0.8rem' }}>
                <Send size={13} /> Save Note
              </button>
            </form>

            <form onSubmit={handleScheduleFollowup} className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: '#cbd5e1' }}>📅 Schedule Follow-up</p>
              <input
                type="datetime-local"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }}
              />
              <button className="glass-button" type="submit" disabled={isSubmitting} style={{ marginTop: '8px', width: '100%', justifyContent: 'center', padding: '6px', fontSize: '0.8rem' }}>
                <Calendar size={13} /> Set Reminder
              </button>
            </form>
          </div>

          {/* Chronological Activity Timeline */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#93c5fd', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} /> Chronological Activity Timeline
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid rgba(59,130,246,0.3)', paddingLeft: '16px' }}>
              {activities.map((act) => (
                <div key={act.id} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-23px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', border: '2px solid #0b0f19' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white' }}>{act.title}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{act.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
