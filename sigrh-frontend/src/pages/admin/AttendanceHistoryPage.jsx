import { useMemo, useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  Download,
  Loader2,
  Search,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useAttendanceAnalytics from '../../hooks/useAttendanceAnalytics'

const statusStyles = {
  PRESENT: 'bg-emerald-500 text-white',
  RETARD: 'bg-orange-400 text-white',
  ABSENT: 'bg-red-500 text-white',
  EMPTY: 'bg-slate-200 text-slate-500',
}

const statusLabels = {
  PRESENT: 'Présent',
  RETARD: 'Retard',
  ABSENT: 'Absent',
  EMPTY: 'Non renseigné',
}

export default function AttendanceHistoryPage() {
  const analytics = useAttendanceAnalytics()

  return (
    <AppLayout>
      <div className="space-y-6">
        <Header onExport={() => exportPdf(analytics)} />
        <Filters analytics={analytics} />

        {analytics.loading ? (
          <AnalyticsSkeleton />
        ) : analytics.error ? (
          <ErrorCard message={analytics.error} onRetry={analytics.reload} />
        ) : (
          <>
            <StatsSection stats={analytics.stats} />
            <Heatmap history={analytics.history} />
          </>
        )}
      </div>
    </AppLayout>
  )
}

function Header({ onExport }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">
          Présences
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Historique & Statistiques</h1>
        <p className="mt-1 text-sm text-slate-500">
          Analysez l’assiduité des employés sur une période sélectionnée.
        </p>
      </div>
      <button
        type="button"
        onClick={onExport}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-deep px-4 text-sm font-semibold text-white shadow-sm shadow-blue-deep/20 transition-colors hover:bg-blue-hover"
      >
        <Download size={17} />
        Exporter PDF
      </button>
    </div>
  )
}

function Filters({ analytics }) {
  const {
    filters,
    departments,
    employeeQuery,
    employeeSuggestions,
    selectedEmployee,
    employeesLoading,
    activeFiltersCount,
    updateFilter,
    setEmployeeQuery,
    selectEmployee,
    resetFilters,
  } = analytics
  const [open, setOpen] = useState(false)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950">Filtres</h2>
          <p className="mt-1 text-sm text-slate-500">{activeFiltersCount} filtre(s) actif(s)</p>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
        >
          Réinitialiser
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_240px_190px_190px]">
        <div className="relative">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Employé</label>
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={employeeQuery}
              onFocus={() => setOpen(true)}
              onChange={(event) => {
                setEmployeeQuery(event.target.value)
                setOpen(true)
                if (!event.target.value) selectEmployee(null)
              }}
              placeholder={employeesLoading ? 'Chargement...' : 'Rechercher un employé...'}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-blue-deep/30 focus:bg-white focus:ring-4 focus:ring-blue-deep/10"
            />
            {selectedEmployee && (
              <button
                type="button"
                onClick={() => selectEmployee(null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Retirer l’employé"
              >
                <X size={15} />
              </button>
            )}
          </div>
          {open && employeeSuggestions.length > 0 && (
            <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
              {employeeSuggestions.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => {
                    selectEmployee(employee)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <Avatar employee={employee} />
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">
                      {employee.prenom} {employee.nom}
                    </span>
                    <span className="text-xs text-slate-500">{employee.departementNom}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Field label="Département">
          <select
            value={filters.department}
            onChange={(event) => updateFilter('department', event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-deep/30 focus:bg-white focus:ring-4 focus:ring-blue-deep/10"
          >
            <option value="">Tous les départements</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </Field>

        <Field label="Date début">
          <DateInput value={filters.startDate} onChange={(value) => updateFilter('startDate', value)} />
        </Field>

        <Field label="Date fin">
          <DateInput value={filters.endDate} onChange={(value) => updateFilter('endDate', value)} />
        </Field>
      </div>
    </section>
  )
}

function StatsSection({ stats }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1fr_1.2fr]">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Taux de présence global</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-bold text-slate-950">{stats.globalPresenceRate}</span>
              <span className="pb-2 text-lg font-bold text-slate-500">%</span>
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <TrendingUp size={22} />
          </div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.globalPresenceRate}%` }} />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-bold text-slate-950">Top 5 absentéistes</h2>
        <div className="mt-4 space-y-3">
          {stats.topAbsentees.map((item) => (
            <div key={item.employee.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar employee={item.employee} />
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {item.employee.prenom} {item.employee.nom}
                  </p>
                  <p className="text-xs text-slate-500">{item.employee.departementNom}</p>
                </div>
              </div>
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200">
                {item.absences} abs.
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">Évolution hebdomadaire</h2>
            <p className="mt-1 text-sm text-slate-500">Présents / absents par semaine.</p>
          </div>
          <BarChart3 size={22} className="text-blue-deep" />
        </div>
        <WeeklyBarChart data={stats.weeklyEvolution} />
      </Card>
    </div>
  )
}

function WeeklyBarChart({ data }) {
  const max = Math.max(...data.map((item) => Math.max(item.presents, item.absents)), 1)

  return (
    <div className="flex h-56 items-end gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      {data.map((item) => (
        <div key={item.week} className="flex flex-1 flex-col items-center justify-end gap-2">
          <div className="flex h-40 items-end gap-1">
            <div
              className="w-5 rounded-t-lg bg-emerald-500"
              style={{ height: `${Math.max((item.presents / max) * 100, 6)}%` }}
              title={`${item.presents} présents`}
            />
            <div
              className="w-5 rounded-t-lg bg-red-500"
              style={{ height: `${Math.max((item.absents / max) * 100, 6)}%` }}
              title={`${item.absents} absents`}
            />
          </div>
          <span className="text-xs font-bold text-slate-500">{item.week}</span>
        </div>
      ))}
    </div>
  )
}

function Heatmap({ history }) {
  const dayLabels = useMemo(() => history.days.map((day) => ({
    value: day,
    label: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(day)),
  })), [history.days])

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-base font-bold text-slate-950">Tableau récapitulatif</h2>
        <p className="mt-1 text-sm text-slate-500">
          Heatmap des présences sur la période sélectionnée.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 min-w-[240px] border-b border-slate-100 bg-slate-50 px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Employé
              </th>
              {dayLabels.map((day) => (
                <th
                  key={day.value}
                  className="sticky top-0 z-10 min-w-20 border-b border-slate-100 bg-slate-50 px-3 py-3 text-center text-xs font-bold text-slate-500"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.records.map((row) => (
              <tr key={row.employee.id} className="group">
                <td className="sticky left-0 z-10 border-b border-slate-100 bg-white px-5 py-4 group-hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Avatar employee={row.employee} />
                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        {row.employee.prenom} {row.employee.nom}
                      </p>
                      <p className="text-xs text-slate-500">{row.employee.departementNom}</p>
                    </div>
                  </div>
                </td>
                {history.days.map((day) => {
                  const attendance = row.attendances[day]
                  const status = attendance?.statut ?? 'EMPTY'
                  const title = `${statusLabels[status]} · ${attendance?.heureArrivee ?? '--:--'} - ${attendance?.heureDepart ?? '--:--'}`

                  return (
                    <td key={`${row.employee.id}-${day}`} className="border-b border-slate-100 px-3 py-4 text-center">
                      <span
                        title={title}
                        className={`mx-auto block h-8 w-8 rounded-lg ring-1 ring-white/70 transition-transform hover:scale-110 ${statusStyles[status]}`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function exportPdf(analytics) {
  const { filters, history, stats, selectedEmployee } = analytics
  const popup = window.open('', '_blank', 'width=1200,height=800')
  if (!popup) return

  const rows = history.records.map((row) => {
    const cells = history.days.map((day) => {
      const attendance = row.attendances[day]
      return `<td>${attendance?.statut ?? '-'}</td>`
    }).join('')

    return `<tr><td>${row.employee.prenom} ${row.employee.nom}</td>${cells}</tr>`
  }).join('')

  popup.document.write(`
    <html>
      <head>
        <title>SIGRH - Export presences</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; padding: 28px; }
          h1 { margin-bottom: 4px; }
          .muted { color: #64748b; font-size: 13px; }
          .cards { display: flex; gap: 12px; margin: 20px 0; }
          .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; flex: 1; }
          table { border-collapse: collapse; width: 100%; font-size: 11px; margin-top: 18px; }
          th, td { border: 1px solid #e2e8f0; padding: 7px; text-align: left; }
          th { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h1>SIGRH - Historique des présences</h1>
        <p class="muted">Employé: ${selectedEmployee ? `${selectedEmployee.prenom} ${selectedEmployee.nom}` : 'Tous'} · Département: ${filters.department || 'Tous'} · Période: ${filters.startDate} au ${filters.endDate}</p>
        <div class="cards">
          <div class="card"><strong>Taux global</strong><br>${stats.globalPresenceRate}%</div>
          <div class="card"><strong>Présences</strong><br>${stats.totals?.PRESENT ?? 0}</div>
          <div class="card"><strong>Retards</strong><br>${stats.totals?.RETARD ?? 0}</div>
          <div class="card"><strong>Absences</strong><br>${stats.totals?.ABSENT ?? 0}</div>
        </div>
        <table>
          <thead><tr><th>Employé</th>${history.days.map((day) => `<th>${day}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <script>window.print();</script>
      </body>
    </html>
  `)
  popup.document.close()
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function DateInput({ value, onChange }) {
  return (
    <div className="relative">
      <CalendarDays size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-deep/30 focus:bg-white focus:ring-4 focus:ring-blue-deep/10"
      />
    </div>
  )
}

function Avatar({ employee }) {
  const initials = `${employee.prenom ?? ''} ${employee.nom ?? ''}`
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-deep ring-1 ring-blue-100">
      {initials || <UserRound size={18} />}
    </div>
  )
}

function Card({ className = '', children }) {
  return <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>
}

function ErrorCard({ message, onRetry }) {
  return (
    <Card className="p-8 text-center">
      <p className="text-sm font-semibold text-red-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-blue-deep px-4 text-sm font-semibold text-white"
      >
        Réessayer
      </button>
    </Card>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-5">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-5 h-12 w-24 animate-pulse rounded-xl bg-slate-100" />
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </Card>
    </div>
  )
}
