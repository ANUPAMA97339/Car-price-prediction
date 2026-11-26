import { formatCurrency } from '../../utils/formatCurrency'

export default function MarketDataTable({ items = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-textSub text-xs uppercase tracking-wide border-b theme-border">
            <th className="text-left py-3 px-3">Country</th>
            <th className="text-left py-3 px-3">Brand</th>
            <th className="text-left py-3 px-3">Type</th>
            <th className="text-right py-3 px-3">Avg. Price</th>
            <th className="text-right py-3 px-3">Listings</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={i} className="border-b theme-border">
              <td className="py-3 px-3 text-textMain">{r.country}</td>
              <td className="py-3 px-3 text-textMain">{r.brand}</td>
              <td className="py-3 px-3 text-textSub">{r.vehicle_type}</td>
              <td className="py-3 px-3 text-right text-accent">{formatCurrency(r.avg_price, r.currency)}</td>
              <td className="py-3 px-3 text-right text-textSub">{r.listings}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}