import React, { useState, useEffect, useRef } from 'react';
import { FileText, Clock, Send, X } from 'lucide-react';

export default function QuickActionPopover({ type, enquiryId, anchorRect, onClose, onSaved }) {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSave = async () => {
    if (!value.trim()) return;
    setIsSubmitting(true);
    try {
      if (type === 'note') {
        await fetch(`/api/enquiries/${enquiryId}/add_note/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: value })
        });
      } else {
        await fetch(`/api/enquiries/${enquiryId}/schedule_followup/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ follow_up_date: value })
        });
      }
      setIsSubmitting(false);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Position the popover relative to the anchor
  const style = {};
  if (anchorRect) {
    const popoverWidth = 280;
    const popoverHeight = type === 'note' ? 180 : 140;
    let top = anchorRect.bottom + 8;
    let left = anchorRect.left - popoverWidth + anchorRect.width;

    // Keep within viewport
    if (top + popoverHeight > window.innerHeight) {
      top = anchorRect.top - popoverHeight - 8;
    }
    if (left < 16) left = 16;

    style.top = `${top}px`;
    style.left = `${left}px`;
  }

  return (
    <div className="quick-action-popover" ref={popoverRef} style={style}>
      <h4>
        {type === 'note' ? (
          <><FileText size={16} style={{ color: '#fbbf24' }} /> Add Note</>
        ) : (
          <><Clock size={16} style={{ color: '#c084fc' }} /> Set Reminder</>
        )}
        <button
          onClick={onClose}
          style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
        >
          <X size={14} />
        </button>
      </h4>

      {type === 'note' ? (
        <textarea
          placeholder="Type your note..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          autoFocus
        />
      ) : (
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      )}

      <div className="popover-actions">
        <button className="btn-save" onClick={handleSave} disabled={isSubmitting}>
          <Send size={12} />
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button className="btn-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
