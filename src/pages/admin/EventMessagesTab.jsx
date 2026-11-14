import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Save from '@mui/icons-material/Save'
import { useEffect, useState } from 'react'
import { notificationsApi } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/errors'
import { CHANNEL_LABELS } from '../../utils/format'

// For each event (seat booked, seat moved, details changed...): which channels send a message, and its text
export default function EventMessagesTab() {
  const [events, setEvents] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    notificationsApi
      .events()
      .then(setEvents)
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  if (!events) {
    return error ? (
      <Alert severity="error">{error}</Alert>
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={1}>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        When one of these happens, a message is queued for the student on every channel that is switched on, and sent within a minute.
      </Typography>
      {events.map((event) => (
        <EventEditor key={event.eventType} event={event} onSaved={(saved) => setEvents((list) => list.map((e) => (e.eventType === saved.eventType ? saved : e)))} />
      ))}
    </Stack>
  )
}

function EventEditor({ event, onSaved }) {
  const [channels, setChannels] = useState(event.channels)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  const isDirty = JSON.stringify(channels) !== JSON.stringify(event.channels)
  const activeLabels = event.channels.filter((c) => c.isActive).map((c) => CHANNEL_LABELS[c.channel])

  const update = (channel, changes) => setChannels((list) => list.map((c) => (c.channel === channel ? { ...c, ...changes } : c)))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const saved = await notificationsApi.saveEvent(event.eventType, channels)
      setChannels(saved.channels)
      onSaved(saved)
      setToast('Saved')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Accordion variant="outlined" disableGutters>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 600 }}>{event.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {event.description}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mr: 1, flexWrap: 'wrap' }}>
          {activeLabels.length ? (
            activeLabels.map((label) => <Chip key={label} size="small" label={label} color="primary" variant="outlined" />)
          ) : (
            <Chip size="small" label="No messages" />
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Placeholders you can use:
            </Typography>{' '}
            {event.placeholders.map((p) => (
              <Chip key={p} size="small" label={`{${p}}`} sx={{ mr: 0.5, mb: 0.5, fontFamily: 'monospace' }} />
            ))}
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          {channels.map((c) => (
            <ChannelMessageEditor key={c.channel} value={c} onChange={(changes) => update(c.channel, changes)} />
          ))}
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button onClick={() => setChannels(event.channels)} disabled={!isDirty || saving}>
              Discard
            </Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={!isDirty || saving}>
              Save
            </Button>
          </Stack>
        </Stack>
      </AccordionDetails>
      <Snackbar open={!!toast} autoHideDuration={2000} onClose={() => setToast('')} message={toast} />
    </Accordion>
  )
}

// One channel's on/off switch and message text. Shared with the reminder rule dialog.
export function ChannelMessageEditor({ value, onChange, switchLabel }) {
  const isEmail = value.channel === 'Email'
  const isCall = value.channel === 'Call'

  return (
    <Paper variant="outlined" sx={{ p: 2, opacity: value.isActive ? 1 : 0.75 }}>
      <FormControlLabel
        control={<Switch checked={value.isActive} onChange={(e) => onChange({ isActive: e.target.checked })} />}
        label={<b>{switchLabel ?? CHANNEL_LABELS[value.channel]}</b>}
      />
      {value.isActive && (
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          {isEmail && (
            <TextField label="Subject" size="small" value={value.subject ?? ''} onChange={(e) => onChange({ subject: e.target.value })} required />
          )}
          <TextField
            label={isCall ? 'Text read out on the call' : 'Message'}
            multiline
            minRows={isEmail ? 4 : 2}
            value={value.body ?? ''}
            onChange={(e) => onChange({ body: e.target.value })}
            helperText={
              isEmail
                ? 'HTML allowed, e.g. <br/> for a new line, <b>bold</b>.'
                : value.channel === 'Sms'
                  ? `${(value.body ?? '').length} characters (160 = 1 SMS). In India the text must match your DLT-approved template.`
                  : isCall
                    ? 'Keep it short; it is read aloud by a computer voice.'
                    : 'Use *text* for bold on WhatsApp.'
            }
          />
        </Stack>
      )}
    </Paper>
  )
}
