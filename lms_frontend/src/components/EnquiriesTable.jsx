import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Phone,
  MessageSquare,
  Mail,
  User,
  Share2,
  Settings,
  Clock,
  StickyNote,
} from "lucide-react";
import QuickActionPopover from "./QuickActionPopover";

const STORAGE_KEY = "lms_enquiry_columns";

const ALL_COLUMNS = [
  { key: "contact", label: "Contact", alwaysVisible: true },
  { key: "status", label: "Status" },
  { key: "source", label: "Created Via" },
  { key: "campaign", label: "Campaign / Instant Form" },
  { key: "owner", label: "Owner" },
  { key: "created", label: "Created" },
  { key: "actions", label: "Quick Actions" },
];

const STATUS_OPTIONS = ["New", "Contacted", "Qualified", "Closed", "Lost"];
const SOURCE_OPTIONS = ["Meta Ads", "Manual", "Bulk Upload", "Website"];

const getInitialColumns = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const validKeys = ALL_COLUMNS.map((c) => c.key);
      return parsed.filter((key) => validKeys.includes(key));
    }
  } catch (e) {
    /* ignore */
  }
  return ALL_COLUMNS.map((c) => c.key);
};

const getStatusBadgeClass = (status) => {
  const base =
    "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide border cursor-pointer transition-colors w-full sm:w-auto min-w-[90px] text-center appearance-none";
  switch (status?.toLowerCase()) {
    case "new":
      return `${base} bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30`;
    case "contacted":
      return `${base} bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30`;
    case "qualified":
      return `${base} bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30`;
    case "closed":
      return `${base} bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30`;
    case "lost":
      return `${base} bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30`;
    default:
      return `${base} bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30`;
  }
};

// --- Main Component ---
export default function EnquiriesTable({
  enquiries,
  onSelectEnquiry,
  onQuickStatusChange,
  currentFilter,
  setCurrentFilter,
  onRefresh,
}) {
  const [visibleColumns, setVisibleColumns] = useState(getInitialColumns);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const [activePopover, setActivePopover] = useState(null);

  // Ref attached to the whole container
  const containerRef = useRef(null);

  const activeColumns = useMemo(() => {
    return ALL_COLUMNS.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowColumnCustomizer(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = useCallback((key) => {
    const col = ALL_COLUMNS.find((c) => c.key === key);
    if (col?.alwaysVisible) return;
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const handleQuickAction = useCallback((e, type, enquiryId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setActivePopover({ type, enquiryId, rect });
  }, []);

  const renderContactIcons = (contact) => (
    <div
      className="flex items-center gap-3 mt-1 flex-wrap"
      onClick={(e) => e.stopPropagation()}
    >
      {contact.phone && (
        <a
          href={`tel:${contact.phone}`}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition-colors max-w-[120px] md:max-w-[150px]"
          title="Call"
        >
          <Phone size={12} className="flex-shrink-0" />
          <span className="truncate">{contact.phone}</span>
        </a>
      )}
      {contact.phone && (
        <a
          href={`https://wa.me/${(contact.phone || "").replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 hover:text-green-400 transition-colors flex-shrink-0"
          title="WhatsApp"
        >
          <MessageSquare size={12} />
        </a>
      )}
      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition-colors max-w-[120px] md:max-w-[180px]"
          title="Email"
        >
          <Mail size={12} className="flex-shrink-0" />
          {/* FIX: Apply truncate ONLY to the text */}
          <span className="truncate">{contact.email}</span>
        </a>
      )}
    </div>
  );

  const renderSourceBadge = (source) => {
    const isMeta = source === "Meta Ads";
    return (
      <span
        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold min-w-[60px] ${isMeta ? "bg-[#1877f2]/15 text-blue-400" : "bg-white/5 text-slate-400"}`}
      >
        {isMeta && <Share2 size={12} className="text-[#1877f2]" />}
        {source || "—"}
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-transparent">
      <div className="sticky top-0 z-20 bg-[rgba(11,15,25,0.95)] backdrop-blur-md pb-2 pt-0.5">
        <div
          className="glass-panel relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 rounded-xl border border-white/5 bg-white/5 shadow-sm w-full"
          ref={containerRef}
        >
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto min-w-fit">
            <select
              value={currentFilter.status || ""}
              onChange={(e) =>
                setCurrentFilter((prev) => ({
                  ...prev,
                  status: e.target.value || undefined,
                }))
              }
              className="bg-black/40 border border-white/10 rounded-md px-2.5 py-1.5 text-xs md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 flex-1 sm:flex-none min-w-[100px] [&>option]:bg-[#1e293b] [&>option]:text-white"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={currentFilter.source || ""}
              onChange={(e) =>
                setCurrentFilter((prev) => ({
                  ...prev,
                  source: e.target.value || undefined,
                }))
              }
              className="bg-black/40 border border-white/10 rounded-md px-2.5 py-1.5 text-xs md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 flex-1 sm:flex-none min-w-[100px] [&>option]:bg-[#1e293b] [&>option]:text-white"
            >
              <option value="">All Sources</option>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="flex w-full gap-2 sm:w-auto">
              <input
                type="text"
                placeholder="Campaign name..."
                value={currentFilter.campaign || ""}
                onChange={(e) =>
                  setCurrentFilter((prev) => ({
                    ...prev,
                    campaign: e.target.value || undefined,
                  }))
                }
                className="bg-black/40 border border-white/10 rounded-md px-2.5 py-1.5 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 flex-1 sm:w-40 lg:w-60"
              />

              {/* Mobile Only: Columns Button */}
              <button
                onClick={() => setShowColumnCustomizer(!showColumnCustomizer)}
                className="flex sm:hidden items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1.5 rounded-md text-xs font-medium text-slate-300 transition-colors whitespace-nowrap flex-shrink-0"
              >
                <Settings size={14} />
              </button>
            </div>

            {(currentFilter.status ||
              currentFilter.source ||
              currentFilter.campaign) && (
              <button
                onClick={() => setCurrentFilter({})}
                className="text-red-400 text-[10px] md:text-xs underline hover:text-red-300 transition-colors ml-0.5 whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Side: Desktop Only Columns Button */}
          <div className="relative flex-shrink-0 ml-auto sm:ml-0">
            <button
              onClick={() => setShowColumnCustomizer(!showColumnCustomizer)}
              className="hidden sm:flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 transition-colors whitespace-nowrap"
            >
              <Settings size={14} />
              <span>Columns</span>
            </button>
          </div>

          {/* --- SINGLE UNIVERSAL POPUP --- */}
          {showColumnCustomizer && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl p-2 z-50 origin-top-right">
              <div className="text-xs font-semibold text-slate-400 px-2 py-1 border-b border-white/5 mb-1">
                Columns
              </div>
              {ALL_COLUMNS.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer text-sm text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    disabled={col.alwaysVisible}
                    className="accent-blue-500"
                  />
                  <span className={col.alwaysVisible ? "opacity-50" : ""}>
                    {col.label}
                  </span>
                  {col.alwaysVisible && (
                    <span className="ml-auto text-[10px] text-slate-500">
                      Fixed
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Scrollable Table Area --- */}
      <div className="flex-1 overflow-auto rounded-xl border border-white/5 bg-white/5 relative">
        <table className="w-full text-left border-collapse min-w-[750px] md:min-w-[900px]">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-10 bg-[#0b0f19] shadow-sm">
            <tr className="border-b border-white/10">
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {enquiries.length === 0 ? (
              <tr>
                <td
                  colSpan={activeColumns.length}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm">
                      No enquiries match the selected filter criteria.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              enquiries.map((enquiry) => {
                const contact = enquiry.contact_details || {};

                return (
                  <tr
                    key={enquiry.id}
                    onClick={() => onSelectEnquiry(enquiry)}
                    className="group hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    {activeColumns.map((col) => {
                      switch (col.key) {
                        case "contact":
                          return (
                            <td
                              key="contact"
                              className="px-4 py-3 align-middle"
                            >
                              <div className="font-bold text-white text-sm whitespace-nowrap truncate max-w-[150px] md:max-w-[250px]">
                                {contact.first_name} {contact.last_name}
                              </div>
                              {renderContactIcons(contact)}
                            </td>
                          );

                        case "status":
                          return (
                            <td
                              key="status"
                              className="px-4 py-3 align-middle"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <select
                                className={`${getStatusBadgeClass(enquiry.status)} [&>option]:bg-[#1e293b] [&>option]:text-white`}
                                value={enquiry.status || "New"}
                                onChange={(e) =>
                                  onQuickStatusChange(
                                    enquiry.id,
                                    e.target.value,
                                  )
                                }
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                          );

                        case "source":
                          return (
                            <td key="source" className="px-4 py-3 align-middle">
                              {renderSourceBadge(enquiry.source)}
                            </td>
                          );

                        case "campaign":
                          return (
                            <td
                              key="campaign"
                              className="px-4 py-3 align-middle max-w-[150px]"
                            >
                              <div className="text-slate-200 font-medium text-sm truncate">
                                {enquiry.campaign_name || "—"}
                              </div>
                              <div className="text-slate-500 text-xs truncate">
                                {enquiry.instant_form_name}
                              </div>
                            </td>
                          );
                        case "owner":
                          return (
                            <td key="owner" className="px-4 py-3 align-middle">
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <User size={14} className="text-slate-600" />
                                <span className="truncate max-w-[100px]">
                                  {enquiry.primary_owner_details?.username ||
                                    "Unassigned"}
                                </span>
                              </div>
                            </td>
                          );

                        case "created":
                          return (
                            <td
                              key="created"
                              className="px-4 py-3 align-middle text-sm text-slate-400 whitespace-nowrap"
                            >
                              {new Date(enquiry.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </td>
                          );

                        case "actions":
                          return (
                            <td
                              key="actions"
                              className="px-4 py-3 align-middle text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-1 opacity-40 md:group-hover:opacity-100 transition-opacity">
                                <button
                                  className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors"
                                  title="Add Note"
                                  onClick={(e) =>
                                    handleQuickAction(e, "note", enquiry.id)
                                  }
                                >
                                  <StickyNote size={16} />
                                </button>
                                <button
                                  className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-purple-400 transition-colors"
                                  title="Set Reminder"
                                  onClick={(e) =>
                                    handleQuickAction(e, "reminder", enquiry.id)
                                  }
                                >
                                  <Clock size={16} />
                                </button>
                              </div>
                            </td>
                          );

                        default:
                          return null;
                      }
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --- Popover --- */}
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
