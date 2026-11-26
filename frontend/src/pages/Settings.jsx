import { useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import { useApp } from '../context/AppContext.jsx'
import { COUNTRIES, CURRENCIES } from '../utils/constants'
import { clearHistory } from '../services/historyService'
import { Trash2, ShieldAlert, Monitor, Globe, Info } from 'lucide-react'

export default function Settings() {
  const { theme, toggleTheme, country, setCountry, currency, setCurrency } = useApp()
  const [clearing, setClearing] = useState(false)

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete ALL prediction history? This action cannot be undone.')) return
    
    setClearing(true)
    try {
      await clearHistory()
      alert('History cleared successfully.')
    } catch (e) {
      alert('Failed to clear history: ' + e.message)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Settings" subtitle="Manage application preferences and data." />

      {/* Hero Image Section */}
      <div className="card overflow-hidden p-0 relative h-48 md:h-56 w-full rounded-xl">
        <img
          src="https://images.unsplash.com/photo-1588592680932-58f506d57269?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
          alt="Settings"
          className="w-full h-full object-cover absolute inset-0"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        {/* গ্রেডিয়েন্ট ঠিক করা হয়েছে যাতে লেখা স্পষ্ট দেখা যায় */}
        <div className="absolute inset-0 bg-gradient-to-r from-bgPrimary/90 via-bgPrimary/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 shadow-sm">Application Settings</h2>
          <p className="text-textMain text-xs md:text-sm max-w-md font-medium shadow-sm">Customize your experience and manage local data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Display Settings */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
              <Monitor size={16} />
            </div>
            <h3 className="text-textMain font-semibold">Display</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textMain text-sm font-medium">Theme</p>
              <p className="text-textSub text-xs">Switch between dark and light mode.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="btn-secondary text-xs w-24"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card space-y-4 border-danger/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-danger/15 text-danger flex items-center justify-center">
            <ShieldAlert size={16} />
          </div>
          <h3 className="text-textMain font-semibold">Data Management</h3>
        </div>
        <div className="bg-danger/5 rounded-lg p-4 border border-danger/10">
          <p className="text-textMain text-sm font-medium mb-1">Clear Prediction History</p>
          <p className="text-textSub text-xs mb-3">
            This will permanently delete all saved predictions from the local SQLite database. This action cannot be undone.
          </p>
          <button 
            onClick={handleClearHistory} 
            disabled={clearing}
            className="btn-danger text-xs disabled:opacity-50"
          >
            <Trash2 size={14} /> {clearing ? 'Clearing...' : 'Clear Local History'}
          </button>
        </div>
      </div>

      {/* Application Info */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-white/5 text-textSub flex items-center justify-center">
            <Info size={16} />
          </div>
          <h3 className="text-textMain font-semibold">Application Info</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-textSub text-xs">Version</p>
            <p className="text-textMain font-medium mt-1">1.0.0</p>
          </div>
          <div>
            <p className="text-textSub text-xs">License</p>
            <p className="text-textMain font-medium mt-1">MIT</p>
          </div>
          <div className="col-span-2">
            <p className="text-textSub text-xs">Authentication</p>
            <p className="text-textMain font-medium mt-1">No login required</p>
          </div>
        </div>
      </div>
    </div>
  )
}