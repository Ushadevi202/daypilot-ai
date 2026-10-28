import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function getZones(current) {
  let zones = []
  try {
    zones = Intl.supportedValuesOf('timeZone')
  } catch {
    zones = []
  }
  return zones.includes(current) ? zones : [current, ...zones]
}

export default function Settings() {
  const { user, updateTimezone } = useAuth()
  const [timezone, setTimezone] = useState(user.timezone)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setSaving(true)
    try {
      await updateTimezone(timezone)
      setMessage('Settings saved')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
        <main className="flex justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Settings</h1>

        {error && <p role="alert" className="text-red-700 bg-red-50 rounded p-2 text-sm">{error}</p>}
        {message && <p role="status" className="text-teal-800 bg-teal-50 rounded p-2 text-sm">{message}</p>}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" value={user.email} disabled
                 className="w-full border border-slate-200 bg-slate-100 rounded px-3 py-2" />
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium mb-1">Timezone</label>
          <select id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2">
            {getZones(user.timezone).map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={saving}
                className="w-full bg-blue-600 text-white rounded py-2 font-medium disabled:opacity-60">
          {saving ? 'Saving...' : 'Save'}
        </button>

        <Link to="/" className="block text-sm text-blue-600 underline">Back to home</Link>
      </form>
    </main>
  )
}