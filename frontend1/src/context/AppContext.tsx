import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Task,
  Routine,
  JobApplication,
  EmailAlert,
  AppNotification,
  UserProfile,
  TaskStatus,
  ApplicationStatus,
  ApplicationTimelineEvent,
  ResumeFile
} from '../types';
import { INITIAL_EMAIL_ALERTS, INITIAL_USER, INITIAL_RESUMES } from '../mock/sampleData';
import { realtimeService } from '../services/realtimeService';
import { backend, ApiError } from '../services/backend';
import * as M from '../services/mappers';
import type { RoutineDto } from '../services/dto';
import { todayISO, addDaysISO } from '../utils/today';

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  authToken: string | null;
  authProvider: 'google' | 'credentials' | 'demo' | null;
  authLoading: boolean;
  registerWithCredentials: (name: string, email: string, password: string) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;

  // Backend sync state
  dataLoading: boolean;
  backendError: string | null;
  clearBackendError: () => void;
  refreshData: () => Promise<void>;

  // Data
  tasks: Task[];
  routines: Routine[];
  applications: JobApplication[];
  emailAlerts: EmailAlert[];
  notifications: AppNotification[];
  user: UserProfile;
  resumes: ResumeFile[];
  theme: 'light' | 'dark';
  selectedDate: string; // YYYY-MM-DD
  searchQuery: string;
  isQuickAddOpen: boolean;
  quickAddDefaultTab: 'task' | 'routine' | 'application' | 'interview' | 'followup' | 'note';

  // Email Linking & Authorization
  isEmailLinked: boolean;
  linkedEmailAccount: { email: string; provider: string; linkedAt: string } | null;
  linkEmailAccount: (email: string, provider?: string) => Promise<void>;
  unlinkEmailAccount: () => void;

  // Resume Management
  uploadResume: (file: { name: string; sizeBytes: number; fileType: string; notes?: string }) => ResumeFile;
  deleteResume: (id: string) => void;
  setActiveResume: (id: string) => void;

  // State setters
  setSelectedDate: (date: string) => void;
  setSearchQuery: (query: string) => void;
  toggleTheme: () => void;
  openQuickAdd: (tab?: 'task' | 'routine' | 'application' | 'interview' | 'followup' | 'note') => void;
  closeQuickAdd: () => void;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  postponeTask: (id: string, targetDate: string) => void;
  changeTaskTimeToday: (id: string, newTime: string) => void;
  triggerInboundEmailSimulation: () => void;

  // Routine actions
  addRoutine: (routine: Omit<Routine, 'id' | 'streakCount' | 'totalCompletions'>) => Routine;
  updateRoutine: (routine: Routine) => void;
  toggleRoutineActive: (id: string) => void;
  deleteRoutine: (id: string) => void;

  // Job Application actions
  addApplication: (app: Omit<JobApplication, 'id' | 'updatedAt' | 'timeline' | 'interviewsCount' | 'assessmentsCount'>) => JobApplication;
  updateApplication: (app: JobApplication) => void;
  deleteApplication: (id: string) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus, reason?: string) => void;
  addTimelineEvent: (applicationId: string, event: Omit<ApplicationTimelineEvent, 'id'>) => void;

  // Email Assistant actions
  approveEmailAlert: (alertId: string) => void;
  rejectEmailAlert: (alertId: string) => void;
  dismissEmailAlert: (alertId: string) => void;
  matchEmailToApplication: (alertId: string, applicationId: string) => void;

  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;

  // User actions
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'daypilot_v2_';

// Job-application fields the backend does not store yet (work mode, salary, recruiter phone).
// They are kept in this browser only, keyed by the real application id.
const EXTRAS_KEY = `${STORAGE_KEY_PREFIX}appExtras`;
const loadAppExtras = (): Record<string, M.AppExtras> => {
  try {
    return JSON.parse(localStorage.getItem(EXTRAS_KEY) || '{}');
  } catch {
    return {};
  }
};
const saveAppExtras = (id: string, extras: M.AppExtras) => {
  const all = loadAppExtras();
  all[id] = extras;
  localStorage.setItem(EXTRAS_KEY, JSON.stringify(all));
};
const isNumericId = (id: string) => /^\d+$/.test(id);
const isOccurrenceId = (id: string) => id.startsWith('occ-');
const numericId = (id: string) => Number(id.replace(/^occ-/, ''));
const isPersisted = (id: string) => Number.isInteger(numericId(id)) && !id.startsWith('tmp-');

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme initialization
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}theme`);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Authentication: a real cookie session with the Spring Boot API, verified on startup.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const authToken: string | null = null; // the session lives in an HttpOnly cookie that scripts cannot read
  const authProvider: 'google' | 'credentials' | 'demo' | null = isAuthenticated ? 'credentials' : null;
  const routineDtos = useRef<Map<string, RoutineDto>>(new Map());
  const refreshCounter = useRef(0);

  // Today default date
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick-Add Modal
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [quickAddDefaultTab, setQuickAddDefaultTab] = useState<'task' | 'routine' | 'application' | 'interview' | 'followup' | 'note'>('task');

  // Tasks, routines and applications are loaded from the backend (MySQL) after login.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const [emailAlerts, setEmailAlerts] = useState<EmailAlert[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}emailAlerts`);
      return saved ? JSON.parse(saved) : INITIAL_EMAIL_ALERTS;
    } catch {
      return INITIAL_EMAIL_ALERTS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [resumes, setResumes] = useState<ResumeFile[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}resumes`);
      return saved ? JSON.parse(saved) : INITIAL_RESUMES;
    } catch {
      return INITIAL_RESUMES;
    }
  });

  // Email Linking / Explicit Authorization state
  const [isEmailLinked, setIsEmailLinked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}isEmailLinked`);
      return saved !== null ? saved === 'true' : false;
    } catch {
      return false;
    }
  });

  const [linkedEmailAccount, setLinkedEmailAccount] = useState<{ email: string; provider: string; linkedAt: string } | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}linkedEmailAccount`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}emailAlerts`, JSON.stringify(emailAlerts));
  }, [emailAlerts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}resumes`, JSON.stringify(resumes));
  }, [resumes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}isEmailLinked`, String(isEmailLinked));
  }, [isEmailLinked]);

  useEffect(() => {
    if (linkedEmailAccount) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}linkedEmailAccount`, JSON.stringify(linkedEmailAccount));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}linkedEmailAccount`);
    }
  }, [linkedEmailAccount]);

  // Sync dark class on <html>
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}theme`, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const openQuickAdd = (tab: 'task' | 'routine' | 'application' | 'interview' | 'followup' | 'note' = 'task') => {
    setQuickAddDefaultTab(tab);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => {
    setIsQuickAddOpen(false);
  };

  // --- Sync helpers: optimistic UI update, then the real API call, then reload from the server ---
  const describeError = (e: unknown): string => (e instanceof ApiError ? e.message : 'Something went wrong');

  const pushNotification = (title: string, message: string) => {
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        message,
        type: 'system',
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  const sync = (label: string, action: () => Promise<unknown>) => {
    action()
      .then(() => refreshData())
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        pushNotification(`Could not ${label}`, describeError(e));
        refreshData(); // roll the screen back to what the server really has
      });
  };

  // --- Task Methods ---
  // A "task" on screen is either a flexible task (tasks table) or one day of a routine (occurrence, id "occ-N").
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `tmp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    sync('add the task', () => backend.tasks.create(M.toTaskRequest(taskData)));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Task Created',
        message: `"${newTask.title}" added for ${newTask.dueDate}`,
        type: 'task_due',
        timestamp: 'Just now',
        read: false,
        relatedEntityType: 'task',
        relatedEntityId: newTask.id,
      },
      ...prev,
    ]);
    return newTask;
  };

  const updateTask = (updated: Task) => {
    const previous = tasks.find((t) => t.id === updated.id);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (!previous || !isPersisted(updated.id)) return;
    const id = numericId(updated.id);

    if (isOccurrenceId(updated.id)) {
      sync('update the routine item', async () => {
        if (updated.scheduledTime && updated.scheduledTime !== previous.scheduledTime) {
          await backend.occurrences.reschedule(
            id, updated.scheduledTime, M.addMinutesToTime(updated.scheduledTime, updated.durationMinutes));
        }
        const apiStatus = M.occurrenceStatusToApi(updated.status);
        if (updated.status !== previous.status && apiStatus) await backend.occurrences.setStatus(id, apiStatus);
      });
      return;
    }
    sync('update the task', async () => {
      await backend.tasks.update(id, M.toTaskRequest(updated));
      if (updated.status !== previous.status) {
        if (updated.status === 'completed') await backend.tasks.complete(id);
        else if (updated.status === 'pending') await backend.tasks.reopen(id);
      }
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (!isPersisted(id)) return;
    if (isOccurrenceId(id)) {
      // A routine day cannot be deleted on its own; marking it skipped keeps the history honest.
      sync('remove the routine item', () => backend.occurrences.setStatus(numericId(id), 'SKIPPED'));
    } else {
      sync('delete the task', () => backend.tasks.remove(numericId(id)));
    }
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || !isPersisted(id)) return;
    const num = numericId(id);
    const stamp = status === 'completed' ? new Date().toISOString() : undefined;

    if (isOccurrenceId(id)) {
      const apiStatus = M.occurrenceStatusToApi(status);
      if (!apiStatus) return;
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status, completedAt: stamp } : t)));
      sync('update the routine item', () => backend.occurrences.setStatus(num, apiStatus));
      return;
    }
    if (status === 'completed') {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status, completedAt: stamp } : t)));
      sync('complete the task', () => backend.tasks.complete(num));
    } else if (status === 'pending') {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status, completedAt: undefined } : t)));
      sync('reopen the task', () => backend.tasks.reopen(num));
    } else if (status === 'skipped') {
      // "Not today" moves a flexible task to the next day.
      const next = M.nextDay(task.dueDate);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'pending', dueDate: next } : t)));
      sync('move the task to tomorrow', () => backend.tasks.postpone(num, next));
    }
  };

  const postponeTask = (id: string, targetDate: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || !isPersisted(id)) return;
    const num = numericId(id);

    if (isOccurrenceId(id)) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'skipped' } : t)));
      sync('skip the routine item', () => backend.occurrences.setStatus(num, 'SKIPPED'));
      pushNotification('Routine item skipped', 'A routine day cannot move to another date, so it was marked skipped.');
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'pending', dueDate: targetDate } : t)));
    if (targetDate > task.dueDate) {
      sync('postpone the task', () => backend.tasks.postpone(num, targetDate));
    } else {
      sync('reschedule the task', () => backend.tasks.update(num, M.toTaskRequest({ ...task, dueDate: targetDate })));
    }
  };

  const changeTaskTimeToday = (id: string, newTime: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || !isPersisted(id)) return;
    const num = numericId(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, scheduledTime: newTime, status: 'pending' } : t)));

    if (isOccurrenceId(id)) {
      sync('change the time', () =>
        backend.occurrences.reschedule(num, newTime, M.addMinutesToTime(newTime, task.durationMinutes)));
    } else {
      sync('change the time', () => backend.tasks.update(num, M.toTaskRequest({ ...task, scheduledTime: newTime })));
    }
    pushNotification('Task Rescheduled for Today', `Task rescheduled to ${newTime} today.`);
  };

  const triggerInboundEmailSimulation = () => {
    const companies = ['Stripe', 'Example Technologies', 'Atlassian', 'Datadog'];
    const chosenCompany = companies[Math.floor(Math.random() * companies.length)];
    const newAlert: EmailAlert = {
      id: `em-live-${Date.now()}`,
      senderName: `${chosenCompany} Engineering Recruiting`,
      senderEmail: `talent@${chosenCompany.toLowerCase().replace(/\s+/g, '')}.com`,
      subject: `Update on your Application at ${chosenCompany}: Upcoming Technical Discussion`,
      receivedDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      snippet: `Hi ${user.name.split(' ')[0]}, the engineering team at ${chosenCompany} would like to coordinate a video loop discussion with you...`,
      body: `Hello ${user.name},\n\nThank you for speaking with our team! The hiring panel reviewed your architecture profile and wants to coordinate your upcoming technical discussion.\n\nPlease confirm availability for next week.\n\nWarm regards,\n${chosenCompany} Talent Team`,
      companyDetected: chosenCompany,
      roleDetected: user.targetRole,
      category: 'interview_invite',
      aiConfidence: 96,
      suggestedAction: {
        targetStatus: 'interview',
        eventTitle: `Technical Interview — ${chosenCompany}`,
        eventDate: addDaysISO(4),
        eventTime: '14:00',
        createPrepTask: true,
        prepTaskTitle: `Prepare for ${chosenCompany} Technical Round`,
        description: `Update application to Interview and schedule preparation session.`,
      },
      reviewStatus: 'pending',
    };

    setEmailAlerts((prev) => [newAlert, ...prev]);

    // Broadcast in real-time
    realtimeService.broadcastSimulatedEvent('EMAIL_ALERT_DETECTED', newAlert.id, newAlert);

    // Push to in-app notifications
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `📩 Inbound Email: ${chosenCompany}`,
        message: `"${newAlert.subject}" received. AI parsed interview invitation ready for review.`,
        type: 'email_alert',
        timestamp: 'Just now',
        read: false,
        relatedEntityType: 'email',
        relatedEntityId: newAlert.id,
      },
      ...prev,
    ]);
  };

  // --- Routine Methods ---
  const addRoutine = (routineData: Omit<Routine, 'id' | 'streakCount' | 'totalCompletions'>): Routine => {
    const newRoutine: Routine = {
      ...routineData,
      id: `tmp-${Date.now()}`,
      streakCount: 0,
      totalCompletions: 0,
    };
    setRoutines((prev) => [...prev, newRoutine]);
    sync('create the routine', () => backend.routines.create(M.toRoutineRequest(routineData, todayISO(), null)));
    return newRoutine;
  };

  const updateRoutine = (updated: Routine) => {
    setRoutines((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    const dto = routineDtos.current.get(updated.id);
    if (!dto) return;
    sync('update the routine', async () => {
      await backend.routines.update(dto.id, M.toRoutineRequest(updated, dto.startDate, dto.endDate));
      if (updated.isActive !== dto.active) await backend.routines.setActive(dto.id, updated.isActive);
    });
  };

  const toggleRoutineActive = (id: string) => {
    const dto = routineDtos.current.get(id);
    const current = routines.find((r) => r.id === id);
    if (!dto || !current) return;
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
    sync('change the routine', () => backend.routines.setActive(dto.id, !current.isActive));
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    const dto = routineDtos.current.get(id);
    if (!dto) return;
    // Past days stay in your history; future pending days are removed by the server.
    sync('delete the routine', () => backend.routines.remove(dto.id));
  };

  // --- Job Application Methods ---
  const addApplication = (
    appData: Omit<JobApplication, 'id' | 'updatedAt' | 'timeline' | 'interviewsCount' | 'assessmentsCount'>
  ): JobApplication => {
    const newApp: JobApplication = {
      ...appData,
      id: `tmp-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      interviewsCount: 0,
      assessmentsCount: 0,
      timeline: [
        {
          id: `ev-${Date.now()}`,
          date: appData.applicationDate || todayISO(),
          title: `Application Submitted (${appData.companyName})`,
          description: `Applied for ${appData.jobTitle} via ${appData.source}`,
          type: 'applied',
        },
      ],
    };
    setApplications((prev) => [newApp, ...prev]);
    sync('save the application', async () => {
      const created = await backend.applications.create(
        M.toApplicationRequest(appData, M.statusToApi(appData.currentStatus)));
      saveAppExtras(String(created.id), M.extrasOf(appData));
    });
    return newApp;
  };

  const updateApplication = (updated: JobApplication) => {
    const previous = applications.find((a) => a.id === updated.id);
    setApplications((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : a))
    );
    if (!previous || !isNumericId(updated.id)) return;
    const id = Number(updated.id);
    saveAppExtras(updated.id, M.extrasOf(updated));
    sync('update the application', async () => {
      await backend.applications.update(id, M.toApplicationRequest(updated));
      if (previous.currentStatus !== updated.currentStatus) {
        await backend.applications.changeStatus(id, M.statusToApi(updated.currentStatus));
      }
    });
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    if (!isNumericId(id)) return;
    sync('delete the application', () => backend.applications.remove(Number(id)));
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus, reason?: string) => {
    if (!isNumericId(id) || !applications.some((a) => a.id === id)) return;
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const newTimelineEvent: ApplicationTimelineEvent = {
          id: `ev-${Date.now()}`,
          date: todayISO(),
          title: `Status updated to: ${status.toUpperCase()}`,
          description: reason || 'Updated via pipeline management.',
          type: 'status_change',
        };
        return { ...app, currentStatus: status, timeline: [newTimelineEvent, ...app.timeline], updatedAt: new Date().toISOString() };
      })
    );
    sync('change the status', () => backend.applications.changeStatus(Number(id), M.statusToApi(status)));
  };

  const addTimelineEvent = (applicationId: string, eventData: Omit<ApplicationTimelineEvent, 'id'>) => {
    if (!isNumericId(applicationId) || !applications.some((a) => a.id === applicationId)) return;
    const request = M.toEventRequest(eventData, todayISO());
    if (!request) return;
    setApplications((prev) =>
      prev.map((app) =>
        app.id !== applicationId ? app : {
          ...app,
          timeline: [{ ...eventData, id: `ev-${Date.now()}` }, ...app.timeline],
          interviewsCount: eventData.type === 'interview' ? app.interviewsCount + 1 : app.interviewsCount,
          assessmentsCount: eventData.type === 'assessment' ? app.assessmentsCount + 1 : app.assessmentsCount,
          updatedAt: new Date().toISOString(),
        }
      )
    );
    sync('add the event', () => backend.applications.addEvent(Number(applicationId), request));
  };

  // --- Email Assistant Approval & Execution ---
  const approveEmailAlert = (alertId: string) => {
    const alert = emailAlerts.find((a) => a.id === alertId);
    if (!alert) return;

    // 1. Mark alert as approved
    setEmailAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, reviewStatus: 'approved' } : a))
    );

    // 2. If matched application exists and target status suggested, update application status & timeline!
    if (alert.matchedApplicationId && alert.suggestedAction.targetStatus) {
      updateApplicationStatus(
        alert.matchedApplicationId,
        alert.suggestedAction.targetStatus,
        `Approved via AI Email Assistant: "${alert.subject}"`
      );

      // Add timeline event
      if (alert.suggestedAction.eventTitle) {
        addTimelineEvent(alert.matchedApplicationId, {
          date: alert.suggestedAction.eventDate || todayISO(),
          title: alert.suggestedAction.eventTitle,
          description: `Extracted from email: ${alert.snippet}`,
          type: alert.suggestedAction.targetStatus === 'interview' ? 'interview' : 'assessment',
        });
      }
    }

    // 3. If prep task requested, create high priority task!
    if (alert.suggestedAction.createPrepTask && alert.suggestedAction.prepTaskTitle) {
      addTask({
        title: alert.suggestedAction.prepTaskTitle,
        description: `Prep task auto-generated from approved email from ${alert.companyDetected}`,
        category: 'interview_prep',
        priority: 'high',
        dueDate: alert.suggestedAction.eventDate || todayISO(),
        scheduledTime: alert.suggestedAction.eventTime || '10:00',
        durationMinutes: 60,
        status: 'pending',
        relatedApplicationId: alert.matchedApplicationId,
      });
    }

    // Push confirmation notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Email Action Approved',
        message: `Updated status & scheduled events for ${alert.companyDetected}.`,
        type: 'email_alert',
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  const rejectEmailAlert = (alertId: string) => {
    setEmailAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, reviewStatus: 'rejected' } : a))
    );
  };

  const dismissEmailAlert = (alertId: string) => {
    setEmailAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, reviewStatus: 'dismissed' } : a))
    );
  };

  const matchEmailToApplication = (alertId: string, applicationId: string) => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    setEmailAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              matchedApplicationId: applicationId,
              companyDetected: targetApp.companyName,
              roleDetected: targetApp.jobTitle,
              category: 'recruiter_followup',
              aiConfidence: 100,
            }
          : a
      )
    );
  };

  // --- Notifications ---
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...profile };
      // Keep name in sync if firstName/lastName changed
      if (profile.firstName !== undefined || profile.lastName !== undefined) {
        const fn = profile.firstName !== undefined ? profile.firstName : (prev.firstName || prev.name.split(' ')[0] || '');
        const ln = profile.lastName !== undefined ? profile.lastName : (prev.lastName || prev.name.split(' ').slice(1).join(' ') || '');
        updated.name = `${fn} ${ln}`.trim() || prev.name;
      }
      return updated;
    });
  };

  // --- Email Account Linking / Authorization ---
  const linkEmailAccount = async (emailToLink: string, provider: string = 'Gmail') => {
    const linkedInfo = {
      email: emailToLink,
      provider,
      linkedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setIsEmailLinked(true);
    setLinkedEmailAccount(linkedInfo);

    // Push security notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Email Account Linked',
        message: `Successfully connected ${emailToLink} (${provider}). DayPilot is now tracking recruitment emails.`,
        type: 'email_alert',
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  const unlinkEmailAccount = () => {
    setIsEmailLinked(false);
    setLinkedEmailAccount(null);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Email Monitoring Disconnected',
        message: 'Email inbox tracking has been paused and access revoked.',
        type: 'system',
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  // --- Resume Management ---
  const uploadResume = (file: { name: string; sizeBytes: number; fileType: string; notes?: string }): ResumeFile => {
    const newResume: ResumeFile = {
      id: `res-${Date.now()}`,
      name: file.name,
      sizeBytes: file.sizeBytes,
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fileType: file.fileType,
      isActive: resumes.length === 0, // Make primary if first resume
      notes: file.notes || 'Uploaded via Resume Manager',
    };

    setResumes((prev) => [newResume, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Resume Uploaded',
        message: `Added ${file.name} to your profile document repository.`,
        type: 'system',
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return newResume;
  };

  const deleteResume = (id: string) => {
    setResumes((prev) => {
      const remaining = prev.filter((r) => r.id !== id);
      // If deleted resume was active, make first remaining resume active
      if (remaining.length > 0 && !remaining.some((r) => r.isActive)) {
        remaining[0].isActive = true;
      }
      return remaining;
    });
  };

  const setActiveResume = (id: string) => {
    setResumes((prev) =>
      prev.map((r) => ({
        ...r,
        isActive: r.id === id,
      }))
    );
  };

  // --- Session and data loading (real backend) ---
  const applyProfile = (email: string, timezone: string, name?: string) => {
    setUser((prev) => {
      const sameUser = prev.email === email;
      const base: UserProfile = sameUser
        ? prev
        : { ...INITIAL_USER, name: '', firstName: undefined, lastName: undefined, phone: '', bio: '', location: '', targetRole: '', avatarUrl: '' };
      const displayName = name?.trim() || (sameUser && prev.name ? prev.name : email.split('@')[0]);
      return { ...base, email, timezone, name: displayName };
    });
  };

  const refreshData = useCallback(async () => {
    const ticket = ++refreshCounter.current;
    setDataLoading(true);
    try {
      const today = todayISO();
      const [taskDtos, rDtos, occDtos, appDtos] = await Promise.all([
        backend.tasks.list(),
        backend.routines.list(),
        backend.occurrences.list(addDaysISO(-30), addDaysISO(30)),
        backend.applications.list(),
      ]);
      const eventLists = await Promise.all(appDtos.map((a) => backend.applications.events(a.id)));
      if (ticket !== refreshCounter.current) return; // a newer refresh is already running
      routineDtos.current = new Map(rDtos.map((r) => [String(r.id), r]));
      const extras = loadAppExtras();
      setTasks([...taskDtos.map((t) => M.toTask(t, today)), ...occDtos.map(M.toOccurrenceTask)]);
      setRoutines(rDtos.map((r) => M.toRoutine(r, M.routineStats(r.id, occDtos, today))));
      setApplications(appDtos.map((a, i) => M.toApplication(a, eventLists[i], extras[String(a.id)])));
      setBackendError(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setIsAuthenticated(false);
      } else if (ticket === refreshCounter.current) {
        setBackendError(describeError(e));
      }
    } finally {
      if (ticket === refreshCounter.current) setDataLoading(false);
    }
  }, []);

  // On startup: is there still a valid session cookie?
  useEffect(() => {
    backend
      .me()
      .then((me) => {
        applyProfile(me.email, me.timezone);
        setIsAuthenticated(true);
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) refreshData();
  }, [isAuthenticated, refreshData]);

  const loginWithCredentials = async (email: string, password: string) => {
    const me = await backend.login(email.trim(), password);
    applyProfile(me.email, me.timezone);
    setIsAuthenticated(true);
  };

  const registerWithCredentials = async (name: string, email: string, password: string) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    await backend.register(email.trim(), password, timezone);
    const me = await backend.login(email.trim(), password);
    applyProfile(me.email, me.timezone, name);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setTasks([]);
    setRoutines([]);
    setApplications([]);
    setNotifications([]);
    setBackendError(null);
    routineDtos.current = new Map();
    backend.logout().catch(() => undefined);
  };

  const clearBackendError = () => setBackendError(null);

  // Reloads everything from the server and restores the demo email alerts.
  const resetToSampleData = () => {
    localStorage.removeItem(EXTRAS_KEY);
    setEmailAlerts(INITIAL_EMAIL_ALERTS);
    setNotifications([]);
    refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        authToken,
        authProvider,
        registerWithCredentials,
        loginWithCredentials,
        logout,
        dataLoading,
        backendError,
        clearBackendError,
        refreshData,
        tasks,
        routines,
        applications,
        emailAlerts,
        notifications,
        user,
        resumes,
        theme,
        selectedDate,
        searchQuery,
        isQuickAddOpen,
        quickAddDefaultTab,
        isEmailLinked,
        linkedEmailAccount,
        linkEmailAccount,
        unlinkEmailAccount,
        uploadResume,
        deleteResume,
        setActiveResume,
        setSelectedDate,
        setSearchQuery,
        toggleTheme,
        openQuickAdd,
        closeQuickAdd,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        postponeTask,
        changeTaskTimeToday,
        triggerInboundEmailSimulation,
        addRoutine,
        updateRoutine,
        toggleRoutineActive,
        deleteRoutine,
        addApplication,
        updateApplication,
        deleteApplication,
        updateApplicationStatus,
        addTimelineEvent,
        approveEmailAlert,
        rejectEmailAlert,
        dismissEmailAlert,
        matchEmailToApplication,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        updateUserProfile,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
