import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Clock,
  Calendar,
  MessageSquare,
  FileText,
  Share2,
  Send,
} from "lucide-react";
import { apiFetch } from "../api";

// --- Helper Components ---
const ActivityTimelineItem = ({ activity }) => (
  <div className="relative pl-6 pb-4 last:pb-0">
    {/* Timeline Node (Dot) */}
    <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#0b0f19]" />

    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
      <p className="text-sm font-semibold text-white">{activity.title}</p>
      <span className="text-xs text-slate-500">
        {new Date(activity.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
    <p className="text-xs text-slate-400 mt-0.5">{activity.description}</p>
  </div>
);

export default function EnquiryDetailModal({ enquiry, onClose, onRefresh }) {
  const [newNote, setNewNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [activities, setActivities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (enquiry) {
      // Mock or fetch activities for enquiry
      setActivities([
        {
          id: 1,
          type: "ENQUIRY_CREATED",
          title: "Enquiry Created",
          description: `Captured via ${enquiry.source}`,
          created_at: enquiry.created_at,
        },
        {
          id: 2,
          type: "NOTE_ADDED",
          title: "Note Added",
          description: enquiry.notes_summary || "No initial notes.",
          created_at: enquiry.updated_at,
        },
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
      await apiFetch(`/api/enquiries/${enquiry.id}/add_note/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote }),
      });
      setNewNote("");
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
      await apiFetch(`/api/enquiries/${enquiry.id}/schedule_followup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follow_up_date: followUpDate }),
      });
      setFollowUpDate("");
      setIsSubmitting(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-fade-in">
      {/* Side-Drawer Panel */}
      <div className="w-full sm:max-w-[640px] h-full bg-[#0b0f19] border-l border-white/5 shadow-2xl flex flex-col animate-slide-in-right">
        {/* --- Header --- */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-white/10 bg-[rgba(18,24,38,0.9)] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                {enquiry.title || "Enquiry Details"}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border
                ${enquiry.status === "New" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : ""}
                ${enquiry.status === "Contacted" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : ""}
                ${enquiry.status === "Qualified" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : ""}
                ${enquiry.status === "Closed" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : ""}
                ${enquiry.status === "Lost" ? "bg-red-500/20 text-red-300 border-red-500/30" : ""}
              `}
              >
                {enquiry.status || "New"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Enquiry ID #{enquiry.id} • Created{" "}
              {new Date(enquiry.created_at).toLocaleString()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        {/* --- Scrollable Content Body --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[rgba(11,15,25,0.6)]">
          {/* Contact Card */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                <User size={16} /> Contact Details
              </h4>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/20 font-medium">
                Deduplicated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                  Full Name
                </p>
                <p className="font-semibold text-white truncate">
                  {contact.first_name} {contact.last_name || ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                  Phone Number
                </p>
                <p className="font-semibold text-blue-400 truncate">
                  {contact.phone || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                  Email Address
                </p>
                <p className="font-semibold text-blue-400 truncate">
                  {contact.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                  Primary Lead Source
                </p>
                <p className="font-semibold text-slate-200 truncate">
                  {contact.primary_lead_source || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Meta Form Responses Card */}
          {Object.keys(formData).length > 0 && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 sm:p-5">
              <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2 mb-4">
                <Share2 size={16} /> Raw Meta Form Submissions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {Object.entries(formData).map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-black/30 p-2.5 rounded-lg border border-white/5"
                  >
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {k}
                    </p>
                    <p className="font-medium text-slate-200 mt-0.5 truncate">
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Note & Follow-up Action Forms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Add Note Form */}
            <form
              onSubmit={handleAddNote}
              className="bg-white/5 border border-white/5 rounded-xl p-4"
            >
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-2 mb-3">
                <FileText size={14} /> Add Note
              </p>
              <textarea
                placeholder="Log activity, call details..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full h-16 bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} /> {isSubmitting ? "Saving..." : "Save Note"}
              </button>
            </form>

            {/* Schedule Follow-up Form */}
            <form
              onSubmit={handleScheduleFollowup}
              className="bg-white/5 border border-white/5 rounded-xl p-4"
            >
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-2 mb-3">
                <Calendar size={14} /> Schedule Follow-up
              </p>
              <input
                type="datetime-local"
                value={followUpDate}
                min={new Date().toISOString().slice(0, 16)} // Prevents past dates
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock size={14} />{" "}
                {isSubmitting ? "Scheduling..." : "Set Reminder"}
              </button>
            </form>
          </div>

          {/* Chronological Activity Timeline */}
          <div className="pt-2">
            <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2 mb-4">
              <Clock size={16} /> Activity Timeline
            </h4>
            <div className="border-l-2 border-blue-500/30 ml-1.5 space-y-2">
              {activities.map((act) => (
                <ActivityTimelineItem key={act.id} activity={act} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
