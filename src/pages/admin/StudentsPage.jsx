import {
  Alert,
  Box,
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
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
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { studentsApi } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/errors'
import { formatDate } from '../../utils/format'

// Filter values -> API query values (undefined = no filter)
const ACCOUNT_FILTERS = { all: undefined, active: true, inactive: false }
const SEAT_FILTERS = { all: undefined, withSeat: true, withoutSeat: false }

export default function StudentsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [account, setAccount] = useState('active')
  const [seat, setSeat] = useState('all')
  const [students, setStudents] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setStudents(await studentsApi.getAll({ search: search.trim(), isActive: ACCOUNT_FILTERS[account], hasSeat: SEAT_FILTERS[seat] }))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [search, account, seat])

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
          Students
        </Typography>
        <Typography color="text.secondary">Click a student to edit their details, reset the password or change their seat.</Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search name, mobile, email or seat"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
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
        <TextField select size="small" label="Account" value={account} onChange={(e) => setAccount(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Deactivated</MenuItem>
        </TextField>
        <TextField select size="small" label="Seat" value={seat} onChange={(e) => setSeat(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="withSeat">Has a seat</MenuItem>
          <MenuItem value="withoutSeat">No seat</MenuItem>
        </TextField>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {students?.length === 0 && <Alert severity="info">No students found.</Alert>}

      {students?.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Seat</TableCell>
                <TableCell>Next fee due</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell>Account</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/students/${s.id}`)}>
                  <TableCell>
                    <b>{s.fullName}</b>
                    {s.email && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {s.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{s.mobile}</TableCell>
                  <TableCell>{s.gender ?? '—'}</TableCell>
                  <TableCell>
                    {s.seatLabel ? (
                      <Chip
                        size="small"
                        color={s.bookingStatus === 'Held' ? 'warning' : 'success'}
                        label={`${s.seatLabel} · ${s.sectionName}${s.bookingStatus === 'Held' ? ' (paying)' : ''}`}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{formatDate(s.nextDueDate)}</TableCell>
                  <TableCell>{formatDate(s.createdAt)}</TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={s.isActive ? 'Active' : 'Deactivated'} color={s.isActive ? 'success' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}
