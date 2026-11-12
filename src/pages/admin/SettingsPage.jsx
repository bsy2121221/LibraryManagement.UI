import { Alert, Box, Button, CircularProgress, InputAdornment, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material'
import Save from '@mui/icons-material/Save'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminSettingsApi } from '../../api/endpoints'
import { refreshPublicSettings } from '../../hooks/usePublicSettings'
import { getErrorMessage } from '../../utils/errors'
import { formatDateTime } from '../../utils/format'

// Same checks the API does (SettingDefinitions.cs), so mistakes show before saving
function validate(setting, value) {
  const v = String(value).trim()
  const range = setting.min != null && setting.max != null ? ` between ${setting.min} and ${setting.max}` : ''
  if (setting.dataType === 'int') {
    if (!/^-?\d+$/.test(v)) return 'Enter a whole number.'
    if ((setting.min != null && +v < setting.min) || (setting.max != null && +v > setting.max)) return `Must be${range}.`
  } else if (setting.dataType === 'decimal') {
    if (!/^-?\d+(\.\d{1,2})?$/.test(v)) return 'Enter a number with at most 2 decimals.'
    if ((setting.min != null && +v < setting.min) || (setting.max != null && +v > setting.max)) return `Must be${range}.`
  } else if (setting.dataType === 'string') {
    if (setting.min != null && v.length < setting.min) return `At least ${setting.min} characters.`
    if (setting.max != null && v.length > setting.max) return `At most ${setting.max} characters.`
  }
  return null
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(null)
  const [values, setValues] = useState({})
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  const apply = useCallback((list) => {
    setSettings(list)
    setValues(Object.fromEntries(list.map((s) => [s.key, s.value])))
  }, [])

  useEffect(() => {
    adminSettingsApi
      .getAll()
      .then(apply)
      .catch((err) => setError(getErrorMessage(err)))
  }, [apply])

  const groups = useMemo(() => {
    const map = new Map()
    for (const s of settings ?? []) {
      if (!map.has(s.group)) map.set(s.group, [])
      map.get(s.group).push(s)
    }
    return [...map.entries()]
  }, [settings])

  if (!settings) {
    return error ? (
      <Alert severity="error">{error}</Alert>
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const changed = settings.filter((s) => String(values[s.key]).trim() !== s.value)
  const errors = Object.fromEntries(settings.map((s) => [s.key, validate(s, values[s.key])]))
  const hasErrors = changed.some((s) => errors[s.key])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      apply(await adminSettingsApi.update(Object.fromEntries(changed.map((s) => [s.key, String(values[s.key]).trim()]))))
      refreshPublicSettings()
      setToast('Settings saved')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Settings
          </Typography>
          <Typography color="text.secondary">Changes apply immediately. A new fee is charged from the next payment.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button onClick={() => apply(settings)} disabled={!changed.length || saving}>
            Discard
          </Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={!changed.length || hasErrors || saving}>
            {saving ? 'Saving…' : changed.length ? `Save ${changed.length} change${changed.length > 1 ? 's' : ''}` : 'Save'}
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        {groups.map(([group, items]) => (
          <Paper key={group} variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              {group}
            </Typography>
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              {items.map((s) => {
                const isNumber = s.dataType === 'int' || s.dataType === 'decimal'
                const fieldError = errors[s.key]
                return (
                  <TextField
                    key={s.key}
                    label={s.label}
                    value={values[s.key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                    type={isNumber ? 'number' : 'text'}
                    error={!!fieldError}
                    helperText={
                      fieldError ||
                      [s.description, s.updatedAt && `Last changed ${formatDateTime(s.updatedAt)}`].filter(Boolean).join(' · ')
                    }
                    slotProps={
                      s.key === 'MonthlyFee'
                        ? { input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }
                        : undefined
                    }
                  />
                )
              })}
            </Box>
          </Paper>
        ))}
      </Stack>

      <Alert severity="info" sx={{ mt: 2 }}>
        The billing & overdue settings are used by the monthly fee and reminder jobs (coming in the next step).
      </Alert>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast('')} message={toast} />
    </>
  )
}
