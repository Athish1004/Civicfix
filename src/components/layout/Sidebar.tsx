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
  } = useCivic();

  const pendingDuplicates = duplicateSuggestions.filter((d) => d.reviewStatus === 'pending').length;
  const criticalCount = complaints.filter(
    (c) => c.confirmedPriority === 'critical' && c.status !== 'resolved' && c.status !== 'closed'
  ).length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress').length;

  const mainLinks = [
    { id: 'landing', label: 'Home / Overview', icon: Home },
    { id: 'citizen-dashboard', label: 'Citizen Portal', icon: LayoutDashboard },
    { id: 'report-issue', label: 'Report New Issue', icon: PlusCircle, isAccent: true },
    { id: 'live-map', label: 'Live Civic Map', icon: MapPin },
    {
      id: 'admin-dashboard',
      label: 'Municipal Command',
      icon: ShieldCheck,
      badge: pendingDuplicates > 0 ? `${pendingDuplicates} dups` : undefined,
    },
    { id: 'ai-panel', label: 'AI Triage Inspector', icon: Cpu },
  ];

  const uniqueFeatureLinks = [
    {
      id: 'civic-karma',
      label: 'Civic Karma & Hub',
      icon: Award,
      badge: 'New',
      badgeColor: 'bg-amber-500 text-slate-950',
    },
  ];

  const handleLinkClick = (id: string) => {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // On small screens, auto-close sidebar after selection
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

          {/* Quick Category: Core Navigation */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Core Systems
            </div>

            {mainLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    item.isAccent
                      ? 'bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 shadow-sm'
                      : isActive
                      ? 'bg-[#10243A] text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${item.isAccent ? 'text-slate-950' : isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                  <div className="flex items-center justify-between flex-1">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Category: Unique Hackathon Features */}
          <div className="p-3 pt-1 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Civic Innovations</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>

            {uniqueFeatureLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#10243A] text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-amber-600'}`} />
                  <div className="flex items-center justify-between flex-1">
                    <span className="truncate font-semibold">{item.label}</span>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${item.badgeColor || 'bg-amber-100 text-amber-800'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Civic Pulse Telemetry Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Civic Pulse</span>
            <span className="text-teal-600 font-mono text-[10px] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
              Live GIS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 mb-0.5">
                <AlertOctagon className="w-3 h-3" /> Critical
              </span>
              <span className="text-lg font-black text-slate-900">{criticalCount}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-cyan-600 flex items-center gap-1 mb-0.5">
                <Clock className="w-3 h-3" /> Dispatched
              </span>
              <span className="text-lg font-black text-slate-900">{inProgressCount}</span>
            </div>
          </div>

          <div className="pt-1 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
            <span>Click</span>
            <button
              onClick={toggleSidebar}
              className="text-teal-700 font-semibold underline hover:text-teal-900"
            >
              Hide Sidebar
            </button>
            <span>for full view</span>
          </div>
        </div>
      </aside>
    </>
  );
};
