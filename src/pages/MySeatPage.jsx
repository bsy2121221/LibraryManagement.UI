import { Alert, Box, Button, Chip, CircularProgress, Container, Divider, Paper, Stack, Typography } from '@mui/material'
import EventSeat from '@mui/icons-material/EventSeat'
import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { bookingsApi, feesApi } from '../api/endpoints'
import PayButton from '../components/PayButton'
import { getErrorMessage } from '../utils/errors'
import { FEE_STATUS_CHIPS, formatDate, formatMoney, formatPeriod } from '../utils/format'

// The student's own seat and monthly fees
export default function MySeatPage() {
  const location = useLocation()
  const [booking, setBooking] = useState(undefined)
  const [fees, setFees] = useState([])
  const [message, setMessage] = useState(location.state?.message ?? '')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [current, myFees] = await Promise.all([bookingsApi.me(), feesApi.mine()])
      setBooking(current)
      setFees(myFees)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (booking === undefined && !error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  const unpaid = fees.filter((f) => f.isPayable)

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {message && (
        <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          My seat
        </Typography>

        {!booking && (
          <Stack spacing={2}>
            <Typography color="text.secondary">You do not have a seat at the moment.</Typography>
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
            {booking.hasOverdueFee && <Alert severity="error">Your fee is overdue. Please pay now to keep your seat.</Alert>}
          </Stack>
        )}
      </Paper>

      {unpaid.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mt: 2, borderColor: unpaid.some((f) => f.status === 'Overdue') ? 'error.main' : undefined }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Fees to pay
          </Typography>
          <Stack spacing={2} divider={<Divider />}>
            {unpaid.map((fee) => (
              <Stack key={fee.id} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{formatPeriod(fee.periodStart, fee.periodEnd)}</Typography>
                  <Typography variant="body2" color={fee.status === 'Overdue' ? 'error' : 'text.secondary'}>
                    Due {formatDate(fee.dueDate)} · {FEE_STATUS_CHIPS[fee.status].label}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700 }}>{formatMoney(fee.amount)}</Typography>
                <PayButton
                  createOrder={() => {
                    setError('')
                    return feesApi.createPaymentOrder(fee.id)
                  }}
                  onPaid={(result) => {
                    setMessage(result.message)
                    load()
                  }}
                  onProblem={(text) => {
                    setError(text)
                    load()
                  }}
                >
                  Pay
                </PayButton>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

      {fees.some((f) => !f.isPayable) && (
        <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Fee history
          </Typography>
          <Stack spacing={1.5}>
            {fees
              .filter((f) => !f.isPayable)
              .map((fee) => (
                <Stack key={fee.id} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ flexGrow: 1 }}>{formatPeriod(fee.periodStart, fee.periodEnd)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {fee.status === 'Paid' ? `Paid ${formatDate(fee.paidAt)}` : ''}
                  </Typography>
                  <Typography sx={{ minWidth: 80, textAlign: 'right' }}>{formatMoney(fee.amount)}</Typography>
                  <Chip size="small" {...FEE_STATUS_CHIPS[fee.status]} />
                </Stack>
              ))}
          </Stack>
        </Paper>
      )}
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
