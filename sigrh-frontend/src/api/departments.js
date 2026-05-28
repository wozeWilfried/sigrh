import api from './axios'

export async function getDepartments() {
  const response = await api.get('/departements')
  return response.data
}
