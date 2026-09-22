import { useEffect, useState } from 'react'
import { supabaseAdmin as supabase } from '../../lib/supabaseAdmin'
import { CheckCircle, XCircle, Trophy, ExternalLink, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-500 bg-opacity-10' },
  approved: { label: 'Approved', color: 'text-brand-mint bg-brand-mint bg-opacity-10' },
  rejected: { label: 'Rejected', color: 'text-red-400 bg-red-500 bg-opacity-10' },
}
const PAYMENT_CONFIG = {
  pending: { label: 'Unpaid', color: 'text-yellow-400' },
  paid: { label: 'Paid', color: 'text-brand-mint' },
}

export default function AdminWinners() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [notes, setNotes] = useState({})

  const fetchWinners = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('winners')
      .select('*, profiles(full_name, email), draws(draw_month, draw_numbers)')
      .order('created_at', { ascending: false })
    if (data) setWinners(data)
    setLoading(false)
  }

  useEffect(() => { fetchWinners() }, [])

  const handleVerify = async (id, status) => {
    const { error } = await supabase.from('winners')
      .update({
        verification_status: status,
        admin_notes: notes[id] || null,
        verified_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (error) return toast.error('Update failed')
    toast.success(status === 'approved' ? 'Winner approved ✓' : 'Submission rejected')
    fetchWinners()
  }

  const handleMarkPaid = async (id) => {
    const { error } = await supabase.from('winners')
      .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return toast.error('Update failed')
    toast.success('Marked as paid')
    fetchWinners()
  }

  const filtered = filter === 'all' ? winners : winners.filter(w => {
    if (filter === 'pending_verify') return w.verification_status === 'pending' && w.proof_url
    if (filter === 'pending_payment') return w.verification_status === 'approved' && w.payment_status === 'pending'
    if (filter === 'paid') return w.payment_status === 'paid'
    return true
  })

  const pendingCount = winners.filter(w => w.verification_status === 'pending' && w.proof_url).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-white">Winners</h1>
        <p className="text-brand-muted text-sm mt-1">Verify submissions and manage payouts.</p>
      </div>

      {pendingCount > 0 && (
        <div className="card border-yellow-500 border-opacity-20 bg-yellow-500 bg-opacity-5 mb-5 flex items-center gap-2 text-yellow-400 text-sm">
          <AlertCircle size={14} />
          {pendingCount} winner{pendingCount > 1 ? 's' : ''} waiting for verification
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[
          { key: 'all', label: 'All winners' },
          { key: 'pending_verify', label: `Awaiting review${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { key: 'pending_payment', label: 'Pending payment' },
          { key: 'paid', label: 'Paid' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              filter === key ? 'bg-brand-mint text-brand-black' : 'bg-white bg-opacity-5 text-brand-muted hover:text-white'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-mint border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">
          <Trophy size={28} className="mx-auto mb-3 opacity-20" />
          <p>No winners in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(w => (
            <div key={w.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{w.profiles?.full_name || '—'}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[w.verification_status]?.color}`}>
                      {STATUS_CONFIG[w.verification_status]?.label}
                    </span>
                    <span className={`text-[10px] font-semibold ${PAYMENT_CONFIG[w.payment_status]?.color}`}>
                      {PAYMENT_CONFIG[w.payment_status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted mt-0.5">{w.profiles?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-brand-mint font-bold text-lg">£{w.prize_amount?.toFixed(2)}</p>
                  <p className="text-xs text-brand-muted">{w.match_tier}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <p className="text-[10px] text-brand-muted mb-1">Draw period</p>
                  <p className="text-sm text-white">{w.draws?.draw_month || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-brand-muted mb-1">Matches</p>
                  <p className="text-sm text-white">{w.match_count} numbers</p>
                </div>
                <div>
                  <p className="text-[10px] text-brand-muted mb-1">Submitted</p>
                  <p className="text-sm text-white">{w.created_at ? format(new Date(w.created_at), 'dd MMM yyyy') : '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-brand-muted mb-1">Draw numbers</p>
                  <div className="flex gap-1 flex-wrap">
                    {(w.draws?.draw_numbers || []).map((n, i) => (
                      <span key={i} className="w-6 h-6 bg-brand-mint bg-opacity-10 text-brand-mint text-[10px] font-bold rounded-full flex items-center justify-center">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Proof link */}
              {w.proof_url ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white bg-opacity-[0.03] border border-white border-opacity-5 mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-brand-muted mb-0.5">Score proof</p>
                    <a href={w.proof_url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-brand-mint hover:underline flex items-center gap-1">
                      View screenshot <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white bg-opacity-[0.02] border border-dashed border-white border-opacity-10 mb-4">
                  <Clock size={13} className="text-brand-muted" />
                  <p className="text-xs text-brand-muted">Awaiting proof submission from winner</p>
                </div>
              )}

              {/* Admin notes */}
              {w.verification_status === 'pending' && w.proof_url && (
                <div className="mb-3">
                  <label className="label">Admin notes (optional)</label>
                  <input className="input-field text-sm" placeholder="Notes for the record…"
                    value={notes[w.id] || ''} onChange={e => setNotes({ ...notes, [w.id]: e.target.value })} />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {w.verification_status === 'pending' && w.proof_url && (
                  <>
                    <button onClick={() => handleVerify(w.id, 'approved')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-mint bg-opacity-10 text-brand-mint text-sm font-medium hover:bg-opacity-20 transition-all">
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button onClick={() => handleVerify(w.id, 'rejected')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 bg-opacity-10 text-red-400 text-sm font-medium hover:bg-opacity-20 transition-all">
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}
                {w.verification_status === 'approved' && w.payment_status === 'pending' && (
                  <button onClick={() => handleMarkPaid(w.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-mint text-brand-black text-sm font-semibold hover:bg-opacity-90 transition-all">
                    <CheckCircle size={13} /> Mark as paid
                  </button>
                )}
                {w.payment_status === 'paid' && (
                  <span className="flex items-center gap-1 text-xs text-brand-mint">
                    <CheckCircle size={12} /> Paid {w.paid_at ? format(new Date(w.paid_at), 'dd MMM yyyy') : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
