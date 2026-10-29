import { hhmm } from '../utils/dates'
import { DAYS } from './RoutineForm'

export default function WeeklyTimetable({ routines }) {
  return (
    <section className="rounded-xl bg-white p-4 shadow" aria-label="Weekly timetable">
      <h2 className="mb-3 font-semibold">Your weekly timetable</h2>
      <div className="grid gap-3 md:grid-cols-7">
        {DAYS.map(([value, label]) => {
          const items = routines
            .filter((r) => r.recurrenceType === 'DAILY' || r.daysOfWeek.includes(value))
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
          return (
            <div key={value} className="rounded-lg border border-slate-200 p-2">
              <p className="mb-1 text-sm font-semibold">{label}</p>
              {items.length === 0 ? (
                <p className="text-xs text-slate-500">Free</p>
              ) : (
                <ul className="space-y-1">
                  {items.map((r) => (
                    <li key={r.id} className="text-xs">
                      <span className="font-medium">{hhmm(r.startTime)}</span> {r.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}