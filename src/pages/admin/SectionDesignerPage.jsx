import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Delete from '@mui/icons-material/Delete'
import GridOn from '@mui/icons-material/GridOn'
import RotateLeft from '@mui/icons-material/RotateLeft'
import RotateRight from '@mui/icons-material/RotateRight'
import Save from '@mui/icons-material/Save'
import Undo from '@mui/icons-material/Undo'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink, useBlocker, useParams } from 'react-router-dom'
import { sectionsApi } from '../../api/endpoints'
import SeatBox, { SeatLegend } from '../../components/seats/SeatBox'
import SeatCanvas from '../../components/seats/SeatCanvas'
import { SEAT_SIZE, clamp, seatBoxStyle } from '../../components/seats/seatGeometry'
import { getErrorMessage } from '../../utils/errors'
import { formatDate } from '../../utils/format'
import GenerateSeatsDialog from './GenerateSeatsDialog'

const SNAP = 10

let nextKey = 1
// Seats get a client-side key so new (unsaved) seats can be selected and dragged before they have an Id
const toEditable = (seat) => ({ ...seat, key: seat.id ? `s${seat.id}` : `n${nextKey++}` })

function seatColor(seat) {
  if (seat.status === 'Disabled') return 'disabled'
  if (seat.occupant?.bookingStatus === 'Held') return 'held'
  if (seat.occupant) return 'occupied'
  return 'available'
}

// "B12" -> { prefix: "B", number: 12 }
function splitLabel(label) {
  const match = /^(.*?)(\d+)$/.exec(label)
  return match ? { prefix: match[1], number: Number(match[2]) } : { prefix: label, number: 0 }
}

function nextLabel(seats, gender) {
  if (!seats.length) return gender === 'Female' ? 'G1' : 'B1'
  const parts = seats.map((s) => splitLabel(s.seatLabel))
  const prefix = parts.at(-1).prefix
  const max = Math.max(0, ...parts.filter((p) => p.prefix === prefix).map((p) => p.number))
  return `${prefix}${max + 1}`
}

// First grid spot, left to right and top to bottom, that does not overlap another seat
function findFreeSpot(seats, width, height) {
  const step = SEAT_SIZE + 16
  for (let y = 20; y <= height - SEAT_SIZE; y += step) {
    for (let x = 20; x <= width - SEAT_SIZE; x += step) {
      const overlaps = seats.some((s) => Math.abs(s.posX - x) < SEAT_SIZE && Math.abs(s.posY - y) < SEAT_SIZE)
      if (!overlaps) return { x, y }
    }
  }
  return { x: 0, y: 0 }
}

const toRequestSeat = (s) => ({
  id: s.id ?? null,
  seatLabel: s.seatLabel.trim(),
  posX: s.posX,
  posY: s.posY,
  rotation: s.rotation,
  status: s.status,
})

export default function SectionDesignerPage() {
  const { id } = useParams()
  const canvasRef = useRef(null)
  const dragRef = useRef(null)

  const [section, setSection] = useState(null)
  const [seats, setSeats] = useState([])
  const [savedSeats, setSavedSeats] = useState([])
  const [selectedKey, setSelectedKey] = useState(null)
  const [snap, setSnap] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)

  const applyLayout = useCallback((layout) => {
    const editable = layout.seats.map(toEditable)
    setSection(layout.section)
    setSeats(editable)
    setSavedSeats(editable)
    setSelectedKey(null)
  }, [])

  const load = useCallback(async () => {
    try {
      applyLayout(await sectionsApi.getLayout(id))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [id, applyLayout])

  useEffect(() => {
    load()
  }, [load])

  const isDirty = useMemo(
    () => JSON.stringify(seats.map(toRequestSeat)) !== JSON.stringify(savedSeats.map(toRequestSeat)),
    [seats, savedSeats],
  )

  // Warn before leaving with unsaved changes (closing the tab, or navigating inside the app)
  useEffect(() => {
    if (!isDirty) return
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])
  const blocker = useBlocker(({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname)

  const selected = seats.find((s) => s.key === selectedKey) ?? null

  const updateSeat = useCallback((key, changes) => {
    setSeats((list) => list.map((s) => (s.key === key ? { ...s, ...changes } : s)))
  }, [])

  // ---- Dragging -------------------------------------------------------------
  const toLayoutPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scale = section.layoutWidth / rect.width
    return { x: (event.clientX - rect.left) * scale, y: (event.clientY - rect.top) * scale }
  }

  const handlePointerDown = (seat) => (event) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = toLayoutPoint(event)
    dragRef.current = { key: seat.key, offsetX: point.x - seat.posX, offsetY: point.y - seat.posY }
    setSelectedKey(seat.key)
  }

  const handlePointerMove = (event) => {
    const drag = dragRef.current
    if (!drag) return
    const point = toLayoutPoint(event)
    let x = clamp(point.x - drag.offsetX, 0, section.layoutWidth - SEAT_SIZE)
    let y = clamp(point.y - drag.offsetY, 0, section.layoutHeight - SEAT_SIZE)
    if (snap) {
      x = Math.round(x / SNAP) * SNAP
      y = Math.round(y / SNAP) * SNAP
    }
    updateSeat(drag.key, { posX: Math.round(x * 100) / 100, posY: Math.round(y * 100) / 100 })
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  // ---- Seat actions ---------------------------------------------------------
  const addSeat = () => {
    const spot = findFreeSpot(seats, section.layoutWidth, section.layoutHeight)
    const seat = toEditable({
      id: null,
      seatLabel: nextLabel(seats, section.gender),
      posX: spot.x,
      posY: spot.y,
      rotation: 0,
      status: 'Active',
      occupant: null,
    })
    setSeats((list) => [...list, seat])
    setSelectedKey(seat.key)
  }

  const removeSeat = useCallback(
    (seat) => {
      if (seat.occupant) {
        setError(`Seat ${seat.seatLabel} has a student (${seat.occupant.studentName}). Release or move the student first.`)
        return
      }
      setSeats((list) => list.filter((s) => s.key !== seat.key))
      setSelectedKey(null)
    },
    [],
  )

  const rotate = (seat, delta) => updateSeat(seat.key, { rotation: (((seat.rotation + delta) % 360) + 360) % 360 })

  const toggleDisabled = (seat) => {
    if (seat.status === 'Active' && seat.occupant) {
      setError(`Seat ${seat.seatLabel} has a student. Release or move the student before disabling it.`)
      return
    }
    updateSeat(seat.key, { status: seat.status === 'Active' ? 'Disabled' : 'Active' })
  }

  // Keyboard: arrows nudge the selected seat (Shift = 10 units), Delete removes it
  useEffect(() => {
    const handleKey = (event) => {
      if (!selected || !section) return
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return

      const step = event.shiftKey ? 10 : 1
      const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
      if (moves[event.key]) {
        event.preventDefault()
        const [dx, dy] = moves[event.key]
        updateSeat(selected.key, {
          posX: clamp(selected.posX + dx, 0, section.layoutWidth - SEAT_SIZE),
          posY: clamp(selected.posY + dy, 0, section.layoutHeight - SEAT_SIZE),
        })
      } else if (event.key === 'Delete') {
        removeSeat(selected)
      } else if (event.key === 'Escape') {
        setSelectedKey(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selected, section, updateSeat, removeSeat])

  const handleSave = async () => {
    const empty = seats.find((s) => !s.seatLabel.trim())
    if (empty) {
      setSelectedKey(empty.key)
      setError('Every seat needs a label.')
      return
    }
    setSaving(true)
    setError('')
    try {
      applyLayout(await sectionsApi.saveLayout(id, seats.map(toRequestSeat)))
      setToast('Layout saved')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  // ---- Render ---------------------------------------------------------------
  if (!section) {
    return error ? (
      <Alert severity="error">{error}</Alert>
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const counts = {
    total: seats.length,
    occupied: seats.filter((s) => s.occupant).length,
    disabled: seats.filter((s) => s.status === 'Disabled').length,
  }

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
        <IconButton component={RouterLink} to="/admin/sections" aria-label="Back to sections">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, mr: 1 }}>
          {section.name}
        </Typography>
        <Chip size="small" label={section.gender === 'Female' ? 'Girls' : 'Boys'} color={section.gender === 'Female' ? 'secondary' : 'primary'} />
        <Chip size="small" variant="outlined" label={`${counts.total} seats`} />
        <Chip size="small" variant="outlined" label={`${counts.occupied} booked`} />
        <Chip size="small" variant="outlined" label={`${counts.disabled} disabled`} />
        <Box sx={{ flexGrow: 1 }} />
        <Button startIcon={<Add />} onClick={addSeat}>
          Add seat
        </Button>
        <Tooltip title={isDirty ? 'Save or discard your changes first' : ''}>
          <span>
            <Button startIcon={<GridOn />} onClick={() => setGenerateOpen(true)} disabled={isDirty}>
              Add grid
            </Button>
          </span>
        </Tooltip>
        <Button startIcon={<Undo />} onClick={() => applyLayout({ section, seats: savedSeats })} disabled={!isDirty || saving}>
          Discard
        </Button>
        <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={!isDirty || saving}>
          {saving ? 'Saving…' : 'Save layout'}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {isDirty && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You have unsaved changes.
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', lg: 'row' } }}>
        <Paper variant="outlined" sx={{ p: 2, flexGrow: 1, width: '100%', minWidth: 0 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
            <SeatLegend
              items={[
                { color: 'available', label: 'Free' },
                { color: 'held', label: 'Held (paying)' },
                { color: 'occupied', label: 'Booked' },
                { color: 'disabled', label: 'Disabled' },
              ]}
            />
            <FormControlLabel control={<Switch size="small" checked={snap} onChange={(e) => setSnap(e.target.checked)} />} label="Snap to grid" />
          </Stack>

          <SeatCanvas
            ref={canvasRef}
            layoutWidth={section.layoutWidth}
            layoutHeight={section.layoutHeight}
            backgroundImageUrl={section.backgroundImageUrl}
            showGrid
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerDown={(e) => e.target === e.currentTarget && setSelectedKey(null)}
          >
            {seats.map((seat) => (
              <SeatBox
                key={seat.key}
                label={seat.seatLabel || '?'}
                color={seatColor(seat)}
                selected={seat.key === selectedKey}
                interactive
                title={seat.occupant ? `${seat.seatLabel}: ${seat.occupant.studentName} (${seat.occupant.studentMobile})` : seat.seatLabel}
                style={{ ...seatBoxStyle(seat, section.layoutWidth, section.layoutHeight), cursor: 'grab' }}
                onPointerDown={handlePointerDown(seat)}
              />
            ))}
          </SeatCanvas>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Drag seats to move them. Select a seat to edit it; arrow keys nudge it (Shift = faster), Delete removes it.
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
          {!selected ? (
            <Typography color="text.secondary">Select a seat to edit its label, position or status.</Typography>
          ) : (
            <Stack spacing={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Seat {selected.seatLabel || '(no label)'} {!selected.id && <Chip size="small" label="new" sx={{ ml: 1 }} />}
              </Typography>
              <TextField
                label="Label"
                size="small"
                value={selected.seatLabel}
                onChange={(e) => updateSeat(selected.key, { seatLabel: e.target.value.slice(0, 20) })}
                error={!selected.seatLabel.trim()}
              />
              <Stack direction="row" spacing={1}>
                <TextField
                  label="X"
                  type="number"
                  size="small"
                  value={selected.posX}
                  onChange={(e) => updateSeat(selected.key, { posX: clamp(Number(e.target.value), 0, section.layoutWidth - SEAT_SIZE) })}
                />
                <TextField
                  label="Y"
                  type="number"
                  size="small"
                  value={selected.posY}
                  onChange={(e) => updateSeat(selected.key, { posY: clamp(Number(e.target.value), 0, section.layoutHeight - SEAT_SIZE) })}
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  Rotation: {selected.rotation}°
                </Typography>
                <Tooltip title="Rotate left 15°">
                  <IconButton onClick={() => rotate(selected, -15)}>
                    <RotateLeft />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rotate right 15°">
                  <IconButton onClick={() => rotate(selected, 15)}>
                    <RotateRight />
                  </IconButton>
                </Tooltip>
              </Stack>
              <FormControlLabel
                control={<Switch checked={selected.status === 'Disabled'} onChange={() => toggleDisabled(selected)} />}
                label="Disabled (cannot be booked)"
              />

              {selected.occupant && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {selected.occupant.bookingStatus === 'Held' ? 'Held while paying' : 'Booked by'}
                    </Typography>
                    <Typography>{selected.occupant.studentName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selected.occupant.studentMobile}
                    </Typography>
                    {selected.occupant.nextDueDate && (
                      <Typography variant="body2" color="text.secondary">
                        Next fee due: {formatDate(selected.occupant.nextDueDate)}
                      </Typography>
                    )}
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/admin/bookings?search=${encodeURIComponent(selected.seatLabel)}`}
                      sx={{ mt: 1, px: 0 }}
                    >
                      Move or release student
                    </Button>
                  </Box>
                </>
              )}

              <Divider />
              <Button color="error" startIcon={<Delete />} onClick={() => removeSeat(selected)} disabled={!!selected.occupant}>
                Remove seat
              </Button>
            </Stack>
          )}
        </Paper>
      </Box>

      {generateOpen && (
        <GenerateSeatsDialog
          open
          section={section}
          onClose={() => setGenerateOpen(false)}
          onGenerated={(layout) => {
            setGenerateOpen(false)
            applyLayout(layout)
            setToast('Seats added')
          }}
        />
      )}

      <Dialog open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()}>
        <DialogTitle>Leave without saving?</DialogTitle>
        <DialogContent>
          <DialogContentText>Your seat layout changes have not been saved.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => blocker.reset?.()}>Stay</Button>
          <Button color="error" onClick={() => blocker.proceed?.()}>
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast('')} message={toast} />
    </>
  )
}
