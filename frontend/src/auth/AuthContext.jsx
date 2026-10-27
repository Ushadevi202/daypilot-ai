import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, ask the server whether we already have a valid session
  useEffect(() => {
    api('/api/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const loggedIn = await api('/api/auth/login', { method: 'POST', body: { email, password } })
    setUser(loggedIn)
    return loggedIn
  }

  async function register(email, password, timezone) {
    return api('/api/auth/register', { method: 'POST', body: { email, password, timezone } })
  }

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

    async function updateTimezone(timezone) {
    const updated = await api('/api/settings', { method: 'PUT', body: { timezone } })
    setUser(updated)
    return updated
  }

  return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateTimezone }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}