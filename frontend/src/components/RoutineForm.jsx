import { useState } from 'react'

export const DAYS = [
  ['MONDAY', 'Mon'], ['TUESDAY', 'Tue'], ['WEDNESDAY', 'Wed'], ['THURSDAY', 'Thu'],
  ['FRIDAY', 'Fri'], ['SATURDAY', 'Sat'], ['SUNDAY', 'Sun'],
]

export function routineToForm(r) {
  return {
    title: r.title,
    description: r.description ?? '',
    startTime: r.startTime.slice(0, 5),
    endTime: r.endTime.slice(0, 5),
    recurrenceType: r.recurrenceType,
    daysOfWeek: r.daysOfWeek,
    startDate: r.startDate,
    endDate: r.endDate ?? '',
  }
}

const input = 'w-full rounded border border-slate-300 px-3 py-2 text-sm'

export default function RoutineForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  function toggleDay(day) {
    const has = form.daysOfWeek.includes(day)
    setForm({ ...form, daysOfWeek: has ? form.daysOfWeek.filter((d) => d !== day) : [...form.daysOfWeek, day] })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit({
        title: form.title,
        description: form.description || null,
        startTime: form.startTime,
        endTime: form.endTime,
        recurrenceType: form.recurrenceType,
        daysOfWeek: form.recurrenceType === 'WEEKLY' ? form.daysOfWeek : [],
        startDate: form.startDate,
        endDate: form.endDate || null,
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
        <label htmlFor="r-title" className="mb-1 block text-sm font-medium">Title</label>
        <input id="r-title" required maxLength={150} value={form.title} onChange={set('title')} className={input} />
      </div>
      <div>
        <label htmlFor="r-desc" className="mb-1 block text-sm font-medium">Description</label>
        <input id="r-desc" maxLength={1000} value={form.description} onChange={set('description')} className={input} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="r-start" className="mb-1 block text-sm font-medium">Start time</label>
          <input id="r-start" type="time" required value={form.startTime} onChange={set('startTime')} className={input} />
        </div>
        <div>
          <label htmlFor="r-end" className="mb-1 block text-sm font-medium">End time</label>
          <input id="r-end" type="time" required value={form.endTime} onChange={set('endTime')} className={input} />
        </div>
        <div>
          <label htmlFor="r-from" className="mb-1 block text-sm font-medium">Starts on</label>
          <input id="r-from" type="date" required value={form.startDate} onChange={set('startDate')} className={input} />
        </div>
        <div>
          <label htmlFor="r-to" className="mb-1 block text-sm font-medium">Ends on (optional)</label>
          <input id="r-to" type="date" value={form.endDate} onChange={set('endDate')} className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="r-rec" className="mb-1 block text-sm font-medium">Repeats</label>
        <select id="r-rec" value={form.recurrenceType} onChange={set('recurrenceType')} className={input}>
          <option value="DAILY">Every day</option>
          <option value="WEEKLY">On selected weekdays</option>
        </select>
      </div>
      {form.recurrenceType === 'WEEKLY' && (
        <fieldset>
          <legend className="mb-1 text-sm font-medium">Weekdays</legend>
          <div className="flex flex-wrap gap-3">
            {DAYS.map(([value, label]) => (
              <label key={value} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={form.daysOfWeek.includes(value)} onChange={() => toggleDay(value)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

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