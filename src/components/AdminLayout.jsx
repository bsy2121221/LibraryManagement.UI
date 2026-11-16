import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import EventSeat from '@mui/icons-material/EventSeat'
import Home from '@mui/icons-material/Home'
import Web from '@mui/icons-material/Web'
import Logout from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import People from '@mui/icons-material/People'
import School from '@mui/icons-material/School'
import Settings from '@mui/icons-material/Settings'
import Payments from '@mui/icons-material/Payments'
import Sms from '@mui/icons-material/Sms'
import NotificationsActive from '@mui/icons-material/NotificationsActive'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
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
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            sx={{ '&.active': { bgcolor: 'action.selected' } }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        <ListItemButton component={NavLink} to="/" end onClick={() => setMobileOpen(false)}>
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="View website" />
        </ListItemButton>
      </List>
    </>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, minWidth: 0 }} noWrap>
            Library Admin
          </Typography>
          <Typography variant="body2" sx={{ mr: { xs: 0, sm: 2 }, display: { xs: 'none', sm: 'block' } }} noWrap>
            {user?.fullName}
          </Typography>
          {isMobile ? (
            <IconButton color="inherit" aria-label="Log out" onClick={handleLogout}>
              <Logout />
            </IconButton>
          ) : (
            <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
              Log out
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, minWidth: 0, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
