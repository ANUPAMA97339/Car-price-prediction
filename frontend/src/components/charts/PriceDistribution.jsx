import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function PriceDistribution({ data = [], dataKey = 'count', xKey = 'range', height = 260, color = '#06B6D4' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis dataKey={xKey} stroke="var(--text-sub)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-sub)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}