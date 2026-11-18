import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import Autorenew from '@mui/icons-material/Autorenew'
import { useState } from 'react'
import { studentsApi } from '../../api/endpoints'
import { FEE_START_MAX, FEE_START_MIN, formatDate, isValidFeeStartDate, todayInIndia } from '../../utils/format'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'

const EMPTY = { fullName: '', mobile: '', password: '', gender: '', address: '', email: '' }

// Easy to read out to a student: no 0/O, 1/l/I
function generatePassword() {
  const letters = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const pick = (chars, n) => Array.from(crypto.getRandomValues(new Uint32Array(n)), (x) => chars[x % chars.length]).join('')
  return `${pick(letters, 1).toUpperCase()}${pick(letters, 4)}@${pick(digits, 4)}`
}

function validate(form) {
  const e = {}
  if (form.fullName.trim().length < 2) e.fullName = 'Enter the full name.'
  if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Enter a valid 10 digit mobile number.'
  if (form.password.length < 8) e.password = 'At least 8 characters.'
  if (!form.gender) e.gender = 'Select the gender. It decides which section the seat can be in.'
  if (form.address.trim().length < 5) e.address = 'Enter the address.'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.'
  return e
}

// Admin registers a walk-in student. onCreated(detail, password, assignSeatNext, feeStartDate)
export default function AddStudentDialog({ onClose, onCreated }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, password: generatePassword() }))
  const [assignNext, setAssignNext] = useState(true)
  // When the student's fees start; existing students being moved into the system often started earlier
  const [feeStartDate, setFeeStartDate] = useState(todayInIndia())
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const setField = (field) => (event) => {
    let value = event.target.value
    if (field === 'mobile') value = value.replace(/\D/g, '').slice(0, 10)
    setForm((f) => ({ ...f, [field]: value }))
    setFieldErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSave = async () => {
    const errors = validate(form)
    if (assignNext && !isValidFeeStartDate(feeStartDate)) errors.feeStartDate = 'Must be within the last year and at most 60 days ahead.'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setBusy(true)
    setError('')
    try {
      const detail = await studentsApi.create({ ...form, email: form.email.trim() || null })
      onCreated(detail, form.password, assignNext, feeStartDate)
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const props = (field) => ({ value: form[field], onChange: setField(field), error: !!fieldErrors[field], helperText: fieldErrors[field], fullWidth: true })

  return (
    <Dialog open onClose={() => !busy && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>Add student</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Full name" required autoFocus {...props('fullName')} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Mobile (used to log in)" required slotProps={{ htmlInput: { inputMode: 'numeric' } }} {...props('mobile')} />
            <TextField label="Email (optional)" {...props('email')} />
          </Stack>
          <TextField
            label="Password"
            required
            {...props('password')}
            helperText={fieldErrors.password || 'Tell this to the student. It is never sent in a message. They can log in with it.'}
            slotProps={{
              input: {
                sx: { fontFamily: 'monospace' },
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Generate a new password">
                      <IconButton onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}>
                        <Autorenew />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl error={!!fieldErrors.gender} required>
            <FormLabel>Gender</FormLabel>
            <RadioGroup row value={form.gender} onChange={setField('gender')}>
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel value="Female" control={<Radio />} label="Female" />
            </RadioGroup>
            {fieldErrors.gender && <FormHelperText>{fieldErrors.gender}</FormHelperText>}
          </FormControl>
          <TextField label="Address" multiline minRows={2} required {...props('address')} />
          <FormControlLabel
            control={<Checkbox checked={assignNext} onChange={(e) => setAssignNext(e.target.checked)} />}
            label="Assign a seat next"
          />
          {assignNext && (
            <TextField
              label="Fee start date"
              type="date"
              value={feeStartDate}
              onChange={(e) => {
                setFeeStartDate(e.target.value)
                setFieldErrors((er) => ({ ...er, feeStartDate: undefined }))
              }}
              error={!!fieldErrors.feeStartDate}
              helperText={
                fieldErrors.feeStartDate ||
                `The first month's fee and every next due date are counted from ${feeStartDate ? formatDate(feeStartDate) : 'this date'}. Change it for students who joined earlier.`
              }
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: FEE_START_MIN(), max: FEE_START_MAX() } }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={busy}>
          {busy ? 'Saving…' : 'Add student'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
