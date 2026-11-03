import { todayISO } from '../utils/today';
import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  CheckCircle2,
  AlertTriangle,
  History,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { PriorityPill, TaskStatusPill } from '../components/common/StatusPill';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { OverdueTaskPromptModal } from '../components/common/OverdueTaskPromptModal';
import { Task, TaskCategory, Priority, TaskStatus } from '../types';
import { aiService, ParsedNLPTask } from '../services/aiService';

export const Tasks: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    postponeTask,
    changeTaskTimeToday,
    openQuickAdd,
    applications,
  } = useApp();

  // Tab Views: All, Today, Upcoming, Overdue, Completed
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'duration'>('dueDate');

  // Drawer / Selection
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [promptTask, setPromptTask] = useState<Task | null>(null);

  // Natural Language Input State
  const [nlpText, setNlpText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedNLPTask | null>(null);

  const todayStr = todayISO();

  // Handle NLP Quick Parse
  const handleParseNlp = () => {
    if (!nlpText.trim()) return;
    const parsed = aiService.parseNaturalLanguageTask(nlpText);
    setParsedPreview(parsed);
  };

  const handleApplyNlpTask = () => {
    if (!parsedPreview) return;
    addTask({
      title: parsedPreview.title,
      description: parsedPreview.notes,
      category: parsedPreview.category,
      priority: parsedPreview.priority,
      dueDate: parsedPreview.dueDate,
      scheduledTime: parsedPreview.scheduledTime,
      durationMinutes: parsedPreview.durationMinutes,
      status: 'pending',
    });
    setNlpText('');
    setParsedPreview(null);
  };

  // Filter tasks based on activeTab, search, category, priority
  const filteredTasks = tasks.filter((task) => {
    // Tab filter
    if (activeTab === 'today') {
      if (task.dueDate !== todayStr) return false;
    } else if (activeTab === 'upcoming') {
      if (task.dueDate <= todayStr || task.status === 'completed') return false;
    } else if (activeTab === 'overdue') {
      if (task.dueDate >= todayStr || task.status === 'completed') return false;
    } else if (activeTab === 'completed') {
      if (task.status !== 'completed') return false;
    }

    // Search filter
    if (search.trim()) {
      const matchTitle = task.title.toLowerCase().includes(search.toLowerCase());
      const matchDesc = task.description?.toLowerCase().includes(search.toLowerCase());
      if (!matchTitle && !matchDesc) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && task.category !== categoryFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }

    return true;
  });

  // Sort
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortBy === 'priority') {
      const pMap = { high: 3, medium: 2, low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    }
    if (sortBy === 'duration') {
      return b.durationMinutes - a.durationMinutes;
    }
    return 0;
  });

  // Category counts
  const counts = {
    all: tasks.length,
    today: tasks.filter((t) => t.dueDate === todayStr).length,
    upcoming: tasks.filter((t) => t.dueDate > todayStr && t.status !== 'completed').length,
    overdue: tasks.filter((t) => t.dueDate < todayStr && t.status !== 'completed').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Task Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize deliberate practice, job outreach, and engineering tasks with smart priority alignment.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => openQuickAdd('task')}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Task
        </Button>
      </div>

      {/* Natural Language Task Entry Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Natural-Language Quick Add
          </div>
          <span className="text-[11px] text-slate-400">
            Try: &ldquo;Tomorrow at 10 AM, practice Java for 90 minutes&rdquo;
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Type your task in plain English..."
            value={nlpText}
            onChange={(e) => setNlpText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleParseNlp();
              }
            }}
            className="flex-1 text-xs sm:text-sm px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
          <Button
            variant="ai"
            size="sm"
            onClick={handleParseNlp}
            disabled={!nlpText.trim()}
          >
            Parse with AI
          </Button>
        </div>

        {/* AI Parsed Extraction Preview */}
        {parsedPreview && (
          <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 shadow-xs animate-in fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  Extracted Preview ({parsedPreview.confidence}% confidence)
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {parsedPreview.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="primary" size="sm">{parsedPreview.category}</Badge>
                  <PriorityPill priority={parsedPreview.priority} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    📅 {parsedPreview.dueDate} • ⏰ {parsedPreview.scheduledTime || 'Flexible'} • ⏱️ {parsedPreview.durationMinutes}m
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setParsedPreview(null)}>
                  Discard
                </Button>
                <Button variant="primary" size="sm" onClick={handleApplyNlpTask}>
                  Confirm & Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* View Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'all', label: 'All Tasks', count: counts.all },
            { id: 'today', label: 'Today', count: counts.today },
            { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
            { id: 'overdue', label: 'Overdue', count: counts.overdue, isAlert: counts.overdue > 0 },
            { id: 'completed', label: 'Completed', count: counts.completed },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  tab.isAlert
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="development">Development</option>
              <option value="interview_prep">Interview Prep</option>
              <option value="job_search">Job Search</option>
              <option value="learning">Learning & DSA</option>
              <option value="personal">Personal</option>
            </select>

            {/* Priority Dropdown */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="duration">Sort by Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List Table / Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedTask ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
          {sortedTasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="w-6 h-6" />}
              title="No tasks match your criteria"
              description="Try adjusting your filters or use Quick Add to create a new task."
              actionLabel="Create Task"
              onAction={() => openQuickAdd('task')}
            />
          ) : (
            sortedTasks.map((task) => {
              const isDone = task.status === 'completed';
              const isSelected = selectedTask?.id === task.id;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30 shadow-md'
                      : isDone
                      ? 'border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 opacity-70'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(task.id, isDone ? 'pending' : 'completed');
                      }}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                          {task.title}
                        </span>
                        <PriorityPill priority={task.priority} />
                        <TaskStatusPill status={task.status} />
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                          <Calendar className="w-3 h-3 text-indigo-500" />
                          {task.dueDate}
                        </span>
                        {task.scheduledTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {task.scheduledTime}
                          </span>
                        )}
                        <span>{task.durationMinutes} mins</span>
                        <Badge variant="outline" size="sm">{task.category}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    {!isDone && (
                      <button
                        onClick={() => setPromptTask(task)}
                        className="p-1.5 text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors"
                        title="What do you plan about this task? (Postpone, Not today, Change time)"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setTaskToEdit(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTaskToDelete(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Task Details Side Panel (When a task is selected) */}
        {selectedTask && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-indigo-200/80 dark:border-indigo-900/60 shadow-lg space-y-4 h-fit sticky top-20 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Task Details
              </span>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedTask.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <PriorityPill priority={selectedTask.priority} />
                <TaskStatusPill status={selectedTask.status} />
                <Badge variant="primary" size="sm">{selectedTask.category}</Badge>
              </div>
            </div>

            {selectedTask.description && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Description
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedTask.description}
                </p>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Due Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTask.dueDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Estimated Duration</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTask.durationMinutes} minutes</span>
              </div>
              {selectedTask.scheduledTime && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Scheduled Time</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTask.scheduledTime}</span>
                </div>
              )}
              {selectedTask.notes && (
                <div className="pt-1">
                  <span className="text-slate-400 block mb-1">Notes:</span>
                  <p className="text-slate-600 dark:text-slate-300 italic">{selectedTask.notes}</p>
                </div>
              )}
            </div>

            {/* Status change actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Button
                variant={selectedTask.status === 'completed' ? 'secondary' : 'primary'}
                size="sm"
                className="w-full"
                onClick={() => {
                  updateTaskStatus(selectedTask.id, selectedTask.status === 'completed' ? 'pending' : 'completed');
                  setSelectedTask({
                    ...selectedTask,
                    status: selectedTask.status === 'completed' ? 'pending' : 'completed',
                  });
                }}
              >
                {selectedTask.status === 'completed' ? 'Mark Incomplete' : 'Mark Completed'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete);
            if (selectedTask?.id === taskToDelete) setSelectedTask(null);
            setTaskToDelete(null);
          }
        }}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task?"
      />

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        title="Edit Task"
        maxWidth="md"
      >
        {taskToEdit && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateTask(taskToEdit);
              if (selectedTask?.id === taskToEdit.id) setSelectedTask(taskToEdit);
              setTaskToEdit(null);
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={taskToEdit.title}
                onChange={(e) => setTaskToEdit({ ...taskToEdit, title: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={taskToEdit.description || ''}
                onChange={(e) => setTaskToEdit({ ...taskToEdit, description: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  value={taskToEdit.priority}
                  onChange={(e) => setTaskToEdit({ ...taskToEdit, priority: e.target.value as Priority })}
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskToEdit.dueDate}
                  onChange={(e) => setTaskToEdit({ ...taskToEdit, dueDate: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setTaskToEdit(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Task
              </Button>
            </div>
          </form>
        )}
      </Modal>

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
