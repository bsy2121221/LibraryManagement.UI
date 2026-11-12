import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import DesignServices from '@mui/icons-material/DesignServices'
import Edit from '@mui/icons-material/Edit'
import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { sectionsApi } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/errors'
import SectionFormDialog from './SectionFormDialog'

export default function SectionsPage() {
  const [sections, setSections] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = new, object = edit
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    try {
      setSections(await sectionsApi.getAll())
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    try {
      await sectionsApi.remove(deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      setDeleting(null)
      setError(getErrorMessage(err))
    }
  }

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Sections & seats
          </Typography>
          <Typography color="text.secondary">Create the Boys and Girls sections, then design where each seat is.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setEditing(null)}>
          New section
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {sections?.length === 0 && (
        <Alert severity="info">No sections yet. Click “New section” to create the Boys section and the Girls section.</Alert>
      )}

      {sections?.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>For</TableCell>
                <TableCell align="right">Seats</TableCell>
                <TableCell align="right">Available</TableCell>
                <TableCell align="right">Booked</TableCell>
                <TableCell align="right">Disabled</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sections.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <b>{s.name}</b>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={s.gender === 'Female' ? 'Girls' : 'Boys'} color={s.gender === 'Female' ? 'secondary' : 'primary'} />
                  </TableCell>
                  <TableCell align="right">{s.totalSeats}</TableCell>
                  <TableCell align="right">{s.availableSeats}</TableCell>
                  <TableCell align="right">{s.occupiedSeats}</TableCell>
                  <TableCell align="right">{s.disabledSeats}</TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={s.isActive ? 'Open' : 'Hidden'} color={s.isActive ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button component={RouterLink} to={`/admin/sections/${s.id}`} size="small" startIcon={<DesignServices />}>
                      Design seats
                    </Button>
                    <Tooltip title="Edit section">
                      <IconButton onClick={() => setEditing(s)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete section">
                      <IconButton color="error" onClick={() => setDeleting(s)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {editing !== undefined && (
        <SectionFormDialog
          key={editing?.id ?? 'new'}
          open
          section={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined)
            load()
          }}
        />
      )}

      <Dialog open={!!deleting} onClose={() => setDeleting(null)}>
        <DialogTitle>Delete {deleting?.name}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This deletes the section and all its {deleting?.totalSeats} seats. A section that was ever booked cannot be deleted; switch off
            “Open for booking” instead.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
