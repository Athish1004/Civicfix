import React from 'react';
import { useCivic } from '../../context/CivicContext';
import {
  LayoutDashboard,
  PlusCircle,
  MapPin,
  ShieldCheck,
  Cpu,
  Home,
  ChevronLeft,
  X,
  Sparkles,
  AlertOctagon,
  Clock,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  PanelLeftClose,
  Lock,
  User,
  Settings,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    complaints,
    duplicateSuggestions,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    currentUser,
    setIsProfileModalOpen,
  } = useCivic();

  const pendingDuplicates = duplicateSuggestions.filter((d) => d.reviewStatus === 'pending').length;
  const criticalCount = complaints.filter(
    (c) => c.confirmedPriority === 'critical' && c.status !== 'resolved' && c.status !== 'closed'
  ).length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress').length;

  const isAdmin = currentUser?.role === 'administrator';

  const citizenLinks = [
    { id: 'landing', label: 'Home / Overview', icon: Home },
    { id: 'citizen-dashboard', label: 'My Citizen Portal', icon: LayoutDashboard },
    { id: 'report-issue', label: 'Report New Issue', icon: PlusCircle, isAccent: true },
    { id: 'live-map', label: 'Live Civic Map', icon: MapPin },
    {
      id: 'civic-karma',
      label: 'Civic Karma & Hub',
      icon: Award,
      badge: 'New',
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'admin-dashboard',
      label: 'Municipal Command',
      icon: Lock,
      isRestricted: true,
      badge: 'Admin Only',
      badgeColor: 'bg-slate-200 text-slate-600',
    },
  ];

  const adminLinks = [
    { id: 'landing', label: 'Home / Overview', icon: Home },
    {
      id: 'admin-dashboard',
      label: 'Municipal Command',
      icon: ShieldCheck,
      badge: pendingDuplicates > 0 ? `${pendingDuplicates} dups` : undefined,
    },
    { id: 'citizen-dashboard', label: 'Citizen View & Reports', icon: LayoutDashboard },
    { id: 'report-issue', label: 'Report New Issue', icon: PlusCircle, isAccent: true },
    { id: 'live-map', label: 'Live Civic Map', icon: MapPin },
    { id: 'ai-panel', label: 'AI Triage Inspector', icon: Cpu },
    {
      id: 'civic-karma',
      label: 'Civic Karma Hub',
      icon: Award,
    },
  ];

  const displayLinks = isAdmin ? adminLinks : citizenLinks;

  const handleLinkClick = (id: string, isRestricted?: boolean) => {
    if (isRestricted) {
      alert('🔒 Access Restricted: Municipal Command is reserved for City Administrators and Public Works Officers. Please log out and log in through the Administrator Portal.');
      return;
    }
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // If sidebar is hidden, render nothing or 0-width
  if (!sidebarOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-30 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      />

      <aside className="fixed lg:sticky top-16 left-0 bottom-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col justify-between shadow-xl lg:shadow-none transition-all duration-200 select-none overflow-y-auto">
        <div>
          {/* Header with Title and "Hide Sidebar" button */}
          <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Civic Dashboard Nav
              </span>
            </div>

            <button
              onClick={toggleSidebar}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors text-xs font-medium"
              title="Hide Dashboard Sidebar (frees up full workspace)"
            >
              <PanelLeftClose className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline text-[11px]">Hide</span>
            </button>
          </div>

          {/* Role-Specific Core Navigation */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>{isAdmin ? 'Municipal Ops Menu' : 'Citizen Menu'}</span>
              <span
                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                  isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                }`}
              >
                {isAdmin ? 'Admin' : 'Citizen'}
              </span>
            </div>

            {displayLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id, (item as any).isRestricted)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    item.isAccent
                      ? 'bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 shadow-sm'
                      : isActive
                      ? 'bg-[#10243A] text-white font-semibold shadow-xs'
                      : (item as any).isRestricted
                      ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      item.isAccent
                        ? 'text-slate-950'
                        : isActive
                        ? 'text-teal-400'
                        : (item as any).isRestricted
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}
                  />
                  <div className="flex items-center justify-between flex-1">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          (item as any).badgeColor || 'bg-rose-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Portal Switch Notice */}
          <div className="px-4 py-2 mx-3 my-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500">
            <p className="leading-tight">
              Current Access: <strong className="text-slate-800">{isAdmin ? 'Municipal Administrator' : 'Citizen'}</strong>.
              Role is locked while logged in.
            </p>
          </div>
        </div>

        {/* User Profile & Account Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/90 space-y-3">
          {currentUser && (
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-xs cursor-pointer transition-all group"
              title="Click to view and edit profile or log out"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs font-mono shrink-0 shadow-2xs ${
                    isAdmin ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/30' : 'bg-[#10243A] text-teal-300 ring-2 ring-teal-500/30'
                  }`}
                >
                  {(currentUser.name || 'U')
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-xs truncate group-hover:text-teal-700 transition-colors">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{currentUser.email}</div>
                  <div className="text-[10px] font-semibold text-teal-700 capitalize mt-0.5">
                    {isAdmin ? 'Municipal Administrator' : 'Resident Citizen'}
                  </div>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-600 flex items-center gap-1 group-hover:text-slate-900">
                  <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                  <span>My Profile</span>
                </span>
                <span className="text-[10px] font-bold text-teal-700 group-hover:underline">
                  Manage & Log Out →
                </span>
              </div>
            </div>
          )}

          {/* Civic Pulse */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" /> Critical
              </span>
              <span className="text-base font-black text-slate-900">{criticalCount}</span>
            </div>

            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-cyan-600 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Dispatched
              </span>
              <span className="text-base font-black text-slate-900">{inProgressCount}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
