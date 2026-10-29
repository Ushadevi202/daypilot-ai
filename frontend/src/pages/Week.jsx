import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { addDays, hhmm, mondayOf, shortDate, todayIn } from '../utils/dates'

const badge = {
  PENDING: 'bg-slate-100 text-slate-700',
  COMPLETED: 'bg-teal-100 text-teal-900',
  SKIPPED: 'bg-slate-100 text-slate-700',
  MISSED: 'bg-red-100 text-red-800',
}
const btn = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm'

export default function Week() {
  const { user } = useAuth()
  const today = todayIn(user.timezone)
  const [weekStart, setWeekStart] = useState(mondayOf(today))
  const [occurrences, setOccurrences] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const weekEnd = addDays(weekStart, 6)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      api(`/api/occurrences?from=${weekStart}&to=${weekEnd}`),
      api(`/api/tasks?dueFrom=${weekStart}&dueTo=${weekEnd}`),
    ])
      .then(([occ, tsk]) => {
        if (cancelled) return
        setOccurrences(occ)
        setTasks(tsk)
        setError(null)
      })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [weekStart, weekEnd])

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <h1 className="text-2xl font-bold">Week</h1>

      <div className="flex flex-wrap items-center gap-2">
        <button className={btn} onClick={() => setWeekStart(addDays(weekStart, -7))}>Previous week</button>
        <button className={btn} onClick={() => setWeekStart(mondayOf(today))}>This week</button>
        <button className={btn} onClick={() => setWeekStart(addDays(weekStart, 7))}>Next week</button>
        <span className="text-sm text-slate-600">{shortDate(weekStart)} to {shortDate(weekEnd)}</span>
      </div>

      {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-slate-600">Loading...</p>}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {days.map((day) => {
          const dayOcc = occurrences.filter((o) => o.date === day)
          const dayTasks = tasks
            .filter((t) => t.dueDate === day)
            .sort((a, b) => (a.scheduledTime ?? '99').localeCompare(b.scheduledTime ?? '99'))
          const isToday = day === today
          return (
            <section key={day}
                     className={`rounded-xl bg-white p-3 shadow ${isToday ? 'ring-2 ring-brand' : ''}`}>
              <h2 className="mb-2 text-sm font-semibold">
                {shortDate(day)}{isToday ? ' (today)' : ''}
              </h2>
              {dayOcc.length === 0 && dayTasks.length === 0 && (
                <p className="text-xs text-slate-500">Nothing planned</p>
              )}
              <ul className="space-y-2">
                {dayOcc.map((o) => (
                  <li key={`o${o.id}`} className="text-sm">
                    <p className={o.status === 'COMPLETED' ? 'text-slate-500 line-through' : ''}>
                      <span className="font-medium">{hhmm(o.startTime)}</span> {o.title}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[o.status]}`}>
                      routine · {o.status.toLowerCase()}
                    </span>
                  </li>
                ))}
                {dayTasks.map((t) => (
                  <li key={`t${t.id}`} className="text-sm">
                    <p className={t.status === 'COMPLETED' ? 'text-slate-500 line-through' : ''}>
                      {t.scheduledTime && <span className="font-medium">{hhmm(t.scheduledTime)} </span>}
                      {t.title}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      t.overdue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}>
                      task · {t.overdue ? 'overdue' : t.status.toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}