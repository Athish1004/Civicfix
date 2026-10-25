import React, { useState, useMemo } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus, CivicInsights } from '../../types';
import { generateCivicInsights } from '../../services/aiService';
import {
  ShieldCheck,
  Search,
  Filter,
  BarChart3,
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CopyCheck,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  Loader2,
  FileText,
  AlertOctagon,
  Wrench,
  ArrowUpDown,
  RefreshCw,
  Truck,
} from 'lucide-react';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { MonthlyResolutionGraph } from '../analytics/MonthlyResolutionGraph';
import { CrewDispatchModal } from '../common/CrewDispatchModal';

export const AdminDashboard: React.FC = () => {
  const {
    complaints,
    duplicateSuggestions,
    currentUser,
    viewComplaint,
    updateComplaintStatus,
    resolveDuplicate,
    setActiveTab,
  } = useCivic();

  // Tab mode in admin dashboard: 'table' | 'duplicates' | 'insights' | 'analytics'
  const [adminTab, setAdminTab] = useState<'table' | 'duplicates' | 'insights' | 'analytics'>('table');

  // Search, filter, sorting, pagination for table
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'priority'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Civic Insights state
  const [insights, setInsights] = useState<CivicInsights | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Quick review modal
  const [quickReviewTicket, setQuickReviewTicket] = useState<Complaint | null>(null);
  const [quickStatus, setQuickStatus] = useState<ComplaintStatus>('triaged');
  const [quickPriority, setQuickPriority] = useState<ComplaintPriority>('medium');
  const [quickNote, setQuickNote] = useState('');
  const [dispatchTicket, setDispatchTicket] = useState<Complaint | null>(null);

  // Calculations
  const total = complaints.length;
  const unresolved = complaints.filter((c) => c.status !== 'resolved' && c.status !== 'closed').length;
  const criticalAndHigh = complaints.filter((c) => c.confirmedPriority === 'high' || c.confirmedPriority === 'critical').length;
  const resolved = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
  const pendingDuplicates = duplicateSuggestions.filter((d) => d.reviewStatus === 'pending');

  // Category distribution for analytics
  const categoryCounts: Record<ComplaintCategory, number> = {
    road_damage: 0,
    waste_management: 0,
    water_leakage: 0,
    drainage: 0,
    streetlight_failure: 0,
    public_infrastructure: 0,
    other: 0,
  };
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // Status distribution
  const statusCounts = {
    reported: complaints.filter((c) => c.status === 'reported').length,
    triaged: complaints.filter((c) => c.status === 'triaged').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    scheduled: complaints.filter((c) => c.status === 'scheduled').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    closed: complaints.filter((c) => c.status === 'closed').length,
  };

  // Filtered & sorted complaints
  const filteredComplaints = useMemo(() => {
    let result = complaints.filter((c) => {
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && c.confirmedPriority !== priorityFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.reporterName.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'priority') {
        const weights: Record<ComplaintPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return weights[b.confirmedPriority] - weights[a.confirmedPriority];
      }
      return 0;
    });

    return result;
  }, [complaints, categoryFilter, priorityFilter, statusFilter, searchQuery, sortBy]);

  // Paginated complaints
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredComplaints.slice(start, start + itemsPerPage);
  }, [filteredComplaints, currentPage]);

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const res = await generateCivicInsights(complaints);
      setInsights(res);
    } catch (e) {
      console.warn('Insights failed:', e);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleSaveQuickReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReviewTicket) return;
    updateComplaintStatus(quickReviewTicket.id, quickStatus, quickNote || 'Status updated via Operations Center quick triage.', quickPriority);
    setQuickReviewTicket(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Municipal Operations Center</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Dispatcher Command
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.department || 'Operations Team'}).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('live-map')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Open Civic Map</span>
          </button>
          <button
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {isGeneratingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>AI Executive Brief</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Intake</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Complaints filed on municipal ledger</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium mb-1">
            <span>Unresolved Queue</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{unresolved}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active tickets pending completion</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-medium mb-1">
            <span>Urgent Hazard Flags</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600">{criticalAndHigh}</div>
          <p className="text-[11px] text-slate-400 mt-1">High & Critical priority tickets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium mb-1">
            <span>Resolved Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{resolved}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {total > 0 ? Math.round((resolved / total) * 100) : 0}% completion pace
          </p>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div className="flex border-b border-slate-200 space-x-1 sm:space-x-4">
        <button
          onClick={() => setAdminTab('table')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            adminTab === 'table'
              ? 'border-teal-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-teal-600" />
          <span>Ticket Management ({complaints.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('duplicates')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            adminTab === 'duplicates'
              ? 'border-teal-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CopyCheck className="w-4 h-4 text-purple-600" />
          <span>Duplicate Review Queue</span>
          {pendingDuplicates.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {pendingDuplicates.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('analytics')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            adminTab === 'analytics'
              ? 'border-teal-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-sky-600" />
          <span>Municipal Charts</span>
        </button>

        <button
          onClick={() => setAdminTab('insights')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            adminTab === 'insights'
              ? 'border-teal-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>AI Insights Brief</span>
        </button>
      </div>

      {/* TAB 1: Complaints Management Table */}
      {adminTab === 'table' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search ticket ID, title, street..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="road_damage">Road Damage</option>
                <option value="waste_management">Waste Management</option>
                <option value="water_leakage">Water Leakage</option>
                <option value="drainage">Drainage & Storm</option>
                <option value="streetlight_failure">Streetlight</option>
                <option value="public_infrastructure">Public Infra</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="triaged">Triaged</option>
                <option value="in_progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="priority">Highest Priority</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">ID & Date</th>
                    <th className="px-4 py-3">Problem Title & Location</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">AI / Confirmed Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedComplaints.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{item.id}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{item.address}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <CategoryBadge category={item.category} size="sm" />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PriorityBadge priority={item.confirmedPriority} size="sm" />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => setDispatchTicket(item)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors shadow-2xs inline-flex items-center gap-1"
                          title="Simulate 1-Click Crew Dispatch"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Dispatch</span>
                        </button>
                        <button
                          onClick={() => {
                            setQuickReviewTicket(item);
                            setQuickStatus(item.status);
                            setQuickPriority(item.confirmedPriority);
                            setQuickNote('');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-colors"
                        >
                          Triage
                        </button>
                        <button
                          onClick={() => viewComplaint(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} tickets
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="px-2 font-mono text-slate-800">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Duplicate Review Queue */}
      {adminTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex items-center justify-between text-xs text-purple-900">
            <div>
              <h3 className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
                <CopyCheck className="w-4 h-4 text-purple-600" />
                AI Spatial & Semantic Duplicate Review Queue
              </h3>
              <p className="mt-0.5 text-purple-800">
                AI cross-references report locations within 1200m radius and text semantics to identify duplicate calls,
                preventing double-dispatch of municipal work crews.
              </p>
            </div>
            <span className="font-mono text-xs font-bold bg-white px-3 py-1 rounded-lg border border-purple-200 text-purple-800">
              {duplicateSuggestions.length} pairs logged
            </span>
          </div>

          <div className="space-y-3">
            {duplicateSuggestions.map((dup) => {
              const source = complaints.find((c) => c.id === dup.sourceComplaintId);
              const matched = complaints.find((c) => c.id === dup.matchedComplaintId);

              return (
                <div
                  key={dup.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4"
                >
                  {/* Top Header of duplicate card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xs">
                        {dup.similarityScore}% Match
                      </span>
                      <span className="text-xs text-slate-500">
                        Proximity: <strong className="text-slate-800">{dup.geographicDistanceMeters}m</strong> apart
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Review Status:</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          dup.reviewStatus === 'confirmed_duplicate'
                            ? 'bg-emerald-100 text-emerald-800'
                            : dup.reviewStatus === 'rejected'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {dup.reviewStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* AI Reason */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">AI Match Explanation: </span>
                      {dup.reason}
                    </div>
                  </div>

                  {/* Side by side comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Source complaint */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          Incoming: #{dup.sourceComplaintId}
                        </span>
                        <StatusBadge status={source?.status || 'reported'} size="sm" />
                      </div>
                      <h4 className="font-bold text-slate-900">{source?.title || 'Complaint'}</h4>
                      <p className="text-slate-600 line-clamp-2">{source?.description}</p>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{source?.address}</span>
                      </div>
                    </div>

                    {/* Matched complaint */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          Existing: #{dup.matchedComplaintId}
                        </span>
                        <StatusBadge status={matched?.status || 'reported'} size="sm" />
                      </div>
                      <h4 className="font-bold text-slate-900">{matched?.title || 'Complaint'}</h4>
                      <p className="text-slate-600 line-clamp-2">{matched?.description}</p>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{matched?.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Administrator Action buttons */}
                  {dup.reviewStatus === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => resolveDuplicate(dup.id, 'reject')}
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                      >
                        Keep Separate (False Positive)
                      </button>
                      <button
                        onClick={() => resolveDuplicate(dup.id, 'confirm_merge')}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Duplicate & Merge Ticket</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Municipal Visual Charts */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          {/* Spotlight Single Graph: Problems Raised vs Solved in a Month */}
          <MonthlyResolutionGraph />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" /> Complaints by Category
              </h3>

              <div className="space-y-3 pt-2">
                {Object.entries(categoryCounts).map(([catKey, count]) => {
                  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={catKey} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700">
                        <span className="capitalize">{catKey.replace('_', ' ')}</span>
                        <span className="font-mono font-bold">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Distribution Donut / Progress */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-600" /> Municipal Resolution Pipeline
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Reported (Raw)</div>
                  <div className="text-2xl font-bold text-slate-900">{statusCounts.reported}</div>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="text-purple-700 text-[11px]">AI Triaged</div>
                  <div className="text-2xl font-bold text-purple-800">{statusCounts.triaged}</div>
                </div>
                <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                  <div className="text-cyan-700 text-[11px]">Field In Progress</div>
                  <div className="text-2xl font-bold text-cyan-800">{statusCounts.in_progress}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="text-emerald-700 text-[11px]">Resolved & Verified</div>
                  <div className="text-2xl font-bold text-emerald-800">{statusCounts.resolved}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Target SLA Resolution Velocity</span>
                  <span className="font-bold text-emerald-600">89% on track</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '89%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Civic Insights AI Brief */}
      {adminTab === 'insights' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Civic Insights Intelligence Brief</h3>
                <p className="text-xs text-slate-500">
                  Automated macro-analysis of trends, bottleneck corridors, and resource reallocation
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsights}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
            >
              {isGeneratingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>{insights ? 'Regenerate Analysis' : 'Generate Briefing'}</span>
            </button>
          </div>

          {!insights ? (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-teal-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Synthesize Municipal Civic Intelligence</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click above to analyze all active complaints across wards. The AI will synthesize major complaint clusters,
                identify repetitive hazard hotspots, and suggest workforce reassignments.
              </p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-teal-950 text-[11px]">
                    Executive Summary
                  </span>
                  <span className="font-mono text-[10px] text-teal-700">
                    {new Date(insights.generatedAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-teal-900 leading-relaxed text-sm">{insights.executiveSummary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Identified Hazard Hotspots
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                    {insights.identifiedHotspots.map((spot, i) => (
                      <li key={i}>{spot}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-teal-900 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-teal-600" />
                    Resource Reallocation Recommendations
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                    {insights.resourceRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold block text-slate-900">Projected Resolution Pace:</span>
                  <span>{insights.projectedResolutionPace}</span>
                </div>
                <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                  {insights.isRealAi ? 'CivicFix Neural Core' : 'Civic AI Engine'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Review Modal */}
      {quickReviewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {quickReviewTicket.id}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{quickReviewTicket.title}</h3>
              </div>
              <button
                onClick={() => setQuickReviewTicket(null)}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickReview} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={quickStatus}
                  onChange={(e) => setQuickStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="reported">Reported</option>
                  <option value="triaged">Triaged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Priority</label>
                <select
                  value={quickPriority}
                  onChange={(e) => setQuickPriority(e.target.value as ComplaintPriority)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Update Note</label>
                <input
                  type="text"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="Official audit log comment..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickReviewTicket(null)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                >
                  Save Triage Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click Crew Dispatch Simulator Modal */}
      <CrewDispatchModal
        complaint={dispatchTicket}
        isOpen={Boolean(dispatchTicket)}
        onClose={() => setDispatchTicket(null)}
      />
    </div>
  );
};
