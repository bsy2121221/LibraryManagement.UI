// "2026-11-12" (a DateOnly from the API) -> "12 Nov 2026". Parsed by parts so the timezone cannot shift the day.
// A full date-time (UTC, "...T...Z") is shown as the local date instead.
export function formatDate(value) {
  if (!value) return '—'
  const options = { day: 'numeric', month: 'short', year: 'numeric' }
  if (String(value).includes('T')) return new Date(value).toLocaleDateString('en-IN', options)
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', options)
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

export const CHANNEL_LABELS = { Sms: 'SMS', WhatsApp: 'WhatsApp', Email: 'Email', Call: 'Phone call' }

export const FEE_STATUS_CHIPS = {
  Due: { label: 'Due', color: 'warning' },
  Overdue: { label: 'Overdue', color: 'error' },
  Paid: { label: 'Paid', color: 'success' },
  Cancelled: { label: 'Cancelled', color: 'default' },
}

export const MESSAGE_STATUS_CHIPS = {
  Ready: { label: 'Waiting', color: 'info' },
  Processing: { label: 'Sending', color: 'info' },
  Sent: { label: 'Sent', color: 'success' },
  Failed: { label: 'Failed', color: 'error' },
  Skipped: { label: 'Skipped', color: 'warning' },
  Cancelled: { label: 'Cancelled', color: 'default' },
}

// "2026-11-15" -> "15 Nov – 14 Dec 2026"
export function formatPeriod(start, end) {
  return `${formatDate(start).replace(/ \d{4}$/, '')} – ${formatDate(end)}`
}

// Today in the library's time zone, as "YYYY-MM-DD"
export function todayInIndia() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

const pad = (n) => String(n).padStart(2, '0')
const toIso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// Same as SQL Server DATEADD(MONTH): 31 Jan + 1 month = 28 Feb (the API computes fee periods this way)
export function addMonths(iso, months) {
  const [y, m, d] = iso.split('-').map(Number)
  const lastDay = new Date(y, m - 1 + months + 1, 0).getDate()
  return toIso(new Date(y, m - 1 + months, Math.min(d, lastDay)))
}

export function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  return toIso(new Date(y, m - 1, d + days))
}
