import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import RoutineForm, { DAYS, routineToForm } from '../components/RoutineForm'
import { hhmm, todayIn } from '../utils/dates'
import WeeklyTimetable from '../components/WeeklyTimetable'

const btn = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm'
const dayShort = Object.fromEntries(DAYS)

export default function Routines() {
  const { user } = useAuth()
  const today = todayIn(user.timezone)
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    try {
      setRoutines(await api('/api/routines'))
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function run(action) {
    try {
      await action()
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const setActive = (r, active) =>
    run(() => api(`/api/routines/${r.id}/active`, { method: 'PUT', body: { active } }))

  function remove(r) {
    if (!window.confirm(`Delete "${r.title}"? Past days stay in your history. Future days are removed.`)) return
    run(() => api(`/api/routines/${r.id}`, { method: 'DELETE' }))
  }

  const newRoutine = {
    title: '', description: '', startTime: '06:30', endTime: '07:00',
    recurrenceType: 'DAILY', daysOfWeek: [], startDate: today, endDate: '',
  }

  const repeatText = (r) =>
    r.recurrenceType === 'DAILY' ? 'Every day' : r.daysOfWeek.map((d) => dayShort[d]).join(', ')

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Routines</h1>
      <p className="text-sm text-slate-600">
        A routine is a template. Each day gets its own item that you can complete, skip or move.
      </p>

      {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <button onClick={() => { setShowAdd(!showAdd); setEditing(null) }}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
        {showAdd ? 'Close' : 'New routine'}
      </button>

      {showAdd && (
        <div className="rounded-xl bg-white p-4 shadow">
          <RoutineForm initial={newRoutine} submitLabel="Create routine" onCancel={() => setShowAdd(false)}
                       onSubmit={async (payload) => {
                         await api('/api/routines', { method: 'POST', body: payload })
                         setShowAdd(false)
                         await load()
                       }} />
        </div>
      )}

      {editing && (
        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-2 font-semibold">Edit routine</h2>
          <p className="mb-2 text-xs text-slate-600">Changes apply to future days only. History stays as it was.</p>
          <RoutineForm key={editing.id} initial={routineToForm(editing)} submitLabel="Save changes"
                       onCancel={() => setEditing(null)}
                       onSubmit={async (payload) => {
                         await api(`/api/routines/${editing.id}`, { method: 'PUT', body: payload })
                         setEditing(null)
                         await load()
                       }} />
        </div>
      )}

      {routines.some((r) => r.active) && <WeeklyTimetable routines={routines.filter((r) => r.active)} />}

      {loading && <p className="text-slate-600">Loading...</p>}
      {!loading && routines.length === 0 && (
        <p className="text-slate-600">No routines yet. Create your first fixed timetable item above.</p>
      )}

      <ul className="space-y-3">
        {routines.map((r) => (
          <li key={r.id} className="rounded-xl bg-white p-4 shadow">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${r.active ? '' : 'text-slate-500'}`}>{r.title}</p>
                <p className="text-sm text-slate-600">
                  {hhmm(r.startTime)} to {hhmm(r.endTime)} · {r.estimatedMinutes} min · {repeatText(r)}
                </p>
                <p className="text-xs text-slate-600">
                  From {r.startDate}{r.endDate ? ` to ${r.endDate}` : ''}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={r.active} onChange={(e) => setActive(r, e.target.checked)} />
                Active
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button className={btn} onClick={() => { setEditing(r); setShowAdd(false) }}>Edit</button>
              <button className={btn} onClick={() => remove(r)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}