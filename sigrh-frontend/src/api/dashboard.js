import api from './axios'

const MOCK_DELAY = 500
function wait(ms = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shouldUseFallback(error) {
  return !error.response || error.response.status === 404 || error.response.status >= 500
}

// ── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_KPIS = {
  employesActifs: 142,
  employesVariation: '+3',
  tauxPresence: 94.2,
  presenceVariation: '+1.2%',
  congesEnAttente: 8,
  congesVariation: '-2',
  alertesActives: 15,
  alertesVariation: '+5',
}

const MOCK_ATTENDANCE_STATS = [
  { month: 'Oct', presences: 92, absences: 8 },
  { month: 'Nov', presences: 94, absences: 6 },
  { month: 'Dec', presences: 89, absences: 11 },
  { month: 'Jan', presences: 95, absences: 5 },
  { month: 'Fev', presences: 96, absences: 4 },
  { month: 'Mar', presences: 94, absences: 6 },
]

const MOCK_DEPARTMENTS = [
  { name: 'Commercial', value: 45 },
  { name: 'IT', value: 35 },
  { name: 'Finance', value: 20 },
  { name: 'RH', value: 12 },
  { name: 'Direction', value: 8 },
]

const MOCK_RISK_TRENDS = [
  { month: 'Oct', score: 25 },
  { month: 'Nov', score: 22 },
  { month: 'Dec', score: 35 }, // fin d'année, stress
  { month: 'Jan', score: 18 },
  { month: 'Fev', score: 20 },
  { month: 'Mar', score: 28 },
]

const MOCK_RECENT_LEAVES = [
  { id: 1, employe: 'Alice Dubois', date: '2023-11-15', statut: 'EN_ATTENTE' },
  { id: 2, employe: 'Marc Leblanc', date: '2023-11-14', statut: 'APPROUVE' },
  { id: 3, employe: 'Sophie Martin', date: '2023-11-12', statut: 'REJETE' },
  { id: 4, employe: 'Luc Bernard', date: '2023-11-10', statut: 'EN_ATTENTE' },
  { id: 5, employe: 'Emma Petit', date: '2023-11-09', statut: 'APPROUVE' },
]

const MOCK_EVOLUTION = Array.from({ length: 12 }, (_, i) => ({
  mois: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][i],
  nbPresences: Math.floor(Math.random() * 30 + 70),
  nbAbsences: Math.floor(Math.random() * 8 + 2),
  nbConges: Math.floor(Math.random() * 5 + 1),
  scoreRisqueMoyen: Math.round((Math.random() * 20 + 15) * 100) / 100,
}))

const MOCK_RECENT_ALERTS = [
  { id: 1, employe: 'Julien Morel', type: 'CRITICAL', message: 'Risque de turnover élevé (89%)', date: 'Il y a 2h' },
  { id: 2, employe: 'Sarah Kone', type: 'WARNING', message: 'Absence prolongée (3 jours)', date: 'Il y a 5h' },
  { id: 3, employe: 'David Leroy', type: 'INFO', message: 'Retards fréquents (4 cette semaine)', date: 'Hier' },
  { id: 4, employe: 'Marie Roux', type: 'WARNING', message: 'Baisse de performance détectée', date: 'Hier' },
  { id: 5, employe: 'Paul Blanc', type: 'CRITICAL', message: 'Conflit potentiel dans l\'équipe', date: 'Il y a 2 jours' },
]

// ── API Functions ─────────────────────────────────────────────────────────

export async function getDashboardKpis() {
  try {
    const response = await api.get('/dashboard/kpis')
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return MOCK_KPIS
  }
}

export async function getAttendanceStats() {
  try {
    const response = await api.get('/dashboard/attendance-stats')
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return MOCK_ATTENDANCE_STATS
  }
}

export async function getDepartmentDistribution() {
  try {
    const response = await api.get('/dashboard/department-distribution')
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return MOCK_DEPARTMENTS
  }
}

export async function getRiskTrends() {
  try {
    const response = await api.get('/dashboard/risk-trends')
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return MOCK_RISK_TRENDS
  }
}

export async function getRecentLeaves() {
  try {
    const response = await api.get('/dashboard/recent-leaves')
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return MOCK_RECENT_LEAVES
  }
}

export async function getRecentAlerts() {
  try {
    const response = await api.get('/dashboard/recent-alerts')
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return MOCK_RECENT_ALERTS
  }
}

export async function getEvolution(annee = 2025, departement = '') {
  try {
    const params = { annee }
    if (departement) params.departement = departement
    const response = await api.get('/dashboard/evolution', { params })
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return MOCK_EVOLUTION
  }
}
