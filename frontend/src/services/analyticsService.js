import api from './api'

export async function getOverview() {
  const { data } = await api.get('/api/analytics/overview')
  return data
}

export async function getCountries() {
  const { data } = await api.get('/api/analytics/countries')
  return data
}

export async function getBrands() {
  const { data } = await api.get('/api/analytics/brands')
  return data
}

export async function getTrends() {
  const { data } = await api.get('/api/analytics/trends')
  return data
}

export async function getModelPerformance() {
  const { data } = await api.get('/api/model/performance')
  return data
}