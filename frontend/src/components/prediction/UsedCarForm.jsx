import { useState } from 'react'
import { SelectField, InputField, BRANDS, COUNTRIES, FUEL_TYPES, TRANSMISSIONS, VEHICLE_CONDITIONS } from './VehicleForm'
import { validateUsedCar } from '../../utils/validators'
import { CURRENT_YEAR } from '../../utils/constants'

const initial = {
  country: '', brand: '', model: '', manufacturing_year: '',
  mileage: '', fuel_type: '', transmission: '', engine_capacity: '',
  owner_count: '', accident_history: 'No', vehicle_condition: 'Good', currency: 'INR',
}

export default function UsedCarForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validateUsedCar(form)
    setErrors(errs)
    if (Object.keys(errs).length === 0 && onSubmit) onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="section-title">Vehicle Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField label="Country" value={form.country} onChange={set('country')} options={COUNTRIES} error={errors.country} />
        <SelectField label="Brand" value={form.brand} onChange={set('brand')} options={BRANDS} error={errors.brand} />
        <InputField label="Model" value={form.model} onChange={set('model')} error={errors.model} placeholder="e.g. Swift, Civic" />
        <SelectField label="Manufacturing Year" value={form.manufacturing_year} onChange={set('manufacturing_year')}
          options={Array.from({ length: CURRENT_YEAR - 1990 + 1 }, (_, i) => CURRENT_YEAR - i)} error={errors.manufacturing_year} />
        <InputField label="Mileage (km)" type="number" value={form.mileage} onChange={set('mileage')} error={errors.mileage} placeholder="45000" />
        <InputField label="Engine Capacity (cc)" type="number" value={form.engine_capacity} onChange={set('engine_capacity')} error={errors.engine_capacity} placeholder="1197" />
        <SelectField label="Fuel Type" value={form.fuel_type} onChange={set('fuel_type')} options={FUEL_TYPES} error={errors.fuel_type} />
        <SelectField label="Transmission" value={form.transmission} onChange={set('transmission')} options={TRANSMISSIONS} error={errors.transmission} />
        <InputField label="Owner Count (optional)" type="number" value={form.owner_count} onChange={set('owner_count')} placeholder="1" />
        <SelectField label="Accident History" value={form.accident_history} onChange={set('accident_history')} options={['No', 'Minor', 'Major', 'Unknown']} />
        <SelectField label="Vehicle Condition" value={form.vehicle_condition} onChange={set('vehicle_condition')} options={VEHICLE_CONDITIONS} error={errors.vehicle_condition} />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? 'Predicting…' : 'Predict Price'}
        </button>
      </div>
    </form>
  )
}