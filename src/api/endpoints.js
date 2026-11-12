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
}

export const adminSettingsApi = {
  getAll: () => api.get('/admin/settings').then((r) => r.data),
  // values: { MonthlyFee: '1200', ... } - only the changed ones
  update: (values) => api.put('/admin/settings', { values }).then((r) => r.data),
}
