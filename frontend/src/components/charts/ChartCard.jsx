export default function ChartCard({ title, subtitle, children, action, empty = false }) {
  return (
    <div className="card flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="section-title !mb-0">{title}</h3>
          {subtitle && <p className="text-textSub text-xs mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1">
        {empty ? (
          <div className="h-48 flex items-center justify-center text-textSub text-sm">No data available</div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}