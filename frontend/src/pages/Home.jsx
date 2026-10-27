import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md space-y-3">
        <h1 className="text-2xl font-bold">DayPilot AI</h1>
        <p>Logged in as <b>{user.email}</b></p>
        <p className="text-sm text-slate-600">Timezone: {user.timezone}</p>
        <div className="flex gap-3 items-center">
          <Link to="/settings" className="text-blue-600 underline">Settings</Link>
          <button onClick={handleLogout} className="bg-slate-800 text-white rounded px-4 py-2">
            Log out
          </button>
        </div>
      </div>
    </main>
  )
}