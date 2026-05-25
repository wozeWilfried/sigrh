import React, { createContext, useContext, useState, useCallback } from 'react'
import { AlertTriangle, X } from 'lucide-react'

// Context
const ConfirmContext = createContext(null)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error('useConfirm doit être utilisé dans un ConfirmProvider')
  return context
}

export default function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    danger: false,
    onConfirm: null,
  })

  const confirm = useCallback(({ title, message, confirmText = 'Confirmer', cancelText = 'Annuler', danger = false }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        danger,
        onConfirm: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }))
          resolve(false)
        }
      })
    })
  }, [])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {modalState.isOpen && (
        <ConfirmModal
          {...modalState}
          onClose={modalState.onCancel}
        />
      )}
    </ConfirmContext.Provider>
  )
}

function ConfirmModal({ isOpen, title, message, confirmText, cancelText, danger, onConfirm, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        style={{ animation: 'modalScale 0.2s ease-out forwards' }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${danger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4 sm:px-8">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200/50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all focus:ring-2 focus:ring-offset-2 ${
              danger 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
