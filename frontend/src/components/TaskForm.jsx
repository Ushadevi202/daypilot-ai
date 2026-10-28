import { useState } from 'react'

const empty = {
  title: '', description: '', category: '', priority: 'MEDIUM',
  dueDate: '', scheduledTime: '', estimatedMinutes: '', notes: '',
}

export function toForm(task) {
  return {
    title: task.title,
    description: task.description ?? '',
    category: task.category ?? '',
    priority: task.priority,
    dueDate: task.dueDate ?? '',
    scheduledTime: task.scheduledTime ? task.scheduledTime.slice(0, 5) : '',
    estimatedMinutes: task.estimatedMinutes ?? '',
    notes: task.notes ?? '',
  }
}

const input = 'w-full rounded border border-slate-300 px-3 py-2 text-sm'

export default function TaskForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial ?? empty)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit({
        title: form.title,
        description: form.description || null,
        category: form.category || null,
        priority: form.priority,
        dueDate: form.dueDate || null,
        scheduledTime: form.scheduledTime || null,
        estimatedMinutes: form.estimatedMinutes === '' ? null : Number(form.estimatedMinutes),
        notes: form.notes || null,
      })
    } catch (err) {
      setError(err.errors ? Object.values(err.errors).join('. ') : err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <div>
        <label htmlFor="t-title" className="mb-1 block text-sm font-medium">Title</label>
        <input id="t-title" required maxLength={150} value={form.title} onChange={set('title')} className={input} />
      </div>
      <div>
        <label htmlFor="t-desc" className="mb-1 block text-sm font-medium">Description</label>
        <textarea id="t-desc" rows={2} value={form.description} onChange={set('description')} className={input} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="t-cat" className="mb-1 block text-sm font-medium">Category</label>
          <input id="t-cat" maxLength={50} value={form.category} onChange={set('category')} className={input} />
        </div>
        <div>
          <label htmlFor="t-pri" className="mb-1 block text-sm font-medium">Priority</label>
          <select id="t-pri" value={form.priority} onChange={set('priority')} className={input}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="t-due" className="mb-1 block text-sm font-medium">Due date</label>
          <input id="t-due" type="date" value={form.dueDate} onChange={set('dueDate')} className={input} />
        </div>
        <div>
          <label htmlFor="t-time" className="mb-1 block text-sm font-medium">Time (needs a due date)</label>
          <input id="t-time" type="time" value={form.scheduledTime} onChange={set('scheduledTime')} className={input} />
        </div>
        <div>
          <label htmlFor="t-min" className="mb-1 block text-sm font-medium">Estimated minutes</label>
          <input id="t-min" type="number" min={1} max={1440} value={form.estimatedMinutes}
                 onChange={set('estimatedMinutes')} className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="t-notes" className="mb-1 block text-sm font-medium">Notes</label>
        <textarea id="t-notes" rows={2} value={form.notes} onChange={set('notes')} className={input} />
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={saving}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button>
      </div>
    </form>
  )
}