import { useState, useMemo } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import { GitCompareArrows, Plus, TrendingDown, TrendingUp, Sparkles, CheckCircle2, Gauge, Fuel, Calendar, MapPin, DollarSign } from 'lucide-react'
import { listHistory } from '../services/historyService'
import { comparePrices } from '../services/predictionService'
import ComparisonTable from '../components/tables/ComparisonTable.jsx'
import { formatCurrency } from '../utils/formatCurrency'
import CarImage from '../components/prediction/CarImage'

// ডিফল্ট এক্সচেঞ্জ রেট (USD এর সাপেক্ষে)
const FX_RATES = {
  USD: 1.0,
  INR: 83.0,
  EUR: 0.92,
  GBP: 0.79
}

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP']

export default function ComparePrices() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [bestCar, setBestCar] = useState(null)
  const [displayCurrency, setDisplayCurrency] = useState('USD') // নতুন স্টেট

  const loadFromHistory = async () => {
    setLoading(true); setError(null)
    try {
      const data = await listHistory({ limit: 20 })
      if (!data.items || data.items.length === 0) {
        throw new Error("No predictions found. Please create some predictions first.")
      }

      const result = await comparePrices(
        (data.items || []).map((r) => ({
          id: r.id,
          vehicle_type: r.vehicle_type,
          country: r.country,
          brand: r.brand,
          model: r.model,
          manufacturing_year: r.manufacturing_year,
          mileage: r.mileage,
          fuel_type: r.fuel_type,
          transmission: r.transmission,
          original_currency: r.original_currency,
          predicted_price: r.predicted_price,
        })),
      )
      
      const comparedItems = result.items || []
      
      // fx_to_usd ক্যালকুলেশন (যদি ব্যাকএন্ড থেকে না আসে)
      const normalizedItems = comparedItems.map(item => {
        let rate = item.fx_to_usd
        if (!rate || rate === 1) {
          const ccy = item.original_currency?.toUpperCase() || 'USD'
          rate = ccy === 'USD' ? 1 : (1 / (FX_RATES[ccy] || 1))
        }
        return { ...item, fx_to_usd: rate }
      })
      
      setItems(normalizedItems)

      // AI Verdict: সবচেয়ে কম USD দামের গাড়ি
      if (normalizedItems.length > 0) {
        const sortedByPrice = [...normalizedItems].sort((a, b) => {
          const priceA = a.predicted_price * a.fx_to_usd
          const priceB = b.predicted_price * b.fx_to_usd
          return priceA - priceB
        })
        setBestCar(sortedByPrice[0])
      }
    } catch (e) { 
      setError(e.message) 
    } finally { 
      setLoading(false) 
    }
  }

  // ক্যালকুলেট করা: Lowest, Highest, Difference নির্দিষ্ট কারেন্সিতে
  const summaryData = useMemo(() => {
    if (items.length === 0) return null

    // সব গাড়ির দামকে USD-তে নিয়ে আসা
    const usdPrices = items.map(item => item.predicted_price * item.fx_to_usd)
    const minUsd = Math.min(...usdPrices)
    const maxUsd = Math.max(...usdPrices)
    const spreadUsd = maxUsd - minUsd

    // USD থেকে ডিজায়ার্ড কারেন্সিতে রূপান্তর
    const rateToDisplay = FX_RATES[displayCurrency] || 1

    return {
      min: minUsd * rateToDisplay,
      max: maxUsd * rateToDisplay,
      spread: spreadUsd * rateToDisplay,
      currency: displayCurrency
    }
  }, [items, displayCurrency])

  // bestCar এর দাম ডিজায়ার্ড কারেন্সিতে
  const bestCarUsd = bestCar ? bestCar.predicted_price * bestCar.fx_to_usd : 0
  const bestCarDisplayPrice = bestCarUsd * (FX_RATES[displayCurrency] || 1)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader 
        title="Compare Prices"
        subtitle="AI-powered comparison of your saved predictions (normalised across currencies)."
        action={
          <button 
            onClick={loadFromHistory} 
            disabled={loading} 
            className="btn-primary disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={16} /> 
            {loading ? 'Loading Data…' : 'Load My Predictions'}
          </button>
        } 
      />

      {error && <ErrorMessage message={error} onRetry={loadFromHistory} />}

      {/* Hero Section */}
      <div className="card overflow-hidden p-0 relative h-40 md:h-52 w-full rounded-xl">
        <img
          src="https://images.unsplash.com/photo-1590424599820-0e7a41598db9?w=900&auto=format&fit=crop&q=60"
          alt="Compare Cars"
          className="w-full h-full object-cover absolute inset-0"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bgPrimary/95 via-bgPrimary/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 shadow-sm">Find the Best Value</h2>
          <p className="text-textMain text-xs md:text-sm max-w-md font-medium shadow-sm">
            Compare specs and prices. Let our AI determine the best car for you.
          </p>
        </div>
      </div>

      {items.length === 0 && !loading ? (
        <div className="card py-12">
          <EmptyState 
            icon={GitCompareArrows} 
            title="No predictions loaded" 
            message="Click the 'Load My Predictions' button above to fetch your saved data and compare them side-by-side." 
            action={
              <button onClick={loadFromHistory} className="btn-secondary mt-2">
                <Plus size={16} /> Load Now
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* Currency Selector */}
          <div className="flex justify-end">
            <div className="bg-card border border-white/10 rounded-lg p-1 flex items-center gap-1 shadow-sm">
              {CURRENCIES.map(ccy => (
                <button
                  key={ccy}
                  onClick={() => setDisplayCurrency(ccy)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    displayCurrency === ccy 
                      ? 'bg-accent text-white shadow-md' 
                      : 'text-textSub hover:text-textMain hover:bg-white/5'
                  }`}
                >
                  {ccy}
                </button>
              ))}
            </div>
          </div>

          {/* AI Verdict Section */}
          {bestCar && (
            <div className="card bg-gradient-to-br from-accent/10 via-card to-card border-accent/30 overflow-hidden relative">
              <div className="absolute -right-10 -top-10 text-accent/5 rotate-12">
                <Sparkles size={200} />
              </div>
              
              <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                <div className="w-full lg:w-1/3">
                  <div className="rounded-xl overflow-hidden h-48 lg:h-full shadow-lg">
                    <CarImage brand={bestCar.brand} model={bestCar.model} />
                  </div>
                </div>

                <div className="w-full lg:w-2/3 flex flex-col justify-center space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                      <Sparkles size={14} /> AI Verdict: Best Value
                    </div>
                    <h2 className="text-3xl font-bold text-textMain">{bestCar.brand} {bestCar.model}</h2>
                    <p className="text-textSub text-sm mt-1">Based on lowest price across all compared currencies.</p>
                  </div>

                  <div className="flex flex-wrap items-end gap-4">
                    <div>
                      <p className="text-textSub text-xs uppercase tracking-wide">Orginal Price</p>
                      <p className="text-4xl font-bold text-accent mt-1">
                        {formatCurrency(bestCarDisplayPrice, displayCurrency)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                    <div className="bg-bgSecondary/60 rounded-lg p-2">
                      <p className="text-textSub text-[10px] flex items-center gap-1"><Calendar size={10} /> Year</p>
                      <p className="text-textMain text-xs font-medium mt-0.5">{bestCar.manufacturing_year}</p>
                    </div>
                    <div className="bg-bgSecondary/60 rounded-lg p-2">
                      <p className="text-textSub text-[10px] flex items-center gap-1"><MapPin size={10} /> Country</p>
                      <p className="text-textMain text-xs font-medium mt-0.5">{bestCar.country}</p>
                    </div>
                    <div className="bg-bgSecondary/60 rounded-lg p-2">
                      <p className="text-textSub text-[10px] flex items-center gap-1"><Gauge size={10} /> Mileage</p>
                      <p className="text-textMain text-xs font-medium mt-0.5">{bestCar.mileage ? `${bestCar.mileage.toLocaleString()} km` : '—'}</p>
                    </div>
                    <div className="bg-bgSecondary/60 rounded-lg p-2">
                      <p className="text-textSub text-[10px] flex items-center gap-1"><Fuel size={10} /> Fuel</p>
                      <p className="text-textMain text-xs font-medium mt-0.5">{bestCar.fuel_type || '—'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-success text-sm mt-2">
                    <CheckCircle2 size={16} />
                    <span>Best option among {items.length} compared vehicles.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards - এখন ডাইনামিক কারেন্সি */}
          {summaryData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card bg-success/5 border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={18} className="text-success" />
                  <p className="text-textMain font-semibold text-sm">Lowest Price</p>
                </div>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(summaryData.min, summaryData.currency)}
                </p>
              </div>
              <div className="card bg-danger/5 border-danger/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-danger" />
                  <p className="text-textMain font-semibold text-sm">Highest Price</p>
                </div>
                <p className="text-2xl font-bold text-danger">
                  {formatCurrency(summaryData.max, summaryData.currency)}
                </p>
              </div>
              <div className="card bg-accent/5 border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <GitCompareArrows size={18} className="text-accent" />
                  <p className="text-textMain font-semibold text-sm">Price Difference</p>
                </div>
                <p className="text-2xl font-bold text-accent">
                  {formatCurrency(summaryData.spread, summaryData.currency)}
                </p>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title !mb-0">Detailed Comparison</h3>
              <span className="text-xs text-textSub bg-white/5 px-2 py-1 rounded-md">
                {items.length} vehicles loaded
              </span>
            </div>
            <ComparisonTable items={items} />
          </div>
        </>
      )}
    </div>
  )
}