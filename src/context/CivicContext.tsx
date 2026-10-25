import React, { createContext, useContext, useState, useEffect } from 'react';
import { Complaint, ComplaintPriority, ComplaintStatus, DuplicateSuggestion, UserProfile } from '../types';
import { DEMO_USERS, INITIAL_COMPLAINTS, INITIAL_DUPLICATE_SUGGESTIONS } from '../data/initialComplaints';
import { checkAiHealth, HealthStatus } from '../services/aiService';

interface CivicContextType {
  complaints: Complaint[];
  duplicateSuggestions: DuplicateSuggestion[];
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isLoggedIn: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  viewComplaint: (id: string) => void;
  addComplaint: (data: {
    title: string;
    description: string;
    category: Complaint['category'];
    latitude: number;
    longitude: number;
    address: string;
    imageUrl?: string;
    aiAnalysis: Complaint['aiAnalysis'];
    suggestedPriority: ComplaintPriority;
    confirmedPriority: ComplaintPriority;
  }) => Promise<Complaint>;
  updateComplaintStatus: (
    id: string,
    newStatus: ComplaintStatus,
    note: string,
    confirmedPriority?: ComplaintPriority
  ) => void;
  markComplaintResolved: (id: string, resolutionNote?: string) => void;
  addCitizenNote: (complaintId: string, noteText: string) => void;
  resolveDuplicate: (duplicateId: string, action: 'confirm_merge' | 'reject') => void;
  resetDemoData: () => void;
  aiStatus: HealthStatus;
  refreshAiStatus: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isLoginModalOpen: boolean;
  loginModalDefaultRole: 'citizen' | 'administrator';
  openLoginModal: (role?: 'citizen' | 'administrator') => void;
  closeLoginModal: () => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
}

const STORAGE_KEY_COMPLAINTS = 'civicfix_complaints_v1';
const STORAGE_KEY_DUPLICATES = 'civicfix_duplicates_v1';
const STORAGE_KEY_USER = 'civicfix_active_user_v1';

const CivicContext = createContext<CivicContextType | undefined>(undefined);

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load stored complaints, using initial seed:', e);
    }
    return INITIAL_COMPLAINTS;
  });

  const [duplicateSuggestions, setDuplicateSuggestions] = useState<DuplicateSuggestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DUPLICATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load stored duplicates, using initial seed:', e);
    }
    return INITIAL_DUPLICATE_SUGGESTIONS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {}
    return null; // Default to logged out as requested
  });

  const [activeTab, setActiveTabState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === 'administrator') return 'admin-dashboard';
        if (parsed?.role === 'citizen') return 'citizen-dashboard';
      }
    } catch (e) {}
    return 'login'; // Default to login screen asking user to choose portal
  });

  const setActiveTab = (tab: string) => {
    // If not logged in, only allow login or landing
    if (!currentUser && tab !== 'login' && tab !== 'landing') {
      setActiveTabState('login');
      return;
    }

    // Role-locked portal access:
    // Citizens cannot switch to or view Municipal Administrator command
    if (currentUser?.role === 'citizen' && (tab === 'admin-dashboard' || tab === 'ai-panel')) {
      alert('Access Restricted: You are logged into the Citizen Portal. To access Municipal Command, please log out and choose the Administrator Portal.');
      return;
    }

    setActiveTabState(tab);
  };

  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Login & Profile Modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalDefaultRole, setLoginModalDefaultRole] = useState<'citizen' | 'administrator'>('citizen');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openLoginModal = (role: 'citizen' | 'administrator' = 'citizen') => {
    setLoginModalDefaultRole(role);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const login = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {}
    if (user.role === 'administrator') {
      setActiveTabState('admin-dashboard');
    } else {
      setActiveTabState('citizen-dashboard');
    }
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch (e) {}
    setActiveTabState('login');
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    } catch (e) {}
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const [aiStatus, setAiStatus] = useState<HealthStatus>({
    status: 'checking',
    aiProvider: 'checking',
    isAiLive: false,
    timestamp: new Date().toISOString(),
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    } catch (e) {}
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DUPLICATES, JSON.stringify(duplicateSuggestions));
    } catch (e) {}
  }, [duplicateSuggestions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  const refreshAiStatus = async () => {
    const status = await checkAiHealth();
    setAiStatus(status);
  };

  useEffect(() => {
    refreshAiStatus();
  }, []);

  const viewComplaint = (id: string) => {
    setSelectedComplaintId(id);
    setActiveTab('complaint-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addComplaint = async (data: {
    title: string;
    description: string;
    category: Complaint['category'];
    latitude: number;
    longitude: number;
    address: string;
    imageUrl?: string;
    aiAnalysis: Complaint['aiAnalysis'];
    suggestedPriority: ComplaintPriority;
    confirmedPriority: ComplaintPriority;
  }): Promise<Complaint> => {
    const nextNumber = 1021 + complaints.length - INITIAL_COMPLAINTS.length;
    const generatedId = `CF-2026-${nextNumber}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id: generatedId,
      title: data.title,
      description: data.description,
      category: data.category,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      imageUrl: data.imageUrl,
      status: 'reported',
      suggestedPriority: data.suggestedPriority,
      confirmedPriority: data.confirmedPriority,
      reporterId: currentUser?.id || 'guest-citizen',
      reporterName: currentUser?.name || 'Resident Citizen',
      reporterEmail: currentUser?.email || 'citizen@civicnet.org',
      createdAt: now,
      updatedAt: now,
      aiAnalysis: data.aiAnalysis,
      updates: [
        {
          id: `up-${Date.now()}-1`,
          timestamp: now,
          actorName: currentUser?.name || 'Resident Citizen',
          actorRole: currentUser?.role || 'citizen',
          newStatus: 'reported',
          note: 'New complaint officially registered on public ledger.',
        },
        {
          id: `up-${Date.now()}-2`,
          timestamp: now,
          actorName: data.aiAnalysis.isRealAi ? 'CivicFix Neural Engine' : 'CivicFix AI Engine',
          actorRole: 'ai_system',
          previousStatus: 'reported',
          newStatus: 'triaged',
          note: `Automated AI classification: ${data.aiAnalysis.explanation}`,
        },
      ],
      citizenNotes: [],
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Check for nearby/semantic duplicates automatically
    try {
      const candidates = complaints.slice(0, 15);
      const res = await fetch('/api/ai/detect-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetComplaint: newComplaint, candidates }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.duplicates && resData.duplicates.length > 0) {
          const newSuggestions: DuplicateSuggestion[] = resData.duplicates.map((d: any, idx: number) => ({
            id: `dup-${Date.now()}-${idx}`,
            sourceComplaintId: newComplaint.id,
            matchedComplaintId: d.matchedComplaintId,
            similarityScore: d.similarityScore,
            reason: d.reason,
            geographicDistanceMeters: d.distanceMeters,
            reviewStatus: 'pending',
            isRealAi: d.isRealAi,
          }));
          setDuplicateSuggestions((prev) => [...newSuggestions, ...prev]);
        }
      }
    } catch (err) {
      console.warn('Auto duplicate check failed:', err);
    }

    return newComplaint;
  };

  const updateComplaintStatus = (
    id: string,
    newStatus: ComplaintStatus,
    note: string,
    confirmedPriority?: ComplaintPriority
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const now = new Date().toISOString();
        const updateEntry = {
          id: `up-${Date.now()}`,
          timestamp: now,
          actorName: currentUser?.name || 'Municipal Officer',
          actorRole: currentUser?.role || 'administrator',
          previousStatus: c.status,
          newStatus,
          note: note.trim() || `Status updated from ${c.status} to ${newStatus}.`,
        };

        return {
          ...c,
          status: newStatus,
          confirmedPriority: confirmedPriority || c.confirmedPriority,
          updatedAt: now,
          updates: [updateEntry, ...c.updates],
        };
      })
    );
  };

  // Dedicated Admin action to mark an issue as solved/completed
  const markComplaintResolved = (id: string, resolutionNote?: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const now = new Date().toISOString();
        const updateEntry = {
          id: `up-${Date.now()}`,
          timestamp: now,
          actorName: currentUser?.name || 'Officer Marcus Vance',
          actorRole: 'administrator' as const,
          previousStatus: c.status,
          newStatus: 'resolved' as const,
          note:
            resolutionNote?.trim() ||
            'Municipal field verification complete: issue officially repaired and marked solved on civic ledger.',
        };

        return {
          ...c,
          status: 'resolved' as const,
          updatedAt: now,
          updates: [updateEntry, ...c.updates],
        };
      })
    );
  };

  const addCitizenNote = (complaintId: string, noteText: string) => {
    if (!noteText.trim()) return;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const noteEntry = {
          id: `cn-${Date.now()}`,
          timestamp: new Date().toISOString(),
          authorName: currentUser?.name || 'Concerned Citizen',
          authorEmail: currentUser?.email || 'citizen@civicnet.org',
          note: noteText.trim(),
        };
        return {
          ...c,
          citizenNotes: [...c.citizenNotes, noteEntry],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const resolveDuplicate = (duplicateId: string, action: 'confirm_merge' | 'reject') => {
    setDuplicateSuggestions((prev) =>
      prev.map((d) => {
        if (d.id !== duplicateId) return d;
        return {
          ...d,
          reviewStatus: action === 'confirm_merge' ? 'confirmed_duplicate' : 'rejected',
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser?.name || 'Administrator',
        };
      })
    );

    if (action === 'confirm_merge') {
      const item = duplicateSuggestions.find((d) => d.id === duplicateId);
      if (item) {
        setComplaints((prev) =>
          prev.map((c) => {
            if (c.id === item.sourceComplaintId) {
              return {
                ...c,
                isDuplicateOf: item.matchedComplaintId,
                status: 'closed',
                updates: [
                  {
                    id: `up-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    actorName: currentUser?.name || 'Administrator',
                    actorRole: currentUser?.role || 'administrator',
                    previousStatus: c.status,
                    newStatus: 'closed',
                    note: `Merged as duplicate into master ticket #${item.matchedComplaintId}. (${item.reason})`,
                  },
                  ...c.updates,
                ],
              };
            }
            if (c.id === item.matchedComplaintId) {
              return {
                ...c,
                duplicateCount: (c.duplicateCount || 0) + 1,
              };
            }
            return c;
          })
        );
      }
    }
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_COMPLAINTS);
    localStorage.removeItem(STORAGE_KEY_DUPLICATES);
    setComplaints(INITIAL_COMPLAINTS);
    setDuplicateSuggestions(INITIAL_DUPLICATE_SUGGESTIONS);
    setSelectedComplaintId(null);
  };

  return (
    <CivicContext.Provider
      value={{
        complaints,
        duplicateSuggestions,
        currentUser,
        setCurrentUser,
        isLoggedIn: Boolean(currentUser),
        login,
        logout,
        updateProfile,
        activeTab,
        setActiveTab,
        selectedComplaintId,
        setSelectedComplaintId,
        viewComplaint,
        addComplaint,
        updateComplaintStatus,
        markComplaintResolved,
        addCitizenNote,
        resolveDuplicate,
        resetDemoData,
        aiStatus,
        refreshAiStatus,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        isLoginModalOpen,
        loginModalDefaultRole,
        openLoginModal,
        closeLoginModal,
        isProfileModalOpen,
        setIsProfileModalOpen,
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export function useCivic() {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
}
