import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Bell, Check, CheckCircle2, ChevronRight, Info, Loader2 } from 'lucide-react'
import useAlerts from '../../hooks/useAlerts'

const TYPE_CONFIG = {
  CRITICAL: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  WARNING: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  INFO: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
}

export default function NotificationBell() {
  const { unreadCount, alerts, loading, treatAlert, processingId } = useAlerts(30000)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = () => setIsOpen((prev) => !prev)

  // Only show active alerts in the quick dropdown
  const activeAlerts = alerts.filter(a => a.statut === 'ACTIVE').slice(0, 5)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
          isOpen
            ? 'border-blue-300 bg-blue-50 text-blue-900'
            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
        }`}
        aria-label="Alertes"
      >
        <Bell size={20} strokeWidth={1.9} className={isOpen ? 'animate-pulse' : ''} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-black/5 flex flex-col max-h-[85vh]"
          style={{ animation: 'slideUpModal 0.2s ease-out' }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 shrink-0">
            <div>
              <p className="text-sm font-bold text-slate-900">Centre des alertes</p>
              <p className="text-xs text-slate-500">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 min-h-[100px] p-2 space-y-1">
            {loading && activeAlerts.length === 0 ? (
              <div className="flex justify-center py-6">
                <Loader2 size={24} className="animate-spin text-slate-300" />
              </div>
            ) : activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-700">Aucune alerte</p>
                <p className="text-xs text-slate-500 mt-1">Vous êtes à jour.</p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <AlertItem 
                  key={alert.id} 
                  alert={alert} 
                  processing={processingId === alert.id}
                  onTreat={() => treatAlert(alert.id)} 
                />
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-2 shrink-0">
            <Link
              to="/alertes"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-blue-deep transition-colors hover:bg-blue-50"
            >
              Voir toutes les alertes
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

function AlertItem({ alert, processing, onTreat }) {
  const config = TYPE_CONFIG[alert.type] || TYPE_CONFIG.INFO
  const Icon = config.icon

  return (
    <div className={`relative group flex gap-3 rounded-xl border p-3 transition-colors ${config.border} ${config.bg}`}>
      <div className={`mt-0.5 shrink-0 ${config.color}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-900 truncate">{alert.employeNom}</p>
        <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-700 line-clamp-2" title={alert.message}>
          {alert.message}
        </p>
        <p className="mt-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          {new Date(alert.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onTreat}
          disabled={processing}
          title="Marquer comme traité"
          className={`flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-50`}
        >
          {processing ? <Loader2 size={14} className="animate-spin text-slate-600" /> : <Check size={14} className="text-emerald-600" />}
        </button>
      </div>
    </div>
  )
}
