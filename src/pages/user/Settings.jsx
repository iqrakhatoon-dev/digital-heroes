import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { User, Heart, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, profile, updateProfile } = useAuth()

  // Profile form
  const [name, setName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)

  // Charity
  const [charities, setCharities] = useState([])
  const [selectedCharity, setSelectedCharity] = useState(profile?.charity_id || '')
  const [charityPercent, setCharityPercent] = useState(profile?.charity_percentage || 10)

  // Password
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    setName(profile?.full_name || '')
    setSelectedCharity(profile?.charity_id || '')
    setCharityPercent(profile?.charity_percentage || 10)
  }, [profile])

  useEffect(() => {
    supabase.from('charities').select('id, name').eq('active', true)
      .then(({ data }) => { if (data) setCharities(data) })
  }, [])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await updateProfile({ full_name: name.trim() })
    if (error) toast.error('Update failed')
    else toast.success('Profile updated')
    setSaving(false)
  }

  const handleCharitySave = async (e) => {
    e.preventDefault()
    if (charityPercent < 10 || charityPercent > 100) return toast.error('Must be between 10% and 100%')
    setSaving(true)
    const { error } = await updateProfile({
      charity_id: selectedCharity || null,
      charity_percentage: charityPercent,
    })
    if (error) toast.error('Update failed')
    else toast.success('Charity preferences saved')
    setSaving(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPw.length < 8) return toast.error('Password must be at least 8 characters')
    if (newPw !== confirmPw) return toast.error('Passwords do not match')
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) toast.error(error.message)
    else {
      toast.success('Password updated')
      setNewPw('')
      setConfirmPw('')
    }
    setPwSaving(false)
  }

  const plan = profile?.subscription_plan
  const monthlyFee = plan === 'yearly' ? 89.99 : 9.99
  const charityMonthly = plan === 'yearly'
    ? (monthlyFee / 12) * charityPercent / 100
    : monthlyFee * charityPercent / 100

  return (
    <div className="pt-20 max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-white">Settings</h1>
        <p className="text-brand-muted text-sm mt-1">Manage your account, charity, and security.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <section className="card">
          <div className="flex items-center gap-2 mb-5">
            <User size={15} className="text-brand-mint" />
            <h2 className="font-semibold text-white">Profile</h2>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email address</label>
              <input className="input-field opacity-50 cursor-not-allowed" value={user?.email || ''} disabled />
              <p className="text-xs text-brand-muted mt-1">Email cannot be changed here — contact support.</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        {/* Charity */}
        <section className="card">
          <div className="flex items-center gap-2 mb-5">
            <Heart size={15} className="text-brand-mint" />
            <h2 className="font-semibold text-white">Charity preferences</h2>
          </div>
          <form onSubmit={handleCharitySave} className="space-y-4">
            <div>
              <label className="label">Selected charity</label>
              <select className="input-field" value={selectedCharity}
                onChange={e => setSelectedCharity(e.target.value)}>
                <option value="">— Choose a charity —</option>
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Contribution percentage</label>
              <div className="flex items-center gap-4">
                <input type="range" min="10" max="100" step="5"
                  value={charityPercent} onChange={e => setCharityPercent(Number(e.target.value))}
                  className="flex-1 accent-brand-mint" />
                <span className="text-brand-mint font-bold w-10 text-right">{charityPercent}%</span>
              </div>
              <p className="text-xs text-brand-muted mt-1.5">
                £{charityMonthly.toFixed(2)} per month goes to your chosen charity
              </p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-white bg-opacity-[0.03] rounded-xl border border-white border-opacity-5 text-xs text-brand-muted">
              <AlertCircle size={11} className="text-brand-mint mt-0.5 flex-shrink-0" />
              Changes take effect from your next billing cycle.
            </div>
            <button type="submit" disabled={saving} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save charity settings'}
            </button>
          </form>
        </section>

        {/* Subscription */}
        <section className="card">
          <h2 className="font-semibold text-white mb-4">Subscription</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Status</span>
              <span className={profile?.subscription_status === 'active' ? 'text-brand-mint font-medium' : 'text-yellow-400'}>
                {profile?.subscription_status || 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Plan</span>
              <span className="text-white capitalize">{plan || '—'}</span>
            </div>
          </div>
          {profile?.subscription_status === 'active' && (
            <p className="text-xs text-brand-muted mt-4 pt-4 border-t border-white border-opacity-5">
              To cancel your subscription, contact support or use the Stripe portal.
            </p>
          )}
        </section>

        {/* Password */}
        <section className="card">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={15} className="text-brand-mint" />
            <h2 className="font-semibold text-white">Change password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">New password</label>
              <input type="password" className="input-field" placeholder="Minimum 8 characters"
                value={newPw} onChange={e => setNewPw(e.target.value)} />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input type="password" className="input-field" placeholder="Repeat your new password"
                value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
            </div>
            <button type="submit" disabled={pwSaving} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-50">
              {pwSaving ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
