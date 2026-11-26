import { AlertTriangle } from 'lucide-react'

export default function ErrorMessage({ title = 'Something went wrong', message = 'Please try again.', onRetry }) {
  return (
    <div className="bg-danger/10 border border-danger/40 rounded-xl p-5 flex items-start gap-3">
      <AlertTriangle className="text-danger shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <p className="text-danger font-semibold text-sm">{title}</p>
        <p className="text-textSub text-sm mt-1">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary mt-3 text-xs">Retry</button>
        )}
      </div>
    </div>
  )
}
