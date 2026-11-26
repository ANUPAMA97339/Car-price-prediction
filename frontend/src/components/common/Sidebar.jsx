import { NavLink } from 'react-router-dom'
import {
  Home, LayoutDashboard, Calculator, Car, CarFront, GitCompareArrows,
  TrendingUp, History as HistoryIcon, FileText, BarChart3, Info,
  Settings as SettingsIcon, Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'

const groups = [
  {
    label: 'Main',
    items: [
      { to: '/', label: 'Home', icon: Home, end: true },
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Prediction',
    items: [
      { to: '/predict/new', label: 'New Car', icon: Car },
      { to: '/predict/used', label: 'Used Car', icon: CarFront },
      { to: '/compare', label: 'Compare Prices', icon: GitCompareArrows },
      { to: '/forecast', label: 'Price Forecast', icon: TrendingUp },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/market', label: 'Market Analysis', icon: TrendingUp },
      { to: '/history', label: 'History', icon: HistoryIcon },
      { to: '/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
]

export default function Sidebar() {
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useApp()
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const isMobile = viewportWidth < 768
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024
  const isExpanded = isMobile || (isTablet && mobileSidebarOpen) || (!isTablet && !isMobile && !sidebarCollapsed)

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', updateViewportWidth)
    return () => window.removeEventListener('resize', updateViewportWidth)
  }, [])

  return (
    <aside
      className={`${
        sidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-64'
      } fixed inset-y-0 left-0 z-[60] flex h-screen h-[100dvh] w-64 shrink-0 flex-col border-r theme-border bg-bgSecondary
      transition-[transform,width] duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:w-[76px] md:translate-x-0 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${
        isTablet && mobileSidebarOpen ? 'md:!fixed md:!inset-y-0 md:!left-0 md:!z-[60] md:!w-64' : ''
      } lg:static lg:translate-x-0`}
    >
      {/* Logo / Brand */}
      <div
        className={`h-16 flex items-center border-b theme-border shrink-0 overflow-hidden ${
          isExpanded ? 'justify-center px-2 lg:justify-start lg:px-5 lg:gap-3' : 'justify-center px-2'
        }`}
      >
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-accentAlt flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
          <Car size={18} className="text-white" />
        </div>
        {isExpanded && (
          <div className="min-w-0 lg:block">
            <p className="text-sm font-bold text-textMain leading-tight truncate">
              Global Car AI
            </p>
            <p className="text-[10px] text-textSub/70 uppercase tracking-wider">
              Price Predictor
            </p>
          </div>
        )}
      </div>

      {/* Navigation — only this area scrolls */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-5 sidebar-scroll">
        {groups.map((g) => (
          <div key={g.label}>
            {isExpanded ? (
              <p className={`${isMobile || isTablet ? '' : 'hidden lg:block'} px-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-textSub/60`}>
                {g.label}
              </p>
            ) : (
              <div className="mx-3 mb-2 h-px theme-surface-dim" />
            )}

            <div className="space-y-1 px-2">
              {g.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={isExpanded ? undefined : label}
                  onClick={() => {
                    if (viewportWidth < 1024) setMobileSidebarOpen(false)
                  }}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-lg text-sm transition-all duration-200 ${
                      isExpanded ? 'justify-start px-3 py-2.5' : 'justify-center px-0 py-2.5'
                    } ${
                      isActive
                        ? 'bg-accent/15 text-accent font-medium shadow-sm shadow-accent/10'
                        : 'text-textSub hover:text-textMain hover:bg-bgPrimary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-accent" />
                      )}

                      <Icon
                        size={18}
                        className={`shrink-0 transition-transform duration-200 ${
                          isActive ? 'scale-110' : 'group-hover:scale-110'
                        }`}
                      />

                      {isExpanded && (
                        <span className={`${isMobile || isTablet ? '' : 'hidden lg:inline'} truncate`}>{label}</span>
                      )}

                      {/* Tooltip when collapsed */}
                      {!isExpanded && (
                        <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-card text-textMain text-xs font-medium whitespace-nowrap border theme-border shadow-xl opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50">
                          {label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer badge */}
      {isExpanded ? (
        <div className="p-3 border-t theme-border shrink-0">
          <div className="rounded-lg bg-gradient-to-br from-accent/15 to-accentAlt/10 border border-accent/20 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-accent">
              <Sparkles size={12} /> AI-Powered
            </p>
            <p className="text-[10px] text-textSub mt-1 leading-snug">
              Predictions are estimates, not guarantees.
            </p>
          </div>
        </div>
      ) : (
        <div className="hidden p-3 border-t theme-border shrink-0 justify-center md:flex">
          <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <Sparkles size={14} className="text-accent" />
          </div>
        </div>
      )}
    </aside>
  )
}