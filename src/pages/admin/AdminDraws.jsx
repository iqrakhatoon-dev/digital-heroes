import { useEffect, useState } from 'react'
import { supabaseAdmin as supabase } from '../../lib/supabaseAdmin'
import { runSimulation, calculatePrizePool } from '../../lib/drawEngine'
import { format } from 'date-fns'
import { Shuffle, Play, Eye, CheckCircle, AlertCircle, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

function DrawNumbers({ numbers, size = 'md' }) {
  const s = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className="flex gap-1.5 flex-wrap">
      {(numbers || []).map((n, i) => (
        <div key={i} className={`${s} rounded-full bg-brand-mint bg-opacity-10 border border-brand-mint border-opacity-30 text-brand-mint font-bold flex items-center justify-center`}>
          {n}
        </div>
      ))}
    </div>
  )
}

export default function AdminDraws() {
  const [draws, setDraws] = useState([])
  const [drawType, setDrawType] = useState('random')
  const [simulation, setSimulation] = useState(null)
  const [simLoading, setSimLoading] = useState(false)
  const [pubLoading, setPubLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [jackpotCarried, setJackpotCarried] = useState(0)

  const currentMonth = format(new Date(), 'yyyy-MM')

  const fetchDraws = async () => {
    setLoading(true)
    const { data } = await supabase.from('draws').select('*').order('created_at', { ascending: false })
    if (data) {
      setDraws(data)
      // Check for unclaimed jackpot from last month
      const lastDraw = data.find(d => d.status === 'published')
      if (lastDraw?.jackpot_carried_over) setJackpotCarried(lastDraw.jackpot_carried_over)
    }
    setLoading(false)
  }

  useEffect(() => { fetchDraws() }, [])

  const handleSimulate = async () => {
    setSimLoading(true)
    try {
      // Get all active subscribers and their scores
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('subscription_status', 'active')

      if (!users || users.length === 0) {
        toast.error('No active subscribers to draw from')
        setSimLoading(false)
        return
      }

      const userIds = users.map(u => u.id)
      const { data: scoresData } = await supabase
        .from('scores')
        .select('user_id, score')
        .in('user_id', userIds)

      const participants = users.map(u => ({
        ...u,
        scores: (scoresData || []).filter(s => s.user_id === u.id).map(s => s.score),
      })).filter(p => p.scores.length > 0)

      const result = runSimulation(participants, drawType, jackpotCarried)
      setSimulation(result)
      toast.success('Simulation complete — review before publishing')
    } catch (err) {
      toast.error('Simulation failed: ' + err.message)
    } finally {
      setSimLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!simulation) return
    if (!confirm('Publish this draw? This cannot be undone.')) return
    setPubLoading(true)
    try {
      const { data: draw, error: drawError } = await supabase.from('draws').insert({
        draw_month: currentMonth,
        draw_type: drawType,
        draw_numbers: simulation.drawNumbers,
        status: 'published',
        prize_pool_total: simulation.pool.total,
        prize_five_match: simulation.pool.fiveMatch,
        prize_four_match: simulation.pool.fourMatch,
        prize_three_match: simulation.pool.threeMatch,
        jackpot_carried_over: simulation.jackpotRolledOver,
        participant_count: simulation.participantCount,
        published_at: new Date().toISOString(),
      }).select().single()

      if (drawError) throw drawError

      // Insert winner records
      const winnerInserts = []
      Object.entries(simulation.winners).forEach(([tier, winners]) => {
        winners.forEach(w => {
          winnerInserts.push({
            draw_id: draw.id,
            user_id: w.id,
            match_count: w.matchCount,
            match_tier: w.tier,
            prize_amount: simulation.prizes[tier],
          })
        })
      })

      if (winnerInserts.length > 0) {
        await supabase.from('winners').insert(winnerInserts)
      }

      toast.success('Draw published!')
      setSimulation(null)
      fetchDraws()
    } catch (err) {
      toast.error('Publish failed: ' + err.message)
    } finally {
      setPubLoading(false)
    }
  }

  const existingDraw = draws.find(d => d.draw_month === currentMonth)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-white">Draws</h1>
        <p className="text-brand-muted text-sm mt-1">Configure, simulate, and publish monthly draws.</p>
      </div>

      {/* This month's draw */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Shuffle size={16} className="text-brand-mint" />
          <h2 className="font-semibold text-white">Current month — {format(new Date(), 'MMMM yyyy')}</h2>
        </div>

        {existingDraw ? (
          <div className="flex items-center gap-2 text-sm text-brand-mint">
            <CheckCircle size={15} /> Draw already published for this month
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="label">Draw type</label>
                <div className="flex gap-2">
                  {['random', 'algorithm'].map(t => (
                    <button key={t} onClick={() => setDrawType(t)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium capitalize transition-all ${
                        drawType === t ? 'bg-brand-mint text-brand-black' : 'bg-white bg-opacity-5 text-brand-muted hover:text-white'
                      }`}>
                      {t === 'random' ? 'Random' : 'Score-weighted'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-brand-muted mt-1.5">
                  {drawType === 'algorithm' ? 'Numbers weighted by score frequency across participants.' : 'Standard lottery-style random selection.'}
                </p>
              </div>
              <div>
                <label className="label">Jackpot carried over</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">£</span>
                  <input type="number" step="0.01" min="0"
                    className="input-field pl-7" value={jackpotCarried}
                    onChange={e => setJackpotCarried(Number(e.target.value))} />
                </div>
                <p className="text-xs text-brand-muted mt-1.5">From previous month's unclaimed jackpot.</p>
              </div>
            </div>

            <button onClick={handleSimulate} disabled={simLoading}
              className="btn-primary flex items-center gap-2 py-3 px-6 disabled:opacity-50">
              <Play size={14} />
              {simLoading ? 'Simulating…' : 'Run simulation'}
            </button>
          </>
        )}
      </div>

      {/* Simulation results */}
      {simulation && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Eye size={16} className="text-brand-mint" />
            <h2 className="font-semibold text-white">Simulation results</h2>
            <span className="text-xs text-brand-muted ml-auto">{simulation.participantCount} participants</span>
          </div>

          <div className="mb-5">
            <p className="text-xs text-brand-muted mb-2">Draw numbers</p>
            <DrawNumbers numbers={simulation.drawNumbers} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: '5-Match jackpot', pool: simulation.pool.fiveMatch, winners: simulation.winners.fiveMatch.length, each: simulation.prizes.fiveMatch },
              { label: '4-Number match', pool: simulation.pool.fourMatch, winners: simulation.winners.fourMatch.length, each: simulation.prizes.fourMatch },
              { label: '3-Number match', pool: simulation.pool.threeMatch, winners: simulation.winners.threeMatch.length, each: simulation.prizes.threeMatch },
            ].map(({ label, pool, winners, each }) => (
              <div key={label} className="bg-white bg-opacity-[0.03] rounded-xl p-4">
                <p className="text-xs text-brand-muted mb-1">{label}</p>
                <p className="text-xl font-display text-white">£{pool.toFixed(2)}</p>
                <p className="text-xs text-brand-muted mt-1">
                  {winners} winner{winners !== 1 ? 's' : ''} · £{each.toFixed(2)} each
                </p>
              </div>
            ))}
          </div>

          {simulation.jackpotRolledOver > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 text-yellow-400 text-sm mb-4">
              <AlertCircle size={13} />
              Jackpot rolls over — £{simulation.jackpotRolledOver.toFixed(2)} carried to next month
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handlePublish} disabled={pubLoading}
              className="btn-primary flex items-center gap-2 py-3 px-6 disabled:opacity-50">
              <CheckCircle size={14} />
              {pubLoading ? 'Publishing…' : 'Publish draw'}
            </button>
            <button onClick={() => setSimulation(null)} className="btn-outline py-3 px-5 text-sm">
              Re-simulate
            </button>
          </div>
        </div>
      )}

      {/* Past draws */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-brand-mint border-t-transparent rounded-full animate-spin" />
        </div>
      ) : draws.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Published draws</h2>
          <div className="space-y-4">
            {draws.filter(d => d.status === 'published').map(d => (
              <div key={d.id} className="p-4 rounded-xl bg-white bg-opacity-[0.03] border border-white border-opacity-5">
                <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <p className="font-medium text-white">{d.draw_month}</p>
                    <p className="text-xs text-brand-muted capitalize">{d.draw_type} · {d.participant_count} participants</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-mint font-semibold">£{d.prize_pool_total?.toFixed(2)}</p>
                    <p className="text-xs text-brand-muted">total pool</p>
                  </div>
                </div>
                <DrawNumbers numbers={d.draw_numbers} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
