import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, Shuffle, Heart, Trophy, BarChart2,
  ChevronRight, LogOut, Menu, X
} from 'lucide-react'

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/draws', label: 'Draws', icon: Shuffle },
  { to: '/admin/charities', label: 'Charities', icon: Heart },
  { to: '/admin/winners', label: 'Winners', icon: Trophy },
  { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
]

export default function AdminLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (nav) => nav.exact
    ? location.pathname === nav.to
    : location.pathname.startsWith(nav.to) && nav.to !== '/admin'

  return (
    <div className="pt-16 flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 z-40 w-56 bg-brand-black border-r border-white border-opacity-[0.06]
        flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-white border-opacity-5">
          <div className="text-[10px] text-brand-muted tracking-widest uppercase font-semibold">Admin Panel</div>
          <div className="text-sm text-white font-medium mt-0.5 truncate">{profile?.full_name || 'Administrator'}</div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                isActive({ to, exact })
                  ? 'bg-brand-mint bg-opacity-10 text-brand-mint'
                  : 'text-brand-muted hover:text-white hover:bg-white hover:bg-opacity-[0.04]'
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
              {isActive({ to, exact }) && <ChevronRight size={12} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white border-opacity-5">
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-brand-muted hover:text-red-400 hover:bg-red-500 hover:bg-opacity-10 transition-all w-full"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed bottom-5 right-5 z-50 w-12 h-12 bg-brand-mint rounded-full flex items-center justify-center shadow-xl text-brand-black"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Main content */}
      <main className="flex-1 md:ml-56 p-4 sm:p-8 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
