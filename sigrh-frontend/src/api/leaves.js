import api from './axios'

const MOCK_DELAY = 500

let mockLeaves = [
  {
    id: 1,
    employeId: 1,
    employeNom: 'Carine Ngono',
    departementNom: 'Ressources humaines',
    type: 'ANNUEL',
    dateDebut: '2026-05-28',
    dateFin: '2026-06-03',
    statut: 'EN_ATTENTE',
    commentaireRH: '',
  },
  {
    id: 2,
    employeId: 2,
    employeNom: 'Patrick Talla',
    departementNom: 'Informatique',
    type: 'MALADIE',
    dateDebut: '2026-05-20',
    dateFin: '2026-05-22',
    statut: 'APPROUVE',
    commentaireRH: 'Justificatif reçu.',
  },
  {
    id: 3,
    employeId: 3,
    employeNom: 'Ariane Mbarga',
    departementNom: 'Finance',
    type: 'PERSONNEL',
    dateDebut: '2026-06-10',
    dateFin: '2026-06-12',
    statut: 'EN_ATTENTE',
    commentaireRH: '',
  },
  {
    id: 4,
    employeId: 4,
    employeNom: 'Eric Fouda',
    departementNom: 'Commercial',
    type: 'SANS_SOLDE',
    dateDebut: '2026-04-15',
    dateFin: '2026-04-16',
    statut: 'REFUSE',
    commentaireRH: 'Période critique.',
  },
]

function wait() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
}

function shouldUseFallback(error) {
  return !error.response || error.response.status === 404 || error.response.status >= 400
}

function normalizeStatus(status) {
  if (status === 'REJETE') return 'REFUSE'
  return status ?? 'EN_ATTENTE'
}

function normalizeLeave(leave) {
  return {
    id: leave.id,
    employeId: leave.employeId,
    employeNom: leave.employeNom ?? leave.employeeName ?? 'Employé',
    departementNom: leave.departementNom ?? leave.departmentName ?? leave.department ?? 'Non renseigné',
    type: leave.type ?? '-',
    dateDebut: leave.dateDebut ?? leave.startDate,
    dateFin: leave.dateFin ?? leave.endDate,
    statut: normalizeStatus(leave.statut ?? leave.status),
    commentaireRH: leave.commentaireRH ?? leave.comment ?? '',
  }
}

function applyFilters(leaves, filters = {}) {
  return leaves.filter((leave) => {
    const statusMatch = !filters.status || leave.statut === filters.status
    const departmentMatch = !filters.department || leave.departementNom === filters.department
    const monthMatch = !filters.month || leave.dateDebut?.startsWith(filters.month)

    return statusMatch && departmentMatch && monthMatch
  })
}

export async function getLeaves(filters = {}) {
  try {
    const response = await api.get('/conges', {
      params: {
        statut: filters.status || undefined,
      },
      silentFallback: true
    })
    const leaves = Array.isArray(response.data) ? response.data : response.data?.content ?? []
    return applyFilters(leaves.map(normalizeLeave), filters)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return applyFilters(mockLeaves.map(normalizeLeave), filters)
  }
}

export async function approveLeave(id, comment = '') {
  try {
    const response = await api.put(`/conges/${id}/valider`, {
      statut: 'APPROUVE',
      commentaire: comment,
    }, { silentFallback: true })
    return normalizeLeave(response.data)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    mockLeaves = mockLeaves.map((leave) =>
      Number(leave.id) === Number(id)
        ? { ...leave, statut: 'APPROUVE', commentaireRH: comment }
        : leave
    )
    return normalizeLeave(mockLeaves.find((leave) => Number(leave.id) === Number(id)))
  }
}

export async function rejectLeave(id, comment = '') {
  try {
    const response = await api.put(`/conges/${id}/valider`, {
      statut: 'REJETE',
      commentaire: comment,
    }, { silentFallback: true })
    return normalizeLeave(response.data)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    mockLeaves = mockLeaves.map((leave) =>
      Number(leave.id) === Number(id)
        ? { ...leave, statut: 'REFUSE', commentaireRH: comment }
        : leave
    )
    return normalizeLeave(mockLeaves.find((leave) => Number(leave.id) === Number(id)))
  }
}

export async function getPendingCount() {
  try {
    const response = await api.get('/conges', { params: { statut: 'EN_ATTENTE' }, silentFallback: true })
    const leaves = Array.isArray(response.data) ? response.data : response.data?.content ?? []
    return leaves.length
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return mockLeaves.filter((leave) => normalizeStatus(leave.statut) === 'EN_ATTENTE').length
  }
}
