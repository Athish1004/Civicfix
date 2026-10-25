import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import {
  X,
  Database,
  Sparkles,
  Key,
  RotateCcw,
  CheckCircle,
  Copy,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

export const SetupModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { aiStatus, refreshAiStatus, resetDemoData, complaints } = useCivic();
  const [activeTab, setActiveTab] = useState<'overview' | 'supabase' | 'gemini'>('overview');
  const [copied, setCopied] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyEnv = () => {
    const text = `# CivicFix Intelligence Configuration
GEMINI_API_KEY="your_gemini_api_key_here"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    resetDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">CivicFix Intelligence Environment</h3>
              <p className="text-xs text-slate-500">AI Service, Supabase PostgreSQL, and Demo Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> System Status
          </button>
          <button
            onClick={() => setActiveTab('gemini')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'gemini'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Neural AI Core
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" /> Supabase Integration
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5 text-sm">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Engine</span>
                    {aiStatus.isAiLive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Live Model
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span> Demo Fallback
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-slate-900">{aiStatus.aiProvider}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {aiStatus.isAiLive
                      ? 'Connected to real server-side neural classification model.'
                      : 'Running deterministic rule-based triage for zero-key offline testing.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Records</span>
                    <span className="text-xs font-medium text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                      {complaints.length} tickets
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900">Session & LocalStorage</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Persisting full CRUD modifications, status changes, and duplicate resolutions.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/60">
                <h4 className="font-semibold text-teal-950 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                  <Shield className="w-4 h-4 text-teal-600" />
                  Hackathon Demonstration Ready
                </h4>
                <p className="text-xs text-teal-900 leading-relaxed">
                  The application is fully operational out-of-the-box. Citizen reporting, priority categorization,
                  duplicate detection, timeline tracking, and administrator review workflows function end-to-end.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {resetSuccess ? 'Restored Initial 20 Demo Tickets!' : 'Reset Demo Dataset (20 Records)'}
                </button>

                <button
                  onClick={refreshAiStatus}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Test Server Connectivity
                </button>
              </div>
            </div>
          )}

          {activeTab === 'gemini' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 text-sm">Server-Side Neural Triage Integration</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All AI inference is executed securely through the backend server at <code className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px]">/api/ai/classify</code> and <code className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px]">/api/ai/detect-duplicates</code>.
                  API keys are never exposed to browser bundles.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 font-sans text-xs">
                  <span>Backend Environment (.env)</span>
                  <button onClick={handleCopyEnv} className="flex items-center gap-1 text-teal-700 hover:underline">
                    {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-slate-800">
                  <span className="text-purple-600">GEMINI_API_KEY</span>="AIzaSy..."
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <p className="font-medium mb-1">Zero-key fallback safety:</p>
                If no key is configured in secrets, CivicFix uses an intelligent municipal deterministic engine that evaluates
                depth, hazard context, road type, and proximity to provide instant realistic triage results without failing.
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 text-sm">Supabase PostgreSQL Schema & RLS</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A complete PostgreSQL DDL schema with Row Level Security policies and geospatial indices has been generated at:
                  <code className="block mt-1 p-2 bg-slate-100 text-slate-800 rounded font-mono text-[11px]">
                    /src/db/supabase-schema.sql
                  </code>
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Database Tables Included:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong className="text-slate-800">profiles:</strong> Citizen and municipal administrator roles.</li>
                  <li><strong className="text-slate-800">complaints:</strong> Tickets with GPS coords, categories, and AI fields.</li>
                  <li><strong className="text-slate-800">complaint_updates:</strong> Immutable status audit trail.</li>
                  <li><strong className="text-slate-800">duplicate_suggestions:</strong> Pairwise similarity scores and review queue.</li>
                  <li><strong className="text-slate-800">citizen_notes:</strong> Public and reporter follow-up comments.</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <span>Schema file ready in repository</span>
                <span className="font-mono text-teal-700 font-medium">/src/db/supabase-schema.sql</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
