import { formatCurrency } from '../../utils/formatCurrency'

// ফলব্যাক এক্সচেঞ্জ রেট (ব্যাকএন্ড থেকে না আসলে ব্যবহার হবে)
const FALLBACK_RATES = {
  INR: 0.012,
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.27,
}

export default function ComparisonTable({ items = [] }) {
  if (!items.length) return <p className="text-textSub text-sm">No items to compare.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-textSub text-xs uppercase tracking-wide border-b border-white/10">
            <th className="text-left py-3 px-3">Brand</th>
            <th className="text-left py-3 px-3">Model</th>
            <th className="text-left py-3 px-3">Country</th>
            <th className="text-left py-3 px-3">Year</th>
            <th className="text-left py-3 px-3">Fuel</th>
            <th className="text-left py-3 px-3">Mileage</th>
            <th className="text-right py-3 px-3">Price</th>
            <th className="text-right py-3 px-3">USD Eq.</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => {
            // fx_to_usd না থাকলে বা ১ হলে ফলব্যাক রেট ব্যবহার করা হবে
            const fxRate = r.fx_to_usd && r.fx_to_usd !== 1 
              ? r.fx_to_usd 
              : (FALLBACK_RATES[r.original_currency?.toUpperCase()] || 1.0)
              
            const usdPrice = r.predicted_price * fxRate

            return (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-3 text-textMain">{r.brand}</td>
                <td className="py-3 px-3 text-textMain">{r.model}</td>
                <td className="py-3 px-3 text-textSub">{r.country}</td>
                <td className="py-3 px-3 text-textSub">{r.manufacturing_year}</td>
                <td className="py-3 px-3 text-textSub">{r.fuel_type || '—'}</td>
                <td className="py-3 px-3 text-textSub">{r.mileage ? `${r.mileage.toLocaleString()} km` : '—'}</td>
                <td className="py-3 px-3 text-right text-accent font-medium">
                  {formatCurrency(r.predicted_price, r.original_currency)}
                </td>
                <td className="py-3 px-3 text-right text-textSub font-medium">
                  ${Math.round(usdPrice).toLocaleString()}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}