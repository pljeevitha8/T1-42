import { Case, SketchVersion, AuditLog, User, SystemMetrics, AIProviderConfig, FacialFeatures } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('sketchtrace_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(data: {
    email: string;
    password: string;
    name: string;
    badgeNumber: string;
    department: string;
    role: string;
  }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getDemoAccounts(): Promise<{ demoAccounts: User[] }> {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return handleResponse(res);
  },

  // Cases
  async getCases(params?: { q?: string; status?: string; priority?: string }): Promise<{ cases: Case[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/cases?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getCaseById(id: string): Promise<{ case: Case }> {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createCase(data: Partial<Case>): Promise<{ case: Case }> {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateCase(id: string, updates: Partial<Case>): Promise<{ case: Case }> {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async deleteCase(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Sketches
  async parseWitnessStatement(statement: string): Promise<{ extracted: Partial<FacialFeatures> }> {
    const res = await fetch(`${API_BASE}/sketches/parse-statement`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ statement }),
    });
    return handleResponse(res);
  },

  async generateSketch(caseId: string, features: FacialFeatures, witnessStatement?: string): Promise<{ sketch: SketchVersion; case: Case }> {
    const res = await fetch(`${API_BASE}/sketches/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ caseId, features, witnessStatement }),
    });
    return handleResponse(res);
  },

  async refineSketch(caseId: string, features: FacialFeatures, refinementNotes: string, previousSketchId?: string): Promise<{ sketch: SketchVersion; case: Case }> {
    const res = await fetch(`${API_BASE}/sketches/refine`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ caseId, features, refinementNotes, previousSketchId }),
    });
    return handleResponse(res);
  },

  async setPrimarySketch(caseId: string, sketchId: string): Promise<{ case: Case }> {
    const res = await fetch(`${API_BASE}/sketches/set-primary`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ caseId, sketchId }),
    });
    return handleResponse(res);
  },

  async logExport(caseId: string, sketchId: string, exportFormat: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/sketches/log-export`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ caseId, sketchId, exportFormat }),
    });
    return handleResponse(res);
  },

  // Audit
  async getAuditLogs(params?: { action?: string; caseId?: string }): Promise<{ logs: AuditLog[]; total: number }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/audit?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async verifyAuditIntegrity(): Promise<{
    chainLength: number;
    tamperEvidentVerified: boolean;
    status: string;
    verifiedAt: string;
  }> {
    const res = await fetch(`${API_BASE}/audit/verify-integrity`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async downloadAuditCsv(): Promise<Blob> {
    const res = await fetch(`${API_BASE}/audit/export-csv`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to export CSV audit logs');
    return res.blob();
  },

  // System
  async getSystemMetrics(): Promise<{ metrics: SystemMetrics; recentActivity: AuditLog[] }> {
    const res = await fetch(`${API_BASE}/system/metrics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getSystemConfig(): Promise<{ config: AIProviderConfig; responsibleAIPolicy: any }> {
    const res = await fetch(`${API_BASE}/system/config`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateSystemConfig(config: Partial<AIProviderConfig>): Promise<{ config: AIProviderConfig; message: string }> {
    const res = await fetch(`${API_BASE}/system/config`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(config),
    });
    return handleResponse(res);
  },
};
