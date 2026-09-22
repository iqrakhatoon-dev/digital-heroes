import { Link } from 'react-router-dom'
import { Trophy, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white border-opacity-[0.06] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-mint flex items-center justify-center">
                <Trophy size={14} className="text-brand-black" />
              </div>
              <span className="font-display text-lg text-white">
                digital.<span className="text-brand-mint">HEROES</span>
              </span>
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed max-w-xs">
              A platform where your golf performance helps causes that matter. Play, give, and win — every month.
            </p>
            <p className="text-brand-muted text-xs mt-4 flex items-center gap-1">
              Built with <Heart size={10} className="text-brand-mint" /> for a better game
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-brand-muted tracking-widest uppercase mb-4">Platform</p>
            <ul className="space-y-2">
              {[
                { to: '/how-it-works', label: 'How it works' },
                { to: '/charities', label: 'Charities' },
                { to: '/subscribe', label: 'Subscribe' },
                { to: '/dashboard', label: 'Dashboard' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-brand-muted hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-brand-muted tracking-widest uppercase mb-4">Legal</p>
            <ul className="space-y-2">
              {[
                { to: '/privacy', label: 'Privacy policy' },
                { to: '/terms', label: 'Terms of use' },
                { to: '/cookies', label: 'Cookie policy' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-brand-muted hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white border-opacity-5 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-brand-muted">© 2026 Digital Heroes · digitalheroes.co.in</p>
          <p className="text-xs text-brand-muted">Powered by Stripe · Supabase</p>
        </div>
      </div>
    </footer>
  )
}
