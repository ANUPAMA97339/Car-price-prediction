import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'No data yet', message = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="h-14 w-14 rounded-full theme-surface-dim flex items-center justify-center mb-4">
        <Icon className="text-textSub" size={26} />
      </div>
      <p className="text-textMain font-semibold">{title}</p>
      {message && <p className="text-textSub text-sm mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}