import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { sectionsApi } from '../../api/endpoints'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'

const DEFAULTS = { name: '', gender: 'Male', layoutWidth: 1000, layoutHeight: 600, backgroundImageUrl: '', displayOrder: 0, isActive: true }

// Create or edit a section. `section` = null creates a new one.
// Mount with a `key` that changes per section so the form starts from that section's values.
export default function SectionFormDialog({ open, section, onClose, onSaved }) {
  const [form, setForm] = useState(() => (section ? { ...DEFAULTS, ...section, backgroundImageUrl: section.backgroundImageUrl ?? '' } : DEFAULTS))
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const setField = (field, parse = (v) => v) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : parse(event.target.value)
    setForm((f) => ({ ...f, [field]: value }))
    setFieldErrors((e) => ({ ...e, [field]: undefined }))
  }
  const toNumber = (v) => (v === '' ? '' : Number(v))

  const handleSave = async () => {
    setBusy(true)
    setError('')
    const body = {
      name: form.name,
      gender: form.gender,
      layoutWidth: Number(form.layoutWidth),
      layoutHeight: Number(form.layoutHeight),
      backgroundImageUrl: form.backgroundImageUrl || null,
      displayOrder: Number(form.displayOrder) || 0,
      isActive: form.isActive,
    }
    try {
      const saved = section ? await sectionsApi.update(section.id, body) : await sectionsApi.create(body)
      onSaved(saved)
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const fieldProps = (field) => ({ error: !!fieldErrors[field], helperText: fieldErrors[field] })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{section ? `Edit ${section.name}` : 'New section'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" value={form.name} onChange={setField('name')} required autoFocus placeholder="e.g. Boys Section" {...fieldProps('name')} />
          <TextField select label="For" value={form.gender} onChange={setField('gender')} {...fieldProps('gender')}>
            <MenuItem value="Male">Boys</MenuItem>
            <MenuItem value="Female">Girls</MenuItem>
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Map width"
              type="number"
              value={form.layoutWidth}
              onChange={setField('layoutWidth', toNumber)}
              fullWidth
              {...fieldProps('layoutWidth')}
              helperText={fieldErrors.layoutWidth || '200 – 5000 units'}
            />
            <TextField
              label="Map height"
              type="number"
              value={form.layoutHeight}
              onChange={setField('layoutHeight', toNumber)}
              fullWidth
              {...fieldProps('layoutHeight')}
              helperText={fieldErrors.layoutHeight || 'A seat is 44 units wide'}
            />
          </Stack>
          <TextField
            label="Background image URL (optional)"
            value={form.backgroundImageUrl}
            onChange={setField('backgroundImageUrl')}
            {...fieldProps('backgroundImageUrl')}
            helperText={fieldErrors.backgroundImageUrl || 'A floor plan picture shown behind the seats. Upload comes with the media library.'}
          />
          <TextField
            label="Display order"
            type="number"
            value={form.displayOrder}
            onChange={setField('displayOrder', toNumber)}
            {...fieldProps('displayOrder')}
            helperText={fieldErrors.displayOrder || 'Lower numbers are shown first'}
          />
          <FormControlLabel
            control={<Switch checked={form.isActive} onChange={setField('isActive')} />}
            label="Open for booking (shown on the public seat map)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={busy || !form.name.trim()}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
