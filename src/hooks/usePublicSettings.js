import { useEffect, useSyncExternalStore } from 'react'
import { settingsApi } from '../api/endpoints'

// Library name, monthly fee and hold time, loaded once and shared by every component.
// refreshPublicSettings() reloads them (the admin Settings page calls it after saving).
const DEFAULTS = { libraryName: 'My Library', monthlyFee: null, seatHoldMinutes: 7, currency: 'INR' }

let current = DEFAULTS
let loaded = false
let request = null
const listeners = new Set()

function emit() {
  for (const listener of listeners) listener()
}

export function refreshPublicSettings() {
  request = settingsApi
    .getPublic()
    .then((data) => {
      current = { ...DEFAULTS, ...data }
      loaded = true
      emit()
    })
    .catch(() => {
      // Keep the defaults; the next call retries
    })
    .finally(() => {
      request = null
    })
  return request
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePublicSettings() {
  useEffect(() => {
    if (!loaded && !request) refreshPublicSettings()
  }, [])
  return useSyncExternalStore(subscribe, () => current)
}
