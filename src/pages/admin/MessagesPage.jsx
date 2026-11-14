import { Alert, Box, Button, Chip, InputAdornment, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material'
import Refresh from '@mui/icons-material/Refresh'
import Search from '@mui/icons-material/Search'
import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { notificationsApi } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/errors'
import { CHANNEL_LABELS } from '../../utils/format'
import MessagesTable from './MessagesTable'

const REFRESH_EVERY_MS = 15_000

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'Ready', label: 'Waiting' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Failed', label: 'Failed' },
  { value: 'Skipped', label: 'Skipped' },
  { value: 'Cancelled', label: 'Cancelled' },
]

// Every SMS / WhatsApp / email / call to students. Actions only queue messages; a background job sends them every minute.
export default function MessagesPage() {
  const [summary, setSummary] = useState(null)
  const [messages, setMessages] = useState(null)
  const [status, setStatus] = useState('')
  const [channel, setChannel] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    try {
      const [s, list] = await Promise.all([notificationsApi.summary(), notificationsApi.getAll({ status, channel, search: search.trim() })])
      setSummary(s)
      setMessages(list)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [status, channel, search])

  useEffect(() => {
    const first = setTimeout(load, 300)
    const timer = setInterval(load, REFRESH_EVERY_MS)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [load])

  const act = async (action, message, done) => {
    try {
      await action(message.id)
      setToast(done)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const mockChannels = summary ? Object.entries(summary.providers).filter(([, p]) => p.toLowerCase() === 'mock') : []

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Messages
          </Typography>
          <Typography color="text.secondary">Sent automatically within a minute of each event. Refreshes every 15 seconds.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/admin/notification-settings">
            Message settings
          </Button>
          <Button startIcon={<Refresh />} onClick={load}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {summary && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
          <Chip color="info" label={`Waiting ${summary.ready + summary.processing}`} onClick={() => setStatus('Ready')} />
          <Chip color="success" label={`Sent ${summary.sent}`} onClick={() => setStatus('Sent')} />
          <Chip color="error" label={`Failed ${summary.failed}`} onClick={() => setStatus('Failed')} />
          <Chip color="warning" label={`Skipped ${summary.skipped}`} onClick={() => setStatus('Skipped')} />
          <Chip label={`Cancelled ${summary.cancelled}`} onClick={() => setStatus('Cancelled')} />
        </Stack>
      )}

      {mockChannels.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Test mode for {mockChannels.map(([c]) => CHANNEL_LABELS[c] ?? c).join(', ')}: messages are only written to the API log, not
          really sent. Set the provider in the API&apos;s appsettings.json (Notifications section) to send for real.
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search student, mobile or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
          {STATUS_FILTERS.map((f) => (
            <MenuItem key={f.value} value={f.value}>
              {f.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Channel" value={channel} onChange={(e) => setChannel(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {messages?.length === 0 && <Alert severity="info">No messages yet.</Alert>}
      {messages?.length > 0 && (
        <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
          <MessagesTable
            messages={messages}
            onRetry={(m) => act(notificationsApi.retry, m, 'Will be sent again within a minute')}
            onCancel={(m) => act(notificationsApi.cancel, m, 'Message cancelled')}
          />
        </Paper>
      )}

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast('')} message={toast} />
    </>
  )
}
