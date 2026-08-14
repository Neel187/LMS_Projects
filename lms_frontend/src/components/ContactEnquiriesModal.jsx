import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, FileText, Share2, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

export default function ContactEnquiriesModal({ contact, onClose, onSelectEnquiry }) {
  const [associatedEnquiries, setAssociatedEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contact) {
      setLoading(true);
      fetch(`/api/enquiries/?search=${encodeURIComponent(contact.phone || contact.email || contact.first_name)}`)
        .then(res => res.json())
        .then(data => {
          const results = data.results || data;
          setAssociatedEnquiries(results.filter(e => e.contact === contact.id || e.contact_details?.phone === contact.phone));
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [contact]);

  if (!contact) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '680px', maxHeight: '85vh', background: '#0b0f19', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'rgba(18, 24, 38, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>
                Master Contact: {contact.first_name} {contact.last_name}
              </h3>
              <span style={{ fontSize: '0.72rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '2px 10px', borderRadius: '12px', fontWeight: 600 }}>
                Unique Contact Record
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>📞 {contact.phone}</span>
              {contact.email && <span>✉️ {contact.email}</span>}
              <span>Lead Source: {contact.primary_lead_source}</span>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} /> All Associated Enquiries ({associatedEnquiries.length})
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Automatically aggregated by Phone/Email identifier
            </span>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>Loading associated enquiries...</p>
          ) : associatedEnquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
              <AlertCircle size={24} style={{ color: 'var(--text-dim)', marginBottom: '8px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No enquiries currently associated with this contact.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {associatedEnquiries.map(enquiry => (
                <div
                  key={enquiry.id}
                  onClick={() => {
                    onClose();
                    if (onSelectEnquiry) onSelectEnquiry(enquiry);
                  }}
                  className="glass-panel"
                  style={{ padding: '16px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>{enquiry.title}</h5>
                      <span className={`status-badge status-${(enquiry.status || 'new').toLowerCase()}`}>
                        {enquiry.status}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(enquiry.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', color: '#cbd5e1' }}>
                        Source: {enquiry.source}
                      </span>
                      {enquiry.campaign_name && <span>Campaign: {enquiry.campaign_name}</span>}
                    </div>

                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>Click to Open Details →</span>
                  </div>

                  {enquiry.notes_summary && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px' }}>
                      Notes: {enquiry.notes_summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
