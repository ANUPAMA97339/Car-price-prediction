import { useEffect, useState } from 'react'

export default function StatsCard({ label, value, hint, icon: Icon, tone = 'accent', loading = false }) {
  const tones = {
    accent: 'text-accent bg-accent/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
    alt: 'text-accentAlt bg-accentAlt/10',
  }
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (loading || typeof value !== 'number') return
    let start = 0
    const target = Number(value)
    const step = Math.max(1, Math.floor(target / 40))
    const id = setInterval(() => {
      start += step
      if (start >= target) { setDisplay(target); clearInterval(id) } else setDisplay(start)
    }, 18)
    return () => clearInterval(id)
  }, [value, loading])

  if (loading) return <div className="card skeleton h-28" />

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-textSub text-xs uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-textMain mt-2">
            {typeof value === 'number' ? display.toLocaleString() : value}
          </p>
          {hint && <p className="text-textSub text-xs mt-1 truncate">{hint}</p>}
        </div>
        {Icon && (
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  )
}