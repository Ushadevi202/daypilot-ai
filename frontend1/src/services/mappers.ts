// Pure functions that translate between the Spring Boot API shapes and the UI shapes.
// No runtime imports on purpose, so the mapper tests can run with plain Node.
import type {
  Task, Routine, RoutineFrequency, JobApplication, ApplicationStatus,
  ApplicationTimelineEvent, TaskCategory, Priority, TaskStatus,
} from '../types';
import type {
  TaskDto, TaskRequestDto, RoutineDto, RoutineRequestDto, OccurrenceDto,
  ApplicationDto, ApplicationRequestDto, EventDto, EventRequestDto,
  ApiApplicationStatus, ApiEventType, ApiOccurrenceStatus,
} from './dto';

/** Fields the backend does not store yet. They are kept in this browser only. */
export interface AppExtras {
  locationType?: 'remote' | 'hybrid' | 'onsite';
  salaryRange?: string;
  recruiterPhone?: string;
}

const CATEGORIES: string[] = [
  'development', 'job_search', 'learning', 'interview_prep', 'routine', 'personal', 'general',
];
const ROUTINE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const asCategory = (value: string | null | undefined): TaskCategory =>
  (CATEGORIES.includes(value ?? '') ? value : 'general') as TaskCategory;

export const hhmm = (t: string | null | undefined): string | undefined => (t ? t.slice(0, 5) : undefined);

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = Math.min(h * 60 + m + Math.max(minutes, 1), 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// ---------- tasks ----------

export function toTask(dto: TaskDto, today: string): Task {
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description ?? undefined,
    category: asCategory(dto.category),
    priority: dto.priority.toLowerCase() as Priority,
    dueDate: dto.dueDate ?? today,
    scheduledTime: hhmm(dto.scheduledTime),
    durationMinutes: dto.estimatedMinutes ?? 30,
    status: dto.status === 'COMPLETED' ? 'completed' : 'pending',
    notes: dto.notes ?? undefined,
    completedAt: dto.completedAt ?? undefined,
    createdAt: '', // the API does not return it
  };
}

export function toTaskRequest(t: Pick<Task, 'title' | 'category' | 'priority'> & Partial<Task>): TaskRequestDto {
  const minutes = t.durationMinutes && t.durationMinutes > 0 ? Math.min(Math.round(t.durationMinutes), 1440) : null;
  const dueDate = t.dueDate || null;
  return {
    title: t.title.trim(),
    description: t.description?.trim() || null,
    category: t.category || null,
    priority: t.priority.toUpperCase() as TaskRequestDto['priority'],
    dueDate,
    scheduledTime: dueDate && t.scheduledTime ? t.scheduledTime : null,
    estimatedMinutes: minutes,
    notes: t.notes?.trim() || null,
  };
}

// ---------- routine items (occurrences) ----------

export function occurrenceStatusToUi(status: ApiOccurrenceStatus): TaskStatus {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'SKIPPED') return 'skipped';
  return 'pending'; // a MISSED day shows as an overdue, still-open item
}

export function occurrenceStatusToApi(status: string): 'PENDING' | 'COMPLETED' | 'SKIPPED' | null {
  if (status === 'completed') return 'COMPLETED';
  if (status === 'skipped') return 'SKIPPED';
  if (status === 'pending') return 'PENDING';
  return null;
}

export function toOccurrenceTask(o: OccurrenceDto): Task {
  return {
    id: `occ-${o.id}`,
    title: o.title,
    description: o.description ?? undefined,
    category: 'routine',
    priority: 'medium',
    dueDate: o.date,
    scheduledTime: hhmm(o.startTime),
    durationMinutes: o.estimatedMinutes,
    status: occurrenceStatusToUi(o.status),
    isRoutineInstance: true,
    routineId: o.routineId != null ? String(o.routineId) : undefined,
    completedAt: o.completedAt ?? undefined,
    createdAt: '',
  };
}

// ---------- routines ----------

const sameSet = (a: number[], b: number[]) => a.length === b.length && b.every((x) => a.includes(x));

export function routineStats(routineId: number, occurrences: OccurrenceDto[], today: string) {
  const mine = occurrences
    .filter((o) => o.routineId === routineId && o.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));
  const completed = mine.filter((o) => o.status === 'COMPLETED').length;
  const missed = mine.filter((o) => o.status === 'MISSED').length;

  let streak = 0;
  let first = true;
  for (const o of mine) {
    if (first && o.date === today && o.status === 'PENDING') {
      first = false; // today is still open, so it neither extends nor breaks the streak
      continue;
    }
    first = false;
    if (o.status === 'COMPLETED') streak += 1;
    else break;
  }
  const finished = completed + missed;
  return {
    streak,
    completions: completed,
    reliabilityPct: finished > 0 ? Math.round((completed * 100) / finished) : undefined,
  };
}

export function toRoutine(dto: RoutineDto, stats: { streak: number; completions: number; reliabilityPct?: number }): Routine {
  const days = dto.daysOfWeek.map((d) => DAY_NAMES.indexOf(d)).filter((i) => i >= 0).sort((a, b) => a - b);
  let frequency: RoutineFrequency = 'daily';
  if (dto.recurrenceType === 'WEEKLY') {
    frequency = sameSet(days, [1, 2, 3, 4, 5]) ? 'weekdays' : sameSet(days, [0, 6]) ? 'weekends' : 'custom';
  }
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description ?? '',
    category: 'routine',
    startTime: dto.startTime.slice(0, 5),
    endTime: dto.endTime.slice(0, 5),
    durationMinutes: dto.estimatedMinutes,
    frequency,
    daysOfWeek: dto.recurrenceType === 'DAILY' ? [0, 1, 2, 3, 4, 5, 6] : days,
    isActive: dto.active,
    color: ROUTINE_COLORS[dto.id % ROUTINE_COLORS.length],
    streakCount: stats.streak,
    totalCompletions: stats.completions,
    reliabilityPct: stats.reliabilityPct,
  };
}

export function toRoutineRequest(
  r: Pick<Routine, 'title' | 'description' | 'startTime' | 'endTime' | 'frequency' | 'daysOfWeek'>,
  startDate: string,
  endDate: string | null,
): RoutineRequestDto {
  let days: string[] = [];
  if (r.frequency === 'weekdays') days = DAY_NAMES.slice(1, 6);
  else if (r.frequency === 'weekends') days = ['SATURDAY', 'SUNDAY'];
  else if (r.frequency === 'custom') days = [...r.daysOfWeek].sort((a, b) => a - b).map((i) => DAY_NAMES[i]);
  return {
    title: r.title.trim(),
    description: r.description?.trim() || null,
    startTime: r.startTime,
    endTime: r.endTime,
    recurrenceType: r.frequency === 'daily' ? 'DAILY' : 'WEEKLY',
    daysOfWeek: days,
    startDate,
    endDate,
  };
}

// ---------- job applications ----------

const STATUS_TO_UI: Record<ApiApplicationStatus, ApplicationStatus> = {
  INTERESTED: 'interested', APPLIED: 'applied', ASSESSMENT: 'assessment', INTERVIEW: 'interview',
  OFFER: 'selected', REJECTED: 'rejected', WITHDRAWN: 'withdrawn', ON_HOLD: 'on_hold',
};
const STATUS_TO_API: Record<ApplicationStatus, ApiApplicationStatus> = {
  interested: 'INTERESTED', applied: 'APPLIED', assessment: 'ASSESSMENT', interview: 'INTERVIEW',
  selected: 'OFFER', rejected: 'REJECTED', withdrawn: 'WITHDRAWN', on_hold: 'ON_HOLD',
};
const EMPLOYMENT_TO_UI = {
  FULL_TIME: 'full_time', PART_TIME: 'part_time', INTERNSHIP: 'internship', CONTRACT: 'contract',
} as const;
const EMPLOYMENT_TO_API = {
  full_time: 'FULL_TIME', part_time: 'PART_TIME', internship: 'INTERNSHIP', contract: 'CONTRACT',
} as const;

export const statusToApi = (s: ApplicationStatus): ApiApplicationStatus => STATUS_TO_API[s];

const EVENT_TITLES: Record<ApiEventType, string> = {
  SUBMITTED: 'Application submitted',
  ACKNOWLEDGED: 'Application acknowledged',
  ASSESSMENT_INVITATION: 'Assessment invitation',
  ASSESSMENT_DEADLINE: 'Assessment',
  INTERVIEW_ROUND_1: 'Interview, round 1',
  INTERVIEW_ROUND_2: 'Interview, round 2',
  INTERVIEW_FURTHER: 'Interview, further round',
  OFFER: 'Selected / offer',
  REJECTION: 'Rejection',
  FOLLOW_UP_SENT: 'Follow-up sent',
  FOLLOW_UP_REMINDER: 'Follow-up reminder',
  STATUS_CHANGE: 'Status updated',
  OTHER: 'Note',
};

function eventUiType(type: ApiEventType): ApplicationTimelineEvent['type'] {
  switch (type) {
    case 'SUBMITTED': return 'applied';
    case 'ACKNOWLEDGED': return 'acknowledgment';
    case 'ASSESSMENT_INVITATION':
    case 'ASSESSMENT_DEADLINE': return 'assessment';
    case 'INTERVIEW_ROUND_1':
    case 'INTERVIEW_ROUND_2':
    case 'INTERVIEW_FURTHER': return 'interview';
    case 'OFFER': return 'offer';
    case 'REJECTION': return 'rejection';
    case 'STATUS_CHANGE': return 'status_change';
    default: return 'note';
  }
}

export function toTimelineEvent(e: EventDto): ApplicationTimelineEvent {
  const round = e.type === 'INTERVIEW_ROUND_1' ? 1 : e.type === 'INTERVIEW_ROUND_2' ? 2 : e.type === 'INTERVIEW_FURTHER' ? 3 : undefined;
  const details = e.details ? e.details.replace(/\bOFFER\b/g, 'SELECTED') : undefined;
  const time = e.eventTime ? e.eventTime.slice(0, 5) : undefined;
  return {
    id: String(e.id),
    date: e.eventDate ?? e.createdAt.slice(0, 10),
    title: EVENT_TITLES[e.type],
    description: [time, details].filter(Boolean).join(' · ') || undefined,
    type: eventUiType(e.type),
    roundNumber: round,
  };
}

export function toEventRequest(
  ev: Omit<ApplicationTimelineEvent, 'id'>,
  fallbackDate: string,
): EventRequestDto | null {
  let type: ApiEventType;
  switch (ev.type) {
    case 'applied': type = 'SUBMITTED'; break;
    case 'acknowledgment': type = 'ACKNOWLEDGED'; break;
    case 'assessment': type = 'ASSESSMENT_DEADLINE'; break;
    case 'interview':
      type = ev.roundNumber === 2 ? 'INTERVIEW_ROUND_2' : ev.roundNumber && ev.roundNumber > 2 ? 'INTERVIEW_FURTHER' : 'INTERVIEW_ROUND_1';
      break;
    case 'offer': type = 'OFFER'; break;
    case 'rejection': type = 'REJECTION'; break;
    case 'note': type = 'OTHER'; break;
    default: return null; // status changes are written by the server itself
  }
  const details = [ev.title, ev.description].filter(Boolean).join(': ').slice(0, 1000);
  return { type, eventDate: ev.date || fallbackDate, eventTime: null, details: details || null };
}

export function toApplication(dto: ApplicationDto, events: EventDto[], extras?: AppExtras): JobApplication {
  return {
    id: String(dto.id),
    companyName: dto.company,
    jobTitle: dto.jobTitle,
    jobPostingUrl: dto.jobUrl ?? undefined,
    location: dto.location ?? '',
    locationType: extras?.locationType ?? 'onsite',
    applicationDate: dto.appliedDate ?? '',
    source: dto.source ?? '',
    employmentType: dto.employmentType ? EMPLOYMENT_TO_UI[dto.employmentType] : 'full_time',
    resumeVersion: dto.resumeNotes ?? '',
    salaryRange: extras?.salaryRange,
    recruiterName: dto.contactName ?? undefined,
    recruiterEmail: dto.contactEmail ?? undefined,
    recruiterPhone: extras?.recruiterPhone,
    notes: dto.notes ?? '',
    currentStatus: STATUS_TO_UI[dto.status],
    nextAction: dto.nextAction ?? undefined,
    followUpDate: dto.followUpDate ?? undefined,
    timeline: events.map(toTimelineEvent),
    interviewsCount: events.filter((e) => e.type.startsWith('INTERVIEW')).length,
    assessmentsCount: events.filter((e) => e.type.startsWith('ASSESSMENT')).length,
    updatedAt: dto.statusChangedAt,
  };
}

export function toApplicationRequest(
  a: Pick<JobApplication, 'companyName' | 'jobTitle'> & Partial<JobApplication>,
  status?: ApiApplicationStatus,
): ApplicationRequestDto {
  const req: ApplicationRequestDto = {
    company: a.companyName.trim(),
    jobTitle: a.jobTitle.trim(),
    jobUrl: a.jobPostingUrl?.trim() || null,
    location: a.location?.trim() || null,
    employmentType: a.employmentType ? EMPLOYMENT_TO_API[a.employmentType] : null,
    source: a.source?.trim() || null,
    appliedDate: a.applicationDate || null,
    resumeNotes: a.resumeVersion?.trim() || null,
    contactName: a.recruiterName?.trim() || null,
    contactEmail: a.recruiterEmail?.trim() || null,
    nextAction: a.nextAction?.trim() || null,
    followUpDate: a.followUpDate || null,
    notes: a.notes?.trim() || null,
  };
  if (status) req.status = status;
  return req;
}

export function extrasOf(a: Partial<JobApplication>): AppExtras {
  return { locationType: a.locationType, salaryRange: a.salaryRange, recruiterPhone: a.recruiterPhone };
}
