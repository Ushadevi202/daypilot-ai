import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import TaskForm, { toForm } from '../components/TaskForm'
import TaskRow from '../components/TaskRow'
import { addDays, todayIn } from '../utils/dates'
   import TaskHistory from '../components/TaskHistory'

const noFilters = { status: '', priority: '', category: '', q: '', overdue: false }
const btn = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm'
const field = 'rounded border border-slate-300 px-3 py-2 text-sm'

export default function Tasks() {
  const { user } = useAuth()
  const today = todayIn(user.timezone)
  const [tasks, setTasks] = useState([])
  const [filters, setFilters] = useState(noFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quickTitle, setQuickTitle] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [postponing, setPostponing] = useState(null)
  const [historyId, setHistoryId] = useState(null)

  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.category.trim()) params.set('category', filters.category.trim())
  if (filters.q.trim()) params.set('q', filters.q.trim())
  if (filters.overdue) params.set('overdue', 'true')
  const queryString = params.toString() ? `?${params.toString()}` : ''

  const load = useCallback(async () => {
    try {
      setTasks(await api(`/api/tasks${queryString}`))
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [queryString])

  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  async function run(action) {
    try {
      await action()
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function quickAdd(e) {
    e.preventDefault()
    if (!quickTitle.trim()) return
        await run(() => api('/api/tasks', { method: 'POST', body: { title: quickTitle.trim(), dueDate: today } }))
    setQuickTitle('')
  }

  const toggle = (t) =>
    run(() => api(`/api/tasks/${t.id}/${t.status === 'COMPLETED' ? 'reopen' : 'complete'}`, { method: 'PUT' }))

  function remove(t) {
    if (!window.confirm(`Delete "${t.title}"? Its history is deleted too.`)) return
    run(() => api(`/api/tasks/${t.id}`, { method: 'DELETE' }))
  }

  async function savePostpone() {
    await run(() => api(`/api/tasks/${postponing.id}/postpone`, { method: 'PUT', body: { dueDate: postponing.date } }))
    setPostponing(null)
  }

  function startPostpone(t) {
    setPostponing({ id: t.id, date: t.dueDate ? addDays(t.dueDate, 1) : today, min: t.dueDate ? addDays(t.dueDate, 1) : today })
  }

  const renderRow = (t) => (
    <TaskRow key={t.id} task={t} onToggle={toggle}>
      <button className={btn} onClick={() => { setEditing(t); setShowAdd(false) }}>Edit</button>
      {t.status === 'PENDING' && <button className={btn} onClick={() => startPostpone(t)}>Postpone</button>}
      <button className={btn} onClick={() => remove(t)}>Delete</button>
      <button className={btn} onClick={() => setHistoryId(historyId === t.id ? null : t.id)}>History</button>
      {historyId === t.id && <TaskHistory taskId={t.id} />}
      {postponing?.id === t.id && (
        <span className="flex items-center gap-2">
          <input type="date" aria-label="New due date" value={postponing.date} min={postponing.min}
                 onChange={(e) => setPostponing({ ...postponing, date: e.target.value })}
                 className="rounded border border-slate-300 px-2 py-1 text-sm" />
          <button className={btn} onClick={savePostpone}>Save</button>
          <button className={btn} onClick={() => setPostponing(null)}>Cancel</button>
        </span>
      )}
    </TaskRow>
  )

  const pending = tasks.filter((t) => t.status === 'PENDING')
  const completed = tasks.filter((t) => t.status === 'COMPLETED')

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Tasks</h1>

      {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={quickAdd} className="flex gap-2">
        <input aria-label="Quick add task" placeholder="Quick add for today: type a task and press Enter"
               value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} maxLength={150}
               className={`${field} flex-1`} />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Add</button>
      </form>

      <button onClick={() => { setShowAdd(!showAdd); setEditing(null) }} className="text-sm text-brand underline">
        {showAdd ? 'Hide the details form' : 'Add a task with details'}
      </button>

      {showAdd && (
        <div className="rounded-xl bg-white p-4 shadow">
          <TaskForm submitLabel="Add task" onCancel={() => setShowAdd(false)}
                    onSubmit={async (payload) => {
                      await api('/api/tasks', { method: 'POST', body: payload })
                      setShowAdd(false)
                      await load()
                    }} />
        </div>
      )}

      {editing && (
        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-2 font-semibold">Edit task</h2>
          <TaskForm key={editing.id} initial={toForm(editing)} submitLabel="Save changes"
                    onCancel={() => setEditing(null)}
                    onSubmit={async (payload) => {
                      await api(`/api/tasks/${editing.id}`, { method: 'PUT', body: payload })
                      setEditing(null)
                      await load()
                    }} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-4 shadow sm:grid-cols-5">
        <select aria-label="Status" value={filters.status} className={field}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select aria-label="Priority" value={filters.priority} className={field}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <input aria-label="Category" placeholder="Category" value={filters.category} className={field}
               onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
        <input aria-label="Search" placeholder="Search title" value={filters.q} className={field}
               onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filters.overdue}
                 onChange={(e) => setFilters({ ...filters, overdue: e.target.checked })} />
          Overdue only
        </label>
      </div>

      {loading && <p className="text-slate-600">Loading...</p>}
      {!loading && tasks.length === 0 && <p className="text-slate-600">No tasks match. Add one above.</p>}

      {pending.length > 0 && (
        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-1 font-semibold">Pending ({pending.length})</h2>
          <ul>{pending.map(renderRow)}</ul>
        </section>
      )}
      {completed.length > 0 && (
        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-1 font-semibold">Completed ({completed.length})</h2>
          <ul>{completed.map(renderRow)}</ul>
        </section>
      )}
    </div>
  )
}