import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  Link,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import Payments from '@mui/icons-material/Payments'
import Search from '@mui/icons-material/Search'
import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { adminFeesApi } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/errors'
import { FEE_STATUS_CHIPS, formatDate, formatMoney, formatPeriod } from '../../utils/format'
import AddFeeDialog from './AddFeeDialog'
import MarkPaidDialog from './MarkPaidDialog'

const FILTERS = [
  { value: '', label: 'Unpaid (due + overdue)' },
  { value: 'Overdue', label: 'Overdue' },
  { value: 'Due', label: 'Due' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Cancelled', label: 'Cancelled' },
]

// Monthly fees. The billing job creates next month's fee automatically; record desk payments here.
export default function FeesPage() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [fees, setFees] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [paying, setPaying] = useState(null)
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    try {
      setFees(await adminFeesApi.getAll({ status, search: search.trim() }))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [status, search])

  useEffect(() => {
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [load])

  const total = (fees ?? []).filter((f) => f.isPayable).reduce((sum, f) => sum + f.amount, 0)

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Fees
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setAdding(true)}>
            Add fee
          </Button>
        </Stack>
        <Typography color="text.secondary">
          Next month&apos;s fee is created automatically before it is due (see Settings). Students pay online from “My seat”, or
          record a payment made at the desk here.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, alignItems: { sm: 'center' } }}>
        <TextField
          placeholder="Search name, mobile or seat"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField select size="small" label="Show" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 220 }}>
          {FILTERS.map((f) => (
            <MenuItem key={f.value} value={f.value}>
              {f.label}
            </MenuItem>
          ))}
        </TextField>
        {total > 0 && <Chip color="warning" label={`To collect: ${formatMoney(total)}`} />}
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {fees?.length === 0 && <Alert severity="info">No fees found.</Alert>}

      {fees?.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Seat</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Due</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fees.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={`/admin/students/${f.studentId}`}>
                      {f.studentName}
                    </Link>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {f.studentMobile}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {f.seatLabel} · {f.sectionName}
                  </TableCell>
                  <TableCell>{formatPeriod(f.periodStart, f.periodEnd)}</TableCell>
                  <TableCell>{formatDate(f.dueDate)}</TableCell>
                  <TableCell align="right">{formatMoney(f.amount)}</TableCell>
                  <TableCell>
                    <Chip size="small" {...FEE_STATUS_CHIPS[f.status]} />
                    {f.status === 'Paid' && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {formatDate(f.paidAt)} · {f.paidVia === 'Cash' ? 'at desk' : 'online'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {f.isPayable && (
                      <Button size="small" startIcon={<Payments />} onClick={() => setPaying(f)}>
                        Record payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {paying && (
        <MarkPaidDialog
          fee={paying}
          onClose={() => setPaying(null)}
          onDone={() => {
            setPaying(null)
            setToast('Payment recorded. The student will get a confirmation message.')
            load()
          }}
        />
      )}
      {adding && (
        <AddFeeDialog
          onClose={() => setAdding(false)}
          onAdded={(message) => {
            setAdding(false)
            setToast(message)
            load()
          }}
        />
      )}
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} message={toast} />
    </>
  )
}
