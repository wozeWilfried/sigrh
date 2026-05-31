import axios from 'axios'

// Fonction utilitaire pour émettre des événements globaux pour les Toasts
const dispatchToast = (type, message) => {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { type, message } }))
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Timeout de sécurité (30s)
})

// ── Intercepteur de Requête ─────────────────────────────────────────────
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

// ── Intercepteur de Réponse ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Les réponses réussies passent normalement
    return response
  },
  (error) => {
    const { response, config } = error

    // Si on a explicitement demandé de rendre l'erreur silencieuse (pour utiliser le fallback mock sans polluer l'UI)
    if (config?.silentFallback) {
      return Promise.reject(error)
    }

    if (!response) {
      // Erreur réseau (serveur injoignable, timeout, etc.)
      dispatchToast('error', 'Erreur de connexion. Veuillez vérifier votre réseau.')
      return Promise.reject(error)
    }

    const { status, data } = response

    switch (status) {
      case 401:
        // Non authentifié ou token expiré
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (!config?.silentFallback) {
          dispatchToast('error', 'Votre session a expiré. Veuillez vous reconnecter.')
          setTimeout(() => {
            window.location.href = '/'
          }, 1500)
        }
        break

      case 403:
        // Accès refusé (Forbidden)
        if (!config?.silentFallback) {
          dispatchToast('error', 'Accès refusé : vous n\'avez pas les permissions nécessaires.')
        }
        break

      case 404:
        // Optionnel : ne pas toujours afficher un toast pour 404 si on gère localement
        // dispatchToast('info', 'Ressource introuvable.')
        break

      case 500:
      case 502:
      case 503:
      case 504:
        // Erreur serveur générique
        dispatchToast('error', data?.message || 'Une erreur serveur est survenue. Veuillez réessayer plus tard.')
        break

      default:
        // Autres erreurs (400 Bad Request, etc.)
        dispatchToast('error', data?.message || 'Une erreur inattendue s\'est produite.')
        break
    }

    return Promise.reject(error)
  }
)

export default api
