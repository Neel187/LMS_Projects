import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, MessageSquare, Mail, FileText, User, Filter, Share2, 
  Calendar, CheckCircle, ChevronDown, Sparkles, AlertCircle, Clock,
  Settings, StickyNote
} from 'lucide-react';
import QuickActionPopover from './QuickActionPopover';

const ALL_COLUMNS = [
  { key: 'contact', label: 'Contact', alwaysVisible: true },
  { key: 'status', label: 'Status' },
  { key: 'source', label: 'Created Via' },
  { key: 'campaign', label: 'Campaign / Instant Form' },
  { key: 'owner', label: 'Owner' },
  { key: 'created', label: 'Created' },
  { key: 'actions', label: 'Quick Actions' },
];

const STORAGE_KEY = 'lms_enquiry_columns';

function getInitialColumns() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return ALL_COLUMNS.map(c => c.key);
}

export default function EnquiriesTable({ 
  enquiries, onSelectEnquiry, onQuickStatusChange, currentFilter, setCurrentFilter, onRefresh 
}) {
  const [visibleColumns, setVisibleColumns] = useState(getInitialColumns);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const [activePopover, setActivePopover] = useState(null); // { type: 'note'|'reminder', enquiryId, rect }
  const customizerRef = useRef(null);

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
    const col = ALL_COLUMNS.find(c => c.key === key);
    if (col?.alwaysVisible) return;
    setVisibleColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isVisible = (key) => visibleColumns.includes(key);

  const handleQuickAction = (e, type, enquiryId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setActivePopover({ type, enquiryId, rect });
  };

  const colSpanCount = visibleColumns.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflow: 'hidden' }}>
      
      {/* Dynamic Multi-condition Filter Bar */}
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Filter size={16} />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={currentFilter.status || ''}
            onChange={(e) => setCurrentFilter({ ...currentFilter, status: e.target.value || undefined })}
            style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }}
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Closed">Closed</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Source Filter */}
          <select
            value={currentFilter.source || ''}
            onChange={(e) => setCurrentFilter({ ...currentFilter, source: e.target.value || undefined })}
            style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }}
          >
            <option value="">All Sources</option>
            <option value="Meta Ads">Meta Ads</option>
            <option value="Manual">Manual</option>
            <option value="Bulk Upload">Bulk Upload</option>
            <option value="Website">Website</option>
          </select>

          {/* Campaign Filter */}
          <input
            type="text"
            placeholder="Campaign name..."
            value={currentFilter.campaign || ''}
            onChange={(e) => setCurrentFilter({ ...currentFilter, campaign: e.target.value || undefined })}
            style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.8rem', width: '160px' }}
          />

          {(currentFilter.status || currentFilter.source || currentFilter.campaign) && (
            <button
              onClick={() => setCurrentFilter({})}
              style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{enquiries.length}</strong> active enquiries
          </span>

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
                {ALL_COLUMNS.map(col => (
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

      {/* Main Enquiries Table */}
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              {isVisible('contact') && <th style={{ padding: '12px 16px' }}>Contact</th>}
              {isVisible('status') && <th style={{ padding: '12px 16px' }}>Status</th>}
              {isVisible('source') && <th style={{ padding: '12px 16px' }}>Created Via</th>}
              {isVisible('campaign') && <th style={{ padding: '12px 16px' }}>Campaign / Instant Form</th>}
              {isVisible('owner') && <th style={{ padding: '12px 16px' }}>Owner</th>}
              {isVisible('created') && <th style={{ padding: '12px 16px' }}>Created</th>}
              {isVisible('actions') && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Quick Actions</th>}
            </tr>
          </thead>
          <tbody>
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan={colSpanCount} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No enquiries match the selected filter criteria.
                </td>
              </tr>
            ) : (
              enquiries.map((enquiry) => {
                const contact = enquiry.contact_details || {};
                const statusClass = `status-${(enquiry.status || 'new').toLowerCase()}`;

                return (
                  <tr
                    key={enquiry.id}
                    onClick={() => onSelectEnquiry(enquiry)}
                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Contact Name (Bold) + Contact Icons */}
                    {isVisible('contact') && (
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: '0.92rem' }}>
                          {contact.first_name} {contact.last_name}
                        </div>
                        <div className="contact-icons-row" onClick={(e) => e.stopPropagation()}>
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="contact-icon-link phone" title="Call">
                              <Phone size={12} />
                              <span>{contact.phone}</span>
                            </a>
                          )}
                          {contact.phone && (
                            <a
                              href={`https://wa.me/${(contact.phone || '').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="contact-icon-link whatsapp"
                              title="WhatsApp"
                            >
                              <MessageSquare size={12} />
                            </a>
                          )}
                          {contact.email && (
                            <a href={`mailto:${contact.email}`} className="contact-icon-link email" title="Email">
                              <Mail size={12} />
                              <span>{contact.email}</span>
                            </a>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Status Dropdown */}
                    {isVisible('status') && (
                      <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                        <select
                          className={`status-badge ${statusClass}`}
                          value={enquiry.status}
                          onChange={(e) => onQuickStatusChange(enquiry.id, e.target.value)}
                          style={{ cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="New" style={{ background: '#1e293b', color: 'white' }}>NEW</option>
                          <option value="Contacted" style={{ background: '#1e293b', color: 'white' }}>CONTACTED</option>
                          <option value="Qualified" style={{ background: '#1e293b', color: 'white' }}>QUALIFIED</option>
                          <option value="Closed" style={{ background: '#1e293b', color: 'white' }}>CLOSED</option>
                          <option value="Lost" style={{ background: '#1e293b', color: 'white' }}>LOST</option>
                        </select>
                      </td>
                    )}

                    {/* Source → "Created Via" */}
                    {isVisible('source') && (
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px',
                          background: enquiry.source === 'Meta Ads' ? 'rgba(24, 119, 242, 0.15)' : 'rgba(255,255,255,0.06)',
                          color: enquiry.source === 'Meta Ads' ? '#60a5fa' : 'var(--text-main)', fontSize: '0.78rem', fontWeight: 600
                        }}>
                          {enquiry.source === 'Meta Ads' && <Share2 size={13} style={{ color: '#1877f2' }} />}
                          {enquiry.source}
                        </span>
                      </td>
                    )}

                    {/* Campaign / Form */}
                    {isVisible('campaign') && (
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#cbd5e1', fontWeight: 500 }}>{enquiry.campaign_name || '—'}</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{enquiry.instant_form_name}</div>
                      </td>
                    )}

                    {/* Primary Owner */}
                    {isVisible('owner') && (
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                          <User size={14} />
                          <span>{enquiry.primary_owner_details ? enquiry.primary_owner_details.username : 'Unassigned'}</span>
                        </div>
                      </td>
                    )}

                    {/* Created Date */}
                    {isVisible('created') && (
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {new Date(enquiry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    )}

                    {/* Quick Actions: Add Note & Reminder */}
                    {isVisible('actions') && (
                      <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            className="quick-action-btn note"
                            title="Add Note"
                            onClick={(e) => handleQuickAction(e, 'note', enquiry.id)}
                          >
                            <StickyNote size={14} />
                          </button>
                          <button
                            className="quick-action-btn reminder"
                            title="Set Reminder"
                            onClick={(e) => handleQuickAction(e, 'reminder', enquiry.id)}
                          >
                            <Clock size={14} />
                          </button>
                        </div>
                      </td>
                    )}

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Action Popover */}
      {activePopover && (
        <QuickActionPopover
          type={activePopover.type}
          enquiryId={activePopover.enquiryId}
          anchorRect={activePopover.rect}
          onClose={() => setActivePopover(null)}
          onSaved={() => {
            setActivePopover(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}

    </div>
  );
}
