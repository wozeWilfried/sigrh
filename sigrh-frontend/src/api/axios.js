import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

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

// Client brut (sans intercepteurs) utilisé uniquement pour réveiller le backend.
const wakeClient = axios.create({ timeout: 90000 })

let wakePromise = null
let lastAwakeAt = 0
const AWAKE_TTL_MS = 2 * 60 * 1000 // on considère le serveur réveillé pendant 2 min

/**
 * Envoie un ping à /health pour réveiller le backend (cold start Render ~30-60 s).
 * Les appels concurrents sont mutualisés et le résultat mis en cache 2 minutes.
 *
 * @param {{force?: boolean}} options force = true pour ignorer le cache
 * @returns {Promise<boolean>} true si le serveur a répondu
 */
export function ensureServerAwake({ force = false } = {}) {
  const now = Date.now()
  if (!force && now - lastAwakeAt < AWAKE_TTL_MS) {
    return Promise.resolve(true)
  }
  if (wakePromise) return wakePromise

  wakePromise = wakeClient
    .get(`${API_BASE}/health`)
    .then(() => {
      lastAwakeAt = Date.now()
      return true
    })
    .catch(() => false)
    .finally(() => {
      wakePromise = null
    })

  return wakePromise
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 s : tolère un cold start Render lent
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

    // Pas de réponse HTTP → problème réseau / serveur endormi / injoignable.
    if (!response) {
      const cfg = error.config || {}
      const method = (cfg.method || 'get').toLowerCase()
      const attempts = cfg._netAttempts || 0
      const maxAttempts = method === 'get' ? 2 : 1

      if (attempts < maxAttempts) {
        cfg._netAttempts = attempts + 1
        if (attempts === 0) {
          dispatchToast('info', 'Le serveur se réveille… nouvelle tentative automatique en cours.')
        }
        await ensureServerAwake({ force: true })
        await new Promise((resolve) => setTimeout(resolve, 1500))
        return api(cfg)
      }

      dispatchToast(
        'error',
        'Serveur injoignable. Le backend est en cours de démarrage ou arrêté — patientez ~30 s puis réessayez.'
      )
      return Promise.reject(error)
    }

    const { status } = response

    if (status === 401 && !config?._retry && !config?.url?.includes('/auth/login') && !config?.url?.includes('/auth/refresh')) {
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