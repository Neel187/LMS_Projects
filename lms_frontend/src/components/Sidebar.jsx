import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Filter,
  Bookmark,
  Share2,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Bell,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentFilter,
  setCurrentFilter,
  savedViews,
  todaysActionCount,
  isMobileOpen,
  onCloseMobile,
  // ✅ 1. Accept the new prop
  onTodaysActionsOpened,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: "enquiries", label: "Enquiries (Primary)", icon: FileText },
    { id: "dashboard", label: "Analytics Dashboard", icon: LayoutDashboard },
    { id: "contacts", label: "Master Contacts (Read-Only)", icon: Users },
    {
      id: "todaysActions",
      label: "Today's Actions",
      icon: Bell,
      badge: todaysActionCount,
    },
  ];

  const smartViews = [
    { id: "all", label: "All Enquiries", icon: FileText, filter: {} },
    {
      id: "meta_ads",
      label: "Meta Ads Enquiries",
      icon: Share2,
      filter: { source: "Meta Ads" },
    },
    {
      id: "new",
      label: "New Leads (Unassigned)",
      icon: AlertCircle,
      filter: { status: "New" },
    },
    {
      id: "contacted",
      label: "In Follow-up",
      icon: Clock,
      filter: { status: "Contacted" },
    },
    {
      id: "qualified",
      label: "Qualified Opportunities",
      icon: CheckCircle2,
      filter: { status: "Qualified" },
    },
    {
      id: "dubai_expo",
      label: "Campaign: Dubai Expo",
      icon: Filter,
      filter: { campaign: "Dubai Property Expo 2026" },
    },
  ];

  const isFilterActive = (viewFilter) => {
    return (
      currentFilter.status === viewFilter.status &&
      currentFilter.source === viewFilter.source
    );
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Desktop Sidebar
  const desktopSidebar = (
    <aside
      className={`
        hidden md:flex flex-col border-r border-[rgba(255,255,255,0.06)]
        bg-[rgba(11,15,25,0.95)] sticky top-0
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-[72px] min-w-[72px]" : "w-[260px] min-w-[260px]"}
      `}
      style={{ height: "100vh", maxHeight: "100vh" }}
    >
      {/* Sticky Header with Collapse Button */}
      <div
        className={`
          sticky top-0 z-10 bg-[rgba(11,15,25,0.95)] border-b border-[rgba(255,255,255,0.06)] flex-shrink-0
          ${isCollapsed ? "px-2 py-3" : "px-4 py-3"}
        `}
      >
        <button
          onClick={toggleCollapse}
          className={`
            flex items-center w-full p-2 rounded-lg
            hover:bg-[rgba(255,255,255,0.05)] transition-all duration-150
            ${isCollapsed ? "justify-center" : "justify-between"}
          `}
        >
          <Menu size={18} className="text-[#94a3b8]" />
          {!isCollapsed && (
            <span className="text-xs text-[#64748b]">Collapse</span>
          )}
        </button>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ minHeight: 0 }}
      >
        <div className={`${isCollapsed ? "px-2" : "px-3"} pb-8`}>
          {/* Main Workspace */}
          <div className="py-4">
            {!isCollapsed && (
              <p className="text-[0.65rem] font-bold text-[#64748b] uppercase tracking-wider mb-3 pl-2">
                Main Workspace
              </p>
            )}
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    // ✅ 2. Reset badge count if this button is clicked
                    if (item.id === "todaysActions" && onTodaysActionsOpened) {
                      onTodaysActionsOpened();
                    }
                    setActiveTab(item.id);
                  }}
                  className={`
                    flex items-center w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150
                    ${isCollapsed ? "justify-center" : "justify-between"}
                    ${
                      activeTab === item.id
                        ? "bg-[rgba(59,130,246,0.12)] text-[#60a5fa]"
                        : "text-[#94a3b8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e2e8f0]"
                    }
                  `}
                  title={isCollapsed ? item.label : ""}
                >
                  <div
                    className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && item.badge > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-blue-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Views */}
          <div className="py-4 border-t border-[rgba(255,255,255,0.06)]">
            {!isCollapsed && (
              <p className="text-[0.65rem] font-bold text-[#64748b] uppercase tracking-wider mb-3 pl-2">
                ⭐ Smart Views
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {smartViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => {
                    setActiveTab("enquiries");
                    setCurrentFilter(view.filter);
                  }}
                  className={`
                    flex items-center w-full px-3 py-2 rounded-md text-left transition-all duration-150
                    ${isCollapsed ? "justify-center" : "justify-between"}
                    ${
                      isFilterActive(view.filter)
                        ? "bg-[rgba(255,255,255,0.06)]"
                        : "hover:bg-[rgba(255,255,255,0.04)]"
                    }
                  `}
                  title={isCollapsed ? view.label : ""}
                >
                  <div
                    className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}
                  >
                    <view.icon
                      size={14}
                      className="text-[#9bc5ff] flex-shrink-0"
                    />
                    {!isCollapsed && (
                      <span className="text-sm text-[#e2e8f0]">
                        {view.label}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight
                      size={14}
                      className="text-[#64748b] flex-shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Views */}
          {savedViews.length > 0 && (
            <div className="py-4 border-t border-[rgba(255,255,255,0.06)]">
              {!isCollapsed && (
                <p className="text-[0.65rem] font-bold text-[#64748b] uppercase tracking-wider mb-3 pl-2">
                  📌 Saved Views
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {savedViews.map((sv) => (
                  <button
                    key={sv.id}
                    onClick={() => {
                      setActiveTab("enquiries");
                      setCurrentFilter(sv.filters_config);
                    }}
                    className={`
                      flex items-center w-full px-3 py-2 rounded-md text-left transition-all duration-150
                      ${isCollapsed ? "justify-center" : ""}
                      hover:bg-[rgba(255,255,255,0.04)]
                    `}
                    title={isCollapsed ? sv.name : ""}
                  >
                    <div
                      className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}
                    >
                      <Bookmark
                        size={13}
                        className="text-[#fbbf24] flex-shrink-0"
                      />
                      {!isCollapsed && (
                        <span className="text-sm text-[#cbd5e1] truncate">
                          {sv.name}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>
    </aside>
  );

  // Mobile Sidebar - Now as a slide-in overlay
  const mobileSidebar = (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          md:hidden fixed top-0 left-0 z-40 w-[280px] 
          bg-[rgba(11,15,25,0.98)] border-r border-[rgba(255,255,255,0.06)]
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ height: "100vh", maxHeight: "100vh" }}
      >
        <div className="flex flex-col h-full">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-[rgba(11,15,25,0.98)] border-b border-[rgba(255,255,255,0.06)] px-4 py-3 flex-shrink-0">
            <button
              onClick={onCloseMobile}
              className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors"
            >
              <X size={20} />
              <span>Close Menu</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-8"
            style={{ minHeight: 0 }}
          >
            <div className="py-4">
              <p className="text-[0.65rem] font-bold text-[#64748b] uppercase tracking-wider mb-3 pl-2">
                Main Workspace
              </p>
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      // ✅ 2. Reset badge count if this button is clicked
                      if (
                        item.id === "todaysActions" &&
                        onTodaysActionsOpened
                      ) {
                        onTodaysActionsOpened();
                      }
                      setActiveTab(item.id);
                      onCloseMobile();
                    }}
                    className={`
                      flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left
                      ${
                        activeTab === item.id
                          ? "bg-[rgba(59,130,246,0.12)] text-[#60a5fa]"
                          : "text-[#94a3b8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e2e8f0]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-blue-500 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-4 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[0.65rem] font-bold text-[#64748b] uppercase tracking-wider mb-3 pl-2">
                ⭐ Smart Views
              </p>
              <div className="flex flex-col gap-0.5">
                {smartViews.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => {
                      setActiveTab("enquiries");
                      setCurrentFilter(view.filter);
                      onCloseMobile();
                    }}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-[rgba(255,255,255,0.04)]"
                  >
                    <div className="flex items-center gap-3">
                      <view.icon
                        size={14}
                        className="text-[#9bc5ff] flex-shrink-0"
                      />
                      <span className="text-sm text-[#e2e8f0]">
                        {view.label}
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-[#64748b] flex-shrink-0"
                    />
                  </button>
                ))}
              </div>
            </div>

            {savedViews.length > 0 && (
              <div className="py-4 border-t border-[rgba(255,255,255,0.06)]">
                <p className="text-[0.65rem] font-bold text-[#64748b] uppercase tracking-wider mb-3 pl-2">
                  📌 Saved Views
                </p>
                <div className="flex flex-col gap-0.5">
                  {savedViews.map((sv) => (
                    <button
                      key={sv.id}
                      onClick={() => {
                        setActiveTab("enquiries");
                        setCurrentFilter(sv.filters_config);
                        onCloseMobile();
                      }}
                      className="flex items-center w-full px-3 py-2 rounded-md hover:bg-[rgba(255,255,255,0.04)]"
                    >
                      <div className="flex items-center gap-3">
                        <Bookmark
                          size={13}
                          className="text-[#fbbf24] flex-shrink-0"
                        />
                        <span className="text-sm text-[#cbd5e1]">
                          {sv.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="h-4" />
          </div>
        </div>
      </aside>
    </>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}
