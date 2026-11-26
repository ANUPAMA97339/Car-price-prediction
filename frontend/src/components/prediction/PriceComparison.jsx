import { formatCurrency } from '../../utils/formatCurrency'

export default function PriceComparison({ items = [], currency = 'INR' }) {
  if (!items.length) return <p className="text-textSub text-sm">Add vehicles to compare.</p>
  const normalized = items.map((i) => ({ ...i, usd: i.predicted_price * (i.fx_to_usd || 1) }))
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-textSub text-xs uppercase tracking-wide border-b theme-border">
            <th className="text-left py-2 px-3">Brand</th>
            <th className="text-left py-2 px-3">Model</th>
            <th className="text-left py-2 px-3">Year</th>
            <th className="text-left py-2 px-3">Mileage</th>
            <th className="text-right py-2 px-3">Price</th>
            <th className="text-right py-2 px-3">USD eq.</th>
          </tr>
        </thead>
        <tbody>
          {normalized.map((r, i) => (
            <tr key={i} className="border-b theme-border">
              <td className="py-2 px-3 text-textMain">{r.brand}</td>
              <td className="py-2 px-3 text-textMain">{r.model}</td>
              <td className="py-2 px-3 text-textSub">{r.manufacturing_year}</td>
              <td className="py-2 px-3 text-textSub">{r.mileage || '—'}</td>
              <td className="py-2 px-3 text-right text-accent font-medium">{formatCurrency(r.predicted_price, r.original_currency || currency)}</td>
              <td className="py-2 px-3 text-right text-textSub">${Math.round(r.usd).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}