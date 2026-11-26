export function SkeletonCard({ className = 'h-32' }) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4"><div className="skeleton h-4 w-full" /></td>
      ))}
    </tr>
  )
}