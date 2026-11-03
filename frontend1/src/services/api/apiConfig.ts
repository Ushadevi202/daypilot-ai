/**
 * DayPilot AI - Spring Boot API Configuration
 * 
 * Configures the base URL for the Java Spring Boot + MySQL backend REST endpoints.
 * By default in this frontend workspace, requests route through the client mock layer
 * or can be toggled to live backend mode when `USE_MOCK_DATA` is false or when the backend is active.
 */

export const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 
  'http://localhost:8080/api';

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeoutMs: 8000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  endpoints: {
    // Tasks
    tasks: `${API_BASE_URL}/v1/tasks`,
    taskDetail: (id: string) => `${API_BASE_URL}/v1/tasks/${id}`,
    taskComplete: (id: string) => `${API_BASE_URL}/v1/tasks/${id}/complete`,
    taskReschedule: (id: string) => `${API_BASE_URL}/v1/tasks/${id}/reschedule`,

    // Routines
    routines: `${API_BASE_URL}/v1/routines`,
    routineDetail: (id: string) => `${API_BASE_URL}/v1/routines/${id}`,
    routineToggle: (id: string) => `${API_BASE_URL}/v1/routines/${id}/toggle`,

    // Job Applications
    applications: `${API_BASE_URL}/v1/applications`,
    applicationDetail: (id: string) => `${API_BASE_URL}/v1/applications/${id}`,
    applicationStatus: (id: string) => `${API_BASE_URL}/v1/applications/${id}/status`,
    applicationTimeline: (id: string) => `${API_BASE_URL}/v1/applications/${id}/timeline`,

    // Email Assistant
    emailAlerts: `${API_BASE_URL}/v1/emails/alerts`,
    emailAction: (id: string) => `${API_BASE_URL}/v1/emails/alerts/${id}/action`,
    emailSync: `${API_BASE_URL}/v1/emails/sync`,

    // AI Planner & Scheduling
    aiSchedule: `${API_BASE_URL}/v1/ai/planner/generate`,
    aiParseTask: `${API_BASE_URL}/v1/ai/tasks/parse-nlp`,
    aiDailyReview: `${API_BASE_URL}/v1/ai/insights/daily-review`,

    // Analytics & Metrics
    analyticsSummary: `${API_BASE_URL}/v1/analytics/summary`,
    routineStats: `${API_BASE_URL}/v1/analytics/routines`,

    // Auth & Google OAuth
    googleOAuthAuthorize: `${API_BASE_URL.replace('/api', '')}/oauth2/authorization/google`,
    authSession: `${API_BASE_URL}/v1/auth/session`,
    authLogout: `${API_BASE_URL}/v1/auth/logout`,

    // Real-time SSE / WebSocket
    sseStream: `${API_BASE_URL}/v1/stream/events`,
    wsEndpoint: `ws://localhost:8080/ws/updates`,
  }
};

export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE_URL}/health`, { 
      signal: controller.signal,
      method: 'GET'
    });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
};
