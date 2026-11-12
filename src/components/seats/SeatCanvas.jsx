import { Box } from '@mui/material'

// The floor plan of one section. Keeps the section's aspect ratio at any screen width;
// children are positioned with seatBoxStyle() in percentages so they scale with it.
export default function SeatCanvas({ ref, layoutWidth, layoutHeight, backgroundImageUrl, showGrid = false, children, sx, ...rest }) {
  const gridSize = `${(20 / layoutWidth) * 100}% ${(20 / layoutHeight) * 100}%`

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${layoutWidth} / ${layoutHeight}`,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none',
        bgcolor: '#fafaf7',
        backgroundImage: [
          showGrid && 'linear-gradient(#e8e8e3 1px, transparent 1px), linear-gradient(90deg, #e8e8e3 1px, transparent 1px)',
          backgroundImageUrl && `url("${backgroundImageUrl}")`,
        ]
          .filter(Boolean)
          .join(', '),
        backgroundSize: [showGrid && `${gridSize}, ${gridSize}`, backgroundImageUrl && 'cover'].filter(Boolean).join(', '),
        backgroundPosition: 'center',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  )
}
