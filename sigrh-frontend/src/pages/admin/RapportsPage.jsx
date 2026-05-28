import { useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import api from '../../api/axios'

export default function RapportsPage() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await api.get('/rapports/employes/excel', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'rapport-rh-global.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Rapports RH</h1>
          <p className="mt-1 text-sm text-slate-500">
            Génération et export des données ressources humaines.
          </p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <FileSpreadsheet size={28} className="text-blue-deep" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-slate-950">Export global RH</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Génère un fichier .xlsx avec trois feuilles : Employés, Présences et Congés.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-deep px-5 text-sm font-semibold text-white shadow-sm shadow-blue-deep/20 transition-colors hover:bg-blue-hover disabled:opacity-60"
            >
              <Download size={17} />
              {loading ? 'Génération...' : 'Télécharger'}
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
