import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  Plus,
  XCircle,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useAuth from '../../hooks/useAuth'
import { getLeaves } from '../../api/leaves'
import { getLeaveBalance } from '../../api/leaveCreate'
import { formatDateFr } from '../../utils/leaveUtils'

const statutConfig = {
  EN_ATTENTE: { label: 'En attente', class: 'bg-amber-100 text-amber-700' },
  APPROUVE: { label: 'Approuvé', class: 'bg-emerald-100 text-emerald-700' },
  REFUSE: { label: 'Refusé', class: 'bg-red-100 text-red-700' },
}

const typeLabels = {
  ANNUEL: 'Annuel',
  MALADIE: 'Maladie',
  EXCEPTIONNEL: 'Exceptionnel',
  MATERNITE: 'Maternité',
  SANS_SOLDE: 'Sans solde',
}

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [balance, setBalance] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [leavesData, balanceData] = await Promise.all([
        getLeaves({}),
        getLeaveBalance(user.employeId),
      ])
      setLeaves(leavesData)
      setBalance(balanceData)
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false)
    }
  }, [user.employeId])

  useEffect(() => {
    if (user?.employeId) loadData()
  }, [user?.employeId, loadData])

  const pendingLeaves = useMemo(
    () => leaves.filter((l) => l.statut === 'EN_ATTENTE'),
    [leaves],
  )

  const historyLeaves = useMemo(() => {
    let filtered = leaves.filter((l) => l.statut !== 'EN_ATTENTE')
    if (filter !== 'ALL') filtered = filtered.filter((l) => l.statut === filter)
    return filtered.sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut))
  }, [leaves, filter])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">Congés</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Mes congés</h1>
            <p className="mt-1 text-sm text-slate-500">Gérez vos demandes de congés et suivez votre solde.</p>
          </div>
          <button
            onClick={() => navigate('/employe/conges/demander')}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-deep px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-hover"
          >
            <Plus size={16} />
            Nouvelle demande
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-slate-300" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <BalanceCard
                icon={CalendarCheck}
                label="Disponible"
                value={balance?.soldeDisponible ?? 0}
                color="blue"
              />
              <BalanceCard
                icon={CheckCircle2}
                label="Acquis"
                value={balance?.joursAcquis ?? 0}
                color="emerald"
              />
              <BalanceCard
                icon={History}
                label="Consommés"
                value={balance?.joursConsommes ?? 0}
                color="violet"
              />
              <BalanceCard
                icon={Clock}
                label="En attente"
                value={balance?.joursEnAttente ?? 0}
                color="amber"
              />
            </div>

            {pendingLeaves.length > 0 && (
              <section className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-amber-100 bg-amber-50/50 px-5 py-4">
                  <Clock size={18} className="text-amber-600" />
                  <h2 className="text-sm font-bold text-amber-900">
                    Demandes en attente ({pendingLeaves.length})
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {pendingLeaves.map((leave) => (
                    <LeaveRow key={leave.id} leave={leave} />
                  ))}
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <History size={18} className="text-slate-500" />
                  <h2 className="text-sm font-bold text-slate-950">Historique des demandes</h2>
                </div>
                <div className="flex gap-1">
                  {['ALL', 'APPROUVE', 'REFUSE'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        filter === s
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {s === 'ALL' ? 'Tous' : s === 'APPROUVE' ? 'Approuvés' : 'Refusés'}
                    </button>
                  ))}
                </div>
              </div>
              {historyLeaves.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  Aucun congé dans cette catégorie.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {historyLeaves.map((leave) => (
                    <LeaveRow key={leave.id} leave={leave} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppLayout>
  )
}

function BalanceCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-deep',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[color]}`}>
          <Icon size={17} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">jour(s)</p>
    </div>
  )
}

function LeaveRow({ leave }) {
  const cfg = statutConfig[leave.statut] || statutConfig.EN_ATTENTE
  return (
    <div className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">
            {typeLabels[leave.type] || leave.type}
          </p>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${cfg.class}`}>
            {cfg.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          du {formatDateFr(leave.dateDebut)} au {formatDateFr(leave.dateFin)}
          {leave.nombreJours > 0 && (
            <span className="ml-1.5 font-semibold text-slate-700">· {leave.nombreJours} jour{leave.nombreJours > 1 ? 's' : ''}</span>
          )}
        </p>
        {leave.motif && (
          <p className="mt-0.5 text-xs text-slate-400 italic">« {leave.motif} »</p>
        )}
        {leave.commentaireRH && leave.statut !== 'EN_ATTENTE' && (
          <p className="mt-0.5 text-xs text-slate-400">
            {leave.statut === 'REFUSE' ? <XCircle size={11} className="inline mr-1 text-red-400" /> : <CheckCircle2 size={11} className="inline mr-1 text-emerald-400" />}
            {leave.commentaireRH}
          </p>
        )}
      </div>
    </div>
  )
}