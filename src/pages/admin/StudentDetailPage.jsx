import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Key from '@mui/icons-material/Key'
import PersonRemove from '@mui/icons-material/PersonRemove'
import Save from '@mui/icons-material/Save'
import SwapHoriz from '@mui/icons-material/SwapHoriz'
import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { studentsApi } from '../../api/endpoints'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'
import { formatDate, formatDateTime, formatMoney } from '../../utils/format'
import MoveSeatDialog from './MoveSeatDialog'
import ReleaseSeatDialog from './ReleaseSeatDialog'

const PAYMENT_CHIPS = {
  Created: { label: 'Started', color: 'default' },
  Success: { label: 'Paid', color: 'success' },
  Failed: { label: 'Failed', color: 'error' },
  Refunded: { label: 'Refunded', color: 'info' },
}

const toForm = (profile) => ({
  fullName: profile.fullName,
  mobile: profile.mobile,
  email: profile.email ?? '',
  gender: profile.gender ?? '',
  address: profile.address ?? '',
  isActive: profile.isActive,
})

export default function StudentDetailPage() {
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState(0)
  const [dialog, setDialog] = useState(null) // 'move' | 'release' | 'password'

  const applyDetail = useCallback((data) => {
    setDetail(data)
    setForm(toForm(data.profile))
    setFieldErrors({})
  }, [])

  const load = useCallback(async () => {
    try {
      applyDetail(await studentsApi.get(id))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [id, applyDetail])

  useEffect(() => {
    load()
  }, [load])

  if (!detail) {
    return error ? (
      <Alert severity="error">{error}</Alert>
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const { profile, currentBooking, seatHistory, payments } = detail
  const isDirty = JSON.stringify(form) !== JSON.stringify(toForm(profile))

  const setField = (field) => (event) => {
    let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    if (field === 'mobile') value = value.replace(/\D/g, '').slice(0, 10)
    setForm((f) => ({ ...f, [field]: value }))
    setFieldErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      applyDetail(await studentsApi.update(profile.id, { ...form, email: form.email.trim() || null }))
      setToast('Student saved')
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const afterSeatChange = (message) => {
    setDialog(null)
    setToast(message)
    load()
  }

  const fieldProps = (field) => ({
    value: form[field],
    onChange: setField(field),
    error: !!fieldErrors[field],
    helperText: fieldErrors[field],
    fullWidth: true,
  })

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <IconButton component={RouterLink} to="/admin/students" aria-label="Back to students">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {profile.fullName}
        </Typography>
        {!profile.isActive && <Chip size="small" label="Deactivated" />}
        <Box sx={{ flexGrow: 1 }} />
        <Button startIcon={<Key />} onClick={() => setDialog('password')}>
          Reset password
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', lg: 'row' } }}>
        <Paper variant="outlined" sx={{ p: 3, flex: 1, width: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Details
          </Typography>
          <Stack spacing={2}>
            <TextField label="Full name" required {...fieldProps('fullName')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Mobile (login)" required {...fieldProps('mobile')} />
              <TextField label="Email" {...fieldProps('email')} />
            </Stack>
            <TextField
              select
              label="Gender"
              required
              {...fieldProps('gender')}
              helperText={fieldErrors.gender || (currentBooking ? 'Release the seat first to change gender.' : 'Decides which section they can book.')}
              disabled={!!currentBooking}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </TextField>
            <TextField label="Address" multiline minRows={2} required {...fieldProps('address')} />
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={setField('isActive')} disabled={!!currentBooking && form.isActive} />}
              label={
                form.isActive
                  ? `Account active${currentBooking ? ' (release the seat first to deactivate)' : ''}`
                  : 'Account deactivated: cannot log in'
              }
            />
            <Typography variant="caption" color="text.secondary">
              Registered {formatDateTime(profile.createdAt)}
              {profile.updatedAt && ` · last changed ${formatDateTime(profile.updatedAt)}`}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => applyDetail(detail)} disabled={!isDirty || saving}>
                Discard
              </Button>
              <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={!isDirty || saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, width: { xs: '100%', lg: 340 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Seat
          </Typography>
          {!currentBooking && <Typography color="text.secondary">No seat at the moment.</Typography>}
          {currentBooking && (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {currentBooking.seatLabel}
                </Typography>
                <Chip
                  size="small"
                  color={currentBooking.status === 'Held' ? 'warning' : 'success'}
                  label={currentBooking.status === 'Held' ? 'Held (paying)' : 'Booked'}
                />
              </Stack>
              <Typography color="text.secondary">{currentBooking.sectionName}</Typography>
              {currentBooking.status === 'Active' && (
                <>
                  <Typography variant="body2">Since {formatDate(currentBooking.startDate)}</Typography>
                  <Typography variant="body2">Next fee due {formatDate(currentBooking.nextDueDate)}</Typography>
                </>
              )}
              <Stack direction="row" spacing={1}>
                {currentBooking.status === 'Active' && (
                  <Button startIcon={<SwapHoriz />} onClick={() => setDialog('move')}>
                    Move
                  </Button>
                )}
                <Button color="error" startIcon={<PersonRemove />} onClick={() => setDialog('release')}>
                  Release
                </Button>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ mt: 2 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Seat history (${seatHistory.length})`} />
          <Tab label={`Payments (${payments.length})`} />
        </Tabs>
        <Box sx={{ p: 2, overflowX: 'auto' }}>
          {tab === 0 &&
            (seatHistory.length === 0 ? (
              <Typography color="text.secondary">No seat changes yet.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>When</TableCell>
                    <TableCell>Change</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {seatHistory.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell>{formatDateTime(h.changedAt)}</TableCell>
                      <TableCell>
                        {!h.fromSeat && <>Booked {h.toSeat}</>}
                        {h.fromSeat && !h.toSeat && <>Released {h.fromSeat}</>}
                        {h.fromSeat && h.toSeat && (
                          <>
                            Moved {h.fromSeat} → {h.toSeat}
                          </>
                        )}
                      </TableCell>
                      <TableCell>{h.reason ?? '—'}</TableCell>
                      <TableCell>{h.changedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ))}

          {tab === 1 &&
            (payments.length === 0 ? (
              <Typography color="text.secondary">No payments yet.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>When</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Gateway</TableCell>
                    <TableCell>Order / payment id</TableCell>
                    <TableCell>Note</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p) => {
                    const chip = PAYMENT_CHIPS[p.status] ?? { label: p.status, color: 'default' }
                    return (
                      <TableRow key={p.id}>
                        <TableCell>{formatDateTime(p.createdAt)}</TableCell>
                        <TableCell align="right">{formatMoney(p.amount, p.currency)}</TableCell>
                        <TableCell>
                          <Chip size="small" label={chip.label} color={chip.color} />
                        </TableCell>
                        <TableCell>{p.gateway}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {p.gatewayOrderId}
                          {p.gatewayPaymentId && <div>{p.gatewayPaymentId}</div>}
                        </TableCell>
                        <TableCell sx={{ color: p.failureReason?.includes('Refund') ? 'error.main' : undefined }}>
                          {p.failureReason ?? '—'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ))}
        </Box>
      </Paper>

      {dialog === 'move' && <MoveSeatDialog booking={currentBooking} onClose={() => setDialog(null)} onMoved={afterSeatChange} />}
      {dialog === 'release' && <ReleaseSeatDialog booking={currentBooking} onClose={() => setDialog(null)} onReleased={afterSeatChange} />}
      {dialog === 'password' && (
        <ResetPasswordDialog
          student={profile}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null)
            setToast('Password changed. The student has been logged out everywhere.')
          }}
        />
      )}

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} message={toast} />
    </>
  )
}

function ResetPasswordDialog({ student, onClose, onDone }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleReset = async () => {
    setBusy(true)
    setError('')
    try {
      await studentsApi.resetPassword(student.id, password)
      onDone()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={() => !busy && onClose()} fullWidth maxWidth="xs">
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText sx={{ mb: 2 }}>
          Set a new password for {student.fullName} ({student.mobile}) and tell it to them. They will be logged out on all devices.
        </DialogContentText>
        <TextField
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          autoFocus
          helperText="At least 8 characters"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleReset} disabled={busy || password.length < 8}>
          Set password
        </Button>
      </DialogActions>
    </Dialog>
  )
}
