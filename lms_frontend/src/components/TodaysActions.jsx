import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bell,
  Clock,
  FileText,
  Calendar,
  CheckCircle2,
  RefreshCw,
  User,
} from "lucide-react";
import { apiFetch } from "../api";

// --- Helper Components ---
const ActionIcon = ({ type }) => {
  const baseClass =
    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0";
  if (type === "reminder") {
    return (
      <div
        className={`${baseClass} bg-yellow-500/15 text-yellow-400 border border-yellow-500/20`}
      >
        <Clock size={18} />
      </div>
    );
  }
  return (
    <div
      className={`${baseClass} bg-blue-500/15 text-blue-400 border border-blue-500/20`}
    >
      <FileText size={18} />
    </div>
  );
};

const FilterPill = ({ label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap border
      ${
        isActive
          ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
          : "bg-transparent border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
      }
    `}
  >
    {label} ({count})
  </button>
);

// --- Main Component ---
export default function TodaysActions({ currentUser, onSelectEnquiry }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'reminders', 'notes'

  const fetchTodaysActions = useCallback(() => {
    if (!currentUser) return;

    setLoading(true);
    apiFetch("/api/enquiries/?format=json")
      .then((res) => res.json())
      .then((data) => {
        const allEnquiries = data.results || data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayActions = [];
        const isAdmin = currentUser?.role?.toLowerCase() === "admin";

        allEnquiries.forEach((enquiry) => {
          // Ownership Check
          const isOwner =
            enquiry.primary_owner_details &&
            (enquiry.primary_owner_details.username === currentUser?.username ||
              enquiry.primary_owner_details.email === currentUser?.email);

          if (!isAdmin && !isOwner) return;

          const fullName =
            `${enquiry.contact_details?.first_name || ""} ${enquiry.contact_details?.last_name || ""}`.trim() ||
            "Unknown Contact";

          // 1. Check Follow-up Reminders
          if (enquiry.follow_up_date) {
            const followUpDate = new Date(enquiry.follow_up_date);
            if (followUpDate >= today && followUpDate < tomorrow) {
              todayActions.push({
                id: `reminder-${enquiry.id}`,
                type: "reminder",
                enquiry,
                title: fullName,
                subtitle: enquiry.title || "Follow-up Reminder",
                time: followUpDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                sortDate: followUpDate,
              });
            }
          }

          // 2. Check Notes added today
          if (enquiry.notes_summary && enquiry.updated_at) {
            const updatedDate = new Date(enquiry.updated_at);
            if (
              updatedDate >= today &&
              updatedDate < tomorrow &&
              enquiry.notes_summary.trim()
            ) {
              const noteLines = enquiry.notes_summary.split("\n");
              const lastNote = noteLines.pop().replace(/^- /, "");
              todayActions.push({
                id: `note-${enquiry.id}`,
                type: "note",
                enquiry,
                title: fullName,
                subtitle:
                  lastNote.length > 60
                    ? `${lastNote.substring(0, 60)}...`
                    : lastNote,
                time: updatedDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                sortDate: updatedDate,
              });
            }
          }
        });

        // Sort chronologically
        todayActions.sort((a, b) => a.sortDate - b.sortDate);
        setActions(todayActions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch actions:", err);
        setLoading(false);
      });
  }, [currentUser]);

  // Initial Fetch
  useEffect(() => {
    fetchTodaysActions();
  }, [fetchTodaysActions]);

  // Filtered Actions Logic
  const filteredActions = useMemo(() => {
    if (filter === "reminders")
      return actions.filter((a) => a.type === "reminder");
    if (filter === "notes") return actions.filter((a) => a.type === "note");
    return actions;
  }, [actions, filter]);

  const counts = useMemo(
    () => ({
      all: actions.length,
      reminders: actions.filter((a) => a.type === "reminder").length,
      notes: actions.filter((a) => a.type === "note").length,
    }),
    [actions],
  );

  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-transparent">
      {/* --- Sticky Header --- */}
      <div className="sticky top-0 z-20 bg-[rgba(11,15,25,0.95)] backdrop-blur-md pb-3 pt-1">
        <div className="glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/5 shadow-sm">
          <div className="flex-shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <Bell size={20} className="text-blue-400" />
                Today's Actions
              </h2>
              <span className="text-[10px] md:text-xs px-2.5 py-1 bg-blue-500/15 text-blue-400 rounded-full font-semibold border border-blue-500/20 whitespace-nowrap">
                {todayDateStr}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <User size={12} className="flex-shrink-0" />
              <span>
                Showing tasks for{" "}
                <span className="font-medium text-white">
                  {currentUser?.first_name || "You"}
                </span>
              </span>
              <span
                className={`
                text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider
                ${currentUser?.role?.toLowerCase() === "admin" ? "bg-purple-500/20 text-purple-300" : "bg-green-500/20 text-green-300"}
              `}
              >
                {currentUser?.role || "Sales"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <FilterPill
              label="All"
              count={counts.all}
              isActive={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterPill
              label="Reminders"
              count={counts.reminders}
              isActive={filter === "reminders"}
              onClick={() => setFilter("reminders")}
            />
            <FilterPill
              label="Notes"
              count={counts.notes}
              isActive={filter === "notes"}
              onClick={() => setFilter("notes")}
            />

            <button
              onClick={fetchTodaysActions}
              className="ml-1 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              title="Refresh Actions"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- Action Cards Area --- */}
      <div className="flex-1 overflow-auto rounded-xl border border-white/5 bg-white/5 relative p-4">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
            <RefreshCw size={28} className="animate-spin text-blue-400" />
            <p className="text-sm font-medium">Loading your tasks...</p>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <CheckCircle2 size={32} className="text-emerald-400/60" />
            <p className="text-base font-semibold text-white">
              All clear for today!
            </p>
            <p className="text-sm">
              No pending{" "}
              {filter === "reminders"
                ? "reminders"
                : filter === "notes"
                  ? "notes"
                  : "actions"}{" "}
              found.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredActions.map((action) => (
              <div
                key={action.id}
                onClick={() => onSelectEnquiry?.(action.enquiry)}
                className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3.5 bg-black/30 hover:bg-black/50 border border-white/5 hover:border-white/10 rounded-lg cursor-pointer transition-all duration-200"
              >
                <ActionIcon type={action.type} />

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white truncate group-hover:text-blue-400 transition-colors">
                    {action.title}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {action.subtitle}
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 mt-1 sm:mt-0">
                  <div className="flex flex-col items-end sm:items-start">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap">
                      <Calendar size={12} />
                      {action.time}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`
                        text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border
                        ${action.enquiry.status === "New" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : ""}
                        ${action.enquiry.status === "Contacted" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : ""}
                        ${action.enquiry.status === "Qualified" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : ""}
                        ${action.enquiry.status === "Closed" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : ""}
                        ${action.enquiry.status === "Lost" ? "bg-red-500/20 text-red-300 border-red-500/30" : ""}
                      `}
                      >
                        {action.enquiry.status}
                      </span>
                    </div>
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
