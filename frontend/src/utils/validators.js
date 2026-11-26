export function required(value) {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

export function positiveNumber(value) {
  return required(value) && Number(value) > 0
}

export function yearInRange(value, min = 1950, max = new Date().getFullYear() + 1) {
  const n = Number(value)
  return Number.isInteger(n) && n >= min && n <= max
}

export function validateNewCar(form) {
  const errors = {}
  if (!required(form.country)) errors.country = 'Country is required'
  if (!required(form.brand)) errors.brand = 'Brand is required'
  if (!required(form.model)) errors.model = 'Model is required'
  if (!yearInRange(form.manufacturing_year)) errors.manufacturing_year = 'Invalid year'
  if (!positiveNumber(form.engine_capacity)) errors.engine_capacity = 'Engine capacity required'
  if (!required(form.fuel_type)) errors.fuel_type = 'Fuel type required'
  if (!required(form.transmission)) errors.transmission = 'Transmission required'
  if (!required(form.body_type)) errors.body_type = 'Body type required'
  return errors
}

export function validateUsedCar(form) {
  const errors = validateNewCar(form)
  delete errors.body_type
  if (!positiveNumber(form.mileage)) errors.mileage = 'Mileage must be positive'
  if (!required(form.vehicle_condition)) errors.vehicle_condition = 'Condition required'
  return errors
}