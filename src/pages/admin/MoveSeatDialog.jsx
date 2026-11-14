import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { adminBookingsApi } from '../../api/endpoints'
import SeatPicker from '../../components/seats/SeatPicker'
import { getErrorMessage } from '../../utils/errors'

// Pick a free seat (in a section for the student's gender) and move the student there
export default function MoveSeatDialog({ booking, onClose, onMoved }) {
  const [target, setTarget] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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
          <SeatPicker
            gender={booking.sectionGender}
            currentSeatId={booking.seatId}
            preferredSectionId={booking.sectionId}
            value={target}
            onChange={setTarget}
          />
          <Typography>
            New seat: <b>{target ? `${target.seatLabel} (${target.sectionName})` : 'click a green seat'}</b>
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
