export type Priority = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'postponed' | 'skipped';

export type TaskCategory = 
  | 'development' 
  | 'job_search' 
  | 'learning' 
  | 'interview_prep' 
  | 'routine' 
  | 'personal' 
  | 'general';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  durationMinutes: number; // e.g. 45
  status: TaskStatus;
  notes?: string;
  relatedApplicationId?: string;
  isRoutineInstance?: boolean;
  routineId?: string;
  completedAt?: string;
  postponedTo?: string;
  createdAt: string;
}

export type RoutineFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Routine {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationMinutes: number;
  frequency: RoutineFrequency;
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  isActive: boolean;
  color: string;
  streakCount: number;
  totalCompletions: number;
  /** completed / (completed + missed) over the loaded period; undefined until a day has finished */
  reliabilityPct?: number;
}

export type ApplicationStatus = 
  | 'interested'
  | 'applied'
  | 'assessment'
  | 'interview'
  | 'selected'
  | 'rejected'
  | 'withdrawn'
  | 'on_hold';

export interface ApplicationTimelineEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  type: 'applied' | 'acknowledgment' | 'assessment' | 'interview' | 'offer' | 'rejection' | 'note' | 'status_change';
  roundNumber?: number;
}

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  jobPostingUrl?: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  applicationDate: string; // YYYY-MM-DD
  source: string; // LinkedIn, Indeed, Company Site, Referral, etc.
  employmentType: 'full_time' | 'contract' | 'internship' | 'part_time';
  resumeVersion: string;
  salaryRange?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  notes: string;
  currentStatus: ApplicationStatus;
  nextAction?: string;
  followUpDate?: string; // YYYY-MM-DD
  timeline: ApplicationTimelineEvent[];
  interviewsCount: number;
  assessmentsCount: number;
  updatedAt: string;
}

export type EmailCategory = 
  | 'acknowledgment'
  | 'assessment_invite'
  | 'interview_invite'
  | 'selection_offer'
  | 'rejection'
  | 'recruiter_followup'
  | 'unmatched'
  | 'needs_review';

export interface EmailAlert {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  receivedDate: string; // YYYY-MM-DD HH:mm
  snippet: string;
  body: string;
  companyDetected: string;
  roleDetected: string;
  category: EmailCategory;
  aiConfidence: number; // 0 - 100%
  matchedApplicationId?: string;
  suggestedAction: {
    targetStatus?: ApplicationStatus;
    eventTitle?: string;
    eventDate?: string;
    eventTime?: string;
    createPrepTask?: boolean;
    prepTaskTitle?: string;
    syncCalendar?: boolean;
    description?: string;
  };
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'dismissed';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'interview' | 'assessment' | 'task_due' | 'overdue' | 'email_alert' | 'followup' | 'system';
  timestamp: string;
  read: boolean;
  relatedEntityType?: 'task' | 'application' | 'email';
  relatedEntityId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // YYYY-MM-DDTHH:mm
  end: string;
  type: 'task' | 'routine' | 'interview' | 'assessment' | 'followup' | 'external';
  color: string;
  referenceId?: string;
  status?: string;
}

export interface ResumeFile {
  id: string;
  name: string;
  sizeBytes: number;
  uploadedAt: string;
  fileType: string;
  isActive: boolean;
  notes?: string;
}

export interface UserProfile {
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  email: string;
  avatarUrl: string;
  targetRole: string;
  timezone: string;
  weeklyGoalHours: number;
  workDays: number[];
}

export interface DailyInsight {
  id: string;
  type: 'priority' | 'unfinished' | 'deadline' | 'routine_warning' | 'tip';
  title: string;
  description: string;
  actionText?: string;
  actionPayload?: any;
}
