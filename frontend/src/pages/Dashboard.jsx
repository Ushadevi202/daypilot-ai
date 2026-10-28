import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import TaskRow from '../components/TaskRow'
import { hhmm, longDate, todayIn } from '../utils/dates'

const badgeStyle = {
  PENDING: 'bg-slate-100 text-slate-700',
  COMPLETED: 'bg-teal-100 text-teal-900',
  SKIPPED: 'bg-slate-100 text-slate-700',
  MISSED: 'bg-red-100 text-red-800',
}

const btn = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm'

function RoutineItem({ o, onStatus, onMove }) {
  const [moving, setMoving] = useState(false)
  const [start, setStart] = useState(hhmm(o.startTime))
  const [end, setEnd] = useState(hhmm(o.endTime))
  const finished = o.status === 'COMPLETED' || o.status === 'SKIPPED'

  return (
    <li className="border-t border-slate-100 py-3 first:border-t-0">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className={`font-medium ${o.status === 'COMPLETED' ? 'text-slate-500 line-through' : ''}`}>{o.title}</p>
          <p className="text-xs text-slate-600">
            {hhmm(o.startTime)} to {hhmm(o.endTime)} · {o.estimatedMinutes} min{o.rescheduled ? ' · moved' : ''}
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeStyle[o.status]}`}>
          {o.status.toLowerCase()}
        </span>
        {o.status === 'PENDING' && (
          <>
            <button className={btn} onClick={() => onStatus(o, 'COMPLETED')}>Done</button>
            <button className={btn} onClick={() => onStatus(o, 'SKIPPED')}>Skip</button>
            <button className={btn} onClick={() => setMoving(!moving)}>Move</button>
          </>
        )}
        {o.status === 'MISSED' && <button className={btn} onClick={() => onStatus(o, 'COMPLETED')}>Mark done</button>}
        {finished && <button className={btn} onClick={() => onStatus(o, 'PENDING')}>Undo</button>}
      </div>
      {moving && (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="text-xs">Start
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)}
                   className="block rounded border border-slate-300 px-2 py-1 text-sm" />
          </label>
          <label className="text-xs">End
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)}
                   className="block rounded border border-slate-300 px-2 py-1 text-sm" />
          </label>
          <button className={btn} onClick={async () => { await onMove(o, start, end); setMoving(false) }}>
            Save
          </button>
        </div>
      )}
    </li>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const today = todayIn(user.timezone)
  const [occurrences, setOccurrences] = useState([])
  const [dueToday, setDueToday] = useState([])
  const [overdue, setOverdue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')

  const load = useCallback(async () => {
    try {
      const [occ, due, over] = await Promise.all([
        api('/api/occurrences'),
        api(`/api/tasks?dueFrom=${today}&dueTo=${today}`),
        api('/api/tasks?overdue=true'),
      ])
      setOccurrences(occ)
      setDueToday(due)
      setOverdue(over)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => { load() }, [load])

  async function run(action) {
    try {
      await action()
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const setStatus = (o, status) =>
    run(() => api(`/api/occurrences/${o.id}/status`, { method: 'PUT', body: { status } }))
  const move = (o, startTime, endTime) =>
    run(() => api(`/api/occurrences/${o.id}/reschedule`, { method: 'PUT', body: { startTime, endTime } }))
  const toggleTask = (t) =>
    run(() => api(`/api/tasks/${t.id}/${t.status === 'COMPLETED' ? 'reopen' : 'complete'}`, { method: 'PUT' }))

  async function quickAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    await run(() => api('/api/tasks', { method: 'POST', body: { title: title.trim(), dueDate: today } }))
    setTitle('')
  }

  const activeRoutines = occurrences.filter((o) => o.status !== 'SKIPPED')
  const total = activeRoutines.length + dueToday.length + overdue.length
  const done = activeRoutines.filter((o) => o.status === 'COMPLETED').length
    + dueToday.filter((t) => t.status === 'COMPLETED').length
  const percent = total === 0 ? 0 : Math.round((done * 100) / total)

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="text-sm text-slate-600">{longDate(today)}</p>
      </div>

      {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <section className="rounded-xl bg-white p-4 shadow" aria-label="Progress">
        <div className="mb-2 flex justify-between text-sm font-semibold">
          <span>{done} of {total} done</span>
          <span className="text-brand">{percent}%</span>
        </div>
        <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}
             className="h-2.5 rounded-full bg-slate-200">
          <div className="h-2.5 rounded-full bg-brand" style={{ width: `${percent}%` }} />
        </div>
      </section>

      <form onSubmit={quickAdd} className="flex gap-2">
        <input aria-label="Quick add a task for today" placeholder="Quick add for today, then press Enter"
               value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150}
               className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Add</button>
      </form>

      {loading && <p className="text-slate-600">Loading...</p>}

      {overdue.length > 0 && (
        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-1 font-semibold text-red-800">Overdue</h2>
          <ul>{overdue.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)}</ul>
        </section>
      )}

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-1 font-semibold">Fixed routines</h2>
        {!loading && occurrences.length === 0 && (
          <p className="text-sm text-slate-600">
            No routines today. <Link to="/routines" className="text-brand underline">Add a routine</Link>
          </p>
        )}
        <ul>
          {occurrences.map((o) => <RoutineItem key={o.id} o={o} onStatus={setStatus} onMove={move} />)}
        </ul>
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-1 font-semibold">Tasks due today</h2>
        {!loading && dueToday.length === 0 && <p className="text-sm text-slate-600">Nothing due today.</p>}
        <ul>{dueToday.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)}</ul>
      </section>
    </div>
  )
}