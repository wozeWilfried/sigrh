import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast doit être utilisé dans un ToastProvider')
  return context
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((type, message, duration = 4000) => {
    const id = crypto?.randomUUID?.() ?? `t-${Date.now()}-${counter.current++}`
    setToasts((prev) => [...prev, { id, type, message }])
    if (duration > 0) setTimeout(() => removeToast(id), duration)
  }, [removeToast])

  const showSuccess = useCallback((msg) => showToast('success', msg), [showToast])
  const showError = useCallback((msg) => showToast('error', msg), [showToast])
  const showInfo = useCallback((msg) => showToast('info', msg), [showToast])

  useEffect(() => {
    const handler = (e) => showToast(e.detail.type, e.detail.message)
    window.addEventListener('app:toast', handler)
    return () => window.removeEventListener('app:toast', handler)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

const iconMap = { success: CheckCircle2, error: XCircle, info: Info }
const colorMap = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

function ToastItem({ toast, onClose }) {
  const Icon = iconMap[toast.type] || Info
  const colors = colorMap[toast.type] || colorMap.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`pointer-events-auto flex min-w-[320px] max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg ${colors}`}
    >
      <Icon size={20} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm font-semibold leading-relaxed">{toast.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 opacity-50 transition-opacity hover:bg-black/5 hover:opacity-100"
      >
        <X size={15} />
      </button>
    </motion.div>
  )
}
