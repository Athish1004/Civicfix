/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CivicProvider, useCivic } from './context/CivicContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { ReportIssuePage } from './components/citizen/ReportIssuePage';
import { ComplaintDetailsPage } from './components/complaint/ComplaintDetailsPage';
import { LiveCivicMap } from './components/map/LiveCivicMap';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AiAnalysisPanel } from './components/ai/AiAnalysisPanel';
import { CivicKarmaView } from './components/gamification/CivicKarmaView';
import { LoginPortal } from './components/auth/LoginPortal';
import { LoginModal } from './components/auth/LoginModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PanelLeftOpen } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    sidebarOpen,
    toggleSidebar,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isLoginModalOpen,
    closeLoginModal,
    loginModalDefaultRole,
    currentUser,
  } = useCivic();

  const renderActiveView = () => {
    // If not logged in, ask user to select their respective portal (Citizen or Admin)
    if (!currentUser) {
      return <LoginPortal initialRole={loginModalDefaultRole} />;
    }

    switch (activeTab) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPortal initialRole={loginModalDefaultRole} />;
      case 'citizen-dashboard':
        return <CitizenDashboard />;
      case 'report-issue':
        return <ReportIssuePage />;
      case 'complaint-details':
        return <ComplaintDetailsPage />;
      case 'live-map':
        return <LiveCivicMap />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'ai-panel':
        return <AiAnalysisPanel />;
      case 'civic-karma':
        return <CivicKarmaView />;
      default:
        return currentUser.role === 'administrator' ? <AdminDashboard /> : <CitizenDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-teal-500 selection:text-slate-950">
      <Navbar />

      <div className="flex-1 flex relative">
        {/* Left Dashboard Navigation (Active only when logged in) */}
        {currentUser && (
          <ErrorBoundary fallbackTitle="Dashboard Navigation">
            <Sidebar />
          </ErrorBoundary>
        )}

        {/* Floating Re-Open Sidebar pill when user chose to hide it */}
        {currentUser && !sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#10243A] text-teal-300 border border-teal-500/40 shadow-2xl hover:bg-slate-900 hover:text-white transition-all text-xs font-bold animate-in fade-in slide-in-from-left duration-200"
            title="Restore Left Dashboard Navigation"
          >
            <PanelLeftOpen className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>Show Dashboard Menu</span>
          </button>
        )}

        <main className="flex-1 min-w-0 overflow-x-hidden">
          <ErrorBoundary fallbackTitle="View Rendering Error">
            {renderActiveView()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Modals for Profile Customization & Login */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} defaultRole={loginModalDefaultRole} />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Application Error">
      <CivicProvider>
        <AppContent />
      </CivicProvider>
    </ErrorBoundary>
  );
}
