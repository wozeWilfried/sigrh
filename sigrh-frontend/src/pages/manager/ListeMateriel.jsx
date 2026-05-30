import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Handshake,
  History,
  Loader2,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  Undo2,
  UserPlus,
  X,
  XCircle,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useAuth from '../../hooks/useAuth'
import { getEquipment, getCategories, assignMateriel, returnMateriel, getAttributions, deleteEquipment } from '../../api/materiel'
import { getEmployees } from '../../api/employees'

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'ASSIGNE', label: 'Assigné' },
  { value: 'EN_MAINTENANCE', label: 'En maintenance' },
  { value: 'HORS_SERVICE', label: 'Hors service' },
]

export default function ListeMateriel() {
  const { user } = useAuth()
  const [equipment, setEquipment] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categorieFilter, setCategorieFilter] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [employeFilter, setEmployeFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [assignModal, setAssignModal] = useState(null)
  const [returnConfirm, setReturnConfirm] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [historyModal, setHistoryModal] = useState(null)
  const [employees, setEmployees] = useState([])
  const [toast, setToast] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      const isScoped = user?.role === 'MANAGER'
      if (isScoped && user?.departementId) params.departementId = user.departementId
      if (categorieFilter) params.categorieId = categorieFilter
      if (statutFilter) params.statut = statutFilter
      if (employeFilter) params.employeId = employeFilter
      if (search) params.q = search
      const [equipData, catData, empData] = await Promise.all([
        getEquipment(Object.keys(params).length ? params : undefined),
        getCategories(),
        getEmployees(),
      ])
      setEquipment(equipData)
      setCategories(catData)
      setEmployees(Array.isArray(empData) ? empData : empData?.content || [])
    } catch {
      setEquipment([])
    } finally {
      setLoading(false)
    }
  }, [user, search, categorieFilter, statutFilter, employeFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    let result = equipment
    // Client-side search for nom, code
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.nom?.toLowerCase().includes(q) ||
          m.code?.toLowerCase().includes(q) ||
          m.numeroSerie?.toLowerCase().includes(q)
      )
    }
    return result
  }, [equipment, search])

  function handleReset() {
    setSearch('')
    setCategorieFilter('')
    setStatutFilter('')
    setEmployeFilter('')
  }

  async function handleAssign(materielId, employeId, motif) {
    try {
      await assignMateriel(materielId, { employeId, motif })
      setToast({ type: 'success', message: 'Matériel attribué avec succès.' })
      setAssignModal(null)
      loadData()
    } catch {
      setToast({ type: 'error', message: 'Attribution impossible.' })
    }
  }

  async function handleReturn(materielId) {
    try {
      await returnMateriel(materielId)
      setToast({ type: 'success', message: 'Matériel retourné avec succès.' })
      setReturnConfirm(null)
      loadData()
    } catch {
      setToast({ type: 'error', message: 'Retour impossible.' })
    }
  }

  function requestDelete(materiel) {
    setDeleteConfirm({
      id: materiel.id,
      nom: materiel.nom,
      code: materiel.code,
    })
  }

  async function handleDelete() {
    try {
      await deleteEquipment(deleteConfirm.id)
      setToast({ type: 'success', message: 'Matériel supprimé avec succès.' })
      setDeleteConfirm(null)
      loadData()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Suppression impossible.'
      setToast({ type: 'error', message: msg })
    }
  }

  const activeFilters = [categorieFilter, statutFilter, employeFilter].filter(Boolean).length

  const statutColors = {
    DISPONIBLE: 'bg-emerald-100 text-emerald-700',
    ASSIGNE: 'bg-blue-100 text-blue-700',
    EN_MAINTENANCE: 'bg-amber-100 text-amber-700',
    HORS_SERVICE: 'bg-red-100 text-red-700',
  }
  const statutLabels = {
    DISPONIBLE: 'Disponible',
    ASSIGNE: 'Assigné',
    EN_MAINTENANCE: 'En maintenance',
    HORS_SERVICE: 'Hors service',
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">Matériel</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Liste du matériel</h1>
            <p className="mt-1 text-sm text-slate-500">
              Consultez et filtrez les équipements de votre département.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                showFilters || activeFilters > 0
                  ? 'border-blue-deep/30 bg-blue-50 text-blue-deep'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filtres
              {activeFilters > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-deep text-[11px] font-bold text-white">
                  {activeFilters}
                </span>
              )}
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCcw size={16} className={loading ? 'animate-spin text-slate-400' : ''} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, code ou numéro de série..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-deep/30 focus:ring-4 focus:ring-blue-deep/10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters panel */}
        {(showFilters || activeFilters > 0) && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-500" />
                <h2 className="text-sm font-bold text-slate-900">Filtres avancés</h2>
                {activeFilters > 0 && (
                  <span className="text-xs text-slate-500">({activeFilters} actif(s))</span>
                )}
              </div>
              {activeFilters > 0 && (
                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-red-500 hover:text-red-700"
                >
                  Réinitialiser
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <select
                value={categorieFilter}
                onChange={(e) => setCategorieFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-deep/30 focus:ring-4 focus:ring-blue-deep/10"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} style={{ color: '#1e293b', background: '#fff' }}>
                    {cat.nom}
                  </option>
                ))}
              </select>
              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-deep/30 focus:ring-4 focus:ring-blue-deep/10"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} style={{ color: '#1e293b', background: '#fff' }}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={employeFilter}
                onChange={(e) => setEmployeFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-deep/30 focus:ring-4 focus:ring-blue-deep/10"
              >
                <option value="">Tous les employés</option>
                {[...new Set(equipment.filter((m) => m.employeId).map((m) => m.employeId))]
                  .map((id) => {
                    const emp = equipment.find((m) => m.employeId === id)
                    return { id, nom: emp?.employeNom || `Employé #${id}` }
                  })
                  .sort((a, b) => a.nom.localeCompare(b.nom))
                  .map((emp) => (
                    <option key={emp.id} value={emp.id} style={{ color: '#1e293b', background: '#fff' }}>
                      {emp.nom}
                    </option>
                  ))}
              </select>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          /* Table */
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    {['Nom', 'Code', 'Catégorie', 'Statut', 'N° Série', 'Employé', 'Département', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                        Aucun matériel trouvé.
                      </td>
                    </tr>
                  )}
                  {filtered.map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{m.nom}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{m.code || '-'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{m.categorie || '-'}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${
                            statutColors[m.statut] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {statutLabels[m.statut] || m.statut}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{m.numeroSerie || '-'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{m.employeNom || '-'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{m.departementNom || '-'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setHistoryModal(m)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                          >
                            <History size={14} />
                            Historique
                          </button>
                          {m.statut !== 'ASSIGNE' && m.statut !== 'HORS_SERVICE' && (
                            <button
                              onClick={() => setAssignModal(m)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                            >
                              <UserPlus size={14} />
                              Attribuer
                            </button>
                          )}
                          {m.statut === 'ASSIGNE' && (
                            <button
                              onClick={() => setReturnConfirm(m)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100"
                            >
                              <Undo2 size={14} />
                              Retourner
                            </button>
                          )}
                          <button
                            onClick={() => requestDelete(m)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {assignModal && (
          <AssignModal
            materiel={assignModal}
            employees={employees}
            onClose={() => setAssignModal(null)}
            onConfirm={handleAssign}
          />
        )}

        {returnConfirm && (
          <ReturnConfirm
            materiel={returnConfirm}
            onClose={() => setReturnConfirm(null)}
            onConfirm={handleReturn}
          />
        )}

        {deleteConfirm && (
          <DeleteConfirm
            materiel={deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={handleDelete}
          />
        )}

        {historyModal && (
          <HistoryModal
            materiel={historyModal}
            onClose={() => setHistoryModal(null)}
          />
        )}
      </div>
    </AppLayout>
  )
}

function AssignModal({ materiel, employees, onClose, onConfirm }) {
  const [employeId, setEmployeId] = useState('')
  const [motif, setMotif] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const eligibleEmployees = useMemo(
    () => employees.filter((emp) => emp.departementId === materiel.departementId),
    [employees, materiel.departementId],
  )

  async function submit() {
    if (!employeId) return
    setSubmitting(true)
    await onConfirm(materiel.id, Number(employeId), motif)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-950">Attribuer le matériel</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-5 p-5">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{materiel.nom}</span> — {materiel.code || 'sans code'}
          </p>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Employé <span className="text-red-500">*</span></span>
            <select
              value={employeId}
              onChange={(e) => setEmployeId(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-sm font-medium text-slate-800 outline-none transition-colors focus:bg-white focus:ring-4 focus:border-blue-deep/30 focus:ring-blue-deep/10"
            >
              <option value="">Sélectionner un employé</option>
              {eligibleEmployees.map((emp) => (
                <option key={emp.id} value={emp.id} style={{ color: '#1e293b', background: '#fff' }}>
                  {emp.nom} {emp.prenom}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Motif</span>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
              placeholder="Raison de l'attribution..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition-colors focus:bg-white focus:ring-4 focus:border-blue-deep/30 focus:ring-blue-deep/10"
            />
          </label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!employeId || submitting}
              onClick={submit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-deep px-5 text-sm font-semibold text-white shadow-sm shadow-blue-deep/20 transition-colors hover:bg-blue-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 size={17} className="animate-spin" /> : <Handshake size={17} />}
              Attribuer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReturnConfirm({ materiel, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    await onConfirm(materiel.id)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-950">Retourner le matériel</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-5 p-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
            <div className="flex gap-3">
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Confirmer le retour de <span className="font-bold">{materiel.nom}</span> assigné à{' '}
                <span className="font-bold">{materiel.employeNom || 'un employé'}</span> ?
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={submit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white shadow-sm shadow-amber-600/20 transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 size={17} className="animate-spin" /> : <Undo2 size={17} />}
              Confirmer le retour
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Toast({ type, message, onClose }) {
  const isSuccess = type === 'success'
  const Icon = isSuccess ? CheckCircle2 : XCircle
  return (
    <div className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 shadow-sm ${
      isSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'
    }`} role="status">
      <div className="flex items-start gap-3">
        <Icon size={19} className="mt-0.5 flex-shrink-0" />
        <p className="text-sm font-semibold">{message}</p>
      </div>
      <button type="button" onClick={onClose} className="text-sm font-bold opacity-70 transition-opacity hover:opacity-100" aria-label="Fermer">×</button>
    </div>
  )
}

function HistoryModal({ materiel, onClose }) {
  const [attributions, setAttributions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAttributions({ materielId: materiel.id })
      .then(setAttributions)
      .catch(() => setAttributions([]))
      .finally(() => setLoading(false))
  }, [materiel.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <History size={18} className="text-slate-500" />
            <h3 className="text-base font-bold text-slate-950">Historique — {materiel.nom}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : attributions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Aucun historique d’attribution pour ce matériel.</p>
          ) : (
            <div className="space-y-3">
              {attributions.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-xl border p-4 ${
                    a.retourne
                      ? 'border-slate-200 bg-slate-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                          a.retourne
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-blue-200 text-blue-700'
                        }`}>
                          {a.retourne ? 'RETOURNÉ' : 'ATTRIBUÉ'}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{a.employeNom}</span>
                      </div>
                      {a.motif && (
                        <p className="mt-1.5 text-sm text-slate-600">Motif : {a.motif}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        Attribution : {a.dateAttribution}
                      </div>
                      {a.dateRetour && (
                        <div className="flex items-center gap-1.5">
                          <Undo2 size={13} />
                          Retour : {a.dateRetour}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DeleteConfirm({ materiel, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Suppression impossible.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-950">Supprimer le matériel</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-5 p-5">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex gap-3">
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">
                  Confirmer la suppression de <strong>{materiel.nom}</strong>
                  {materiel.code ? ` (${materiel.code})` : ''} ?
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
