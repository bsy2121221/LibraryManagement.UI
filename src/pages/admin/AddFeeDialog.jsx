import {
  Alert,
  Autocomplete,
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
} from '@mui/material'
import { useEffect, useState } from 'react'
import { adminFeesApi, studentsApi } from '../../api/endpoints'
import { usePublicSettings } from '../../hooks/usePublicSettings'
import { getErrorMessage } from '../../utils/errors'
import { addDays, addMonths, formatDate, formatMoney, todayInIndia } from '../../utils/format'

// Admin adds a fee for a student with a seat: a missed month, a month in advance, or an extra charge.
// student (optional): { id, fullName, nextDueDate } - when missing, the admin searches for a student with a seat.
export default function AddFeeDialog({ student: fixedStudent, onClose, onAdded }) {
  const { monthlyFee } = usePublicSettings()
  const [student, setStudent] = useState(fixedStudent ?? null)
  const [options, setOptions] = useState([])
  const [search, setSearch] = useState('')
  const [periodStart, setPeriodStart] = useState(fixedStudent?.nextDueDate ?? todayInIndia())
  const [periodEnd, setPeriodEnd] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [amount, setAmount] = useState('')
  const [paidAtDesk, setPaidAtDesk] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Search students who have a seat (fees belong to a seat)
  useEffect(() => {
    if (fixedStudent) return
    const timer = setTimeout(() => {
      studentsApi
        .getAll({ search: search.trim(), hasSeat: true, isActive: true })
        .then((list) => setOptions(list.filter((s) => s.bookingStatus === 'Active')))
        .catch(() => setOptions([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [search, fixedStudent])

  const chooseStudent = (value) => {
    setStudent(value)
    if (value?.nextDueDate) setPeriodStart(value.nextDueDate)
  }

  const defaultEnd = periodStart ? addDays(addMonths(periodStart, 1), -1) : ''
  const fee = amount === '' ? monthlyFee : Number(amount)

  const handleSave = async () => {
    setBusy(true)
    setError('')
    try {
      const invoice = await adminFeesApi.create({
        studentId: student.id,
        periodStart,
        periodEnd: periodEnd || null,
        amount: amount === '' ? null : Number(amount),
        dueDate: dueDate || null,
        paidAtDesk,
        note: note.trim() || null,
      })
      onAdded(`Fee of ${formatMoney(invoice.amount)} added for ${invoice.studentName}${paidAtDesk ? ' (paid)' : ''}`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={() => !busy && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>Add fee{fixedStudent ? ` for ${fixedStudent.fullName}` : ''}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {!fixedStudent && (
            <Autocomplete
              options={options}
              value={student}
              onChange={(_, value) => chooseStudent(value)}
              onInputChange={(_, value) => setSearch(value)}
              filterOptions={(x) => x}
              getOptionLabel={(s) => `${s.fullName} · ${s.mobile} · seat ${s.seatLabel}`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              noOptionsText="No student with a seat found"
              renderInput={(params) => <TextField {...params} label="Student (with a seat)" autoFocus />}
            />
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Period from"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Period to"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText={`Empty = one month (${formatDate(defaultEnd)})`}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={monthlyFee ? String(monthlyFee) : ''}
              helperText={`Empty = monthly fee (${formatMoney(monthlyFee ?? 0)})`}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> }, htmlInput: { min: 1 } }}
              fullWidth
            />
            <TextField
              label="Due date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Empty = period start"
              fullWidth
              disabled={paidAtDesk}
            />
          </Stack>
          <FormControlLabel
            control={<Switch checked={paidAtDesk} onChange={(e) => setPaidAtDesk(e.target.checked)} />}
            label={paidAtDesk ? `Paid now at the desk (${formatMoney(fee ?? 0)})` : 'Not paid yet (student can pay online or at the desk)'}
          />
          {paidAtDesk && <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} size="small" placeholder="e.g. Cash, receipt #123" />}
          <Alert severity="info">
            If this is the student&apos;s next month, the automatic monthly fee for it will not be created again.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!student || !periodStart || busy}>
          {busy ? 'Saving…' : 'Add fee'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
