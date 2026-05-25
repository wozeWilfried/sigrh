import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

// Création du Context
const ToastContext = createContext(null)

// Hook Custom
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast doit être utilisé dans un ToastProvider')
  return context
}

// Fournisseur du Context
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toastCounter = useRef(0)

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((type, message, duration = 4000) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `toast-${Date.now()}-${toastCounter.current++}`

    setToasts((prev) => [...prev, { id, type, message }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const showSuccess = useCallback((msg) => showToast('success', msg), [showToast])
  const showError = useCallback((msg) => showToast('error', msg), [showToast])
  const showInfo = useCallback((msg) => showToast('info', msg), [showToast])

  // Écouteur global (utilisé notamment par axiosInstance)
  useEffect(() => {
    const handleGlobalToast = (event) => {
      const { type, message } = event.detail
      showToast(type, message)
    }
    window.addEventListener('app:toast', handleGlobalToast)
    return () => window.removeEventListener('app:toast', handleGlobalToast)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      {/* Conteneur des Toasts (Coin supérieur droit) */}
      <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Composant individuel pour l'animation
function ToastItem({ toast, onClose }) {
  const isSuccess = toast.type === 'success'
  const isError = toast.type === 'error'
  
  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : Info
  const colors = isSuccess
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : isError
    ? 'border-red-200 bg-red-50 text-red-800'
    : 'border-blue-200 bg-blue-50 text-blue-800'

  return (
    <div
      className={`pointer-events-auto flex min-w-[300px] max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg transition-all ${colors}`}
      style={{ animation: 'slideInRight 0.3s ease-out forwards' }}
    >
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 opacity-60 transition-opacity hover:bg-black/5 hover:opacity-100"
      >
        <X size={16} />
      </button>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
