import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Register() {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      await register(email, password, timezone)
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.errors ? Object.values(err.errors).join('. ') : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Create your account</h1>

        {error && (
          <p role="alert" className="text-red-700 bg-red-50 rounded p-2 text-sm">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password (min 8 characters)</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium mb-1">Confirm password</label>
          <input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white rounded py-2 font-medium disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Register'}
        </button>

        <p className="text-sm text-slate-600">
          Already registered? <Link to="/login" className="text-blue-600 underline">Log in</Link>
        </p>
      </form>
    </main>
  )
}