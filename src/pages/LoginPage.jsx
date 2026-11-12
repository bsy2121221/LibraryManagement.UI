import { Alert, Box, Button, Container, Link, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { Navigate, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getErrorMessage } from '../utils/errors'

export default function LoginPage() {
  const { login, isLoggedIn, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoggedIn) {
    return <Navigate to={from || (isAdmin ? '/admin' : '/seats')} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await login(mobile.trim(), password)
      navigate(from || (user.role === 'Admin' ? '/admin' : '/seats'), { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Log in
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {location.state?.message || 'Use your registered mobile number.'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              autoComplete="tel"
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              required
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <Button type="submit" variant="contained" size="large" disabled={busy || !mobile || !password}>
              {busy ? 'Logging in…' : 'Log in'}
            </Button>
            <Typography variant="body2" align="center">
              New student?{' '}
              <Link component={RouterLink} to="/register" state={location.state}>
                Register here
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}
