import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, Trophy, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, profile, isAdmin, isSubscribed, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white border-opacity-[0.06]"
      style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-brand-mint flex items-center justify-center">
            <Trophy size={14} className="text-brand-black" />
          </div>
          <span className="font-display text-lg text-white">
            digital.<span className="text-brand-mint">HEROES</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-brand-muted">
          <Link to="/charities" className={`hover:text-white transition-colors ${isActive('/charities') ? 'text-white' : ''}`}>
            Give Back
          </Link>
          <Link to="/how-it-works" className={`hover:text-white transition-colors ${isActive('/how-it-works') ? 'text-white' : ''}`}>
            How It Works
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-brand-gold hover:text-brand-mint transition-colors font-medium">
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm text-brand-cream hover:text-white transition-colors py-1.5 px-3 rounded-full border border-white border-opacity-10 hover:border-opacity-20"
              >
                <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center text-xs font-semibold text-brand-mint">
                  {profile?.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <span>{profile?.full_name?.split(' ')[0] || 'Account'}</span>
                <ChevronDown size={12} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-10 w-48 bg-brand-slate rounded-xl border border-white border-opacity-10 shadow-2xl overflow-hidden"
                  onMouseLeave={() => setDropdownOpen(false)}>
                  <div className="px-3 py-2 border-b border-white border-opacity-5">
                    <p className="text-xs text-brand-muted truncate">{user.email}</p>
                    {isSubscribed ? (
                      <span className="text-[10px] text-brand-mint font-medium">Active member</span>
                    ) : (
                      <span className="text-[10px] text-yellow-500 font-medium">No active subscription</span>
                    )}
                  </div>
                  <Link to="/dashboard" className="block px-3 py-2.5 text-sm hover:bg-white hover:bg-opacity-5 transition-colors"
                    onClick={() => setDropdownOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/settings" className="block px-3 py-2.5 text-sm hover:bg-white hover:bg-opacity-5 transition-colors"
                    onClick={() => setDropdownOpen(false)}>
                    Settings
                  </Link>
                  <button onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-white hover:bg-opacity-5 transition-colors border-t border-white border-opacity-5">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm text-brand-muted hover:text-white transition-colors px-3 py-1.5">
                Sign in
              </Link>
              <Link to="/subscribe" className="btn-primary text-sm py-2">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-brand-muted hover:text-white">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white border-opacity-5 bg-brand-black px-4 py-4 space-y-1">
          <Link to="/charities" onClick={() => setMenuOpen(false)}
            className="block py-2.5 text-sm text-brand-muted hover:text-white">Give Back</Link>
          <Link to="/how-it-works" onClick={() => setMenuOpen(false)}
            className="block py-2.5 text-sm text-brand-muted hover:text-white">How It Works</Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-sm text-brand-gold">Admin</Link>
          )}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm text-brand-cream">Dashboard</Link>
              <button onClick={() => { handleSignOut(); setMenuOpen(false) }}
                className="block py-2.5 text-sm text-red-400">Sign out</button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="btn-outline text-center text-sm py-2.5">Sign in</Link>
              <Link to="/subscribe" onClick={() => setMenuOpen(false)}
                className="btn-primary text-center text-sm py-2.5">Get started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
