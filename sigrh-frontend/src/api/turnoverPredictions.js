import api from './axios'

const MOCK_DELAY_SHORT = 600
const MOCK_DELAY_PREDICT = 2000

function wait(ms = MOCK_DELAY_SHORT) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shouldUseFallback(error) {
  return !error.response || error.response.status === 404 || error.response.status >= 500
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const FACTEURS = {
  HIGH: [
    'Absences fréquentes',
    'Performance en baisse',
    'Ancienneté faible',
    'Conflits signalés',
    'Rémunération sous marché',
    'Manque de progression',
  ],
  MED: [
    'Retards répétés',
    'Faible engagement',
    'Feedback négatif',
    'Charge de travail élevée',
    'Pas de formation récente',
  ],
  LOW: [
    'Satisfaction stable',
    'Bon historique présence',
    'Revue positive récente',
  ],
}

function pickFactors(level, count = 3) {
  const pool = FACTEURS[level]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

let mockPredictions = [
  {
    id: 1,
    employeId: 4,
    employeNom: 'Eric Fouda',
    departement: 'Commercial',
    poste: 'Commercial Senior',
    scoreRisque: 91,
    niveau: 'ELEVE',
    facteurs: ['Absences fréquentes', 'Performance en baisse', 'Rémunération sous marché'],
    dateCalcul: '2026-05-24',
  },
  {
    id: 2,
    employeId: 2,
    employeNom: 'Patrick Talla',
    departement: 'Informatique',
    poste: 'Développeur Backend',
    scoreRisque: 84,
    niveau: 'ELEVE',
    facteurs: ['Manque de progression', 'Rémunération sous marché', 'Feedback négatif'],
    dateCalcul: '2026-05-24',
  },
  {
    id: 3,
    employeId: 7,
    employeNom: 'Lucie Abanda',
    departement: 'Juridique',
    poste: 'Juriste',
    scoreRisque: 77,
    niveau: 'ELEVE',
    facteurs: ['Charge de travail élevée', 'Conflits signalés', 'Ancienneté faible'],
    dateCalcul: '2026-05-24',
  },
  {
    id: 4,
    employeId: 5,
    employeNom: 'Fatima Bello',
    departement: 'Direction',
    poste: 'Assistante Direction',
    scoreRisque: 62,
    niveau: 'MOYEN',
    facteurs: ['Retards répétés', 'Pas de formation récente'],
    dateCalcul: '2026-05-24',
  },
  {
    id: 5,
    employeId: 6,
    employeNom: 'Jules Kamga',
    departement: 'Informatique',
    poste: 'Ingénieur Réseau',
    scoreRisque: 55,
    niveau: 'MOYEN',
    facteurs: ['Faible engagement', 'Charge de travail élevée'],
    dateCalcul: '2026-05-24',
  },
  {
    id: 6,
    employeId: 3,
    employeNom: 'Ariane Mbarga',
    departement: 'Finance',
    poste: 'Comptable',
    scoreRisque: 48,
    niveau: 'MOYEN',
    facteurs: ['Retards répétés', 'Feedback négatif'],
    dateCalcul: '2026-05-24',
  },
  {
    id: 7,
    employeId: 8,
    employeNom: 'Samuel Nkomo',
    departement: 'Informatique',
    poste: 'Chef de Projet',
    scoreRisque: 28,
    niveau: 'FAIBLE',
    facteurs: ['Satisfaction stable', 'Bon historique présence'],
    dateCalcul: '2026-05-24',
  },
  {
    id: 8,
    employeId: 1,
    employeNom: 'Carine Ngono',
    departement: 'Ressources humaines',
    poste: 'Responsable RH',
    scoreRisque: 14,
    niveau: 'FAIBLE',
    facteurs: ['Revue positive récente', 'Satisfaction stable'],
    dateCalcul: '2026-05-24',
  },
]

// Simule un recalcul IA avec variation réaliste des scores
function recalculate(predictions) {
  return predictions.map((p) => {
    const delta = Math.floor((Math.random() - 0.4) * 10)
    const newScore = Math.min(100, Math.max(0, p.scoreRisque + delta))
    const niveau = newScore >= 70 ? 'ELEVE' : newScore >= 40 ? 'MOYEN' : 'FAIBLE'
    const factorLevel = newScore >= 70 ? 'HIGH' : newScore >= 40 ? 'MED' : 'LOW'
    return {
      ...p,
      scoreRisque: newScore,
      niveau,
      facteurs: pickFactors(factorLevel, niveau === 'ELEVE' ? 3 : 2),
      dateCalcul: new Date().toISOString().slice(0, 10),
    }
  })
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

function normalizePrediction(p) {
  const score = p.scoreRisque ?? p.riskScore ?? p.score ?? 0
  return {
    id: p.id,
    employeId: p.employeId ?? p.employeeId,
    employeNom: p.employeNom ?? p.employeeName ?? p.name ?? 'Employé',
    departement: p.departement ?? p.department ?? '-',
    poste: p.poste ?? p.jobTitle ?? '',
    scoreRisque: score,
    niveau: p.niveau ?? p.riskLevel ?? (score >= 70 ? 'ELEVE' : score >= 40 ? 'MOYEN' : 'FAIBLE'),
    facteurs: p.facteurs ?? p.factors ?? [],
    dateCalcul: p.dateCalcul ?? p.calculatedAt ?? new Date().toISOString().slice(0, 10),
  }
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Récupère les prédictions de turnover.
 * @param {{ niveau?: string, departement?: string }} filters
 * @returns {Promise<Array>}
 */
export async function getTurnoverPredictions(filters = {}) {
  try {
    const response = await api.get('/ia/predictions', { params: filters })
    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.content ?? []
    return data.map(normalizePrediction)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    let result = mockPredictions.map(normalizePrediction)
    if (filters.niveau) result = result.filter((p) => p.niveau === filters.niveau)
    if (filters.departement) result = result.filter((p) => p.departement === filters.departement)
    return result.sort((a, b) => b.scoreRisque - a.scoreRisque)
  }
}

/**
 * Lance une nouvelle prédiction IA (POST).
 * @returns {Promise<Array>}
 */
export async function runTurnoverPrediction() {
  try {
    const response = await api.post('/ia/predict')
    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.predictions ?? response.data?.content ?? []
    return data.map(normalizePrediction)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait(MOCK_DELAY_PREDICT)
    mockPredictions = recalculate(mockPredictions)
    return mockPredictions.map(normalizePrediction).sort((a, b) => b.scoreRisque - a.scoreRisque)
  }
}
