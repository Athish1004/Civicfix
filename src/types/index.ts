export type ComplaintCategory =
  | 'road_damage'
  | 'waste_management'
  | 'water_leakage'
  | 'drainage'
  | 'streetlight_failure'
  | 'public_infrastructure'
  | 'other';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus =
  | 'reported'
  | 'triaged'
  | 'in_progress'
  | 'scheduled'
  | 'resolved'
  | 'closed';

export interface AIAnalysisResult {
  category: ComplaintCategory;
  confidence: number;
  suggestedSeverity: ComplaintPriority;
  explanation: string;
  keyPhrases: string[];
  safetyConcerns: string[];
  recommendedNextAction: string;
  routingDepartment: string;
  isRealAi: boolean;
  model: string;
  analyzedAt: string;
}

export interface ComplaintUpdate {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: 'citizen' | 'administrator' | 'ai_system' | 'field_crew';
  previousStatus?: ComplaintStatus;
  newStatus: ComplaintStatus;
  note: string;
}

export interface CitizenNote {
  id: string;
  timestamp: string;
  authorName: string;
  authorEmail?: string;
  note: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl?: string;
  status: ComplaintStatus;
  suggestedPriority: ComplaintPriority;
  confirmedPriority: ComplaintPriority;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  createdAt: string;
  updatedAt: string;
  aiAnalysis: AIAnalysisResult;
  updates: ComplaintUpdate[];
  citizenNotes: CitizenNote[];
  isDuplicateOf?: string; // ID of master complaint if merged
  duplicateCount?: number;
}

export interface DuplicateSuggestion {
  id: string;
  sourceComplaintId: string;
  matchedComplaintId: string;
  similarityScore: number; // 0 - 100
  reason: string;
  geographicDistanceMeters: number;
  reviewStatus: 'pending' | 'confirmed_duplicate' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  isRealAi?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'administrator';
  avatar?: string;
  department?: string;
}

export interface CivicInsights {
  executiveSummary: string;
  identifiedHotspots: string[];
  resourceRecommendations: string[];
  projectedResolutionPace: string;
  isRealAi: boolean;
  generatedAt: string;
}
