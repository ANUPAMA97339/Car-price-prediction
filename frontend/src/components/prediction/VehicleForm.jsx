import { BRANDS, COUNTRIES, CURRENT_YEAR, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, VEHICLE_CONDITIONS } from '../../utils/constants'

export function Field({ label, error, children, hint }) {
  return (
    <div>
      <label className="label-field">{label}</label>
      {children}
      {hint && !error && <p className="text-textSub text-[11px] mt-1">{hint}</p>}
      {error && <p className="text-danger text-[11px] mt-1">{error}</p>}
    </div>
  )
}

export function SelectField({ label, error, value, onChange, options, placeholder }) {
  return (
    <Field label={label} error={error}>
      <select value={value} onChange={onChange} className="input-field">
        <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </Field>
  )
}

export function InputField({ label, error, type = 'text', ...props }) {
  return (
    <Field label={label} error={error}>
      <input type={type} className="input-field" {...props} />
    </Field>
  )
}

export const baseFields = (
  <>
    {/* This is a helper constant; concrete forms are defined in NewCarForm / UsedCarForm */}
  </>
)

export const yearOptions = Array.from({ length: CURRENT_YEAR - 1990 + 1 }, (_, i) => CURRENT_YEAR - i)
export { BRANDS, COUNTRIES, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, VEHICLE_CONDITIONS }