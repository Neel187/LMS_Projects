import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, Phone, Mail, ShieldCheck, FileText, Calendar, ExternalLink, Settings } from 'lucide-react';
import ContactEnquiriesModal from './ContactEnquiriesModal';

const ALL_CONTACT_COLUMNS = [
  { key: 'name', label: 'Contact Name', alwaysVisible: true },
  { key: 'phone', label: 'Phone Identifier' },
  { key: 'email', label: 'Email' },
  { key: 'source', label: 'Created Via' },
  { key: 'created', label: 'Created Date' },
  { key: 'enquiries', label: 'All Enquiries' },
];

const STORAGE_KEY = 'lms_contact_columns';

function getInitialColumns() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return ALL_CONTACT_COLUMNS.map(c => c.key);
}

export default function ContactsView({ onSelectEnquiry }) {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(getInitialColumns);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const customizerRef = useRef(null);

  useEffect(() => {
    fetch('/api/contacts/')
      .then(res => res.json())
      .then(data => setContacts(data.results || data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (customizerRef.current && !customizerRef.current.contains(e.target)) {
        setShowColumnCustomizer(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (key) => {
    const col = ALL_CONTACT_COLUMNS.find(c => c.key === key);
    if (col?.alwaysVisible) return;
    setVisibleColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isVisible = (key) => visibleColumns.includes(key);

  const filteredContacts = contacts.filter(c => 
    (c.first_name + ' ' + c.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const colSpanCount = visibleColumns.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflow: 'hidden' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>Master Unique Contacts Repository</h2>
            <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              Read-Only System Module
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Automatically created & deduplicated by Phone / Email. Click any contact to view all associated enquiries.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '6px 12px 6px 34px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.82rem' }}
            />
          </div>

          {/* Column Customizer */}
          <div style={{ position: 'relative' }} ref={customizerRef}>
            <button
              className="column-customizer-btn"
              onClick={() => setShowColumnCustomizer(!showColumnCustomizer)}
            >
              <Settings size={14} />
              Columns
            </button>
            {showColumnCustomizer && (
              <div className="column-customizer-popover">
                <div className="popover-title">Customize Columns</div>
                {ALL_CONTACT_COLUMNS.map(col => (
                  <label key={col.key}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      disabled={col.alwaysVisible}
                    />
                    {col.label}
                    {col.alwaysVisible && <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>Required</span>}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              {isVisible('name') && <th style={{ padding: '12px 16px' }}>Contact Name</th>}
              {isVisible('phone') && <th style={{ padding: '12px 16px' }}>Phone Identifier</th>}
              {isVisible('email') && <th style={{ padding: '12px 16px' }}>Email</th>}
              {isVisible('source') && <th style={{ padding: '12px 16px' }}>Created Via</th>}
              {isVisible('created') && <th style={{ padding: '12px 16px' }}>Created Date</th>}
              {isVisible('enquiries') && <th style={{ padding: '12px 16px', textAlign: 'right' }}>All Enquiries</th>}
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={colSpanCount} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No master contacts found.
                </td>
              </tr>
            ) : (
              filteredContacts.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {isVisible('name') && (
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'white' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {(c.first_name || 'C')[0]}
                        </div>
                        <span>{c.first_name} {c.last_name}</span>
                      </div>
                    </td>
                  )}
                  {isVisible('phone') && (
                    <td style={{ padding: '14px 16px', color: '#60a5fa', fontWeight: 600 }}>{c.phone}</td>
                  )}
                  {isVisible('email') && (
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{c.email || '—'}</td>
                  )}
                  {isVisible('source') && (
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                        {c.primary_lead_source}
                      </span>
                    </td>
                  )}
                  {isVisible('created') && (
                    <td style={{ padding: '14px 16px', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  )}
                  {isVisible('enquiries') && (
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(c);
                        }}
                        style={{ padding: '4px 12px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>View All Enquiries</span>
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drill-down All Enquiries Modal */}
      <ContactEnquiriesModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onSelectEnquiry={onSelectEnquiry}
      />

    </div>
  );
}
