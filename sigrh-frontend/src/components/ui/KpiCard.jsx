import React from 'react'
import { ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react'

/**
 * @typedef {Object} KpiCardProps
 * @property {string} title - Le titre du KPI
 * @property {string|number} value - La valeur principale
 * @property {React.ElementType} icon - Composant icône (Lucide)
 * @property {string|number} [change] - Variation en pourcentage (ex: "+5%", "-2%")
 * @property {boolean} [loading] - État de chargement
 * @property {string} [error] - Message d'erreur
 * @property {boolean} [inverseVariation] - Si true, une baisse est verte et une hausse est rouge (ex: taux de turnover)
 */

/**
 * Composant KPI réutilisable pour afficher un indicateur clé.
 * @param {KpiCardProps} props
 */
export default function KpiCard({
  title,
  value,
  icon: Icon,
  change,
  loading = false,
  error = null,
  inverseVariation = false,
}) {
  const isPositiveVar = typeof change === 'string' ? change.startsWith('+') : Number(change) > 0
  const isNegativeVar = typeof change === 'string' ? change.startsWith('-') : Number(change) < 0

  // Si inverseVariation est true (ex: nombre d'absences, alertes), une baisse (négatif) est positive (vert)
  const isGood = inverseVariation ? isNegativeVar : isPositiveVar
  const isBad = inverseVariation ? isPositiveVar : isNegativeVar

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle size={24} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {value ?? '—'}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110">
          {Icon && <Icon size={24} strokeWidth={2} />}
        </div>
      </div>

      {!loading && change && (
        <div className="mt-4 flex items-center gap-1.5">
          <span
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${
              isGood
                ? 'bg-emerald-50 text-emerald-700'
                : isBad
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-50 text-slate-600'
            }`}
          >
            {isPositiveVar ? (
              <ArrowUpRight size={14} />
            ) : isNegativeVar ? (
              <ArrowDownRight size={14} />
            ) : null}
            {change}
          </span>
          <span className="text-xs font-medium text-slate-400">vs mois dernier</span>
        </div>
      )}
    </div>
  )
}
