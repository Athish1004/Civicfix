import React, { useState, useEffect } from 'react';
import { useCivic } from '../../context/CivicContext';
import {
  X,
  User,
  ShieldCheck,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  Save,
  LogOut,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, logout } = useCivic();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentOrWard, setDepartmentOrWard] = useState('');
  const [bio, setBio] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setDepartmentOrWard(currentUser.department || currentUser.neighborhood || '');
      setBio(currentUser.bio || '');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const isAdmin = currentUser.role === 'administrator';

  // Get initials for clean avatar-free monogram badge
  const initials = (name || currentUser.name || 'U')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || currentUser.name,
      email: email.trim() || currentUser.email,
      phone: phone.trim(),
      bio: bio.trim(),
      ...(isAdmin ? { department: departmentOrWard.trim() } : { neighborhood: departmentOrWard.trim() }),
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header - Clean Monogram Initials with NO profile picture */}
        <div
          className={`px-6 py-6 text-white relative ${
            isAdmin
              ? 'bg-gradient-to-r from-[#0d1d30] via-[#10243a] to-[#1e3a5f]'
              : 'bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Text-based Monogram Badge (NO Profile Picture) */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl tracking-wider shadow-inner border ${
                  isAdmin
                    ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-white text-teal-800 border-white/40 ring-2 ring-white/30'
                }`}
              >
                {initials}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-white">{name || currentUser.name}</h3>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-emerald-300 text-teal-950'
                    }`}
                  >
                    {isAdmin ? 'Municipal Admin' : 'Resident Citizen'}
                  </span>
                </div>
                <p className="text-xs text-white/80">{email || currentUser.email}</p>
                <div className="flex items-center gap-1 text-[11px] text-white/70 mt-0.5">
                  <Lock className="w-3 h-3 text-white/60" />
                  <span>Portal Locked • Active Session</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Details & Customization Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
            <p>
              <strong>Profile Information:</strong> You can edit your personal details below at any time. To switch
              between Citizen and Admin portals, use the <strong>Log Out</strong> button below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                {isAdmin ? <Building className="w-3.5 h-3.5 text-slate-400" /> : <MapPin className="w-3.5 h-3.5 text-slate-400" />}
                {isAdmin ? 'Municipal Department' : 'Neighborhood / Ward'}
              </label>
              <input
                type="text"
                value={departmentOrWard}
                onChange={(e) => setDepartmentOrWard(e.target.value)}
                placeholder={isAdmin ? 'Department of Public Works' : 'Ward 4 - Central'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Civic Bio / Responsibility Notes
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={
                isAdmin
                  ? 'Supervises triage queues, coordinates field crews, and marks completed road & drainage repairs.'
                  : 'Active resident reporting neighborhood infrastructure hazards.'
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              ) : (
                <User className="w-4 h-4 text-teal-600" />
              )}
              <span className="font-semibold text-slate-800">
                Assigned Role: <strong className="capitalize">{currentUser.role}</strong>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Single Portal Access</span>
          </div>

          {/* Action buttons: Save Changes & Log Out */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>

            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-bold text-white transition-all shadow-sm flex items-center gap-2 ${
                isAdmin ? 'bg-[#10243A] hover:bg-slate-900 text-amber-300' : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Profile Updated!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
