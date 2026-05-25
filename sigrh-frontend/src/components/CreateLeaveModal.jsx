import { useEffect, useRef } from 'react'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Info,
  Loader2,
  Search,
  Tag,
  UserRound,
  X,
  XCircle,
} from 'lucide-react'
import useCreateLeave from '../hooks/useCreateLeave'
import { getAvatarColor, getInitials } from '../utils/leaveUtils'

const LEAVE_TYPES = [
  { value: 'ANNUEL', label: 'Congé annuel', emoji: '🏖️' },
  { value: 'MALADIE', label: 'Congé maladie', emoji: '🏥' },
  { value: 'EXCEPTIONNEL', label: 'Congé exceptionnel', emoji: '⭐' },
]

/** ─── Main Modal ──────────────────────────────────────────────────────────── */
export default function CreateLeaveModal({ open, onClose, onSuccess }) {
  const {
    form,
    employeeQuery,
    updateField,
    suggestions,
    loadingSuggestions,
    showSuggestions,
    setShowSuggestions,
    handleQueryChange,
    selectEmployee,
    clearEmployee,
    balance,
    loadingBalance,
    workingDays,
    isBalanceInsufficient,
    isFormValid,
    submitting,
    handleSubmit,
    toast,
    clearToast,
    reset,
  } = useCreateLeave({ onSuccess })

  const employeeInputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Autofocus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => employeeInputRef.current?.focus(), 80)
    } else {
      reset()
    }
  }, [open, reset])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        !employeeInputRef.current?.contains(e.target)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [setShowSuggestions])

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  async function onSubmit(e) {
    e.preventDefault()
    await handleSubmit()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
      style={{ animation: 'fadeInBackdrop 0.2s ease-out' }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 flex flex-col max-h-[92vh]"
        style={{ animation: 'slideUpModal 0.25s cubic-bezier(0.16,1,0.3,1)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-leave-title"
      >
        {/* ── Header ── */}
        <ModalHeader onClose={onClose} />

        {/* ── Toast ── */}
        {toast && (
          <div className="mx-6 mt-4">
            <ModalToast toast={toast} onClose={clearToast} />
          </div>
        )}

        {/* ── Body ── */}
        <form
          id="create-leave-form"
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Employee Autocomplete */}
          <div className="relative">
            <FieldLabel icon={<UserRound size={15} />} required>
              Employé
            </FieldLabel>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                {loadingSuggestions ? (
                  <Loader2 size={16} className="animate-spin text-blue-deep" />
                ) : (
                  <Search size={16} className="text-slate-400" />
                )}
              </div>

              <input
                ref={employeeInputRef}
                id="leave-employee-input"
                type="text"
                autoComplete="off"
                placeholder="Rechercher un employé…"
                value={employeeQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => employeeQuery && setShowSuggestions(true)}
                className={`${inputBase} pl-10 pr-10 ${
                  form.employee
                    ? 'border-emerald-300 bg-emerald-50/50 focus:ring-emerald-500/10'
                    : ''
                }`}
              />

              {employeeQuery && (
                <button
                  type="button"
                  onClick={clearEmployee}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700"
                  aria-label="Effacer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Selected employee chip */}
            {form.employee && (
              <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
                <Avatar name={form.employee.nomComplet} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {form.employee.nomComplet}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {form.employee.poste}{form.employee.departement ? ` · ${form.employee.departement}` : ''}
                  </p>
                </div>
                <span className="ml-auto flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  Sélectionné
                </span>
              </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && !form.employee && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10"
              >
                {suggestions.length === 0 && !loadingSuggestions ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-slate-400">
                    <UserRound size={20} className="opacity-40" />
                    <span>Aucun employé trouvé</span>
                  </div>
                ) : (
                  suggestions.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onMouseDown={() => selectEmployee(emp)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl"
                    >
                      <Avatar name={emp.nomComplet} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {emp.nomComplet}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {emp.poste}{emp.departement ? ` · ${emp.departement}` : ''}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel icon={<Calendar size={15} />} required>
                Date de début
              </FieldLabel>
              <input
                id="leave-date-start"
                type="date"
                value={form.dateDebut}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  updateField('dateDebut', e.target.value)
                  if (form.dateFin && e.target.value > form.dateFin) {
                    updateField('dateFin', '')
                  }
                }}
                className={inputBase}
              />
            </div>
            <div>
              <FieldLabel icon={<Calendar size={15} />} required>
                Date de fin
              </FieldLabel>
              <input
                id="leave-date-end"
                type="date"
                value={form.dateFin}
                min={form.dateDebut || new Date().toISOString().slice(0, 10)}
                disabled={!form.dateDebut}
                onChange={(e) => updateField('dateFin', e.target.value)}
                className={`${inputBase} disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </div>
          </div>

          {/* Working days counter */}
          {form.dateDebut && form.dateFin && (
            <WorkingDaysBadge days={workingDays} />
          )}

          {/* Leave type */}
          <div>
            <FieldLabel icon={<Tag size={15} />} required>
              Type de congé
            </FieldLabel>
            <div className="relative">
              <select
                id="leave-type-select"
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
                className={`${inputBase} cursor-pointer appearance-none pr-10`}
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.emoji} {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* Leave balance */}
          {form.employee && (
            <LeaveBalancePanel
              balance={balance}
              loading={loadingBalance}
              workingDays={workingDays}
              isInsufficient={isBalanceInsufficient}
              leaveType={form.type}
            />
          )}

          {/* Motif / description */}
          <div>
            <FieldLabel>
              Motif
              <span className="ml-1.5 text-xs font-normal text-slate-400">(optionnel)</span>
            </FieldLabel>
            <textarea
              id="leave-motif"
              rows={3}
              value={form.motif}
              onChange={(e) => updateField('motif', e.target.value)}
              placeholder="Précisez la raison de cette demande…"
              className={`${inputBase} h-auto resize-none py-3 leading-relaxed`}
            />
          </div>
        </form>

        {/* ── Footer ── */}
        <ModalFooter
          onClose={onClose}
          submitting={submitting}
          isFormValid={isFormValid}
          isBalanceInsufficient={isBalanceInsufficient}
        />
      </div>

      <style>{modalAnimationStyles}</style>
    </div>
  )
}

/** ─── Sub-components ─────────────────────────────────────────────────────── */

function ModalHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-deep/10">
          <Calendar size={20} className="text-blue-deep" />
        </div>
        <div>
          <h2 id="create-leave-title" className="text-base font-bold text-slate-950">
            Nouvelle demande de congé
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Remplissez les informations ci-dessous
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer la modal"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={18} />
      </button>
    </div>
  )
}

function ModalFooter({ onClose, submitting, isFormValid, isBalanceInsufficient }) {
  return (
    <div className="flex flex-col-reverse items-center gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end flex-shrink-0">
      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="h-11 w-full rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 disabled:opacity-50 sm:w-auto"
      >
        Annuler
      </button>
      <button
        type="submit"
        form="create-leave-form"
        disabled={!isFormValid || submitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-deep px-6 text-sm font-semibold text-white shadow-sm shadow-blue-deep/20 transition-all hover:bg-blue-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Création en cours…
          </>
        ) : isBalanceInsufficient ? (
          <>
            <AlertTriangle size={16} />
            Solde insuffisant
          </>
        ) : (
          <>
            <CheckCircle2 size={16} />
            Créer la demande
          </>
        )}
      </button>
    </div>
  )
}

function FieldLabel({ icon, required, children }) {
  return (
    <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
      {icon && <span className="text-slate-400">{icon}</span>}
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  )
}

function Avatar({ name, size = 'md' }) {
  const initials = getInitials(name)
  const colorClass = getAvatarColor(name)
  const sizeClass = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm'

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-xl font-bold ring-1 ring-black/5 ${sizeClass} ${colorClass}`}
    >
      {initials || <UserRound size={size === 'sm' ? 14 : 18} />}
    </div>
  )
}

function WorkingDaysBadge({ days }) {
  const isValid = days > 0

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        isValid
          ? 'border-blue-100 bg-blue-50/70'
          : 'border-amber-100 bg-amber-50/70'
      }`}
    >
      <Info size={16} className={isValid ? 'text-blue-deep' : 'text-amber-600'} />
      <p className={`text-sm font-semibold ${isValid ? 'text-blue-deep' : 'text-amber-700'}`}>
        {isValid ? (
          <>
            <span className="text-lg font-extrabold">{days}</span>{' '}
            jour{days > 1 ? 's' : ''} ouvré{days > 1 ? 's' : ''} demandé{days > 1 ? 's' : ''}
          </>
        ) : (
          'La date de fin doit être après la date de début'
        )}
      </p>
    </div>
  )
}

function LeaveBalancePanel({ balance, loading, workingDays, isInsufficient, leaveType }) {
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isInsufficient
          ? 'border-red-200 bg-red-50'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
        Solde de congés
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={14} className="animate-spin" />
          Chargement du solde…
        </div>
      ) : balance ? (
        <>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <BalanceStat label="Total annuel" value={balance.soldeAnnuel} color="slate" />
            <BalanceStat label="Pris" value={balance.soldePris} color="amber" />
            <BalanceStat
              label="Restant"
              value={balance.soldeRestant}
              color={isInsufficient ? 'red' : 'emerald'}
              highlight
            />
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isInsufficient ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (balance.soldeRestant / balance.soldeAnnuel) * 100)}%`,
              }}
            />
          </div>

          {/* Warning */}
          {isInsufficient && leaveType === 'ANNUEL' && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-100 px-3 py-2.5">
              <AlertTriangle size={15} className="flex-shrink-0 text-red-600" />
              <p className="text-sm font-bold text-red-700">
                Solde insuffisant — vous demandez{' '}
                <span className="underline">{workingDays} j</span> pour un solde de{' '}
                <span className="underline">{balance.soldeRestant} j</span>
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-500">Impossible de charger le solde.</p>
      )}
    </div>
  )
}

function BalanceStat({ label, value, color, highlight }) {
  const colorMap = {
    slate: 'text-slate-700',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    red: 'text-red-600',
  }

  return (
    <div className={`rounded-xl border bg-white p-3 text-center ${highlight ? 'border-current' : 'border-slate-100'}`}>
      <p className={`text-2xl font-extrabold ${colorMap[color]}`}>{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{label}</p>
    </div>
  )
}

function ModalToast({ toast, onClose }) {
  const isSuccess = toast.type === 'success'
  const Icon = isSuccess ? CheckCircle2 : XCircle

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
      style={{ animation: 'slideUpModal 0.2s ease-out' }}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={17} className="flex-shrink-0" />
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="text-lg font-bold opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}

/** ─── Styles ─────────────────────────────────────────────────────────────── */

const inputBase =
  'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-blue-deep/30 focus:bg-white focus:ring-4 focus:ring-blue-deep/10'

const modalAnimationStyles = `
  @keyframes fadeInBackdrop {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUpModal {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`
