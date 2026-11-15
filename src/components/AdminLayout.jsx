import {
  AppBar,
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import EventSeat from '@mui/icons-material/EventSeat'
import Home from '@mui/icons-material/Home'
import Web from '@mui/icons-material/Web'
import Logout from '@mui/icons-material/Logout'
import People from '@mui/icons-material/People'
import School from '@mui/icons-material/School'
import Settings from '@mui/icons-material/Settings'
import Payments from '@mui/icons-material/Payments'
import Sms from '@mui/icons-material/Sms'
import NotificationsActive from '@mui/icons-material/NotificationsActive'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const DRAWER_WIDTH = 230

// Menu entries for the admin area
const NAV_ITEMS = [
  { to: '/admin/sections', label: 'Sections & seats', icon: <EventSeat /> },
  { to: '/admin/bookings', label: 'Students on seats', icon: <People /> },
  { to: '/admin/students', label: 'Students', icon: <School /> },
  { to: '/admin/fees', label: 'Fees', icon: <Payments /> },
  { to: '/admin/messages', label: 'Messages', icon: <Sms /> },
  { to: '/admin/notification-settings', label: 'Message settings', icon: <NotificationsActive /> },
  { to: '/admin/home-page', label: 'Home page', icon: <Web /> },
  { to: '/admin/settings', label: 'Settings', icon: <Settings /> },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Library Admin
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.fullName}
          </Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItemButton key={item.to} component={NavLink} to={item.to} sx={{ '&.active': { bgcolor: 'action.selected' } }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
          <ListItemButton component={NavLink} to="/" end>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="View website" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
