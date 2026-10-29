import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export default function TaskHistory({ taskId }) {
  const { user } = useAuth()
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api(`/api/tasks/${taskId}/history`).then(setItems).catch((e) => setError(e.message))
  }, [taskId])

  return (
    <div className="basis-full rounded bg-slate-50 p-3 text-xs">
      {error && <p className="text-red-700">{error}</p>}
      {!items && !error && <p>Loading...</p>}
      {items && (
        <ul className="space-y-1">
          {items.map((h, i) => (
            <li key={i}>
              <span className="font-semibold">{h.action.toLowerCase()}</span>
              {h.details ? `: ${h.details}` : ''}
              <span className="text-slate-500">
                {' '}· {new Date(h.at).toLocaleString(undefined, { timeZone: user.timezone })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}