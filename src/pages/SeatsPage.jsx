import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import Refresh from '@mui/icons-material/Refresh'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { bookingsApi, seatMapApi } from '../api/endpoints'
import { useAuth } from '../auth/AuthContext'
import { usePublicSettings } from '../hooks/usePublicSettings'
import SeatBox, { SeatLegend } from '../components/seats/SeatBox'
import SeatCanvas from '../components/seats/SeatCanvas'
import { seatBoxStyle } from '../components/seats/seatGeometry'
import { getErrorMessage } from '../utils/errors'
import { formatMoney, sectionLabel } from '../utils/format'

const REFRESH_EVERY_MS = 20_000

function seatColor(seat) {
  if (seat.isMine) return 'mine'
  if (seat.availability === 'Disabled') return 'disabled'
  if (seat.availability === 'Occupied') return 'occupied'
  return 'available'
}

// Public seat map: green seats can be booked, red are taken.
export default function SeatsPage() {
  const { user, isLoggedIn, isAdmin } = useAuth()
  const isStudent = isLoggedIn && !isAdmin
  const navigate = useNavigate()
  const location = useLocation()

  const [map, setMap] = useState(null)
  const publicSettings = usePublicSettings()
  const settings = publicSettings.monthlyFee ? publicSettings : null
  const [myBooking, setMyBooking] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState(0)
  const [selected, setSelected] = useState(null)
  const [notice, setNotice] = useState('')
  const [holding, setHolding] = useState(false)

  const load = useCallback(async () => {
    try {
      const [seatMap, booking] = await Promise.all([seatMapApi.get(), isStudent ? bookingsApi.me() : Promise.resolve(null)])
      setMap(seatMap)
      setMyBooking(booking)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [isStudent])

  // Reload regularly so seats taken by others turn red without a page refresh
  useEffect(() => {
    load()
    const timer = setInterval(load, REFRESH_EVERY_MS)
    return () => clearInterval(timer)
  }, [load])

  // Open the student's own section first (only on the first load, so auto-refresh keeps the chosen tab)
  const pickedInitialTab = useRef(false)
  useEffect(() => {
    if (!map || pickedInitialTab.current) return
    pickedInitialTab.current = true
    const index = user?.gender ? map.sections.findIndex((s) => s.gender === user.gender) : -1
    if (index >= 0) setTab(index)
  }, [map, user?.gender])

  const sections = map?.sections ?? []
  const section = sections[Math.min(tab, sections.length - 1)]
  const hasActiveSeat = myBooking?.status === 'Active'
  const heldBooking = myBooking?.status === 'Held' ? myBooking : null

  const handleSeatClick = (seat) => {
    if (seat.availability !== 'Available') return

    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname, message: 'Log in or register to book a seat.' } })
      return
    }
    if (isAdmin) {
      setNotice('Admins cannot book seats. Log in with a student account to test booking.')
      return
    }
    if (user.gender && section.gender !== user.gender) {
      setNotice(`This seat is in the ${sectionLabel(section.gender)} section. Please choose a seat in the ${sectionLabel(user.gender)} section.`)
      return
    }
    if (hasActiveSeat) {
      setNotice(`You already have seat ${myBooking.seatLabel} in ${myBooking.sectionName}. Ask the library if you want to change it.`)
      return
    }
    setSelected(seat)
  }

  const handleHold = async () => {
    setHolding(true)
    try {
      const booking = await bookingsApi.hold(selected.id)
      navigate(`/checkout/${booking.id}`)
    } catch (err) {
      setSelected(null)
      setNotice(getErrorMessage(err))
      load()
    } finally {
      setHolding(false)
    }
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Available seats
          </Typography>
          <Typography color="text.secondary">
            Click a green seat to book it{settings ? ` · ${formatMoney(settings.monthlyFee, settings.currency)} per month` : ''}.
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} onClick={load} sx={{ alignSelf: { sm: 'center' } }}>
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="info" onClose={() => setNotice('')} sx={{ mb: 2 }}>
          {notice}
        </Alert>
      )}
      {hasActiveSeat && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          action={
            <Button component={RouterLink} to="/my-seat" color="inherit" size="small">
              View
            </Button>
          }
        >
          Your seat: <b>{myBooking.seatLabel}</b> in {myBooking.sectionName}
        </Alert>
      )}
      {heldBooking && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button component={RouterLink} to={`/checkout/${heldBooking.id}`} color="inherit" size="small" variant="outlined">
              Pay now
            </Button>
          }
        >
          Seat <b>{heldBooking.seatLabel}</b> is held for you. Complete the payment before the hold ends. Picking another seat gives this one up.
        </Alert>
      )}

      {!map && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {map && sections.length === 0 && <Alert severity="info">No sections are open for booking yet.</Alert>}

      {section && (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 } }}>
          <Tabs value={Math.min(tab, sections.length - 1)} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
            {sections.map((s) => (
              <Tab
                key={s.id}
                label={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <span>{s.name}</span>
                    <Chip size="small" color="success" label={`${s.availableSeats} free`} />
                  </Stack>
                }
              />
            ))}
          </Tabs>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', mb: 2 }}>
            <Typography color="text.secondary">
              {sectionLabel(section.gender)} section · {section.availableSeats} of {section.totalSeats} seats free
            </Typography>
            <SeatLegend
              items={[
                { color: 'available', label: 'Available' },
                { color: 'occupied', label: 'Booked' },
                { color: 'disabled', label: 'Not available' },
                ...(isLoggedIn ? [{ color: 'mine', label: 'Your seat' }] : []),
              ]}
            />
          </Stack>

          <SeatCanvas layoutWidth={section.layoutWidth} layoutHeight={section.layoutHeight} backgroundImageUrl={section.backgroundImageUrl}>
            {section.seats.map((seat) => (
              <SeatBox
                key={seat.id}
                label={seat.seatLabel}
                color={seatColor(seat)}
                interactive={seat.availability === 'Available'}
                title={`Seat ${seat.seatLabel} – ${seat.isMine ? 'your seat' : seat.availability.toLowerCase()}`}
                style={seatBoxStyle(seat, section.layoutWidth, section.layoutHeight)}
                onClick={() => handleSeatClick(seat)}
              />
            ))}
          </SeatCanvas>
        </Paper>
      )}

      <Dialog open={!!selected} onClose={() => !holding && setSelected(null)}>
        <DialogTitle>Book seat {selected?.seatLabel}?</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Seat <b>{selected?.seatLabel}</b> in {section?.name}
          </Typography>
          {settings && (
            <Typography gutterBottom>
              Monthly fee: <b>{formatMoney(settings.monthlyFee, settings.currency)}</b> (first month paid now)
            </Typography>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            We hold the seat for you for {settings?.seatHoldMinutes ?? 7} minutes while you pay.
            {heldBooking && ` Your hold on seat ${heldBooking.seatLabel} will be given up.`}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} disabled={holding}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleHold} disabled={holding}>
            {holding ? 'Holding seat…' : 'Hold seat & pay'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
