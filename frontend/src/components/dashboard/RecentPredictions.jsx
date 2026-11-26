import { useMemo } from 'react'
import EmptyState from '../common/EmptyState.jsx'
import { History } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

export default function RecentPredictions({ items = [], currency = 'INR', loading = false }) {
  const rows = useMemo(() => items.slice(0, 5), [items])
  if (loading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
  }
  if (!rows.length) return <EmptyState icon={History} title="No predictions yet" message="Your recent predictions will appear here." />
  return (
    <div className="divide-y theme-divider">
      {rows.map((r, i) => (
        <div key={i} className="py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-textMain text-sm font-medium truncate">{r.brand} {r.model}</p>
            <p className="text-textSub text-xs">{r.country} · {r.manufacturing_year} · {r.vehicle_type}</p>
          </div>
          <p className="text-accent font-semibold text-sm whitespace-nowrap">{formatCurrency(r.predicted_price, r.original_currency || currency)}</p>
        </div>
      ))}
    </div>
  )
}