import { Alert, Box, CircularProgress, Stack, Tab, Tabs } from '@mui/material'
import { useEffect, useState } from 'react'
import { seatMapApi } from '../../api/endpoints'
import { getErrorMessage } from '../../utils/errors'
import SeatBox, { SeatLegend } from './SeatBox'
import SeatMapViewport from './SeatMapViewport'
import { seatBoxStyle } from './seatGeometry'

// Admin picks a free seat in a section for the given gender.
// currentSeatId (optional) is shown in blue, e.g. the student's seat when moving them.
export default function SeatPicker({ gender, currentSeatId, preferredSectionId, value, onChange }) {
  const [sections, setSections] = useState(null)
  const [tab, setTab] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    seatMapApi
      .get()
      .then((map) => {
        const allowed = map.sections.filter((s) => s.gender === gender)
        setSections(allowed)
        setTab(Math.max(0, allowed.findIndex((s) => s.id === preferredSectionId)))
      })
      .catch((err) => setError(getErrorMessage(err)))
  }, [gender, preferredSectionId])

  if (error) return <Alert severity="error">{error}</Alert>
  if (!sections) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (sections.length === 0) {
    return <Alert severity="warning">There is no open {gender === 'Female' ? 'Girls' : 'Boys'} section with seats yet.</Alert>
  }

  const section = sections[tab]
  const colorOf = (seat) => {
    if (seat.id === currentSeatId) return 'mine'
    if (value?.id === seat.id) return 'held'
    if (seat.availability === 'Disabled') return 'disabled'
    if (seat.availability === 'Occupied') return 'occupied'
    return 'available'
  }

  return (
    <Stack spacing={1.5}>
      {sections.length > 1 && (
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {sections.map((s) => (
            <Tab key={s.id} label={`${s.name} (${s.availableSeats} free)`} />
          ))}
        </Tabs>
      )}
      <SeatLegend
        items={[
          ...(currentSeatId ? [{ color: 'mine', label: 'Current seat' }] : []),
          { color: 'available', label: 'Free (click to choose)' },
          { color: 'held', label: 'Chosen' },
          { color: 'occupied', label: 'Taken' },
        ]}
      />
      <SeatMapViewport layoutWidth={section.layoutWidth} layoutHeight={section.layoutHeight} backgroundImageUrl={section.backgroundImageUrl}>
        {section.seats.map((seat) => {
          const selectable = seat.availability === 'Available'
          return (
            <SeatBox
              key={seat.id}
              label={seat.seatLabel}
              color={colorOf(seat)}
              selected={value?.id === seat.id}
              interactive={selectable}
              style={seatBoxStyle(seat, section.layoutWidth, section.layoutHeight)}
              onClick={() => selectable && onChange({ ...seat, sectionName: section.name })}
            />
          )
        })}
      </SeatMapViewport>
    </Stack>
  )
}
