import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { AlertCircle } from 'lucide-react'

/**
 * @typedef {Object} DepartmentData
 * @property {string} name
 * @property {number} value
 */

/**
 * @typedef {Object} DepartmentPieChartProps
 * @property {DepartmentData[]} data
 * @property {boolean} [loading]
 * @property {string} [error]
 */

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6', '#8b5cf6']

export default function DepartmentPieChart({ data, loading = false, error = null }) {
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
      <div className="flex h-[300px] w-full items-center justify-center rounded-xl bg-slate-50">
        <div className="h-40 w-40 animate-pulse rounded-full border-8 border-slate-200"></div>
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="transition-opacity duration-300 hover:opacity-80 outline-none"
              />
            ))}
          </Pie>
          <RechartsTooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: '#ffffff'
            }} 
          />
          <Legend 
            iconType="circle" 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
