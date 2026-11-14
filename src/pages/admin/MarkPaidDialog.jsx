import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material'
import { useState } from 'react'
import { adminFeesApi } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/errors'
import { formatMoney, formatPeriod } from '../../utils/format'

// Admin records a fee paid at the desk (cash / UPI to the library)
export default function MarkPaidDialog({ fee, onClose, onDone }) {
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    setBusy(true)
    setError('')
    try {
      await adminFeesApi.markPaid(fee.id, note.trim())
      onDone()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={() => !busy && onClose()} fullWidth maxWidth="xs">
      <DialogTitle>Record payment</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText sx={{ mb: 2 }}>
          {fee.studentName} paid <b>{formatMoney(fee.amount)}</b> for {formatPeriod(fee.periodStart, fee.periodEnd)} at the desk.
        </DialogContentText>
        <TextField
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          fullWidth
          placeholder="e.g. Cash, receipt #123"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={busy}>
          Mark as paid
        </Button>
      </DialogActions>
    </Dialog>
  )
}
