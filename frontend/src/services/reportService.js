import api from './api'

async function downloadPdf(endpoint, payload, filename) {
  const { data } = await api.post(endpoint, payload, { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function downloadPredictionReport(predictionId) {
  return downloadPdf('/api/reports/prediction', { prediction_id: predictionId },
    `prediction_${predictionId}.pdf`)
}

export function downloadAnalyticsReport() {
  return downloadPdf('/api/reports/analytics', {}, 'analytics.pdf')
}