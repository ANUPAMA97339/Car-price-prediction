import { useEffect, useState } from 'react'
import { Download, Save, AlertCircle, Cpu, TrendingDown } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'
import CarImage from './CarImage'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function PredictionResult({ result, onSave, onDownload, saving = false }) {
  const [forecast, setForecast] = useState(null)
  const [forecastLoading, setForecastLoading] = useState(false)

  // প্রেডিকশন রেজাল্ট পেলে ফোরকাস্ট ডেটা লোড করবে
  useEffect(() => {
    if (!result) return
    let isMounted = true
    setForecastLoading(true)
    
    const fetchForecast = async () => {
      try {
        const payload = {
          country: result.country,
          brand: result.brand,
          model: result.model,
          manufacturing_year: result.manufacturing_year,
          mileage: result.mileage || 0,
          fuel_type: result.fuel_type,
          transmission: result.transmission,
          engine_capacity: result.engine_capacity,
          currency: result.original_currency,
          vehicle_type: result.vehicle_type
        }
        
        const res = await fetch('http://127.0.0.1:8000/api/forecast/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          const data = await res.json()
          if (isMounted) setForecast(data)
        }
      } catch (err) {
        console.error("Forecast fetch error:", err)
      } finally {
        if (isMounted) setForecastLoading(false)
      }
    }
    
    fetchForecast()
    return () => { isMounted = false }
  }, [result])

  if (!result) {
    return (
      <div className="card text-center py-16 text-textSub text-sm">
        Prediction result will appear here after you submit the form.
      </div>
    )
  }

  // চার্টের জন্য ডেটা ফরম্যাট
  const chartData = forecast ? [
    { label: 'Current', price: forecast.current_price },
    ...forecast.forecasts.map(f => ({ label: f.year.toString(), price: f.expected_price }))
  ] : []

  return (
    <div className="space-y-5">
      {/* মেইন রেজাল্ট কার্ড */}
      <div className="card space-y-5">
        <CarImage brand={result.brand} model={result.model} />
        <div>
          <p className="text-textSub text-xs uppercase tracking-wide">Estimated Price</p>
          <p className="text-3xl md:text-4xl font-bold text-accent mt-1">
            {formatCurrency(result.predicted_price, result.original_currency)}
          </p>
          <p className="text-textSub text-xs mt-1">
            {result.country} · {result.brand} {result.model} · {result.manufacturing_year}
          </p>
        </div>

        {result.price_range && (
          <div className="bg-bgSecondary/60 rounded-lg p-3 text-sm">
            <p className="text-textSub text-xs mb-1">Estimated Range</p>
            <p className="text-textMain">
              {formatCurrency(result.price_range.min, result.original_currency)} –{' '}
              {formatCurrency(result.price_range.max, result.original_currency)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-bgSecondary/60 rounded-lg p-3">
            <p className="text-textSub">Model</p>
            <p className="text-textMain font-medium mt-1 flex items-center gap-1">
              <Cpu size={12} /> {result.model_version || '—'}
            </p>
          </div>
          <div className="bg-bgSecondary/60 rounded-lg p-3">
            <p className="text-textSub">Prediction Date</p>
            <p className="text-textMain font-medium mt-1">
              {new Date(result.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {result.limitations && (
          <div className="flex items-start gap-2 text-warning text-xs bg-warning/10 rounded-lg p-3">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p>{result.limitations}</p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button onClick={onSave} disabled={saving} className="btn-primary disabled:opacity-50">
            <Save size={16} /> {saving ? 'Saving…' : 'Save Prediction'}
          </button>
          <button onClick={onDownload} className="btn-secondary">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* ফোরকাস্ট সেকশন */}
      {forecastLoading && (
        <div className="card text-center py-8 text-textSub text-sm animate-pulse">
          Calculating future price forecast...
        </div>
      )}

      {forecast && !forecastLoading && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title !mb-0">Future Price Forecast</h3>
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">AI Predicted</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {forecast.forecasts.slice(0, 4).map((f, idx) => (
              <div key={idx} className="bg-bgSecondary/60 rounded-lg p-3 border border-white/5">
                <p className="text-textSub text-xs">{f.year} (in {idx + 1} yr{idx > 0 ? 's' : ''})</p>
                <p className="text-textMain font-semibold mt-1">{formatCurrency(f.expected_price, forecast.currency)}</p>
                <p className="text-danger text-[10px] mt-0.5 flex items-center gap-1">
                  <TrendingDown size={10} /> -{f.depreciation_pct}%
                </p>
              </div>
            ))}
          </div>

          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}K`} />
                <Tooltip
                  contentStyle={{ background: '#172033', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => formatCurrency(value, forecast.currency)}
                />
                <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#172033', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-textSub text-[10px] text-center">
            * Forecasts are statistical estimates based on standard depreciation, not guaranteed future prices.
          </p>
        </div>
      )}
    </div>
  )
}