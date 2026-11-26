const SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }

export function formatCurrency(amount, currency = 'INR') {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  const symbol = SYMBOLS[currency] || ''
  return `${symbol}${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function formatCompact(amount) {
  const n = Number(amount)
  if (Number.isNaN(n)) return '—'
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} L`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(Math.round(n))
}