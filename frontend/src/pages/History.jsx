import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { addDays, hhmm, shortDate, todayIn } from '../utils/dates'

const badge = {
  PENDING: 'bg-slate-100 text-slate-700',
  COMPLETED: 'bg-teal-100 text-teal-900',
  SKIPPED: 'bg-slate-100 text-slate-700',
  MISSED: 'bg-red-100 text-red-800',
}

export default function History() {
  const { user } = useAuth()
  const today = todayIn(user.timezone)
  const [days, setDays] = useState(7)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api(`/api/occurrences?from=${addDays(today, -(days - 1))}&to=${today}`)
      .then((data) => { if (!cancelled) { setItems(data); setError(null) } })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [today, days])

  const past = items.filter((o) => o.date < today)
  const count = (status) => past.filter((o) => o.status === status).length
  const completed = count('COMPLETED')
  const missed = count('MISSED')
  const skipped = count('SKIPPED')
  const rate = completed + missed === 0 ? null : Math.round((completed * 100) / (completed + missed))

  const dates = Array.from({ length: days }, (_, i) => addDays(today, -i))
    .filter((d) => items.some((o) => o.date === d))

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">History</h1>

      <label className="block text-sm">
        Show the last{' '}
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}
                className="rounded border border-slate-300 px-2 py-1">
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </label>

      {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-slate-600">Loading...</p>}

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold">Routine summary (days before today)</h2>
        <p className="text-sm">
          Completed {completed} · Missed {missed} · Skipped {skipped}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {rate === null
            ? 'No finished days yet.'
            : `Completion rate: ${rate}% (completed ÷ completed + missed; skipped items are not counted).`}
        </p>
      </section>

      {!loading && dates.length === 0 && <p className="text-slate-600">No routine items in this period.</p>}

      {dates.map((d) => (
        <section key={d} className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-1 font-semibold">{shortDate(d)}{d === today ? ' (today)' : ''}</h2>
          <ul>
            {items.filter((o) => o.date === d).map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-2 border-t border-slate-100 py-2 first:border-t-0">
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{hhmm(o.startTime)}</span> {o.title}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[o.status]}`}>
                  {o.status.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}