import React from 'react';
import { useCivic } from '../../context/CivicContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Layers,
  CopyCheck,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Users,
  Compass,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Droplets,
  Wrench,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { User, Lock } from 'lucide-react';
import { CategoryBadge, StatusBadge, PriorityBadge } from '../common/Badge';
import { BeforeAfterSlider } from '../common/BeforeAfterSlider';

export const LandingPage: React.FC = () => {
  const { setActiveTab, complaints, viewComplaint, aiStatus, currentUser, openLoginModal } = useCivic();

  const resolvedCount = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress' || c.status === 'scheduled').length;
  const highPriorityCount = complaints.filter((c) => c.confirmedPriority === 'high' || c.confirmedPriority === 'critical').length;

  const recentComplaints = complaints.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-radial-[at_top_right] from-[#10243A] via-[#0D1D30] to-[#081321] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Glow ambient background lights */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* AI Banner Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-medium backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Next-Generation Civic Infrastructure Management</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
            Report It. <span className="text-teal-400">Track It.</span> Fix It.
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            CivicFix connects citizen hazard reports with municipal public works crews.
            Equipped with two purpose-built portals for <strong className="text-teal-300">Residents</strong> and{' '}
            <strong className="text-amber-300">City Administrators</strong>.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                if (currentUser && currentUser.role === 'citizen') {
                  setActiveTab('citizen-dashboard');
                } else {
                  openLoginModal('citizen');
                }
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-slate-950" />
              <span>Citizen Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (currentUser && currentUser.role === 'administrator') {
                  setActiveTab('admin-dashboard');
                } else {
                  openLoginModal('administrator');
                }
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-sm border border-amber-400/40 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Portal (Command)</span>
            </button>

            <button
              onClick={() => setActiveTab('report-issue')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span>+ Report an Issue</span>
            </button>
          </div>

          {/* Live System Status Ticker */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>AI Engine: {aiStatus.isAiLive ? 'Neural Engine (Active)' : 'Civic AI Engine (Ready)'}</span>
            </div>
            <div>•</div>
            <div>Spatial De-duplication: Active</div>
            <div>•</div>
            <div>City Ops Center: Online</div>
          </div>
        </div>
      </section>

      {/* 2. Key Statistics Section */}
      <section className="relative -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Tracked</span>
              <Layers className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{complaints.length}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-teal-600 font-semibold">100% Verified</span> on municipal ledger
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Hazard Alerts</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-rose-600">{highPriorityCount}</div>
            <p className="text-xs text-slate-500 mt-1">High & Critical risks prioritized</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Field Crew</span>
              <Wrench className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-3xl font-extrabold text-cyan-700">{inProgressCount}</div>
            <p className="text-xs text-slate-500 mt-1">Work orders dispatched</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Resolved Cases</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">{resolvedCount}</div>
            <p className="text-xs text-slate-500 mt-1">Verified safe by inspectors</p>
          </div>
        </div>
      </section>

      {/* 3. Three-Step Workflow */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Frictionless Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How CivicFix Intelligence Works</h2>
          <p className="text-slate-600 text-sm">
            From citizen camera snapshot to city dispatch resolution in three transparent, automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-teal-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-extrabold text-lg mb-4 border border-teal-200/60">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Snap, Geotag & Describe</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens snap a photo of potholes, trash piles, or water main leaks. Automated geolocation pins the exact coordinates on OpenStreetMap.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-teal-700">
              <MapPin className="w-4 h-4 text-teal-600" /> Instant Geocoding
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-teal-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-extrabold text-lg mb-4 border border-cyan-200/60">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">AI Triage & De-duplication</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our Neural AI Core analyzes hazard severity, extracts safety risks, suggests municipal routing, and identifies existing duplicate reports within 1km.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-cyan-700">
              <Sparkles className="w-4 h-4 text-cyan-600" /> Explainable Priority Scoring
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-teal-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-extrabold text-lg mb-4 border border-emerald-200/60">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Municipal Dispatch & Proof</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              City dispatchers confirm work orders, route dedicated asphalt, plumbing, or lighting crews, and post verified before/after resolution logs.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transparent Civic Ledger
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Innovation Features */}
      <section className="py-16 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Architected for Modern Civic Technology
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Replacing opaque complaint black-holes with actionable intelligence for citizens and municipal staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Explainable AI Classification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rather than black-box labels, CivicFix provides transparent rationale: why a pothole or electrical wire is tagged high risk, and which department is accountable.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <CopyCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Spatial Duplicate Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Combines Haversine geographic radius calculation with deep semantic similarity to consolidate identical complaints into master tickets, preventing double dispatch.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Live OpenStreetMap Visualizer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time interactive Leaflet mapping allows citizens and city planners to view complaint clusters, hazardous zones, and active municipal repair progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 Verified Field Transformation: Interactive Before / After */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Resolution Auditing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              See the Real-World Impact: Before & After Field Resolution
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              CivicFix doesn't just register complaints—it closes the loop. Municipal contractors upload geolocation-tagged completion photography, which our neural engine audits against the original complaint to guarantee quality.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>Ticket #CF-1002 • 4th & Pine Critical Pothole repair</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>Turnaround Time: 18 hours from report to asphalt reseal</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <BeforeAfterSlider
              beforeImage="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
              afterImage="https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80"
              beforeLabel="Before: Deep Crater Hazard"
              afterLabel="After: Hot-Mix Asphalt Reseal"
              title="Drag to Compare: 4th & Pine Pothole"
              subtitle="Inspect the municipal crew repair quality"
            />
          </div>
        </div>
      </section>

      {/* 5. Live Recent Civic Reports Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Recent Public Reports</h2>
            <p className="text-xs text-slate-600 mt-1">Live complaints undergoing AI triage and field repair.</p>
          </div>
          <button
            onClick={() => setActiveTab('citizen-dashboard')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline"
          >
            <span>View All Public Issues</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentComplaints.map((c) => (
            <div
              key={c.id}
              onClick={() => viewComplaint(c.id)}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {c.id}
                    </span>
                    <CategoryBadge category={c.category} size="sm" />
                  </div>
                  <PriorityBadge priority={c.confirmedPriority} size="sm" />
                </div>

                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{c.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{c.description}</p>

                {/* AI Rationale tag */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-[11px] text-slate-600">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-1 italic">
                    AI Finding: {c.aiAnalysis.explanation}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{c.address}</span>
                </div>
                <StatusBadge status={c.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-[#10243A] text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                CF
              </div>
              <span className="text-white font-bold text-base tracking-tight">CivicFix Intelligence</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button onClick={() => setActiveTab('citizen-dashboard')} className="hover:text-white transition-colors">
                Citizen Portal
              </button>
              <button onClick={() => setActiveTab('report-issue')} className="hover:text-white transition-colors">
                Report Issue
              </button>
              <button onClick={() => setActiveTab('live-map')} className="hover:text-white transition-colors">
                Civic Map
              </button>
              <button onClick={() => setActiveTab('admin-dashboard')} className="hover:text-white transition-colors">
                Municipal Operations
              </button>
              <button onClick={() => setActiveTab('ai-panel')} className="hover:text-white transition-colors">
                AI Inspector
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© 2026 CivicFix Intelligence. Built with React, TypeScript, Leaflet, and CivicFix Neural AI Core.</p>
            <p>Designed for public infrastructure transparency and municipal efficiency.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
