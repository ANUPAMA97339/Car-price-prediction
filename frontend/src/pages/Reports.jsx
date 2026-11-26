import { useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import { FileText, Download, BarChart3, History, ArrowRight } from 'lucide-react'
import { downloadAnalyticsReport } from '../services/reportService'
import { Link } from 'react-router-dom'

export default function Reports() {
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleAnalytics = async () => {
    setBusy(true); setError(null)
    try { await downloadAnalyticsReport() } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader title="Reports" subtitle="Generate professional PDF reports from real data." />
      
      {error && <ErrorMessage message={error} />}

      {/* Hero Section */}
      <div className="card overflow-hidden p-0 relative h-48 md:h-64 w-full rounded-xl">
        <img
          src="https://images.unsplash.com/photo-1612083544368-970eb9cf609d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
          alt="Reports"
          className="w-full h-full object-cover absolute inset-0"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bgPrimary/90 via-bgPrimary/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 shadow-sm">Download Your Data</h2>
          <p className="text-textMain text-xs md:text-sm max-w-md font-medium shadow-sm">
            Export real market insights and individual prediction histories as clean, formatted PDFs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market Analytics Card */}
        <div className="card flex flex-col justify-between group hover:border-accent/40 transition-colors">
          <div>
            <div className="h-12 w-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <h3 className="font-semibold text-textMain text-lg mb-2">Market Analytics Report</h3>
            <p className="text-textSub text-sm mb-6 leading-relaxed">
              Generates a comprehensive PDF containing your saved predictions, country-wise distribution, brand statistics, and overall model performance metrics.
            </p>
          </div>
          <button 
            onClick={handleAnalytics} 
            disabled={busy} 
            className="btn-primary w-full sm:w-auto self-start text-sm disabled:opacity-50"
          >
            <Download size={16} /> {busy ? 'Generating PDF…' : 'Generate Analytics PDF'}
          </button>
        </div>

        {/* Individual Prediction Card */}
        <div className="card flex flex-col justify-between group hover:border-accentAlt/40 transition-colors">
          <div>
            <div className="h-12 w-12 rounded-xl bg-accentAlt/15 text-accentAlt flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <History size={24} />
            </div>
            <h3 className="font-semibold text-textMain text-lg mb-2">Individual Prediction Reports</h3>
            <p className="text-textSub text-sm mb-6 leading-relaxed">
              Need a specific car's report? Navigate to your Prediction History to view detailed breakdowns and download a professional PDF for any single vehicle.
            </p>
          </div>
          <Link to="/history" className="btn-secondary w-full sm:w-auto self-start text-sm inline-flex">
            Go to History <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card bg-bgSecondary/50 border-dashed border-white/10 flex items-start gap-4 p-5">
        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
          <FileText size={20} className="text-textSub" />
        </div>
        <div>
          <p className="text-textMain font-medium text-sm mb-1">How are these generated?</p>
          <p className="text-textSub text-xs leading-relaxed">
            All PDF reports are generated securely on your local Python backend using <strong className="text-textMain">ReportLab</strong>. 
            No data is sent to any external paid API. The reports contain only real data currently stored in your SQLite database.
          </p>
        </div>
      </div>
    </div>
  )
}