import { Box, Button, Typography } from '@mui/material'
import { Navigate, RouterProvider, createBrowserRouter, Link as RouterLink } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/PublicLayout'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MySeatPage from './pages/MySeatPage'
import SeatsPage from './pages/SeatsPage'
import BookingsPage from './pages/admin/BookingsPage'
import SectionDesignerPage from './pages/admin/SectionDesignerPage'
import SectionsPage from './pages/admin/SectionsPage'
import SettingsPage from './pages/admin/SettingsPage'
import StudentDetailPage from './pages/admin/StudentDetailPage'
import StudentsPage from './pages/admin/StudentsPage'

function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h4" gutterBottom>
        Page not found
      </Typography>
      <Button component={RouterLink} to="/">
        Go home
      </Button>
    </Box>
  )
}

// A data router is used so pages can block navigation with unsaved changes (useBlocker)
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/seats', element: <SeatsPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/checkout/:bookingId', element: <CheckoutPage /> },
          { path: '/my-seat', element: <MySeatPage /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute adminOnly />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/sections" replace /> },
          { path: 'sections', element: <SectionsPage /> },
          { path: 'sections/:id', element: <SectionDesignerPage /> },
          { path: 'bookings', element: <BookingsPage /> },
          { path: 'students', element: <StudentsPage /> },
          { path: 'students/:id', element: <StudentDetailPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
