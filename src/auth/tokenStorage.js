// Keeps the login session (tokens + user) in localStorage so a page refresh stays logged in.
const KEY = 'library.session'

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// session = AuthResponse from the API: { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, user }
export function saveSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('session-changed'))
}

export function clearSession() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event('session-changed'))
}
