import React, { useState, useEffect, useRef } from "react";
import { FileText, Clock, Send, X } from "lucide-react";
import { apiFetch } from "../api";

export default function QuickActionPopover({
  type,
  enquiryId,
  anchorRect,
  onClose,
  onSaved,
}) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popoverRef = useRef(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSave = async () => {
    if (!value.trim()) return;
    setIsSubmitting(true);
    try {
      const endpoint =
        type === "note"
          ? `/api/enquiries/${enquiryId}/add_note/`
          : `/api/enquiries/${enquiryId}/schedule_followup/`;

      const payload =
        type === "note" ? { note: value } : { follow_up_date: value };

      await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setIsSubmitting(false);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Safety check: prevent crash if anchorRect is missing
  if (!anchorRect) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-[60] w-[280px] bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl p-4 flex flex-col gap-3 animate-fade-in"
      style={{
        top: anchorRect.bottom + 8,
        left: Math.min(
          Math.max(anchorRect.left - 280 + anchorRect.width, 16),
          window.innerWidth - 296,
        ),
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          {type === "note" ? (
            <FileText size={16} className="text-yellow-400" />
          ) : (
            <Clock size={16} className="text-purple-400" />
          )}
          {type === "note" ? "Add Note" : "Set Reminder"}
        </h4>
        <button
          onClick={onClose}
          className="p-1 text-slate-500 hover:text-white hover:bg-white/5 rounded-md transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Input Area */}
      <div className="flex-1">
        {type === "note" ? (
          <textarea
            placeholder="Type your note..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            autoFocus
            className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
          />
        ) : (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={handleSave}
          disabled={isSubmitting || !value.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={14} />
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
