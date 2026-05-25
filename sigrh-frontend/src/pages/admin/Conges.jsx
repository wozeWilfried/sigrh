import { useMemo, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Umbrella,
  UserRound,
  X,
  XCircle,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useLeaves from '../../hooks/useLeaves'

const statusStyles = {
  EN_ATTENTE: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  APPROUVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REFUSE: 'bg-red-50 text-red-700 ring-red-200',
}

const statusLabels = {
  EN_ATTENTE: 'EN_ATTENTE',
  APPROUVE: 'APPROUVÉ',
  REFUSE: 'REFUSÉ',
}

export default function Conges() {
  const {
    filters,
    leaves,
    departments,
    approvedLeaves,
    loading,
    processingId,
    pendingCount,
    toast,
    updateFilter,
    processLeave,
    clearToast,
    reload,
  } = useLeaves()
  const [actionModal, setActionModal] = useState(null)

  async function handleConfirmAction(comment) {
    await processLeave({ ...actionModal, comment })
    setActionModal(null)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Header pendingCount={pendingCount} onReload={reload} />
        {toast && <Toast type={toast.type} message={toast.message} onClose={clearToast} />}
        <Filters filters={filters} departments={departments} onChange={updateFilter} />

        {loading ? (
          <LeavesSkeleton />
        ) : (
          <div className="grid gap-6 2xl:grid-cols-[1.35fr_0.8fr]">
            <Card className="overflow-hidden">
              <div className="border-b border-slate-100 p-5">
                <h2 className="text-base font-bold text-slate-950">Demandes de congé</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Visualisez, approuvez ou refusez les demandes en attente.
                </p>
              </div>
              <LeavesTable
                leaves={leaves}
                processingId={processingId}
                onAction={setActionModal}
              />
            </Card>

            <LeaveCalendar month={filters.month} leaves={approvedLeaves} />
          </div>
        )}
      </div>

      {actionModal && (
        <ActionModal
          action={actionModal.action}
          leave={actionModal.leave}
          loading={processingId === actionModal.id}
          onClose={() => setActionModal(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </AppLayout>
  )
}

function Header({ pendingCount, onReload }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">Congés</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Gestion des demandes de congé</h1>
        <p className="mt-1 text-sm text-slate-500">
          Traitez les demandes et suivez les absences approuvées.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex h-11 items-center rounded-xl bg-yellow-50 px-4 text-sm font-bold text-yellow-700 ring-1 ring-yellow-200">
          {pendingCount} demande(s) en attente
        </span>
        <button
          type="button"
          onClick={onReload}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
        >
          <RefreshCcw size={16} />
          Actualiser
        </button>
      </div>
    </div>
  )
}

function Filters({ filters, departments, onChange }) {
  return (
    <Card className="p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <FilterField label="Statut">
          <select value={filters.status} onChange={(event) => onChange('status', event.target.value)} className={inputClassName}>
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">EN_ATTENTE</option>
            <option value="APPROUVE">APPROUVE</option>
            <option value="REFUSE">REFUSE</option>
          </select>
        </FilterField>
        <FilterField label="Département">
          <select value={filters.department} onChange={(event) => onChange('department', event.target.value)} className={inputClassName}>
            <option value="">Tous les départements</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Mois">
          <input type="month" value={filters.month} onChange={(event) => onChange('month', event.target.value)} className={inputClassName} />
        </FilterField>
      </div>
    </Card>
  )
}

function LeavesTable({ leaves, processingId, onAction }) {
  if (!leaves.length) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Umbrella size={22} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-950">Aucune demande trouvée</h3>
        <p className="mt-1 text-sm text-slate-500">Ajustez les filtres pour afficher plus de résultats.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            {['Employé', 'Département', 'Début', 'Fin', 'Type', 'Statut', 'Actions'].map((heading) => (
              <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {leaves.map((leave) => {
            const disabled = leave.statut !== 'EN_ATTENTE' || processingId === leave.id

            return (
              <tr key={leave.id} className="transition-colors hover:bg-slate-50/80">
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={leave.employeNom} />
                    <div>
                      <p className="font-semibold text-slate-950">{leave.employeNom}</p>
                      <p className="text-sm text-slate-500">ID employé #{leave.employeId}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{leave.departementNom}</td>
                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">{formatDate(leave.dateDebut)}</td>
                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">{formatDate(leave.dateFin)}</td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{leave.type}</td>
                <td className="whitespace-nowrap px-5 py-4"><StatusBadge status={leave.statut} /></td>
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-2">
                    <ActionButton
                      label="Approuver"
                      disabled={disabled}
                      className="border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => onAction({ id: leave.id, action: 'approve', leave })}
                    >
                      {processingId === leave.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    </ActionButton>
                    <ActionButton
                      label="Refuser"
                      disabled={disabled}
                      className="border-red-100 text-red-600 hover:bg-red-50"
                      onClick={() => onAction({ id: leave.id, action: 'reject', leave })}
                    >
                      <X size={16} />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function LeaveCalendar({ month, leaves }) {
  const days = useMemo(() => getMonthDays(month), [month])

  return (
    <Card className="p-5">
      <h2 className="text-base font-bold text-slate-950">Calendrier des congés approuvés</h2>
      <p className="mt-1 text-sm text-slate-500">Vue mensuelle des absences validées.</p>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayLeaves = leaves.filter((leave) => dateInRange(day.iso, leave.dateDebut, leave.dateFin))

          return (
            <div key={day.key} className={`min-h-24 rounded-xl border p-2 ${day.inMonth ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
              <p className="text-xs font-bold text-slate-500">{day.label}</p>
              <div className="mt-2 space-y-1">
                {dayLeaves.slice(0, 2).map((leave) => (
                  <div key={leave.id} className="truncate rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                    {leave.employeNom}
                  </div>
                ))}
                {dayLeaves.length > 2 && <p className="text-[11px] font-bold text-slate-400">+{dayLeaves.length - 2}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function ActionModal({ action, leave, loading, onClose, onConfirm }) {
  const [comment, setComment] = useState('')
  const approving = action === 'approve'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-950">
              {approving ? 'Approuver la demande' : 'Refuser la demande'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{leave.employeNom} · {formatDate(leave.dateDebut)} au {formatDate(leave.dateFin)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MessageSquare size={16} />
              Commentaire optionnel
            </span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors focus:border-blue-deep/30 focus:bg-white focus:ring-4 focus:ring-blue-deep/10"
              placeholder="Ajouter une note RH..."
            />
          </label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Annuler
            </button>
            <button
              type="button"
              onClick={() => onConfirm(comment)}
              disabled={loading}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-60 ${approving ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : approving ? <Check size={16} /> : <X size={16} />}
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 transition-colors ${statusStyles[status] ?? statusStyles.EN_ATTENTE}`}>
      {statusLabels[status] ?? status}
    </span>
  )
}

function Avatar({ name }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-deep ring-1 ring-blue-100">
      {initials || <UserRound size={18} />}
    </div>
  )
}

function ActionButton({ label, disabled, className, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  )
}

function FilterField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function Toast({ type, message, onClose }) {
  const success = type === 'success'
  const Icon = success ? CheckCircle2 : XCircle

  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-sm ${success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <p className="text-sm font-semibold">{message}</p>
      </div>
      <button type="button" onClick={onClose} className="font-bold opacity-70 hover:opacity-100" aria-label="Fermer">×</button>
    </div>
  )
}

function Card({ className = '', children }) {
  return <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>
}

function LeavesSkeleton() {
  return (
    <div className="grid gap-6 2xl:grid-cols-[1.35fr_0.8fr]">
      <Card className="p-5">
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="grid gap-4 md:grid-cols-7">
              {Array.from({ length: 7 }).map((__, cellIndex) => (
                <div key={cellIndex} className="h-10 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </Card>
    </div>
  )
}

const inputClassName = 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-deep/30 focus:bg-white focus:ring-4 focus:ring-blue-deep/10'

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function getMonthDays(month) {
  const [year, monthIndex] = month.split('-').map(Number)
  const first = new Date(year, monthIndex - 1, 1)
  const start = new Date(first)
  const dayOffset = (first.getDay() + 6) % 7
  start.setDate(first.getDate() - dayOffset)

  return Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return {
      key: date.toISOString(),
      iso: date.toISOString().slice(0, 10),
      label: date.getDate(),
      inMonth: date.getMonth() === monthIndex - 1,
    }
  })
}

function dateInRange(date, start, end) {
  return date >= start && date <= end
}
