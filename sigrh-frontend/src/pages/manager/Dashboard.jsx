import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts'
import { Users, CalendarCheck, ClipboardCheck, TrendingUp, Loader2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useAuth from '../../hooks/useAuth'
import { getEvolution, getDashboardKpis, getRecentLeaves } from '../../api/dashboard'

export default function ManagerDashboard() {
  const { roleDisplayName } = useAuth()
  const [evolution, setEvolution] = useState([])
  const [kpis, setKpis] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getEvolution(new Date().getFullYear()),
      getDashboardKpis(),
      getRecentLeaves(),
    ]).then(([ev, k, lv]) => {
      if (cancelled) return
      setEvolution(ev)
      setKpis(k)
      setLeaves(lv)
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const stats = [
    { label: 'Employés actifs', value: kpis?.employesActifs ?? '—', icon: Users, bg: 'bg-blue-50', text: 'text-blue-600', variation: kpis?.employesVariation },
    { label: 'Congés en attente', value: kpis?.congesEnAttente ?? '—', icon: CalendarCheck, bg: 'bg-amber-50', text: 'text-amber-600', variation: kpis?.congesVariation },
    { label: 'Taux de présence', value: kpis?.tauxPresence != null ? `${kpis.tauxPresence}%` : '—', icon: ClipboardCheck, bg: 'bg-emerald-50', text: 'text-emerald-600', variation: kpis?.presenceVariation },
    { label: 'Score risque moyen', value: kpis?.alertesActives != null ? `${kpis.alertesActives}` : '—', icon: TrendingUp, bg: 'bg-violet-50', text: 'text-violet-600' },
  ]

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={32} className="animate-spin text-blue-deep" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">
            Espace {roleDisplayName()}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Tableau de bord</h1>
          <p className="mt-1 text-sm text-slate-500">
            Suivez les activités de votre département.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-2xl font-bold text-slate-950">{stat.value}</p>
                  {stat.variation && (
                    <p className={`mt-1 text-xs font-semibold ${stat.variation.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                      {stat.variation} vs mois dernier
                    </p>
                  )}
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.text}`}>
                  <stat.icon size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Évolution mensuelle</h2>
          <p className="mt-1 text-sm text-slate-500">Présences, absences, congés et score de risque par mois.</p>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={evolution}>
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="nbPresences" name="Présences" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="nbAbsences" name="Absences" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="nbConges" name="Congés" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="scoreRisqueMoyen" name="Score risque moyen" stroke="#7C3AED" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-950">Demandes de congé récentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  {['Employé', 'Date', 'Statut'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.slice(0, 5).map((lv) => (
                  <tr key={lv.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950">{lv.employe}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{lv.date}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                        lv.statut === 'APPROUVE' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : lv.statut === 'REJETE' || lv.statut === 'REFUSE' ? 'bg-red-50 text-red-700 ring-red-200'
                        : 'bg-amber-50 text-amber-700 ring-amber-200'
                      }`}>
                        {lv.statut === 'EN_ATTENTE' ? 'En attente' : lv.statut === 'APPROUVE' ? 'Approuvé' : 'Refusé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
