import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CalendarCheck,
  ChevronRight,
  Clock3,
  Hourglass,
  Mail,
  Pencil,
  Phone,
  Timer,
  Umbrella,
  UserRound,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import {
  getAIScore,
  getAttendances,
  getEmployeeById,
  getLeaves,
} from '../../api/employeeProfile'
import { getEmployeePresenceStats } from '../../api/attendanceAnalytics'

const tabs = [
  { id: 'infos', label: 'Informations', icon: UserRound },
  { id: 'attendances', label: 'Présences', icon: Clock3 },
  { id: 'leaves', label: 'Congés', icon: Umbrella },
  { id: 'ai', label: 'Score IA', icon: Bot },
]

const employeeStatusStyles = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ACTIF: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  INACTIVE: 'bg-slate-100 text-slate-600 ring-slate-200',
  INACTIF: 'bg-slate-100 text-slate-600 ring-slate-200',
  SUSPENDED: 'bg-red-50 text-red-700 ring-red-200',
  SUSPENDU: 'bg-red-50 text-red-700 ring-red-200',
}

const attendanceStatusStyles = {
  PRESENT: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ABSENT: 'bg-red-50 text-red-700 ring-red-200',
  RETARD: 'bg-amber-50 text-amber-700 ring-amber-200',
}

const leaveStatusStyles = {
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  APPROUVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PENDING: 'bg-orange-50 text-orange-700 ring-orange-200',
  EN_ATTENTE: 'bg-orange-50 text-orange-700 ring-orange-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
  REJETE: 'bg-red-50 text-red-700 ring-red-200',
}

export default function EmployeeProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('infos')
  const [employee, setEmployee] = useState(null)
  const [employeeLoading, setEmployeeLoading] = useState(true)
  const [employeeError, setEmployeeError] = useState(null)
  const [tabState, setTabState] = useState({
    attendances: { data: null, stats: null, loading: false, error: null, loaded: false },
    leaves: { data: null, loading: false, error: null, loaded: false },
    ai: { data: null, loading: false, error: null, loaded: false },
  })

  useEffect(() => {
    let ignore = false

    async function loadEmployee() {
      setEmployeeLoading(true)
      setEmployeeError(null)

      try {
        const data = await getEmployeeById(id)
        if (!ignore) setEmployee(data)
      } catch {
        if (!ignore) setEmployeeError('Impossible de charger le profil employé.')
      } finally {
        if (!ignore) setEmployeeLoading(false)
      }
    }

    loadEmployee()
    return () => {
      ignore = true
    }
  }, [id])

  const loadTabData = useCallback(async (tabId) => {
    const loaders = {
      attendances: async (empId) => {
        const [data, stats] = await Promise.allSettled([
          getAttendances(empId),
          getEmployeePresenceStats(empId, 'MENSUEL'),
        ])
        return {
          data: data.status === 'fulfilled' ? data.value : [],
          stats: stats.status === 'fulfilled' ? stats.value : null,
        }
      },
      leaves: getLeaves,
      ai: getAIScore,
    }

    if (!loaders[tabId]) return

    setTabState((current) => ({
      ...current,
      [tabId]: { ...current[tabId], loading: true, error: null },
    }))

    try {
      const result = await loaders[tabId](id)
      if (tabId === 'attendances') {
        setTabState((current) => ({
          ...current,
          attendances: { ...result, loading: false, error: null, loaded: true },
        }))
      } else {
        setTabState((current) => ({
          ...current,
          [tabId]: { data: result, loading: false, error: null, loaded: true },
        }))
      }
    } catch {
      setTabState((current) => ({
        ...current,
        [tabId]: {
          ...current[tabId],
          loading: false,
          error: 'Impossible de charger ces données.',
          loaded: true,
        },
      }))
    }
  }, [id])

  useEffect(() => {
    if (activeTab !== 'infos' && !tabState[activeTab]?.loaded && !tabState[activeTab]?.loading) {
      loadTabData(activeTab)
    }
  }, [activeTab, loadTabData, tabState])

  if (employeeLoading) {
    return (
      <AppLayout>
        <ProfileSkeleton />
      </AppLayout>
    )
  }

  if (employeeError) {
    return (
      <AppLayout>
        <Card className="p-8 text-center">
          <p className="text-sm font-semibold text-red-600">{employeeError}</p>
          <button
            type="button"
            onClick={() => navigate('/admin/employes')}
            className="mt-4 rounded-xl bg-blue-deep px-4 py-2.5 text-sm font-semibold text-white"
          >
            Retour à la liste
          </button>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <ProfileHeader employee={employee} />

        <Card className="p-2">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </Card>

        {activeTab === 'infos' && <InformationTab employee={employee} />}
        {activeTab === 'attendances' && <AttendancesTab state={tabState.attendances} />}
        {activeTab === 'leaves' && <LeavesTab state={tabState.leaves} />}
        {activeTab === 'ai' && <AIScoreTab state={tabState.ai} />}
      </div>
    </AppLayout>
  )
}

function ProfileHeader({ employee }) {
  const employeeId = employee.id ?? employee.employeId
  const fullName = getEmployeeFullName(employee)

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/admin/employes" className="inline-flex items-center gap-2 font-medium hover:text-slate-950">
            <ArrowLeft size={16} />
            Employés
          </Link>
          <ChevronRight size={15} />
          <span className="font-medium text-slate-900">Profil détaillé</span>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar employee={employee} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-950">{fullName}</h1>
              <Badge value={employee.statut ?? employee.status ?? 'INACTIVE'} styles={employeeStatusStyles} />
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Mail size={15} />
                {employee.email ?? 'Email non renseigné'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone size={15} />
                {employee.telephone ?? employee.phone ?? 'Téléphone non renseigné'}
              </span>
            </div>
          </div>
        </div>

        {employeeId && (
          <Link
            to={`/admin/employes/${employeeId}/modifier`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-deep px-4 text-sm font-semibold text-white shadow-sm shadow-blue-deep/20 transition-colors hover:bg-blue-hover"
          >
            <Pencil size={16} />
            Modifier
          </Link>
        )}
      </div>
    </Card>
  )
}

function InformationTab({ employee }) {
  const leaveBalance = employee.soldeConges ?? employee.leaveBalance ?? 18

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <Card className="p-6">
        <SectionTitle title="Informations générales" subtitle="Vue synthétique du dossier employé." />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoItem label="Nom" value={employee.nom ?? employee.lastName ?? '-'} />
          <InfoItem label="Prénom" value={employee.prenom ?? employee.firstName ?? '-'} />
          <InfoItem label="Email" value={employee.email ?? '-'} />
          <InfoItem label="Téléphone" value={employee.telephone ?? employee.phone ?? '-'} />
          <InfoItem label="Département" value={employee.departementNom ?? employee.departmentName ?? '-'} />
          <InfoItem label="Poste" value={employee.poste ?? employee.position ?? '-'} />
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle title="Solde de congés" subtitle="Disponibilité actuelle estimée." />
        <div className="mt-8 flex items-end gap-3">
          <span className="text-5xl font-bold text-slate-950">{leaveBalance}</span>
          <span className="pb-2 text-sm font-semibold text-slate-500">jours disponibles</span>
        </div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-deep" style={{ width: `${Math.min(leaveBalance * 4, 100)}%` }} />
        </div>
      </Card>
    </div>
  )
}

function AttendancesTab({ state }) {
  const attendances = state.data ?? []
  const stats = state.stats ?? null
  const presenceRate = useMemo(() => {
    if (stats) return stats.tauxPresence
    if (!attendances.length) return 0
    const presentCount = attendances.filter((item) => normalizeAttendanceStatus(item) === 'PRESENT').length
    return Math.round((presentCount / attendances.length) * 100)
  }, [attendances, stats])

  if (state.loading) return <TableSkeleton />
  if (state.error) return <ErrorCard message={state.error} />

  return (
    <div className="grid gap-6">
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={Clock3}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            label="Taux de présence"
            value={`${stats.tauxPresence}%`}
          />
          <KpiCard
            icon={AlertTriangle}
            iconColor="text-red-600"
            iconBg="bg-red-50"
            label="Absences"
            value={stats.nbJoursAbsents}
          />
          <KpiCard
            icon={Hourglass}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            label="Retards"
            value={stats.nbRetards}
          />
          <KpiCard
            icon={Timer}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            label="Heures travaillées"
            value={`${stats.totalHeuresTravaillees}h`}
          />
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <SectionTitle title="Taux de présence" subtitle="Calculé sur les 30 derniers jours." />
          <div className="mt-7">
            <ProgressMetric value={presenceRate} />
            <MiniBarChart data={attendances} />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <SectionTitle title="30 derniers jours" subtitle="Présences, absences et retards." />
          </div>
          <ResponsiveTable
            headers={['Date', 'Statut']}
            rows={attendances.map((attendance) => [
              formatDate(attendance.date),
              <Badge
                key={attendance.id ?? attendance.date}
                value={normalizeAttendanceStatus(attendance)}
                styles={attendanceStatusStyles}
              />,
            ])}
          />
        </Card>
      </div>
    </div>
  )
}

function KpiCard({ icon: Icon, iconColor, iconBg, label, value }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
          <Icon size={24} className={iconColor} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
          <p className="mt-0.5 text-xl font-bold text-slate-950">{value}</p>
        </div>
      </div>
    </Card>
  )
}

function LeavesTab({ state }) {
  const leaves = state.data ?? []

  if (state.loading) return <TableSkeleton />
  if (state.error) return <ErrorCard message={state.error} />

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 p-5">
        <SectionTitle title="Demandes de congés" subtitle="Historique des dernières demandes." />
      </div>
      <ResponsiveTable
        headers={['Début', 'Fin', 'Type', 'Statut']}
        rows={leaves.map((leave) => [
          formatDate(leave.dateDebut ?? leave.startDate),
          formatDate(leave.dateFin ?? leave.endDate),
          leave.type ?? '-',
          <Badge key={leave.id} value={normalizeLeaveStatus(leave)} styles={leaveStatusStyles} />,
        ])}
        emptyMessage="Aucune demande de congé trouvée."
      />
    </Card>
  )
}

function AIScoreTab({ state }) {
  const scoreData = state.data
  const score = Number(scoreData?.score ?? scoreData?.riskScore ?? 0)
  const factors = scoreData?.factors ?? scoreData?.facteurs ?? []
  const lastCalculatedAt = scoreData?.lastCalculatedAt ?? scoreData?.dateDernierCalcul

  if (state.loading) return <TableSkeleton />
  if (state.error) return <ErrorCard message={state.error} />

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="p-6">
        <SectionTitle title="Score de risque IA" subtitle="Probabilité estimée sur la base RH disponible." />
        <div className="mt-8">
          <ProgressMetric value={score} tone={score >= 70 ? 'danger' : score >= 45 ? 'warning' : 'success'} />
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Dernier calcul : <span className="font-semibold text-slate-800">{formatDate(lastCalculatedAt)}</span>
        </p>
      </Card>

      <Card className="p-6">
        <SectionTitle title="Facteurs de risque" subtitle="Signaux explicatifs utilisés pour la lecture RH." />
        <ul className="mt-6 space-y-3">
          {factors.map((factor) => (
            <li key={factor} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <CalendarCheck size={18} className="mt-0.5 text-blue-deep" />
              <span className="text-sm font-medium text-slate-700">{factor}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function Tabs({ tabs: tabItems, activeTab, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {tabItems.map((tab) => {
        const Icon = tab.icon
        const active = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${
              active
                ? 'bg-blue-deep text-white shadow-sm shadow-blue-deep/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
            aria-pressed={active}
          >
            <Icon size={17} />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

function ResponsiveTable({ headers, rows, emptyMessage = 'Aucune donnée disponible.' }) {
  if (!rows.length) {
    return <div className="p-8 text-center text-sm font-medium text-slate-500">{emptyMessage}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition-colors hover:bg-slate-50/80">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MiniBarChart({ data }) {
  const recent = data.slice(0, 14).reverse()

  return (
    <div className="mt-8 flex h-36 items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {recent.map((item) => {
        const status = normalizeAttendanceStatus(item)
        const height = status === 'PRESENT' ? 92 : status === 'RETARD' ? 58 : 28
        const color = status === 'PRESENT' ? 'bg-emerald-500' : status === 'RETARD' ? 'bg-amber-400' : 'bg-red-400'

        return (
          <div key={item.id ?? item.date} className="flex flex-1 items-end">
            <div className={`w-full rounded-t-lg ${color}`} style={{ height: `${height}%` }} title={`${formatDate(item.date)} - ${status}`} />
          </div>
        )
      })}
    </div>
  )
}

function ProgressMetric({ value, tone = 'success' }) {
  const colors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  }

  return (
    <div>
      <div className="flex items-end gap-2">
        <span className="text-5xl font-bold text-slate-950">{value}</span>
        <span className="pb-2 text-lg font-bold text-slate-500">%</span>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
      </div>
    </div>
  )
}

function Avatar({ employee, size = 'md' }) {
  const fullName = getEmployeeFullName(employee)
  const src = employee.photoUrl ?? employee.avatar ?? employee.photo
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  const sizeClass = size === 'lg' ? 'h-20 w-20 text-xl rounded-3xl' : 'h-12 w-12 text-sm rounded-2xl'

  if (src) {
    return <img src={src} alt="" className={`${sizeClass} object-cover ring-1 ring-slate-200`} />
  }

  return (
    <div className={`${sizeClass} flex items-center justify-center bg-blue-50 font-bold text-blue-deep ring-1 ring-blue-100`}>
      {initials || <UserRound size={22} />}
    </div>
  )
}

function Badge({ value, styles }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles[value] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
      {formatStatus(value)}
    </span>
  )
}

function Card({ className = '', children }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  )
}

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function ErrorCard({ message }) {
  return (
    <Card className="p-8 text-center">
      <p className="text-sm font-semibold text-red-600">{message}</p>
    </Card>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-3xl bg-slate-100" />
          <div className="space-y-3">
            <div className="h-5 w-56 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-80 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      </Card>
      <TableSkeleton />
    </div>
  )
}

function TableSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid gap-4 sm:grid-cols-4">
            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    </Card>
  )
}

function getEmployeeFullName(employee) {
  return `${employee.prenom ?? employee.firstName ?? ''} ${employee.nom ?? employee.lastName ?? ''}`.trim() || 'Employé'
}

function normalizeAttendanceStatus(attendance) {
  return attendance.statut ?? attendance.status ?? 'ABSENT'
}

function normalizeLeaveStatus(leave) {
  return leave.statut ?? leave.status ?? 'PENDING'
}

function formatStatus(status) {
  const labels = {
    ACTIF: 'ACTIVE',
    INACTIF: 'INACTIVE',
    SUSPENDU: 'SUSPENDED',
    APPROUVE: 'APPROVED',
    EN_ATTENTE: 'PENDING',
    REJETE: 'REJECTED',
  }

  return labels[status] ?? status
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
