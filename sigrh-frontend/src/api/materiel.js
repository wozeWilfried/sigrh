import api from './axios'

export async function getCategories() {
  const response = await api.get('/materiel/categories')
  return response.data
}

export async function createCategory(data) {
  const response = await api.post('/materiel/categories', data)
  return response.data
}

export async function updateCategory(id, data) {
  const response = await api.put(`/materiel/categories/${id}`, data)
  return response.data
}

export async function deleteCategory(id) {
  const response = await api.delete(`/materiel/categories/${id}`, { silentFallback: true })
  return response.data
}

export async function getEquipment(params = {}) {
  const response = await api.get('/materiel', { params })
  return response.data
}

export async function createEquipment(data) {
  const response = await api.post('/materiel', data)
  return response.data
}

export async function updateEquipment(id, data) {
  const response = await api.put(`/materiel/${id}`, data)
  return response.data
}

export async function deleteEquipment(id) {
  const response = await api.delete(`/materiel/${id}`, { silentFallback: true })
  return response.data
}

export async function getStats() {
  const response = await api.get('/materiel/stats')
  return response.data
}

export async function assignMateriel(materielId, data) {
  const response = await api.post(`/materiel/${materielId}/attribuer`, data)
  return response.data
}

export async function returnMateriel(materielId) {
  const response = await api.put(`/materiel/${materielId}/retourner`)
  return response.data
}

export async function getAttributions(params = {}) {
  const response = await api.get('/materiel/attributions', { params })
  return response.data
}
