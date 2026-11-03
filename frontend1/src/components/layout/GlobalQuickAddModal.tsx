import { addDaysISO, todayISO } from '../../utils/today';
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, 
  Repeat, 
  Briefcase, 
  Calendar, 
  Sparkles,
  FileText
} from 'lucide-react';
import { Priority, TaskCategory, RoutineFrequency, ApplicationStatus } from '../../types';
import { aiService } from '../../services/aiService';

export const GlobalQuickAddModal: React.FC = () => {
  const { 
    isQuickAddOpen, 
    closeQuickAdd, 
    quickAddDefaultTab, 
    addTask, 
    addRoutine, 
    addApplication, 
    applications,
    addTimelineEvent,
    selectedDate
  } = useApp();

  const [activeTab, setActiveTab] = useState<'task' | 'routine' | 'application' | 'interview' | 'followup' | 'note'>('task');

  useEffect(() => {
    if (isQuickAddOpen) {
      setActiveTab(quickAddDefaultTab);
    }
  }, [isQuickAddOpen, quickAddDefaultTab]);

  // --- Task Form State ---
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('development');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDueDate, setTaskDueDate] = useState(todayISO());
  const [taskTime, setTaskTime] = useState('10:00');
  const [taskDuration, setTaskDuration] = useState('60');
  const [taskRelatedApp, setTaskRelatedApp] = useState('');
  const [nlpInput, setNlpInput] = useState('');
  const [nlpParsed, setNlpParsed] = useState<any>(null);

  // --- Routine Form State ---
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineDesc, setRoutineDesc] = useState('');
  const [routineCategory, setRoutineCategory] = useState<TaskCategory>('learning');
  const [routineStartTime, setRoutineStartTime] = useState('08:00');
  const [routineEndTime, setRoutineEndTime] = useState('09:00');
  const [routineDuration, setRoutineDuration] = useState('60');
  const [routineFreq, setRoutineFreq] = useState<RoutineFrequency>('weekdays');
  const [routineColor, setRoutineColor] = useState('#6366f1');

  // --- Application Form State ---
  const [appCompany, setAppCompany] = useState('');
  const [appTitle, setAppTitle] = useState('');
  const [appLocation, setAppLocation] = useState('Remote');
  const [appType, setAppType] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [appSource, setAppSource] = useState('LinkedIn');
  const [appStatus, setAppStatus] = useState<ApplicationStatus>('applied');
  const [appSalary, setAppSalary] = useState('');
  const [appNotes, setAppNotes] = useState('');

  // --- Interview Form State ---
  const [interviewAppId, setInterviewAppId] = useState('');
  const [interviewTitle, setInterviewTitle] = useState('Technical Screening Loop');
  const [interviewDate, setInterviewDate] = useState(addDaysISO(3));
  const [interviewTime, setInterviewTime] = useState('14:00');
  const [interviewNotes, setInterviewNotes] = useState('');

  // NLP Parser trigger
  const handleParseNlp = () => {
    if (!nlpInput.trim()) return;
    const parsed = aiService.parseNaturalLanguageTask(nlpInput);
    setNlpParsed(parsed);
    setTaskTitle(parsed.title);
    setTaskCategory(parsed.category);
    setTaskPriority(parsed.priority);
    setTaskDueDate(parsed.dueDate);
    if (parsed.scheduledTime) setTaskTime(parsed.scheduledTime);
    setTaskDuration(String(parsed.durationMinutes));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      category: taskCategory,
      priority: taskPriority,
      dueDate: taskDueDate || selectedDate,
      scheduledTime: taskTime || undefined,
      durationMinutes: parseInt(taskDuration, 10) || 60,
      status: 'pending',
      relatedApplicationId: taskRelatedApp || undefined,
    });

    // Reset & Close
    setTaskTitle('');
    setTaskDesc('');
    setNlpInput('');
    setNlpParsed(null);
    closeQuickAdd();
  };

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineTitle.trim()) return;

    addRoutine({
      title: routineTitle.trim(),
      description: routineDesc.trim(),
      category: routineCategory,
      startTime: routineStartTime,
      endTime: routineEndTime,
      durationMinutes: parseInt(routineDuration, 10) || 60,
      frequency: routineFreq,
      daysOfWeek: routineFreq === 'weekdays' ? [1, 2, 3, 4, 5] : routineFreq === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : [0, 6],
      isActive: true,
      color: routineColor,
    });

    setRoutineTitle('');
    setRoutineDesc('');
    closeQuickAdd();
  };

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appCompany.trim() || !appTitle.trim()) return;

    addApplication({
      companyName: appCompany.trim(),
      jobTitle: appTitle.trim(),
      location: appLocation,
      locationType: appType,
      source: appSource,
      employmentType: 'full_time',
      resumeVersion: 'v4.2-Standard',
      salaryRange: appSalary || undefined,
      notes: appNotes,
      currentStatus: appStatus,
      applicationDate: todayISO(),
    });

    setAppCompany('');
    setAppTitle('');
    setAppNotes('');
    closeQuickAdd();
  };

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewAppId) return;

    addTimelineEvent(interviewAppId, {
      date: interviewDate,
      title: `${interviewTitle} (${interviewTime})`,
      description: interviewNotes || 'Scheduled via Global Quick-Add',
      type: 'interview',
    });

    // Also auto-add a prep task
    const matchedApp = applications.find(a => a.id === interviewAppId);
    if (matchedApp) {
      addTask({
        title: `Prepare for ${matchedApp.companyName} interview`,
        category: 'interview_prep',
        priority: 'high',
        dueDate: interviewDate,
        durationMinutes: 60,
        status: 'pending',
        relatedApplicationId: interviewAppId,
      });
    }

    setInterviewNotes('');
    closeQuickAdd();
  };

  return (
    <Modal
      isOpen={isQuickAddOpen}
      onClose={closeQuickAdd}
      title="Global Quick Action"
      description="Create tasks, recurring routines, job records, or schedule interview rounds"
      maxWidth="xl"
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('task')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'task'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Task
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('routine')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'routine'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          Routine
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('application')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'application'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Job App
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('interview')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'interview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Interview
        </button>
      </div>

      {/* 1. Add Task Tab */}
      {activeTab === 'task' && (
        <form onSubmit={handleCreateTask} className="space-y-4">
          {/* AI NLP Quick Parser Prompt Box */}
          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Natural Language AI Parser
              </span>
              <span className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70">
                e.g. &quot;Tomorrow at 10 AM, practice Java for 90 minutes&quot;
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type natural schedule instruction..."
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleParseNlp();
                  }
                }}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Button type="button" variant="ai" size="sm" onClick={handleParseNlp}>
                Parse
              </Button>
            </div>
            {nlpParsed && (
              <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                ✓ AI Parsed: &ldquo;{nlpParsed.title}&rdquo; • {nlpParsed.durationMinutes}m • {nlpParsed.priority} priority • {nlpParsed.category}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Prepare System Design Architecture"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="development">Development</option>
                <option value="interview_prep">Interview Prep</option>
                <option value="job_search">Job Search</option>
                <option value="learning">Learning & DSA</option>
                <option value="personal">Personal / Routine</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as Priority)}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min="10"
                step="5"
                value={taskDuration}
                onChange={(e) => setTaskDuration(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Scheduled Time (Optional)
              </label>
              <input
                type="time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link to Job Application (Optional)
            </label>
            <select
              value={taskRelatedApp}
              onChange={(e) => setTaskRelatedApp(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">None (Independent task)</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.companyName} — {app.jobTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={closeQuickAdd}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Task
            </Button>
          </div>
        </form>
      )}

      {/* 2. Add Routine Tab */}
      {activeTab === 'routine' && (
        <form onSubmit={handleCreateRoutine} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Routine Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Java DSA & LeetCode Practice"
              value={routineTitle}
              onChange={(e) => setRoutineTitle(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Routine Description
            </label>
            <textarea
              rows={2}
              placeholder="What specifically will you achieve during this recurring block?"
              value={routineDesc}
              onChange={(e) => setRoutineDesc(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={routineCategory}
                onChange={(e) => setRoutineCategory(e.target.value as TaskCategory)}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="learning">Learning</option>
                <option value="development">Development</option>
                <option value="interview_prep">Interview Prep</option>
                <option value="job_search">Job Search</option>
                <option value="personal">Personal / Health</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frequency
              </label>
              <select
                value={routineFreq}
                onChange={(e) => setRoutineFreq(e.target.value as RoutineFrequency)}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="daily">Every Day (7 Days)</option>
                <option value="weekends">Weekends Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={routineDuration}
                onChange={(e) => setRoutineDuration(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={routineStartTime}
                onChange={(e) => setRoutineStartTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={routineEndTime}
                onChange={(e) => setRoutineEndTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={closeQuickAdd}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Routine
            </Button>
          </div>
        </form>
      )}

      {/* 3. Add Job Application Tab */}
      {activeTab === 'application' && (
        <form onSubmit={handleCreateApplication} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Netflix, Stripe, Google"
                value={appCompany}
                onChange={(e) => setAppCompany(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Java Backend Engineer"
                value={appTitle}
                onChange={(e) => setAppTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location Type
              </label>
              <select
                value={appType}
                onChange={(e) => setAppType(e.target.value as any)}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Application Source
              </label>
              <input
                type="text"
                value={appSource}
                onChange={(e) => setAppSource(e.target.value)}
                placeholder="LinkedIn, Referral, Careers"
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Status
              </label>
              <select
                value={appStatus}
                onChange={(e) => setAppStatus(e.target.value as ApplicationStatus)}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="interested">Interested</option>
                <option value="applied">Applied</option>
                <option value="assessment">Assessment</option>
                <option value="interview">Interview</option>
                <option value="selected">Selected / Offer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Salary / Compensation Band (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. $180k - $210k + Equity"
              value={appSalary}
              onChange={(e) => setAppSalary(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Notes & Context
            </label>
            <textarea
              rows={2}
              placeholder="Key talking points, team tech stack details, recruiter info..."
              value={appNotes}
              onChange={(e) => setAppNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={closeQuickAdd}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Application
            </Button>
          </div>
        </form>
      )}

      {/* 4. Schedule Interview Round Tab */}
      {activeTab === 'interview' && (
        <form onSubmit={handleCreateInterview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Company / Application *
            </label>
            <select
              required
              value={interviewAppId}
              onChange={(e) => setInterviewAppId(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose an active application...</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.companyName} ({app.jobTitle})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Interview Round Title *
            </label>
            <input
              type="text"
              required
              value={interviewTitle}
              onChange={(e) => setInterviewTitle(e.target.value)}
              placeholder="e.g. System Design Architecture Round"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Interviewer Name / Call Link Notes
            </label>
            <textarea
              rows={2}
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="e.g. Google Meet link, Marcus Vance (Principal Architect), topic focus"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={closeQuickAdd}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={!interviewAppId}>
              Schedule Interview
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
