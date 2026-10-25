import React, { useState, useEffect } from 'react';
import { Complaint } from '../../types';
import { useCivic } from '../../context/CivicContext';
import {
  Truck,
  CheckCircle2,
  Clock,
  Radio,
  Navigation,
  MessageSquare,
  AlertTriangle,
  X,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface CrewDispatchModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CrewDispatchModal: React.FC<CrewDispatchModalProps> = ({
  complaint,
  isOpen,
  onClose,
}) => {
  const { updateComplaintStatus } = useCivic();
  const [step, setStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setIsSimulating(false);
      setCompleted(false);
    }
  }, [isOpen, complaint]);

  if (!isOpen || !complaint) return null;

  const steps = [
    {
      title: 'Automated Work Order Generation',
      desc: 'Routing to Public Works Sector 4 & assigning certified contractor team',
      icon: Clock,
      detail: 'Work Order #WO-2026-9481 generated with AI hazard tags.',
    },
    {
      title: 'Optimized GPS Fleet Telemetry',
      desc: 'Dispatching Unit 12 (Heavy Duty Asphalt & Patching Crew)',
      icon: Navigation,
      detail: 'Optimal route via Main Bypass: Estimated ETA 14 minutes.',
    },
    {
      title: 'Citizen Notification Broadcast',
      desc: `SMS & App notification queued for reporter: ${complaint.reporterName}`,
      icon: MessageSquare,
      detail: `Alert sent: "CivicFix Unit 12 has been dispatched to ${complaint.address}."`,
    },
    {
      title: 'Active Field Lockout & Status Transition',
      desc: 'Ticket transitioned to "In Progress" with live GPS telemetry pin',
      icon: ShieldCheck,
      detail: 'Telemetry tracking active on Municipal GIS Map.',
    },
  ];

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setStep(1);

    const timer1 = setTimeout(() => {
      setStep(2);
    }, 1200);

    const timer2 = setTimeout(() => {
      setStep(3);
    }, 2400);

    const timer3 = setTimeout(() => {
      setStep(4);
      setCompleted(true);
      setIsSimulating(false);
      // Automatically update the complaint status in real state!
      updateComplaintStatus(
        complaint.id,
        'in_progress',
        'Simulated Field Dispatch: Public Works Unit 12 deployed with ETA 14 mins.',
        complaint.confirmedPriority
      );
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-[#10243A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Rapid Response Field Dispatch</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                  Live Simulator
                </span>
              </div>
              <p className="text-xs text-slate-300">Ticket #{complaint.id} • {complaint.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Target Issue Context Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{complaint.title}</span>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {complaint.confirmedPriority} Priority
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{complaint.description}</p>
              <p className="text-[11px] text-slate-500 font-medium">📍 {complaint.address}</p>
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Dispatch Automation Protocol
            </h4>

            <div className="space-y-3">
              {steps.map((st, index) => {
                const Icon = st.icon;
                const isCurrent = step === index + 1;
                const isPassed = step > index + 1 || completed;
                return (
                  <div
                    key={index}
                    className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isCurrent
                        ? 'bg-teal-50/80 border-teal-400 ring-2 ring-teal-500/20'
                        : isPassed
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-white border-slate-200 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                        isCurrent
                          ? 'bg-teal-500 text-slate-950 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{st.title}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded animate-pulse">
                            Processing...
                          </span>
                        )}
                        {isPassed && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Verified ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{st.desc}</p>
                      {(isCurrent || isPassed) && (
                        <p className="text-[11px] font-mono text-teal-800 bg-white/70 p-1.5 rounded mt-1 border border-teal-100">
                          {st.detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completion state notification */}
          {completed && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-extrabold block">Field Crew Dispatched & Ticket Updated!</span>
                <span className="text-emerald-800">
                  Complaint #{complaint.id} is now in "In Progress" status. Live map marker has updated to Active Blue.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>CivicFix Fleet Telemetry API Simulator</span>
          </div>

          <div className="flex items-center gap-2">
            {!completed ? (
              <button
                disabled={isSimulating}
                onClick={handleStartSimulation}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 disabled:opacity-50 transition-all shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSimulating ? 'Simulating Dispatch...' : 'Run Dispatch Sequence'}</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
              >
                Close & View Ticket
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
