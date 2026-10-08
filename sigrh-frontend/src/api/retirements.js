import api from './axios'

/**
 * Récupère la liste des départs en retraite (réalisés et à venir).
 * @returns {Promise<Array>}
 */
export async function getDepartsRetraite() {
  const response = await api.get('/employes/departs-retraite')
  return Array.isArray(response.data) ? response.data : []
}