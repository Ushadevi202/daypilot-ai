import React from 'react';
import { ApplicationStatus, Priority, TaskStatus } from '../../types';

export const PriorityPill: React.FC<{ priority: Priority }> = ({ priority }) => {
  switch (priority) {
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          High
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Medium
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Low
        </span>
      );
  }
};

export const ApplicationStatusPill: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const configs: Record<ApplicationStatus, { label: string; bg: string; dot: string }> = {
    interested: {
      label: 'Interested',
      bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-400',
    },
    applied: {
      label: 'Applied',
      bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      dot: 'bg-blue-500',
    },
    assessment: {
      label: 'Assessment',
      bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      dot: 'bg-amber-500',
    },
    interview: {
      label: 'Interviewing',
      bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
      dot: 'bg-purple-500',
    },
    selected: {
      label: 'Selected / Offer',
      bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      dot: 'bg-emerald-500',
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      dot: 'bg-rose-400',
    },
    withdrawn: {
      label: 'Withdrawn',
      bg: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
      dot: 'bg-zinc-400',
    },
    on_hold: {
      label: 'On Hold',
      bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900',
      dot: 'bg-orange-400',
    },
  };

  const c = configs[status] || configs.applied;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {c.label}
    </span>
  );
};

export const TaskStatusPill: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          Completed
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
          In Progress
        </span>
      );
    case 'postponed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
          Postponed
        </span>
      );
    case 'skipped':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Skipped
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Pending
        </span>
      );
  }
};
