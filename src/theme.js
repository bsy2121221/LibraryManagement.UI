import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#283593' },
    secondary: { main: '#00897b' },
    background: { default: '#f6f7fb' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
})
