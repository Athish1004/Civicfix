import React, { createContext, useContext, useState, useEffect } from 'react';
import { Complaint, ComplaintPriority, ComplaintStatus, DuplicateSuggestion, UserProfile } from '../types';
import { DEMO_USERS, INITIAL_COMPLAINTS, INITIAL_DUPLICATE_SUGGESTIONS } from '../data/initialComplaints';
import { checkAiHealth, HealthStatus } from '../services/aiService';

interface CivicContextType {
  complaints: Complaint[];
  duplicateSuggestions: DuplicateSuggestion[];
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
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
  addCitizenNote: (complaintId: string, noteText: string) => void;
  resolveDuplicate: (duplicateId: string, action: 'confirm_merge' | 'reject') => void;
  resetDemoData: () => void;
  aiStatus: HealthStatus;
  refreshAiStatus: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const STORAGE_KEY_COMPLAINTS = 'civicfix_complaints_v1';
const STORAGE_KEY_DUPLICATES = 'civicfix_duplicates_v1';
const STORAGE_KEY_USER = 'civicfix_active_user_v1';

const CivicContext = createContext<CivicContextType | undefined>(undefined);

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load stored complaints, using initial seed:', e);
    }
    return INITIAL_COMPLAINTS;
  });

  const [duplicateSuggestions, setDuplicateSuggestions] = useState<DuplicateSuggestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DUPLICATES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load stored duplicates, using initial seed:', e);
    }
    return INITIAL_DUPLICATE_SUGGESTIONS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = DEMO_USERS.find((u) => u.id === parsed.id);
        if (match) return match;
      }
    } catch (e) {}
    return DEMO_USERS[0]; // Jane Doe (Citizen)
  });

  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

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
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterEmail: currentUser.email,
      createdAt: now,
      updatedAt: now,
      aiAnalysis: data.aiAnalysis,
      updates: [
        {
          id: `up-${Date.now()}-1`,
          timestamp: now,
          actorName: currentUser.name,
          actorRole: currentUser.role,
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
          actorName: currentUser.name,
          actorRole: currentUser.role,
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

  const addCitizenNote = (complaintId: string, noteText: string) => {
    if (!noteText.trim()) return;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const noteEntry = {
          id: `cn-${Date.now()}`,
          timestamp: new Date().toISOString(),
          authorName: currentUser.name,
          authorEmail: currentUser.email,
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
          reviewedBy: currentUser.name,
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
                    actorName: currentUser.name,
                    actorRole: currentUser.role,
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
        activeTab,
        setActiveTab,
        selectedComplaintId,
        setSelectedComplaintId,
        viewComplaint,
        addComplaint,
        updateComplaintStatus,
        addCitizenNote,
        resolveDuplicate,
        resetDemoData,
        aiStatus,
        refreshAiStatus,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
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
