import { addDaysISO, todayISO } from '../utils/today';
import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRightCircle,
  SkipForward,
  Repeat,
  Check,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { PriorityPill, TaskStatusPill } from '../components/common/StatusPill';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Modal } from '../components/common/Modal';
import { OverdueTaskPromptModal } from '../components/common/OverdueTaskPromptModal';
import { Task, TaskStatus } from '../types';

export const MyDay: React.FC = () => {
  const {
    tasks,
    routines,
    selectedDate,
    setSelectedDate,
    updateTaskStatus,
    postponeTask,
    changeTaskTimeToday,
    deleteTask,
    updateTask,
    openQuickAdd,
  } = useApp();

  const [activeView, setActiveView] = useState<'structured' | 'timeline'>('structured');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskToPostpone, setTaskToPostpone] = useState<Task | null>(null);
  const [promptTask, setPromptTask] = useState<Task | null>(null);
  const [postponeDate, setPostponeDate] = useState(addDaysISO(1));
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Filter tasks for the selected date
  const dayTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate < selectedDate);
  
  // Categorized
  const routineTasks = dayTasks.filter((t) => t.isRoutineInstance || t.category === 'routine');
  const flexibleTasks = dayTasks.filter((t) => !t.isRoutineInstance && t.status !== 'completed');
  const completedTasks = dayTasks.filter((t) => t.status === 'completed');

  // Date navigation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(todayISO());
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Timeline slots generation (07:00 to 21:00)
  const timelineHours = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToEdit) return;
    updateTask(taskToEdit);
    setTaskToEdit(null);
  };

  const handleConfirmPostpone = () => {
    if (!taskToPostpone) return;
    postponeTask(taskToPostpone.id, postponeDate);
    setTaskToPostpone(null);
  };

  return (
    <div className="space-y-6">
      {/* Date Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {formatDisplayDate(selectedDate)}
              </h2>
              {selectedDate === todayISO() && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {dayTasks.length} tasks scheduled • {completedTasks.length} completed
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Day Navigator */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveView('structured')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeView === 'structured'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              List Planner
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeView === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Hourly Timeline
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => openQuickAdd('task')}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* OVERDUE TASKS BANNER IF ANY */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
              <AlertCircle className="w-4 h-4" />
              Overdue Tasks ({overdueTasks.length})
            </div>
            <span className="text-xs text-rose-600/80 dark:text-rose-400/80">
              Needs attention or rescheduling
            </span>
          </div>

          <div className="space-y-2">
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200/80 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {task.title}
                    </span>
                    <PriorityPill priority={task.priority} />
                  </div>
                  <span className="text-[11px] text-rose-500 font-medium">
                    Due: {task.dueDate} • {task.durationMinutes}m
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    className="text-xs px-2.5 py-1 font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => setPromptTask(task)}
                    className="text-xs px-2.5 py-1 font-bold rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100 flex items-center gap-1"
                    title="What do you plan about this task?"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Plan Follow-up
                  </button>
                  <button
                    onClick={() => {
                      setTaskToPostpone(task);
                      setPostponeDate(todayISO());
                    }}
                    className="text-xs px-2.5 py-1 font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 flex items-center gap-1"
                  >
                    <ArrowRightCircle className="w-3.5 h-3.5" /> Move to Today
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 1: STRUCTURED LIST PLANNER */}
      {activeView === 'structured' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Flexible Tasks + Completed (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Flexible High-Priority Tasks */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Flexible Daily Tasks ({flexibleTasks.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tasks scheduled for today without rigid routine blocks
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openQuickAdd('task')}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Quick Add
                </Button>
              </div>

              {flexibleTasks.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                  No flexible tasks left for today! Enjoy your routine or add a new focus block.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {flexibleTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="mt-0.5 w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 flex items-center justify-center transition-colors shrink-0"
                          title="Mark completed"
                        >
                          <Check className="w-3.5 h-3.5 opacity-0 hover:opacity-100 text-emerald-600" />
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {task.title}
                            </span>
                            <PriorityPill priority={task.priority} />
                            <Badge variant="outline" size="sm">
                              {task.category}
                            </Badge>
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                            {task.scheduledTime && (
                              <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                                <Clock className="w-3 h-3 text-indigo-500" />
                                {task.scheduledTime}
                              </span>
                            )}
                            <span>Duration: {task.durationMinutes} mins</span>
                            {task.notes && <span className="italic truncate max-w-xs">{task.notes}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => setPromptTask(task)}
                          className="p-1.5 text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          title="What do you plan about this task? (Postpone, Not today, Change time)"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'skipped')}
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Skip task"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setTaskToPostpone(task);
                            setPostponeDate(addDaysISO(1));
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Postpone to tomorrow"
                        >
                          <ArrowRightCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTaskToEdit(task)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Completed Tasks Section */}
            {completedTasks.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Completed Tasks ({completedTasks.length})
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => updateTaskStatus(task.id, 'pending')}
                          className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center shrink-0"
                          title="Mark uncompleted"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                        <span className="line-through text-slate-400 font-medium truncate">
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                        Done • {task.durationMinutes}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Fixed Daily Routines */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-indigo-500" />
                  Fixed Daily Routines
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  {routines.filter((r) => r.isActive).length} active
                </span>
              </div>

              <div className="space-y-3">
                {routines.map((routine) => (
                  <div
                    key={routine.id}
                    className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: routine.color }}
                        />
                        {routine.title}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/70 px-1.5 py-0.5 rounded">
                        {routine.startTime} - {routine.endTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {routine.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                        <Flame className="w-3.5 h-3.5" /> {routine.streakCount} day streak
                      </span>
                      <span>{routine.durationMinutes} mins</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: HOURLY TIMELINE */}
      {activeView === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Time Block
              </span>
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Scheduled Focus Activity
              </span>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
              {timelineHours.map((hour) => {
                // Find any routine or task near this hour
                const matchingRoutines = routines.filter((r) => r.startTime.startsWith(hour.slice(0, 2)));
                const matchingTasks = dayTasks.filter((t) => t.scheduledTime && t.scheduledTime.startsWith(hour.slice(0, 2)));

                return (
                  <div key={hour} className="pt-3 flex gap-4 sm:gap-6 items-start">
                    <span className="text-xs font-mono font-bold text-slate-400 w-12 sm:w-16 shrink-0 pt-1">
                      {hour}
                    </span>

                    <div className="flex-1 space-y-2">
                      {matchingRoutines.map((routine) => (
                        <div
                          key={routine.id}
                          className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: routine.color }}
                            />
                            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                              {routine.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                            {routine.startTime} - {routine.endTime} ({routine.durationMinutes}m)
                          </span>
                        </div>
                      ))}

                      {matchingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <PriorityPill priority={task.priority} />
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {task.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {task.scheduledTime} ({task.durationMinutes}m)
                          </span>
                        </div>
                      ))}

                      {matchingRoutines.length === 0 && matchingTasks.length === 0 && (
                        <div className="py-2 text-xs text-slate-400/60 italic">
                          Open focus block
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Postpone Dialog */}
      <Modal
        isOpen={!!taskToPostpone}
        onClose={() => setTaskToPostpone(null)}
        title="Postpone Task"
        description="Select a new target date to reschedule this task"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Task: &ldquo;{taskToPostpone?.title}&rdquo;
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              New Due Date
            </label>
            <input
              type="date"
              value={postponeDate}
              onChange={(e) => setPostponeDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setTaskToPostpone(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmPostpone}>
              Confirm Postpone
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        title="Edit Task Details"
        maxWidth="md"
      >
        {taskToEdit && (
          <form onSubmit={handleSaveEdit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={taskToEdit.title}
                onChange={(e) => setTaskToEdit({ ...taskToEdit, title: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={taskToEdit.description || ''}
                onChange={(e) => setTaskToEdit({ ...taskToEdit, description: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  value={taskToEdit.durationMinutes}
                  onChange={(e) => setTaskToEdit({ ...taskToEdit, durationMinutes: parseInt(e.target.value, 10) || 30 })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Time
                </label>
                <input
                  type="time"
                  value={taskToEdit.scheduledTime || ''}
                  onChange={(e) => setTaskToEdit({ ...taskToEdit, scheduledTime: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={taskToEdit.notes || ''}
                onChange={(e) => setTaskToEdit({ ...taskToEdit, notes: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setTaskToEdit(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete);
            setTaskToDelete(null);
          }
        }}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />

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
