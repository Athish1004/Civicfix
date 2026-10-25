import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import {
  Award,
  Trophy,
  Flame,
  CheckCircle2,
  Sparkles,
  Droplets,
  Shield,
  Trash2,
  Eye,
  TrendingUp,
  Gift,
  ArrowRight,
  Star,
  Users,
  Compass,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const CivicKarmaView: React.FC = () => {
  const { currentUser, complaints, setActiveTab } = useCivic();
  const [speaking, setSpeaking] = useState(false);

  // Filter complaints by current user
  const userComplaints = complaints.filter((c) => c.reporterId === currentUser?.id);
  const resolvedCount = userComplaints.filter((c) => c.status === 'resolved').length;
  
  // Calculate user karma score
  const karmaScore = Math.max(
    380,
    userComplaints.length * 50 +
    resolvedCount * 75 +
    userComplaints.filter((c) => c.imageUrl).length * 25 +
    (currentUser?.role === 'administrator' ? 240 : 0)
  );

  const karmaLevel = karmaScore > 600 ? 'Level 5 • Master Civic Guardian' : karmaScore > 400 ? 'Level 4 • Civic Guardian' : 'Level 3 • Active Sentinel';

  const badges = [
    {
      id: 'pothole',
      name: 'Pothole Spotter Elite',
      icon: Shield,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      description: 'Reported 3+ verified road craters before vehicle damage occurred.',
      unlocked: true,
      dateEarned: 'Oct 12, 2026',
    },
    {
      id: 'water',
      name: 'Hydraulic Guardian',
      icon: Droplets,
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      description: 'Detected high-volume water main leakage, saving estimated ~32,000 liters.',
      unlocked: true,
      dateEarned: 'Oct 19, 2026',
    },
    {
      id: 'waste',
      name: 'Clean Alley Champion',
      icon: Trash2,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Logged bulk waste illegal dumping resulting in sanitation clean-up in < 24h.',
      unlocked: true,
      dateEarned: 'Nov 02, 2026',
    },
    {
      id: 'verifier',
      name: 'Truth Verifier',
      icon: Eye,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      description: 'Added photo proof confirming municipal contractor resolution quality.',
      unlocked: resolvedCount > 0,
      dateEarned: resolvedCount > 0 ? 'Nov 14, 2026' : 'In Progress',
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Elena Rostova', ward: 'Ward 4 - Downtown', points: 940, reports: 18, badge: 'Civic Legend' },
    { rank: 2, name: 'Marcus Chen', ward: 'Ward 2 - Riverside', points: 790, reports: 15, badge: 'Master Spotter' },
    { rank: 3, name: currentUser?.name || 'Resident Citizen', ward: 'Ward 7 - Westside', points: karmaScore, reports: userComplaints.length, badge: 'Civic Guardian', isCurrentUser: true },
    { rank: 4, name: 'Devon Vance', ward: 'Ward 3 - East Hills', points: 420, reports: 8, badge: 'Sentinel' },
    { rank: 5, name: 'Sarah Al-Mansoor', ward: 'Ward 5 - Metro Hub', points: 360, reports: 7, badge: 'Sentinel' },
  ];

  // Speech synthesis demonstration for accessibility & uniqueness
  const handlePlayAudioBriefing = () => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = `CivicFix Intelligence Impact Briefing. Citizen ${currentUser?.name || 'Resident'} has achieved ${karmaScore} Karma Points at ${karmaLevel}. Through your prompt reports, an estimated 48 thousand liters of clean water have been conserved, and 14 pedestrian safety hazards have been permanently mitigated. Your next municipal parking credit is unlocked.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10243A] via-[#163352] to-[#0c1a2b] text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Unique Civic Engagement & Gamification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Civic Karma & Community Impact Hub
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              CivicFix transforms civic reporting into a collaborative, rewarded civic duty. Every confirmed hazard you flag prevents accidents, protects city infrastructure, and unlocks real municipal incentives.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={handlePlayAudioBriefing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-md ${
                speaking
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/40 animate-pulse'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
              }`}
              title="Listen to synthesized AI voice briefing"
            >
              {speaking ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
              <span>{speaking ? 'Stop Voice Briefing' : 'Listen to Voice Briefing'}</span>
            </button>

            <button
              onClick={() => setActiveTab('report-issue')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 font-bold text-xs transition-all shadow-lg"
            >
              <span>Report Issue (+50 Pts)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Karma Status & City Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* User Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                alt={currentUser?.name || 'User'}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-teal-500/40 shadow-xs"
              />
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{currentUser?.name || 'Resident Citizen'}</h3>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {karmaLevel}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Civic Karma Points</span>
                <div className="text-3xl font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <span>{karmaScore}</span>
                  <Flame className="w-6 h-6 text-amber-500 animate-bounce" />
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                Top 5% in Ward
              </span>
            </div>

            {/* Progress Bar to next level */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Progress to Next Tier</span>
                <span className="font-bold text-slate-700">{karmaScore} / 1000 Pts</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (karmaScore / 1000) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>Verified Reports: <strong>{userComplaints.length}</strong></span>
              <span>Fixed Hazards: <strong>{resolvedCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Citywide Impact Stats (2 columns) */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Real-World Community Impact Metrics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quantified positive environmental, safety, and economic outcomes generated by citizen reports.
              </p>
            </div>
            <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-1 rounded-md border border-teal-200">
              Live City Census
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
            <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200/80">
              <div className="flex items-center gap-2 text-cyan-800 font-bold text-xs uppercase tracking-wider mb-1">
                <Droplets className="w-4 h-4 text-cyan-600" /> Water Saved
              </div>
              <div className="text-2xl font-black text-cyan-950">48,200 L</div>
              <p className="text-[11px] text-cyan-700 mt-1">From 4 prompt main leak reports</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
                <Trash2 className="w-4 h-4 text-emerald-600" /> Waste Cleared
              </div>
              <div className="text-2xl font-black text-emerald-950">3,450 kg</div>
              <p className="text-[11px] text-emerald-700 mt-1">Diverted from storm drains</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
                <Shield className="w-4 h-4 text-amber-600" /> Hazards Mitigated
              </div>
              <div className="text-2xl font-black text-amber-950">14 Hazards</div>
              <p className="text-[11px] text-amber-700 mt-1">Road craters & live dark wire fixes</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>AI correlation shows every 24-hour reduction in triage latency reduces repair expense by 38%.</span>
          </div>
        </div>
      </div>

      {/* Badges and Rewards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Citizen Badges */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Earned Civic Badges & Certifications
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Recognizing citizens who make municipal neighborhoods safer and cleaner.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600">3 of 4 Unlocked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border transition-all ${
                    b.unlocked
                      ? 'bg-slate-50/80 border-slate-200 hover:border-teal-300'
                      : 'bg-slate-50/40 border-dashed border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${b.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                        {b.unlocked ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Earned
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Locked</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">{b.description}</p>
                      <p className="text-[10px] text-slate-400 pt-1">
                        {b.unlocked ? `Unlocked: ${b.dateEarned}` : 'Requires 1 verified resolution audit'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Municipal Rewards Unlocked */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Gift className="w-5 h-5 text-rose-500" />
              Municipal Rewards
            </h3>
            <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              City Hall Perks
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                10%
              </div>
              <div className="text-xs">
                <span className="font-bold text-emerald-950 block">Municipal Parking Credit</span>
                <span className="text-emerald-800">10% discount coupon on downtown meter parking.</span>
                <span className="mt-1 inline-block text-[10px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  CODE: CIVIC-PARK-2026
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                PASS
              </div>
              <div className="text-xs">
                <span className="font-bold text-teal-950 block">Metro Transit Day Pass</span>
                <span className="text-teal-800">Unlimited bus and light rail access for 1 weekend.</span>
                <span className="mt-1 inline-block text-[10px] font-mono text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
                  CODE: METRO-FREE-CIVIC
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-start gap-3 opacity-75">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                TREE
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-700 block">Civic Dedication Tree</span>
                <span className="text-slate-500">Plant a tree in your name at City Park (Unlocks at 750 Pts).</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Ward 7 & Metropolitan Citizen Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Top contributing citizens whose verified tickets helped city maintenance crews respond fastest.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">Updated Hourly • Real Civic Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Citizen</th>
                <th className="py-2.5 px-3">Ward / District</th>
                <th className="py-2.5 px-3">Verified Tickets</th>
                <th className="py-2.5 px-3">Badge Title</th>
                <th className="py-2.5 px-3 text-right">Karma Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((user) => (
                <tr
                  key={user.rank}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    user.isCurrentUser ? 'bg-teal-50/60 font-semibold' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        user.rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : user.rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : user.rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{user.name}</span>
                      {user.isCurrentUser && (
                        <span className="text-[10px] bg-teal-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{user.ward}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{user.reports} confirmed</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {user.badge}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-black text-teal-700 text-sm">{user.points}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
