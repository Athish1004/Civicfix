import React, { useState, useMemo } from 'react';
import { useCivic } from '../../context/CivicContext';
import { ComplaintCategory, ComplaintStatus } from '../../types';
import {
  PlusCircle,
  Search,
  Filter,
  Layers,
  Clock,
  Wrench,
  CheckCircle2,
  Calendar,
  MapPin,
  ChevronRight,
  Sparkles,
  User,
  Globe,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { MonthlyResolutionGraph } from '../analytics/MonthlyResolutionGraph';

export const CitizenDashboard: React.FC = () => {
  const { complaints, currentUser, setActiveTab, viewComplaint } = useCivic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewScope, setViewScope] = useState<'mine' | 'all' | 'analytics'>('mine');

  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  // Filter complaints based on scope, search, category, status
  const filteredComplaints = useMemo(() => {
    return safeComplaints.filter((c) => {
      if (!c) return false;
      // Scope filter: my complaints vs all complaints
      if (viewScope === 'mine' && c.reporterId !== currentUser?.id) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && c.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && c.status !== selectedStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (c.id || '').toLowerCase().includes(q);
        const matchesTitle = (c.title || '').toLowerCase().includes(q);
        const matchesDesc = (c.description || '').toLowerCase().includes(q);
        const matchesAddress = (c.address || '').toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesDesc && !matchesAddress) {
          return false;
        }
      }

      return true;
    });
  }, [safeComplaints, currentUser?.id, viewScope, selectedCategory, selectedStatus, searchQuery]);

  // User personal counters
  const myComplaints = safeComplaints.filter((c) => c && c.reporterId === currentUser?.id);
  const totalReports = myComplaints.length;
  const openReports = myComplaints.filter((c) => c && (c.status === 'reported' || c.status === 'triaged')).length;
  const inProgressReports = myComplaints.filter((c) => c && (c.status === 'in_progress' || c.status === 'scheduled')).length;
  const resolvedReports = myComplaints.filter((c) => c && (c.status === 'resolved' || c.status === 'closed')).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Problem Tracker</h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              Live Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{currentUser?.name || 'Resident Citizen'}</strong> ({currentUser?.email || 'citizen@civicnet.org'}). Track and monitor civic issue resolutions.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('report-issue')}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </button>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
            <span>My Submitted Reports</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalReports}</div>
          <p className="text-[11px] text-slate-400 mt-1">Registered across all categories</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-purple-700 text-xs font-medium mb-1.5">
            <span>Open & Triaging</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-700">{openReports}</div>
          <p className="text-[11px] text-slate-400 mt-1">Under AI & dispatcher review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-cyan-700 text-xs font-medium mb-1.5">
            <span>Crew In Progress</span>
            <Wrench className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-700">{inProgressReports}</div>
          <p className="text-[11px] text-slate-400 mt-1">Assigned field work order</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium mb-1.5">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{resolvedReports}</div>
          <p className="text-[11px] text-slate-400 mt-1">Completed & verified safe</p>
        </div>
      </div>

      {/* Scope Switcher, Search, and Category Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Scope Toggle: My Reports vs Citywide Feed vs Monthly Intake vs Solved Graph */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewScope('mine')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewScope === 'mine'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Reports ({totalReports})</span>
            </button>
            <button
              onClick={() => setViewScope('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewScope === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All Public Reports ({complaints.length})</span>
            </button>
            <button
              onClick={() => setViewScope('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewScope === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              <span>Monthly Raised vs. Solved Graph</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword, street address..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Categories</option>
            <option value="road_damage">Road Damage</option>
            <option value="waste_management">Waste Management</option>
            <option value="water_leakage">Water Leakage</option>
            <option value="drainage">Drainage & Stormwater</option>
            <option value="streetlight_failure">Streetlight Failure</option>
            <option value="public_infrastructure">Public Infrastructure</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="triaged">AI Triaged</option>
            <option value="in_progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed / Merged</option>
          </select>

          {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="text-teal-700 hover:text-teal-800 text-xs underline font-medium"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-slate-400 text-xs">
            Showing <strong className="text-slate-800">{filteredComplaints.length}</strong> complaints
          </div>
        </div>
      </div>

      {/* View: Monthly Resolution Graph or Complaints List */}
      {viewScope === 'analytics' ? (
        <MonthlyResolutionGraph />
      ) : (
        /* Complaints List Table / Cards */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
            <h3 className="text-sm font-bold text-slate-900">No complaints found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {viewScope === 'mine'
                ? "You haven't submitted any complaints matching this filter yet, or try switching to 'All Public Reports'."
                : 'Try adjusting your search keywords or filter criteria.'}
            </p>
            {viewScope === 'mine' && (
              <button
                onClick={() => setActiveTab('report-issue')}
                className="mt-2 px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
              >
                Submit a New Complaint
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredComplaints.map((item) => (
              <div
                key={item.id}
                onClick={() => viewComplaint(item.id)}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Photo thumbnail or icon fallback */}
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                      <Layers className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.id}
                      </span>
                      <CategoryBadge category={item.category} size="sm" />
                      <PriorityBadge priority={item.confirmedPriority} size="sm" />
                      {item.isDuplicateOf && (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Merged Duplicate
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm truncate">{item.title}</h3>

                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.address}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1 text-teal-700 font-medium">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        {item.aiAnalysis.routingDepartment}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <StatusBadge status={item.status} />
                  <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
};
