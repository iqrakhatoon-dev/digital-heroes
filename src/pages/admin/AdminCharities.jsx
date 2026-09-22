import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Heart, X, Star } from 'lucide-react'
import { supabaseAdmin as supabase } from '../../lib/supabaseAdmin'
import toast from 'react-hot-toast'

const EMPTY = { name: '', description: '', website: '', featured: false, active: true }

export default function AdminCharities() {
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) 

  const fetchCharities = async () => {
  setLoading(true)
  
  // charities fetch karo
  const { data: charitiesData } = await supabase
    .from('charities')
    .select('*')
    .order('created_at', { ascending: false })

  // contributions fetch karo
  const { data: contribData } = await supabase
    .from('charity_contributions')
    .select('charity_id, amount')

  if (charitiesData) {
    // har charity ka total calculate karo
    const charitiesWithTotal = charitiesData.map(c => ({
      ...c,
      total_raised: contribData
        ?.filter(contrib => contrib.charity_id === c.id)
        ?.reduce((sum, contrib) => sum + (contrib.amount || 0), 0) || 0
    }))
    setCharities(charitiesWithTotal)
  }
  
  setLoading(false)
}

  useEffect(() => { fetchCharities() }, [])

  const handleSave = async (form) => {
    const isNew = !form.id
    if (!form.name?.trim()) return toast.error('Name is required')

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      website: form.website?.trim() || null,
      featured: form.featured || false,
      active: form.active !== false,
    }

    let error
    if (isNew) {
      ({ error } = await supabase.from('charities').insert(payload))
    } else {
      ({ error } = await supabase.from('charities').update(payload).eq('id', form.id))
    }

    if (error) return toast.error('Save failed: ' + error.message)
    toast.success(isNew ? 'Charity added' : 'Charity updated')
    setModal(null)
    fetchCharities()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this charity? This cannot be undone.')) return
    const { error } = await supabase.from('charities').delete().eq('id', id)
    if (error) return toast.error('Delete failed')
    toast.success('Charity deleted')
    fetchCharities()
  }

  const handleToggle = async (id, field, val) => {
    await supabase.from('charities').update({ [field]: val }).eq('id', id)
    fetchCharities()
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display text-white">Charities</h1>
          <p className="text-brand-muted text-sm mt-1">Manage charity listings and media.</p>
        </div>
        <button onClick={() => setModal(EMPTY)} className="btn-primary text-sm py-2.5 flex items-center gap-1.5">
          <Plus size={14} /> Add charity
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-mint border-t-transparent rounded-full animate-spin" />
        </div>
      ) : charities.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">
          <Heart size={28} className="mx-auto mb-3 opacity-20" />
          <p>No charities yet. Add your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {charities.map(c => (
            <div key={c.id} className="card flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-mint bg-opacity-10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart size={13} className="text-brand-mint" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{c.name}</p>
                    {c.featured && (
                      <span className="text-[10px] text-brand-gold bg-brand-gold bg-opacity-10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star size={8} /> Featured
                      </span>
                    )}
                    {!c.active && (
                      <span className="text-[10px] text-brand-muted bg-white bg-opacity-5 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-brand-muted mt-0.5 line-clamp-2 max-w-lg">{c.description}</p>
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-brand-mint hover:underline mt-0.5 block">
                      {c.website}
                    </a>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-brand-muted">
                      Raised: <span className="text-white font-medium">£{(c.total_raised || 0).toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(c.id, 'featured', !c.featured)}
                  className={`p-1.5 rounded-lg text-xs transition-all ${c.featured ? 'text-brand-gold bg-brand-gold bg-opacity-10' : 'text-brand-muted hover:text-brand-gold hover:bg-white hover:bg-opacity-5'}`}
                  title={c.featured ? 'Unfeature' : 'Feature'}>
                  <Star size={13} />
                </button>
                <button onClick={() => handleToggle(c.id, 'active', !c.active)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${c.active ? 'text-brand-mint bg-brand-mint bg-opacity-10 hover:bg-opacity-20' : 'text-brand-muted bg-white bg-opacity-5 hover:bg-opacity-10'}`}>
                  {c.active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => setModal({ ...c })}
                  className="p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10 text-brand-muted hover:text-white transition-all">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => handleDelete(c.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500 hover:bg-opacity-10 text-brand-muted hover:text-red-400 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <CharityModal
          initial={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function CharityModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({ ...initial })
  const [loading, setLoading] = useState(false)
  const isNew = !form.id

  const handle = async () => {
    setLoading(true)
    await onSave(form)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-brand-slate border border-white border-opacity-10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">{isNew ? 'Add charity' : 'Edit charity'}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-white"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Charity name *</label>
            <input className="input-field" placeholder="Children First Foundation"
              value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input-field resize-none" placeholder="What this charity does…"
              value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Website URL</label>
            <input className="input-field" placeholder="https://charity.org"
              value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={form.featured || false}
                  onChange={e => setForm({ ...form, featured: e.target.checked })} />
                <div className={`w-9 h-5 rounded-full transition-colors ${form.featured ? 'bg-brand-mint' : 'bg-white bg-opacity-10'}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.featured ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm text-brand-muted">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={form.active !== false}
                  onChange={e => setForm({ ...form, active: e.target.checked })} />
                <div className={`w-9 h-5 rounded-full transition-colors ${form.active !== false ? 'bg-brand-mint' : 'bg-white bg-opacity-10'}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.active !== false ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm text-brand-muted">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handle} disabled={loading}
              className="btn-primary flex-1 py-3 text-sm disabled:opacity-50">
              {loading ? 'Saving…' : isNew ? 'Add charity' : 'Save changes'}
            </button>
            <button onClick={onClose} className="btn-outline py-3 px-5 text-sm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
