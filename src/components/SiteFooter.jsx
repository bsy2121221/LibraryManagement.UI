import { Box, Button, Container, Divider, IconButton, Link, Stack, Typography } from '@mui/material'
import AccessTime from '@mui/icons-material/AccessTime'
import Email from '@mui/icons-material/Email'
import Facebook from '@mui/icons-material/Facebook'
import Instagram from '@mui/icons-material/Instagram'
import LocalLibrary from '@mui/icons-material/LocalLibrary'
import Phone from '@mui/icons-material/Phone'
import Place from '@mui/icons-material/Place'
import WhatsApp from '@mui/icons-material/WhatsApp'
import YouTube from '@mui/icons-material/YouTube'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { usePublicSettings } from '../hooks/usePublicSettings'

const CURRENT_YEAR = new Date().getFullYear()

const FOOTER_BG = '#141a46'
const MUTED = 'rgba(255,255,255,0.72)'

function ColumnTitle({ children }) {
  return (
    <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', mb: 2 }}>
      {children}
    </Typography>
  )
}

function InfoRow({ icon, children }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', color: MUTED }}>
      <Box sx={{ mt: '2px', color: 'secondary.light', display: 'flex' }}>{icon}</Box>
      <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
        {children}
      </Typography>
    </Stack>
  )
}

const linkSx = { color: MUTED, textDecoration: 'none', '&:hover': { color: '#fff', textDecoration: 'underline' } }

// The website footer. Its design is FIXED - the admin cannot rearrange it in the home page builder.
// Only the details (address, phone, hours, social links) come from Settings -> "Website footer";
// anything left empty is simply not shown.
export default function SiteFooter() {
  const { libraryName, footer = {} } = usePublicSettings()
  const { isLoggedIn, isAdmin } = useAuth()

  const phoneHref = footer.phone ? `tel:${footer.phone.replace(/[^\d+]/g, '')}` : null
  const whatsAppHref = footer.whatsAppNumber ? `https://wa.me/${footer.whatsAppNumber.replace(/\D/g, '')}` : null

  const socials = [
    { url: footer.instagramUrl, icon: <Instagram />, label: 'Instagram' },
    { url: footer.facebookUrl, icon: <Facebook />, label: 'Facebook' },
    { url: footer.youTubeUrl, icon: <YouTube />, label: 'YouTube' },
    { url: whatsAppHref, icon: <WhatsApp />, label: 'WhatsApp' },
  ].filter((s) => s.url)

  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/seats', label: 'Available seats' },
    ...(isAdmin
      ? [{ to: '/admin', label: 'Admin' }]
      : isLoggedIn
        ? [{ to: '/my-seat', label: 'My seat & fees' }]
        : [
            { to: '/login', label: 'Log in' },
            { to: '/register', label: 'Create account' },
          ]),
  ]

  const hasContact = footer.address || footer.phone || footer.email || footer.whatsAppNumber

  return (
    <Box component="footer" sx={{ bgcolor: FOOTER_BG, color: '#fff', mt: 'auto' }}>
      <Container sx={{ py: { xs: 5, md: 7 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 4, md: 5 },
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.4fr 1fr 1.3fr 1.1fr' },
          }}
        >
          {/* About */}
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
              <LocalLibrary sx={{ color: 'secondary.light' }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {libraryName}
              </Typography>
            </Stack>
            {footer.about && (
              <Typography variant="body2" sx={{ color: MUTED, mb: 2, maxWidth: 320 }}>
                {footer.about}
              </Typography>
            )}
            {socials.length > 0 && (
              <Stack direction="row" spacing={1}>
                {socials.map((s) => (
                  <IconButton
                    key={s.label}
                    component="a"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    size="small"
                    sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'secondary.main' } }}
                  >
                    {s.icon}
                  </IconButton>
                ))}
              </Stack>
            )}
          </Box>

          {/* Quick links */}
          <Box>
            <ColumnTitle>Quick links</ColumnTitle>
            <Stack spacing={1.2}>
              {quickLinks.map((l) => (
                <Link key={l.to} component={RouterLink} to={l.to} variant="body2" sx={linkSx}>
                  {l.label}
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Contact */}
          <Box>
            <ColumnTitle>Contact us</ColumnTitle>
            {hasContact ? (
              <Stack spacing={1.5}>
                {footer.address && (
                  <InfoRow icon={<Place fontSize="small" />}>
                    {footer.address}
                    {footer.googleMapsUrl && (
                      <>
                        {' '}
                        <Link href={footer.googleMapsUrl} target="_blank" rel="noopener noreferrer" sx={{ ...linkSx, color: 'secondary.light' }}>
                          View on map
                        </Link>
                      </>
                    )}
                  </InfoRow>
                )}
                {footer.phone && (
                  <InfoRow icon={<Phone fontSize="small" />}>
                    <Link href={phoneHref} sx={linkSx}>
                      {footer.phone}
                    </Link>
                  </InfoRow>
                )}
                {footer.whatsAppNumber && (
                  <InfoRow icon={<WhatsApp fontSize="small" />}>
                    <Link href={whatsAppHref} target="_blank" rel="noopener noreferrer" sx={linkSx}>
                      Chat on WhatsApp
                    </Link>
                  </InfoRow>
                )}
                {footer.email && (
                  <InfoRow icon={<Email fontSize="small" />}>
                    <Link href={`mailto:${footer.email}`} sx={linkSx}>
                      {footer.email}
                    </Link>
                  </InfoRow>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: MUTED }}>
                Visit us at the library desk.
              </Typography>
            )}
          </Box>

          {/* Hours + call to action */}
          <Box>
            <ColumnTitle>Opening hours</ColumnTitle>
            <Stack spacing={2}>
              <InfoRow icon={<AccessTime fontSize="small" />}>{footer.openingHours || 'Open every day'}</InfoRow>
              <Box>
                <Button component={RouterLink} to="/seats" variant="contained" color="secondary">
                  Book your seat
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Container>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <Container sx={{ py: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', color: MUTED }}>
          <Typography variant="body2">
            © {CURRENT_YEAR} {libraryName}. All rights reserved.
          </Typography>
          {footer.googleMapsUrl && !footer.address && (
            <Link href={footer.googleMapsUrl} target="_blank" rel="noopener noreferrer" variant="body2" sx={linkSx}>
              Find us on Google Maps
            </Link>
          )}
        </Stack>
      </Container>
    </Box>
  )
}
