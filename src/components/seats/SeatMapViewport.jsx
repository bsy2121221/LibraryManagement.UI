import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import SeatCanvas from './SeatCanvas'
import { SEAT_SIZE } from './seatGeometry'

// Target on-screen seat size so labels stay readable and taps hit reliably on phones.
const MIN_SEAT_PX = 44
const MAX_ZOOM = 3
const VIEWPORT_MAX_HEIGHT = { xs: '70vh', md: '75vh' }

/**
 * Scrollable, zoomable wrapper around SeatCanvas.
 * On narrow screens the map is auto-scaled so each seat is at least MIN_SEAT_PX,
 * then the user can pan (scroll) and zoom with buttons or pinch.
 */
export default function SeatMapViewport({
  layoutWidth,
  layoutHeight,
  backgroundImageUrl,
  showGrid = false,
  children,
  hint = 'Scroll to move · use + / − or pinch to zoom',
}) {
  const containerRef = useRef(null)
  const userZoomRef = useRef(1)
  const autoScaleRef = useRef(1)
  const pinchRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [userZoom, setUserZoom] = useState(1)

  const setZoom = useCallback((next) => {
    const value = typeof next === 'function' ? next(userZoomRef.current) : next
    userZoomRef.current = value
    setUserZoom(value)
  }, [])

  // Reset zoom when switching sections / layout size.
  useEffect(() => {
    setZoom(1)
  }, [layoutWidth, layoutHeight, setZoom])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // How big a seat would be if the canvas simply filled the container width.
  const fitSeatPx = containerWidth > 0 ? (containerWidth * SEAT_SIZE) / layoutWidth : MIN_SEAT_PX
  const autoScale = Math.max(1, MIN_SEAT_PX / Math.max(fitSeatPx, 0.001))
  autoScaleRef.current = autoScale
  const scale = Math.min(MAX_ZOOM * autoScale, autoScale * userZoom)
  const canvasWidthPx = containerWidth > 0 ? containerWidth * scale : '100%'
  const minZoom = 1 / autoScale

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + 0.25) * 100) / 100))
  }, [setZoom])

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(minZoom, Math.round((z - 0.25) * 100) / 100))
  }, [minZoom, setZoom])

  // Pinch-to-zoom (two-finger) without blocking one-finger scroll/pan.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined

    const distance = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)

    const onTouchStart = (e) => {
      if (e.touches.length !== 2) {
        pinchRef.current = null
        return
      }
      pinchRef.current = {
        startDist: distance(e.touches[0], e.touches[1]),
        startZoom: userZoomRef.current,
      }
    }

    const onTouchMove = (e) => {
      if (!pinchRef.current || e.touches.length !== 2) return
      e.preventDefault()
      const ratio = distance(e.touches[0], e.touches[1]) / pinchRef.current.startDist
      const next = pinchRef.current.startZoom * ratio
      const floor = 1 / autoScaleRef.current
      setZoom(Math.min(MAX_ZOOM, Math.max(floor, next)))
    }

    const onTouchEnd = () => {
      pinchRef.current = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [setZoom])

  const minZoomReached = userZoom <= minZoom + 0.001
  const maxZoomReached = userZoom >= MAX_ZOOM - 0.001

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          boxShadow: 1,
        }}
      >
        <Tooltip title="Zoom out">
          <span>
            <IconButton size="small" onClick={zoomOut} disabled={minZoomReached} aria-label="Zoom out">
              <Remove fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Zoom in">
          <span>
            <IconButton size="small" onClick={zoomIn} disabled={maxZoomReached} aria-label="Zoom in">
              <Add fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          maxHeight: VIEWPORT_MAX_HEIGHT,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderRadius: 2,
          overscrollBehavior: 'contain',
        }}
      >
        <Box sx={{ width: canvasWidthPx, minWidth: '100%' }}>
          <SeatCanvas
            layoutWidth={layoutWidth}
            layoutHeight={layoutHeight}
            backgroundImageUrl={backgroundImageUrl}
            showGrid={showGrid}
            touchAction="pan-x pan-y"
          >
            {children}
          </SeatCanvas>
        </Box>
      </Box>

      {hint && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {hint}
        </Typography>
      )}
    </Box>
  )
}
