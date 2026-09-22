import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Heart, Search, ExternalLink, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

const FALLBACK = [
  { id: '1', name: 'Children First Foundation', description: 'Supporting underprivileged children through education and nutrition programmes across the UK. Our programmes reach over 5,000 children each year.', featured: true, total_raised: 4200, events: [] },
  { id: '2', name: 'Veterans Support Network', description: 'Mental health and housing support for military veterans and their families. We run 24/7 helplines and community drop-in centres.', featured: true, total_raised: 3100, events: [{ name: 'Charity Golf Day', date: '2026-10-14' }] },
  { id: '3', name: 'Green Earth Initiative', description: 'Planting trees and restoring natural habitats with community-led conservation projects across Britain and Ireland.', featured: false, total_raised: 1800, events: [] },
  { id: '4', name: 'Sports for All', description: 'Making sport accessible to young people regardless of background or ability. We fund equipment, coaching, and club memberships.', featured: false, total_raised: 2600, events: [{ name: 'Junior Golf Open', date: '2026-11-02' }] },
  { id: '5', name: "Alzheimer's Research Trust", description: "Funding breakthrough research into dementia prevention and treatment. Every pound goes directly to laboratory research.", featured: false, total_raised: 900, events: [] },
]

export default function Charities() {
  const [charities, setCharities] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase.from('charities').select('*').eq('active', true).then(({ data }) => {
      setCharities(data?.length ? data : FALLBACK)
    }).catch(() => setCharities(FALLBACK))
  }, [])

  const filtered = charities.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'featured' && c.featured)
    return matchSearch && matchFilter
  })

  return (
    <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="section-tag mb-2">Charities</p>
        <h1 className="text-4xl font-display text-white mb-3">Causes that matter.</h1>
        <p className="text-brand-muted max-w-lg text-base">
          Every Digital Heroes subscriber donates to a charity of their choice. Browse our verified partners and pick the one closest to your heart.
        </p>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            className="input-field pl-9"
            placeholder="Search charities…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'featured'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f ? 'bg-brand-mint text-brand-black' : 'bg-white bg-opacity-5 text-brand-muted hover:text-white'
              }`}>
              {f === 'all' ? 'All charities' : 'Featured'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">
          <Heart size={32} className="mx-auto mb-3 opacity-20" />
          <p>No charities match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(c => (
            <div key={c.id} className={`card transition-all hover:border-brand-mint hover:border-opacity-20 ${c.featured ? 'border-brand-mint border-opacity-30' : ''}`}>
              {c.featured && (
                <div className="flex items-center gap-1 text-[10px] text-brand-mint font-semibold mb-3">
                  ★ Featured partner
                </div>
              )}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-mint bg-opacity-10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart size={15} className="text-brand-mint" />
                </div>
                <div>
                  <h3 className="font-semibold text-white leading-snug">{c.name}</h3>
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-brand-muted hover:text-brand-mint transition-colors flex items-center gap-1 mt-0.5">
                      Visit website <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>

              <p className="text-sm text-brand-muted leading-relaxed mb-4">{c.description}</p>

              {c.total_raised > 0 && (
                <div className="p-3 rounded-xl bg-white bg-opacity-[0.03] border border-white border-opacity-5 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-brand-muted">Raised via Digital Heroes</span>
                    <span className="text-brand-mint font-semibold text-sm">£{c.total_raised.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {c.events?.length > 0 && (
                <div className="border-t border-white border-opacity-5 pt-4">
                  <p className="text-xs font-medium text-brand-muted mb-2 flex items-center gap-1.5">
                    <Calendar size={10} /> Upcoming events
                  </p>
                  {c.events.map((ev, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-white">{ev.name}</span>
                      <span className="text-brand-muted text-xs">{ev.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 text-center">
        <p className="text-brand-muted text-sm mb-3">Ready to support a cause?</p>
        <Link to="/subscribe" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">
          Subscribe and choose your charity
        </Link>
      </div>
    </div>
  )
}
