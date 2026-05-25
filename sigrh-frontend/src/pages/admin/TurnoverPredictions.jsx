import { useMemo } from 'react'
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronDown,
  Loader2,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useTurnoverPredictions from '../../hooks/useTurnoverPredictions'

// ─── Risk config ──────────────────────────────────────────────────────────────

const RISK_CONFIG = {
  ELEVE: {
    label: 'Élevé',
    badgeClass: 'bg-red-50 text-red-700 ring-red-200',
    barClass: 'from-red-400 to-red-600',
    rowClass: 'bg-red-50/40 hover:bg-red-50/70',
    dotClass: 'bg-red-500',
  },
  MOYEN: {
    label: 'Moyen',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-200',
    barClass: 'from-amber-400 to-amber-500',
    rowClass: 'hover:bg-slate-50/80',
    dotClass: 'bg-amber-500',
  },
  FAIBLE: {
    label: 'Faible',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    barClass: 'from-emerald-400 to-emerald-500',
    rowClass: 'hover:bg-slate-50/80',
    dotClass: 'bg-emerald-500',
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TurnoverPredictions() {
  const {
    predictions,
    loading,
    predicting,
    filters,
    updateFilter,
    kpis,
    departments,
    runPrediction,
    toast,
    clearToast,
  } = useTurnoverPredictions()

  return (
    <AppLayout>
      {/* IA Predict overlay */}
      {predicting && <PredictingOverlay />}

      <div className="space-y-6">
        {/* Header */}
        <PageHeader predicting={predicting} onRunPrediction={runPrediction} />

        {/* Toast */}
        {toast && <Toast toast={toast} onClose={clearToast} />}

        {/* KPI Cards */}
        <KpiGrid kpis={kpis} loading={loading} />

        {/* Filters */}
        <FiltersBar
          filters={filters}
          departments={departments}
          onChange={updateFilter}
        />

        {/* Table */}
        {loading ? (
          <TableSkeleton />
        ) : (
          <PredictionTable predictions={predictions} />
        )}
      </div>
    </AppLayout>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

function PageHeader({ predicting, onRunPrediction }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">
            IA & Analytics
          </span>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
            BETA
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Prédictions de turnover
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Identifiez les employés à risque de départ grâce à l'analyse IA.
        </p>
      </div>

      <button
        id="btn-run-prediction"
        type="button"
        onClick={onRunPrediction}
        disabled={predicting}
        className="inline-flex h-11 items-center gap-2.5 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition-all hover:bg-violet-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {predicting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Calcul en cours…
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Lancer une nouvelle prédiction
          </>
        )}
      </button>
    </div>
  )
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function KpiGrid({ kpis, loading }) {
  const cards = [
    {
      id: 'kpi-eleve',
      label: 'Risque élevé',
      value: kpis.eleve,
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
      ring: 'ring-red-100',
    },
    {
      id: 'kpi-alertes',
      label: 'Alertes actives',
      value: kpis.alertesActives,
      icon: TrendingUp,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600',
      ring: 'ring-amber-100',
    },
    {
      id: 'kpi-total',
      label: 'Employés analysés',
      value: kpis.total,
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-deep',
      valueColor: 'text-slate-950',
      ring: 'ring-blue-100',
    },
    {
      id: 'kpi-avg',
      label: 'Score moyen',
      value: `${kpis.avgScore}%`,
      icon: Brain,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      valueColor: 'text-violet-700',
      ring: 'ring-violet-100',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.id} {...card} loading={loading} />
      ))}
    </div>
  )
}

function KpiCard({ id, label, value, icon: Icon, iconBg, iconColor, valueColor, ring, loading }) {
  return (
    <div
      id={id}
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ${ring} transition-shadow hover:shadow-md`}
    >
      {loading ? (
        <div className="space-y-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        </div>
      ) : (
        <>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon size={20} className={iconColor} />
          </div>
          <p className={`mt-3 text-3xl font-extrabold ${valueColor}`}>{value}</p>
          <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
        </>
      )}
    </div>
  )
}

// ─── Filters ──────────────────────────────────────────────────────────────────

function FiltersBar({ filters, departments, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="hidden text-xs font-bold uppercase tracking-widest text-slate-400 lg:block">
        Filtrer
      </p>

      <FilterSelect
        id="filter-niveau"
        label="Niveau de risque"
        value={filters.niveau}
        onChange={(v) => onChange('niveau', v)}
      >
        <option value="">Tous les niveaux</option>
        <option value="ELEVE">🔴 Élevé</option>
        <option value="MOYEN">🟠 Moyen</option>
        <option value="FAIBLE">🟢 Faible</option>
      </FilterSelect>

      <FilterSelect
        id="filter-departement"
        label="Département"
        value={filters.departement}
        onChange={(v) => onChange('departement', v)}
      >
        <option value="">Tous les départements</option>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </FilterSelect>

      {(filters.niveau || filters.departement) && (
        <button
          type="button"
          onClick={() => { onChange('niveau', ''); onChange('departement', '') }}
          className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <RefreshCcw size={13} />
          Réinitialiser
        </button>
      )}
    </div>
  )
}

function FilterSelect({ id, label, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-slate-600">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

function PredictionTable({ predictions }) {
  if (!predictions.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <Brain size={26} className="text-slate-400" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-950">Aucune prédiction trouvée</h3>
        <p className="mt-1 text-sm text-slate-500">Ajustez les filtres ou lancez une nouvelle analyse.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-bold text-slate-950">Analyse des risques individuels</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {predictions.length} employé{predictions.length > 1 ? 's' : ''} · Trié par score décroissant
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/80">
              {['Employé', 'Département', 'Score de risque', 'Niveau', 'Date analyse', 'Facteurs'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.1em] text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {predictions.map((p) => (
              <PredictionRow key={p.id} prediction={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PredictionRow({ prediction: p }) {
  const config = RISK_CONFIG[p.niveau] ?? RISK_CONFIG.FAIBLE

  return (
    <tr className={`transition-colors ${config.rowClass}`}>
      {/* Employé */}
      <td className="whitespace-nowrap px-5 py-4">
        <div className="flex items-center gap-3">
          <EmployeeAvatar name={p.employeNom} niveau={p.niveau} />
          <div>
            <p className="font-semibold text-slate-950">{p.employeNom}</p>
            <p className="text-xs text-slate-500">{p.poste || `ID #${p.employeId}`}</p>
          </div>
        </div>
      </td>

      {/* Département */}
      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{p.departement}</td>

      {/* Score + gauge */}
      <td className="px-5 py-4">
        <RiskGauge score={p.scoreRisque} niveau={p.niveau} />
      </td>

      {/* Niveau badge */}
      <td className="whitespace-nowrap px-5 py-4">
        <RiskBadge niveau={p.niveau} />
      </td>

      {/* Date */}
      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
        {formatDate(p.dateCalcul)}
      </td>

      {/* Facteurs */}
      <td className="px-5 py-4">
        <FacteursTags facteurs={p.facteurs} niveau={p.niveau} />
      </td>
    </tr>
  )
}

// ─── UI Components ────────────────────────────────────────────────────────────

function RiskGauge({ score, niveau }) {
  const config = RISK_CONFIG[niveau] ?? RISK_CONFIG.FAIBLE

  return (
    <div className="flex min-w-[140px] flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold text-slate-900">{score}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${config.barClass} transition-all duration-700 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function RiskBadge({ niveau }) {
  const config = RISK_CONFIG[niveau] ?? RISK_CONFIG.FAIBLE
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${config.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  )
}

function EmployeeAvatar({ name, niveau }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

  const colorMap = {
    ELEVE: 'bg-red-100 text-red-700 ring-red-200',
    MOYEN: 'bg-amber-100 text-amber-700 ring-amber-200',
    FAIBLE: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  }

  return (
    <div
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1 ${colorMap[niveau] ?? colorMap.FAIBLE}`}
    >
      {initials || <UserRound size={16} />}
    </div>
  )
}

function FacteursTags({ facteurs, niveau }) {
  const tagColor = {
    ELEVE: 'bg-red-50 text-red-700 border border-red-100',
    MOYEN: 'bg-amber-50 text-amber-700 border border-amber-100',
    FAIBLE: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {facteurs.map((f) => (
        <span
          key={f}
          title={f}
          className={`inline-block max-w-[140px] truncate rounded-lg px-2 py-1 text-[11px] font-semibold ${tagColor[niveau] ?? tagColor.FAIBLE}`}
        >
          {f}
        </span>
      ))}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
        <div className="mt-1.5 h-3.5 w-32 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 px-5 py-5">
            <div className="flex items-center gap-3 col-span-1">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-4 w-24 animate-pulse self-center rounded bg-slate-100" />
            <div className="space-y-2 self-center">
              <div className="h-4 w-10 animate-pulse rounded bg-slate-100" />
              <div className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="h-6 w-20 animate-pulse self-center rounded-full bg-slate-100" />
            <div className="h-4 w-20 animate-pulse self-center rounded bg-slate-100" />
            <div className="flex gap-1.5 self-center">
              {[80, 60, 72].map((w, j) => (
                <div key={j} className={`h-5 w-${w > 65 ? '20' : '16'} animate-pulse rounded-lg bg-slate-100`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Predicting Overlay ───────────────────────────────────────────────────────

function PredictingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-slate-950/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-violet-200 bg-white px-10 py-8 shadow-2xl">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-violet-200 opacity-50" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-violet-600">
            <Brain size={28} className="text-white" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-slate-950">Analyse IA en cours…</p>
          <p className="mt-1 text-sm text-slate-500">
            Calcul des scores de risque pour chaque employé
          </p>
        </div>
        <div className="flex gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-2 w-2 animate-bounce rounded-full bg-violet-500"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast, onClose }) {
  const isSuccess = toast.type === 'success'
  const Icon = isSuccess ? CheckCircle2 : XCircle

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-sm ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
      style={{ animation: 'slideUpModal 0.2s ease-out' }}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
      <button type="button" onClick={onClose} className="text-lg font-bold opacity-60 hover:opacity-100">
        ×
      </button>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
