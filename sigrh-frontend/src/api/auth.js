import api from './axios'

export async function loginUser({ username, password }) {
  const response = await api.post('/auth/login', { username, password })
  return response.data
}

export async function refreshTokenCall(refreshToken) {
  const response = await api.post('/auth/refresh', { refreshToken })
  return response.data
}

export async function logoutUser(accessToken, refreshToken) {
  await api.post('/auth/logout', { accessToken, refreshToken })
}

export async function changePassword({ currentPassword, newPassword }) {
  const response = await api.post('/auth/change-password', { currentPassword, newPassword })
  return response.data
}