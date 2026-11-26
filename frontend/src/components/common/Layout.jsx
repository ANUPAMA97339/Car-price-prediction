import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import { useApp } from '../../context/AppContext.jsx'

export default function Layout() {
  const { pathname } = useLocation()
  const { mobileSidebarOpen, setMobileSidebarOpen } = useApp()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="flex h-screen h-[100dvh] min-h-0 overflow-hidden bg-bgPrimary">
      <Sidebar />
      {mobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:p-5 lg:p-6 xl:p-8">
          <div className="animate-fade-in mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}