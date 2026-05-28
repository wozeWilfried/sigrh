import api from './axios'

const MOCK_DELAY = 500

function wait(ms = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shouldUseFallback(error) {
  return !error.response || error.response.status === 404 || error.response.status >= 500
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10)
}

function buildLast30DaysAttendances() {
  const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'RETARD', 'ABSENT']

  return Array.from({ length: 30 }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - index)

    return {
      id: index + 1,
      date: toIsoDate(date),
      statut: statuses[index % statuses.length],
    }
  })
}

function mockEmployee(id) {
  return {
    id,
    nom: 'Ngono',
    prenom: 'Carine',
    email: 'carine.ngono@sigrh.cm',
    telephone: '+237 6 75 42 18 09',
    poste: 'Responsable RH',
    departementNom: 'Ressources humaines',
    statut: 'ACTIF',
    photoUrl: '',
    soldeConges: 18,
  }
}

function mockLeaves(id) {
  return [
    {
      id: `${id}-leave-1`,
      dateDebut: '2026-04-08',
      dateFin: '2026-04-12',
      type: 'ANNUEL',
      statut: 'APPROUVE',
    },
    {
      id: `${id}-leave-2`,
      dateDebut: '2026-05-29',
      dateFin: '2026-05-30',
      type: 'PERSONNEL',
      statut: 'EN_ATTENTE',
    },
    {
      id: `${id}-leave-3`,
      dateDebut: '2026-03-15',
      dateFin: '2026-03-16',
      type: 'MALADIE',
      statut: 'REJETE',
    },
  ]
}

function mockAIScore() {
  return {
    score: 32,
    factors: ['Deux retards sur les 30 derniers jours', 'Charge de travail stable', 'Solde de congés sain'],
    lastCalculatedAt: '2026-05-24',
  }
}

export async function getEmployeeById(id) {
  try {
    const response = await api.get(`/employes/${id}`)
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return mockEmployee(id)
  }
}

export async function getAttendances(id) {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 29)

  try {
    const response = await api.get(`/presences/employe/${id}`, {
      params: {
        debut: toIsoDate(start),
        fin: toIsoDate(end),
      },
    })
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return buildLast30DaysAttendances()
  }
}

export async function getLeaves(id) {
  try {
    const response = await api.get('/conges', { params: { employeId: id } })
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return mockLeaves(id)
  }
}

export async function getAIScore(id) {
  try {
    const response = await api.get(`/ia/employees/${id}/score`)
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return mockAIScore(id)
  }
}
