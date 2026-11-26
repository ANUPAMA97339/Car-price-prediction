import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const COLORS = { accent: '#3B82F6', alt: '#06B6D4' }

export default function PriceChart({ data = [], dataKey = 'price', xKey = 'label', height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis dataKey={xKey} stroke="var(--text-sub)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-sub)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: 'var(--text-main)' }}
          itemStyle={{ color: 'var(--text-main)' }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={COLORS.accent} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}