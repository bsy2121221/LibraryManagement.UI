import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { alpha, keyframes } from '@mui/material/styles'
import AcUnit from '@mui/icons-material/AcUnit'
import ArrowForward from '@mui/icons-material/ArrowForward'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Close from '@mui/icons-material/Close'
import EventSeat from '@mui/icons-material/EventSeat'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ImageIcon from '@mui/icons-material/Image'
import Lightbulb from '@mui/icons-material/Lightbulb'
import LocalCafe from '@mui/icons-material/LocalCafe'
import LocalParking from '@mui/icons-material/LocalParking'
import Lock from '@mui/icons-material/Lock'
import MenuBook from '@mui/icons-material/MenuBook'
import Power from '@mui/icons-material/Power'
import Schedule from '@mui/icons-material/Schedule'
import Shield from '@mui/icons-material/Shield'
import Videocam from '@mui/icons-material/Videocam'
import VolumeOff from '@mui/icons-material/VolumeOff'
import WaterDrop from '@mui/icons-material/WaterDrop'
import Wifi from '@mui/icons-material/Wifi'
import ZoomIn from '@mui/icons-material/ZoomIn'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { formatMoney } from '../../utils/format'
import { safeImage, safeLink } from './blockTypes'

const ICONS = {
  seat: EventSeat,
  ac: AcUnit,
  wifi: Wifi,
  shield: Shield,
  book: MenuBook,
  clock: Schedule,
  lock: Lock,
  power: Power,
  coffee: LocalCafe,
  cctv: Videocam,
  parking: LocalParking,
  water: WaterDrop,
  light: Lightbulb,
  quiet: VolumeOff,
}

// Design tokens for the public home page
const INK = '#0f1535'
const ACCENT = '#f5b544' // warm reading-lamp gold
const DISPLAY_FONT = '"Playfair Display", Georgia, "Times New Roman", serif'
const BACKGROUNDS = {
  white: '#ffffff',
  light: 'linear-gradient(180deg, #f6f7fb 0%, #eef0f8 100%)',
  tint: 'linear-gradient(180deg, #eef1fb 0%, #e6f4f1 100%)',
}
const GRID_COLUMNS = (n) => ({ xs: '1fr', sm: '1fr 1fr', md: `repeat(${Math.min(Math.max(Number(n) || 3, 1), 4)}, 1fr)` })

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`
const slowZoom = keyframes`
  from { transform: scale(1.08); }
  to { transform: scale(1); }
`
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`
const reveal = (delay = 0) => ({
  animation: `${fadeUp} .8s cubic-bezier(.2,.7,.2,1) ${delay}s both`,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
})

// Replaces {LibraryName} and {MonthlyFee} with the current settings
function makeFill(ctx) {
  return (text) =>
    String(text ?? '')
      .replaceAll('{LibraryName}', ctx.libraryName ?? '')
      .replaceAll('{MonthlyFee}', ctx.monthlyFee != null ? formatMoney(ctx.monthlyFee, ctx.currency) : 'a small fee')
}

function LinkButton({ text, link, ...props }) {
  const target = safeLink(link)
  if (!text || !target) return null
  if (target.internal) {
    return (
      <Button component={RouterLink} to={target.href} {...props}>
        {text}
      </Button>
    )
  }
  return (
    <Button
      component="a"
      href={target.href}
      target={target.href.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      {...props}
    >
      {text}
    </Button>
  )
}

const pillButton = {
  borderRadius: 999,
  px: 3.5,
  py: 1.4,
  fontSize: 16,
  fontWeight: 700,
  transition: 'transform .2s, box-shadow .2s',
  '&:hover': { transform: 'translateY(-2px)' },
}

const primaryButton = {
  ...pillButton,
  color: INK,
  bgcolor: ACCENT,
  boxShadow: `0 10px 30px ${alpha(ACCENT, 0.35)}`,
  '&:hover': { ...pillButton['&:hover'], bgcolor: '#ffc65c', boxShadow: `0 14px 34px ${alpha(ACCENT, 0.45)}` },
}

const darkButton = {
  ...pillButton,
  color: '#fff',
  bgcolor: INK,
  boxShadow: `0 10px 30px ${alpha(INK, 0.25)}`,
  '&:hover': { ...pillButton['&:hover'], bgcolor: '#1d2557' },
}

function Heading({ children, light = false, sx }) {
  return (
    <Typography
      variant="h4"
      component="h2"
      sx={{
        fontFamily: DISPLAY_FONT,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.15,
        fontSize: { xs: 30, md: 42 },
        color: light ? '#fff' : INK,
        ...sx,
      }}
    >
      {children}
    </Typography>
  )
}

function AccentBar({ center }) {
  return (
    <Box
      sx={{
        width: 56,
        height: 4,
        borderRadius: 2,
        mt: 2,
        mx: center ? 'auto' : 0,
        background: `linear-gradient(90deg, ${ACCENT}, #00897b)`,
      }}
    />
  )
}

function SectionHeading({ title, subtitle, align = 'center' }) {
  if (!title && !subtitle) return null
  const center = align === 'center'
  return (
    <Box sx={{ textAlign: align, mb: { xs: 5, md: 7 }, maxWidth: center ? 720 : 'none', mx: center ? 'auto' : 0 }}>
      {title && <Heading>{title}</Heading>}
      {title && <AccentBar center={center} />}
      {subtitle && (
        <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', fontSize: { xs: 16, md: 18 }, mt: 2.5, lineHeight: 1.7 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}

function Band({ background, children, py = { xs: 8, md: 12 } }) {
  return (
    <Box sx={{ background: BACKGROUNDS[background] ?? BACKGROUNDS.white, py, position: 'relative' }}>
      <Container maxWidth="lg">{children}</Container>
    </Box>
  )
}

function ImagePlaceholder({ height = 260 }) {
  return (
    <Box
      sx={{
        height,
        borderRadius: 4,
        bgcolor: 'action.hover',
        color: 'text.disabled',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <ImageIcon fontSize="large" />
      <Typography variant="body2">No picture chosen</Typography>
    </Box>
  )
}

function Hero({ block, fill, ctx }) {
  const image = safeImage(block.image)
  const center = block.align === 'center'
  const large = block.height !== 'medium'
  const fee = ctx.monthlyFee != null ? formatMoney(ctx.monthlyFee, ctx.currency) : null
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        bgcolor: INK,
        minHeight: large ? { xs: 600, md: 'min(88vh, 820px)' } : { xs: 460, md: 560 },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Background picture (or gradient) */}
      {image ? (
        <Box
          component="img"
          src={image}
          alt=""
          fetchPriority="high"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            animation: `${slowZoom} 14s ease-out both`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      ) : (
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a237e 0%, #283593 45%, #00897b 100%)' }} />
      )}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: center
            ? `linear-gradient(180deg, ${alpha(INK, 0.55)} 0%, ${alpha(INK, 0.75)} 100%)`
            : `linear-gradient(90deg, ${alpha(INK, 0.92)} 0%, ${alpha(INK, 0.7)} 45%, ${alpha(INK, 0.2)} 100%)`,
        }}
      />
      {/* Soft glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          left: -160,
          bottom: -220,
          background: `radial-gradient(circle, ${alpha(ACCENT, 0.28)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 10, md: 12 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: 6,
            alignItems: 'center',
            gridTemplateColumns: { xs: '1fr', md: center ? '1fr' : '1.35fr 1fr' },
            textAlign: center ? 'center' : 'left',
          }}
        >
          <Box sx={{ maxWidth: center ? 820 : 680, mx: center ? 'auto' : 0 }}>
            {block.eyebrow && (
              <Box
                sx={{
                  ...reveal(0),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  mb: 3,
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  bgcolor: alpha('#fff', 0.1),
                  border: `1px solid ${alpha('#fff', 0.22)}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ACCENT, boxShadow: `0 0 12px ${ACCENT}` }} />
                {fill(block.eyebrow)}
              </Box>
            )}
            <Typography
              variant="h1"
              sx={{
                ...reveal(0.1),
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                fontSize: { xs: 42, sm: 54, md: 72 },
                mb: 3,
                textShadow: '0 2px 30px rgba(0,0,0,.25)',
              }}
            >
              {fill(block.title)}
            </Typography>
            {block.subtitle && (
              <Typography
                sx={{
                  ...reveal(0.2),
                  fontSize: { xs: 17, md: 20 },
                  lineHeight: 1.65,
                  color: alpha('#fff', 0.85),
                  mb: 5,
                  maxWidth: 600,
                  mx: center ? 'auto' : 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {fill(block.subtitle)}
              </Typography>
            )}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ ...reveal(0.3), justifyContent: center ? 'center' : 'flex-start' }}
            >
              <LinkButton
                text={fill(block.buttonText)}
                link={block.buttonLink}
                size="large"
                endIcon={<ArrowForward />}
                sx={primaryButton}
              />
              <LinkButton
                text={fill(block.secondaryButtonText)}
                link={block.secondaryButtonLink}
                size="large"
                variant="outlined"
                sx={{
                  ...pillButton,
                  color: '#fff',
                  borderColor: alpha('#fff', 0.5),
                  backdropFilter: 'blur(8px)',
                  bgcolor: alpha('#fff', 0.06),
                  '&:hover': { ...pillButton['&:hover'], borderColor: '#fff', bgcolor: alpha('#fff', 0.14) },
                }}
              />
            </Stack>
          </Box>

          {/* Floating glass card with the fee */}
          {!center && fee && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', ...reveal(0.45) }}>
              <Box
                sx={{
                  width: 300,
                  p: 3.5,
                  borderRadius: 5,
                  bgcolor: alpha('#fff', 0.1),
                  border: `1px solid ${alpha('#fff', 0.22)}`,
                  backdropFilter: 'blur(18px)',
                  boxShadow: '0 30px 60px rgba(0,0,0,.3)',
                  animation: `${float} 6s ease-in-out infinite`,
                  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                }}
              >
                <Typography sx={{ fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', color: alpha('#fff', 0.75) }}>
                  Monthly membership
                </Typography>
                <Typography sx={{ fontFamily: DISPLAY_FONT, fontSize: 46, fontWeight: 700, lineHeight: 1.2, my: 1 }}>
                  {fee}
                  <Box component="span" sx={{ fontFamily: 'inherit', fontSize: 16, fontWeight: 400, color: alpha('#fff', 0.7) }}>
                    {' '}
                    / month
                  </Box>
                </Typography>
                <Stack spacing={1.2} sx={{ mt: 2 }}>
                  {['Your own fixed seat', 'AC, Wi-Fi & charging', 'Pay online with UPI'].map((t) => (
                    <Stack key={t} direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                      <CheckCircle sx={{ fontSize: 18, color: ACCENT }} />
                      <Typography sx={{ fontSize: 15, color: alpha('#fff', 0.9) }}>{t}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Box>
          )}
        </Box>
      </Container>

      {/* Curved bottom edge */}
      <Box
        component="svg"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        aria-hidden
        sx={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: { xs: 30, md: 60 }, display: 'block' }}
      >
        <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="#ffffff" />
      </Box>
    </Box>
  )
}

function Features({ block, fill }) {
  const items = Array.isArray(block.items) ? block.items : []
  return (
    <Band background={block.background}>
      <SectionHeading title={fill(block.title)} subtitle={fill(block.subtitle)} />
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: GRID_COLUMNS(block.columns) }}>
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? EventSeat
          return (
            <Box
              key={i}
              sx={{
                position: 'relative',
                height: '100%',
                p: 3.5,
                borderRadius: 5,
                bgcolor: '#fff',
                border: '1px solid',
                borderColor: alpha(INK, 0.08),
                boxShadow: `0 1px 2px ${alpha(INK, 0.04)}`,
                transition: 'transform .3s, box-shadow .3s, border-color .3s',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: `0 24px 48px ${alpha(INK, 0.1)}`,
                  borderColor: alpha('#283593', 0.25),
                },
                '&:hover .feature-icon': { transform: 'rotate(-6deg) scale(1.08)' },
              }}
            >
              <Box
                className="feature-icon"
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3.5,
                  mb: 2.5,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #283593 0%, #00897b 100%)',
                  boxShadow: `0 10px 24px ${alpha('#283593', 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform .3s',
                }}
              >
                <Icon />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 18, color: INK, mb: 1 }}>{fill(item.title)}</Typography>
              {item.text && (
                <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                  {fill(item.text)}
                </Typography>
              )}
            </Box>
          )
        })}
      </Box>
    </Band>
  )
}

function TextBlock({ block, fill }) {
  const align = block.align === 'left' ? 'left' : 'center'
  return (
    <Band background={block.background}>
      <Box sx={{ maxWidth: 820, mx: align === 'center' ? 'auto' : 0, textAlign: align }}>
        {block.title && (
          <Box sx={{ mb: 3 }}>
            <Heading>{fill(block.title)}</Heading>
            <AccentBar center={align === 'center'} />
          </Box>
        )}
        <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', fontSize: 18, lineHeight: 1.85 }}>
          {fill(block.body)}
        </Typography>
      </Box>
    </Band>
  )
}

function ImageText({ block, fill }) {
  const image = safeImage(block.image)
  const imageRight = block.imagePosition === 'right'
  return (
    <Band background={block.background}>
      <Box
        sx={{
          display: 'grid',
          gap: { xs: 6, md: 10 },
          alignItems: 'center',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
        }}
      >
        <Box sx={{ order: { xs: 0, md: imageRight ? 2 : 0 }, position: 'relative', p: { xs: 1.5, md: 2.5 } }}>
          {/* Decorative offset frame */}
          <Box
            sx={{
              position: 'absolute',
              inset: { xs: '0 0 30px 30px', md: '0 0 50px 50px' },
              transform: imageRight ? 'translate(16px, 16px)' : 'translate(-16px, 16px)',
              borderRadius: 6,
              background: `linear-gradient(135deg, ${alpha(ACCENT, 0.5)}, ${alpha('#00897b', 0.35)})`,
            }}
          />
          {image ? (
            <Box
              component="img"
              src={image}
              alt={fill(block.title)}
              loading="lazy"
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: { xs: '4 / 3', md: '5 / 4' },
                objectFit: 'cover',
                borderRadius: 6,
                display: 'block',
                boxShadow: `0 30px 60px ${alpha(INK, 0.22)}`,
              }}
            />
          ) : (
            <Box sx={{ position: 'relative' }}>
              <ImagePlaceholder height={340} />
            </Box>
          )}
        </Box>
        <Box>
          {block.title && (
            <Box sx={{ mb: 3 }}>
              <Heading>{fill(block.title)}</Heading>
              <AccentBar />
            </Box>
          )}
          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', fontSize: 18, lineHeight: 1.85, mb: 4 }}>
            {fill(block.body)}
          </Typography>
          <LinkButton text={fill(block.buttonText)} link={block.buttonLink} size="large" endIcon={<ArrowForward />} sx={darkButton} />
        </Box>
      </Box>
    </Band>
  )
}

// Bento-style gallery: tall (portrait) photos span two rows, wide photos one.
function Gallery({ block, fill, preview }) {
  const images = (Array.isArray(block.images) ? block.images : []).filter((img) => safeImage(img.url))
  const [tall, setTall] = useState({})
  const [open, setOpen] = useState(null)
  if (!images.length && !preview) return null
  const cols = Math.min(Math.max(Number(block.columns) || 3, 2), 4)
  return (
    <Band background={block.background}>
      <SectionHeading title={fill(block.title)} subtitle={fill(block.subtitle)} />
      {images.length ? (
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 1.5, md: 2 },
            gridAutoFlow: 'dense',
            gridAutoRows: { xs: 160, sm: 200, md: 230 },
            gridTemplateColumns: { xs: '1fr 1fr', md: `repeat(${cols}, 1fr)` },
          }}
        >
          {images.map((img, i) => (
            <Box
              key={i}
              component="figure"
              onClick={() => setOpen(img)}
              sx={{
                m: 0,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 4,
                cursor: 'zoom-in',
                gridRow: tall[i] ? 'span 2' : 'span 1',
                bgcolor: alpha(INK, 0.05),
                '& img': { transition: 'transform .7s cubic-bezier(.2,.7,.2,1)' },
                '&:hover img': { transform: 'scale(1.07)' },
                '& .zoom': { opacity: 0, transition: 'opacity .3s' },
                '&:hover .zoom': { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={safeImage(img.url)}
                alt={img.caption || 'Library photo'}
                loading="lazy"
                onLoad={(e) => {
                  const isTall = e.currentTarget.naturalHeight > e.currentTarget.naturalWidth
                  setTall((t) => (t[i] === isTall ? t : { ...t, [i]: isTall }))
                }}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <Box
                className="zoom"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: alpha(INK, 0.35),
                  color: '#fff',
                }}
              >
                <ZoomIn fontSize="large" />
              </Box>
              {img.caption && (
                <Box
                  component="figcaption"
                  sx={{
                    position: 'absolute',
                    inset: 'auto 0 0 0',
                    p: 2,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    background: 'linear-gradient(transparent, rgba(0,0,0,.75))',
                  }}
                >
                  {fill(img.caption)}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <ImagePlaceholder height={200} />
      )}

      <Dialog
        open={!!open}
        onClose={() => setOpen(null)}
        maxWidth="lg"
        slotProps={{ paper: { sx: { bgcolor: 'transparent', boxShadow: 'none', m: 1, overflow: 'visible' } } }}
      >
        {open && (
          <Box sx={{ position: 'relative' }}>
            <IconButton
              aria-label="Close"
              onClick={() => setOpen(null)}
              sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', bgcolor: alpha('#000', 0.5), '&:hover': { bgcolor: alpha('#000', 0.7) } }}
            >
              <Close />
            </IconButton>
            <Box
              component="img"
              src={safeImage(open.url)}
              alt={open.caption || 'Library photo'}
              sx={{ display: 'block', maxWidth: '100%', maxHeight: '88vh', borderRadius: 3 }}
            />
            {open.caption && <Typography sx={{ color: '#fff', textAlign: 'center', mt: 1.5 }}>{fill(open.caption)}</Typography>}
          </Box>
        )}
      </Dialog>
    </Band>
  )
}

function Pricing({ block, fill, ctx }) {
  const points = String(block.points ?? '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)
  return (
    <Band background={block.background}>
      <Box sx={{ position: 'relative', maxWidth: 560, mx: 'auto' }}>
        {/* Glow behind the card */}
        <Box
          sx={{
            position: 'absolute',
            inset: '10% -10%',
            background: `radial-gradient(ellipse, ${alpha('#283593', 0.25)} 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            borderRadius: 6,
            overflow: 'hidden',
            bgcolor: '#fff',
            boxShadow: `0 40px 80px ${alpha(INK, 0.16)}`,
            textAlign: 'center',
          }}
        >
          <Box sx={{ px: { xs: 3, md: 5 }, pt: { xs: 4, md: 5 }, pb: 4, color: '#fff', background: `linear-gradient(135deg, ${INK} 0%, #283593 60%, #00897b 130%)` }}>
            <Box
              sx={{
                display: 'inline-block',
                px: 1.75,
                py: 0.5,
                mb: 2,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: INK,
                bgcolor: ACCENT,
              }}
            >
              All inclusive
            </Box>
            {block.title && (
              <Typography component="h2" sx={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: { xs: 26, md: 30 }, mb: 1 }}>
                {fill(block.title)}
              </Typography>
            )}
            <Typography sx={{ fontFamily: DISPLAY_FONT, fontSize: { xs: 52, md: 64 }, fontWeight: 700, lineHeight: 1.1 }}>
              {ctx.monthlyFee != null ? formatMoney(ctx.monthlyFee, ctx.currency) : '—'}
              <Box component="span" sx={{ fontFamily: 'inherit', fontSize: 18, fontWeight: 400, opacity: 0.75 }}>
                {' '}
                / month
              </Box>
            </Typography>
            {block.text && <Typography sx={{ mt: 1.5, opacity: 0.85, whiteSpace: 'pre-line' }}>{fill(block.text)}</Typography>}
          </Box>
          <Box sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
            {points.length > 0 && (
              <Stack spacing={1.75} sx={{ mb: 4, textAlign: 'left', maxWidth: 360, mx: 'auto' }}>
                {points.map((p, i) => (
                  <Stack key={i} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <CheckCircle sx={{ color: '#00897b' }} />
                    <Typography sx={{ fontSize: 16, color: INK }}>{fill(p)}</Typography>
                  </Stack>
                ))}
              </Stack>
            )}
            <LinkButton text={fill(block.buttonText)} link={block.buttonLink} size="large" fullWidth endIcon={<ArrowForward />} sx={darkButton} />
          </Box>
        </Box>
      </Box>
    </Band>
  )
}

function Faq({ block, fill }) {
  const items = Array.isArray(block.items) ? block.items : []
  return (
    <Band background={block.background}>
      <SectionHeading title={fill(block.title)} />
      <Stack spacing={1.5} sx={{ maxWidth: 820, mx: 'auto' }}>
        {items.map((item, i) => (
          <Accordion
            key={i}
            disableGutters
            elevation={0}
            sx={{
              borderRadius: '16px !important',
              border: '1px solid',
              borderColor: alpha(INK, 0.08),
              bgcolor: '#fff',
              overflow: 'hidden',
              '&:before': { display: 'none' },
              transition: 'box-shadow .3s',
              '&.Mui-expanded': { boxShadow: `0 16px 40px ${alpha(INK, 0.08)}` },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 3, py: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 17, color: INK }}>{fill(item.question)}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
              <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.75 }}>
                {fill(item.answer)}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Band>
  )
}

const CTA_COLORS = {
  primary: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
  secondary: 'linear-gradient(135deg, #004d40 0%, #00796b 50%, #26a69a 100%)',
  dark: `linear-gradient(135deg, ${INK} 0%, #1d2557 100%)`,
}

function Cta({ block, fill }) {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fff' }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: { xs: 5, md: 7 },
            px: { xs: 3, md: 8 },
            py: { xs: 7, md: 10 },
            textAlign: 'center',
            color: '#fff',
            background: CTA_COLORS[block.color] ?? CTA_COLORS.secondary,
            boxShadow: `0 40px 80px ${alpha(INK, 0.2)}`,
          }}
        >
          {/* Decorative circles */}
          {[
            { size: 340, top: -140, right: -100, a: 0.12 },
            { size: 220, bottom: -110, left: -60, a: 0.1 },
          ].map(({ size, a, ...pos }, i) => (
            <Box
              key={i}
              sx={{ position: 'absolute', width: size, height: size, borderRadius: '50%', border: `40px solid ${alpha('#fff', a)}`, ...pos }}
            />
          ))}
          <Box sx={{ position: 'relative' }}>
            <Heading light sx={{ mb: 2 }}>
              {fill(block.title)}
            </Heading>
            {block.text && (
              <Typography sx={{ opacity: 0.88, mb: 4.5, fontSize: { xs: 17, md: 19 }, whiteSpace: 'pre-line', maxWidth: 600, mx: 'auto' }}>
                {fill(block.text)}
              </Typography>
            )}
            <LinkButton text={fill(block.buttonText)} link={block.buttonLink} size="large" endIcon={<ArrowForward />} sx={primaryButton} />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

const RENDERERS = {
  hero: Hero,
  features: Features,
  text: TextBlock,
  imageText: ImageText,
  gallery: Gallery,
  pricing: Pricing,
  faq: Faq,
  cta: Cta,
}

// One block of the home page. ctx = { libraryName, monthlyFee, currency }.
// preview = true (builder) also shows empty blocks so the admin can see and select them.
export function HomeBlock({ block, ctx, preview = false }) {
  const fill = makeFill(ctx)
  const Renderer = RENDERERS[block?.type]
  return Renderer ? <Renderer block={block} fill={fill} ctx={ctx} preview={preview} /> : null
}

export default function HomeBlocks({ layout, ctx }) {
  return (layout?.blocks ?? []).map((block) => (
    <Box component="section" key={block.id} id={block.id} sx={{ scrollMarginTop: 72 }}>
      <HomeBlock block={block} ctx={ctx} />
    </Box>
  ))
}
