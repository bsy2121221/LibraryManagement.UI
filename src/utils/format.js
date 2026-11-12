// "2026-11-12" (a DateOnly from the API) -> "12 Nov 2026". Parsed by parts so the timezone cannot shift the day.
export function formatDate(value) {
  if (!value) return '—'
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// An ISO date-time from the API (UTC, ends with Z) shown in the browser's local time
export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function formatMoney(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount ?? 0)
}

// 425 -> "7:05"
export function formatCountdown(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const sectionLabel = (gender) => (gender === 'Female' ? 'Girls' : 'Boys')
