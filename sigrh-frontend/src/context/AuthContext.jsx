import { createContext, useState, useEffect, useCallback } from 'react'
import { loginUser, logoutUser } from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser)
        if (parsed && typeof parsed.role === 'string') {
          setToken(storedToken)
          setUser(parsed)
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials)
    const userData = {
      token: data.token,
      role: data.role,
      username: data.username,
      employeId: data.employeId,
      departementId: data.departementId,
    }
    localStorage.setItem('token', data.token)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(data.token)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    const currentToken = localStorage.getItem('token')
    const currentRefresh = localStorage.getItem('refreshToken')
    if (currentToken || currentRefresh) {
      logoutUser(currentToken, currentRefresh).catch(() => {})
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const roleDisplayName = useCallback(() => {
    if (!user) return ''
    const names = {
      ADMIN: 'Administrateur RH',
      RH: 'Responsable RH',
      MANAGER: 'Manager',
      EMPLOYE: 'Employé',
    }
    return names[user.role] || user.role
  }, [user])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, roleDisplayName }}>
      {children}
    </AuthContext.Provider>
  )
}
