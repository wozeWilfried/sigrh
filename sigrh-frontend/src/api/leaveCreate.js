import api from './axios'

const MOCK_DELAY = 500

function wait(ms = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shouldUseFallback(error) {
  return !error.response || error.response.status === 404 || error.response.status >= 500
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockEmployees = [
  {
    id: 1,
    nom: 'Ngono',
    prenom: 'Carine',
    nomComplet: 'Carine Ngono',
    poste: 'Responsable RH',
    departement: 'Ressources humaines',
    email: 'c.ngono@sigrh.cm',
  },
  {
    id: 2,
    nom: 'Talla',
    prenom: 'Patrick',
    nomComplet: 'Patrick Talla',
    poste: 'Développeur Backend',
    departement: 'Informatique',
    email: 'p.talla@sigrh.cm',
  },
  {
    id: 3,
    nom: 'Mbarga',
    prenom: 'Ariane',
    nomComplet: 'Ariane Mbarga',
    poste: 'Comptable',
    departement: 'Finance',
    email: 'a.mbarga@sigrh.cm',
  },
  {
    id: 4,
    nom: 'Fouda',
    prenom: 'Eric',
    nomComplet: 'Eric Fouda',
    poste: 'Commercial Senior',
    departement: 'Commercial',
    email: 'e.fouda@sigrh.cm',
  },
  {
    id: 5,
    nom: 'Bello',
    prenom: 'Fatima',
    nomComplet: 'Fatima Bello',
    poste: 'Assistante Direction',
    departement: 'Direction',
    email: 'f.bello@sigrh.cm',
  },
  {
    id: 6,
    nom: 'Kamga',
    prenom: 'Jules',
    nomComplet: 'Jules Kamga',
    poste: 'Ingénieur Réseau',
    departement: 'Informatique',
    email: 'j.kamga@sigrh.cm',
  },
  {
    id: 7,
    nom: 'Abanda',
    prenom: 'Lucie',
    nomComplet: 'Lucie Abanda',
    poste: 'Juriste',
    departement: 'Juridique',
    email: 'l.abanda@sigrh.cm',
  },
  {
    id: 8,
    nom: 'Nkomo',
    prenom: 'Samuel',
    nomComplet: 'Samuel Nkomo',
    poste: 'Chef de Projet',
    departement: 'Informatique',
    email: 's.nkomo@sigrh.cm',
  },
]

const mockLeaveBalances = {
  1: { soldeDisponible: 18, joursAcquis: 26, joursConsommes: 8, joursEnAttente: 0 },
  2: { soldeDisponible: 3, joursAcquis: 26, joursConsommes: 23, joursEnAttente: 0 },
  3: { soldeDisponible: 22, joursAcquis: 26, joursConsommes: 4, joursEnAttente: 0 },
  4: { soldeDisponible: 0, joursAcquis: 26, joursConsommes: 26, joursEnAttente: 0 },
  5: { soldeDisponible: 14, joursAcquis: 26, joursConsommes: 12, joursEnAttente: 0 },
  6: { soldeDisponible: 20, joursAcquis: 26, joursConsommes: 6, joursEnAttente: 0 },
  7: { soldeDisponible: 11, joursAcquis: 26, joursConsommes: 15, joursEnAttente: 0 },
  8: { soldeDisponible: 26, joursAcquis: 26, joursConsommes: 0, joursEnAttente: 0 },
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

function normalizeEmployee(emp) {
  const fallbackName = `${emp.prenom ?? ''} ${emp.nom ?? ''}`.trim()
  const nomComplet = emp.nomComplet ?? (fallbackName || emp.name || emp.username || 'Employé')

  return {
    id: emp.id,
    nomComplet,
    poste: emp.poste ?? emp.jobTitle ?? emp.position ?? '',
    departement: emp.departement ?? emp.department ?? emp.departementNom ?? '',
    email: emp.email ?? '',
  }
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Recherche les employés avec un query string.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchEmployees(query = '') {
  try {
    const response = await api.get('/employes', {
      params: { search: query, size: 20 },
    })
    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.content ?? []
    return data.map(normalizeEmployee)
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    const q = query.toLowerCase().trim()
    const filtered = q
      ? mockEmployees.filter(
          (emp) =>
            emp.nomComplet.toLowerCase().includes(q) ||
            emp.departement.toLowerCase().includes(q) ||
            emp.poste.toLowerCase().includes(q)
        )
      : mockEmployees
    return filtered.map(normalizeEmployee)
  }
}

/**
 * Récupère le solde de congés d'un employé.
 * @param {number} employeeId
 * @returns {Promise<{soldeDisponible: number, joursAcquis: number, joursConsommes: number, joursEnAttente: number}>}
 */
export async function getLeaveBalance(employeeId) {
  try {
    const response = await api.get(`/conges/solde/${employeeId}`)
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait()
    return (
      mockLeaveBalances[employeeId] ?? {
        soldeDisponible: 26,
        joursAcquis: 26,
        joursConsommes: 0,
        joursEnAttente: 0,
      }
    )
  }
}

/**
 * Crée une demande de congé.
 * @param {{employeId: number, type: string, dateDebut: string, dateFin: string, motif: string}} payload
 * @returns {Promise<object>}
 */
export async function createLeave(payload) {
  try {
    const response = await api.post('/conges', {
      employeId: payload.employeId,
      type: payload.type,
      dateDebut: payload.dateDebut,
      dateFin: payload.dateFin,
      motif: payload.motif ?? '',
    })
    return response.data
  } catch (error) {
    if (!shouldUseFallback(error)) throw error
    await wait(700)
    // Simule une création réussie
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `leave-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...payload,
      statut: 'EN_ATTENTE',
      createdAt: new Date().toISOString(),
    }
  }
}
