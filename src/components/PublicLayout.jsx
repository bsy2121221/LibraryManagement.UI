import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle'
import Close from '@mui/icons-material/Close'
import GetApp from '@mui/icons-material/GetApp'
import LocalLibrary from '@mui/icons-material/LocalLibrary'
import MenuIcon from '@mui/icons-material/Menu'
import { useEffect, useState } from 'react'
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { usePublicSettings } from '../hooks/usePublicSettings'
import { usePwaInstall } from '../hooks/usePwaInstall'
import SiteFooter from './SiteFooter'

const DRAWER_WIDTH = 280

// Navbar + page content + fixed footer for everything visitors and students see
export default function PublicLayout() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { libraryName } = usePublicSettings()
  const { canInstall, install } = usePwaInstall()

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    setMenuAnchor(null)
    setDrawerOpen(false)
    await logout()
    navigate('/')
  }

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/seats', label: 'Available seats' },
    ...(isLoggedIn && !isAdmin ? [{ to: '/my-seat', label: 'My seat' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  const brand = (
    <>
      <LocalLibrary color="primary" sx={{ mr: 1, flexShrink: 0 }} />
      <Typography
        variant="h6"
        component={RouterLink}
        to="/"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          color: 'text.primary',
          textDecoration: 'none',
          fontWeight: 700,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {libraryName}
      </Typography>
    </>
  )

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 0.5, minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" aria-label="Open menu" onClick={() => setDrawerOpen(true)} sx={{ mr: 0.5 }}>
              <MenuIcon />
            </IconButton>
          )}

          {brand}

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              {navItems.map((item) => (
                <Button key={item.to} component={RouterLink} to={item.to} color="inherit">
                  {item.label}
                </Button>
              ))}
              {canInstall && (
                <Button color="inherit" startIcon={<GetApp />} onClick={install}>
                  Install app
                </Button>
              )}
              {isLoggedIn ? (
                <>
                  <IconButton color="primary" onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Account">
                    <AccountCircle />
                  </IconButton>
                  <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                    <MenuItem disabled>
                      {user.fullName} ({user.mobile})
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Log out</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button component={RouterLink} to="/login" variant="contained" sx={{ ml: 1 }}>
                  Log in
                </Button>
              )}
            </Box>
          )}

          {isMobile && isLoggedIn && (
            <IconButton color="primary" onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Account">
              <AccountCircle />
            </IconButton>
          )}
          {isMobile && isLoggedIn && (
            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
              <MenuItem disabled>
                {user.fullName} ({user.mobile})
              </MenuItem>
              <MenuItem onClick={handleLogout}>Log out</MenuItem>
            </Menu>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, gap: 1 }}>
          <LocalLibrary color="primary" />
          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 700, minWidth: 0 }} noWrap>
            {libraryName}
          </Typography>
          <IconButton aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ py: 1 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={location.pathname === item.to}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {canInstall && (
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={async () => {
                await install()
                setDrawerOpen(false)
              }}
            >
              Install app
            </Button>
          )}
          {!isLoggedIn && (
            <Button component={RouterLink} to="/login" variant="contained" onClick={() => setDrawerOpen(false)}>
              Log in
            </Button>
          )}
          {isLoggedIn && (
            <Button color="inherit" onClick={handleLogout}>
              Log out
            </Button>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: '100%', overflowX: 'hidden' }}>
        <Outlet />
      </Box>

      <SiteFooter />
    </Box>
  )
}
