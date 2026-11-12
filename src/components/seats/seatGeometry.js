// Seats are stored in "layout units": a section is LayoutWidth x LayoutHeight units and a seat's
// PosX/PosY is its top-left corner. The canvas scales those units to whatever width is on screen.
export const SEAT_SIZE = 44

export const toPercent = (value, total) => `${(Number(value) / total) * 100}%`

export function seatBoxStyle(seat, layoutWidth, layoutHeight) {
  return {
    position: 'absolute',
    left: toPercent(seat.posX, layoutWidth),
    top: toPercent(seat.posY, layoutHeight),
    width: toPercent(SEAT_SIZE, layoutWidth),
    height: toPercent(SEAT_SIZE, layoutHeight),
    transform: seat.rotation ? `rotate(${seat.rotation}deg)` : undefined,
  }
}

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// Colours for each seat state, shared by the public map, the designer and the legend
export const SEAT_COLORS = {
  available: { bg: '#2e7d32', border: '#1b5e20', text: '#fff' },
  occupied: { bg: '#d32f2f', border: '#b71c1c', text: '#fff' },
  disabled: { bg: '#9e9e9e', border: '#757575', text: '#fff' },
  mine: { bg: '#1565c0', border: '#0d47a1', text: '#fff' },
  held: { bg: '#ef6c00', border: '#e65100', text: '#fff' },
}

