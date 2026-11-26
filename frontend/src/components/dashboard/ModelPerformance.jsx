import { formatCurrency } from '../../utils/formatCurrency'

export default function ModelPerformanceSummary({ model }) {
  if (!model) {
    return <p className="text-textSub text-sm">Model metrics will appear after training.</p>
  }
  const rows = [
    ['Model', model.model_name],
    ['Version', model.model_version],
    ['MAE', model.mae != null ? formatCurrency(model.mae) : '—'],
    ['RMSE', model.rmse != null ? formatCurrency(model.rmse) : '—'],
    ['R²', model.r2_score != null ? model.r2_score.toFixed(4) : '—'],
  ]
  return (
    <div className="space-y-2 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3">
          <span className="text-textSub">{k}</span>
          <span className="text-textMain font-medium truncate">{String(v)}</span>
        </div>
      ))}
    </div>
  )
}