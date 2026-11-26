import { Trash2, Download } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

export default function PredictionTable({ items = [], onDelete, onDownload }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-textSub text-xs uppercase tracking-wide border-b theme-border">
            <th className="text-left py-3 px-3">Date</th>
            <th className="text-left py-3 px-3">Type</th>
            <th className="text-left py-3 px-3">Brand / Model</th>
            <th className="text-left py-3 px-3">Country</th>
            <th className="text-left py-3 px-3">Year</th>
            <th className="text-right py-3 px-3">Price</th>
            <th className="text-right py-3 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-b theme-border hover:bg-bgPrimary">
              <td className="py-3 px-3 text-textSub whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
              <td className="py-3 px-3">
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${r.vehicle_type === 'new' ? 'bg-accent/15 text-accent' : 'bg-accentAlt/15 text-accentAlt'}`}>
                  {r.vehicle_type}
                </span>
              </td>
              <td className="py-3 px-3 text-textMain">{r.brand} {r.model}</td>
              <td className="py-3 px-3 text-textSub">{r.country}</td>
              <td className="py-3 px-3 text-textSub">{r.manufacturing_year}</td>
              <td className="py-3 px-3 text-right text-accent font-medium">{formatCurrency(r.predicted_price, r.original_currency)}</td>
              <td className="py-3 px-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onDownload?.(r)} className="p-1.5 rounded hover:bg-bgPrimary text-textSub hover:text-accent" title="Download">
                    <Download size={14} />
                  </button>
                  <button onClick={() => onDelete?.(r)} className="p-1.5 rounded hover:bg-bgPrimary text-textSub hover:text-danger" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}