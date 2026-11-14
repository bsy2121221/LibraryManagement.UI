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
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import { useCallback, useEffect, useState } from 'react'
import { notificationsApi } from '../../api/endpoints'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'
import { CHANNEL_LABELS } from '../../utils/format'
import { ChannelMessageEditor } from './EventMessagesTab'

const CHANNELS = ['Sms', 'WhatsApp', 'Email', 'Call']
const PLACEHOLDERS = ['Name', 'LibraryName', 'Amount', 'DueDate', 'PeriodStart', 'PeriodEnd', 'DaysOverdue', 'Seat', 'Section']

const REPEAT_OPTIONS = [
  { value: '', label: 'Send once' },
  { value: '60', label: 'Every hour' },
  { value: '180', label: 'Every 3 hours' },
  { value: '360', label: 'Every 6 hours' },
  { value: '720', label: 'Every 12 hours' },
  { value: '1440', label: 'Every day' },
  { value: '2880', label: 'Every 2 days' },
  { value: '10080', label: 'Every week' },
]

const DEFAULT_TEXT = {
  Sms: 'Dear {Name}, your {LibraryName} fee of Rs.{Amount} is due on {DueDate}.',
  WhatsApp: 'Hello {Name}, your {LibraryName} fee of Rs.{Amount} is due on {DueDate}.',
  Email: 'Dear {Name},<br/><br/>Your fee of Rs.{Amount} for seat {Seat} is due on {DueDate}.<br/><br/>Regards,<br/>{LibraryName}',
  Call: 'Hello {Name}. This is {LibraryName}. Your fee of {Amount} rupees is due. Please pay soon.',
}

// Plain-language summary of a rule, e.g. "3 days before the due date, every day up to 5 times, not 21:00–09:00"
function describe(rule) {
  const when =
    rule.trigger === 'BeforeDue'
      ? `${rule.offsetDays} day${rule.offsetDays === 1 ? '' : 's'} before the due date`
      : rule.trigger === 'OnDue'
        ? rule.offsetDays
          ? `${rule.offsetDays} day${rule.offsetDays === 1 ? '' : 's'} after the due date (while not overdue)`
          : 'on the due date'
        : rule.offsetDays
          ? `${rule.offsetDays} day${rule.offsetDays === 1 ? '' : 's'} after the fee becomes overdue`
          : 'as soon as the fee is overdue'
  const repeat = rule.repeatEveryMinutes
    ? `, then ${(REPEAT_OPTIONS.find((o) => o.value === String(rule.repeatEveryMinutes))?.label ?? `every ${rule.repeatEveryMinutes} minutes`).toLowerCase()} up to ${rule.maxAttempts} times`
    : ', once'
  const quiet = rule.quietHoursStart ? ` · not between ${rule.quietHoursStart} and ${rule.quietHoursEnd}` : ''
  return `Starts ${when}${repeat}${quiet}. Stops when the fee is paid.`
}

export default function ReminderRulesTab() {
  const [rules, setRules] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [editing, setEditing] = useState(undefined) // undefined closed, null new, object edit
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    try {
      setRules(await notificationsApi.rules())
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    try {
      await notificationsApi.deleteRule(deleting.id)
      setToast('Rule deleted')
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeleting(null)
    }
  }

  if (!rules) {
    return error ? (
      <Alert severity="error">{error}</Alert>
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography color="text.secondary">
          Reminders for unpaid monthly fees. Checked every minute; grace days are set on the Settings page.
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setEditing(null)}>
          Add rule
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {rules.length === 0 && <Alert severity="info">No reminder rules. Students will not be reminded about fees.</Alert>}

      <Stack spacing={1.5}>
        {rules.map((rule) => (
          <Paper key={rule.id} variant="outlined" sx={{ p: 2, opacity: rule.isActive ? 1 : 0.6 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 600 }}>{rule.name}</Typography>
                  {!rule.isActive && <Chip size="small" label="Off" />}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {describe(rule)}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                  {rule.channels.map((c) => (
                    <Chip key={c.channel} size="small" variant="outlined" color="primary" label={CHANNEL_LABELS[c.channel]} />
                  ))}
                </Stack>
              </Box>
              <Tooltip title="Edit">
                <IconButton onClick={() => setEditing(rule)}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton color="error" onClick={() => setDeleting(rule)}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {editing !== undefined && (
        <RuleDialog
          key={editing?.id ?? 'new'}
          rule={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined)
            setToast('Rule saved')
            load()
          }}
        />
      )}

      <Dialog open={!!deleting} onClose={() => setDeleting(null)}>
        <DialogTitle>Delete “{deleting?.name}”?</DialogTitle>
        <DialogContent>
          <DialogContentText>Messages it already sent stay in the message log. To pause it instead, switch it off.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast('')} message={toast} />
    </>
  )
}

function RuleDialog({ rule, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    name: rule?.name ?? '',
    trigger: rule?.trigger ?? 'BeforeDue',
    offsetDays: rule?.offsetDays ?? 3,
    repeatEveryMinutes: rule?.repeatEveryMinutes ? String(rule.repeatEveryMinutes) : '',
    maxAttempts: rule?.maxAttempts ?? 3,
    useQuietHours: !!rule?.quietHoursStart,
    quietHoursStart: rule?.quietHoursStart ?? '21:00',
    quietHoursEnd: rule?.quietHoursEnd ?? '09:00',
    isActive: rule?.isActive ?? true,
  }))
  const [channels, setChannels] = useState(() =>
    CHANNELS.map((channel) => {
      const existing = rule?.channels.find((c) => c.channel === channel)
      return existing
        ? { channel, isActive: true, subject: existing.subject ?? '', body: existing.body }
        : { channel, isActive: !rule && channel === 'Sms', subject: channel === 'Email' ? '{LibraryName}: Fee due on {DueDate}' : '', body: DEFAULT_TEXT[channel] }
    }),
  )
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSave = async () => {
    setBusy(true)
    setError('')
    const body = {
      name: form.name.trim(),
      trigger: form.trigger,
      offsetDays: Number(form.offsetDays) || 0,
      repeatEveryMinutes: form.repeatEveryMinutes ? Number(form.repeatEveryMinutes) : null,
      maxAttempts: form.repeatEveryMinutes ? Number(form.maxAttempts) || 1 : 1,
      quietHoursStart: form.useQuietHours ? form.quietHoursStart : null,
      quietHoursEnd: form.useQuietHours ? form.quietHoursEnd : null,
      isActive: form.isActive,
      channels: channels.filter((c) => c.isActive).map((c) => ({ channel: c.channel, subject: c.subject || null, body: c.body })),
    }
    try {
      if (rule) await notificationsApi.updateRule(rule.id, body)
      else await notificationsApi.createRule(body)
      onSaved()
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const offsetLabel =
    form.trigger === 'BeforeDue' ? 'Days before the due date' : form.trigger === 'OnDue' ? 'Days after the due date' : 'Days after it becomes overdue'

  return (
    <Dialog open onClose={() => !busy && onClose()} fullWidth maxWidth="md">
      <DialogTitle>{rule ? 'Edit reminder rule' : 'New reminder rule'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" value={form.name} onChange={set('name')} required autoFocus error={!!fieldErrors.name} helperText={fieldErrors.name} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="When" value={form.trigger} onChange={set('trigger')} sx={{ minWidth: 220 }}>
              <MenuItem value="BeforeDue">Before the due date</MenuItem>
              <MenuItem value="OnDue">On / after the due date</MenuItem>
              <MenuItem value="Overdue">When overdue</MenuItem>
            </TextField>
            <TextField label={offsetLabel} type="number" value={form.offsetDays} onChange={set('offsetDays')} slotProps={{ htmlInput: { min: 0, max: 60 } }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Repeat" value={form.repeatEveryMinutes} onChange={set('repeatEveryMinutes')} sx={{ minWidth: 220 }}>
              {REPEAT_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            {form.repeatEveryMinutes && (
              <TextField
                label="At most (times per channel)"
                type="number"
                value={form.maxAttempts}
                onChange={set('maxAttempts')}
                slotProps={{ htmlInput: { min: 1, max: 50 } }}
              />
            )}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
            <FormControlLabel control={<Switch checked={form.useQuietHours} onChange={set('useQuietHours')} />} label="Quiet hours (India time)" />
            {form.useQuietHours && (
              <>
                <TextField label="From" type="time" size="small" value={form.quietHoursStart} onChange={set('quietHoursStart')} />
                <TextField label="Until" type="time" size="small" value={form.quietHoursEnd} onChange={set('quietHoursEnd')} />
              </>
            )}
          </Stack>
          <FormControlLabel control={<Switch checked={form.isActive} onChange={set('isActive')} />} label="Rule is on" />

          <Box>
            <Typography variant="subtitle2">Send on</Typography>
            <Typography variant="caption" color="text.secondary">
              Placeholders:{' '}
              {PLACEHOLDERS.map((p) => (
                <code key={p} style={{ marginRight: 6 }}>{`{${p}}`}</code>
              ))}
            </Typography>
          </Box>
          {channels.map((c) => (
            <ChannelMessageEditor
              key={c.channel}
              value={c}
              onChange={(changes) => setChannels((list) => list.map((x) => (x.channel === c.channel ? { ...x, ...changes } : x)))}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={busy || !form.name.trim() || !channels.some((c) => c.isActive)}>
          {busy ? 'Saving…' : 'Save rule'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
