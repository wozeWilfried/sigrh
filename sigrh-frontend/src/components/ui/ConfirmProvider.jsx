import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

const ConfirmContext = createContext(null)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error('useConfirm doit être utilisé dans un ConfirmProvider')
  return context
}

export default function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    danger: false,
    onConfirm: null,
    onCancel: null,
  })

  const confirm = useCallback(({ title, message, confirmText, cancelText, danger }) => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title,
        message,
        confirmText: confirmText || 'Confirmer',
        cancelText: cancelText || 'Annuler',
        danger: danger || false,
        onConfirm: () => { setState((s) => ({ ...s, isOpen: false })); resolve(true) },
        onCancel: () => { setState((s) => ({ ...s, isOpen: false })); resolve(false) },
      })
    })
  }, [])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state.isOpen && <ConfirmModal {...state} />}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}

function ConfirmModal({ title, message, confirmText, cancelText, danger, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              danger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <button onClick={onCancel} className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4 sm:px-8">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200/50 active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 focus:ring-2 focus:ring-offset-2 ${
              danger
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
