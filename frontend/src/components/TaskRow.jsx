import { hhmm } from '../utils/dates'

const priorityStyle = {
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-amber-100 text-amber-900',
  LOW: 'bg-slate-100 text-slate-700',
}

export default function TaskRow({ task, onToggle, children }) {
  const done = task.status === 'COMPLETED'
  return (
    <li className="border-t border-slate-100 py-3 first:border-t-0">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(task)}
          aria-label={`Mark ${task.title} ${done ? 'pending' : 'complete'}`}
          className="mt-1 h-5 w-5"
        />
        <div className="min-w-0 flex-1">
          <p className={`font-medium ${done ? 'text-slate-500 line-through' : ''}`}>{task.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className={`rounded-full px-2 py-0.5 font-semibold ${priorityStyle[task.priority]}`}>
              {task.priority.toLowerCase()}
            </span>
            {task.category && <span>{task.category}</span>}
            {task.dueDate && (
              <span>Due {task.dueDate}{task.scheduledTime ? ` ${hhmm(task.scheduledTime)}` : ''}</span>
            )}
            {task.estimatedMinutes && <span>{task.estimatedMinutes} min</span>}
            {task.overdue && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-800">Overdue</span>
            )}
            {task.postponedCount > 0 && <span>Postponed {task.postponedCount}x</span>}
          </div>
        </div>
      </div>
      {children && <div className="ml-8 mt-2 flex flex-wrap gap-2">{children}</div>}
    </li>
  )
}