/**
 * Central API client for communicating with the FastAPI backend.
 * All backend calls are routed through this module for type safety and consistency.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ==========================================
// Types (matching backend Pydantic schemas)
// ==========================================

export interface MentorMatch {
  mentor_id: string;
  name: string;
  skills_summary: string | null;
  similarity: number;
}

export interface MatchResponse {
  startup_id: string;
  matches: MentorMatch[];
  query_text: string;
}

export interface MatchRequest {
  startup_id: string;
  needs_text: string;
  match_threshold?: number;
  match_count?: number;
}

export interface SSMVerifyResponse {
  company_name: string | null;
  registration_number: string | null;
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  confidence: number;
  message: string;
}

export interface NudgeRequest {
  linkage_id: string;
  startup_name: string;
  mentor_name: string;
  last_interaction_date: string;
  topic?: string;
}

export interface NudgeResponse {
  linkage_id: string;
  subject: string;
  body: string;
  generated_at: string;
}

export interface FeedItem {
  id: string;
  type: string;
  title: string;
  content: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

export interface LinkageResponse {
  id: string;
  type: string;
  startup_id: string;
  counterpart_name: string;
  program_name: string | null;
  status: 'Pending' | 'Active' | 'At-Risk' | 'Graduated';
  health_score: number | null;
  last_interaction_date: string | null;
  created_at: string;
}

export interface EcosystemMetrics {
  total_active_linkages: number;
  avg_linkage_health: number;
  at_risk_linkages: number;
  matches_generated: number;
  trending_needs: Record<string, unknown>[];
}

export interface HealthCheckResult {
  linkages_evaluated: number;
  linkages_decayed: number;
  linkages_marked_at_risk: number;
  nudges_triggered: number;
  run_at: string;
}

export interface StartupProfile {
  id: string;
  company_name: string;
  industry: string | null;
  stage: string | null;
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  bio: string | null;
  needs: string[];
  total_funding: number | null;
}

// ==========================================
// API Functions
// ==========================================

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }

  return res.json();
}

// --- Feed ---
export async function fetchFeed(): Promise<FeedItem[]> {
  return apiFetch<FeedItem[]>('/api/feed');
}

// --- Linkages ---
export async function fetchLinkages(startupId?: string): Promise<LinkageResponse[]> {
  const query = startupId ? `?startup_id=${startupId}` : '';
  return apiFetch<LinkageResponse[]>(`/api/linkages${query}`);
}

// --- Profile ---
export async function fetchProfile(profileId: string): Promise<StartupProfile> {
  return apiFetch<StartupProfile>(`/api/profile/${profileId}`);
}

// --- Admin Metrics ---
export async function fetchMetrics(): Promise<EcosystemMetrics> {
  return apiFetch<EcosystemMetrics>('/api/admin/metrics');
}

// --- AI Match ---
export async function matchMentors(request: MatchRequest): Promise<MatchResponse> {
  return apiFetch<MatchResponse>('/api/ai/match', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// --- SSM Verify ---
export async function verifySSM(file: File, startupId?: string): Promise<SSMVerifyResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const url = startupId 
    ? `${API_BASE}/api/ai/verify-ssm?startup_id=${encodeURIComponent(startupId)}`
    : `${API_BASE}/api/ai/verify-ssm`;
    
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header — browser sets it with boundary for multipart
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }

  return res.json();
}

// --- Nudge ---
export async function generateNudge(request: NudgeRequest): Promise<NudgeResponse> {
  return apiFetch<NudgeResponse>('/api/ai/generate-nudge', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// --- Log Interaction ---
export async function logInteraction(
  linkageId: string,
  notes?: string,
  interactionType?: string
): Promise<{ message: string; linkage_id: string }> {
  return apiFetch<{ message: string; linkage_id: string }>(
    `/api/linkages/${linkageId}/log-interaction`,
    {
      method: 'POST',
      body: JSON.stringify({
        notes: notes || null,
        interaction_type: interactionType || 'check-in',
      }),
    }
  );
}

// --- Health Check ---
export async function runHealthCheck(): Promise<HealthCheckResult> {
  return apiFetch<HealthCheckResult>('/api/cron/health-check', {
    method: 'POST',
  });
}

// --- Backend Status ---
export async function checkBackendStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
