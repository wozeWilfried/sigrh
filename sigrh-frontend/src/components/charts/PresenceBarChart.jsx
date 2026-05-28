import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { AlertCircle } from 'lucide-react'

/**
 * @typedef {Object} PresenceData
 * @property {string} month
 * @property {number} presences
 * @property {number} absences
 */

/**
 * @typedef {Object} PresenceBarChartProps
 * @property {PresenceData[]} data
 * @property {boolean} [loading]
 * @property {string} [error]
 */

export default function PresenceBarChart({ data, loading = false, error = null }) {
  if (error) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
        <AlertCircle size={32} className="mb-2 opacity-80" />
        <p className="font-semibold">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[300px] w-full items-end justify-between gap-2 rounded-xl bg-slate-50 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-full w-1/6 items-end gap-1">
            <div className={`w-1/2 animate-pulse rounded-t-sm bg-slate-200 h-[${Math.max(20, Math.random() * 80)}%]`}></div>
            <div className={`w-1/2 animate-pulse rounded-t-sm bg-slate-300 h-[${Math.max(10, Math.random() * 40)}%]`}></div>
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
        <p className="text-sm font-medium text-slate-400">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
          />
          <RechartsTooltip
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: '#ffffff'
            }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Legend 
            iconType="circle" 
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} 
          />
          <Bar 
            dataKey="presences" 
            name="Présences" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
            barSize={24} 
            animationDuration={1000}
          />
          <Bar 
            dataKey="absences" 
            name="Absences" 
            fill="#f43f5e" 
            radius={[4, 4, 0, 0]} 
            barSize={24} 
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
