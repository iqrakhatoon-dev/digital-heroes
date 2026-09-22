import { useEffect, useState } from 'react'
import { supabaseAdmin as supabase } from '../../lib/supabaseAdmin'
import { Users, Trophy, Heart, TrendingUp, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, activeUsers: 0, pendingWinners: 0, charityTotal: 0, prizePool: 0, draws: 0 })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [usersRes, winnersRes, drawsRes, recentRes] = await Promise.all([
        supabase.from('profiles').select('subscription_status'),
        supabase.from('winners').select('verification_status, prize_amount').eq('verification_status', 'pending'),
        supabase.from('draws').select('prize_pool_total').eq('status', 'published'),
        supabase.from('profiles').select('id, full_name, email, subscription_status, created_at').order('created_at', { ascending: false }).limit(5),
      ])

      const allUsers = usersRes.data || []
      const activeUsers = allUsers.filter(u => u.subscription_status === 'active').length
      const totalPrizePool = (drawsRes.data || []).reduce((a, d) => a + (d.prize_pool_total || 0), 0)

      setStats({
        users: allUsers.length,
        activeUsers,
        pendingWinners: (winnersRes.data || []).length,
        prizePool: totalPrizePool,
        draws: (drawsRes.data || []).length,
        charityTotal: activeUsers * 9.99 * 0.1,
      })
      setRecentUsers(recentRes.data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const STAT_CARDS = [
    { label: 'Total members', value: stats.users, sub: `${stats.activeUsers} active`, icon: <Users size={16} />, color: 'text-white' },
    { label: 'Active subscribers', value: stats.activeUsers, sub: 'Current month', icon: <TrendingUp size={16} />, color: 'text-brand-mint' },
    { label: 'Pending verification', value: stats.pendingWinners, sub: 'Winners awaiting review', icon: <AlertCircle size={16} />, color: stats.pendingWinners > 0 ? 'text-yellow-400' : 'text-white' },
    { label: 'Charity raised', value: `£${stats.charityTotal.toFixed(0)}`, sub: 'This month (est.)', icon: <Heart size={16} />, color: 'text-brand-mint' },
    { label: 'Prize pool total', value: `£${stats.prizePool.toFixed(0)}`, sub: 'All published draws', icon: <Trophy size={16} />, color: 'text-brand-gold' },
    { label: 'Completed draws', value: stats.draws, sub: 'Published results', icon: <Trophy size={16} />, color: 'text-white' },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-brand-mint border-t-transparent rounded-full animate-spin" />
    </div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display text-white">Overview</h1>
        <p className="text-brand-muted text-sm mt-1">Platform at a glance.</p>
      </div>

      {stats.pendingWinners > 0 && (
        <Link to="/admin/winners" className="block mb-6 p-4 rounded-xl bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 text-yellow-400 text-sm flex items-center gap-2 hover:bg-opacity-20 transition-all">
          <AlertCircle size={15} />
          {stats.pendingWinners} winner{stats.pendingWinners > 1 ? 's' : ''} pending verification — review now
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, sub, icon, color }) => (
          <div key={label} className="card">
            <div className="text-brand-muted mb-2">{icon}</div>
            <p className={`font-display text-3xl ${color}`}>{value}</p>
            <p className="text-sm text-white font-medium mt-0.5">{label}</p>
            <p className="text-xs text-brand-muted mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">New members</h3>
            <Link to="/admin/users" className="text-xs text-brand-mint hover:underline">View all →</Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-brand-muted">No members yet.</p>
          ) : (
            <div className="space-y-2">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-white border-opacity-5 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-green flex items-center justify-center text-xs font-bold text-brand-mint">
                      {u.full_name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white">{u.full_name || '—'}</p>
                      <p className="text-xs text-brand-muted truncate max-w-[160px]">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    u.subscription_status === 'active' ? 'bg-brand-mint bg-opacity-20 text-brand-mint' : 'bg-white bg-opacity-5 text-brand-muted'
                  }`}>
                    {u.subscription_status || 'inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Quick actions</h3>
          <div className="space-y-2">
            {[
              { to: '/admin/draws', label: 'Run this month\'s draw', desc: 'Configure, simulate, and publish' },
              { to: '/admin/winners', label: 'Verify pending winners', desc: stats.pendingWinners > 0 ? `${stats.pendingWinners} awaiting review` : 'All up to date' },
              { to: '/admin/charities', label: 'Manage charities', desc: 'Add or update charity listings' },
              { to: '/admin/reports', label: 'View reports', desc: 'Subscription and contribution stats' },
            ].map(({ to, label, desc }) => (
              <Link key={to} to={to} className="block p-3 rounded-xl hover:bg-white hover:bg-opacity-[0.04] transition-all group">
                <p className="text-sm font-medium text-white group-hover:text-brand-mint transition-colors">{label}</p>
                <p className="text-xs text-brand-muted mt-0.5">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
