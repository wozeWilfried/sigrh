import { useState, useEffect, useCallback } from 'react'
import { CalendarCheck, Clock, TrendingUp, UserRound, AlertTriangle, RefreshCcw } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { getEmployeePresenceStats, getAttendanceEmployees } from '../../api/attendanceAnalytics'

export default function ManagerPresences() {
  const [employees, setEmployees] = useState([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [periode, setPeriode] = useState('MENSUEL')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [employeesLoading, setEmployeesLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setEmployeesLoading(true)
    getAttendanceEmployees()
      .then((data) => { if (!cancelled) setEmployees(data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setEmployeesLoading(false) })
    return () => { cancelled = true }
  }, [])

  const loadStats = useCallback(async () => {
    if (!selectedEmployeeId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getEmployeePresenceStats(selectedEmployeeId, periode)
      setStats(data)
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }, [selectedEmployeeId, periode])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const selectedEmployee = employees.find((e) => String(e.id) === String(selectedEmployeeId))

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">
              Espace Manager
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Consultation des présences</h1>
            <p className="mt-1 text-sm text-slate-500">
              Indicateurs de présence par employé et par période.
            </p>
          </div>
          {selectedEmployeeId && (
            <button
              type="button"
              onClick={loadStats}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-deep px-4 text-sm font-semibold text-white shadow-sm shadow-blue-deep/20 transition-colors hover:bg-blue-hover"
            >
              <RefreshCcw size={17} />
              Actualiser
            </button>
          )}
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Employé</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                disabled={employeesLoading}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-deep/30 focus:bg-white focus:ring-4 focus:ring-blue-deep/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {employeesLoading ? 'Chargement...' : 'Sélectionner un employé'}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.prenom} {emp.nom} — {emp.departementNom}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Période</span>
              <div className="flex gap-2">
                {['HEBDO', 'MENSUEL'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriode(p)}
                    className={`flex-1 h-12 rounded-xl border text-sm font-semibold outline-none transition-all ${
                      periode === p
                        ? 'border-blue-deep bg-blue-deep text-white shadow-sm shadow-blue-deep/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p === 'HEBDO' ? 'Hebdomadaire' : 'Mensuel'}
                  </button>
                ))}
              </div>
            </label>
          </div>
        </section>

        {!selectedEmployeeId ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 shadow-sm">
            <UserRound size={40} className="text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Sélectionnez un employé pour voir ses indicateurs de présence.
            </p>
          </div>
        ) : loading ? (
          <StatsSkeleton />
        ) : error ? (
          <ErrorCard message={error} onRetry={loadStats} />
        ) : stats ? (
          <>
            {selectedEmployee && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-deep ring-1 ring-blue-100">
                    {(selectedEmployee.prenom?.[0] || '') + (selectedEmployee.nom?.[0] || '')}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      {selectedEmployee.prenom} {selectedEmployee.nom}
                    </h2>
                    <p className="text-sm text-slate-500">{selectedEmployee.departementNom}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={TrendingUp}
                label="Taux de présence"
                value={`${stats.tauxPresence}%`}
                bg="bg-emerald-50"
                text="text-emerald-600"
              />
              <KpiCard
                icon={AlertTriangle}
                label="Jours d'absence"
                value={String(stats.nbJoursAbsents)}
                bg="bg-red-50"
                text="text-red-600"
              />
              <KpiCard
                icon={Clock}
                label="Retards"
                value={String(stats.nbRetards)}
                bg="bg-amber-50"
                text="text-amber-600"
              />
              <KpiCard
                icon={CalendarCheck}
                label="Heures travaillées"
                value={`${stats.totalHeuresTravaillees}h`}
                bg="bg-blue-50"
                text="text-blue-600"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-500">Moyenne heures / jour</h3>
                <p className="mt-2 text-3xl font-bold text-slate-950">{stats.moyenneHeuresJour}h</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-500">Période concernée</h3>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  Du {stats.dateDebut} au {stats.dateFin}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {stats.periode === 'HEBDO' ? 'Hebdomadaire' : 'Mensuel'}
                </span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AppLayout>
  )
}

function KpiCard({ icon: Icon, label, value, bg, text }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${text}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-28 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-4 h-9 w-20 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold text-red-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-blue-deep px-4 text-sm font-semibold text-white"
      >
        Réessayer
      </button>
    </div>
  )
}
