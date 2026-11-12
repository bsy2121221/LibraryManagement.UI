import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Link,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Navigate, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getErrorMessage, getFieldErrors } from '../utils/errors'

const EMPTY_FORM = { fullName: '', mobile: '', password: '', confirmPassword: '', gender: '', address: '', email: '' }

// Same rules as RegisterRequest in the API, so most mistakes are caught before submitting
function validate(form) {
  const errors = {}
  if (form.fullName.trim().length < 2) errors.fullName = 'Enter your full name.'
  if (!/^[6-9]\d{9}$/.test(form.mobile)) errors.mobile = 'Enter a valid 10 digit mobile number.'
  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.'
  if (!form.gender) errors.gender = 'Select your gender. It decides which section you can book.'
  if (form.address.trim().length < 5) errors.address = 'Enter your address.'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address.'
  return errors
}

export default function RegisterPage() {
  const { register, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoggedIn) {
    return <Navigate to={from || '/seats'} replace />
  }

  const setField = (field) => (event) => {
    let value = event.target.value
    if (field === 'mobile') value = value.replace(/\D/g, '').slice(0, 10)
    setForm((f) => ({ ...f, [field]: value }))
    setFieldErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const errors = validate(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setBusy(true)
    setError('')
    try {
      const { confirmPassword: _, ...body } = form
      await register({ ...body, email: body.email || null })
      navigate(from || '/seats', { replace: true })
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const fieldProps = (field) => ({
    value: form[field],
    onChange: setField(field),
    error: !!fieldErrors[field],
    helperText: fieldErrors[field],
  })

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Register
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Create your student account to book a seat.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Full name" autoComplete="name" required autoFocus {...fieldProps('fullName')} />
            <TextField
              label="Mobile number"
              autoComplete="tel"
              required
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              {...fieldProps('mobile')}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Password" type="password" autoComplete="new-password" required fullWidth {...fieldProps('password')} />
              <TextField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                required
                fullWidth
                {...fieldProps('confirmPassword')}
              />
            </Stack>

            <FormControl error={!!fieldErrors.gender} required>
              <FormLabel>Gender</FormLabel>
              <RadioGroup row value={form.gender} onChange={setField('gender')}>
                <FormControlLabel value="Male" control={<Radio />} label="Male" />
                <FormControlLabel value="Female" control={<Radio />} label="Female" />
              </RadioGroup>
              {fieldErrors.gender && <FormHelperText>{fieldErrors.gender}</FormHelperText>}
            </FormControl>

            <TextField label="Address" multiline minRows={2} autoComplete="street-address" required {...fieldProps('address')} />
            <TextField label="Email (optional)" type="email" autoComplete="email" {...fieldProps('email')} />

            <Button type="submit" variant="contained" size="large" disabled={busy}>
              {busy ? 'Creating account…' : 'Register'}
            </Button>
            <Typography variant="body2" align="center">
              Already registered?{' '}
              <Link component={RouterLink} to="/login" state={location.state}>
                Log in
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}
