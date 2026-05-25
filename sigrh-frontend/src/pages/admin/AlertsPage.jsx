import { useMemo } from 'react'
import {
  AlertCircle,
  BellRing,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Info,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  UserRound,
  XCircle,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useAlerts from '../../hooks/useAlerts'

const TYPE_CONFIG = {
  CRITICAL: { label: 'Critique', icon: ShieldAlert, color: 'text-red-600', badge: 'bg-red-50 text-red-700 ring-red-200' },
  WARNING: { label: 'Avertissement', icon: AlertCircle, color: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
  INFO: { label: 'Information', icon: Info, color: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 ring-blue-200' },
}

export default function AlertsPage() {
  const {
    alerts,
    unreadCount,
    loading,
    filters,
    processingId,
    toast,
    departments,
    updateFilter,
    treatAlert,
    treatAll,
    clearToast,
    reload,
  } = useAlerts(0) // On ne veut pas de polling excessif sur cette page pour ne pas faire clignoter le tableau, on peut refresh via le bouton

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader 
          unreadCount={unreadCount} 
          onReload={reload} 
          onTreatAll={treatAll}
          hasActive={unreadCount > 0}
        />

        {toast && <Toast toast={toast} onClose={clearToast} />}

        <FiltersBar filters={filters} departments={departments} onChange={updateFilter} />

        {loading ? (
          <TableSkeleton />
        ) : (
          <AlertsTable alerts={alerts} processingId={processingId} onTreat={treatAlert} />
        )}
      </div>
    </AppLayout>
  )
}

function PageHeader({ unreadCount, onReload, onTreatAll, hasActive }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-600">
            Centre de contrôle
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Gestion des Alertes IA
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Consultez et traitez les événements critiques remontés par l'intelligence artificielle.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {hasActive && (
          <button
            type="button"
            onClick={onTreatAll}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 border border-slate-200 transition-colors hover:bg-slate-50 active:scale-95"
          >
            <CheckCheck size={16} className="text-emerald-600" />
            Tout marquer comme traité
          </button>
        )}
        <button
          type="button"
          onClick={onReload}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 border border-slate-200 transition-colors hover:bg-slate-50 active:scale-95"
        >
          <RefreshCcw size={16} />
          Actualiser
        </button>
      </div>
    </div>
  )
}

function FiltersBar({ filters, departments, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <FilterSelect
        id="filter-statut"
        label="Statut"
        value={filters.statut}
        onChange={(v) => onChange('statut', v)}
      >
        <option value="">Tous les statuts</option>
        <option value="ACTIVE">Non lues (Actives)</option>
        <option value="TRAITEE">Traitées</option>
      </FilterSelect>

      <FilterSelect
        id="filter-type"
        label="Type d'alerte"
        value={filters.type}
        onChange={(v) => onChange('type', v)}
      >
        <option value="">Tous les types</option>
        <option value="CRITICAL">Critique</option>
        <option value="WARNING">Avertissement</option>
        <option value="INFO">Information</option>
      </FilterSelect>

      <FilterSelect
        id="filter-departement"
        label="Département"
        value={filters.departement}
        onChange={(v) => onChange('departement', v)}
      >
        <option value="">Tous les départements</option>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </FilterSelect>

      {(filters.type || filters.departement || filters.statut) && (
        <button
          type="button"
          onClick={() => { onChange('type', ''); onChange('departement', ''); onChange('statut', '') }}
          className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <XCircle size={14} />
          Réinitialiser
        </button>
      )}
    </div>
  )
}

function FilterSelect({ id, label, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-slate-600">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  )
}

function AlertsTable({ alerts, processingId, onTreat }) {
  if (!alerts.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <CheckCircle2 size={28} />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-950">Aucune alerte à afficher</h3>
        <p className="mt-1 text-sm text-slate-500">Tout est sous contrôle pour cette sélection.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/80">
              {['Type', 'Employé', 'Message', 'Date', 'Statut', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.1em] text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alerts.map((a) => (
              <AlertRow key={a.id} alert={a} processing={processingId === a.id} onTreat={() => onTreat(a.id)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AlertRow({ alert, processing, onTreat }) {
  const isTreated = alert.statut === 'TRAITEE'
  const config = TYPE_CONFIG[alert.type] || TYPE_CONFIG.INFO
  const Icon = config.icon

  return (
    <tr className={`transition-colors hover:bg-slate-50/80 ${isTreated ? 'opacity-60 bg-slate-50/40' : ''}`}>
      {/* Type */}
      <td className="whitespace-nowrap px-5 py-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${config.badge}`}>
          <Icon size={12} strokeWidth={3} />
          {config.label}
        </span>
      </td>

      {/* Employé */}
      <td className="whitespace-nowrap px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <UserRound size={16} />
          </div>
          <div>
            <p className="font-semibold text-slate-950">{alert.employeNom}</p>
            <p className="text-xs text-slate-500">{alert.departement}</p>
          </div>
        </div>
      </td>

      {/* Message */}
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-700 line-clamp-2 max-w-md" title={alert.message}>
          {alert.message}
        </p>
      </td>

      {/* Date */}
      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
        {new Date(alert.date).toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })}
      </td>

      {/* Statut */}
      <td className="whitespace-nowrap px-5 py-4">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
          isTreated ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-700'
        }`}>
          {isTreated ? 'Traitée' : 'Active'}
        </span>
      </td>

      {/* Actions */}
      <td className="whitespace-nowrap px-5 py-4 text-right">
        {!isTreated && (
          <button
            type="button"
            onClick={onTreat}
            disabled={processing}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
          >
            {processing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Traiter
          </button>
        )}
      </td>
    </tr>
  )
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-5 py-5">
            <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-2/3 max-w-sm animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

function Toast({ toast, onClose }) {
  const isSuccess = toast.type === 'success'
  const Icon = isSuccess ? CheckCircle2 : XCircle

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-sm ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
      style={{ animation: 'slideUpModal 0.2s ease-out' }}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
      <button type="button" onClick={onClose} className="text-lg font-bold opacity-60 hover:opacity-100">
        ×
      </button>
    </div>
  )
}
