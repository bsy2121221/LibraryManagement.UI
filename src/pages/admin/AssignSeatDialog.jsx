import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { studentsApi } from '../../api/endpoints'
import SeatPicker from '../../components/seats/SeatPicker'
import { usePublicSettings } from '../../hooks/usePublicSettings'
import { getErrorMessage } from '../../utils/errors'
import { addDays, addMonths, formatDate, formatMoney, todayInIndia } from '../../utils/format'

// Give a walk-in student a seat at the desk: no online hold or payment.
// The first month is recorded as paid now, or as due on the start date.
export default function AssignSeatDialog({ student, onClose, onAssigned }) {
  const { monthlyFee } = usePublicSettings()
  const [seat, setSeat] = useState(null)
  const [startDate, setStartDate] = useState(todayInIndia())
  const [amount, setAmount] = useState('')
  const [paidAtDesk, setPaidAtDesk] = useState(true)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const fee = amount === '' ? monthlyFee : Number(amount)
  const periodEnd = startDate ? addDays(addMonths(startDate, 1), -1) : null

  const handleAssign = async () => {
    setBusy(true)
    setError('')
    try {
      const booking = await studentsApi.assignSeat(student.id, {
        seatId: seat.id,
        startDate,
        amount: amount === '' ? null : Number(amount),
        paidAtDesk,
        note: note.trim() || null,
      })
      onAssigned(`Seat ${booking.seatLabel} assigned to ${student.fullName}`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={() => !busy && onClose()} fullWidth maxWidth="md">
      <DialogTitle>Assign a seat to {student.fullName}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <SeatPicker gender={student.gender} value={seat} onChange={setSeat} />
          <Typography>
            Seat: <b>{seat ? `${seat.seatLabel} (${seat.sectionName})` : 'click a green seat'}</b>
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Start date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText={periodEnd ? `First month: ${formatDate(startDate)} – ${formatDate(periodEnd)}` : ' '}
            />
            <TextField
              label="First month's fee"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={monthlyFee ? String(monthlyFee) : ''}
              helperText={`Leave empty for the monthly fee (${formatMoney(monthlyFee ?? 0)})`}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }, htmlInput: { min: 0 } }}
            />
          </Stack>
          <FormControlLabel
            control={<Switch checked={paidAtDesk} onChange={(e) => setPaidAtDesk(e.target.checked)} />}
            label={paidAtDesk ? `Paid now at the desk (${formatMoney(fee ?? 0)})` : `Not paid yet: due on ${formatDate(startDate)}`}
          />
          <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} size="small" placeholder="e.g. Cash, receipt #123" />
          <Alert severity="info">
            Next months are created automatically before they are due. The student gets a message on every channel that is switched on for
            “Seat assigned by admin”.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleAssign} disabled={!seat || !startDate || busy}>
          {busy ? 'Assigning…' : 'Assign seat'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
