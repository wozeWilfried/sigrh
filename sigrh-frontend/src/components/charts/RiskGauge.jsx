import React, { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts'
import { AlertCircle } from 'lucide-react'

/**
 * @typedef {Object} RiskGaugeProps
 * @property {number} value - Score de 0 à 100
 * @property {boolean} [loading]
 * @property {string} [error]
 */

export default function RiskGauge({ value, loading = false, error = null }) {
  if (error) {
    return (
      <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
        <AlertCircle size={32} className="mb-2 opacity-80" />
        <p className="font-semibold text-sm">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-xl bg-slate-50">
        <div className="relative h-32 w-32 animate-pulse overflow-hidden rounded-full border-[12px] border-slate-200">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-slate-50"></div>
        </div>
      </div>
    )
  }

  if (value === undefined || value === null) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
        <p className="text-sm font-medium text-slate-400">Aucune donnée</p>
      </div>
    )
  }

  // S'assurer que la valeur est entre 0 et 100
  const normalizedValue = Math.min(Math.max(value, 0), 100)

  // Déterminer la couleur en fonction du score
  let color = '#10b981' // Vert (0-40)
  if (normalizedValue > 40 && normalizedValue <= 70) {
    color = '#f59e0b' // Orange (40-70)
  } else if (normalizedValue > 70) {
    color = '#f43f5e' // Rouge (70-100)
  }

  // Données pour la jauge en demi-cercle (Recharts PieChart avec un angle partiel)
  const data = useMemo(() => [
    { name: 'Score', value: normalizedValue, color: color },
    { name: 'Reste', value: 100 - normalizedValue, color: '#f1f5f9' }
  ], [normalizedValue, color])

  return (
    <div className="relative flex h-[200px] w-full flex-col items-center justify-center">
      <div className="absolute inset-0 top-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Contenu textuel au centre (décalé vers le bas car c'est un demi-cercle) */}
      <div className="absolute bottom-4 flex flex-col items-center">
        <span className="text-4xl font-black tracking-tighter text-slate-900" style={{ color }}>
          {normalizedValue}
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Risque
        </span>
      </div>
    </div>
  )
}
