import { Link } from 'react-router-dom'
import { Home as HomeIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-6xl font-bold text-accent">404</p>
      <p className="text-textMain mt-4 font-semibold">Page not found</p>
      <p className="text-textSub text-sm mt-1">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex"><HomeIcon size={16} /> Back to Home</Link>
    </div>
  )
}