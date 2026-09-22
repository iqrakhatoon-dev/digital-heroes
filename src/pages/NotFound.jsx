import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-7xl font-display text-brand-mint opacity-20 mb-2">404</p>
        <h1 className="text-3xl font-display text-white mb-3">Page not found</h1>
        <p className="text-brand-muted text-sm mb-8 max-w-sm mx-auto">
          That page doesn't exist. Check the URL or head back to the homepage.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5">
          Back to homepage <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
