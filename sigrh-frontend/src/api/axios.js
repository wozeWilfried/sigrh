import axios from 'axios'

const dispatchToast = (type, message) => {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { type, message } }))
}

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error

    if (config?.silentFallback) {
      return Promise.reject(error)
    }

    if (!response) {
      dispatchToast('error', 'Erreur de connexion. Veuillez vérifier votre réseau.')
      return Promise.reject(error)
    }

    const { status } = response

    if (status === 401 && !config?._retry && !config?.url?.includes('/auth/refresh')) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        dispatchToast('error', 'Votre session a expiré. Veuillez vous reconnecter.')
        setTimeout(() => { window.location.href = '/' }, 1500)
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`
          return api(config)
        }).catch((err) => Promise.reject(err))
      }

      config._retry = true
      isRefreshing = true

      try {
        const data = await api.post('/auth/refresh', { refreshToken })
        const newToken = data.data.token
        const newRefreshToken = data.data.refreshToken

        localStorage.setItem('token', newToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          userData.token = newToken
          localStorage.setItem('user', JSON.stringify(userData))
        }

        processQueue(null, newToken)
        config.headers.Authorization = `Bearer ${newToken}`
        return api(config)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        dispatchToast('error', 'Votre session a expiré. Veuillez vous reconnecter.')
        setTimeout(() => { window.location.href = '/' }, 1500)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 403) {
      if (!config?.silentFallback) {
        dispatchToast('error', 'Accès refusé : vous n\'avez pas les permissions nécessaires.')
      }
    }

    if ([500, 502, 503, 504].includes(status)) {
      dispatchToast('error', response.data?.message || 'Une erreur serveur est survenue. Veuillez réessayer plus tard.')
    }

    if (status >= 400 && status < 500 && status !== 401 && status !== 403 && status !== 404) {
      dispatchToast('error', response.data?.message || 'Une erreur inattendue s\'est produite.')
    }

    return Promise.reject(error)
  }
)

export default api
