import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  ChevronDown,
  Loader2,
  RefreshCcw,
  Search,
  Sparkles,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { getDepartsRetraite } from '../../api/retirements'

const CATEGORY_CONFIG = {
  RETRAITE: {
    label: 'Parti en retraite',
    badgeClass: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  IMMINENT: {
    label: 'Départ imminent',
    badgeClass: 'bg-red-50 text-red-700 ring-red-200',
    dotClass: 'bg-red-500',
  },
  PROCHE: {
    label: 'Départ proche',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-200',
    dotClass: 'bg-amber-500',
  },
  PLANIFIE: {
    label: 'Départ planifié',
    badgeClass: 'bg-slate-100 text-slate-600 ring-slate-200',
    dotClass: 'bg-slate-400',
  },
}

const AGES_LEGAL = 60

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatEcheance(row) {
  if (row.dejaParti) return 'Déjà parti'
  const mois = Number(row.moisRestants) || 0
  if (mois <= 0) return 'Départ imminent'
  const annees = Math.floor(mois / 12)
  const reste = mois % 12
  const parts = []
  if (annees) parts.push(`${annees} an${annees > 1 ? 's' : ''}`)
  if (reste) parts.push(`${reste} mois`)
  return `Dans ${parts.join(' ')}`
}

export default function DepartsRetraite() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setRows(await getDepartsRetraite())
    } catch {
      setError('Impossible de charger les départs en retraite.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const kpis = useMemo(() => {
    const partis = rows.filter((r) => r.dejaParti).length
    const imminents = rows.filter((r) => !r.dejaParti && r.categorie === 'IMMINENT').length
    const aVenir = rows.filter((r) => !r.dejaParti).length
    return { total: rows.length, partis, imminents, aVenir }
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter && r.categorie !== filter) return false
      if (!q) return true
      return [r.nomComplet, r.matricule, r.poste, r.departement]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [rows, search, filter])

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
                Gestion RH
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Départs en retraite</h1>
            <p className="mt-1 text-sm text-slate-500">
              Âge légal de départ fixé à {AGES_LEGAL} ans. Liste utilisée pour anticiper la prédiction de turnover.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ia/predictions"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              <Sparkles size={16} />
              Voir prédictions turnover
            </Link>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
              Rafraîchir
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total concernés" value={kpis.total} icon={Users} tone="indigo" loading={loading} />
          <KpiCard label="Déjà partis" value={kpis.partis} icon={UserMinus} tone="slate" loading={loading} />
          <KpiCard label="Départs imminents (≤ 12 mois)" value={kpis.imminents} icon={CalendarClock} tone="red" loading={loading} />
          <KpiCard label="Départs à venir" value={kpis.aVenir} icon={UserCheck} tone="amber" loading={loading} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un employé, matricule, poste…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-categorie" className="text-xs font-semibold text-slate-600">Échéance</label>
            <div className="relative">
              <select
                id="filter-categorie"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="">Toutes les catégories</option>
                <option value="RETRAITE">Partis en retraite</option>
                <option value="IMMINENT">Départ imminent (≤ 12 mois)</option>
                <option value="PROCHE">Départ proche (≤ 3 ans)</option>
                <option value="PLANIFIE">Départ planifié (≤ 5 ans)</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-medium text-red-700">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <CalendarClock size={26} className="text-slate-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-950">Aucun départ en retraite</h3>
            <p className="mt-1 text-sm text-slate-500">Ajustez la recherche ou le filtre.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-950">Liste des départs en retraite</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {filtered.length} employé{filtered.length > 1 ? 's' : ''} · triés par échéance
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50/80">
                    {['Employé', 'Département', 'Poste', 'Âge', 'Date de retraite', 'Échéance', 'Statut'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => (
                    <Row key={row.employeId} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function Row({ row }) {
  const config = CATEGORY_CONFIG[row.categorie] ?? CATEGORY_CONFIG.PLANIFIE
  const initials = row.nomComplet
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

  return (
    <tr className="transition-colors hover:bg-slate-50/80">
      <td className="whitespace-nowrap px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700 ring-1 ring-indigo-200">
            {initials || <Users size={16} />}
          </div>
          <div>
            <Link to={`/admin/employes/${row.employeId}`} className="font-semibold text-slate-950 hover:text-indigo-700">
              {row.nomComplet}
            </Link>
            <p className="text-xs text-slate-500">{row.matricule}</p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{row.departement}</td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{row.poste || '—'}</td>
      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">{row.age} ans</td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{formatDate(row.dateRetraite)}</td>
      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">{formatEcheance(row)}</td>
      <td className="whitespace-nowrap px-5 py-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${config.badgeClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
          {config.label}
        </span>
      </td>
    </tr>
  )
}

const TONES = {
  indigo: { bg: 'bg-indigo-100', color: 'text-indigo-600' },
  slate: { bg: 'bg-slate-100', color: 'text-slate-500' },
  red: { bg: 'bg-red-100', color: 'text-red-600' },
  amber: { bg: 'bg-amber-100', color: 'text-amber-600' },
}

function KpiCard({ label, value, icon: Icon, tone, loading }) {
  const t = TONES[tone] ?? TONES.slate
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {loading ? (
        <div className="space-y-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        </div>
      ) : (
        <>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.bg}`}>
            <Icon size={20} className={t.color} />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">{value}</p>
          <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
        </>
      )}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  )
}