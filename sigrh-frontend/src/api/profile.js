import api from './axios'

/**
 * Récupère le profil de l'utilisateur connecté.
 * @returns {Promise<object>} Profil (infos compte + employé)
 */
export async function getMyProfile() {
  const response = await api.get('/profile')
  return response.data
}

/**
 * Met à jour les champs personnalisables du profil courant.
 * Seuls les champs fournis sont modifiés.
 *
 * @param {{telephone?: string, adresse?: string, email?: string, photoUrl?: string}} payload
 * @returns {Promise<object>} Profil mis à jour
 */
export async function updateMyProfile(payload) {
  const response = await api.put('/profile', payload)
  return response.data
}