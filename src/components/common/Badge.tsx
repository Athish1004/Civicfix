import React from 'react';
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../types';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Wrench,
  Calendar,
  AlertCircle,
  FileQuestion,
  Droplets,
  Trash2,
  GitBranch,
  Lightbulb,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export const CategoryBadge: React.FC<{ category: ComplaintCategory; size?: 'sm' | 'md' }> = ({
  category,
  size = 'md',
}) => {
  const configs: Record<ComplaintCategory, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
    road_damage: {
      label: 'Road Damage',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />,
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    waste_management: {
      label: 'Waste Mgmt',
      icon: <Trash2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
    water_leakage: {
      label: 'Water Leakage',
      icon: <Droplets className="w-3.5 h-3.5 mr-1 text-sky-600" />,
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
    },
    drainage: {
      label: 'Drainage & Storm',
      icon: <GitBranch className="w-3.5 h-3.5 mr-1 text-blue-600" />,
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
    streetlight_failure: {
      label: 'Streetlight',
      icon: <Lightbulb className="w-3.5 h-3.5 mr-1 text-yellow-600" />,
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    },
    public_infrastructure: {
      label: 'Public Infra',
      icon: <Building2 className="w-3.5 h-3.5 mr-1 text-indigo-600" />,
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
    },
    other: {
      label: 'General Civic',
      icon: <FileQuestion className="w-3.5 h-3.5 mr-1 text-slate-600" />,
      bg: 'bg-slate-50',
      text: 'text-slate-800',
      border: 'border-slate-200',
    },
  };

  const item = configs[category] || configs.other;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border ${item.bg} ${item.text} ${item.border} ${sizeClasses}`}>
      {item.icon}
      {item.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: ComplaintPriority; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'md',
}) => {
  const configs: Record<ComplaintPriority, { label: string; bg: string; text: string; dot: string; border: string }> = {
    low: {
      label: 'Low',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
      border: 'border-slate-200',
    },
    medium: {
      label: 'Medium',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      border: 'border-blue-200',
    },
    high: {
      label: 'High',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
      border: 'border-orange-200',
    },
    critical: {
      label: 'Critical Hazard',
      bg: 'bg-rose-50',
      text: 'text-rose-700 font-semibold',
      dot: 'bg-rose-600 animate-pulse',
      border: 'border-rose-200 shadow-xs',
    },
  };

  const item = configs[priority] || configs.medium;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${item.bg} ${item.text} ${item.border} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ComplaintStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const configs: Record<ComplaintStatus, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
    reported: {
      label: 'Reported',
      icon: <Clock className="w-3 h-3 mr-1 text-slate-500" />,
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
    triaged: {
      label: 'AI Triaged',
      icon: <AlertCircle className="w-3 h-3 mr-1 text-purple-600" />,
      bg: 'bg-purple-50',
      text: 'text-purple-700 font-medium',
      border: 'border-purple-200',
    },
    in_progress: {
      label: 'In Progress',
      icon: <Wrench className="w-3 h-3 mr-1 text-cyan-600" />,
      bg: 'bg-cyan-50',
      text: 'text-cyan-800 font-medium',
      border: 'border-cyan-200',
    },
    scheduled: {
      label: 'Crew Scheduled',
      icon: <Calendar className="w-3 h-3 mr-1 text-indigo-600" />,
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
    resolved: {
      label: 'Resolved',
      icon: <CheckCircle2 className="w-3 h-3 mr-1 text-teal-600" />,
      bg: 'bg-teal-50',
      text: 'text-teal-800 font-medium',
      border: 'border-teal-200',
    },
    closed: {
      label: 'Closed / Merged',
      icon: <ShieldCheck className="w-3 h-3 mr-1 text-slate-400" />,
      bg: 'bg-slate-100',
      text: 'text-slate-500',
      border: 'border-slate-200',
    },
  };

  const item = configs[status] || configs.reported;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-md border ${item.bg} ${item.text} ${item.border} ${sizeClasses}`}>
      {item.icon}
      {item.label}
    </span>
  );
};
