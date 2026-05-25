import { LayoutDashboard, Users, Building2, CalendarCheck, ClipboardCheck, BarChart3 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'

const stats = [
  { label: 'Employés actifs', value: '—', icon: Users, color: 'bg-indigo-500' },
  { label: 'Départements', value: '—', icon: Building2, color: 'bg-emerald-500' },
  { label: 'Congés en attente', value: '—', icon: CalendarCheck, color: 'bg-amber-500' },
  { label: 'Présences aujourd\'hui', value: '—', icon: ClipboardCheck, color: 'bg-cyan-500' },
  { label: 'Rapports générés', value: '—', icon: BarChart3, color: 'bg-violet-500' },
  { label: 'Taux d\'absentéisme', value: '—', icon: LayoutDashboard, color: 'bg-rose-500' },
]

export default function AdminDashboard() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">
          Aperçu général de votre gestion des ressources humaines
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-0.5 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Activité récente</h2>
          <p className="mt-4 text-sm text-slate-500">Aucune activité récente à afficher.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Prochains événements</h2>
          <p className="mt-4 text-sm text-slate-500">Aucun événement planifié.</p>
        </div>
      </div>
    </AppLayout>
  )
}
