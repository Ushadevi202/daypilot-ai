import { addDaysISO } from '../../utils/today';
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Task } from '../../types';
import { AlertCircle, Clock, Calendar, SkipForward, ArrowRight, Check } from 'lucide-react';

interface OverdueTaskPromptModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onPostpone: (taskId: string, targetDate: string) => void;
  onNotToday: (taskId: string) => void;
  onChangeTimeToday: (taskId: string, newTime: string) => void;
}

export const OverdueTaskPromptModal: React.FC<OverdueTaskPromptModalProps> = ({
  task,
  isOpen,
  onClose,
  onPostpone,
  onNotToday,
  onChangeTimeToday,
}) => {
  const [targetPostponeDate, setTargetPostponeDate] = useState(addDaysISO(1));
  const [selectedTimeToday, setSelectedTimeToday] = useState('18:00');
  const [mode, setMode] = useState<'prompt' | 'pick_time' | 'pick_date'>('prompt');

  if (!task) return null;

  const handlePostponeTomorrow = () => {
    onPostpone(task.id, addDaysISO(1));
    onClose();
  };

  const handleCustomPostpone = () => {
    onPostpone(task.id, targetPostponeDate);
    onClose();
  };

  const handleNotToday = () => {
    onNotToday(task.id);
    onClose();
  };

  const handleConfirmTimeToday = () => {
    onChangeTimeToday(task.id, selectedTimeToday);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Follow-up Check-in"
      description="Help keep your schedule realistic and stress-free"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Urgent Alert Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Scheduled time passed
            </span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              You did not complete that task: &ldquo;{task.title}&rdquo;
            </p>
            <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
              Scheduled duration: {task.durationMinutes} mins • Original due date: {task.dueDate}
            </p>
          </div>
        </div>

        {/* The Core Question */}
        <div className="text-center py-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            What do you plan about this?
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose an option below to update your schedule instantly.
          </p>
        </div>

        {/* Mode 1: 3 Main Choice Cards as requested */}
        {mode === 'prompt' && (
          <div className="space-y-3">
            {/* Choice 1: Postpone */}
            <button
              onClick={() => setMode('pick_date')}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Postpone Task
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Move task to tomorrow or choose another day
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </button>

            {/* Choice 2: Not today (Skip) */}
            <button
              onClick={handleNotToday}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                  <SkipForward className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Not Today
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Skip this task for today without penalty
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
            </button>

            {/* Choice 3: Change time to this time only for today */}
            <button
              onClick={() => setMode('pick_time')}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Change Time to This Time Only for Today
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Keep for today but reschedule to later this afternoon or evening
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>
        )}

        {/* Mode 2: Pick Time Only for Today */}
        {mode === 'pick_time' && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Select new time slot for today:
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                This will update the task start time on today&apos;s timeline without moving dates.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['16:30', '18:00', '19:30', '20:15', '21:00', '22:00'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTimeToday(time)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    selectedTimeToday === time
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Or custom time:
              </label>
              <input
                type="time"
                value={selectedTimeToday}
                onChange={(e) => setSelectedTimeToday(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" size="sm" onClick={() => setMode('prompt')}>
                ← Back to options
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmTimeToday}>
                Set to {selectedTimeToday} Today
              </Button>
            </div>
          </div>
        )}

        {/* Mode 3: Pick Target Postpone Date */}
        {mode === 'pick_date' && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Select new date to postpone:
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                The task will be preserved on your backlog and rescheduled for this target day.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePostponeTomorrow}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
              >
                Tomorrow (Nov 01)
              </button>
              <button
                type="button"
                onClick={() => {
                  onPostpone(task.id, addDaysISO(2));
                  onClose();
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Next Monday (Nov 02)
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Or pick specific calendar date:
              </label>
              <input
                type="date"
                value={targetPostponeDate}
                onChange={(e) => setTargetPostponeDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" size="sm" onClick={() => setMode('prompt')}>
                ← Back to options
              </Button>
              <Button variant="primary" size="sm" onClick={handleCustomPostpone}>
                Postpone to {targetPostponeDate}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Decide Later
          </Button>
        </div>
      </div>
    </Modal>
  );
};
