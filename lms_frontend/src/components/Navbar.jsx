import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  User,
  Share2,
  Plus,
  LogOut,
  ChevronDown,
  Shield,
  UserCircle,
  Menu,
  X,
} from "lucide-react";

export default function Navbar({
  currentUser,
  onLogout,
  onOpenMetaModal,
  onOpenCreateModal,
  searchTerm,
  setSearchTerm,
  todaysActionCount,
  onOpenTodaysActions,
  onOpenProfile,
  onToggleMobileMenu,
  isMobileMenuOpen,
  metaAccount,
  onDisconnectMeta,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [showMetaMenu, setShowMetaMenu] = useState(false);
  const dropdownRef = useRef(null);
  const metaMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedInsideDropdown = dropdownRef.current?.contains(e.target);
      const clickedInsideMetaMenu = metaMenuRef.current?.contains(e.target);

      if (!clickedInsideDropdown) {
        setShowDropdown(false);
        setShowProfile(false);
      }

      if (!clickedInsideMetaMenu) {
        setShowMetaMenu(false);
      }

      if (!clickedInsideDropdown && !clickedInsideMetaMenu) {
        setShowMobileActions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close Meta menu when account is disconnected
  useEffect(() => {
    if (!metaAccount?.connected) {
      setShowMetaMenu(false);
    }
  }, [metaAccount]);

  const userRole = currentUser?.role || "Employee";
  const isAdmin = userRole.toLowerCase() === "admin";

  return (
    <header className="bg-[rgba(11,15,25,0.95)] border-b border-[rgba(255,255,255,0.06)] sticky top-0 z-40 px-4 py-3 md:px-6 md:py-3">
      <div className="flex items-center justify-between">
        {/* Brand - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              PioneerTech LMS
            </h1>
            <p className="text-xs text-[#64748b]">
              Lead OS • Deduplicated & Ready for Instant Follow-up
            </p>
          </div>
        </div>

        {/* Search - Desktop */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
            />
            <input
              type="text"
              placeholder="Global search (Contacts, Enquiries, Phone, Campaign)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.06)] rounded-lg text-white text-sm placeholder-[#64748b] focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between w-full">
          {/* Left: Logo & Hamburger Menu */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
                ⚡
              </div>
              <h1 className="text-sm font-bold text-white">PioneerTech</h1>
            </div>
          </div>

          {/* Right: User Avatar with Quick Actions */}
          <div className="relative flex" ref={dropdownRef}>
            <button
              className="w-8 h-8 rounded-full bg-[#374151] flex items-center justify-center overflow-hidden ring-2 ring-[rgba(255,255,255,0.05)]"
              onClick={() => {
                setShowMobileActions(!showMobileActions);
                setShowDropdown(false);
                setShowProfile(false);
              }}
            >
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={16} className="text-[#9ca3af]" />
              )}
            </button>

            {/* Hamburger Menu Button */}
            <button
              onClick={onToggleMobileMenu}
              className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X size={20} className="text-[#e2e8f0]" />
              ) : (
                <Menu size={20} className="text-[#e2e8f0]" />
              )}
            </button>

            {/* Mobile Quick Actions Dropdown */}
            {showMobileActions && (
              <div className="absolute right-8 mt-8 w-45 bg-[rgba(11,15,25,0.98)] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden z-50">
                <div className="p-1">
                  <button
                    onClick={() => {
                      if (metaAccount?.connected) {
                        setShowMetaMenu(!showMetaMenu);
                      } else {
                        onOpenMetaModal();
                        setShowMobileActions(false);
                      }
                    }}
                    className="flex items-center gap-3 w-full px-1 py-2.5 rounded-lg text-[#94a3b8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-colors"
                  >
                    <Share2 size={18} className="text-blue-400" />
                    <span className="text-[12px]">
                      {metaAccount?.connected ? metaAccount.name : "Connect Account"}
                    </span>
                  </button>

                  {/* Meta Logout Option - Mobile */}
                  {showMetaMenu && metaAccount?.connected && (
                    <button
                      onClick={async () => {
                        setShowMetaMenu(false);
                        setShowMobileActions(false);
                        await onDisconnectMeta();
                      }}
                      className="flex items-center gap-3 w-full px-1 py-2 rounded-lg text-[12px] text-red-400 hover:bg-red-500/10 transition-colors ml-6"
                    >
                      <LogOut size={14} />
                      Logout Meta
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onOpenCreateModal();
                      setShowMobileActions(false);
                    }}
                    className="flex items-center gap-3 w-full px-1 py-2.5 rounded-lg text-[#94a3b8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-colors"
                  >
                    <Plus size={18} className="text-emerald-400" />
                    <span className="text-[12px]">New Enquiry</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenTodaysActions();
                      setShowMobileActions(false);
                    }}
                    className="flex items-center gap-3 w-full px-1 py-2.5 rounded-lg text-[#94a3b8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-colors"
                  >
                    <Bell size={18} className="text-yellow-400" />
                    <span className="text-[12px]">Today's Actions</span>
                    {todaysActionCount > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {todaysActionCount > 9 ? "9+" : todaysActionCount}
                      </span>
                    )}
                  </button>
                  <div className="h-px bg-[rgba(255,255,255,0.06)] my-1" />
                  <button
                    onClick={() => {
                      setShowMobileActions(false);
                      onOpenProfile();
                    }}
                    className="flex items-center gap-3 w-full px-1 py-2.5 rounded-lg text-[#94a3b8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-colors"
                  >
                    <UserCircle size={18} className="text-blue-400" />
                    <span className="text-[12px]">View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileActions(false);
                      onLogout();
                    }}
                    className="flex items-center gap-3 w-full px-1 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="text-[12px]">Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Profile Details */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-72 bg-[rgba(11,15,25,0.98)] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden z-50">
                <div className="p-4">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      setShowMobileActions(true);
                    }}
                    className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors mb-4"
                  >
                    ← Back
                  </button>

                  <div className="flex flex-col items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/30">
                      {currentUser?.avatar_url ? (
                        <img
                          src={currentUser.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-white" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-white">
                        {currentUser?.first_name} {currentUser?.last_name || ""}
                      </p>
                      <span
                        className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                          isAdmin
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {userRole}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-[rgba(0,0,0,0.3)]">
                      <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                        Username
                      </p>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {currentUser?.username || "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[rgba(0,0,0,0.3)]">
                      <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-sm font-medium text-blue-400 mt-0.5">
                        {currentUser?.email || "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[rgba(0,0,0,0.3)]">
                      <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                        Role
                      </p>
                      <p className="text-sm font-medium text-white mt-0.5 flex items-center gap-2">
                        <Shield
                          size={14}
                          className={
                            isAdmin
                              ? "text-yellow-400"
                              : "text-emerald-400"
                          }
                        />
                        {userRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-1.5 md:gap-2">
          <div className="relative" ref={metaMenuRef}>
            <button
              onClick={() => {
                if (metaAccount?.connected) {
                  setShowMetaMenu(!showMetaMenu);
                } else {
                  onOpenMetaModal();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              <Share2 size={16} />
              <span>{metaAccount?.connected ? metaAccount.name : "⚡ Connect Meta"}</span>
            </button>

            {showMetaMenu && metaAccount?.connected && (
              <div className="absolute top-12 right-0 z-50 w-52 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,15,25,0.98)] p-1 shadow-2xl">
                <button
                  onClick={async () => {
                    setShowMetaMenu(false);
                    await onDisconnectMeta();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                  Logout Meta account
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 border border-[rgba(255,255,255,0.1)] rounded-lg text-white text-sm font-medium hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
          >
            <Plus size={16} />
            <span>New Enquiry</span>
          </button>

          <div className="w-px h-6 bg-[rgba(255,255,255,0.06)] mx-1" />

          <button
            onClick={onOpenTodaysActions}
            className="relative p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
            title="Today's Actions"
          >
            <Bell size={18} className="text-[#94a3b8]" />
            {todaysActionCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-lg shadow-red-500/25">
                {todaysActionCount > 9 ? "9+" : todaysActionCount}
              </span>
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
              onClick={() => {
                setShowDropdown(!showDropdown);
                setShowProfile(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-[#374151] flex items-center justify-center overflow-hidden ring-2 ring-[rgba(255,255,255,0.05)]">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-[#9ca3af]" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">
                  {currentUser?.first_name || "User"}
                </p>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    isAdmin
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {userRole}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-[#64748b] transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showDropdown && !showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-[rgba(11,15,25,0.98)] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden z-50">
                <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#374151] flex items-center justify-center overflow-hidden">
                      {currentUser?.avatar_url ? (
                        <img
                          src={currentUser.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={18} className="text-[#9ca3af]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {currentUser?.first_name} {currentUser?.last_name || ""}
                      </p>
                      <p className="text-xs text-[#64748b]">
                        {currentUser?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-1">
                  <button
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[#94a3b8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-colors"
                    onClick={() => {
                      setShowDropdown(false);
                      onOpenProfile();
                    }}
                  >
                    <UserCircle size={16} className="text-blue-400" />
                    View Details
                  </button>

                  <button
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    onClick={() => {
                      setShowDropdown(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {showDropdown && showProfile && (
              <div className="absolute right-0 mt-2 w-72 bg-[rgba(11,15,25,0.98)] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden z-50">
                <div className="p-4">
                  <button
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors mb-4"
                  >
                    ← Back
                  </button>

                  <div className="flex flex-col items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/30">
                      {currentUser?.avatar_url ? (
                        <img
                          src={currentUser.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-white" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-white">
                        {currentUser?.first_name} {currentUser?.last_name || ""}
                      </p>
                      <span
                        className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                          isAdmin
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {userRole}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-[rgba(0,0,0,0.3)]">
                      <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                        Username
                      </p>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {currentUser?.username || "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[rgba(0,0,0,0.3)]">
                      <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-sm font-medium text-blue-400 mt-0.5">
                        {currentUser?.email || "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[rgba(0,0,0,0.3)]">
                      <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                        Role
                      </p>
                      <p className="text-sm font-medium text-white mt-0.5 flex items-center gap-2">
                        <Shield
                          size={14}
                          className={
                            isAdmin
                              ? "text-yellow-400"
                              : "text-emerald-400"
                          }
                        />
                        {userRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Full width */}
      <div className="md:hidden mt-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
          />
          <input
            type="text"
            placeholder="Search contacts, enquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.06)] rounded-lg text-white text-sm placeholder-[#64748b] focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>
    </header>
  );
}
