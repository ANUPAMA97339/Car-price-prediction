import { useEffect, useState } from 'react'
import { History, Car, CarFront, DollarSign, Globe2, Tag, RefreshCw } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import StatsCard from '../components/dashboard/StatsCard.jsx'
import ChartCard from '../components/charts/ChartCard.jsx'
import TrendsChart from '../components/charts/TrendsChart.jsx'
import PriceDistribution from '../components/charts/PriceDistribution.jsx'
import RecentPredictions from '../components/dashboard/RecentPredictions.jsx'
import ModelPerformanceSummary from '../components/dashboard/ModelPerformance.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import Loader from '../components/common/Loader.jsx'
import { getOverview, getCountries, getBrands, getTrends, getModelPerformance } from '../services/analyticsService'
import { listHistory } from '../services/historyService'

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [countries, setCountries] = useState([])
  const [brands, setBrands] = useState([])
  const [trends, setTrends] = useState([])
  const [recent, setRecent] = useState([])
  const [model, setModel] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [ov, co, br, tr, modelInfo, hist] = await Promise.all([
        getOverview(), 
        getCountries(), 
        getBrands(), 
        getTrends(),
        getModelPerformance(), 
        listHistory({ limit: 5 }),
      ])
      setOverview(ov)
      setCountries(co || [])
      setBrands(br || [])
      setTrends(tr || [])
      setModel(modelInfo.active_model)
      setRecent(hist.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    load() 
  }, [])

  // ট্রেন্ডস ডেটা ফরম্যাট (Recharts-এর জন্য উপযুক্ত করা হচ্ছে)
  const formattedTrends = trends.map((t) => ({
    label: t.label,
    count: t.count,
  }))

  return (
    <div className="space-y-6">
      {/* Header & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Dashboard" subtitle="Overview of predictions, models, and market activity." />
        <button 
          onClick={load} 
          disabled={loading} 
          className="btn-secondary text-xs self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={load} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard 
          label="Total Predictions" 
          value={overview?.total_predictions ?? 0} 
          icon={History} 
          tone="accent" 
          loading={loading}
        />
        <StatsCard 
          label="New Cars" 
          value={overview?.new_count ?? 0} 
          icon={Car} 
          tone="success" 
          loading={loading}
        />
        <StatsCard 
          label="Used Cars" 
          value={overview?.used_count ?? 0} 
          icon={CarFront} 
          tone="warning" 
          loading={loading}
        />
        <StatsCard 
          label="Avg. Price" 
          value={overview?.avg_predicted_price ? Math.round(overview.avg_predicted_price).toLocaleString() : '—'} 
          icon={DollarSign} 
          tone="alt" 
          loading={loading}
        />
        <StatsCard 
          label="Countries" 
          value={overview?.countries_supported ?? 0} 
          icon={Globe2} 
          tone="accent" 
          loading={loading}
        />
        <StatsCard 
          label="Brands" 
          value={overview?.brands_supported ?? 0} 
          icon={Tag} 
          tone="alt" 
          loading={loading}
        />
      </div>

      {/* Charts Row 1: Trends & Country */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard 
            title="Prediction Trends" 
            subtitle="Number of predictions over time" 
            empty={!trends.length && !loading}
          >
            {loading ? <Loader /> : <TrendsChart data={formattedTrends} reverse={true} />}
          </ChartCard>
        </div>
        <ChartCard 
          title="Country Distribution" 
          subtitle="Predictions by country"
          empty={!countries.length && !loading}
        >
          {loading ? <Loader /> : (
            <PriceDistribution 
              data={countries.map((c) => ({ range: c.country, count: c.count }))} 
              color="#06B6D4"
            />
          )}
        </ChartCard>
      </div>

      {/* Charts Row 2: Brands & Avg Price */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard 
          title="Top Brands" 
          subtitle="Most predicted brands"
          empty={!brands.length && !loading}
        >
          {loading ? <Loader /> : (
            <PriceDistribution 
              data={brands.slice(0, 8).map((b) => ({ range: b.brand, count: b.count }))} 
              color="#22C55E"
            />
          )}
        </ChartCard>
        <ChartCard 
          title="Average Price by Country" 
          subtitle="Note: Currencies differ across countries"
          empty={!countries.length && !loading}
        >
          {loading ? <Loader /> : (
            <PriceDistribution 
              data={countries.map((c) => ({ range: c.country, count: Math.round(c.avg_price || 0) }))} 
              color="#3B82F6" 
            />
          )}
        </ChartCard>
      </div>

      {/* Bottom Row: Recent Predictions & Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title !mb-0">Recent Predictions</h3>
            <a href="/history" className="text-xs text-accent hover:underline">View All</a>
          </div>
          {loading ? <Loader /> : <RecentPredictions items={recent} />}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title !mb-0">Active Model</h3>
            <a href="/model" className="text-xs text-accent hover:underline">Details</a>
          </div>
          {loading ? <Loader /> : <ModelPerformanceSummary model={model} />}
        </div>
      </div>
    </div>
  )
}