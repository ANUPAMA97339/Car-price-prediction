import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import PredictionTable from '../components/tables/PredictionTable.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import Loader from '../components/common/Loader.jsx'
import { History as HistoryIcon, Trash2, Search } from 'lucide-react'
import { listHistory, deleteHistory, clearHistory } from '../services/historyService'
import { downloadPredictionReport } from '../services/reportService'

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')
  const [vtype, setVtype] = useState('')

  const reload = async () => {
    setLoading(true); setError(null)
    try {
      const data = await listHistory({ limit: 200 })
      setItems(data.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  const filtered = useMemo(() => items.filter((r) => {
    const q = query.toLowerCase()
    const okQ = !q || `${r.brand} ${r.model}`.toLowerCase().includes(q)
    const okC = !country || r.country === country
    const okT = !vtype || r.vehicle_type === vtype
    return okQ && okC && okT
  }), [items, query, country, vtype])

  const handleDelete = async (row) => {
    if (!confirm(`Delete prediction for ${row.brand} ${row.model}?`)) return
    try {
      await deleteHistory(row.id)
      setItems((prev) => prev.filter((r) => r.id !== row.id))
    } catch (e) {
      setError(e.message)
    }
  }

  const handleClear = async () => {
    if (!confirm('Clear all prediction history? This cannot be undone.')) return
    try {
      await clearHistory()
      setItems([])
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDownload = async (row) => {
    try { await downloadPredictionReport(row.id) } catch (e) { setError(e.message) }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prediction History"
        subtitle={`${items.length} saved prediction(s) on this server.`}
        action={
          <button onClick={handleClear} disabled={!items.length} className="btn-danger disabled:opacity-50">
            <Trash2 size={16} /> Clear All
          </button>
        }
      />
      {error && <ErrorMessage message={error} onRetry={reload} />}

      <div className="card flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSub" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder="Search by brand or model…" className="input-field pl-9" />
        </div>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-field !w-auto text-xs">
          <option value="">All Countries</option>
          <option>India</option><option>USA</option><option>UK</option><option>Germany</option>
        </select>
        <select value={vtype} onChange={(e) => setVtype(e.target.value)} className="input-field !w-auto text-xs">
          <option value="">All Types</option>
          <option value="new">New</option><option value="used">Used</option>
        </select>
      </div>

      <div className="card">
        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState icon={HistoryIcon} title="No predictions yet" message="Run a prediction to see it here." />
        ) : (
          <PredictionTable items={filtered} onDelete={handleDelete} onDownload={handleDownload} />
        )}
      </div>
    </div>
  )
}