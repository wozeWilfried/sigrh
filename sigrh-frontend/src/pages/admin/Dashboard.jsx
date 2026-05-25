import React from 'react'
import {
  Users,
  Building2,
  CalendarCheck,
  ShieldAlert,
  AlertCircle,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw
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
  LineChart,
  Line,
  Legend
} from 'recharts'
import AppLayout from '../../components/layout/AppLayout'
import useDashboard from '../../hooks/useDashboard'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899']

export default function AdminDashboard() {
  const {
    kpis,
    attendanceStats,
    departmentDistribution,
    riskTrends,
    recentLeaves,
    recentAlerts,
    loading,
    error,
    refetch
  } = useDashboard(300000) // 5 minutes

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tableau de bord principal</h1>
            <p className="mt-1 text-sm text-slate-500">
              Vue d'ensemble des indicateurs clés et de l'activité RH
            </p>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 border border-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin text-slate-400' : 'text-blue-600'} />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {/* KPIs */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Employés actifs"
            value={kpis?.employesActifs}
            variation={kpis?.employesVariation}
            icon={Users}
            color="bg-blue-500"
            loading={loading}
          />
          <KpiCard
            title="Taux de présence"
            value={kpis?.tauxPresence ? `${kpis.tauxPresence}%` : null}
            variation={kpis?.presenceVariation}
            icon={Building2}
            color="bg-emerald-500"
            loading={loading}
          />
          <KpiCard
            title="Congés en attente"
            value={kpis?.congesEnAttente}
            variation={kpis?.congesVariation}
            icon={CalendarCheck}
            color="bg-amber-500"
            loading={loading}
            inverseVariation // baisse = positif pour les congés en attente
          />
          <KpiCard
            title="Alertes turnover"
            value={kpis?.alertesActives}
            variation={kpis?.alertesVariation}
            icon={ShieldAlert}
            color="bg-rose-500"
            loading={loading}
            inverseVariation // baisse = positif pour les alertes
          />
        </div>

        {/* Graphiques */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ChartCard title="Évolution Présences/Absences" loading={loading} className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="presences" name="Présences" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="absences" name="Absences" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Répartition par département" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Risque Turnover Moyen (IA)" loading={loading} className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={riskTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  name="Score de risque" 
                  stroke="#f43f5e" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Tableaux */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TableCard title="Dernières demandes de congé" loading={loading}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="pb-3 font-semibold">Employé</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentLeaves.map((leave) => (
                    <tr key={leave.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-900">{leave.employe}</td>
                      <td className="py-3 text-slate-500 flex items-center gap-1.5"><Clock size={14}/> {leave.date}</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                          leave.statut === 'APPROUVE' ? 'bg-emerald-100 text-emerald-700' :
                          leave.statut === 'REJETE' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {leave.statut.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentLeaves.length === 0 && (
                    <tr><td colSpan="3" className="py-4 text-center text-slate-500">Aucune demande</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TableCard>

          <TableCard title="Dernières alertes IA actives" loading={loading}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="pb-3 font-semibold">Employé</th>
                    <th className="pb-3 font-semibold">Message</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentAlerts.map((alert) => (
                    <tr key={alert.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-900 flex items-center gap-2">
                        {alert.type === 'CRITICAL' ? <ShieldAlert size={14} className="text-red-500" /> :
                         alert.type === 'WARNING' ? <AlertCircle size={14} className="text-amber-500" /> :
                         <Info size={14} className="text-blue-500" />}
                        {alert.employe}
                      </td>
                      <td className="py-3 text-slate-600 truncate max-w-[200px]" title={alert.message}>{alert.message}</td>
                      <td className="py-3 text-slate-500 text-xs">{alert.date}</td>
                    </tr>
                  ))}
                  {recentAlerts.length === 0 && (
                    <tr><td colSpan="3" className="py-4 text-center text-slate-500">Aucune alerte récente</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TableCard>
        </div>
      </div>
    </AppLayout>
  )
}

function KpiCard({ title, value, variation, icon: Icon, color, loading, inverseVariation = false }) {
  const isPositiveVar = variation && variation.startsWith('+')
  const isNegativeVar = variation && variation.startsWith('-')
  
  // Logique : si inverseVariation est vrai (ex: alertes, congés en attente), 
  // une baisse est "Good" (vert), une hausse est "Bad" (rouge).
  const isGood = inverseVariation ? isNegativeVar : isPositiveVar
  const isBad = inverseVariation ? isPositiveVar : isNegativeVar

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
      
      {!loading && variation && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${
            isGood ? 'bg-emerald-50 text-emerald-700' : isBad ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-600'
          }`}>
            {isPositiveVar ? <ArrowUpRight size={14} /> : isNegativeVar ? <ArrowDownRight size={14} /> : null}
            {variation}
          </span>
          <span className="text-xs text-slate-400 font-medium">vs mois dernier</span>
        </div>
      )}
    </div>
  )
}

function ChartCard({ title, children, loading, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col ${className}`}>
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
