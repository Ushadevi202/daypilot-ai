import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  Calendar,
  Power,
  Edit2,
  Trash2,
  BarChart2,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Routine, RoutineFrequency, TaskCategory } from '../types';

export const Routines: React.FC = () => {
  const {
    routines,
    addRoutine,
    updateRoutine,
    toggleRoutineActive,
    deleteRoutine,
    openQuickAdd,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'templates' | 'weekly_grid' | 'stats'>('templates');
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);

  const daysOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate overall routine consistency stats
  const totalRoutines = routines.length;
  const activeCount = routines.filter((r) => r.isActive).length;
  const highestStreak = Math.max(...routines.map((r) => r.streakCount), 0);
  const totalCompletions = routines.reduce((sum, r) => sum + r.totalCompletions, 0);

  const handleSaveRoutineEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineToEdit) return;
    updateRoutine(routineToEdit);
    setRoutineToEdit(null);
  };

  const toggleDayInEdit = (dayIndex: number) => {
    if (!routineToEdit) return;
    const current = routineToEdit.daysOfWeek;
    const updated = current.includes(dayIndex)
      ? current.filter((d) => d !== dayIndex)
      : [...current, dayIndex].sort();
    setRoutineToEdit({ ...routineToEdit, daysOfWeek: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Recurring Routines & Habits
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build consistency through fixed engineering drills, learning intervals, and focused outreach rituals.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => openQuickAdd('routine')}
          icon={<Plus className="w-4 h-4" />}
        >
          New Routine Template
        </Button>
      </div>

      {/* Routine Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Active Routines
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{activeCount}</span>
            <span className="text-xs text-slate-400">of {totalRoutines}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Highest Streak
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-500 flex items-center gap-1">
              <Flame className="w-5 h-5 fill-amber-500" />
              {highestStreak}
            </span>
            <span className="text-xs text-slate-400">days</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Completions
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{totalCompletions}</span>
            <span className="text-xs text-slate-400">sessions</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Weekly Consistency
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">
              {(() => {
                const values = routines.map((r) => r.reliabilityPct).filter((v): v is number => v !== undefined);
                return values.length ? `${Math.round(values.reduce((a, b) => a + b, 0) / values.length)}%` : '—';
              })()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">completed ÷ (completed + missed), last 30 days</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'templates'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Routine Templates
        </button>
        <button
          onClick={() => setActiveTab('weekly_grid')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'weekly_grid'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Weekly Schedule Grid
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'stats'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Completion Analytics
        </button>
      </div>

      {/* TAB 1: ROUTINE TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                routine.isActive
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                  : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: routine.color }}
                    />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {routine.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleRoutineActive(routine.id)}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      routine.isActive
                        ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                        : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                    title={routine.isActive ? 'Deactivate routine' : 'Activate routine'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {routine.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    {routine.startTime} - {routine.endTime}
                  </span>
                  <span className="text-slate-400">{routine.durationMinutes} mins</span>
                </div>

                {/* Days of week dots */}
                <div className="mt-3 flex items-center gap-1.5">
                  {daysOfWeekNames.map((dayName, idx) => {
                    const isAssigned = routine.daysOfWeek.includes(idx);
                    return (
                      <span
                        key={dayName}
                        className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition-colors ${
                          isAssigned
                            ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {dayName.slice(0, 1)}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer: Streak + Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  {routine.streakCount} day streak
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRoutineToEdit(routine)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setRoutineToDelete(routine.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: WEEKLY SCHEDULE GRID */}
      {activeTab === 'weekly_grid' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
          <div className="min-w-[700px] grid grid-cols-7 gap-3">
            {daysOfWeekNames.map((dayName, idx) => {
              const dayRoutines = routines.filter((r) => r.isActive && r.daysOfWeek.includes(idx));

              return (
                <div key={dayName} className="space-y-3">
                  <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {dayName}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {dayRoutines.length} scheduled
                    </span>
                  </div>

                  <div className="space-y-2">
                    {dayRoutines.map((routine) => (
                      <div
                        key={routine.id}
                        className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-1"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: routine.color }}
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {routine.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {routine.startTime} - {routine.endTime}
                        </span>
                      </div>
                    ))}

                    {dayRoutines.length === 0 && (
                      <div className="p-3 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        Free Day
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETION ANALYTICS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              Routine Performance Breakdown
            </h3>

            <div className="space-y-3">
              {routines.map((routine) => {
                const pct = routine.reliabilityPct ?? 0;

                return (
                  <div key={routine.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: routine.color }}
                        />
                        {routine.title}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {routine.totalCompletions} completed • {routine.reliabilityPct === undefined ? 'no finished days yet' : `${pct}% reliability`}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: routine.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              AI Routine Optimization Insights
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
              💡 <strong>Top Recommendation:</strong> Your Java DSA practice at 07:30 AM has your highest completion rate (96%). Moving your SQL & DBMS learning directly into the morning slot creates a consolidated 2-hour technical deep-work block before recruiters reach out in the afternoon.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              🎯 <strong>Streak Milestone:</strong> You are 2 days away from achieving a 30-day streak on Cardio & Strength Training!
            </p>
          </div>
        </div>
      )}

      {/* Edit Routine Modal */}
      <Modal
        isOpen={!!routineToEdit}
        onClose={() => setRoutineToEdit(null)}
        title="Edit Routine Template"
        maxWidth="md"
      >
        {routineToEdit && (
          <form onSubmit={handleSaveRoutineEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={routineToEdit.title}
                onChange={(e) => setRoutineToEdit({ ...routineToEdit, title: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={routineToEdit.description}
                onChange={(e) => setRoutineToEdit({ ...routineToEdit, description: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={routineToEdit.startTime}
                  onChange={(e) => setRoutineToEdit({ ...routineToEdit, startTime: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={routineToEdit.endTime}
                  onChange={(e) => setRoutineToEdit({ ...routineToEdit, endTime: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Active Days
              </label>
              <div className="flex items-center gap-2">
                {daysOfWeekNames.map((name, i) => {
                  const isSelected = routineToEdit.daysOfWeek.includes(i);
                  return (
                    <button
                      type="button"
                      key={name}
                      onClick={() => toggleDayInEdit(i)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {name.slice(0, 2)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setRoutineToEdit(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Routine
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!routineToDelete}
        onClose={() => setRoutineToDelete(null)}
        onConfirm={() => {
          if (routineToDelete) {
            deleteRoutine(routineToDelete);
            setRoutineToDelete(null);
          }
        }}
        title="Delete Routine"
        message="Are you sure you want to delete this routine? Historical completion metrics will be kept."
      />
    </div>
  );
};
