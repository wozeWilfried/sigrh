import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ClipboardX,
  DollarSign,
  Info,
  Package,
  RefreshCcw,
  ShieldAlert,
  Toolbox,
  Wrench,
  XCircle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import AppLayout from '../../components/layout/AppLayout'
import { getStats, getEquipment } from '../../api/materiel'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
const STATUS_LABELS = {
  DISPONIBLE: 'Disponible',
  ASSIGNE: 'Assigné',
  EN_MAINTENANCE: 'En maintenance',
  HORS_SERVICE: 'Hors service',
}
const STATUS_ICONS = {
  DISPONIBLE: CheckCircle2,
  ASSIGNE: Package,
  EN_MAINTENANCE: Wrench,
  HORS_SERVICE: ClipboardX,
}

export default function MaterielDashboard() {
  const [stats, setStats] = useState(null)
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, equipmentData] = await Promise.all([getStats(), getEquipment()])
      setStats(statsData)
      setEquipment(equipmentData)
    } catch {
      setError('Impossible de charger les données du parc matériel.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const pieData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Disponible', value: stats.disponible },
      { name: 'Assigné', value: stats.assigne },
      { name: 'En maintenance', value: stats.enMaintenance },
      { name: 'Hors service', value: stats.horsService },
    ]
  }, [stats])

  const barData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Disponible', value: stats.disponible },
      { name: 'Assigné', value: stats.assigne },
      { name: 'Maintenance', value: stats.enMaintenance },
      { name: 'Hors service', value: stats.horsService },
    ]
  }, [stats])

  const alerts = useMemo(() => {
    const result = []
    if (stats?.horsService > 0) {
      result.push({ type: 'CRITICAL', message: `${stats.horsService} matériel(s) hors service nécessitent une décision.` })
    }
    if (stats?.enMaintenance > 0) {
      result.push({ type: 'WARNING', message: `${stats.enMaintenance} matériel(s) en maintenance. Suivi recommandé.` })
    }
    if (stats?.total === 0) {
      result.push({ type: 'INFO', message: 'Aucun matériel enregistré dans le parc.' })
    }
    return result
  }, [stats])

  const criticalEquipment = useMemo(() => {
    return equipment
      .filter((m) => m.statut === 'HORS_SERVICE' || m.statut === 'EN_MAINTENANCE')
      .slice(0, 5)
  }, [equipment])

  const recentEquipment = useMemo(() => {
    return [...equipment]
      .sort((a, b) => new Date(b.dateAcquisition || 0) - new Date(a.dateAcquisition || 0))
      .slice(0, 5)
  }, [equipment])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">Matériel</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Tableau de bord du parc matériel</h1>
            <p className="mt-1 text-sm text-slate-500">
              Vue d’ensemble des équipements, répartition par statut et alertes.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 border border-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin text-slate-400' : 'text-blue-600'} />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">{error}</div>
        )}

        {alerts.length > 0 && !loading && (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
                  alert.type === 'CRITICAL'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : alert.type === 'WARNING'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-blue-200 bg-blue-50 text-blue-700'
                }`}
              >
                {alert.type === 'CRITICAL' ? <ShieldAlert size={18} /> : alert.type === 'WARNING' ? <AlertTriangle size={18} /> : <Info size={18} />}
                {alert.message}
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard title="Total" value={stats?.total} icon={Toolbox} color="bg-slate-600" loading={loading} />
          <KpiCard title="Disponible" value={stats?.disponible} icon={CheckCircle2} color="bg-emerald-500" loading={loading} />
          <KpiCard title="Assigné" value={stats?.assigne} icon={Package} color="bg-blue-500" loading={loading} />
          <KpiCard title="En maintenance" value={stats?.enMaintenance} icon={Wrench} color="bg-amber-500" loading={loading} />
          <KpiCard title="Hors service" value={stats?.horsService} icon={ClipboardX} color="bg-red-500" loading={loading} />
          <KpiCard title="Valeur totale" value={stats?.valeurTotale ? `${stats.valeurTotale.toLocaleString()} FCFA` : null} icon={DollarSign} color="bg-purple-500" loading={loading} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Répartition par statut" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Nombre d’équipements par statut" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" name="Équipements" radius={[4, 4, 0, 0]} barSize={48}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TableCard title="Matériel nécessitant une attention" loading={loading}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="pb-3 font-semibold">Nom</th>
                    <th className="pb-3 font-semibold">Statut</th>
                    <th className="pb-3 font-semibold">Catégorie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {criticalEquipment.length === 0 && (
                    <tr><td colSpan="3" className="py-4 text-center text-slate-500">Aucun matériel nécessitant une attention.</td></tr>
                  )}
                  {criticalEquipment.map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-900">{m.nom}</td>
                      <td className="py-3">
                        <StatusBadge statut={m.statut} />
                      </td>
                      <td className="py-3 text-slate-500">{m.categorie?.nom || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableCard>

          <TableCard title="Dernières acquisitions" loading={loading}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="pb-3 font-semibold">Nom</th>
                    <th className="pb-3 font-semibold">Code</th>
                    <th className="pb-3 font-semibold">Statut</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentEquipment.length === 0 && (
                    <tr><td colSpan="4" className="py-4 text-center text-slate-500">Aucun matériel enregistré.</td></tr>
                  )}
                  {recentEquipment.map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-900">{m.nom}</td>
                      <td className="py-3 text-slate-500">{m.code || '-'}</td>
                      <td className="py-3"><StatusBadge statut={m.statut} /></td>
                      <td className="py-3 text-slate-500 text-xs">{m.dateAcquisition || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableCard>
        </div>
      </div>
    </AppLayout>
  )
}

function KpiCard({ title, value, icon: Icon, color, loading }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-1 text-3xl font-bold text-slate-900 tracking-tight">{value ?? '—'}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-inner transition-transform group-hover:scale-110 ${color}`}>
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children, loading }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
      <h2 className="text-base font-bold text-slate-900 mb-6">{title}</h2>
      <div className="flex-1 min-h-[200px]">
        {loading ? (
          <div className="h-full w-full animate-pulse bg-slate-50 rounded-xl" />
        ) : children}
      </div>
    </div>
  )
}

function TableCard({ title, children, loading }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
      <h2 className="text-base font-bold text-slate-900 mb-4">{title}</h2>
      <div className="flex-1">
        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-full animate-pulse bg-slate-50 rounded-lg" />
            <div className="h-8 w-full animate-pulse bg-slate-50 rounded-lg" />
            <div className="h-8 w-full animate-pulse bg-slate-50 rounded-lg" />
          </div>
        ) : children}
      </div>
    </div>
  )
}

function StatusBadge({ statut }) {
  const colors = {
    DISPONIBLE: 'bg-emerald-100 text-emerald-700',
    ASSIGNE: 'bg-blue-100 text-blue-700',
    EN_MAINTENANCE: 'bg-amber-100 text-amber-700',
    HORS_SERVICE: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${colors[statut] || 'bg-slate-100 text-slate-700'}`}>
      {STATUS_LABELS[statut] || statut}
    </span>
  )
}
