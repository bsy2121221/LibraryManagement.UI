import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material'
import AcUnit from '@mui/icons-material/AcUnit'
import EventSeat from '@mui/icons-material/EventSeat'
import Wifi from '@mui/icons-material/Wifi'
import Shield from '@mui/icons-material/Shield'
import { Link as RouterLink } from 'react-router-dom'
import { usePublicSettings } from '../hooks/usePublicSettings'
import { formatMoney } from '../utils/format'

// Placeholder home page. In step 5 the admin designs this page (images, sections) with drag and drop
// and it will be rendered from the published layout instead.
const FEATURES = [
  { icon: <EventSeat fontSize="large" />, title: 'Your own seat', text: 'Pick a fixed seat that stays yours every month.' },
  { icon: <AcUnit fontSize="large" />, title: 'Comfortable', text: 'Air-conditioned, quiet and well lit study halls.' },
  { icon: <Wifi fontSize="large" />, title: 'High-speed Wi-Fi', text: 'Stay connected for online classes and research.' },
  { icon: <Shield fontSize="large" />, title: 'Separate sections', text: 'Dedicated sections for boys and girls.' },
]

export default function HomePage() {
  const { libraryName, monthlyFee, currency } = usePublicSettings()

  return (
    <>
      <Box
        sx={{
          color: '#fff',
          py: { xs: 10, md: 16 },
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 45%, #00897b 100%)',
        }}
      >
        <Container>
          <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>
            {libraryName}
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: 36, md: 56 } }}>
            A calm place to focus
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, maxWidth: 620, fontWeight: 400 }}>
            Book your seat in our study library in a minute. See which seats are free and reserve yours online
            {monthlyFee ? ` for just ${formatMoney(monthlyFee, currency)} a month` : ''}.
          </Typography>
          <Button component={RouterLink} to="/seats" size="large" variant="contained" color="secondary">
            See available seats
          </Button>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
          {FEATURES.map((feature) => (
            <Card key={feature.title} variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Box sx={{ color: 'primary.main' }}>{feature.icon}</Box>
                  <Typography variant="h6">{feature.title}</Typography>
                  <Typography color="text.secondary">{feature.text}</Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </>
  )
}
