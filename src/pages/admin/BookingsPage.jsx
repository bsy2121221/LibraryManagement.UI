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
import Search from '@mui/icons-material/Search'
import SwapHoriz from '@mui/icons-material/SwapHoriz'
import PersonRemove from '@mui/icons-material/PersonRemove'
import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { adminBookingsApi } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/errors'
import { formatDate, formatDateTime } from '../../utils/format'
import MoveSeatDialog from './MoveSeatDialog'
import ReleaseSeatDialog from './ReleaseSeatDialog'

const STATUS_FILTERS = [
  { value: '', label: 'Current (booked + held)' },
  { value: 'Active', label: 'Booked' },
  { value: 'Held', label: 'Held (paying)' },
  { value: 'Released', label: 'Released by admin' },
  { value: 'Expired', label: 'Expired holds' },
]

const STATUS_CHIPS = {
  Active: { label: 'Booked', color: 'success' },
  Held: { label: 'Held', color: 'warning' },
  Released: { label: 'Released', color: 'default' },
  Expired: { label: 'Expired', color: 'default' },
}

// Who is sitting where. Release a student from their seat, or move them to another seat.
export default function BookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [moving, setMoving] = useState(null)
  const [releasing, setReleasing] = useState(null)

  const load = useCallback(async () => {
    try {
      setBookings(await adminBookingsApi.getAll({ status, search: search.trim() }))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [status, search])

  // Search as you type, with a short pause so we do not call the API on every key
  useEffect(() => {
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [load])

  const handleSearchChange = (value) => {
    setSearch(value)
    setSearchParams(value ? { search: value } : {}, { replace: true })
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Students on seats
        </Typography>
        <Typography color="text.secondary">A student keeps their seat until you release them here.</Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search name, mobile or seat"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
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
          {STATUS_FILTERS.map((f) => (
            <MenuItem key={f.value} value={f.value}>
              {f.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bookings?.length === 0 && <Alert severity="info">No bookings found.</Alert>}

      {bookings?.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Seat</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Since</TableCell>
                <TableCell>Next due</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => {
                const chip = STATUS_CHIPS[b.status] ?? { label: b.status, color: 'default' }
                const live = b.status === 'Active' || b.status === 'Held'
                return (
                  <TableRow key={b.id} hover>
                    <TableCell>
                      <b>{b.seatLabel}</b>
                    </TableCell>
                    <TableCell>{b.sectionName}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/admin/students/${b.studentId}`}>
                        {b.studentName}
                      </Link>
                    </TableCell>
                    <TableCell>{b.studentMobile}</TableCell>
                    <TableCell>
                      <Chip size="small" label={chip.label} color={chip.color} />
                      {b.status === 'Held' && (
                        <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                          until {formatDateTime(b.holdExpiresAt)}
                        </Typography>
                      )}
                      {b.status === 'Released' && (
                        <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                          {formatDateTime(b.releasedAt)}: {b.releaseReason}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(b.startDate)}</TableCell>
                    <TableCell>{formatDate(b.nextDueDate)}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      {b.status === 'Active' && (
                        <Button size="small" startIcon={<SwapHoriz />} onClick={() => setMoving(b)}>
                          Move
                        </Button>
                      )}
                      {live && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<PersonRemove />}
                          onClick={() => setReleasing(b)}
                        >
                          Release
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {moving && (
        <MoveSeatDialog
          booking={moving}
          onClose={() => setMoving(null)}
          onMoved={(message) => {
            setMoving(null)
            setToast(message)
            load()
          }}
        />
      )}

      {releasing && (
        <ReleaseSeatDialog
          booking={releasing}
          onClose={() => setReleasing(null)}
          onReleased={(message) => {
            setReleasing(null)
            setToast(message)
            load()
          }}
        />
      )}

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} message={toast} />
    </>
  )
}
