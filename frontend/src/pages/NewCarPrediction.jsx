import { useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import NewCarForm from '../components/prediction/NewCarForm.jsx'
import PredictionResult from '../components/prediction/PredictionResult.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import { predictNew } from '../services/predictionService'
import { downloadPredictionReport } from '../services/reportService'

export default function NewCarPrediction() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (form) => {
    setLoading(true); setError(null); setResult(null)
    try {
      const payload = {
        country: form.country,
        brand: form.brand,
        model: form.model,
        manufacturing_year: Number(form.manufacturing_year),
        fuel_type: form.fuel_type || null,
        transmission: form.transmission || null,
        engine_capacity: form.engine_capacity ? Number(form.engine_capacity) : null,
        body_type: form.body_type || null,
        engine_power: form.engine_power ? Number(form.engine_power) : null,
        vehicle_condition: form.vehicle_condition || null,
        currency: form.country === 'USA' ? 'USD'
              : form.country === 'UK' ? 'GBP'
              : form.country === 'Germany' ? 'EUR' : 'INR',
      }
      const data = await predictNew(payload)
      setResult({
        ...data,
        price_range: data.price_range || { min: data.price_min, max: data.price_max },
        limitations: data.limitations,
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onDownload = async () => {
    if (!result?.id) return
    try { await downloadPredictionReport(result.id) } catch (e) { setError(e.message) }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Car Prediction" subtitle="Enter vehicle details to estimate the price of a new car." />
      {error && <ErrorMessage message={error} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NewCarForm onSubmit={handleSubmit} loading={loading} />
        <PredictionResult result={result} onSave={() => {}} onDownload={onDownload} />
      </div>
    </div>
  )
}