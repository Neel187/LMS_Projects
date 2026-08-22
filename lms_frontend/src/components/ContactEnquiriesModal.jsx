import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  FileText,
  Share2,
  Calendar,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "../api";

// --- Helper for Status Badge ---
const StatusBadge = ({ status }) => {
  const baseClass =
    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border";
  switch (status?.toLowerCase()) {
    case "new":
      return (
        <span
          className={`${baseClass} bg-blue-500/20 text-blue-300 border-blue-500/30`}
        >
          New
        </span>
      );
    case "contacted":
      return (
        <span
          className={`${baseClass} bg-yellow-500/20 text-yellow-300 border-yellow-500/30`}
        >
          Contacted
        </span>
      );
    case "qualified":
      return (
        <span
          className={`${baseClass} bg-emerald-500/20 text-emerald-300 border-emerald-500/30`}
        >
          Qualified
        </span>
      );
    case "closed":
      return (
        <span
          className={`${baseClass} bg-purple-500/20 text-purple-300 border-purple-500/30`}
        >
          Closed
        </span>
      );
    case "lost":
      return (
        <span
          className={`${baseClass} bg-red-500/20 text-red-300 border-red-500/30`}
        >
          Lost
        </span>
      );
    default:
      return (
        <span
          className={`${baseClass} bg-slate-500/20 text-slate-300 border-slate-500/30`}
        >
          Unknown
        </span>
      );
  }
};

export default function ContactEnquiriesModal({
  contact,
  onClose,
  onSelectEnquiry,
}) {
  const [associatedEnquiries, setAssociatedEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contact) {
      setLoading(true);
      // Use phone, email, or name to search for associated enquiries
      const searchQuery = encodeURIComponent(
        contact.phone || contact.email || contact.first_name,
      );
      apiFetch(`/api/enquiries/?search=${searchQuery}`)
        .then((res) => res.json())
        .then((data) => {
          const results = data.results || data;
          // Filter to ensure only exact matches by ID or phone
          const filtered = results.filter(
            (e) =>
              e.contact === contact.id ||
              e.contact_details?.phone === contact.phone,
          );
          setAssociatedEnquiries(filtered);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching contact enquiries:", err);
          setLoading(false);
        });
    }
  }, [contact]);

  if (!contact) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] bg-[#0b0f19] rounded-2xl border border-emerald-500/30 flex flex-col overflow-hidden shadow-2xl animate-fade-in">
        {/* --- Header --- */}
        <div className="flex-shrink-0 px-5 py-4 sm:px-6 border-b border-white/10 bg-[rgba(18,24,38,0.95)] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                Master Contact: {contact.first_name} {contact.last_name}
              </h3>
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full font-semibold border border-emerald-500/20 whitespace-nowrap">
                Unique Record
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="flex-shrink-0" />
                {contact.phone || "—"}
              </span>
              {contact.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="flex-shrink-0" />
                  {contact.email}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Share2 size={14} className="flex-shrink-0" />
                Source: {contact.primary_lead_source || "Unknown"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Sub-header info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
              <FileText size={18} />
              All Associated Enquiries ({associatedEnquiries.length})
            </h4>
            <span className="text-[10px] sm:text-xs text-slate-500">
              Auto-aggregated by Phone/Email
            </span>
          </div>

          {/* State Handlers */}
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
                <span className="text-sm">Loading enquiries...</span>
              </div>
            </div>
          ) : associatedEnquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-black/30 rounded-xl border border-white/5">
              <AlertCircle size={28} className="text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">
                No enquiries currently associated with this contact.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {associatedEnquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  onClick={() => {
                    onClose();
                    if (onSelectEnquiry) onSelectEnquiry(enquiry);
                  }}
                  className="group relative bg-black/30 hover:bg-black/50 border border-white/5 hover:border-blue-500/50 rounded-xl p-4 cursor-pointer transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h5 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors truncate max-w-[200px] sm:max-w-[300px]">
                        {enquiry.title || "Untitled Enquiry"}
                      </h5>
                      <StatusBadge status={enquiry.status} />
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar size={12} />
                      {new Date(enquiry.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-400">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-white/5 px-2 py-1 rounded-md border border-white/5 text-slate-300">
                        Source: {enquiry.source || "—"}
                      </span>
                      {enquiry.campaign_name && (
                        <span className="hidden xs:inline">
                          Campaign: {enquiry.campaign_name}
                        </span>
                      )}
                    </div>
                    <span className="text-blue-400 font-medium group-hover:text-blue-300 transition-colors text-xs sm:text-sm">
                      Click to open details →
                    </span>
                  </div>

                  {/* Notes Section */}
                  {enquiry.notes_summary && (
                    <div className="mt-3 text-xs text-slate-500 bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <span className="font-medium text-slate-400 mr-1">
                        Notes:
                      </span>
                      {enquiry.notes_summary.length > 120
                        ? `${enquiry.notes_summary.substring(0, 120)}...`
                        : enquiry.notes_summary}
                    </div>
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
