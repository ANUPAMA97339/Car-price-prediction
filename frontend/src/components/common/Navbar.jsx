import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Sun, Moon, Search, Car, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { COUNTRIES, CURRENCIES } from '../../utils/constants'
import { listHistory } from '../../services/historyService'

const TITLES = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/predict': 'Predict Price',
  '/predict/new': 'New Car Prediction',
  '/predict/used': 'Used Car Prediction',
  '/compare': 'Compare Prices',
  '/market': 'Market Analysis',
  '/history': 'Prediction History',
  '/forecast': 'Price Forecast',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    toggleTheme, theme,
    sidebarCollapsed, setSidebarCollapsed,
    mobileSidebarOpen, setMobileSidebarOpen,
    country, setCountry, currency, setCurrency,
  } = useApp()
  
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const title = useMemo(() => TITLES[location.pathname] || 'Not Found', [location.pathname])

  useEffect(() => {
    const c = COUNTRIES.find((x) => x.value === country)
    if (c) setCurrency(c.currency)
  }, [country, setCurrency])

  // সার্চ লজিক (গাড়ির হিস্টোরি থেকে সার্চ করবে)
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await listHistory({ search: query, limit: 5 })
        setSearchResults(data.items || [])
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) setMobileSidebarOpen(!mobileSidebarOpen)
    else setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleSearchSelect = (item) => {
    setQuery('')
    setIsSearchOpen(false)
    // হিস্টোরি পেজে গিয়ে সার্চ করা গাড়িটি দেখাবে
    navigate(`/history?search=${item.brand} ${item.model}`)
  }

  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b theme-border bg-bgSecondary px-3 sm:gap-3 sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          onClick={handleMenuClick}
          className="p-2 rounded-lg hover:bg-bgPrimary text-textSub shrink-0 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="truncate text-sm font-semibold text-textMain sm:text-base">{title}</h1>
      </div>

      {/* Search Bar */}
      <div className="relative hidden min-w-0 max-w-xs flex-1 items-center gap-2 md:flex">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSub" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsSearchOpen(true)
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search cars, brands…"
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        {/* Search Dropdown */}
        {isSearchOpen && query.trim() && (
          <div className="absolute left-0 top-12 z-50 w-full overflow-hidden rounded-xl border theme-border bg-card shadow-2xl">
            {isSearching ? (
              <div className="p-4 text-center text-xs text-textSub">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleSearchSelect(item)}
                    className="px-4 py-2 hover:bg-bgSecondary cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                      <div className="h-6 w-6 rounded bg-accent/10 flex items-center justify-center">
                        <Car size={12} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-textMain text-sm font-medium">{item.brand} {item.model}</p>
                        <p className="text-textSub text-[10px]">{item.manufacturing_year} • {item.country}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-textSub group-hover:text-accent" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-textSub">No results found</div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Premium Animated Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="relative flex h-[30px] w-[60px] shrink-0 cursor-pointer items-center justify-between rounded-full border theme-border bg-bgPrimary p-1 transition-colors duration-300 hover:border-accent/50 focus:outline-none"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <div
            className={`absolute top-1 left-1 w-[22px] h-[22px] rounded-full bg-accent shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out ${
              theme === 'light' ? 'translate-x-[30px] bg-warning' : 'translate-x-0'
            }`}
          >
            {theme === 'dark' ? (
              <Moon size={12} className="text-white" />
            ) : (
              <Sun size={12} className="text-white" />
            )}
          </div>
          <div className="flex w-full justify-between px-1.5 opacity-40">
            <Moon size={10} className={theme === 'dark' ? 'text-accent' : 'text-textSub'} />
            <Sun size={10} className={theme === 'light' ? 'text-warning' : 'text-textSub'} />
          </div>
        </button>
      </div>
    </header>
  )
}