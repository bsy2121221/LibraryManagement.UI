import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/endpoints'
import { clearSession, loadSession, saveSession } from './tokenStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession)

  // Stay in sync when tokens are refreshed or cleared by the API client (or in another tab)
  useEffect(() => {
    const sync = () => setSession(loadSession())
    window.addEventListener('session-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('session-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const login = useCallback(async (mobile, password) => {
    const data = await authApi.login({ mobile, password })
    saveSession(data)
    return data.user
  }, [])

  const register = useCallback(async (form) => {
    const data = await authApi.register(form)
    saveSession(data)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    const current = loadSession()
    try {
      if (current?.refreshToken) await authApi.logout(current.refreshToken)
    } catch {
      // The session is cleared locally either way
    }
    clearSession()
  }, [])

  const value = useMemo(() => {
    const user = session?.user ?? null
    return {
      user,
      isLoggedIn: !!user,
      isAdmin: user?.role === 'Admin',
      login,
      register,
      logout,
    }
  }, [session, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
