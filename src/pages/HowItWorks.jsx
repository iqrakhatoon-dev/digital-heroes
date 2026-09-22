import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'

const MECHANICS = [
  {
    title: 'Subscribe to the platform',
    body: 'Choose a monthly (£9.99) or yearly (£89.99) plan. Your subscription covers: 60% to the prize pool, at least 10% to your chosen charity, and the rest covering platform costs.',
    note: 'You can increase your charity contribution up to 100% of your subscription at any time.',
  },
  {
    title: 'Enter your last 5 Stableford scores',
    body: 'Log your scores using the Stableford format (1–45 points). The platform keeps a rolling record — only your 5 most recent scores are stored. A new score automatically replaces the oldest.',
    note: 'One score per date. You can edit or delete an existing entry for a date, but not add a duplicate.',
  },
  {
    title: 'The monthly draw',
    body: 'Every month, we draw 5 numbers between 1 and 45. The draw uses either a standard random method or an algorithm weighted by score frequency across all participants.',
    note: 'Your 5 stored scores are your ticket. How many match the draw numbers determines your prize tier.',
  },
  {
    title: 'Match numbers, win prizes',
    body: 'Match 3, 4, or all 5 draw numbers with your scores. Prizes are split among all winners in the same tier. The jackpot (5-match) rolls over to the following month if no one claims it.',
    note: null,
  },
  {
    title: 'Winner verification',
    body: "If you win, you'll be notified and asked to upload a screenshot from your golf platform confirming your scores. Our admin team reviews and approves each claim before payout.",
    note: 'Payments are processed once verification is complete.',
  },
  {
    title: 'Your charity impact',
    body: "Every month, your chosen percentage goes directly to your selected charity. Whether you win or lose, your subscription always makes a difference. Track your total contribution from your dashboard.",
    note: null,
  },
]

const TIERS = [
  { match: '5 numbers', label: 'Jackpot', share: '40%', detail: 'Rolls over if unclaimed' },
  { match: '4 numbers', label: '4-Match', share: '35%', detail: 'Split among winners' },
  { match: '3 numbers', label: '3-Match', share: '25%', detail: 'Split among winners' },
]

export default function HowItWorks() {
  return (
    <div className="pt-20 max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-12">
        <p className="section-tag mb-2">How it works</p>
        <h1 className="text-4xl sm:text-5xl font-display text-white leading-tight mb-4">
          Golf. Give. Win.<br />Every month.
        </h1>
        <p className="text-brand-muted text-lg leading-relaxed">
          Six steps from signup to payout — here's everything you need to know about how Digital Heroes works.
        </p>
      </div>

      {/* Steps */}
      <div className="relative mb-16">
        <div className="absolute left-5 top-6 bottom-6 w-px bg-white bg-opacity-[0.06] hidden sm:block" />
        <div className="space-y-8">
          {MECHANICS.map((m, i) => (
            <div key={i} className="sm:pl-14 relative">
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-brand-green border border-white border-opacity-10 flex items-center justify-center text-brand-mint font-display text-lg hidden sm:flex">
                {i + 1}
              </div>
              <div className="sm:hidden w-8 h-8 rounded-full bg-brand-green border border-white border-opacity-10 flex items-center justify-center text-brand-mint font-bold text-sm mb-3">
                {i + 1}
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">{m.title}</h3>
              <p className="text-brand-muted text-sm leading-relaxed mb-2">{m.body}</p>
              {m.note && (
                <div className="flex items-start gap-2 text-xs text-brand-muted bg-white bg-opacity-[0.03] border border-white border-opacity-5 rounded-xl px-3 py-2 mt-3">
                  <Check size={11} className="text-brand-mint mt-0.5 flex-shrink-0" />
                  {m.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prize tiers */}
      <div className="mb-16">
        <h2 className="text-2xl font-display text-white mb-2">Prize tiers</h2>
        <p className="text-brand-muted text-sm mb-6">
          The prize pool is funded by 60% of all active subscriptions that month.
        </p>
        <div className="space-y-3">
          {TIERS.map((t) => (
            <div key={t.match} className="flex items-center justify-between p-4 rounded-xl border border-white border-opacity-10 bg-white bg-opacity-[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-16 text-center">
                  <p className="text-brand-mint font-display text-xl">{t.match}</p>
                </div>
                <div>
                  <p className="text-white font-semibold">{t.label}</p>
                  <p className="text-xs text-brand-muted">{t.detail}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">{t.share}</p>
                <p className="text-xs text-brand-muted">of pool</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-2xl font-display text-white mb-6">Common questions</h2>
        <div className="space-y-5">
          {[
            {
              q: 'What is Stableford scoring?',
              a: 'Stableford is a golf scoring system where points are awarded based on the number of strokes taken at each hole relative to par. A typical score ranges from 1 to 45+ points per round.',
            },
            {
              q: 'Can I change my charity?',
              a: 'Yes — head to your account settings and select a new charity. The change takes effect from your next billing cycle.',
            },
            {
              q: 'What happens if nobody wins the jackpot?',
              a: 'If no one matches all 5 draw numbers, the jackpot (40% of pool) carries over to the following month — growing until someone wins it.',
            },
            {
              q: 'How do I prove my scores?',
              a: 'Winners are asked to upload a screenshot from their golf platform (e.g., MyRound, IG, Club systems) showing their scores for the draw period. Our admin team reviews each submission.',
            },
            {
              q: 'Can I cancel any time?',
              a: 'Yes. You can cancel your subscription at any time from your dashboard. Access continues until the end of your billing period.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-white border-opacity-[0.06] pb-5">
              <h4 className="font-semibold text-white mb-1.5">{q}</h4>
              <p className="text-sm text-brand-muted leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-brand-muted text-sm mb-4">Still have questions? We're here to help.</p>
        <Link to="/subscribe" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">
          Get started today <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
