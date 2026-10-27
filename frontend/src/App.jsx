import { useEffect, useState } from 'react'

export default function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(setHealth)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">DayPilot AI</h1>
        {error && <p className="text-red-600">Backend error: {error}</p>}
        {!health && !error && <p>Checking backend...</p>}
        {health && (
          <ul className="space-y-1">
            <li>API: <b>{health.status}</b></li>
            <li>Database: <b>{health.database}</b></li>
          </ul>
        )}
      </div>
    </main>
  )
}