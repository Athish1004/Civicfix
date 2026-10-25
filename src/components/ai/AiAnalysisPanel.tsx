import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Complaint } from '../../types';
import {
  Sparkles,
  Search,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Info,
  MapPin,
  Flame,
  Check,
  ChevronRight,
} from 'lucide-react';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';

export const AiAnalysisPanel: React.FC = () => {
  const { complaints, viewComplaint, aiStatus } = useCivic();
  const [selectedTicketId, setSelectedTicketId] = useState<string>(complaints[0]?.id || '');

  const currentComplaint = complaints.find((c) => c.id === selectedTicketId) || complaints[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Triage & Safety Inspector</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Explainable AI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deep inspection of category prediction confidence, hazard scoring matrices, token highlights, and human oversight safety rails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${aiStatus.isAiLive ? 'bg-emerald-400 animate-pulse' : 'bg-teal-400'}`}
            />
            <span>Active Model: {aiStatus.isAiLive ? 'CivicFix Neural Engine v3.8' : 'CivicFix Demo Engine'}</span>
          </div>
        </div>
      </div>

      {/* Mandatory Human Oversight Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold mb-0.5">Municipal AI Governance & Safety Mandate:</strong>
          All AI predictions, hazard scores, and duplicate detections are assistive recommendations designed to accelerate
          civic response. Final dispatch authorizations and status updates remain subject to human supervisor review.
        </div>
      </div>

      {/* Two Column Layout: Ticket Selector & Detailed AI Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket Picker Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Complaint To Inspect</span>
            <span className="text-[11px] font-mono text-slate-400">{complaints.length} tickets</span>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {complaints.map((c) => {
              const isSelected = c.id === currentComplaint?.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedTicketId(c.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all space-y-1 ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{c.id}</span>
                    <PriorityBadge priority={c.confirmedPriority} size="sm" />
                  </div>
                  <h4 className="font-bold text-slate-800 line-clamp-1">{c.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="capitalize">{c.category.replace('_', ' ')}</span>
                    <span className="font-mono text-teal-700">{Math.round(c.aiAnalysis.confidence * 100)}% conf</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed AI Findings Card */}
        {currentComplaint && (
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                      {currentComplaint.id}
                    </span>
                    <CategoryBadge category={currentComplaint.category} />
                    <StatusBadge status={currentComplaint.status} size="sm" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1.5">{currentComplaint.title}</h2>
                </div>

                <button
                  onClick={() => viewComplaint(currentComplaint.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Open Full Ticket</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Raw citizen input */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Raw Citizen Description
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  "{currentComplaint.description}"
                </p>
              </div>

              {/* AI Key Insights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Predicted Category
                  </span>
                  <div className="font-bold text-slate-900 capitalize text-sm">
                    {currentComplaint.aiAnalysis.category.replace('_', ' ')}
                  </div>
                  <span className="text-[11px] text-teal-700 font-mono block">
                    Confidence: {Math.round(currentComplaint.aiAnalysis.confidence * 100)}%
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Suggested Severity
                  </span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <PriorityBadge priority={currentComplaint.aiAnalysis.suggestedSeverity} />
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Confirmed: <strong className="text-slate-800 capitalize">{currentComplaint.confirmedPriority}</strong>
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Assigned Utility
                  </span>
                  <div className="font-bold text-slate-900 text-xs truncate">
                    {currentComplaint.aiAnalysis.routingDepartment}
                  </div>
                  <span className="text-[11px] text-slate-500 block">Municipal Bureau</span>
                </div>
              </div>

              {/* Explainable Rationale */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Explainable Priority Rationale
                </span>
                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-950 leading-relaxed font-medium">
                  {currentComplaint.aiAnalysis.explanation}
                </div>
              </div>

              {/* Relevant phrases extracted */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Salient Extracted Phrases
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentComplaint.aiAnalysis.keyPhrases.map((phrase, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono border border-slate-200"
                    >
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>

              {/* Safety Concerns & Next Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-rose-900">
                  <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Safety Hazards Flagged
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {currentComplaint.aiAnalysis.safetyConcerns.map((sc, i) => (
                      <li key={i}>{sc}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-slate-800">
                  <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Recommended Municipal Action
                  </span>
                  <p className="text-xs leading-relaxed">{currentComplaint.aiAnalysis.recommendedNextAction}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
