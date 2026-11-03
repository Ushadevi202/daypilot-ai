import { DemoNotice } from '../components/common/DemoNotice';
import { todayISO } from '../utils/today';
import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Briefcase,
  Repeat,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  X,
  LayoutGrid,
  Columns,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { PriorityPill } from '../components/common/StatusPill';

export const CalendarView: React.FC = () => {
  const { tasks, routines, applications, selectedDate, setSelectedDate, openQuickAdd } = useApp();

  // Mode: 'week' or 'month' as explicitly requested
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');

  // Month navigation
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October

  // Week navigation state (reference date in the current week)
  const [currentWeekRefDate, setCurrentWeekRefDate] = useState<Date>(new Date(2026, 9, 31));

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isGCalSyncing, setIsGCalSyncing] = useState(false);
  const [gcalSyncTime, setGcalSyncTime] = useState('5 minutes ago');

  // Filter types
  const [showRoutines, setShowRoutines] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showInterviews, setShowInterviews] = useState(true);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Week navigation helpers
  const handlePrevWeek = () => {
    const nextDate = new Date(currentWeekRefDate);
    nextDate.setDate(nextDate.getDate() - 7);
    setCurrentWeekRefDate(nextDate);
  };

  const handleNextWeek = () => {
    const nextDate = new Date(currentWeekRefDate);
    nextDate.setDate(nextDate.getDate() + 7);
    setCurrentWeekRefDate(nextDate);
  };

  const handleThisWeek = () => {
    setCurrentWeekRefDate(new Date(2026, 9, 31));
  };

  // Days in month calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Helper to format Date into YYYY-MM-DD
  const formatDateStr = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Compute 7 days for current week view (Sunday to Saturday)
  const getDaysOfCurrentWeek = () => {
    const curr = new Date(currentWeekRefDate);
    const dayOfWeek = curr.getDay(); // 0 is Sunday
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - dayOfWeek);

    const weekDays: { date: Date; dateStr: string; dayName: string; dayNum: number }[] = [];
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      weekDays.push({
        date: d,
        dateStr: formatDateStr(d),
        dayName: names[i],
        dayNum: d.getDate(),
      });
    }
    return weekDays;
  };

  const currentWeekDays = getDaysOfCurrentWeek();
  const weekStartStr = `${monthNames[currentWeekDays[0].date.getMonth()]} ${currentWeekDays[0].dayNum}`;
  const weekEndStr = `${monthNames[currentWeekDays[6].date.getMonth()]} ${currentWeekDays[6].dayNum}, ${currentWeekDays[6].date.getFullYear()}`;

  // Aggregate events for any date
  const getEventsForDate = (dateStr: string) => {
    const list: any[] = [];

    // 1. Interviews & Assessments from Applications
    if (showInterviews) {
      applications.forEach((app) => {
        app.timeline.forEach((ev) => {
          if (ev.date === dateStr && (ev.type === 'interview' || ev.type === 'assessment')) {
            list.push({
              id: ev.id,
              title: `${app.companyName}: ${ev.title}`,
              type: ev.type,
              time: '11:00 AM',
              color: ev.type === 'interview'
                ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800'
                : 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
              data: { ...ev, company: app.companyName, role: app.jobTitle },
            });
          }
        });
      });
    }

    // 2. Tasks
    if (showTasks) {
      tasks.forEach((t) => {
        if (t.dueDate === dateStr) {
          list.push({
            id: t.id,
            title: t.title,
            type: 'task',
            time: t.scheduledTime || 'Flexible',
            priority: t.priority,
            duration: `${t.durationMinutes}m`,
            color: t.status === 'completed'
              ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800',
            data: t,
          });
        }
      });
    }

    // Routine days are real items from the backend and already appear in the task list above.

    return list;
  };

  const handleSyncGCal = () => {
    setIsGCalSyncing(true);
    setTimeout(() => {
      setIsGCalSyncing(false);
      setGcalSyncTime('Just now');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <DemoNotice>Google Calendar is not connected. This calendar shows your own tasks and routine items. The sync button is a demonstration.</DemoNotice>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Calendar & Scheduling
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Unified view of routine habits, technical interview rounds, assessments, and tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Week & Month Mode Switcher Button Group */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => openQuickAdd('interview')}
            icon={<Plus className="w-4 h-4" />}
          >
            Schedule Event
          </Button>
        </div>
      </div>

      {/* Google Calendar Status Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Google Calendar Two-Way Sync
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Active Two-Way Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Syncs scheduled technical interviews, Hackerrank windows, and morning routines with your calendar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400">Synced: {gcalSyncTime}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncGCal}
            isLoading={isGCalSyncing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isGCalSyncing ? 'animate-spin' : ''}`} />}
          >
            Poll Sync
          </Button>
        </div>
      </div>

      {/* Navigation Controls & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Date Navigator (Switches between Week and Month) */}
        {viewMode === 'month' ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-3 min-w-[120px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setCurrentYear(2026);
                setCurrentMonth(9);
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Current Month
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={handlePrevWeek}
                className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-3 min-w-[160px] text-center">
                {weekStartStr} – {weekEndStr}
              </span>
              <button
                onClick={handleNextWeek}
                className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleThisWeek}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              This Week
            </button>
          </div>
        )}

        {/* Filter Checkboxes */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={showInterviews}
              onChange={(e) => setShowInterviews(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Interviews
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={showTasks}
              onChange={(e) => setShowTasks(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Tasks
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={showRoutines}
              onChange={(e) => setShowRoutines(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Routines
          </label>
        </div>
      </div>

      {/* 1. WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            {currentWeekDays.map((day) => {
              const events = getEventsForDate(day.dateStr);
              const isToday = day.dateStr === todayISO();
              const isSelected = selectedDate === day.dateStr;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`min-h-[460px] p-3 flex flex-col transition-colors cursor-pointer ${
                    isToday
                      ? 'bg-indigo-50/30 dark:bg-indigo-950/20'
                      : isSelected
                      ? 'bg-slate-50/80 dark:bg-slate-800/40'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  {/* Day Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        {day.dayName}
                      </span>
                      <span
                        className={`text-base font-extrabold w-8 h-8 flex items-center justify-center rounded-xl mt-0.5 ${
                          isToday
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {day.dayNum}
                      </span>
                    </div>
                    {events.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {events.length} item{events.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Day Events List */}
                  <div className="space-y-2 flex-1">
                    {events.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-slate-300 dark:text-slate-600 italic py-6">
                        No events
                      </div>
                    ) : (
                      events.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-transform hover:-translate-y-0.5 shadow-xs space-y-1 ${ev.color}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                              {ev.type}
                            </span>
                            <span className="text-[10px] opacity-75 font-medium">{ev.time}</span>
                          </div>
                          <p className="font-bold line-clamp-2 leading-snug">
                            {ev.title}
                          </p>
                          {ev.duration && (
                            <span className="text-[10px] opacity-70 block">
                              Duration: {ev.duration}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/80 min-h-[500px]">
            {/* Empty prefix days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 bg-slate-50/40 dark:bg-slate-900/40" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const mm = String(currentMonth + 1).padStart(2, '0');
              const dd = String(dayNum).padStart(2, '0');
              const dateStr = `${currentYear}-${mm}-${dd}`;
              const events = getEventsForDate(dateStr);
              const isToday = dateStr === todayISO();

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                  }}
                  className={`p-2 min-h-[95px] flex flex-col justify-between transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30 cursor-pointer ${
                    isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {events.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {events.length}
                      </span>
                    )}
                  </div>

                  {/* Event Pills */}
                  <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                    {events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate ${ev.color}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <span className="text-[10px] text-slate-400 block font-medium pl-1">
                        +{events.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        maxWidth="sm"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {selectedEvent.type}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {selectedEvent.title}
              </h3>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {selectedEvent.time || '10:00 AM'}
              </span>
              {selectedEvent.duration && (
                <span>• Duration: {selectedEvent.duration}</span>
              )}
            </div>

            {selectedEvent.data?.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                {selectedEvent.data.description}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
