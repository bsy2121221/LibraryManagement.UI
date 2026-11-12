import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material'
import { useState } from 'react'
import { adminBookingsApi } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/errors'

// Ask for a reason and release a student's seat. `booking` needs id, seatLabel and studentName.
export default function ReleaseSeatDialog({ booking, onClose, onReleased }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleRelease = async () => {
    setBusy(true)
    setError('')
    try {
      await adminBookingsApi.release(booking.id, reason.trim())
      onReleased(`Seat ${booking.seatLabel} released`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={() => !busy && onClose()} fullWidth maxWidth="xs">
      <DialogTitle>Release seat {booking.seatLabel}?</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText sx={{ mb: 2 }}>
          {booking.studentName} will lose seat {booking.seatLabel} and it becomes free for others. Unpaid fees for this seat are cancelled.
        </DialogContentText>
        <TextField
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          required
          autoFocus
          placeholder="e.g. Left the library, fee not paid"
          helperText="At least 3 characters"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button color="error" variant="contained" onClick={handleRelease} disabled={busy || reason.trim().length < 3}>
          Release seat
        </Button>
      </DialogActions>
    </Dialog>
  )
}
