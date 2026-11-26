import { useEffect, useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import ChartCard from '../components/charts/ChartCard.jsx'
import MarketTrendChart from '../components/charts/MarketTrendChart.jsx'
import PriceDistribution from '../components/charts/PriceDistribution.jsx'
import MarketDataTable from '../components/tables/MarketDataTable.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Loader from '../components/common/Loader.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import { TrendingUp } from 'lucide-react'
import { getCountries, getBrands, getTrends } from '../services/analyticsService'

export default function MarketAnalysis() {
  const [countries, setCountries] = useState([])
  const [brands, setBrands] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [co, br, tr] = await Promise.all([
        getCountries(), getBrands(), getTrends(),
      ])
      setCountries(co || [])
      setBrands(br || [])
      setTrends(tr || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Market Analysis"
        subtitle="Explore real market trends from your saved predictions."
      />

      {error && <ErrorMessage message={error} onRetry={load} />}
      {loading && <Loader />}

      {!loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="Country-wise Predictions"
              subtitle="Number of predictions per country"
              empty={!countries.length}
            >
              <PriceDistribution
                data={countries.map((c) => ({ range: c.country, count: c.count }))}
                color="#06B6D4"
              />
            </ChartCard>

            <ChartCard
              title="Average Price by Country"
              subtitle="Note: currencies differ — do not compare directly"
              empty={!countries.length}
            >
              <PriceDistribution
                data={countries.map((c) => ({ range: c.country, count: Math.round(c.avg_price || 0) }))}
                color="#3B82F6"
              />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="Brand-wise Predictions"
              subtitle="Top brands by prediction count"
              empty={!brands.length}
            >
              <PriceDistribution
                data={brands.map((b) => ({ range: b.brand, count: b.count }))}
                color="#22C55E"
              />
            </ChartCard>

            <ChartCard
              title="Prediction Trend"
              subtitle="Predictions over time (monthly)"
              empty={!trends.length}
            >
              <MarketTrendChart
                data={trends.map((t) => ({ year: t.label, price: t.count }))}
              />
            </ChartCard>
          </div>

          <div className="card">
            <h3 className="section-title">Country Statistics</h3>
            {countries.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No market data yet"
                message="Run some predictions to see country-level stats here."
              />
            ) : (
              <MarketDataTable
                items={countries.map((c) => ({
                  country: c.country,
                  brand: '—',
                  vehicle_type: 'mixed',
                  avg_price: c.avg_price,
                  currency: c.currency,
                  listings: c.count,
                }))}
              />
            )}
          </div>

          <div className="card">
            <h3 className="section-title">Brand Statistics</h3>
            {brands.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No brand data yet"
                message="Predict more cars to populate brand analysis."
              />
            ) : (
              <MarketDataTable
                items={brands.map((b) => ({
                  country: '—',
                  brand: b.brand,
                  vehicle_type: 'mixed',
                  avg_price: b.avg_price,
                  currency: 'INR',
                  listings: b.count,
                }))}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
