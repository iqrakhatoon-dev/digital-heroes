import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { format, parseISO } from 'date-fns'
import { Plus, Edit2, Trash2, Trophy, Heart, Calendar, TrendingUp, Upload, Check, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function ScoreCard({ score, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white bg-opacity-[0.03] border border-white border-opacity-10 group">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-display text-brand-mint w-10 text-center">{score.score}</div>
        <div>
          <p className="text-sm text-white font-medium">Stableford score</p>
          <p className="text-xs text-brand-muted">{format(parseISO(score.score_date), 'dd MMM yyyy')}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(score)} className="p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10 text-brand-muted hover:text-white transition-all">
          <Edit2 size={13} />
        </button>
        <button onClick={() => onDelete(score.id)} className="p-1.5 rounded-lg hover:bg-red-500 hover:bg-opacity-10 text-brand-muted hover:text-red-400 transition-all">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

function ScoreModal({ score, onClose, onSave }) {
  const [value, setValue] = useState(score?.score || '')
  const [date, setDate] = useState(score?.score_date || new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    const n = Number(value)
    if (!n || n < 1 || n > 45) return toast.error('Score must be between 1 and 45')
    if (!date) return toast.error('Date is required')
    setLoading(true)
    await onSave({ score: n, score_date: date, id: score?.id })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-brand-slate border border-white border-opacity-10 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">{score ? 'Edit score' : 'Add score'}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Stableford score (1–45)</label>
            <input type="number" min="1" max="45" className="input-field text-2xl font-display text-center"
              value={value} onChange={e => setValue(e.target.value)} />
          </div>
          <div>
            <label className="label">Round date</label>
            <input type="date" className="input-field"
              value={date} onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} />
          </div>
          <button onClick={handleSave} disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50">
            {loading ? 'Saving…' : score ? 'Save changes' : 'Add score'}
          </button>
        </div>
      </div>
    </div>
  )
}

function UploadProofModal({ winner, onClose, onUpload }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!url.startsWith('http')) return toast.error('Please enter a valid URL')
    setLoading(true)
    await onUpload(winner.id, url)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-brand-slate border border-white border-opacity-10 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Upload proof</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-white"><X size={18} /></button>
        </div>
        <p className="text-sm text-brand-muted mb-4">
          Upload a screenshot URL from your golf platform showing your scores for the winning draw period.
        </p>
        <input className="input-field mb-4" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} />
        <button onClick={handle} disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
          {loading ? 'Uploading…' : 'Submit proof'}
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, isSubscribed } = useAuth()
  const [scores, setScores] = useState([])
  const [draws, setDraws] = useState([])
  const [winners, setWinners] = useState([])
  const [charity, setCharity] = useState(null)
  const [scoreModal, setScoreModal] = useState(null)
  const [proofModal, setProofModal] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [scoresRes, drawsRes, winnersRes, charityRes] = await Promise.all([
      supabase.from('scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }),
      supabase.from('draws').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(5),
      supabase.from('winners').select('*, draws(draw_month, draw_numbers)').eq('user_id', user.id).order('created_at', { ascending: false }),
      profile?.charity_id
        ? supabase.from('charities').select('*').eq('id', profile.charity_id).single()
        : Promise.resolve({ data: null }),
    ])
    if (scoresRes.data) setScores(scoresRes.data)
    if (drawsRes.data) setDraws(drawsRes.data)
    if (winnersRes.data) setWinners(winnersRes.data)
    if (charityRes.data) setCharity(charityRes.data)
    setLoading(false)
  }, [user, profile?.charity_id])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSaveScore = async ({ score, score_date, id }) => {
    if (id) {
      const { error } = await supabase.from('scores').update({ score, score_date }).eq('id', id)
      if (error) return toast.error('Could not update score: ' + error.message)
      toast.success('Score updated')
    } else {
      const { error } = await supabase.from('scores').insert({ user_id: user.id, score, score_date })
      if (error) {
        if (error.code === '23505') return toast.error('A score already exists for this date')
        return toast.error('Could not add score: ' + error.message)
      }
      toast.success('Score added')
    }
    setScoreModal(null)
    fetchAll()
  }

  const handleDeleteScore = async (id) => {
    if (!confirm('Delete this score?')) return
    const { error } = await supabase.from('scores').delete().eq('id', id)
    if (error) return toast.error('Could not delete score')
    toast.success('Score removed')
    fetchAll()
  }

  const handleUploadProof = async (winnerId, url) => {
    const { error } = await supabase.from('winners').update({ proof_url: url }).eq('id', winnerId)
    if (error) return toast.error('Upload failed')
    toast.success('Proof submitted — awaiting admin review')
    fetchAll()
  }

  const totalWon = winners.filter(w => w.payment_status === 'paid').reduce((a, b) => a + (b.prize_amount || 0), 0)
  const charityContribution = profile
    ? ((profile.subscription_plan === 'yearly' ? 89.99 : 9.99) * (profile.charity_percentage || 10)) / 100
    : 0

  if (loading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-mint border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display text-white">
            {profile?.full_name ? `Hey, ${profile.full_name.split(' ')[0]}.` : 'Your dashboard'}
          </h1>
          <p className="text-brand-muted text-sm mt-1">Here's where you stand this month.</p>
        </div>
        {!isSubscribed && (
          <Link to="/subscribe" className="btn-primary text-sm flex items-center gap-2">
            Activate subscription
          </Link>
        )}
      </div>

      {/* Subscription status banner */}
      {!isSubscribed && (
        <div className="card border-yellow-500 border-opacity-30 bg-yellow-500 bg-opacity-5 mb-6 flex items-center gap-3">
          <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">No active subscription</p>
            <p className="text-brand-muted text-xs">Subscribe to enter monthly draws and support your charity.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <TrendingUp size={14} />, label: 'Scores on record', value: scores.length + '/5' },
          { icon: <Trophy size={14} />, label: 'Draws entered', value: draws.length },
          { icon: <Trophy size={14} />, label: 'Total winnings', value: `£${totalWon.toFixed(2)}` },
          { icon: <Heart size={14} />, label: 'Charity this month', value: `£${charityContribution.toFixed(2)}` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="card text-center">
            <div className="text-brand-muted mb-2 flex justify-center">{icon}</div>
            <p className="font-display text-2xl text-white">{value}</p>
            <p className="text-xs text-brand-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scores */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">My scores</h2>
            {scores.length < 5 && (
              <button onClick={() => setScoreModal({})} className="flex items-center gap-1.5 text-xs text-brand-mint hover:text-white transition-colors font-medium">
                <Plus size={13} /> Add score
              </button>
            )}
          </div>

          {scores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-muted text-sm mb-3">No scores yet. Add your last 5 Stableford scores.</p>
              <button onClick={() => setScoreModal({})} className="btn-primary text-sm py-2 px-5">
                Add first score
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.map(s => (
                <ScoreCard key={s.id} score={s} onEdit={(s) => setScoreModal(s)} onDelete={handleDeleteScore} />
              ))}
              {scores.length < 5 && (
                <button onClick={() => setScoreModal({})}
                  className="w-full py-3 rounded-xl border border-dashed border-white border-opacity-10 text-brand-muted text-sm hover:border-brand-mint hover:text-brand-mint transition-all text-center">
                  + Add score ({scores.length}/5)
                </button>
              )}
            </div>
          )}

          <p className="text-xs text-brand-muted mt-4 border-t border-white border-opacity-5 pt-4">
            Only your 5 most recent scores are kept. A new score replaces the oldest.
          </p>
        </div>

        {/* Charity & Subscription */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={14} className="text-brand-mint" />
              <h2 className="text-base font-semibold text-white">Your charity</h2>
            </div>
            {charity ? (
              <>
                <p className="font-medium text-white">{charity.name}</p>
                <p className="text-sm text-brand-muted mt-1 line-clamp-2">{charity.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-brand-muted">Your contribution</span>
                  <span className="text-brand-mint font-semibold text-sm">{profile?.charity_percentage || 10}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white bg-opacity-5">
                  <div className="h-full rounded-full bg-brand-mint" style={{ width: `${profile?.charity_percentage || 10}%` }} />
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm text-brand-muted mb-3">No charity selected yet.</p>
                <Link to="/subscribe" className="text-xs text-brand-mint hover:underline">Select a charity →</Link>
              </div>
            )}
          </div>

          {/* Subscription */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} className="text-brand-mint" />
              <h2 className="text-base font-semibold text-white">Subscription</h2>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-muted">Status</span>
              <span className={`font-medium ${isSubscribed ? 'text-brand-mint' : 'text-yellow-400'}`}>
                {profile?.subscription_status || 'Inactive'}
              </span>
            </div>
            {profile?.subscription_plan && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-brand-muted">Plan</span>
                <span className="text-white capitalize">{profile.subscription_plan}</span>
              </div>
            )}
            {profile?.subscription_end && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-brand-muted">Renews</span>
                <span className="text-white">{format(parseISO(profile.subscription_end), 'dd MMM yyyy')}</span>
              </div>
            )}
            {!isSubscribed && (
              <Link to="/subscribe" className="btn-primary w-full text-center text-sm py-2 mt-4 block">
                Subscribe now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Draws & Winnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Recent draws */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">Recent draws</h2>
          {draws.length === 0 ? (
            <p className="text-sm text-brand-muted py-4 text-center">No published draws yet.</p>
          ) : (
            <div className="space-y-3">
              {draws.map(draw => (
                <div key={draw.id} className="p-3 rounded-xl bg-white bg-opacity-[0.03] border border-white border-opacity-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-brand-muted">{draw.draw_month}</span>
                    <span className="text-xs text-brand-mint capitalize">{draw.draw_type}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {(draw.draw_numbers || []).map((n, i) => {
                      const userScores = scores.map(s => s.score)
                      const matched = userScores.includes(n)
                      return (
                        <div key={i}
                          className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-semibold
                            ${matched ? 'bg-brand-mint text-brand-black' : 'bg-white bg-opacity-5 text-brand-muted'}`}>
                          {n}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Winnings */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">Winnings</h2>
          {winners.length === 0 ? (
            <div className="text-center py-8">
              <Trophy size={24} className="text-brand-muted mx-auto mb-2 opacity-30" />
              <p className="text-sm text-brand-muted">No winnings yet — the next draw could be yours.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {winners.map(w => (
                <div key={w.id} className="p-3 rounded-xl bg-white bg-opacity-[0.03] border border-white border-opacity-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{w.match_tier}</p>
                      <p className="text-xs text-brand-muted mt-0.5">{w.draws?.draw_month}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-brand-mint font-bold text-sm">£{w.prize_amount?.toFixed(2)}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        w.payment_status === 'paid' ? 'bg-brand-mint bg-opacity-20 text-brand-mint' : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                      }`}>
                        {w.payment_status}
                      </span>
                    </div>
                  </div>
                  {w.verification_status === 'pending' && !w.proof_url && (
                    <button onClick={() => setProofModal(w)}
                      className="mt-2 flex items-center gap-1.5 text-xs text-brand-mint hover:underline">
                      <Upload size={11} /> Upload proof of scores
                    </button>
                  )}
                  {w.verification_status === 'approved' && (
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-brand-mint">
                      <Check size={11} /> Verified
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {scoreModal !== null && (
        <ScoreModal score={Object.keys(scoreModal).length > 0 ? scoreModal : null}
          onClose={() => setScoreModal(null)} onSave={handleSaveScore} />
      )}
      {proofModal && (
        <UploadProofModal winner={proofModal} onClose={() => setProofModal(null)} onUpload={handleUploadProof} />
      )}
    </div>
  )
}
