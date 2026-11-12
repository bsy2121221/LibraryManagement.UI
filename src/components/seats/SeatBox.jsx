import { Box } from '@mui/material'
import { SEAT_COLORS } from './seatGeometry'

// A single seat drawn as a small armchair-like tile with its label
export default function SeatBox({ label, color, selected = false, interactive = false, style, title, ...rest }) {
  const colors = SEAT_COLORS[color] ?? SEAT_COLORS.available

  return (
    <Box
      style={style}
      title={title}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.bg,
        color: colors.text,
        border: 2,
        borderColor: selected ? '#ffca28' : colors.border,
        boxShadow: selected ? '0 0 0 3px rgba(255,202,40,.6)' : '0 1px 2px rgba(0,0,0,.25)',
        borderRadius: '6px 6px 10px 10px',
        borderBottomWidth: 5,
        fontSize: 'clamp(8px, 1.1vw, 13px)',
        fontWeight: 700,
        lineHeight: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'filter .15s',
        '&:hover': interactive ? { filter: 'brightness(1.15)' } : undefined,
      }}
      {...rest}
    >
      {label}
    </Box>
  )
}

export function SeatLegend({ items }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {items.map(({ color, label }) => (
        <Box key={color} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 14 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: 0.75, bgcolor: SEAT_COLORS[color].bg }} />
          {label}
        </Box>
      ))}
    </Box>
  )
}
