import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import EnquiriesTable from "./components/EnquiriesTable";
import EnquiryDetailModal from "./components/EnquiryDetailModal";
import MetaConnectModal from "./components/MetaConnectModal";
import DashboardView from "./components/DashboardView";
import ContactsView from "./components/ContactsView";
import LandingPage from "./components/LandingPage";
import TodaysActions from "./components/TodaysActions";
import Toast from "./components/Toast";
import ProfileModal from "./components/ProfileModal";
import { apiFetch } from "./api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("lms_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState("enquiries");
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilter, setCurrentFilter] = useState({});
  const [savedViews, setSavedViews] = useState([]);
  const [todaysActionCount, setTodaysActionCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [metaAccount, setMetaAccount] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("google_access");
    const refreshToken = params.get("google_refresh");
    const googleError = params.get("google_error");
    const metaStatus = params.get("meta_status");

    if (googleError) {
      showToast(`Google sign-in failed: ${googleError.replaceAll("_", " ")}`, "error");
    } else if (accessToken && refreshToken) {
      const user = {
        id: params.get("google_id"),
        first_name: params.get("google_first_name") || "Google",
        last_name: params.get("google_last_name") || "User",
        email: params.get("google_email"),
        role: params.get("google_role") || "employee",
      };
      localStorage.setItem("lms_token", accessToken);
      localStorage.setItem("lms_refresh_token", refreshToken);
      handleLoginSuccess(user);
      showToast("Signed in with Google successfully.");
    }

    if (metaStatus) {
      localStorage.setItem("lms_meta_oauth_result", JSON.stringify({
        status: metaStatus,
        timestamp: Date.now(),
      }));
      apiFetch("/api/meta/account/")
        .then(async (response) => {
          if (!response.ok) throw new Error("Unable to load the connected Meta account.");
          return response.json();
        })
        .then((account) => {
          if (metaStatus === "connected" && account.connected) {
            setMetaAccount(account);
            showToast(`${account.name || "Meta account"} connected successfully.`);
            fetchEnquiries();
            window.setTimeout(() => window.close(), 250);
          } else if (metaStatus === "error") {
            showToast("Meta authorization failed. Please try again.", "error");
          }
        })
        .catch((error) => {
          console.error(error);
          showToast("Meta connected, but account details could not be loaded.", "error");
        });
    }

    if (googleError || accessToken || metaStatus) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleMetaStorageEvent = (event) => {
      if (event.key !== "lms_meta_oauth_result" || !event.newValue) return;
      const result = JSON.parse(event.newValue);
      if (result.status !== "connected") return;

      apiFetch("/api/meta/account/")
        .then((response) => response.json())
        .then((account) => {
          if (!account.connected) return;
          setMetaAccount(account);
          showToast(`${account.name || "Meta account"} connected successfully.`);
          fetchEnquiries();
        })
        .catch((error) => console.error("Unable to refresh Meta account:", error));
    };

    window.addEventListener("storage", handleMetaStorageEvent);
    return () => window.removeEventListener("storage", handleMetaStorageEvent);
  }, [currentUser]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("lms_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("lms_user");
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_refresh_token");
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Fetch Enquiries
  const fetchEnquiries = () => {
    if (!currentUser) return;
    let url = "/api/enquiries/?format=json";
    if (currentFilter.status)
      url += `&status=${encodeURIComponent(currentFilter.status)}`;
    if (currentFilter.source)
      url += `&source=${encodeURIComponent(currentFilter.source)}`;
    if (currentFilter.campaign)
      url += `&campaign=${encodeURIComponent(currentFilter.campaign)}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    apiFetch(url)
      .then((res) => res.json())
      .then((data) => {
        const allEnquiries = data.results || data;
        setEnquiries(allEnquiries);
        computeTodaysActionCount(allEnquiries);
      })
      .catch((err) => console.error(err));
  };

  // ✅ FIX: Compute today's action count correctly (Counting unique enquiries, not total actions)
  const computeTodaysActionCount = (allEnquiries) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const uniqueEnquiryIds = new Set();

    (allEnquiries || []).forEach((enquiry) => {
      const isOwner =
        enquiry.primary_owner_details &&
        (enquiry.primary_owner_details.username === currentUser?.username ||
          enquiry.primary_owner_details.email === currentUser?.email);
      const isAdmin = currentUser?.role?.toLowerCase() === "admin";
      if (!isAdmin && !isOwner) return;

      // If the enquiry has a follow-up due today, it counts as 1 action
      if (enquiry.follow_up_date) {
        const followUpDate = new Date(enquiry.follow_up_date);
        if (followUpDate >= today && followUpDate < tomorrow) {
          uniqueEnquiryIds.add(enquiry.id);
        }
      }

      // If the enquiry has a note added today, it counts as 1 action
      if (enquiry.notes_summary && enquiry.updated_at) {
        const updatedDate = new Date(enquiry.updated_at);
        if (
          updatedDate >= today &&
          updatedDate < tomorrow &&
          enquiry.notes_summary.trim()
        ) {
          uniqueEnquiryIds.add(enquiry.id);
        }
      }
    });

    // Set the count to the number of unique enquiries found
    setTodaysActionCount(uniqueEnquiryIds.size);
  };

  // ✅ HANDLER: Resets the badge to 0 when user opens Today's Actions
  const handleTodaysActionsOpened = () => {
    setTodaysActionCount(0);
  };

  useEffect(() => {
    if (currentUser) {
      fetchEnquiries();
    }
  }, [currentUser, currentFilter, searchTerm]);

  useEffect(() => {
    if (currentUser) {
      apiFetch("/api/saved-views/")
        .then((res) => res.json())
        .then((data) => setSavedViews(data.results || data))
        .catch((err) => console.error(err));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      apiFetch("/api/meta/account/")
        .then((response) => response.json())
        .then((data) => setMetaAccount(data.connected ? data : null))
        .catch((err) => console.error(err));
    } else {
      setMetaAccount(null);
    }
  }, [currentUser]);

  const handleMetaConnected = async (account) => {
    setIsMetaModalOpen(false);
    try {
      const response = await apiFetch("/api/meta/account/");
      if (!response.ok) throw new Error("Unable to load the connected Meta account.");
      const connectedAccount = await response.json();
      setMetaAccount(connectedAccount.connected ? connectedAccount : { ...account, connected: true });
      const importedMessage = account.imported_leads
        ? ` ${account.imported_leads} existing lead${account.imported_leads === 1 ? "" : "s"} imported.`
        : "";
      showToast(`${connectedAccount.name || account.name || "Meta account"} connected successfully.${importedMessage}`);
    } catch (err) {
      setMetaAccount({ ...account, connected: true });
      showToast(`${account.name || "Meta account"} connected successfully.`);
      console.error(err);
    }
    fetchEnquiries();
  };

  const handleMetaDisconnect = async () => {
    try {
      const response = await apiFetch("/api/meta/account/", { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to disconnect Meta account.");
      setMetaAccount(null);
      showToast("Meta account disconnected.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Also fetch all enquiries (unfiltered) for today's action count
  useEffect(() => {
    if (currentUser) {
      apiFetch("/api/enquiries/?format=json")
        .then((res) => res.json())
        .then((data) => computeTodaysActionCount(data.results || data))
        .catch((err) => console.error(err));
    }
  }, [currentUser]);

  const handleQuickStatusChange = async (enquiryId, newStatus) => {
    try {
      await apiFetch(`/api/enquiries/${enquiryId}/update_status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchEnquiries();
    } catch (err) {
      console.error(err);
    }
  };

  // Access Guard: Unauthenticated visitors see Landing Page
  if (!currentUser) {
    return (
      <>
        <LandingPage onLoginSuccess={handleLoginSuccess} onToast={showToast} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenMetaModal={() => setIsMetaModalOpen(true)}
        onOpenCreateModal={() => {}}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        todaysActionCount={todaysActionCount}
        onOpenTodaysActions={() => setActiveTab("todaysActions")}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onToggleMobileMenu={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
        metaAccount={metaAccount}
        onDisconnectMeta={handleMetaDisconnect}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSaved={(profile) => {
          const updatedUser = { ...currentUser, username: profile.username, avatar_url: profile.photo_url };
          setCurrentUser(updatedUser);
          localStorage.setItem("lms_user", JSON.stringify(updatedUser));
        }}
        onToast={showToast}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
          savedViews={savedViews}
          todaysActionCount={todaysActionCount}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={closeMobileMenu}
          // Pass the new handler to the Sidebar
          onTodaysActionsOpened={handleTodaysActionsOpened}
        />

        {/* Workspace Main Area */}
        <main className="flex-1 p-4 md:p-5 overflow-y-auto bg-[rgba(11,15,25,0.4)]">
          {activeTab === "enquiries" && (
            <EnquiriesTable
              enquiries={enquiries}
              onSelectEnquiry={setSelectedEnquiry}
              onQuickStatusChange={handleQuickStatusChange}
              currentFilter={currentFilter}
              setCurrentFilter={setCurrentFilter}
              onRefresh={fetchEnquiries}
            />
          )}

          {activeTab === "dashboard" && <DashboardView />}

          {activeTab === "contacts" && (
            <ContactsView
              onSelectEnquiry={(enquiry) => setSelectedEnquiry(enquiry)}
            />
          )}

          {activeTab === "todaysActions" && (
            <TodaysActions
              currentUser={currentUser}
              onSelectEnquiry={(enquiry) => setSelectedEnquiry(enquiry)}
            />
          )}
        </main>
      </div>

      {/* Detail Side-Drawer Modal */}
      <EnquiryDetailModal
        enquiry={selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        onRefresh={fetchEnquiries}
      />

      {/* Direct Meta OAuth Connect Modal */}
      <MetaConnectModal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        onConnected={handleMetaConnected}
      />
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
