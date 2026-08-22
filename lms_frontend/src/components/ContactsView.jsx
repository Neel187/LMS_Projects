import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Users,
  Search,
  Phone,
  Mail,
  Settings,
  ExternalLink,
} from "lucide-react";
import ContactEnquiriesModal from "./ContactEnquiriesModal";
import { apiFetch } from "../api";

// --- Constants ---
const STORAGE_KEY = "lms_contact_columns";

const ALL_CONTACT_COLUMNS = [
  { key: "name", label: "Contact Name", alwaysVisible: true },
  { key: "phone", label: "Phone Identifier" },
  { key: "email", label: "Email" },
  { key: "source", label: "Created Via" },
  { key: "created", label: "Created Date" },
  { key: "enquiries", label: "All Enquiries" },
];

const getInitialColumns = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const validKeys = ALL_CONTACT_COLUMNS.map((c) => c.key);
      return parsed.filter((key) => validKeys.includes(key));
    }
  } catch (e) {
    /* ignore */
  }
  return ALL_CONTACT_COLUMNS.map((c) => c.key);
};

// --- Helper Components ---
const ContactAvatar = ({ firstName, lastName }) => (
  <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
    {(firstName || "C")[0].toUpperCase()}
  </div>
);

// --- Main Component ---
export default function ContactsView({ onSelectEnquiry }) {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(getInitialColumns);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const customizerRef = useRef(null);

  // Fetch Contacts
  useEffect(() => {
    apiFetch("/api/contacts/")
      .then((res) => res.json())
      .then((data) => setContacts(data.results || data))
      .catch((err) => console.error("Error fetching contacts:", err));
  }, []);

  // Persist column preferences
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Handle Click Outside for Column Customizer
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (customizerRef.current && !customizerRef.current.contains(e.target)) {
        setShowColumnCustomizer(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = useCallback((key) => {
    const col = ALL_CONTACT_COLUMNS.find((c) => c.key === key);
    if (col?.alwaysVisible) return;
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  // Filtering Logic
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter(
      (c) =>
        (c.first_name + " " + c.last_name).toLowerCase().includes(term) ||
        (c.phone || "").includes(term) ||
        (c.email || "").toLowerCase().includes(term),
    );
  }, [contacts, searchTerm]);

  const activeColumns = useMemo(() => {
    return ALL_CONTACT_COLUMNS.filter((col) =>
      visibleColumns.includes(col.key),
    );
  }, [visibleColumns]);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-transparent">
      {/* --- Sticky Top Header / Filter Bar --- */}
      <div className="sticky top-0 z-20 bg-[rgba(11,15,25,0.95)] backdrop-blur-md pb-3 pt-1">
        <div className="glass-panel flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/5 shadow-sm">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold text-white">
                Master Unique Contacts Repository
              </h2>
              <span className="bg-emerald-500/15 text-emerald-400 text-[10px] md:text-xs px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap border border-emerald-500/20">
                Read-Only
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deduplicated by Phone / Email. Click to view enquiry history.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 lg:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            {/* Column Customizer */}
            <div className="relative flex-shrink-0" ref={customizerRef}>
              <button
                onClick={() => setShowColumnCustomizer(!showColumnCustomizer)}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-md text-xs font-medium text-slate-300 transition-colors whitespace-nowrap w-full sm:w-auto"
              >
                <Settings size={14} />
                Columns
              </button>

              {showColumnCustomizer && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl p-2 z-30 origin-top-right">
                  <div className="text-xs font-semibold text-slate-400 px-2 py-1 border-b border-white/5 mb-1">
                    Customize Columns
                  </div>
                  {ALL_CONTACT_COLUMNS.map((col) => (
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
        </div>
      </div>

      {/* --- Scrollable Table Area --- */}
      <div className="flex-1 overflow-auto rounded-xl border border-white/5 bg-white/5 relative">
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-10 bg-[#0b0f19] shadow-sm">
            <tr className="border-b border-white/10">
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {filteredContacts.length === 0 ? (
              <tr>
                <td
                  colSpan={activeColumns.length}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users size={24} className="opacity-40" />
                    <span className="text-sm">No master contacts found.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="group hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  {activeColumns.map((col) => {
                    switch (col.key) {
                      case "name":
                        return (
                          <td key="name" className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-3 font-medium text-white text-sm">
                              <ContactAvatar
                                firstName={contact.first_name}
                                lastName={contact.last_name}
                              />
                              <span className="whitespace-nowrap truncate max-w-[120px] md:max-w-[200px]">
                                {contact.first_name} {contact.last_name}
                              </span>
                            </div>
                          </td>
                        );

                      case "phone":
                        return (
                          <td
                            key="phone"
                            className="px-4 py-3 align-middle text-blue-400 font-medium text-sm truncate max-w-[150px]"
                          >
                            {contact.phone || "—"}
                          </td>
                        );

                      case "email":
                        return (
                          <td
                            key="email"
                            className="px-4 py-3 align-middle text-slate-400 text-sm truncate max-w-[150px]"
                          >
                            {contact.email || "—"}
                          </td>
                        );

                      case "source":
                        return (
                          <td key="source" className="px-4 py-3 align-middle">
                            <span className="inline-block bg-white/5 px-2.5 py-1 rounded-md text-[10px] md:text-xs text-slate-300 border border-white/5">
                              {contact.primary_lead_source || "—"}
                            </span>
                          </td>
                        );

                      case "created":
                        return (
                          <td
                            key="created"
                            className="px-4 py-3 align-middle text-slate-500 text-xs whitespace-nowrap"
                          >
                            {new Date(contact.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </td>
                        );

                      case "enquiries":
                        return (
                          <td
                            key="enquiries"
                            className="px-4 py-3 align-middle text-right"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedContact(contact);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] md:text-xs font-semibold transition-colors"
                            >
                              <span>View Enquiries</span>
                              <ExternalLink size={12} />
                            </button>
                          </td>
                        );

                      default:
                        return null;
                    }
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Drill-down Modal --- */}
      <ContactEnquiriesModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onSelectEnquiry={onSelectEnquiry}
      />
    </div>
  );
}
