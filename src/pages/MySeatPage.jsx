import { Alert, Box, Button, Chip, CircularProgress, Container, Divider, Paper, Stack, Typography } from '@mui/material'
import EventSeat from '@mui/icons-material/EventSeat'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { bookingsApi } from '../api/endpoints'
import { getErrorMessage } from '../utils/errors'
import { formatDate } from '../utils/format'

// The student's own seat. Fee history and pay-next-month come with the fees step.
export default function MySeatPage() {
  const location = useLocation()
  const [booking, setBooking] = useState(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    bookingsApi
      .me()
      .then(setBooking)
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  if (booking === undefined && !error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {location.state?.message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {location.state.message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          My seat
        </Typography>

        {!booking && (
          <Stack spacing={2}>
            <Typography color="text.secondary">You have not booked a seat yet.</Typography>
            <Button component={RouterLink} to="/seats" variant="contained">
              Book a seat
            </Button>
          </Stack>
        )}

        {booking?.status === 'Held' && (
          <Stack spacing={2}>
            <Alert severity="warning">
              Seat <b>{booking.seatLabel}</b> is held for you but not paid yet.
            </Alert>
            <Button component={RouterLink} to={`/checkout/${booking.id}`} variant="contained">
              Complete payment
            </Button>
          </Stack>
        )}

        {booking?.status === 'Active' && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ bgcolor: '#1565c0', color: '#fff', borderRadius: 2, p: 1.5, display: 'flex' }}>
                <EventSeat fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
                  {booking.seatLabel}
                </Typography>
                <Typography color="text.secondary">{booking.sectionName}</Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Chip color="success" label="Booked" />
            </Stack>
            <Divider />
            <Row label="Member since" value={formatDate(booking.startDate)} />
            <Row label="Next fee due" value={formatDate(booking.nextDueDate)} />
          </Stack>
        )}
      </Paper>
    </Container>
  )
}

function Row({ label, value }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Stack>
  )
}
