import type {
  UserDto, TaskDto, TaskRequestDto, RoutineDto, RoutineRequestDto, OccurrenceDto,
  ApplicationDto, ApplicationRequestDto, EventDto, EventRequestDto, ApiApplicationStatus,
} from './dto';

/**
 * Client for the Spring Boot REST API.
 * Login is a cookie session (HttpOnly JSESSIONID) with CSRF protection:
 * the API sets an XSRF-TOKEN cookie, and every non-GET request echoes it in X-XSRF-TOKEN.
 * In development Vite proxies /api to http://localhost:8080 so the browser sees one origin.
 */
const BASE: string = (import.meta.env?.VITE_API_BASE_URL as string | undefined) ?? '';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function readCookie(name: string): string | null {
  const hit = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

async function ensureCsrfCookie(): Promise<void> {
  if (!readCookie('XSRF-TOKEN')) {
    await fetch(`${BASE}/api/auth/csrf`, { credentials: 'include' });
  }
}

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  try {
    if (method !== 'GET') {
      await ensureCsrfCookie();
      const token = readCookie('XSRF-TOKEN');
      if (token) headers['X-XSRF-TOKEN'] = token;
    }
    const response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) return undefined as T;

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // no JSON body
    }
    if (!response.ok) {
      const problem = (data ?? {}) as { detail?: string; message?: string; errors?: Record<string, string> };
      const message =
        problem.detail ||
        problem.message ||
        (response.status === 403 ? 'Security token problem (HTTP 403). Refresh the page and try again.'
          : response.status === 401 ? 'Please log in again.'
          : `Request failed (HTTP ${response.status})`);
      const fieldErrors = problem.errors ? Object.values(problem.errors).join('. ') : '';
      throw new ApiError(response.status, fieldErrors ? `${message}: ${fieldErrors}` : message, problem.errors);
    }
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, 'Cannot reach the server. Is the backend running on port 8080?');
  }
}

export const backend = {
  register: (email: string, password: string, timezone: string) =>
    request<UserDto>('/api/auth/register', 'POST', { email, password, timezone }),
  login: (email: string, password: string) => request<UserDto>('/api/auth/login', 'POST', { email, password }),
  me: () => request<UserDto>('/api/auth/me'),
  logout: () => request<void>('/api/auth/logout', 'POST'),

  tasks: {
    list: () => request<TaskDto[]>('/api/tasks'),
    create: (body: TaskRequestDto) => request<TaskDto>('/api/tasks', 'POST', body),
    update: (id: number, body: TaskRequestDto) => request<TaskDto>(`/api/tasks/${id}`, 'PUT', body),
    complete: (id: number) => request<TaskDto>(`/api/tasks/${id}/complete`, 'PUT'),
    reopen: (id: number) => request<TaskDto>(`/api/tasks/${id}/reopen`, 'PUT'),
    postpone: (id: number, dueDate: string) => request<TaskDto>(`/api/tasks/${id}/postpone`, 'PUT', { dueDate }),
    remove: (id: number) => request<void>(`/api/tasks/${id}`, 'DELETE'),
  },

  routines: {
    list: () => request<RoutineDto[]>('/api/routines'),
    create: (body: RoutineRequestDto) => request<RoutineDto>('/api/routines', 'POST', body),
    update: (id: number, body: RoutineRequestDto) => request<RoutineDto>(`/api/routines/${id}`, 'PUT', body),
    setActive: (id: number, active: boolean) => request<RoutineDto>(`/api/routines/${id}/active`, 'PUT', { active }),
    remove: (id: number) => request<void>(`/api/routines/${id}`, 'DELETE'),
  },

  occurrences: {
    list: (from: string, to: string) => request<OccurrenceDto[]>(`/api/occurrences?from=${from}&to=${to}`),
    setStatus: (id: number, status: 'PENDING' | 'COMPLETED' | 'SKIPPED') =>
      request<OccurrenceDto>(`/api/occurrences/${id}/status`, 'PUT', { status }),
    reschedule: (id: number, startTime: string, endTime: string) =>
      request<OccurrenceDto>(`/api/occurrences/${id}/reschedule`, 'PUT', { startTime, endTime }),
  },

  applications: {
    list: () => request<ApplicationDto[]>('/api/applications'),
    create: (body: ApplicationRequestDto) => request<ApplicationDto>('/api/applications', 'POST', body),
    update: (id: number, body: ApplicationRequestDto) => request<ApplicationDto>(`/api/applications/${id}`, 'PUT', body),
    changeStatus: (id: number, status: ApiApplicationStatus) =>
      request<ApplicationDto>(`/api/applications/${id}/status`, 'PUT', { status }),
    remove: (id: number) => request<void>(`/api/applications/${id}`, 'DELETE'),
    events: (id: number) => request<EventDto[]>(`/api/applications/${id}/events`),
    addEvent: (id: number, body: EventRequestDto) => request<EventDto>(`/api/applications/${id}/events`, 'POST', body),
  },
};
