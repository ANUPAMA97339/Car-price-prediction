import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function MarketTrendChart({ data = [], dataKey = 'price', xKey = 'year', height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis dataKey={xKey} stroke="var(--text-sub)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-sub)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
        <Area type="monotone" dataKey={dataKey} stroke="#3B82F6" fill="url(#trendGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}