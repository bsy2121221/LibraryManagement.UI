import axios from 'axios'
import { clearSession, loadSession, saveSession } from '../auth/tokenStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({ baseURL })

// Attach the access token to every request
api.interceptors.request.use((config) => {
  const session = loadSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
})

// Access tokens last 15 minutes. On a 401, swap the refresh token for a new pair once and retry.
// Concurrent 401s share one refresh call, because the API rotates refresh tokens and
// treats a reused one as stolen (it would log the user out everywhere).
let refreshPromise = null

async function refreshTokens() {
  const session = loadSession()
  if (!session?.refreshToken) throw new Error('No refresh token')

  const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: session.refreshToken })
  saveSession(data)
  return data
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthCall = original?.url?.startsWith('/auth/')

    if (error.response?.status !== 401 || original?._retried || isAuthCall || !loadSession()) {
      throw error
    }

    original._retried = true
    try {
      refreshPromise ??= refreshTokens().finally(() => {
        refreshPromise = null
      })
      const session = await refreshPromise
      original.headers.Authorization = `Bearer ${session.accessToken}`
      return api(original)
    } catch {
      clearSession()
      throw error
    }
  },
)
