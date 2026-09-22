import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, Heart, Trophy, CheckCircle2 } from 'lucide-react'

const STEPS = [
  {
    num: '1',
    title: 'Subscribe',
    body: 'Choose a monthly or yearly plan. A portion of your fee funds your chosen charity, another builds the prize pool.',
  },
  {
    num: '2',
    title: 'Enter your scores',
    body: 'Log your last 5 Stableford scores. The platform keeps a rolling record — your five most recent always count.',
  },
  {
    num: '3',
    title: 'Match the draw',
    body: 'Every month we run a draw. Match 3, 4, or all 5 numbers with your scores to win your share of the pool.',
  },
  {
    num: '4',
    title: 'Give back',
    body: 'Win or not, every subscriber supports a real charity. Track your total contribution from your dashboard.',
  },
]

const PRIZES = [
  { label: '5-Number Jackpot', share: '40%', note: 'Rolls over if unclaimed', highlight: true },
  { label: '4-Number Match', share: '35%', note: 'Split among all winners', highlight: false },
  { label: '3-Number Match', share: '25%', note: 'Split among all winners', highlight: false },
]

const DRAW_NUMS = [7, 14, 22, 31, 39]

function PulsingNumber({ n, delay, size = 'md' }) {
  const s = size === 'sm'
    ? 'w-9 h-9 text-sm'
    : 'w-12 h-12 sm:w-14 sm:h-14 text-xl'
  return (
    <div
      className={`${s} rounded-full border-2 border-brand-mint flex items-center justify-center font-display text-brand-mint`}
      style={{ animationDelay: `${delay}ms`, animation: 'fadeUp 0.6s ease-out forwards', opacity: 0 }}
    >
      {n}
    </div>
  )
}

export default function Home() {
  const [charities, setCharities] = useState([])

  useEffect(() => {
    supabase.from('charities').select('*').eq('featured', true).eq('active', true).limit(3)
      .then(({ data }) => { if (data) setCharities(data) })
  }, [])

  return (
    <div className="pt-16">

      {/* ── Hero — Split Layout ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-mint opacity-[0.04] blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-brand-mint opacity-[0.03] blur-[80px]" />
        </div>

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ── Left: Text ── */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-full px-4 py-1.5 text-xs text-brand-muted mb-7">
                <Heart size={11} className="text-brand-mint" />
                10% of every subscription goes to your chosen charity
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-[4rem] xl:text-[4.5rem] text-white leading-[1.1] font-display mb-6">
                Play golf.<br />
                <span className="text-brand-mint">Give back.</span><br />
                Win monthly.
              </h1>

              <p className="text-brand-muted text-lg leading-relaxed mb-8 max-w-md">
                Track your Stableford scores, support a cause you care about, and enter a monthly draw — all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link to="/subscribe" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4">
                  Start your membership
                  <ArrowRight size={16} />
                </Link>
                <Link to="/how-it-works" className="btn-outline text-base px-8 py-4 text-center">
                  See how it works
                </Link>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-8 pt-4 border-t border-white border-opacity-[0.06]">
                {[
                  { value: '1,240+', label: 'Members' },
                  { value: '£4,800', label: 'Prize pool' },
                  { value: '5', label: 'Charities' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-display text-2xl text-white">{value}</p>
                    <p className="text-xs text-brand-muted mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Dashboard preview card ── */}
            <div className="relative lg:block">
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-brand-mint opacity-[0.05] blur-3xl rounded-3xl" />

              <div className="relative bg-white bg-opacity-[0.04] border border-white border-opacity-[0.08] rounded-3xl p-6 shadow-2xl">
                {/* Card header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-brand-muted tracking-widest uppercase">This month's draw</p>
                    <p className="font-semibold text-white mt-0.5">September 2026</p>
                  </div>
                  <span className="text-[10px] bg-brand-mint bg-opacity-20 text-brand-mint px-2.5 py-1 rounded-full font-bold tracking-wide">
                    ● LIVE
                  </span>
                </div>

                {/* Draw numbers */}
                <div className="mb-5 p-4 rounded-2xl bg-white bg-opacity-[0.03] border border-white border-opacity-[0.05]">
                  <p className="text-[10px] text-brand-muted mb-3 tracking-widest uppercase">Draw numbers</p>
                  <div className="flex gap-2">
                    {DRAW_NUMS.map((n, i) => (
                      <PulsingNumber key={n} n={n} delay={i * 80} size="sm" />
                    ))}
                  </div>
                </div>

                {/* Score rows */}
                <div className="mb-4">
                  <p className="text-[10px] text-brand-muted mb-2.5 tracking-widest uppercase">Your scores</p>
                  <div className="space-y-1.5">
                    {[
                      { score: 31, date: '18 Sep 2026', match: true },
                      { score: 22, date: '14 Sep 2026', match: true },
                      { score: 18, date: '09 Sep 2026', match: false },
                      { score: 14, date: '02 Sep 2026', match: true },
                    ].map(({ score, date, match }) => (
                      <div key={date} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white bg-opacity-[0.03] border border-white border-opacity-[0.04]">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            match
                              ? 'bg-brand-mint text-brand-black'
                              : 'bg-white bg-opacity-5 text-brand-muted'
                          }`}>
                            {score}
                          </div>
                          <span className="text-xs text-brand-muted">{date}</span>
                        </div>
                        {match && (
                          <span className="text-[10px] text-brand-mint font-semibold flex items-center gap-1">
                            <CheckCircle2 size={10} /> Match
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prize result */}
                <div className="bg-brand-mint bg-opacity-10 border border-brand-mint border-opacity-20 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-brand-muted">3 matches — you qualify!</p>
                    <p className="font-semibold text-white text-sm mt-0.5">Your prize share</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl text-brand-mint">£240</p>
                    <p className="text-[10px] text-brand-muted">3-match tier · 25%</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="border-y border-white border-opacity-[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Active members', value: '1,240+' },
            { label: 'Prize pool this month', value: '£4,800' },
            { label: 'Raised for charity', value: '£12,000+' },
            { label: 'Charities supported', value: '5' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-display text-3xl text-white">{value}</p>
              <p className="text-xs text-brand-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <div className="mb-12">
          <p className="section-tag mb-2">The process</p>
          <h2 className="text-4xl text-white">Simple from the start.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {STEPS.map((step) => (
            <div key={step.num} className="card hover:border-brand-mint hover:border-opacity-20 transition-all duration-300 group">
              <div className="text-5xl font-display text-brand-mint opacity-30 group-hover:opacity-50 transition-opacity mb-3 leading-none">
                {step.num}
              </div>
              <h3 className="text-xl text-white mb-2 font-sans font-semibold">{step.title}</h3>
              <p className="text-brand-muted text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Prize tiers ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="mb-12">
          <p className="section-tag mb-2">Prize structure</p>
          <h2 className="text-4xl text-white">Three ways to win.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRIZES.map((p) => (
            <div key={p.label}
              className={`relative rounded-2xl border p-6 transition-all ${
                p.highlight
                  ? 'border-brand-mint bg-brand-mint bg-opacity-10'
                  : 'border-white border-opacity-10 bg-white bg-opacity-[0.02]'
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-4">
                  <span className="bg-brand-mint text-brand-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                    JACKPOT
                  </span>
                </div>
              )}
              <Trophy size={18} className={p.highlight ? 'text-brand-mint mb-3' : 'text-brand-muted mb-3'} />
              <p className="font-semibold text-white text-lg mb-1">{p.label}</p>
              <p className="text-3xl font-display text-brand-mint mb-2">{p.share}</p>
              <p className="text-xs text-brand-muted">{p.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Charity spotlight ── */}
      <section className="border-t border-white border-opacity-[0.06] py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-tag mb-2">Give back</p>
              <h2 className="text-4xl text-white">Every member. Every cause.</h2>
            </div>
            <Link to="/charities" className="text-sm text-brand-mint hover:underline hidden sm:block">
              See all charities →
            </Link>
          </div>

          {charities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {charities.map((c) => (
                <div key={c.id} className="card group hover:border-brand-mint hover:border-opacity-20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-mint bg-opacity-10 flex items-center justify-center mb-4">
                    <Heart size={16} className="text-brand-mint" />
                  </div>
                  <h3 className="font-semibold text-white mb-1.5">{c.name}</h3>
                  <p className="text-sm text-brand-muted leading-relaxed line-clamp-3">{c.description}</p>
                  {c.total_raised > 0 && (
                    <div className="mt-4 pt-4 border-t border-white border-opacity-5">
                      <p className="text-xs text-brand-muted">Total raised</p>
                      <p className="text-brand-mint font-semibold">£{c.total_raised.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {['Children First Foundation', 'Veterans Support Network', 'Green Earth Initiative'].map((name) => (
                <div key={name} className="card">
                  <div className="w-10 h-10 rounded-xl bg-brand-mint bg-opacity-10 flex items-center justify-center mb-4">
                    <Heart size={16} className="text-brand-mint" />
                  </div>
                  <h3 className="font-semibold text-white mb-1.5">{name}</h3>
                  <p className="text-sm text-brand-muted">A cause worth supporting. Choose this charity at signup and every month, a portion of your subscription goes directly to them.</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 text-sm text-brand-muted sm:hidden">
            <Link to="/charities" className="text-brand-mint hover:underline">See all charities →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="relative rounded-3xl bg-brand-mint bg-opacity-10 border border-brand-mint border-opacity-20 p-10 sm:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-brand-mint opacity-[0.08] blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-brand-mint opacity-[0.06] blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-4xl sm:text-5xl text-white mb-4">Ready to play your part?</h2>
            <p className="text-brand-muted max-w-md mx-auto mb-8 text-base">
              Join hundreds of golfers supporting great causes and competing for real prizes every month.
            </p>
            <Link to="/subscribe" className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base">
              Join Digital Heroes
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
