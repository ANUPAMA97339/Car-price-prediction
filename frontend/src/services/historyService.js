import api from './api'

export async function listHistory(params = {}) {
  const { data } = await api.get('/api/history', { params })
  return data
}

export async function deleteHistory(id) {
  await api.delete(`/api/history/${id}`)
}

export async function clearHistory() {
  await api.delete('/api/history')
}