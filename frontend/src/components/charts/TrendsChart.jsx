import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function TrendsChart({ data = [], height = 280, reverse = false }) {
  // ১. ডেটা রিভার্স (নতুন ডেটা বামে বা ডানে নেওয়ার জন্য)
  let chartData = reverse ? [...data].reverse() : data

  // ২. যদি মাত্র ১টি ডেটা পয়েন্ট থাকে, তবে চার্ট সুন্দর দেখানোর জন্য একটি ফাঁকা পয়েন্ট যোগ করা
  if (chartData.length === 1) {
    chartData = [
      { label: '', count: 0 }, // ফাঁকা পয়েন্ট
      { ...chartData[0] },
      { label: '', count: 0 }  // ফাঁকা পয়েন্ট
    ]
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="bg-card border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-textSub text-xs mb-1 font-medium">{label}</p>
          <p className="text-accent font-bold text-lg">
            {payload[0].value} <span className="text-textMain text-xs font-normal">predictions</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          {/* রিভার্স ফ্লোর জন্য গ্রেডিয়েন্ট */}
          <linearGradient id="colorCount" x1="0" y1={reverse ? "1" : "0"} x2="0" y2={reverse ? "0" : "1"}>
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
        <XAxis 
          dataKey="label" 
          stroke="#94A3B8" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          dy={10}
        />
        <YAxis 
          stroke="#94A3B8" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          allowDecimals={false}
          // Y অক্ষ ০ থেকে শুরু হবে
          domain={[0, 'dataMax + 1']}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="#3B82F6" 
          strokeWidth={3} 
          fillOpacity={1} 
          fill="url(#colorCount)" 
          dot={{ r: 4, fill: '#172033', stroke: '#3B82F6', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}