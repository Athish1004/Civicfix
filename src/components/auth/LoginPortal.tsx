import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { DEMO_USERS } from '../../data/initialComplaints';
import { UserProfile } from '../../types';
import {
  ShieldCheck,
  User,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building,
  MapPin,
  FileCheck2,
  Cpu,
  Award,
  Zap,
  Lock,
  Compass,
} from 'lucide-react';

export const LoginPortal: React.FC<{ initialRole?: 'citizen' | 'administrator'; onLoginSuccess?: () => void }> = ({
  initialRole = 'citizen',
  onLoginSuccess,
}) => {
  const { login } = useCivic();
  const [activePortalTab, setActivePortalTab] = useState<'citizen' | 'administrator'>(initialRole);

  // Custom Citizen form state
  const [citizenName, setCitizenName] = useState('Jane Doe');
  const [citizenEmail, setCitizenEmail] = useState('jane.doe@civicnet.org');
  const [citizenWard, setCitizenWard] = useState('Ward 4 - Downtown Civic Center');

  // Custom Admin form state
  const [adminName, setAdminName] = useState('Officer Marcus Vance');
  const [adminEmail, setAdminEmail] = useState('marcus.vance@cityworks.gov');
  const [adminDepartment, setAdminDepartment] = useState('Municipal Public Works & Dispatch');

  const demoCitizen = DEMO_USERS.find((u) => u.role === 'citizen') || DEMO_USERS[0];
  const demoAdmin = DEMO_USERS.find((u) => u.role === 'administrator') || DEMO_USERS[1];

  const handleQuickCitizenLogin = () => {
    login(demoCitizen);
    onLoginSuccess?.();
  };

  const handleQuickAdminLogin = () => {
    login(demoAdmin);
    onLoginSuccess?.();
  };

  const handleCustomCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customUser: UserProfile = {
      id: `custom-citizen-${Date.now()}`,
      name: citizenName.trim() || 'Civic Resident',
      email: citizenEmail.trim() || 'citizen@civicnet.org',
      role: 'citizen',
      neighborhood: citizenWard.trim() || 'Civic Ward',
    };
    login(customUser);
    onLoginSuccess?.();
  };

  const handleCustomAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customUser: UserProfile = {
      id: `custom-admin-${Date.now()}`,
      name: adminName.trim() || 'Municipal Administrator',
      email: adminEmail.trim() || 'admin@cityworks.gov',
      role: 'administrator',
      department: adminDepartment.trim() || 'Municipal Operations',
    };
    login(customUser);
    onLoginSuccess?.();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-teal-600" />
          <span>Role-Based Access Control • Zero Setup Required</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Select Your Access Portal
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Log in as a <strong className="text-teal-700">Citizen</strong> to report and track neighborhood issues, or as
          an <strong className="text-slate-900">Administrator</strong> to triage reports and mark them as solved.
        </p>
      </div>

      {/* Portal Switcher Selector Tabs (for mobile/tablet) */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/80 text-xs font-bold shadow-inner">
          <button
            onClick={() => setActivePortalTab('citizen')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
              activePortalTab === 'citizen'
                ? 'bg-white text-teal-900 shadow-md scale-102 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-teal-600" />
            <span>Citizen Portal</span>
          </button>
          <button
            onClick={() => setActivePortalTab('administrator')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
              activePortalTab === 'administrator'
                ? 'bg-[#10243A] text-white shadow-md scale-102 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Municipal Admin Portal</span>
          </button>
        </div>
      </div>

      {/* Two Portal Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* ========================================================= */}
        {/* PORTAL 1: CITIZEN LOGIN CARD */}
        {/* ========================================================= */}
        <div
          className={`rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg ${
            activePortalTab === 'citizen'
              ? 'ring-3 ring-teal-500/40 border-teal-500 bg-white'
              : 'border-slate-200 bg-white/70 opacity-90 hover:opacity-100'
          }`}
        >
          <div>
            {/* Citizen Portal Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-700 text-white relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-teal-200 border border-white/20 shadow-inner">
                  <User className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs">
                  Resident Access
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Citizen Portal</h2>
              <p className="text-xs text-teal-100 mt-1 leading-relaxed">
                Empowering residents to submit civic hazards, upload photos, and track repair milestones.
              </p>
            </div>

            {/* Citizen Features List */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Citizen Privileges</div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Report civic problems</strong> with automatic AI hazard analysis and geo-tagging.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Track issue status</strong> in real-time from triage to field crew resolution.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Explore community reports</strong> across all city wards on the Live Civic Map.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Earn Civic Karma</strong> badges and reward tiers for reporting verified issues.
                  </span>
                </li>
              </ul>

              {/* 1-Click Fast Login Pill */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleQuickCitizenLogin}
                  className="w-full py-3.5 px-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 group"
                >
                  <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>1-Click Demo Login as Jane Doe (Citizen)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Or Custom Profile Input Form */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Or enter custom citizen profile
                </div>
                <form onSubmit={handleCustomCitizenSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={citizenEmail}
                        onChange={(e) => setCitizenEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ward / Neighborhood</label>
                      <input
                        type="text"
                        value={citizenWard}
                        onChange={(e) => setCitizenWard(e.target.value)}
                        placeholder="Ward 4"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl border border-teal-600 text-teal-800 hover:bg-teal-50 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Enter Citizen Portal with Custom Data</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PORTAL 2: ADMINISTRATOR LOGIN CARD */}
        {/* ========================================================= */}
        <div
          className={`rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg ${
            activePortalTab === 'administrator'
              ? 'ring-3 ring-amber-400/40 border-[#10243A] bg-white'
              : 'border-slate-200 bg-white/70 opacity-90 hover:opacity-100'
          }`}
        >
          <div>
            {/* Admin Portal Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-br from-[#081321] via-[#10243A] to-[#1a385c] text-white relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 backdrop-blur-xs flex items-center justify-center text-amber-400 border border-amber-400/30 shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs">
                  Municipal Command
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Administrator Portal</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Full operational oversight for municipal staff, public works dispatchers, and city supervisors.
              </p>
            </div>

            {/* Admin Features List */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Administrator Privileges
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-amber-800">Mark issues as Completed / Solved</strong> with verified
                    resolution notes & status updates.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dispatch field repair crews</strong> (Asphalt Units, Sanitation, Electrical line crews).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Review & merge duplicate reports</strong> using Haversine distance and semantic similarity.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Access AI Triage Inspector</strong> and executive municipal workload heatmaps.
                  </span>
                </li>
              </ul>

              {/* 1-Click Fast Login Pill */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#10243A] hover:bg-slate-900 text-amber-300 border border-amber-400/30 font-extrabold text-xs transition-all shadow-md shadow-slate-950/20 flex items-center justify-center gap-2 group"
                >
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>1-Click Demo Login as Officer Marcus Vance (Admin)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Or Custom Admin Input Form */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Or enter custom municipal officer credentials
                </div>
                <form onSubmit={handleCustomAdminSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Officer Name</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Officer Marcus Vance"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Official Email</label>
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="marcus@cityworks.gov"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Department</label>
                      <input
                        type="text"
                        value={adminDepartment}
                        onChange={(e) => setAdminDepartment(e.target.value)}
                        placeholder="Public Works"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900 text-amber-300 hover:bg-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Enter Municipal Command with Custom Data</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Notice */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-500">
        <p>
          💡 <strong>Demo Portal Notice:</strong> No passwords or backend database registration required. You can
          freely log in as Citizen or Administrator. Once logged in, your active session is locked to prevent accidental
          cross-role actions; simply click <strong>Log Out</strong> or <strong>Edit Profile</strong> to exit or change
          details.
        </p>
      </div>
    </div>
  );
};
