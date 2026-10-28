import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tasks', label: 'Tasks' },
  { to: '/routines', label: 'Routines' },
  { to: '/settings', label: 'Settings' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const sideClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-brand text-white' : 'text-slate-200 hover:bg-white/10'}`
  const tabClass = ({ isActive }) =>
    `flex-1 py-3 text-center text-xs ${isActive ? 'font-semibold text-brand' : 'text-slate-600'}`

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="hidden bg-navy p-4 text-white md:flex md:w-56 md:flex-col">
        <div className="px-3 pb-4 text-lg font-bold">DayPilot AI</div>
        <nav aria-label="Main" className="space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={sideClass}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="mt-auto break-all px-3 pt-6 text-xs text-slate-300">
          {user.email}
          <button onClick={handleLogout} className="mt-2 block rounded bg-white/10 px-3 py-2 text-sm text-white">
            Log out
          </button>
        </div>
      </aside>

      <header className="flex items-center justify-between bg-navy px-4 py-3 text-white md:hidden">
        <span className="font-bold">DayPilot AI</span>
        <button onClick={handleLogout} className="text-sm underline">Log out</button>
      </header>

      <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8">
        <Outlet />
      </main>

      <nav aria-label="Main mobile" className="fixed inset-x-0 bottom-0 flex border-t border-slate-200 bg-white md:hidden">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={tabClass}>{l.label}</NavLink>
        ))}
      </nav>
    </div>
  )
}