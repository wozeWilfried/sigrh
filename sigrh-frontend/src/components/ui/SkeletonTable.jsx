import React from 'react'

export default function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/80">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-5 py-4 text-left">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="bg-white">
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <td key={colIndex} className="px-5 py-5">
                    {/* Varier légèrement la taille des skeletons pour un rendu plus naturel */}
                    <div
                      className={`h-4 animate-pulse rounded bg-slate-100 ${
                        colIndex === 0 ? 'w-32' : colIndex === cols - 1 ? 'w-16' : 'w-full max-w-[200px]'
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
