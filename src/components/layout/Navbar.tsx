import React, { useState, useEffect } from 'react';
import { useCivic } from '../../context/CivicContext';
import {
  ShieldAlert,
  Sparkles,
  PlusCircle,
  MapPin,
  LayoutDashboard,
  ShieldCheck,
  Cpu,
  Menu,
  X,
  SlidersHorizontal,
  Home,
  Check,
  Award,
  PanelLeftOpen,
  PanelLeftClose,
  Radio,
  Flame,
  User,
} from 'lucide-react';
import { SetupModal } from '../common/SetupModal';
import { JudgeQAModal } from '../common/JudgeQAModal';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setIsProfileModalOpen,
    aiStatus,
    duplicateSuggestions,
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
  } = useCivic();

  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [judgeModalOpen, setJudgeModalOpen] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  const pendingDuplicates = duplicateSuggestions.filter((d) => d.reviewStatus === 'pending').length;

  // Live Civic Broadcast bulletins
  const tickerItems = [
    { tag: 'AI RADAR', text: 'Drainage blockage on Elm St flagged as High Flood Risk — Auto Triaged', color: 'text-amber-400' },
    { tag: 'DISPATCH', text: 'Field Unit 12 deployed to Water Main Leakage at 4th & Pine', color: 'text-cyan-400' },
    { tag: 'RESOLVED', text: 'Streetlight outage at Market Square fixed & photo-verified in 3.8 hrs', color: 'text-emerald-400' },
    { tag: 'CIVIC KARMA', text: 'Jane Doe achieved Level 4 "Civic Guardian" (+480 Karma Pts)', color: 'text-teal-400' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [tickerItems.length]);

  const handleBrandClick = () => {
    setActiveTab('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#10243A] text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Sidebar Toggle + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sidebar Hide/Show Button */}
            <button
              onClick={toggleSidebar}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                sidebarOpen
                  ? 'bg-slate-800/80 border-slate-700 text-teal-300 hover:bg-slate-700'
                  : 'bg-teal-500/20 border-teal-400/50 text-teal-300 hover:bg-teal-500/30 ring-2 ring-teal-500/20'
              }`}
              title={sidebarOpen ? 'Hide Left Dashboard Navigation' : 'Open Left Dashboard Navigation'}
            >
              {sidebarOpen ? (
                <>
                  <PanelLeftClose className="w-4 h-4 text-teal-400" />
                  <span className="hidden md:inline text-[11px]">Hide Nav</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-teal-400 animate-pulse" />
                  <span className="hidden md:inline text-[11px] font-bold">Dashboard Nav</span>
                </>
              )}
            </button>

            {/* Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={handleBrandClick}
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-inner">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">CivicFix</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Intelligence
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden xl:block">AI Civic Problem & Municipal Management</p>
              </div>
            </div>
          </div>

          {/* Center: Live Emergency Broadcast & AI Ticker (Unique Feature) */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2 items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
              <Radio className="w-3 h-3 text-teal-400 animate-pulse" />
              {tickerItems[tickerIndex].tag}
            </span>
            <div className="overflow-hidden whitespace-nowrap text-slate-300 truncate text-[11px]">
              <span className="transition-opacity duration-300 animate-in fade-in">
                {tickerItems[tickerIndex].text}
              </span>
            </div>
          </div>

          {/* Right: Actions, Pitch QA, AI Engine Pill, Persona Switcher */}
          <div className="flex items-center gap-2">
            {/* Quick Report Issue Button */}
            <button
              onClick={() => {
                setActiveTab('report-issue');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition-all text-xs shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Issue</span>
            </button>

            {/* Hackathon Judge Q&A Guide button */}
            <button
              onClick={() => setJudgeModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-teal-400/10 border border-teal-400/40 text-teal-300 hover:text-white hover:border-teal-300 transition-all text-xs font-bold shadow-xs"
              title="Hackathon Pitch, Competitive Edge & Evaluator Q&A"
            >
              <Award className="w-3.5 h-3.5 text-teal-400" />
              <span>Judge Q&A</span>
            </button>

            {/* AI Engine Status Pill */}
            <button
              onClick={() => setSetupModalOpen(true)}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                aiStatus.isAiLive
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-teal-950/60 border-teal-500/40 text-teal-300 hover:bg-teal-900/60'
              }`}
              title="Click to view AI & Database configuration"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus.isAiLive ? 'bg-emerald-400 animate-pulse' : 'bg-teal-400'
                }`}
              />
              <span className="text-[11px] font-mono">
                {aiStatus.isAiLive ? 'Neural Engine (Live)' : 'Demo Engine'}
              </span>
              <SlidersHorizontal className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* Logged in User Profile (Click to open Profile Modal with details & Logout) */}
            {currentUser && (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-left group ${
                  currentUser.role === 'administrator'
                    ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 hover:bg-slate-800'
                    : 'bg-slate-900/90 border-teal-500/40 hover:border-teal-400 hover:bg-slate-800'
                }`}
                title="Click to view and edit profile or log out"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    currentUser.role === 'administrator'
                      ? 'bg-amber-400 text-slate-950 font-mono shadow-xs'
                      : 'bg-teal-500 text-slate-950 font-mono shadow-xs'
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
                <div className="hidden sm:block text-xs leading-tight">
                  <div className="font-bold text-white flex items-center gap-1 group-hover:text-teal-300 transition-colors">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] flex items-center gap-1 font-semibold">
                    {currentUser.role === 'administrator' ? (
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Municipal Officer
                      </span>
                    ) : (
                      <span className="text-teal-400">Verified Citizen</span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-teal-300 font-semibold hidden md:inline ml-1 px-1.5 py-0.5 rounded bg-white/10 group-hover:bg-white/20 transition-colors">
                  Profile
                </span>
              </button>
            )}

            {/* Mobile menu toggle button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5 text-teal-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Setup modal */}
      <SetupModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />

      {/* Judge Q&A modal */}
      <JudgeQAModal isOpen={judgeModalOpen} onClose={() => setJudgeModalOpen(false)} />
    </>
  );
};
