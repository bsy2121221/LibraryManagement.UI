import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { adminBookingsApi, seatMapApi } from '../../api/endpoints'
import SeatBox, { SeatLegend } from '../../components/seats/SeatBox'
import SeatCanvas from '../../components/seats/SeatCanvas'
import { seatBoxStyle } from '../../components/seats/seatGeometry'
import { getErrorMessage } from '../../utils/errors'

// Pick a free seat (in a section for the student's gender) and move the student there
export default function MoveSeatDialog({ booking, onClose, onMoved }) {
  const [sections, setSections] = useState(null)
  const [tab, setTab] = useState(0)
  const [target, setTarget] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    seatMapApi
      .get()
      .then((map) => {
        const allowed = map.sections.filter((s) => s.gender === booking.sectionGender)
        setSections(allowed)
        setTab(Math.max(0, allowed.findIndex((s) => s.id === booking.sectionId)))
      })
      .catch((err) => setError(getErrorMessage(err)))
  }, [booking])

  const section = sections?.[tab]

  const seatColor = (seat) => {
    if (seat.id === booking.seatId) return 'mine'
    if (target?.id === seat.id) return 'held'
    if (seat.availability === 'Disabled') return 'disabled'
    if (seat.availability === 'Occupied') return 'occupied'
    return 'available'
  }

  const handleMove = async () => {
    setBusy(true)
    setError('')
    try {
      await adminBookingsApi.move(booking.id, target.id, reason.trim() || null)
      onMoved(`${booking.studentName} moved from ${booking.seatLabel} to ${target.seatLabel}`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Move {booking.studentName} from seat {booking.seatLabel}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {!sections && !error && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {sections && sections.length > 1 && (
            <Tabs value={tab} onChange={(_, value) => setTab(value)}>
              {sections.map((s) => (
                <Tab key={s.id} label={s.name} />
              ))}
            </Tabs>
          )}
          {section && (
            <>
              <SeatLegend
                items={[
                  { color: 'mine', label: 'Current seat' },
                  { color: 'available', label: 'Free (click to choose)' },
                  { color: 'held', label: 'New seat' },
                  { color: 'occupied', label: 'Taken' },
                ]}
              />
              <SeatCanvas layoutWidth={section.layoutWidth} layoutHeight={section.layoutHeight} backgroundImageUrl={section.backgroundImageUrl}>
                {section.seats.map((seat) => {
                  const selectable = seat.availability === 'Available'
                  return (
                    <SeatBox
                      key={seat.id}
                      label={seat.seatLabel}
                      color={seatColor(seat)}
                      selected={target?.id === seat.id}
                      interactive={selectable}
                      style={seatBoxStyle(seat, section.layoutWidth, section.layoutHeight)}
                      onClick={() => selectable && setTarget(seat)}
                    />
                  )
                })}
              </SeatCanvas>
            </>
          )}
          <Typography>
            New seat: <b>{target ? `${target.seatLabel} (${section?.name})` : 'click a green seat'}</b>
          </Typography>
          <TextField label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} size="small" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleMove} disabled={!target || busy}>
          {busy ? 'Moving…' : 'Move student'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
