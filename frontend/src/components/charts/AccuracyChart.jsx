import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, ZAxis } from 'recharts'

export default function AccuracyChart({ data = [], height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis dataKey="actual" name="Actual" stroke="var(--text-sub)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis dataKey="predicted" name="Predicted" stroke="var(--text-sub)" fontSize={11} tickLine={false} axisLine={false} />
        <ZAxis range={[40, 120]} />
        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
        <Scatter data={data} fill="#06B6D4" />
      </ScatterChart>
    </ResponsiveContainer>
  )
}