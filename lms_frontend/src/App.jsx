import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EnquiriesTable from './components/EnquiriesTable';
import EnquiryDetailModal from './components/EnquiryDetailModal';
import MetaConnectModal from './components/MetaConnectModal';
import DashboardView from './components/DashboardView';
import ContactsView from './components/ContactsView';
import LandingPage from './components/LandingPage';
import TodaysActions from './components/TodaysActions';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('lms_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries', 'dashboard', 'contacts', 'todaysActions'
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState({});
  const [savedViews, setSavedViews] = useState([]);
  const [todaysActionCount, setTodaysActionCount] = useState(0);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('lms_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lms_user');
  };

  // Fetch Enquiries
  const fetchEnquiries = () => {
    if (!currentUser) return;
    let url = '/api/enquiries/?format=json';
    if (currentFilter.status) url += `&status=${encodeURIComponent(currentFilter.status)}`;
    if (currentFilter.source) url += `&source=${encodeURIComponent(currentFilter.source)}`;
    if (currentFilter.campaign) url += `&campaign=${encodeURIComponent(currentFilter.campaign)}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const allEnquiries = data.results || data;
        setEnquiries(allEnquiries);
        // Calculate today's action count for notification badge
        computeTodaysActionCount(allEnquiries);
      })
      .catch(err => console.error(err));
  };

  // Compute today's action count for the notification badge
  const computeTodaysActionCount = (allEnquiries) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let count = 0;
    (allEnquiries || []).forEach(enquiry => {
      // Filter by user ownership for non-admin
      const isOwner = enquiry.primary_owner_details &&
        (enquiry.primary_owner_details.username === currentUser?.username ||
         enquiry.primary_owner_details.email === currentUser?.email);
      const isAdmin = currentUser?.role === 'Admin';
      if (!isAdmin && !isOwner) return;

      if (enquiry.follow_up_date) {
        const followUpDate = new Date(enquiry.follow_up_date);
        if (followUpDate >= today && followUpDate < tomorrow) {
          count++;
        }
      }
      if (enquiry.notes_summary && enquiry.updated_at) {
        const updatedDate = new Date(enquiry.updated_at);
        if (updatedDate >= today && updatedDate < tomorrow && enquiry.notes_summary.trim()) {
          count++;
        }
      }
    });
    setTodaysActionCount(count);
  };

  useEffect(() => {
    if (currentUser) {
      fetchEnquiries();
    }
  }, [currentUser, currentFilter, searchTerm]);

  useEffect(() => {
    if (currentUser) {
      fetch('/api/saved-views/')
        .then(res => res.json())
        .then(data => setSavedViews(data.results || data))
        .catch(err => console.error(err));
    }
  }, [currentUser]);

  // Also fetch all enquiries (unfiltered) for today's action count
  useEffect(() => {
    if (currentUser) {
      fetch('/api/enquiries/?format=json')
        .then(res => res.json())
        .then(data => computeTodaysActionCount(data.results || data))
        .catch(err => console.error(err));
    }
  }, [currentUser]);

  const handleQuickStatusChange = async (enquiryId, newStatus) => {
    try {
      await fetch(`/api/enquiries/${enquiryId}/update_status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchEnquiries();
    } catch (err) {
      console.error(err);
    }
  };

  // Access Guard: Unauthenticated visitors see Landing Page with specs, benefits, how it works, and Sign In / Google Sign Up
  if (!currentUser) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenMetaModal={() => setIsMetaModalOpen(true)}
        onOpenCreateModal={() => {}}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        todaysActionCount={todaysActionCount}
        onOpenTodaysActions={() => setActiveTab('todaysActions')}
      />

      {/* Main Workspace Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
          savedViews={savedViews}
          todaysActionCount={todaysActionCount}
        />

        {/* Workspace Main Area */}
        <main style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(11, 15, 25, 0.4)' }}>
          {activeTab === 'enquiries' && (
            <EnquiriesTable
              enquiries={enquiries}
              onSelectEnquiry={setSelectedEnquiry}
              onQuickStatusChange={handleQuickStatusChange}
              currentFilter={currentFilter}
              setCurrentFilter={setCurrentFilter}
              onRefresh={fetchEnquiries}
            />
          )}

          {activeTab === 'dashboard' && <DashboardView />}

          {activeTab === 'contacts' && (
            <ContactsView onSelectEnquiry={(enquiry) => setSelectedEnquiry(enquiry)} />
          )}

          {activeTab === 'todaysActions' && (
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
        onConnected={() => fetchEnquiries()}
      />
    </div>
  );
}
