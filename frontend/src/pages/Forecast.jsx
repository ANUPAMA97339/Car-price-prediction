import { useEffect, useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import CarImage from '../components/prediction/CarImage'
import { TrendingUp, AlertCircle, Gauge, Fuel, Settings2, Calendar, DollarSign, Activity, MousePointer2 } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { formatCurrency } from '../utils/formatCurrency'
import { listHistory } from '../services/historyService'

export default function Forecast() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [selectedCar, setSelectedCar] = useState("")
  const [carInfo, setCarInfo] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await listHistory({ limit: 100 })
        const uniqueCars = Array.from(
          new Map(
            (data.items || []).map(item => [
              `${item.brand}-${item.model}-${item.manufacturing_year}`, 
              item
            ])
          ).values()
        )
        setHistory(uniqueCars)
      } catch (err) {
        setError("Failed to load prediction history.")
      }
    }
    fetchHistory()
  }, [])

  const handleCarSelect = async (e) => {
    const selectedValue = e.target.value
    setSelectedCar(selectedValue)
    setError(null)
    
    const carData = history.find(c => `${c.brand}-${c.model}-${c.manufacturing_year}` === selectedValue)
    setCarInfo(carData || null)

    if (carData) {
      setLoading(true)
      
      const payload = {
        country: carData.country,
        brand: carData.brand,
        model: carData.model,
        manufacturing_year: carData.manufacturing_year,
        mileage: carData.mileage || 0,
        fuel_type: carData.fuel_type,
        transmission: carData.transmission,
        currency: carData.original_currency,
        vehicle_type: carData.vehicle_type
      }
      
      try {
        const res = await fetch('http://127.0.0.1:8000/api/forecast/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Forecast failed')
        const data = await res.json()
        setResult(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    } else {
      setResult(null)
    }
  }

  // প্লেসহোল্ডার ডেটা (যখন কোনো গাড়ি সিলেক্ট করা থাকে না)
  const placeholderData = [
    { label: '2024', price: 40000 },
    { label: '2025', price: 35000 },
    { label: '2026', price: 31000 },
    { label: '2027', price: 27000 },
    { label: '2028', price: 24000 },
    { label: '2029', price: 20000 },
  ]

  const chartData = result ? [
    { label: 'Current', price: result.current_price },
    ...result.forecasts.map(f => ({ label: f.year.toString(), price: f.expected_price }))
  ] : placeholderData

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && result) {
      return (
        <div className="bg-card border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md">
          <p className="text-textSub text-xs mb-1 font-medium">{label}</p>
          <p className="text-accent font-bold text-lg">
            {formatCurrency(payload[0].value, result?.currency || 'USD')}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader title="Price Forecast" subtitle="Select a previously predicted car to see its AI-powered future price trend." />
      
      {error && <ErrorMessage message={error} />}

      {/* Selector Card */}
      <div className="card bg-gradient-to-br from-card via-bgSecondary to-bgPrimary relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative space-y-4">
          <div>
            <label className="label-field">Select a Car from Your History</label>
            <select 
              value={selectedCar} 
              onChange={handleCarSelect} 
              className="input-field bg-bgSecondary/80 backdrop-blur-sm border-white/10"
            >
              <option value="">-- Choose a car --</option>
              {history.map((car) => (
                <option key={`${car.brand}-${car.model}-${car.manufacturing_year}`} value={`${car.brand}-${car.model}-${car.manufacturing_year}`}>
                  {car.brand} {car.model} ({car.manufacturing_year}) - {car.country}
                </option>
              ))}
            </select>
          </div>
          
          {history.length === 0 && (
            <div className="flex items-center gap-2 text-warning text-sm bg-warning/10 p-3 rounded-lg">
              <AlertCircle size={16} />
              <p>No prediction history found. Please create a prediction first.</p>
            </div>
          )}
        </div>
      </div>

      {/* Car Info & Image (Only when selected) */}
      {carInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-1">
            <div className="card p-0 overflow-hidden h-full min-h-[300px] shadow-lg">
              <CarImage brand={carInfo.brand} model={carInfo.model} />
            </div>
          </div>

          <div className="lg:col-span-2 card flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-textMain">{carInfo.brand} {carInfo.model}</h2>
                  <p className="text-textSub text-sm flex items-center gap-2 mt-1">
                    <span>{carInfo.country}</span>
                    <span className="w-1 h-1 rounded-full bg-textSub/50" />
                    <span>{carInfo.manufacturing_year}</span>
                    <span className="w-1 h-1 rounded-full bg-textSub/50" />
                    <span className="capitalize">{carInfo.vehicle_type}</span>
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-accent/15 text-accent font-medium capitalize">
                  {carInfo.vehicle_type} Car
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                <div className="bg-bgSecondary/50 rounded-lg p-3">
                  <p className="text-textSub text-xs flex items-center gap-1"><Gauge size={12} /> Mileage</p>
                  <p className="text-textMain text-sm font-medium mt-1">{carInfo.mileage ? `${carInfo.mileage.toLocaleString()} km` : '—'}</p>
                </div>
                <div className="bg-bgSecondary/50 rounded-lg p-3">
                  <p className="text-textSub text-xs flex items-center gap-1"><Fuel size={12} /> Fuel</p>
                  <p className="text-textMain text-sm font-medium mt-1">{carInfo.fuel_type || '—'}</p>
                </div>
                <div className="bg-bgSecondary/50 rounded-lg p-3">
                  <p className="text-textSub text-xs flex items-center gap-1"><Settings2 size={12} /> Transmission</p>
                  <p className="text-textMain text-sm font-medium mt-1">{carInfo.transmission || '—'}</p>
                </div>
                <div className="bg-bgSecondary/50 rounded-lg p-3">
                  <p className="text-textSub text-xs flex items-center gap-1"><Calendar size={12} /> Year</p>
                  <p className="text-textMain text-sm font-medium mt-1">{carInfo.manufacturing_year}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Chart & Summary (Always visible) */}
      <div className="space-y-6 animate-fade-in mt-6">
        
        {/* Summary Cards - Only when result is available */}
        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <div className="card bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
              <p className="text-textSub text-xs uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={14} className="text-accent" /> Current Value
              </p>
              <p className="text-3xl font-bold text-accent mt-3">{formatCurrency(result.current_price, result.currency)}</p>
              <p className="text-textSub text-xs mt-1">Today's estimated market price</p>
            </div>
            <div className="card bg-gradient-to-br from-success/10 to-transparent border-success/20">
              <p className="text-textSub text-xs uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-success" /> Next Year
              </p>
              <p className="text-3xl font-bold text-success mt-3">{formatCurrency(result.forecasts[0].expected_price, result.currency)}</p>
              <p className="text-textSub text-xs mt-1">Expected value next year</p>
            </div>
            <div className="card bg-gradient-to-br from-danger/10 to-transparent border-danger/20">
              <p className="text-textSub text-xs uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-danger rotate-180" /> In 5 Years
              </p>
              <p className="text-3xl font-bold text-danger mt-3">{formatCurrency(result.forecasts[4].expected_price, result.currency)}</p>
              <p className="text-textSub text-xs mt-1">Estimated resale in 5 years</p>
            </div>
          </div>
        )}

        {/* Chart Container */}
        <div className="card relative shadow-lg overflow-hidden min-h-[400px]">
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-20 bg-bgSecondary/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <Activity size={32} className="text-accent animate-pulse mb-3" />
              <p className="text-accent text-sm font-medium animate-pulse">Updating Forecast Chart...</p>
            </div>
          )}

          {/* Placeholder Overlay (When no car is selected) */}
          {!result && !loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-t from-bgPrimary via-bgPrimary/50 to-transparent pointer-events-none pb-10">
              <div className="bg-bgSecondary/90 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center shadow-2xl border border-white/10">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <MousePointer2 size={24} className="text-accent animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-textMain mb-1">Waiting for Selection</h3>
                <p className="text-textSub text-sm text-center max-w-xs">
                  Select a car from the dropdown above to generate its AI-powered future price forecast.
                </p>
              </div>
            </div>
          )}

          {/* Chart Header */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="section-title !mb-0 flex items-center gap-2">
              <Activity size={18} className="text-accent" /> Price Trend & Forecast
            </h3>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${result ? 'bg-accent/10 text-accent' : 'bg-white/5 text-textSub'}`}>
              {result ? 'AI Prediction' : 'Preview Mode'}
            </span>
          </div>

          {/* Chart */}
          <div className={`relative z-0 transition-opacity duration-500 ${!result ? 'opacity-40 grayscale' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  fill="url(#colorPrice)" 
                  dot={{ r: 5, fill: '#172033', stroke: '#3B82F6', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-textSub text-[11px] text-center mt-4 relative z-10">
            * Forecast is generated by an ML Time-Series model with recursive lag prediction. Actual prices may vary.
          </p>
        </div>
      </div>
    </div>
  )
}