import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { PLANS } from '../lib/stripe'
import { Check, ArrowRight, Eye, EyeOff, Heart, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const STEPS = ['Plan', 'Account', 'Charity', 'Payment']

export default function Subscribe() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [plan, setPlan] = useState('monthly')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [charities, setCharities] = useState([])
  const [selectedCharity, setSelectedCharity] = useState(null)
  const [charityPercent, setCharityPercent] = useState(10)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setStep(2) // Skip account step if already signed in
      setEmail(user.email)
      setName(profile?.full_name || '')
    }
    supabase.from('charities').select('*').eq('active', true).then(({ data }) => {
      if (data) setCharities(data)
    })
  }, [user, profile])

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) return toast.error('Please fill all fields')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    const { error } = await (user
      ? Promise.resolve({ error: null })
      : import('../context/AuthContext').then(() => {
          return supabase.auth.signUp({
            email, password,
            options: { data: { full_name: name } }
          })
        })
    )
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setStep(2)
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) return toast.error('Please fill all fields')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    setStep(2)
    setLoading(false)
  }

  const handleCharityNext = () => {
    if (!selectedCharity) return toast.error('Please select a charity')
    setStep(3)
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const userId = user?.id
      if (!userId) { toast.error('Please sign in first'); return }

      // Save charity selection to profile
      await supabase.from('profiles').update({
        charity_id: selectedCharity,
        charity_percentage: charityPercent,
      }).eq('id', userId)

      // In production: redirect to Stripe checkout
      // For demo: mock subscription activation
      await supabase.from('profiles').update({
        subscription_status: 'active',
        subscription_plan: plan,
        subscription_start: new Date().toISOString(),
        subscription_end: plan === 'yearly'
          ? new Date(Date.now() + 365 * 86400000).toISOString()
          : new Date(Date.now() + 30 * 86400000).toISOString(),
      }).eq('id', userId)

      await refreshProfile()
      toast.success('Subscription activated!')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = PLANS[plan]

  return (
    <div className="pt-20 min-h-screen px-4 pb-16">
      <div className="max-w-lg mx-auto">
        {/* Step progress */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex flex-col items-center ${i <= step ? '' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${i < step ? 'bg-brand-mint border-brand-mint text-brand-black' :
                    i === step ? 'border-brand-mint text-brand-mint' :
                    'border-brand-muted text-brand-muted'}`}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${i === step ? 'text-brand-mint' : 'text-brand-muted'}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 transition-colors ${i < step ? 'bg-brand-mint' : 'bg-white bg-opacity-10'}`}
                  style={{ width: 40 }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0 — Plan */}
        {step === 0 && (
          <div>
            <h2 className="text-3xl font-display text-white mb-2">Choose your plan</h2>
            <p className="text-brand-muted text-sm mb-8">You can change or cancel at any time.</p>
            <div className="space-y-3 mb-8">
              {Object.values(PLANS).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    plan === p.id ? 'border-brand-mint bg-brand-mint bg-opacity-5' : 'border-white border-opacity-10 hover:border-opacity-20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{p.name}</p>
                        {p.savings && (
                          <span className="text-[10px] bg-brand-mint text-brand-black font-bold px-2 py-0.5 rounded-full">
                            SAVE {p.savings}
                          </span>
                        )}
                      </div>
                      {p.monthlyEquiv && (
                        <p className="text-xs text-brand-muted mt-0.5">
                          £{p.monthlyEquiv.toFixed(2)}/month billed yearly
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl text-white">£{p.price}</p>
                      <p className="text-xs text-brand-muted">per {p.interval}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(user ? 2 : 1)} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 1 — Account */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-display text-white mb-2">Create your account</h2>
            <p className="text-brand-muted text-sm mb-8">Already have one?{' '}
              <a href="/login" className="text-brand-mint hover:underline">Sign in</a>
            </p>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="label">Full name</label>
                <input className="input-field" placeholder="Alex Thompson" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? 'Creating account…' : <>Create account <ArrowRight size={16} /></>}
              </button>
            </form>
            <button onClick={() => setStep(0)} className="w-full text-center text-sm text-brand-muted mt-4 hover:text-white transition-colors">
              ← Back
            </button>
          </div>
        )}

        {/* Step 2 — Charity */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-display text-white mb-2">Choose your charity</h2>
            <p className="text-brand-muted text-sm mb-8">
              A minimum of 10% of your subscription goes to this cause every month.
            </p>

            <div className="space-y-3 mb-6">
              {(charities.length > 0 ? charities : [
                { id: 'c1', name: 'Children First Foundation', description: 'Supporting underprivileged children through education.' },
                { id: 'c2', name: 'Veterans Support Network', description: 'Mental health support for military veterans.' },
                { id: 'c3', name: 'Green Earth Initiative', description: 'Planting trees and restoring natural habitats.' },
                { id: 'c4', name: 'Sports for All', description: 'Making sport accessible regardless of background.' },
                { id: 'c5', name: "Alzheimer's Research Trust", description: 'Funding breakthrough research into dementia.' },
              ]).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCharity(c.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedCharity === c.id ? 'border-brand-mint bg-brand-mint bg-opacity-5' : 'border-white border-opacity-10 hover:border-opacity-20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedCharity === c.id ? 'bg-brand-mint bg-opacity-20' : 'bg-white bg-opacity-5'
                    }`}>
                      <Heart size={13} className={selectedCharity === c.id ? 'text-brand-mint' : 'text-brand-muted'} />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{c.name}</p>
                      <p className="text-xs text-brand-muted mt-0.5 line-clamp-1">{c.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="card mb-6">
              <label className="label">Your contribution percentage</label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min="10" max="100" step="5"
                  value={charityPercent}
                  onChange={e => setCharityPercent(Number(e.target.value))}
                  className="flex-1 accent-brand-mint"
                />
                <span className="text-brand-mint font-bold text-lg w-12 text-right">{charityPercent}%</span>
              </div>
              <p className="text-xs text-brand-muted mt-2">
                That's £{((selectedPlan.price * charityPercent) / 100).toFixed(2)} per {selectedPlan.interval} to your chosen cause
              </p>
            </div>

            <button onClick={handleCharityNext} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
              Continue <ArrowRight size={16} />
            </button>
            {!user && (
              <button onClick={() => setStep(1)} className="w-full text-center text-sm text-brand-muted mt-4 hover:text-white transition-colors">
                ← Back
              </button>
            )}
          </div>
        )}

        {/* Step 3 — Payment */}
        {step === 3 && (
          <div>
            <h2 className="text-3xl font-display text-white mb-2">Confirm & pay</h2>
            <p className="text-brand-muted text-sm mb-8">Powered by Stripe. Cancel any time.</p>

            <div className="card mb-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">{selectedPlan.name} membership</span>
                <span className="text-white font-medium">£{selectedPlan.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Charity contribution ({charityPercent}%)</span>
                <span className="text-brand-mint">£{((selectedPlan.price * charityPercent) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-white border-opacity-10">
                <span className="text-brand-muted">Prize pool contribution</span>
                <span className="text-white">£{(selectedPlan.price * 0.6).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-3 border-t border-white border-opacity-10">
                <span className="text-white">Total today</span>
                <span className="text-white">£{selectedPlan.price}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-brand-muted mb-6 p-3 rounded-lg bg-white bg-opacity-[0.03]">
              <Check size={12} className="text-brand-mint flex-shrink-0" />
              Secure payment via Stripe. Your card details are never stored by us.
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Processing…' : `Pay £${selectedPlan.price} and start`}
              {!loading && <ArrowRight size={16} />}
            </button>
            <p className="text-xs text-brand-muted text-center mt-3">
              By subscribing you agree to our Terms of Service and Privacy Policy.
            </p>
            <button onClick={() => setStep(2)} className="w-full text-center text-sm text-brand-muted mt-3 hover:text-white transition-colors">
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
