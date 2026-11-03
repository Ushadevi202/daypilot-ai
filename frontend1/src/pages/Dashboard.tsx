import { todayISO } from '../utils/today';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Briefcase,
  Mail,
  Sparkles,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  Play,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ApplicationStatusPill, PriorityPill } from '../components/common/StatusPill';
import { OverdueTaskPromptModal } from '../components/common/OverdueTaskPromptModal';
import { Task } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    tasks,
    routines,
    applications,
    emailAlerts,
    user,
    openQuickAdd,
    updateTaskStatus,
    postponeTask,
    changeTaskTimeToday,
    approveEmailAlert,
  } = useApp();

  const [promptTask, setPromptTask] = useState<Task | null>(null);

  // Tasks statistics for today
  const todayDate = todayISO();
  const todayTasks = tasks.filter((t) => t.dueDate === todayDate);
  const completedToday = todayTasks.filter((t) => t.status === 'completed');
  const pendingToday = todayTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayDate);
  const completionPercentage = todayTasks.length > 0 
    ? Math.round((completedToday.length / todayTasks.length) * 100) 
    : 0;

  // Job application status counts
  const appCounts = {
    total: applications.length,
    interested: applications.filter((a) => a.currentStatus === 'interested').length,
    applied: applications.filter((a) => a.currentStatus === 'applied').length,
    assessment: applications.filter((a) => a.currentStatus === 'assessment').length,
    interview: applications.filter((a) => a.currentStatus === 'interview').length,
    selected: applications.filter((a) => a.currentStatus === 'selected').length,
    rejected: applications.filter((a) => a.currentStatus === 'rejected').length,
  };

  // Upcoming high priority events (interviews & assessments)
  const upcomingInterviews = applications
    .filter((a) => a.currentStatus === 'interview' || a.currentStatus === 'assessment')
    .slice(0, 3);

  // Email alerts needing review
  const pendingEmails = emailAlerts.filter((e) => e.reviewStatus === 'pending');

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-700/50">
                Friday, October 31, 2026
              </span>
              <span className="text-xs text-slate-300">
                Daily Focus: Distributed Systems & Technical Interview
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to win the day, {user.name.split(' ')[0]}?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              You have <span className="text-white font-semibold">{todayTasks.length} tasks scheduled today</span>.
              {pendingEmails.length > 0 && (
                <span className="text-amber-300 font-semibold"> {pendingEmails.length} AI email alert{pendingEmails.length > 1 ? 's require' : ' requires'} your review.</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="ai"
              size="md"
              onClick={() => navigate('/ai-planner')}
              icon={<Sparkles className="w-4 h-4" />}
            >
              AI Plan My Day
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => openQuickAdd('task')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              + Quick Add
            </Button>
          </div>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widget A: Today's Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Today&apos;s Progress
                </h3>
              </div>
              <button
                onClick={() => navigate('/my-day')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                My Day <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress Bar & Percentage */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {completionPercentage}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {completedToday.length} of {todayTasks.length} tasks completed
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, Math.max(5, completionPercentage))}%` }}
                />
              </div>
            </div>

            {/* Mini Stat Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-xs text-slate-400 block font-medium">Pending</span>
                <span className="text-base font-bold text-slate-700 dark:text-slate-300">{pendingToday.length}</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">Done</span>
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">{completedToday.length}</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20">
                <span className="text-xs text-rose-600 dark:text-rose-400 block font-medium">Overdue</span>
                <span className="text-base font-bold text-rose-700 dark:text-rose-300">{overdueTasks.length}</span>
              </div>
            </div>
          </div>

          {overdueTasks.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                {overdueTasks.length} uncompleted task{overdueTasks.length > 1 ? 's need' : ' needs'} a plan
              </span>
              <button
                onClick={() => setPromptTask(overdueTasks[0])}
                className="font-bold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-lg transition-colors text-center"
              >
                Plan Follow-up
              </button>
            </div>
          )}
        </div>

        {/* Widget B: Today's Schedule (Fixed Routines & Key Tasks) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Today&apos;s Schedule
                </h3>
              </div>
              <button
                onClick={() => navigate('/my-day')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Timeline <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {todayTasks.slice(0, 4).map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => updateTaskStatus(task.id, isDone ? 'pending' : 'completed')}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                        }`}
                        title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span>{task.scheduledTime || 'Flexible'}</span>
                          <span>•</span>
                          <span>{task.durationMinutes}m</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isDone && (
                        <button
                          onClick={() => setPromptTask(task)}
                          className="text-[10px] px-2 py-0.5 rounded-md font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                          title="What do you plan about this task?"
                        >
                          Plan
                        </button>
                      )}
                      <PriorityPill priority={task.priority} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => openQuickAdd('task')}
            className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl"
          >
            + Add flexible task to today
          </button>
        </div>

        {/* Widget C: Upcoming Events & Interviews */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Upcoming Rounds & Events
                </h3>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Calendar <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingInterviews.map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate('/applications')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {app.companyName}
                    </span>
                    <ApplicationStatusPill status={app.currentStatus} />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {app.jobTitle}
                  </p>
                  {app.nextAction && (
                    <div className="mt-2 text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 p-1.5 rounded-lg">
                      ⚡ {app.nextAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/applications')}
            className="w-full mt-4"
          >
            Manage Job Applications
          </Button>
        </div>

        {/* Widget D: Job Application Overview Funnel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Application Pipeline
                </h3>
              </div>
              <button
                onClick={() => navigate('/applications')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Kanban <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Application Pipeline Badges */}
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => navigate('/applications')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100"
              >
                <span className="text-[11px] text-slate-400 block font-medium">Applied</span>
                <span className="text-lg font-extrabold text-blue-600">{appCounts.applied}</span>
              </div>
              <div
                onClick={() => navigate('/applications')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100"
              >
                <span className="text-[11px] text-slate-400 block font-medium">Assessment</span>
                <span className="text-lg font-extrabold text-amber-600">{appCounts.assessment}</span>
              </div>
              <div
                onClick={() => navigate('/applications')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100"
              >
                <span className="text-[11px] text-slate-400 block font-medium">Interviewing</span>
                <span className="text-lg font-extrabold text-purple-600">{appCounts.interview}</span>
              </div>
              <div
                onClick={() => navigate('/applications')}
                className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 cursor-pointer hover:bg-emerald-50"
              >
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">Offer Extended</span>
                <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{appCounts.selected}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Total Tracked: {appCounts.total}</span>
              <span>Rejections: {appCounts.rejected}</span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => openQuickAdd('application')}
            className="w-full mt-4"
          >
            + Add New Job Record
          </Button>
        </div>

        {/* Widget E: Email Assistant Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    AI Email Alerts
                  </h3>
                  {pendingEmails.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                      {pendingEmails.length}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate('/email-assistant')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Inbox <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingEmails.slice(0, 2).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {alert.companyDetected}
                    </span>
                    <Badge variant="warning" size="sm">
                      {alert.aiConfidence}% match
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                    {alert.subject}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {alert.suggestedAction.description}
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => navigate('/email-assistant')}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-2 py-1"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => approveEmailAlert(alert.id)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    >
                      Approve Action
                    </button>
                  </div>
                </div>
              ))}

              {pendingEmails.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  All detected emails reviewed. Next sync runs in 15 mins.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Gmail status: Demo Mock Sync</span>
            <span className="text-emerald-500 font-medium">Monitoring Active</span>
          </div>
        </div>

        {/* Widget F: AI Daily Insights */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  AI Daily Insights
                </h3>
              </div>
              <button
                onClick={() => navigate('/insights')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Analytics <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Suggested Priority
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {(() => {
                    const rank = { high: 0, medium: 1, low: 2 };
                    const top = todayTasks
                      .filter((t) => t.status !== 'completed' && t.status !== 'skipped')
                      .sort((a, b) => rank[a.priority] - rank[b.priority])[0];
                    return top
                      ? `Your highest-priority open item today is "${top.title}" (${top.priority} priority${top.scheduledTime ? `, ${top.scheduledTime}` : ''}).`
                      : 'Nothing is left open for today.';
                  })()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  Routine Habit Check
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {(() => {
                    const best = [...routines].sort((a, b) => b.streakCount - a.streakCount)[0];
                    return best && best.streakCount > 0
                      ? `"${best.title}" is on a ${best.streakCount}-day streak.`
                      : 'Complete a routine today to start a streak.';
                  })()}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="ai"
            size="sm"
            onClick={() => navigate('/ai-planner')}
            className="w-full mt-4"
          >
            Launch Interactive AI Planner
          </Button>
        </div>
      </div>

      {/* Uncompleted Task Follow-up Prompt Modal */}
      <OverdueTaskPromptModal
        isOpen={!!promptTask}
        task={promptTask}
        onClose={() => setPromptTask(null)}
        onPostpone={(taskId, date) => postponeTask(taskId, date)}
        onNotToday={(taskId) => updateTaskStatus(taskId, 'skipped')}
        onChangeTimeToday={(taskId, time) => changeTaskTimeToday(taskId, time)}
      />
    </div>
  );
};
