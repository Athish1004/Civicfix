import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { ComplaintPriority, ComplaintStatus } from '../../types';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  ExternalLink,
  Edit3,
  CopyCheck,
  Building,
  Truck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { CrewDispatchModal } from '../common/CrewDispatchModal';
import { BeforeAfterSlider } from '../common/BeforeAfterSlider';

export const ComplaintDetailsPage: React.FC = () => {
  const {
    selectedComplaintId,
    complaints,
    duplicateSuggestions,
    currentUser,
    setActiveTab,
    viewComplaint,
    updateComplaintStatus,
    addCitizenNote,
    resolveDuplicate,
  } = useCivic();

  const complaint = complaints.find((c) => c.id === selectedComplaintId);

  // Local admin update states
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint?.status || 'reported');
  const [newPriority, setNewPriority] = useState<ComplaintPriority>(complaint?.confirmedPriority || 'medium');
  const [adminNote, setAdminNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Citizen note state
  const [citizenNoteInput, setCitizenNoteInput] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleAudioBriefing = () => {
    if (!complaint || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = `CivicFix AI Safety Triage for ticket ${complaint.id}. Categorized as ${complaint.category.replace('_', ' ')}. Recommended Priority is ${complaint.suggestedPriority}. Hazard analysis: ${complaint.aiAnalysis.explanation}. Assigned to ${complaint.aiAnalysis.routingDepartment}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!complaint) {
    return (
      <div className="p-12 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">The ticket may have been deleted or the link is invalid.</p>
        <button
          onClick={() => setActiveTab('citizen-dashboard')}
          className="px-4 py-2 text-xs font-semibold bg-teal-500 text-slate-900 rounded-lg hover:bg-teal-400"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Find duplicates involving this complaint
  const relatedDuplicates = duplicateSuggestions.filter(
    (d) => d.sourceComplaintId === complaint.id || d.matchedComplaintId === complaint.id
  );

  const handleAdminStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    updateComplaintStatus(complaint.id, newStatus, adminNote, newPriority);
    setAdminNote('');
    setIsUpdatingStatus(false);
  };

  const handleCitizenNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenNoteInput.trim()) return;
    setIsAddingNote(true);
    addCitizenNote(complaint.id, citizenNoteInput);
    setCitizenNoteInput('');
    setIsAddingNote(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top back button and header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab(currentUser.role === 'administrator' ? 'admin-dashboard' : 'citizen-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {currentUser.role === 'administrator' ? 'Operations' : 'My Dashboard'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Viewing as:</span>
          <span className="text-xs font-bold text-slate-800 capitalize bg-slate-100 px-2 py-0.5 rounded">
            {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      {/* Main Ticket Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                {complaint.id}
              </span>
              <CategoryBadge category={complaint.category} />
              <PriorityBadge priority={complaint.confirmedPriority} />
              {complaint.isDuplicateOf && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                  Merged into #{complaint.isDuplicateOf}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-1">{complaint.title}</h1>
          </div>

          <StatusBadge status={complaint.status} size="md" />
        </div>

        {/* Location & Metadata bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="truncate">
              <div className="font-medium text-slate-900 truncate">{complaint.address}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <div className="font-medium text-slate-900">
                {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="text-[11px] text-slate-400">
                {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <div className="font-medium text-slate-900">{complaint.reporterName}</div>
              <div className="text-[11px] text-slate-400 truncate">{complaint.reporterEmail}</div>
            </div>
          </div>
        </div>

        {/* Description & Photo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen Problem Description</h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {complaint.description}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Photo Evidence</h3>
            {complaint.imageUrl ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                <img
                  src={complaint.imageUrl}
                  alt={complaint.title}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
            ) : (
              <div className="h-48 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No photo provided</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Findings Card */}
      <div className="bg-white rounded-2xl border border-teal-200/80 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Intelligence Triage Report</h2>
              <span className="text-[10px] text-slate-500 font-mono">Engine: {complaint.aiAnalysis.model}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleAudioBriefing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isSpeaking
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
              }`}
              title="Listen to synthesized AI triage briefing"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-teal-600" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Listen to Briefing'}</span>
            </button>

            <span className="text-slate-500">Confidence:</span>
            <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {Math.round(complaint.aiAnalysis.confidence * 100)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Explainable Priority Rationale:</span>
              <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {complaint.aiAnalysis.explanation}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Key Phrases Identified:</span>
              <div className="flex flex-wrap gap-1.5">
                {complaint.aiAnalysis.keyPhrases.map((phrase, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                    "{phrase}"
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="font-bold text-rose-800 block mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Public Safety Hazards:
              </span>
              <ul className="list-disc list-inside space-y-1 bg-rose-50/50 p-3 rounded-xl border border-rose-100 text-rose-900">
                {complaint.aiAnalysis.safetyConcerns.map((hazard, i) => (
                  <li key={i}>{hazard}</li>
                ))}
              </ul>
            </div>

            <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100">
              <span className="font-bold text-teal-950 block mb-0.5">Assigned Routing & Dispatch:</span>
              <p className="font-semibold text-teal-900 text-xs">{complaint.aiAnalysis.routingDepartment}</p>
              <p className="text-teal-800 text-[11px] mt-0.5">{complaint.aiAnalysis.recommendedNextAction}</p>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100">
          Disclaimer: AI triage metrics assist municipal dispatchers. Human review is required before work orders are officially executed.
        </div>
      </div>

      {/* Administrator Action Bar (Visible when in Administrator Role) */}
      {currentUser.role === 'administrator' && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Municipal Dispatcher Controls</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDispatchModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-md"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Simulate Field Crew Dispatch</span>
              </button>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Authorized Staff
              </span>
            </div>
          </div>

          <form onSubmit={handleAdminStatusSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="reported">Reported (Pending Triage)</option>
                  <option value="triaged">AI Triaged (Confirmed)</option>
                  <option value="in_progress">In Progress (Crew Dispatched)</option>
                  <option value="scheduled">Scheduled (Calendar Allocated)</option>
                  <option value="resolved">Resolved (Repairs Complete)</option>
                  <option value="closed">Closed / Consolidated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirmed Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as ComplaintPriority)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="low">Low (Standard maintenance queue)</option>
                  <option value="medium">Medium (Requires attention within 48h)</option>
                  <option value="high">High (Urgent road/health risk within 12h)</option>
                  <option value="critical">Critical (Immediate life/safety emergency)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Official Municipal Audit Note</label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Work order #4492 issued to Asphalt Unit 2; repair scheduled for 09:00 tomorrow."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Status & Priority Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Duplicate / Related Complaints Section */}
      {relatedDuplicates.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CopyCheck className="w-4 h-4 text-purple-600" />
              Potential Related / Duplicate Reports ({relatedDuplicates.length})
            </h3>
          </div>

          <div className="space-y-2">
            {relatedDuplicates.map((dup) => {
              const otherId = dup.sourceComplaintId === complaint.id ? dup.matchedComplaintId : dup.sourceComplaintId;
              const otherTicket = complaints.find((c) => c.id === otherId);

              return (
                <div
                  key={dup.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        #{otherId}
                      </span>
                      <span className="font-semibold text-slate-800">{otherTicket?.title || 'Related Complaint'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                        {dup.similarityScore}% match
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{dup.reason}</p>
                    <div className="text-[10px] text-slate-400">
                      Geographic distance: ~{dup.geographicDistanceMeters}m away • Status:{' '}
                      <strong className="text-slate-700 capitalize">{dup.reviewStatus.replace('_', ' ')}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => viewComplaint(otherId)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Inspect Case
                    </button>

                    {currentUser.role === 'administrator' && dup.reviewStatus === 'pending' && (
                      <button
                        onClick={() => resolveDuplicate(dup.id, 'confirm_merge')}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                      >
                        Merge as Duplicate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chronological Status Timeline & Citizen Comments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Audit Timeline Log</h3>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {complaint.updates.map((update, idx) => (
              <div key={update.id || idx} className="relative text-xs space-y-1">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{update.actorName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(update.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                    {update.actorRole}
                  </span>
                  <StatusBadge status={update.newStatus} size="sm" />
                </div>
                <p className="text-slate-600 text-xs pt-0.5">{update.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Citizen Additional Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Citizen Follow-Up Notes</h3>
            </div>

            {complaint.citizenNotes.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No citizen updates added yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {complaint.citizenNotes.map((note) => (
                  <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{note.authorName}</span>
                      <span className="text-slate-400 font-mono">
                        {new Date(note.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700">{note.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add note input */}
          <form onSubmit={handleCitizenNoteSubmit} className="pt-3 border-t border-slate-100 space-y-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Add More Information or Update
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={citizenNoteInput}
                onChange={(e) => setCitizenNoteInput(e.target.value)}
                placeholder="e.g. Crew arrived on site, or leak has spread further..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={!citizenNoteInput.trim() || isAddingNote}
                className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Before / After Resolution Inspection for resolved tickets */}
      {(complaint.status === 'resolved' || complaint.id === 'CF-1002') && (
        <BeforeAfterSlider
          beforeImage={complaint.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'}
          afterImage="https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80"
          beforeLabel="Reported Hazard State"
          afterLabel="Verified Contractor Completion"
          title={`Ticket #${complaint.id} Verification Audit`}
          subtitle="Drag the slider to compare before-and-after photo verification"
        />
      )}

      {/* 1-Click Simulated Field Crew Dispatch Modal */}
      <CrewDispatchModal
        complaint={complaint}
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
      />
    </div>
  );
};
