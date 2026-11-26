import api from './api'

export async function predictNew(payload) {
  const { data } = await api.post('/api/predictions/new', payload)
  return data
}

export async function predictUsed(payload) {
  const { data } = await api.post('/api/predictions/used', payload)
  return data
}

export async function comparePrices(items) {
  const { data } = await api.post('/api/compare', { items })
  return data
}