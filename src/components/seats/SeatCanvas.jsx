import { Box } from '@mui/material'
import { safeImage } from '../home/blockTypes'

// The floor plan of one section. Keeps the section's aspect ratio at any screen width;
// children are positioned with seatBoxStyle() in percentages so they scale with it.
export default function SeatCanvas({
  ref,
  layoutWidth,
  layoutHeight,
  backgroundImageUrl,
  showGrid = false,
  // Designer needs 'none' so seat drag works; public map uses pan for scroll/zoom.
  touchAction = 'none',
  children,
  sx,
  ...rest
}) {
  const gridSize = `${(20 / layoutWidth) * 100}% ${(20 / layoutHeight) * 100}%`
  const imageUrl = safeImage(backgroundImageUrl)

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
        touchAction,
        bgcolor: '#fafaf7',
        backgroundImage: [
          showGrid && 'linear-gradient(#e8e8e3 1px, transparent 1px), linear-gradient(90deg, #e8e8e3 1px, transparent 1px)',
          imageUrl && `url("${imageUrl}")`,
        ]
          .filter(Boolean)
          .join(', '),
        backgroundSize: [showGrid && `${gridSize}, ${gridSize}`, imageUrl && 'cover'].filter(Boolean).join(', '),
        backgroundPosition: 'center',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  )
}
