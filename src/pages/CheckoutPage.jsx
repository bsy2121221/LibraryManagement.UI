import { Alert, Box, Button, CircularProgress, Container, Divider, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import Timer from '@mui/icons-material/Timer'
import { useEffect, useState } from 'react'
import { Navigate, Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { bookingsApi, settingsApi } from '../api/endpoints'
import PayButton from '../components/PayButton'
import { getErrorMessage } from '../utils/errors'
import { formatCountdown, formatMoney } from '../utils/format'

// Seat is held: show the countdown and let the student pay (Mock dialog or Razorpay Checkout).
export default function CheckoutPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(undefined) // undefined = loading, null = no hold
  const [settings, setSettings] = useState(null)
  const [deadline, setDeadline] = useState(null) // browser time when the hold ends
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(1)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')
  const [seatLost, setSeatLost] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([bookingsApi.me(), settingsApi.getPublic()])
      .then(([current, publicSettings]) => {
        if (cancelled) return
        setSettings(publicSettings)
        const matches = current && String(current.id) === bookingId
        setBooking(matches ? current : null)
        if (matches && current.status === 'Held') {
          // Use the server's "seconds remaining" so a wrong PC clock does not break the countdown
          setDeadline(Date.now() + current.holdSecondsRemaining * 1000)
          setSecondsLeft(current.holdSecondsRemaining)
          setTotalSeconds(publicSettings.seatHoldMinutes * 60)
        }
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
    return () => {
      cancelled = true
    }
  }, [bookingId])

  useEffect(() => {
    if (!deadline) return
    const timer = setInterval(() => setSecondsLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000))), 1000)
    return () => clearInterval(timer)
  }, [deadline])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await bookingsApi.cancelHold(booking.id)
    } catch {
      // The hold may already have ended; either way go back to the map
    }
    navigate('/seats', { replace: true })
  }

  if (booking === undefined && !error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (booking?.status === 'Active') {
    return <Navigate to="/my-seat" replace />
  }

  const expired = !booking || secondsLeft <= 0

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Complete your booking
        </Typography>

        {seatLost ? (
          <Stack spacing={2}>
            <Alert severity="error">{seatLost}</Alert>
            <Button component={RouterLink} to="/seats" variant="contained">
              Choose another seat
            </Button>
          </Stack>
        ) : expired ? (
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <Alert severity="warning">Your seat hold has ended and the seat has been released. Please select a seat again.</Alert>
            <Button component={RouterLink} to="/seats" variant="contained">
              Back to seats
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <Timer color={secondsLeft < 60 ? 'error' : 'primary'} />
                <Typography>
                  Seat held for <b style={{ fontSize: 20 }}>{formatCountdown(secondsLeft)}</b>
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (secondsLeft / totalSeconds) * 100)}
                color={secondsLeft < 60 ? 'error' : 'primary'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Divider />
            <Stack spacing={1}>
              <Row label="Seat" value={booking.seatLabel} />
              <Row label="Section" value={booking.sectionName} />
              <Row label="Monthly fee" value={settings ? formatMoney(settings.monthlyFee, settings.currency) : '…'} />
              <Row label="Pay now (first month)" value={settings ? formatMoney(settings.monthlyFee, settings.currency) : '…'} bold />
            </Stack>
            <Divider />

            {error && <Alert severity="error">{error}</Alert>}

            <PayButton
              size="large"
              disabled={cancelling}
              createOrder={() => {
                setError('')
                return bookingsApi.createPaymentOrder(booking.id)
              }}
              onPaid={(result) => navigate('/my-seat', { replace: true, state: { message: result.message } })}
              onProblem={(message, refundCase) => (refundCase ? setSeatLost(message) : setError(message))}
            >
              Pay with UPI
            </PayButton>
            <Button color="inherit" onClick={handleCancel} disabled={cancelling}>
              Cancel and release seat
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  )
}

function Row({ label, value, bold = false }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography sx={{ fontWeight: bold ? 700 : 500 }}>{value}</Typography>
    </Stack>
  )
}
