import { Box, Button, Tab, Tabs, Typography } from '@mui/material'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import EventMessagesTab from './EventMessagesTab'
import ReminderRulesTab from './ReminderRulesTab'

// Which messages students get (per event) and when fee reminders go out
export default function NotificationSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'reminders' ? 1 : 0

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Message settings
          </Typography>
          <Typography color="text.secondary">SMS, WhatsApp, email and phone call messages to students.</Typography>
        </Box>
        <Button component={RouterLink} to="/admin/messages">
          View sent messages
        </Button>
      </Box>
      <Tabs value={tab} onChange={(_, value) => setSearchParams(value === 1 ? { tab: 'reminders' } : {})} sx={{ mb: 3 }}>
        <Tab label="Event messages" />
        <Tab label="Fee reminders" />
      </Tabs>
      {tab === 0 ? <EventMessagesTab /> : <ReminderRulesTab />}
    </>
  )
}
