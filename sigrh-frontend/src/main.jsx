import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ensureServerAwake } from './api/axios'
import App from './App'
import './index.css'

// Réveille le backend (Render s'endort après ~15 min sans trafic) et le garde
// éveillé tant qu'un onglet est ouvert, pour éviter les lenteurs au démarrage.
ensureServerAwake({ force: true })
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') ensureServerAwake()
})
setInterval(() => {
  if (document.visibilityState === 'visible') ensureServerAwake({ force: true })
}, 10 * 60 * 1000)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
