import { memo } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Save,
  UserRound,
  XCircle,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useAttendances from '../../hooks/useAttendances'

const statusStyles = {
  PRESENT: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  RETARD: 'bg-orange-50 text-orange-700 ring-orange-200',
  ABSENT: 'bg-red-50 text-red-700 ring-red-200',
}

function AttendanceEntryPage() {
  const {
    date,
    rows,
    loading,
    saving,
    toast,
    errorsCount,
    dirtyCount,
    canSave,
    setDate,
    updateRow,
    submitAll,
    clearToast,
  } = useAttendances()

  return (
    <AppLayout>
      <div className="space-y-6">
        <Header date={date} onDateChange={setDate} />

        {toast && <Toast type={toast.type} message={toast.message} onClose={clearToast} />}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">Employés actifs</h2>
              <p className="mt-1 text-sm text-slate-500">
                Saisissez les heures puis enregistrez toutes les présences en une fois.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <InfoBadge value={`${rows.length} employés`} />
              <InfoBadge value={`${dirtyCount} modifié(s)`} />
              {errorsCount > 0 && <InfoBadge danger value={`${errorsCount} erreur(s)`} />}
            </div>
          </div>

          {loading ? (
            <AttendanceSkeleton />
          ) : (
            <AttendanceTable rows={rows} onChange={updateRow} />
          )}
        </section>

        <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-500">
              Les absences désactivent automatiquement les champs horaires.
            </p>
            <button
              type="button"
              disabled={!canSave}
              onClick={submitAll}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-deep px-5 text-sm font-semibold text-white shadow-sm shadow-blue-deep/20 transition-colors hover:bg-blue-hover disabled:cursor-not-allowed disabled:opacity-55"
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              Enregistrer toutes les présences
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function Header({ date, onDateChange }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">
          Saisie journalière
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Présences</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enregistrez rapidement les présences, retards et absences du jour.
        </p>
      </div>

      <label className="block w-full sm:w-auto">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Date de présence</span>
        <div className="relative">
          <CalendarDays
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-blue-deep/30 focus:ring-4 focus:ring-blue-deep/10 sm:w-64"
          />
        </div>
      </label>
    </div>
  )
}

function AttendanceTable({ rows, onChange }) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <UserRound size={22} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-950">Aucun employé actif</h3>
        <p className="mt-1 text-sm text-slate-500">Aucune ligne de présence à saisir pour cette date.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            {['Employé', 'Heure arrivée', 'Heure départ', 'Statut', 'État'].map((heading) => (
              <th
                key={heading}
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <AttendanceRow key={row.employee.id} row={row} onChange={onChange} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

const AttendanceRow = memo(function AttendanceRow({ row, onChange }) {
  const { employee, values, error } = row
  const absent = values.statut === 'ABSENT'
  const fullName = `${employee.prenom} ${employee.nom}`.trim()

  return (
    <tr className={`transition-colors ${values.dirty ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'}`}>
      <td className="min-w-[260px] px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar employee={employee} fallbackName={fullName} />
          <div>
            <p className="font-semibold text-slate-950">{fullName}</p>
            <p className="mt-0.5 text-sm text-slate-500">{employee.poste || employee.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <TimeInput
          value={values.heureArrivee}
          disabled={absent}
          onChange={(value) => onChange(employee.id, 'heureArrivee', value)}
        />
      </td>
      <td className="px-5 py-4">
        <TimeInput
          value={values.heureDepart}
          disabled={absent}
          onChange={(value) => onChange(employee.id, 'heureDepart', value)}
        />
        {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      </td>
      <td className="px-5 py-4">
        <select
          value={values.statut}
          onChange={(event) => onChange(employee.id, 'statut', event.target.value)}
          className={`h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none transition-colors focus:border-blue-deep/30 focus:ring-4 focus:ring-blue-deep/10 ${statusStyles[values.statut]}`}
          aria-label={`Statut de ${fullName}`}
        >
          <option value="PRESENT">PRESENT</option>
          <option value="RETARD">RETARD</option>
          <option value="ABSENT">ABSENT</option>
        </select>
      </td>
      <td className="px-5 py-4">
        {values.alreadySaved ? (
          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            Déjà enregistré
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
            Nouveau
          </span>
        )}
      </td>
    </tr>
  )
})

function TimeInput({ value, disabled, onChange }) {
  return (
    <input
      type="time"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-blue-deep/30 focus:ring-4 focus:ring-blue-deep/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
    />
  )
}

function Avatar({ employee, fallbackName }) {
  const src = employee.photoUrl
  const initials = fallbackName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  if (src) {
    return <img src={src} alt="" className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-200" />
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-deep ring-1 ring-blue-100">
      {initials || <UserRound size={18} />}
    </div>
  )
}

function InfoBadge({ value, danger = false }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
      danger ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-slate-100 text-slate-600 ring-slate-200'
    }`}>
      {value}
    </span>
  )
}

function Toast({ type, message, onClose }) {
  const success = type === 'success'
  const Icon = success ? CheckCircle2 : XCircle

  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-sm ${
      success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'
    }`}>
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <p className="text-sm font-semibold">{message}</p>
      </div>
      <button type="button" onClick={onClose} className="font-bold opacity-70 hover:opacity-100" aria-label="Fermer">
        ×
      </button>
    </div>
  )
}

function AttendanceSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="grid gap-4 px-5 py-4 md:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_0.7fr]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />
            <div className="space-y-2">
              <div className="h-3 w-36 animate-pulse rounded-full bg-slate-100" />
              <div className="h-3 w-48 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

export default AttendanceEntryPage
