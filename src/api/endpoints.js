import { api } from './client'

// One function per API endpoint. Enums are sent and received as strings (e.g. "Male", "Active").

export const authApi = {
  register: (body) => api.post('/auth/register', body).then((r) => r.data),
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me').then((r) => r.data),
}

export const seatMapApi = {
  get: () => api.get('/seat-map').then((r) => r.data),
}

export const sectionsApi = {
  getAll: () => api.get('/admin/sections').then((r) => r.data),
  getLayout: (id) => api.get(`/admin/sections/${id}`).then((r) => r.data),
  create: (body) => api.post('/admin/sections', body).then((r) => r.data),
  update: (id, body) => api.put(`/admin/sections/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/admin/sections/${id}`),
  saveLayout: (id, seats) => api.put(`/admin/sections/${id}/seats`, { seats }).then((r) => r.data),
  generateSeats: (id, body) => api.post(`/admin/sections/${id}/seats/generate`, body).then((r) => r.data),
}

export const settingsApi = {
  getPublic: () => api.get('/settings/public').then((r) => r.data),
}

// Student booking flow: hold -> payment order -> checkout -> verify (or failed)
export const bookingsApi = {
  hold: (seatId) => api.post('/bookings/hold', { seatId }).then((r) => r.data),
  // Resolves to null when the student has no seat or hold (API returns 204)
  me: () => api.get('/bookings/me').then((r) => (r.status === 204 ? null : r.data)),
  cancelHold: (id) => api.delete(`/bookings/${id}/hold`),
  createPaymentOrder: (id) => api.post(`/bookings/${id}/payment-order`).then((r) => r.data),
}

export const paymentsApi = {
  verify: (body) => api.post('/payments/verify', body).then((r) => r.data),
  failed: (body) => api.post('/payments/failed', body),
}

export const adminBookingsApi = {
  // status: undefined = current (Active + Held), or 'Released' / 'Expired' / 'Active' / 'Held'
  getAll: ({ status, search } = {}) =>
    api.get('/admin/bookings', { params: { status: status || undefined, search: search || undefined } }).then((r) => r.data),
  release: (id, reason) => api.post(`/admin/bookings/${id}/release`, { reason }),
  move: (id, toSeatId, reason) => api.post(`/admin/bookings/${id}/move`, { toSeatId, reason }).then((r) => r.data),
}

export const studentsApi = {
  // isActive / hasSeat: true, false or undefined (= all)
  getAll: ({ search, isActive, hasSeat } = {}) =>
    api.get('/admin/students', { params: { search: search || undefined, isActive, hasSeat } }).then((r) => r.data),
  get: (id) => api.get(`/admin/students/${id}`).then((r) => r.data),
  update: (id, body) => api.put(`/admin/students/${id}`, body).then((r) => r.data),
  resetPassword: (id, newPassword) => api.post(`/admin/students/${id}/reset-password`, { newPassword }),
  // Walk-in student registered by the admin (returns the student detail)
  create: (body) => api.post('/admin/students', body).then((r) => r.data),
  // body: { seatId, startDate?, amount?, paidAtDesk, note? }
  assignSeat: (id, body) => api.post(`/admin/students/${id}/assign-seat`, body).then((r) => r.data),
}

export const adminSettingsApi = {
  getAll: () => api.get('/admin/settings').then((r) => r.data),
  // values: { MonthlyFee: '1200', ... } - only the changed ones
  update: (values) => api.put('/admin/settings', { values }).then((r) => r.data),
}

// Student monthly fees (pay = createPaymentOrder, then the same checkout + /payments/verify as booking)
export const feesApi = {
  mine: () => api.get('/fees/me').then((r) => r.data),
  createPaymentOrder: (id) => api.post(`/fees/${id}/payment-order`).then((r) => r.data),
}

export const adminFeesApi = {
  // status: undefined = unpaid (Due + Overdue), or 'Due' / 'Overdue' / 'Paid' / 'Cancelled'
  getAll: ({ status, search } = {}) =>
    api.get('/admin/fees', { params: { status: status || undefined, search: search || undefined } }).then((r) => r.data),
  markPaid: (id, note) => api.post(`/admin/fees/${id}/mark-paid`, { note: note || null }).then((r) => r.data),
  // body: { studentId, periodStart, periodEnd?, amount?, dueDate?, paidAtDesk, note? }
  create: (body) => api.post('/admin/fees', body).then((r) => r.data),
}

// Messages to students (queued, sent by the background job every minute)
export const notificationsApi = {
  getAll: ({ status, channel, eventType, studentId, search } = {}) =>
    api
      .get('/admin/notifications', {
        params: { status: status || undefined, channel: channel || undefined, eventType: eventType || undefined, studentId, search: search || undefined },
      })
      .then((r) => r.data),
  summary: () => api.get('/admin/notifications/summary').then((r) => r.data),
  retry: (id) => api.post(`/admin/notifications/${id}/retry`),
  cancel: (id) => api.post(`/admin/notifications/${id}/cancel`),
  events: () => api.get('/admin/notifications/events').then((r) => r.data),
  saveEvent: (eventType, channels) => api.put(`/admin/notifications/events/${eventType}`, { channels }).then((r) => r.data),
  rules: () => api.get('/admin/notifications/rules').then((r) => r.data),
  createRule: (body) => api.post('/admin/notifications/rules', body).then((r) => r.data),
  updateRule: (id, body) => api.put(`/admin/notifications/rules/${id}`, body).then((r) => r.data),
  deleteRule: (id) => api.delete(`/admin/notifications/rules/${id}`),
}

// Home page designed in the admin builder. Resolves to null when nothing is published (API returns 204).
export const homePageApi = {
  get: () => api.get('/home-page').then((r) => (r.status === 204 ? null : r.data)),
}

export const adminHomePageApi = {
  // { latest: version | null, liveVersion }
  get: () => api.get('/admin/home-page').then((r) => r.data),
  // Every save is a new version; publish = true also makes it live
  save: (layout, publish) => api.post('/admin/home-page', { layout, publish }).then((r) => r.data),
  versions: () => api.get('/admin/home-page/versions').then((r) => r.data),
  version: (id) => api.get(`/admin/home-page/versions/${id}`).then((r) => r.data),
  publish: (id) => api.post(`/admin/home-page/versions/${id}/publish`).then((r) => r.data),
}

// Uploaded images (JPG, PNG, WEBP, GIF)
export const mediaApi = {
  getAll: () => api.get('/admin/media').then((r) => r.data),
  upload: (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post('/admin/media', form, {
        onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
      })
      .then((r) => r.data)
  },
  remove: (id) => api.delete(`/admin/media/${id}`),
}
