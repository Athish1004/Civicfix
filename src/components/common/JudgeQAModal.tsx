import React, { useState } from 'react';
import {
  X,
  Award,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Smartphone,
  Compass,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

interface JudgeQAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JudgeQAModal: React.FC<JudgeQAModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'why_us' | 'features' | 'next_steps' | 'future_roadmap'>('why_us');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyPitchText = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#10243A] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Hackathon Pitch & Evaluator Q&A Guide</h3>
              <p className="text-[11px] text-teal-300">Executive talking points, competitive edge & future vision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => setActiveTab('why_us')}
            className={`pb-2.5 px-3 font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'why_us'
                ? 'border-teal-600 text-teal-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> 1. Why CivicFix vs Other Apps?
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-2.5 px-3 font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'border-teal-600 text-teal-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 2. Key Features
          </button>
          <button
            onClick={() => setActiveTab('next_steps')}
            className={`pb-2.5 px-3 font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'next_steps'
                ? 'border-teal-600 text-teal-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> 3. Further Developments
          </button>
          <button
            onClick={() => setActiveTab('future_roadmap')}
            className={`pb-2.5 px-3 font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'future_roadmap'
                ? 'border-teal-600 text-teal-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> 4. Future Vision & Ideas
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed flex-1">
          {/* TAB 1: Why Us Over Other Apps */}
          {activeTab === 'why_us' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200">
                <span className="font-bold text-teal-950 text-xs block mb-1">
                  Elevator Pitch (30-Second Summary):
                </span>
                <p className="text-teal-900 text-xs">
                  "Most civic complaint systems like standard 311 apps are digital suggestion boxes where complaints
                  enter a black hole. CivicFix turns complaints into <strong>intelligent, verified work orders</strong> by
                  combining <strong>explainable AI hazard scoring</strong>, <strong>spatial duplicate prevention</strong>,
                  and <strong>transparent timeline tracking</strong> — reducing municipal dispatch overhead by up to 20%."
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Key Competitive Differentiators:</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Spatial & Semantic De-duplication
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Traditional apps treat 50 reports of the same burst pipe as 50 separate tickets. CivicFix detects geographic proximity (Haversine formula) and semantic similarity to merge duplicates into master work orders.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Explainable AI (Not Black-Box)
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Instead of arbitrary labels, our AI outputs tangible safety hazards (e.g. "evasive swerving into bike lanes" or "sub-pavement sinkhole formation"), confidence metrics, and human-in-the-loop oversight.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Zero-Friction Citizen Experience
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      One-click AI category detection, automatic GPS coordinate pinning, and live duplicate warnings before hitting submit prevent citizen frustration.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Production Full-Stack Architecture
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Full Express backend with server-side Neural AI pipeline, transparent deterministic fallback, and full Supabase PostgreSQL DDL schema with Row Level Security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Key Features */}
          {activeTab === 'features' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Top 6 Core Features Implemented:</h4>

              <div className="space-y-2">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900">AI Complaint Classification & Severity Scoring:</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Classifies unformatted citizen text into 6 categories (Road Damage, Water Leakage, Drainage, Waste, Streetlights, Infrastructure) and assigns Low/Medium/High/Critical severity with reasoning.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900">Pre- & Post-Submission Duplicate Detection:</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Warns citizens before submitting if a matching issue is within 1km. For administrators, an automated Duplicate Review Queue offers side-by-side comparison and 1-click merging.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900">Live Geospatial OpenStreetMap Visualizer:</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Interactive Leaflet map displaying real-time colored pins by status and severity, click-to-preview drawers, and an accessible fallback grid.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <strong className="text-slate-900">Chronological Immutable Audit Ledger:</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Tracks every state transition (Reported $\rightarrow$ Triaged $\rightarrow$ In Progress $\rightarrow$ Scheduled $\rightarrow$ Resolved), timestamp, actor identity, and official work notes.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    5
                  </div>
                  <div>
                    <strong className="text-slate-900">AI Civic Insights Intelligence Generator:</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Generates macro-level municipal executive briefings identifying geographical hazard hotspots and recommending field crew reallocations.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    6
                  </div>
                  <div>
                    <strong className="text-slate-900">Multi-Persona Role-Based Access Control:</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Instant toggle between Citizen (Jane Doe) and Municipal Dispatcher (Officer Marcus Vance) with corresponding permission boundaries.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Further Developments */}
          {activeTab === 'next_steps' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Immediate Post-Hackathon Developments:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-teal-600" />
                    WhatsApp & SMS 2-Way Bot
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Enable low-bandwidth and elderly citizens to text a photo and pin location via WhatsApp or SMS, converted automatically via webhook into a CivicFix ticket.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    Multimodal Vision Crack & Depth Estimation
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Leverage advanced multimodal computer vision to measure crater depth in inches, identify exposed rebar, and verify asphalt deterioration directly from photos.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-600" />
                    Municipal ERP Connectors (SAP / Cityworks)
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Bi-directional sync with government work order systems (ServiceNow, Cityworks, Cartegraph) so resolving a ticket in city software auto-updates CivicFix.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Field Crew Mobile Offline PWA
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Dedicated offline-capable tablet app for asphalt and plumbing crews to view route optimized stops, upload "Before/After" photos, and log material usage.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Future Roadmap & Moonshots */}
          {activeTab === 'future_roadmap' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Visionary & High-Impact Future Features:</h4>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-teal-200 bg-teal-50/50 space-y-1">
                  <div className="font-bold text-teal-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    1. Predictive Infrastructure Maintenance AI
                  </div>
                  <p className="text-teal-900 text-[11px]">
                    Correlate weather precipitation and freeze-thaw temperature drops with historical pipe burst records to predict which road blocks will fail <em>before</em> they collapse, enabling proactive municipal patching.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 space-y-1">
                  <div className="font-bold text-purple-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    2. Gamified Citizen "Civic Karma" & Tax/Utility Credits
                  </div>
                  <p className="text-purple-900 text-[11px]">
                    Reward citizens for verified reports and neighborhood cleanups with Civic Karma badges, discounted public transit passes, or small credits on local municipal water bills.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-sky-200 bg-sky-50/50 space-y-1">
                  <div className="font-bold text-sky-950 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-sky-600" />
                    3. Multilingual Voice-to-Action for Senior Citizens
                  </div>
                  <p className="text-sky-900 text-[11px]">
                    Deploy speech-to-text reporting supporting 30+ regional languages and dialects so anyone can simply speak over the phone without needing to type or navigate an interface.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    4. Crowdsourced Peer Verification Loop
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    When a contractor marks a pothole "Resolved", a notification pings 3 nearby citizens asking <em>"Has this been fixed?"</em>. Only after 2 citizen confirmations is the work order formally paid out and closed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">Designed for live presentation and judge evaluation</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
