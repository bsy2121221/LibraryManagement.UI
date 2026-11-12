import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { sectionsApi } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/errors'

const DEFAULTS = { rows: 4, columns: 8, labelPrefix: '', startNumber: 1, originX: 40, originY: 40, spacingX: 60, spacingY: 60 }

// Adds a grid of seats on the server (existing seats stay). The admin can then drag them into place.
export default function GenerateSeatsDialog({ open, section, onClose, onGenerated }) {
  const [form, setForm] = useState(() => ({ ...DEFAULTS, labelPrefix: section.gender === 'Female' ? 'G' : 'B' }))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const setField = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }))
  const count = (Number(form.rows) || 0) * (Number(form.columns) || 0)

  const handleGenerate = async () => {
    setBusy(true)
    setError('')
    try {
      const body = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, key === 'labelPrefix' ? value.trim() || null : Number(value)]),
      )
      onGenerated(await sectionsApi.generateSeats(section.id, body))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const numberField = (field, label) => (
    <TextField label={label} type="number" value={form[field]} onChange={setField(field)} fullWidth size="small" />
  )

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add seats in a grid</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={2}>
            {numberField('rows', 'Rows')}
            {numberField('columns', 'Seats per row')}
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Label prefix" value={form.labelPrefix} onChange={setField('labelPrefix')} fullWidth size="small" />
            {numberField('startNumber', 'First number')}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Position (map is {section.layoutWidth} × {section.layoutHeight}; a seat is 44 units)
          </Typography>
          <Stack direction="row" spacing={2}>
            {numberField('originX', 'Start X')}
            {numberField('originY', 'Start Y')}
            {numberField('spacingX', 'Gap X')}
            {numberField('spacingY', 'Gap Y')}
          </Stack>
          <Alert severity="info">
            Adds <b>{count}</b> seats labelled {form.labelPrefix}
            {form.startNumber}, {form.labelPrefix}
            {Number(form.startNumber) + 1}… Labels already used are skipped.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleGenerate} disabled={busy || count < 1}>
          {busy ? 'Adding…' : `Add ${count} seats`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
