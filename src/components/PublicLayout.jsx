import { AppBar, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle'
import LocalLibrary from '@mui/icons-material/LocalLibrary'
import { useState } from 'react'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { usePublicSettings } from '../hooks/usePublicSettings'

const CURRENT_YEAR = new Date().getFullYear()

// Navbar + page content for everything visitors and students see
export default function PublicLayout() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAnchor, setMenuAnchor] = useState(null)
  const { libraryName } = usePublicSettings()

  const handleLogout = async () => {
    setMenuAnchor(null)
    await logout()
    navigate('/')
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <LocalLibrary color="primary" sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, color: 'text.primary', textDecoration: 'none', fontWeight: 700 }}
          >
            {libraryName}
          </Typography>

          <Button component={RouterLink} to="/" color="inherit">
            Home
          </Button>
          <Button component={RouterLink} to="/seats" color="inherit">
            Available seats
          </Button>
          {isLoggedIn && !isAdmin && (
            <Button component={RouterLink} to="/my-seat" color="inherit">
              My seat
            </Button>
          )}
          {isAdmin && (
            <Button component={RouterLink} to="/admin" color="inherit">
              Admin
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
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ py: 3, borderTop: 1, borderColor: 'divider' }}>
        <Container>
          <Typography variant="body2" color="text.secondary" align="center">
            © {CURRENT_YEAR} {libraryName}
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
