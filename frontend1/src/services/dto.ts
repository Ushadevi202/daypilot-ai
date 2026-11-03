// Shapes returned and accepted by the Spring Boot REST API (see backend/src/main/java/com/daypilot).

export interface UserDto {
  id: number;
  email: string;
  timezone: string;
}

export type ApiPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TaskDto {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  priority: ApiPriority;
  status: 'PENDING' | 'COMPLETED';
  dueDate: string | null;
  scheduledTime: string | null;
  estimatedMinutes: number | null;
  notes: string | null;
  postponedCount: number;
  overdue: boolean;
  completedAt: string | null;
}

export interface TaskRequestDto {
  title: string;
  description: string | null;
  category: string | null;
  priority: ApiPriority;
  dueDate: string | null;
  scheduledTime: string | null;
  estimatedMinutes: number | null;
  notes: string | null;
}

export interface RoutineDto {
  id: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  estimatedMinutes: number;
  recurrenceType: 'DAILY' | 'WEEKLY';
  daysOfWeek: string[];
  startDate: string;
  endDate: string | null;
  active: boolean;
}

export interface RoutineRequestDto {
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  recurrenceType: 'DAILY' | 'WEEKLY';
  daysOfWeek: string[];
  startDate: string;
  endDate: string | null;
}

export type ApiOccurrenceStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED' | 'MISSED';

export interface OccurrenceDto {
  id: number;
  routineId: number | null;
  date: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  estimatedMinutes: number;
  status: ApiOccurrenceStatus;
  rescheduled: boolean;
  completedAt: string | null;
}

export type ApiApplicationStatus =
  | 'INTERESTED' | 'APPLIED' | 'ASSESSMENT' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN' | 'ON_HOLD';

export interface ApplicationDto {
  id: number;
  company: string;
  jobTitle: string;
  jobUrl: string | null;
  location: string | null;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | null;
  source: string | null;
  status: ApiApplicationStatus;
  statusChangedAt: string;
  appliedDate: string | null;
  resumeNotes: string | null;
  contactName: string | null;
  contactEmail: string | null;
  nextAction: string | null;
  followUpDate: string | null;
  followUpDue: boolean;
  notes: string | null;
}

export interface ApplicationRequestDto {
  company: string;
  jobTitle: string;
  jobUrl: string | null;
  location: string | null;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | null;
  source: string | null;
  status?: ApiApplicationStatus;
  appliedDate: string | null;
  resumeNotes: string | null;
  contactName: string | null;
  contactEmail: string | null;
  nextAction: string | null;
  followUpDate: string | null;
  notes: string | null;
}

export type ApiEventType =
  | 'SUBMITTED' | 'ACKNOWLEDGED' | 'ASSESSMENT_INVITATION' | 'ASSESSMENT_DEADLINE'
  | 'INTERVIEW_ROUND_1' | 'INTERVIEW_ROUND_2' | 'INTERVIEW_FURTHER' | 'OFFER' | 'REJECTION'
  | 'FOLLOW_UP_SENT' | 'FOLLOW_UP_REMINDER' | 'STATUS_CHANGE' | 'OTHER';

export interface EventDto {
  id: number;
  type: ApiEventType;
  eventDate: string | null;
  eventTime: string | null;
  details: string | null;
  source: string;
  createdAt: string;
}

export interface EventRequestDto {
  type: ApiEventType;
  eventDate: string | null;
  eventTime: string | null;
  details: string | null;
}
