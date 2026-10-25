import React, { useState, useEffect } from 'react';
import { useCivic } from '../../context/CivicContext';
import { DEMO_USERS } from '../../data/initialComplaints';
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
} from 'lucide-react';
import { SetupModal } from '../common/SetupModal';
import { JudgeQAModal } from '../common/JudgeQAModal';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setCurrentUser,
    aiStatus,
    duplicateSuggestions,
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
  } = useCivic();

  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [judgeModalOpen, setJudgeModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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

            {/* User Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors text-left"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-teal-400/40"
                />
                <div className="hidden xl:block text-xs leading-tight">
                  <div className="font-semibold text-white flex items-center gap-1">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-teal-400 capitalize">
                    {currentUser.role === 'administrator' ? 'Municipal Officer' : 'Verified Citizen'}
                  </div>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Switch Demo Persona</p>
                  </div>
                  {DEMO_USERS.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          setCurrentUser(user);
                          setUserDropdownOpen(false);
                          if (user.role === 'administrator' && activeTab === 'citizen-dashboard') {
                            setActiveTab('admin-dashboard');
                          } else if (user.role === 'citizen' && activeTab === 'admin-dashboard') {
                            setActiveTab('citizen-dashboard');
                          }
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-teal-50/70 font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <div className="text-xs text-slate-900">{user.name}</div>
                            <div className="text-[11px] text-slate-500 capitalize">{user.role}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                      </button>
                    );
                  })}
                  <div className="px-2 pt-1 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setSetupModalOpen(true);
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-slate-600 hover:text-teal-700 flex items-center gap-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Configure Supabase / AI Keys
                    </button>
                  </div>
                </div>
              )}
            </div>

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
