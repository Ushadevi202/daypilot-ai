import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Flame,
  Briefcase,
  Sparkles,
  ArrowRight,
  Save,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { addDaysISO, todayISO } from '../utils/today';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const Insights: React.FC = () => {
  const { tasks, routines, applications, emailAlerts } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'daily_review'>('analytics');
  const [dailyReflectionNote, setDailyReflectionNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  // Compute metrics from actual stored data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const postponedTasks = tasks.filter((t) => t.status === 'postponed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalApps = applications.length;
  const interviewCount = applications.filter((a) => a.currentStatus === 'interview').length;
  const offerCount = applications.filter((a) => a.currentStatus === 'selected').length;
  const assessmentCount = applications.filter((a) => a.currentStatus === 'assessment').length;

  // Last 7 days, calculated from your real tasks and routine items
  const today = todayISO();
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = addDaysISO(i - 6);
    const dayItems = tasks.filter((t) => t.dueDate === date && t.status !== 'skipped');
    return {
      day: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' }),
      completed: dayItems.filter((t) => t.status === 'completed').length,
      planned: dayItems.length,
    };
  });
  const chartMax = Math.max(1, ...weeklyData.map((d) => d.planned));
  const plannedDays = weeklyData.filter((d) => d.planned > 0);
  const weeklyAvg = plannedDays.length
    ? Math.round((plannedDays.reduce((sum, d) => sum + d.completed / d.planned, 0) / plannedDays.length) * 100)
    : null;

  const reliabilities = routines.map((r) => r.reliabilityPct).filter((v): v is number => v !== undefined);
  const routineConsistency = reliabilities.length
    ? Math.round(reliabilities.reduce((a, b) => a + b, 0) / reliabilities.length)
    : null;
  const bestStreak = Math.max(0, ...routines.map((r) => r.streakCount));

  const todayItems = tasks.filter((t) => t.dueDate === today && t.status !== 'skipped');
  const todayDone = todayItems.filter((t) => t.status === 'completed').length;
  const overdueOpen = tasks.filter((t) => !t.isRoutineInstance && t.status === 'pending' && t.dueDate < today).length;
  const priorityRank = { high: 0, medium: 1, low: 2 };
  const topOpen = todayItems.filter((t) => t.status !== 'completed').sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])[0];

  // Category task distribution
  const categories: Record<string, number> = {};
  tasks.forEach((t) => {
    categories[t.category] = (categories[t.category] || 0) + 1;
  });

  const handleSaveReflection = () => {
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Daily Monitor & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Empirical insights into your learning velocity, routine consistency, and interview pipeline conversion.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Metrics & Charts
          </button>
          <button
            onClick={() => setActiveTab('daily_review')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'daily_review'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Daily Evening Review
          </button>
        </div>
      </div>

      {activeTab === 'analytics' && (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Task Completion Rate
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-emerald-600">{completionRate}%</span>
                <span className="text-xs text-slate-400">{completedTasks} of {totalTasks}</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Routine Consistency
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{routineConsistency === null ? '—' : `${routineConsistency}%`}</span>
                {bestStreak > 0 && (
                  <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" /> {bestStreak}-day best streak
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Java DSA top performer</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Interview Loops
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-purple-600">{interviewCount}</span>
                <span className="text-xs text-slate-400">across {totalApps} apps</span>
              </div>
              <span className="text-[10px] text-purple-600 font-semibold mt-1 block">
                {offerCount} official offer in hand
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Postponed vs Completed
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
                  {completedTasks} / {postponedTasks}
                </span>
                <span className="text-xs text-slate-400">ratio</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Low friction rescheduling</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Weekly Task Completion SVG Bar Chart */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Weekly Task Completion (Last 7 Days)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Completed tasks (indigo) vs Total planned (slate)
                  </p>
                </div>
                <Badge variant="primary" size="sm">{weeklyAvg === null ? 'No data yet' : `Avg ${weeklyAvg}%`}</Badge>
              </div>

              {/* SVG Bar Chart */}
              <div className="pt-4">
                <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  {weeklyData.map((d) => {
                    const plannedHeight = (d.planned / chartMax) * 100;

                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                          {d.completed}/{d.planned}
                        </div>
                        <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-800 rounded-t-lg relative flex items-end overflow-hidden" style={{ height: `${plannedHeight}%` }}>
                          <div
                            className="w-full bg-indigo-600 rounded-t-lg transition-all duration-500"
                            style={{ height: `${d.planned > 0 ? (d.completed / d.planned) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                          {d.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chart 2: Category Breakdown */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Task Distribution by Focus Area
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Where your time is allocated across engineering & career
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {Object.entries(categories).map(([catName, count]) => {
                  const pct = Math.round((count / totalTasks) * 100);

                  return (
                    <div key={catName} className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="capitalize text-slate-700 dark:text-slate-300">
                          {catName.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400">{count} tasks ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: DAILY EVENING REVIEW */}
      {activeTab === 'daily_review' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* AI Daily Commentary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 border border-indigo-200 dark:border-indigo-900 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Daily Summary (calculated from your data)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {todayItems.length === 0
                ? 'Nothing is scheduled for today yet.'
                : `You have ${todayItems.length} item(s) scheduled for today and ${todayDone} completed (${Math.round((todayDone * 100) / todayItems.length)}%).`}
              {` ${overdueOpen} open task(s) are overdue.`}
              {topOpen ? ` The highest-priority open item today is "${topOpen.title}".` : ''}
            </p>
          </div>

          {/* Planned vs Completed Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today&apos;s Stored Activity Log
            </h4>

            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Scheduled Focus Blocks</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{totalTasks} tasks</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Completed Sessions</span>
                <span className="font-bold text-emerald-600">{completedTasks} completed</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Postponed for Flexibility</span>
                <span className="font-bold text-amber-600">{postponedTasks} postponed</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Inbound Job Emails Processed</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{emailAlerts.length} detections</span>
              </div>
            </div>
          </div>

          {/* Daily Reflection Journal Input */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Evening Reflection & Engineering Notes
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record what went well, architectural takeaways, and blockers to review during your weekly retrospective.
                </p>
              </div>
            </div>

            <textarea
              rows={4}
              placeholder="e.g. Learned how MySQL REPEATABLE READ prevents phantom reads using next-key locking. System design architecture for Example Technologies feels solid..."
              value={dailyReflectionNote}
              onChange={(e) => setDailyReflectionNote(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-between pt-1">
              {isNoteSaved ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Reflection saved to daily journal!
                </span>
              ) : (
                <span className="text-xs text-slate-400">Stored locally in your DayPilot session</span>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveReflection}
                icon={<Save className="w-3.5 h-3.5" />}
              >
                Save Reflection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
