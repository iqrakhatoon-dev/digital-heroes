import { useEffect, useState } from 'react'
import { supabaseAdmin as supabase } from '../../lib/supabaseAdmin'
import { TrendingUp, Users, Heart, Trophy, DollarSign } from 'lucide-react'

export default function AdminReports() {
  const [data, setData] = useState({
    totalUsers: 0, activeUsers: 0, inactiveUsers: 0,
    totalPrizePool: 0, totalPaid: 0, pendingPayouts: 0,
    charityTotal: 0,
    drawStats: [],
    planBreakdown: { monthly: 0, yearly: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [usersRes, winnersRes, drawsRes, contribRes] = await Promise.all([
        supabase.from('profiles').select('subscription_status, subscription_plan, charity_percentage'),
        supabase.from('winners').select('prize_amount, payment_status, verification_status'),
        supabase.from('draws').select('draw_month, prize_pool_total, participant_count, draw_type').eq('status', 'published'),
        supabase.from('charity_contributions').select('amount'),
      ])

      const users = usersRes.data || []
      const winners = winnersRes.data || []
      const draws = drawsRes.data || []
      const contribs = contribRes.data || []

      const active = users.filter(u => u.subscription_status === 'active')
      const monthly = active.filter(u => u.subscription_plan === 'monthly').length
      const yearly = active.filter(u => u.subscription_plan === 'yearly').length

      const totalPrizePool = draws.reduce((a, d) => a + (d.prize_pool_total || 0), 0)
      const totalPaid = winners.filter(w => w.payment_status === 'paid').reduce((a, w) => a + (w.prize_amount || 0), 0)
      const pendingPayouts = winners.filter(w => w.verification_status === 'approved' && w.payment_status === 'pending')
        .reduce((a, w) => a + (w.prize_amount || 0), 0)
      const charityTotal = contribs.reduce((a, c) => a + (c.amount || 0), 0)

      setData({
        totalUsers: users.length,
        activeUsers: active.length,
        inactiveUsers: users.length - active.length,
        totalPrizePool, totalPaid, pendingPayouts, charityTotal,
        drawStats: draws,
        planBreakdown: { monthly, yearly },
      })
      setLoading(false)
    }
    fetch()
  }, [])

  const METRIC_ROWS = [
    {
      section: 'Subscribers',
      icon: <Users size={15} />,
      rows: [
        { label: 'Total members', value: data.totalUsers },
        { label: 'Active subscribers', value: data.activeUsers, highlight: true },
        { label: 'Inactive / lapsed', value: data.inactiveUsers },
        { label: 'Monthly plan', value: data.planBreakdown.monthly },
        { label: 'Yearly plan', value: data.planBreakdown.yearly },
      ]
    },
    {
      section: 'Prize pool',
      icon: <Trophy size={15} />,
      rows: [
        { label: 'Total ever distributed', value: `£${data.totalPrizePool.toFixed(2)}`, highlight: true },
        { label: 'Total paid out', value: `£${data.totalPaid.toFixed(2)}` },
        { label: 'Pending payouts', value: `£${data.pendingPayouts.toFixed(2)}`, warn: data.pendingPayouts > 0 },
        { label: 'Draws published', value: data.drawStats.length },
      ]
    },
    {
      section: 'Charity contributions',
      icon: <Heart size={15} />,
      rows: [
        { label: 'Total raised via platform', value: `£${data.charityTotal.toFixed(2)}`, highlight: true },
        {
          label: 'Est. this month',
          value: `£${(data.activeUsers * 9.99 * 0.1).toFixed(2)}`,
        },
      ]
    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-brand-mint border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-white">Reports</h1>
        <p className="text-brand-muted text-sm mt-1">Platform analytics and contribution totals.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active members', value: data.activeUsers, icon: <Users size={14} />, color: 'text-white' },
          { label: 'Total prize pool', value: `£${data.totalPrizePool.toFixed(0)}`, icon: <Trophy size={14} />, color: 'text-brand-gold' },
          { label: 'Charity raised', value: `£${data.charityTotal.toFixed(0)}`, icon: <Heart size={14} />, color: 'text-brand-mint' },
          { label: 'Pending payouts', value: `£${data.pendingPayouts.toFixed(0)}`, icon: <DollarSign size={14} />, color: data.pendingPayouts > 0 ? 'text-yellow-400' : 'text-white' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card text-center">
            <div className="text-brand-muted mb-2 flex justify-center">{icon}</div>
            <p className={`font-display text-3xl ${color}`}>{value}</p>
            <p className="text-xs text-brand-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Metric tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {METRIC_ROWS.map(({ section, icon, rows }) => (
          <div key={section} className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-brand-mint">{icon}</span>
              <h3 className="font-semibold text-white">{section}</h3>
            </div>
            <div className="space-y-2">
              {rows.map(({ label, value, highlight, warn }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-white border-opacity-[0.04] last:border-0">
                  <span className="text-sm text-brand-muted">{label}</span>
                  <span className={`text-sm font-semibold ${highlight ? 'text-brand-mint' : warn ? 'text-yellow-400' : 'text-white'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Draw history table */}
      {data.drawStats.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Draw history</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white border-opacity-5">
                  <th className="text-left pb-3 text-xs text-brand-muted font-medium">Period</th>
                  <th className="text-left pb-3 text-xs text-brand-muted font-medium">Type</th>
                  <th className="text-left pb-3 text-xs text-brand-muted font-medium">Participants</th>
                  <th className="text-right pb-3 text-xs text-brand-muted font-medium">Prize pool</th>
                </tr>
              </thead>
              <tbody>
                {data.drawStats.map((d, i) => (
                  <tr key={i} className="border-b border-white border-opacity-[0.04] last:border-0">
                    <td className="py-2.5 text-white">{d.draw_month}</td>
                    <td className="py-2.5 text-brand-muted capitalize">{d.draw_type}</td>
                    <td className="py-2.5 text-white">{d.participant_count}</td>
                    <td className="py-2.5 text-brand-mint font-semibold text-right">
                      £{(d.prize_pool_total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
