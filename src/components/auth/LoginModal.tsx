import React from 'react';
import { useCivic } from '../../context/CivicContext';
import { LoginPortal } from './LoginPortal';
import { X } from 'lucide-react';

export const LoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'citizen' | 'administrator';
}> = ({ isOpen, onClose, defaultRole = 'citizen' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-slate-50 rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-900 shadow-sm border border-slate-200 transition-colors"
          title="Close Login Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-h-[88vh] overflow-y-auto p-2 sm:p-4">
          <LoginPortal initialRole={defaultRole} onLoginSuccess={onClose} />
        </div>
      </div>
    </div>
  );
};
