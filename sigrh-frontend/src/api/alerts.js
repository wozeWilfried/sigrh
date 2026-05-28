import api from './axios'

const MOCK_DELAY = 500

function wait(ms = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shouldUseFallback(error) {
  return !error.response || error.response.status === 404 || error.response.status >= 500
}

let mockAlerts = [
  {
    id: 1,
    type: 'CRITICAL',
    employeNom: 'Eric Fouda',
    departement: 'Commercial',
    message: 'Risque de turnover estimé à 91% (Hausse soudaine)',
    date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // Il y a 15 min
    statut: 'ACTIVE',
  },
  {
    id: 2,
    type: 'WARNING',
    employeNom: 'Ariane Mbarga',
    departement: 'Finance',
    message: 'Absence prolongée injustifiée (3 jours consécutifs)',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // Il y a 2h
    statut: 'ACTIVE',
  },
  {
    id: 3,
    type: 'INFO',
    employeNom: 'Jules Kamga',
    departement: 'Informatique',
    message: 'Retards fréquents identifiés sur la dernière semaine',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Il y a 1 jour
    statut: 'ACTIVE',
  },
  {
    id: 4,
    type: 'CRITICAL',
    employeNom: 'Patrick Talla',
    departement: 'Informatique',
    message: 'Conflit potentiel détecté via baisse de performance abrupte',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // Il y a 2 jours
    statut: 'TRAITEE',
  },
  {
    id: 5,
    type: 'WARNING',
    employeNom: 'Fatima Bello',
    departement: 'Direction',
    message: 'Solde de congés presque épuisé (reste 1 jour)',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // Il y a 3 jours
    statut: 'ACTIVE',
  },
]

function applyFilters(alerts, filters) {
  let result = [...alerts]
  if (filters?.type) {
    result = result.filter((a) => a.type === filters.type)
  }
  if (filters?.departement) {
    result = result.filter((a) => a.departement === filters.departement)
  }
  if (filters?.statut) {
    result = result.filter((a) => a.statut === filters.statut)
  }
  return result.sort((a, b) => new Date(b.date) - new Date(a.date))
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getAlerts(filters = {}) {
  try {
    const response = await api.get('/alertes', { params: filters })
    const data = Array.isArray(response.data) ? response.data : response.data?.content ?? []
    return data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return applyFilters(mockAlerts, filters)
  }
}

export async function getUnreadCount() {
  try {
    const response = await api.get('/alertes/count', { params: { statut: 'ACTIVE' } })
    return response.data?.count ?? 0
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    // pas de wait() ici pour éviter de ralentir la navbar si polling
    return mockAlerts.filter((a) => a.statut === 'ACTIVE').length
  }
}

export async function markAsTreated(id) {
  try {
    const response = await api.put(`/alertes/${id}/traiter`)
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait(300)
    mockAlerts = mockAlerts.map((a) =>
      a.id === id ? { ...a, statut: 'TRAITEE' } : a
    )
    return mockAlerts.find((a) => a.id === id)
  }
}

export async function markAllAsTreated() {
  try {
    const response = await api.put('/alertes/traiter-tout')
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait(600)
    mockAlerts = mockAlerts.map((a) => ({ ...a, statut: 'TRAITEE' }))
    return true
  }
}
