import { Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout.jsx'

import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NewCarPrediction from './pages/NewCarPrediction.jsx'
import UsedCarPrediction from './pages/UsedCarPrediction.jsx'
import ComparePrices from './pages/ComparePrices.jsx'
import MarketAnalysis from './pages/MarketAnalysis.jsx'
import History from './pages/History.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import Forecast from './pages/Forecast.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/predict/new" element={<NewCarPrediction />} />
        <Route path="/predict/used" element={<UsedCarPrediction />} />
        <Route path="/compare" element={<ComparePrices />} />
        <Route path="/market" element={<MarketAnalysis />} />
        <Route path="/history" element={<History />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/forecast" element={<Forecast />} />
      </Route>
    </Routes>
  )
}