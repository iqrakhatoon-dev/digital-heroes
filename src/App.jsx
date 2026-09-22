import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Public pages
import Home from './pages/Home'
import Login from './pages/Login'
import Subscribe from './pages/Subscribe'
import Charities from './pages/Charities'
import HowItWorks from './pages/HowItWorks'
import NotFound from './pages/NotFound'

// User pages
import Dashboard from './pages/user/Dashboard'
import Settings from './pages/user/Settings'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminUsers from './pages/admin/AdminUsers'
import AdminDraws from './pages/admin/AdminDraws'
import AdminCharities from './pages/admin/AdminCharities'
import AdminWinners from './pages/admin/AdminWinners'
import AdminReports from './pages/admin/AdminReports'

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A3A2A',
              color: '#F5F0E8',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#4ECBA0', secondary: '#0A0A0A' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#0A0A0A' } },
          }}
        />

        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/subscribe" element={<PublicLayout><Subscribe /></PublicLayout>} />
          <Route path="/charities" element={<PublicLayout><Charities /></PublicLayout>} />
          <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />

          <Route path="/dashboard" element={
            <ProtectedRoute><PublicLayout><Dashboard /></PublicLayout></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><PublicLayout><Settings /></PublicLayout></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="draws" element={<AdminDraws />} />
            <Route path="charities" element={<AdminCharities />} />
            <Route path="winners" element={<AdminWinners />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
