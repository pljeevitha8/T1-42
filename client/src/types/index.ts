export type UserRole = 'admin' | 'investigator' | 'reviewer';

export interface User {
  id: string;
  email: string;
  name: string;
  badgeNumber: string;
  department: string;
  role: UserRole;
  demoPasswordHint?: string;
}

export type CaseStatus = 'DRAFT' | 'ACTIVE' | 'REVIEW' | 'CLOSED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FacialRefinements {
  ageOffset: number;       // -10 to +10 years
  jawWidth: number;        // 0 to 100
  eyeNarrowness: number;   // 0 to 100
  noseProminence: number;  // 0 to 100
  stubbleDensity: number;  // 0 to 100
  cheekHollow: number;     // 0 to 100
}

export interface FacialFeatures {
  gender: string;
  ageGroup: string;
  faceShape: string;
  skinTone: string;
  eyesShape: string;
  eyeColor: string;
  eyebrows: string;
  nose: string;
  jawline: string;
  hairstyle: string;
  hairColor: string;
  facialHair: string;
  distinctiveFeatures: string[];
  accessories: string[];
  refinements: FacialRefinements;
}

export interface BiometricMetrics {
  cranialRatio: number;
  interpupillaryDistance: number;
  jawAngleDegrees: number;
  symmetryScore: number;
}

export interface SketchVersion {
  id: string;
  versionNumber: number;
  imageUrl: string;
  prompt: string;
  negativePrompt: string;
  modelUsed: string;
  provider: 'pollinations' | 'huggingface' | 'openai' | 'procedural_demo';
  confidenceScore: number;
  refinementNotes?: string;
  createdAt: string;
  createdBy: string;
  featuresSnapshot: FacialFeatures;
  biometricMetrics: BiometricMetrics;
}

export interface Case {
  id: string;
  title: string;
  incidentType: string;
  incidentLocation: string;
  incidentDate: string;
  witnessName: string;
  witnessContact: string;
  investigatorId: string;
  investigatorName: string;
  status: CaseStatus;
  priority: CasePriority;
  witnessStatement: string;
  features: FacialFeatures;
  sketches: SketchVersion[];
  primarySketchId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type AuditAction =
  | 'CASE_CREATE'
  | 'CASE_UPDATE'
  | 'CASE_DELETE'
  | 'SKETCH_GENERATE'
  | 'SKETCH_REFINE'
  | 'SKETCH_EXPORT'
  | 'PRIMARY_SELECT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'UNAUTHORIZED_ACCESS'
  | 'CONFIG_UPDATE';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  caseId?: string;
  details: string;
  ipAddress: string;
  integrityHash: string;
}

export interface AIProviderConfig {
  provider: 'pollinations' | 'huggingface' | 'openai' | 'procedural_demo';
  apiKey?: string;
  modelName?: string;
  hasApiKey?: boolean;
}

export interface SystemMetrics {
  totalCases: number;
  activeCases: number;
  reviewCases: number;
  closedCases: number;
  totalSketches: number;
  totalRefinements: number;
  totalAuditEvents: number;
  activeEngine: string;
  systemUptimeSeconds: number;
}
