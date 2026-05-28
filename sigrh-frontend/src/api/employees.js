import api from './axios'

export async function getEmployees(params) {
  const response = await api.get('/employes', { params })
  return response.data
}

export async function getEmployeeById(id) {
  const response = await api.get(`/employes/${id}`)
  return response.data
}

export async function createEmployee(payload) {
  const response = await api.post('/employes', payload)
  return response.data
}

export async function updateEmployee(id, payload) {
  const response = await api.put(`/employes/${id}`, payload)
  return response.data
}

export async function updateEmployeeStatus(id, statut) {
  const response = await api.patch(`/employes/${id}/status`, { statut })
  return response.data
}
