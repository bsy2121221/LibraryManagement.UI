import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import AcUnit from '@mui/icons-material/AcUnit'
import CheckCircle from '@mui/icons-material/CheckCircle'
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

const BACKGROUNDS = { white: 'background.paper', light: 'background.default', tint: '#eef1fb' }
const GRID_COLUMNS = (n) => ({ xs: '1fr', sm: '1fr 1fr', md: `repeat(${Math.min(Math.max(Number(n) || 3, 1), 4)}, 1fr)` })

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
  return target.internal ? (
    <Button component={RouterLink} to={target.href} {...props}>
      {text}
    </Button>
  ) : (
    <Button component="a" href={target.href} target={target.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" {...props}>
      {text}
    </Button>
  )
}

function SectionHeading({ title, subtitle, align = 'center' }) {
  if (!title && !subtitle) return null
  return (
    <Box sx={{ textAlign: align, mb: 5, maxWidth: align === 'center' ? 720 : 'none', mx: align === 'center' ? 'auto' : 0 }}>
      {title && (
        <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: subtitle ? 1.5 : 0, fontSize: { xs: 26, md: 34 } }}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', fontSize: 17 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}

function Band({ background, children, py = { xs: 7, md: 10 } }) {
  return (
    <Box sx={{ bgcolor: BACKGROUNDS[background] ?? BACKGROUNDS.white, py }}>
      <Container>{children}</Container>
    </Box>
  )
}

function ImagePlaceholder({ height = 260 }) {
  return (
    <Box
      sx={{
        height,
        borderRadius: 2,
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

function Hero({ block, fill }) {
  const image = safeImage(block.image)
  const center = block.align === 'center'
  return (
    <Box
      sx={{
        color: '#fff',
        py: block.height === 'medium' ? { xs: 8, md: 11 } : { xs: 10, md: 16 },
        background: image ? undefined : 'linear-gradient(135deg, #1a237e 0%, #283593 45%, #00897b 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      // Inline style (not a stylesheet rule), so a URL cannot inject CSS
      style={image ? { backgroundImage: `linear-gradient(rgba(12,18,60,.72), rgba(12,18,60,.55)), url(${JSON.stringify(image)})` } : undefined}
    >
      <Container sx={{ textAlign: center ? 'center' : 'left' }}>
        {block.eyebrow && (
          <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2, display: 'block' }}>
            {fill(block.eyebrow)}
          </Typography>
        )}
        <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: 34, md: 56 } }}>
          {fill(block.title)}
        </Typography>
        {block.subtitle && (
          <Typography
            variant="h6"
            sx={{ opacity: 0.92, mb: 4, maxWidth: 640, mx: center ? 'auto' : 0, fontWeight: 400, whiteSpace: 'pre-line' }}
          >
            {fill(block.subtitle)}
          </Typography>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: center ? 'center' : 'flex-start' }}>
          <LinkButton text={fill(block.buttonText)} link={block.buttonLink} size="large" variant="contained" color="secondary" />
          <LinkButton
            text={fill(block.secondaryButtonText)}
            link={block.secondaryButtonLink}
            size="large"
            variant="outlined"
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,.7)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,.08)' } }}
          />
        </Stack>
      </Container>
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
            <Card key={i} variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      bgcolor: '#eef1fb',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon fontSize="medium" />
                  </Box>
                  <Typography variant="h6">{fill(item.title)}</Typography>
                  {item.text && (
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      {fill(item.text)}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
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
          <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: 26, md: 34 } }}>
            {fill(block.title)}
          </Typography>
        )}
        <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', fontSize: 17, lineHeight: 1.8 }}>
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
      <Box sx={{ display: 'grid', gap: { xs: 4, md: 8 }, alignItems: 'center', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Box sx={{ order: { xs: 0, md: imageRight ? 2 : 0 } }}>
          {image ? (
            <Box
              component="img"
              src={image}
              alt={fill(block.title)}
              loading="lazy"
              sx={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 3, display: 'block', boxShadow: 3 }}
            />
          ) : (
            <ImagePlaceholder height={320} />
          )}
        </Box>
        <Box>
          {block.title && (
            <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: 26, md: 34 } }}>
              {fill(block.title)}
            </Typography>
          )}
          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', fontSize: 17, lineHeight: 1.8, mb: 3 }}>
            {fill(block.body)}
          </Typography>
          <LinkButton text={fill(block.buttonText)} link={block.buttonLink} variant="contained" size="large" />
        </Box>
      </Box>
    </Band>
  )
}

function Gallery({ block, fill, preview }) {
  const images = (Array.isArray(block.images) ? block.images : []).filter((img) => safeImage(img.url))
  if (!images.length && !preview) return null
  return (
    <Band background={block.background}>
      <SectionHeading title={fill(block.title)} subtitle={fill(block.subtitle)} />
      {images.length ? (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: GRID_COLUMNS(block.columns) }}>
          {images.map((img, i) => (
            <Box key={i} component="figure" sx={{ m: 0, position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
              <Box
                component="img"
                src={safeImage(img.url)}
                alt={img.caption || ''}
                loading="lazy"
                sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }}
              />
              {img.caption && (
                <Box
                  component="figcaption"
                  sx={{
                    position: 'absolute',
                    inset: 'auto 0 0 0',
                    p: 1.5,
                    color: '#fff',
                    fontSize: 14,
                    background: 'linear-gradient(transparent, rgba(0,0,0,.7))',
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
      <Paper variant="outlined" sx={{ maxWidth: 520, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center', borderRadius: 4 }}>
        {block.title && (
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 1 }}>
            {fill(block.title)}
          </Typography>
        )}
        <Typography sx={{ fontSize: 48, fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
          {ctx.monthlyFee != null ? formatMoney(ctx.monthlyFee, ctx.currency) : '—'}
          <Typography component="span" color="text.secondary" sx={{ fontSize: 18, fontWeight: 500 }}>
            {' '}
            / month
          </Typography>
        </Typography>
        {block.text && (
          <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
            {fill(block.text)}
          </Typography>
        )}
        {points.length > 0 && (
          <Stack spacing={1.2} sx={{ my: 3, textAlign: 'left', display: 'inline-flex' }}>
            {points.map((p, i) => (
              <Stack key={i} direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                <CheckCircle color="secondary" fontSize="small" />
                <Typography>{fill(p)}</Typography>
              </Stack>
            ))}
          </Stack>
        )}
        <Box>
          <LinkButton text={fill(block.buttonText)} link={block.buttonLink} variant="contained" size="large" fullWidth />
        </Box>
      </Paper>
    </Band>
  )
}

function Faq({ block, fill }) {
  const items = Array.isArray(block.items) ? block.items : []
  return (
    <Band background={block.background}>
      <SectionHeading title={fill(block.title)} />
      <Box sx={{ maxWidth: 820, mx: 'auto' }}>
        {items.map((item, i) => (
          <Accordion key={i} disableGutters variant="outlined" sx={{ '&:not(:last-of-type)': { borderBottom: 0 } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ fontWeight: 600 }}>{fill(item.question)}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {fill(item.answer)}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Band>
  )
}

const CTA_COLORS = {
  primary: 'linear-gradient(135deg, #1a237e, #283593)',
  secondary: 'linear-gradient(135deg, #00695c, #00897b)',
  dark: 'linear-gradient(135deg, #111526, #2a2f45)',
}

function Cta({ block, fill }) {
  return (
    <Box sx={{ background: CTA_COLORS[block.color] ?? CTA_COLORS.secondary, color: '#fff', py: { xs: 7, md: 9 } }}>
      <Container sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: 26, md: 36 } }}>
          {fill(block.title)}
        </Typography>
        {block.text && (
          <Typography sx={{ opacity: 0.9, mb: 3.5, fontSize: 18, whiteSpace: 'pre-line' }}>{fill(block.text)}</Typography>
        )}
        <LinkButton
          text={fill(block.buttonText)}
          link={block.buttonLink}
          variant="contained"
          size="large"
          sx={{ bgcolor: '#fff', color: 'text.primary', '&:hover': { bgcolor: 'grey.100' } }}
        />
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
  return (layout?.blocks ?? []).map((block) => <HomeBlock key={block.id} block={block} ctx={ctx} />)
}
