import React, { useEffect, useRef, useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../types';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  LayoutGrid,
  Map as MapIcon,
  ChevronRight,
} from 'lucide-react';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../common/Badge';

export const LiveCivicMap: React.FC = () => {
  const { complaints, viewComplaint, sidebarOpen } = useCivic();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeViewMode, setActiveViewMode] = useState<'map' | 'fallback_grid'>('map');
  const [mapError, setMapError] = useState(false);
  const [selectedPinComplaint, setSelectedPinComplaint] = useState<Complaint | null>(null);
  const [hoveredPinComplaint, setHoveredPinComplaint] = useState<Complaint | null>(null);

  // Filter complaints
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const filteredComplaints = safeComplaints.filter((c) => {
    if (!c) return false;
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && c.confirmedPriority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (c.title || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        (c.id || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Invalidate map size when Dashboard Nav opens or closes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        try {
          mapInstanceRef.current?.invalidateSize();
        } catch (e) {
          // ignore
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [sidebarOpen]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (activeViewMode !== 'map' || !mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        // Clear any dangling leaflet id to avoid initialization crash
        if ((mapContainerRef.current as any)._leaflet_id) {
          (mapContainerRef.current as any)._leaflet_id = null;
        }

        // Center around Civic Center (37.7758, -122.4182)
        const map = L.map(mapContainerRef.current, {
          center: [37.7758, -122.4182],
          zoom: 14,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.error('Leaflet initialization failed:', err);
      setMapError(true);
      setActiveViewMode('fallback_grid');
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [activeViewMode]);

  // Update map markers when filters or complaints change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const getStatusMeta = (status: ComplaintStatus, priority: ComplaintPriority) => {
      if (priority === 'critical') {
        return {
          label: 'Critical Hazard Alert',
          pinColor: '#e11d48', // Red
          bg: '#ffe4e6',
          textColor: '#9f1239',
          border: '#fecdd3',
          badgeText: 'Critical Alert',
          dotColor: '#e11d48',
        };
      }
      switch (status) {
        case 'in_progress':
          return {
            label: 'In Progress (Active Dispatch)',
            pinColor: '#0284c7', // Blue
            bg: '#e0f2fe',
            textColor: '#0369a1',
            border: '#bae6fd',
            badgeText: 'In Progress (Blue)',
            dotColor: '#0284c7',
          };
        case 'scheduled':
          return {
            label: 'Crew Scheduled',
            pinColor: '#0284c7', // Blue
            bg: '#e0f2fe',
            textColor: '#0369a1',
            border: '#bae6fd',
            badgeText: 'Crew Scheduled',
            dotColor: '#0284c7',
          };
        case 'resolved':
          return {
            label: 'Resolved & Verified Safe',
            pinColor: '#059669', // Emerald Green
            bg: '#d1fae5',
            textColor: '#065f46',
            border: '#a7f3d0',
            badgeText: 'Resolved (Green)',
            dotColor: '#059669',
          };
        case 'triaged':
          return {
            label: 'AI Triaged (Confirmed)',
            pinColor: '#9333ea', // Purple
            bg: '#f3e8ff',
            textColor: '#6b21a8',
            border: '#e9d5ff',
            badgeText: 'AI Triaged (Purple)',
            dotColor: '#9333ea',
          };
        case 'closed':
          return {
            label: 'Closed / Merged',
            pinColor: '#64748b', // Slate
            bg: '#f1f5f9',
            textColor: '#475569',
            border: '#e2e8f0',
            badgeText: 'Closed',
            dotColor: '#64748b',
          };
        default:
          return {
            label: 'Reported (Pending Review)',
            pinColor: '#ea580c', // Orange
            bg: '#ffedd5',
            textColor: '#9a3412',
            border: '#fed7aa',
            badgeText: 'Reported (Orange)',
            dotColor: '#ea580c',
          };
      }
    };

    filteredComplaints.forEach((c) => {
      const meta = getStatusMeta(c.status, c.confirmedPriority);
      const icon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${meta.pinColor};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.15s ease;
          " class="hover:scale-125">
            ${c.confirmedPriority === 'critical' ? '!' : '•'}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([c.latitude, c.longitude], { icon });

      // Rich hover tooltip showing basic details & status
      const tooltipHtml = `
        <div style="padding: 10px 12px; font-size: 11px; font-family: system-ui, -apple-system, sans-serif; min-width: 230px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-family: monospace; font-weight: 800; color: #0f172a; font-size: 10px;">${c.id}</span>
            <span style="background-color: ${meta.bg}; color: ${meta.textColor}; border: 1px solid ${meta.border}; padding: 2px 7px; border-radius: 9999px; font-weight: 700; font-size: 10px; display: inline-flex; align-items: center; gap: 4px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background-color: ${meta.dotColor};"></span>
              ${meta.label}
            </span>
          </div>
          <div style="font-weight: 700; color: #0f172a; font-size: 12px; line-height: 1.35; margin-bottom: 4px;">
            ${c.title}
          </div>
          <div style="color: #64748b; font-size: 10px; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <span>📍 ${c.address}</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 5px; font-size: 10px;">
            <span style="color: #475569; font-weight: 600; text-transform: capitalize;">Category: ${c.category.replace('_', ' ')}</span>
            <span style="color: ${c.confirmedPriority === 'critical' ? '#e11d48' : '#0284c7'}; font-weight: 700; text-transform: capitalize;">
              ${c.confirmedPriority} Priority
            </span>
          </div>
          <div style="margin-top: 5px; font-size: 9px; color: #0d9488; font-weight: 600; text-align: center; background-color: #f0fdfa; padding: 2px 4px; border-radius: 4px;">
            👉 Click to inspect case details
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipHtml, {
        direction: 'top',
        offset: [0, -14],
        className: 'civic-map-tooltip',
        opacity: 1,
        sticky: false,
      });

      // Hover events to also update on-map HUD bar
      marker.on('mouseover', () => {
        setHoveredPinComplaint(c);
      });

      marker.on('mouseout', () => {
        setHoveredPinComplaint(null);
      });

      marker.on('click', () => {
        setSelectedPinComplaint(c);
      });

      marker.addTo(markersLayerRef.current!);
    });

    // Auto-fit bounds if markers exist
    if (filteredComplaints.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(filteredComplaints.map((c) => [c.latitude, c.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [filteredComplaints, activeViewMode]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Civic Problem Map</h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              OpenStreetMap
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geospatial visualization of potholes, sewage leaks, electrical hazards, and municipal repairs.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeViewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>
          <button
            onClick={() => setActiveViewMode('fallback_grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeViewMode === 'fallback_grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Accessible Grid View</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search map by title, street, or ticket ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Hazard</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="triaged">Triaged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            {(selectedCategory !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedPriority('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="text-teal-700 hover:text-teal-800 text-xs underline font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          <span className="text-slate-400">Map Legend:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" /> Critical Hazard
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Reported / High
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> AI Triaged
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> In Progress / Crew
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Resolved Safe
          </span>
          <span className="ml-auto text-slate-400">
            Displaying <strong className="text-slate-800">{filteredComplaints.length}</strong> geocoded points
          </span>
        </div>
      </div>

      {/* Main Map or Fallback View */}
      {activeViewMode === 'map' && !mapError ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md h-[560px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Top Live Hover HUD Info Bar */}
          {hoveredPinComplaint && (
            <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-lg z-[1000] animate-in fade-in slide-in-from-top-2 duration-100 flex items-center gap-3">
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    hoveredPinComplaint.confirmedPriority === 'critical'
                      ? '#e11d48'
                      : hoveredPinComplaint.status === 'resolved'
                      ? '#059669'
                      : hoveredPinComplaint.status === 'in_progress' || hoveredPinComplaint.status === 'scheduled'
                      ? '#0284c7'
                      : hoveredPinComplaint.status === 'triaged'
                      ? '#9333ea'
                      : '#ea580c',
                }}
              />
              <div className="min-w-0 flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded">
                    {hoveredPinComplaint.id}
                  </span>
                  <span className="font-bold text-slate-900 truncate">{hoveredPinComplaint.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span>
                    Status:{' '}
                    <strong
                      className={
                        hoveredPinComplaint.status === 'in_progress'
                          ? 'text-sky-600 font-bold'
                          : hoveredPinComplaint.status === 'resolved'
                          ? 'text-emerald-600 font-bold'
                          : hoveredPinComplaint.confirmedPriority === 'critical'
                          ? 'text-rose-600 font-bold'
                          : 'text-slate-800 font-bold'
                      }
                    >
                      {hoveredPinComplaint.status.replace('_', ' ')}
                      {hoveredPinComplaint.status === 'in_progress' ? ' (Blue)' : ''}
                      {hoveredPinComplaint.status === 'resolved' ? ' (Green)' : ''}
                      {hoveredPinComplaint.confirmedPriority === 'critical' ? ' (Critical Red)' : ''}
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="truncate">{hoveredPinComplaint.address}</span>
                </div>
              </div>
            </div>
          )}

          {/* Floating Selected Pin Card Drawer */}
          {selectedPinComplaint && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200 shadow-2xl z-[1000] animate-in fade-in slide-in-from-bottom-4 duration-150 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedPinComplaint.id}
                  </span>
                  <CategoryBadge category={selectedPinComplaint.category} size="sm" />
                </div>
                <button
                  onClick={() => setSelectedPinComplaint(null)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  ✕ Close
                </button>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedPinComplaint.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{selectedPinComplaint.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <PriorityBadge priority={selectedPinComplaint.confirmedPriority} size="sm" />
                <StatusBadge status={selectedPinComplaint.status} size="sm" />
              </div>

              <button
                onClick={() => viewComplaint(selectedPinComplaint.id)}
                className="w-full py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full Case Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Accessible Fallback Grid View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Accessible Civic Location Feed</h3>
              <p className="text-xs text-slate-500">
                Text and coordinate based view for fast accessibility and offline situations.
              </p>
            </div>
            <button
              onClick={() => {
                setMapError(false);
                setActiveViewMode('map');
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100"
            >
              Try Reloading Map
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => viewComplaint(c.id)}
                className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all cursor-pointer bg-slate-50/50 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {c.id}
                    </span>
                    <PriorityBadge priority={c.confirmedPriority} size="sm" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{c.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{c.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-400 text-[10px]">
                      {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
