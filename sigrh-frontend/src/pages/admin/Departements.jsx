import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import {
  createDepartment,
  createPosition,
  deleteDepartment,
  deletePosition,
  getDepartments,
  getPositions,
  updateDepartment,
  updatePosition,
} from '../../api/organization'

const emptyDepartment = { name: '', description: '', manager: '' }
const emptyPosition = { name: '', departmentId: '' }

export default function Departements() {
  const [departments, setDepartments] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [departmentsData, positionsData] = await Promise.all([getDepartments(), getPositions()])
      setDepartments(departmentsData)
      setPositions(positionsData)
    } catch {
      setToast({ type: 'error', message: 'Impossible de charger la structure.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const departmentsById = useMemo(() => {
    return departments.reduce((map, department) => {
      map[department.id] = department
      return map
    }, {})
  }, [departments])

  const filteredPositions = useMemo(() => {
    if (!departmentFilter) return positions
    return positions.filter((position) => Number(position.departmentId) === Number(departmentFilter))
  }, [departmentFilter, positions])

  function openDepartmentModal(department = null) {
    setModal({
      type: 'department',
      mode: department ? 'edit' : 'create',
      title: department ? 'Modifier le département' : 'Créer un département',
      values: department ?? emptyDepartment,
    })
  }

  function openPositionModal(position = null) {
    setModal({
      type: 'position',
      mode: position ? 'edit' : 'create',
      title: position ? 'Modifier le poste' : 'Créer un poste',
      values: position ?? emptyPosition,
    })
  }

  async function handleModalSubmit(values) {
    setSaving(true)
    try {
      if (modal.type === 'department') {
        if (modal.mode === 'edit') {
          const updated = await updateDepartment(modal.values.id, values)
          setDepartments((current) => current.map((item) => (item.id === updated.id ? updated : item)))
          setToast({ type: 'success', message: 'Département modifié avec succès.' })
        } else {
          const created = await createDepartment(values)
          setDepartments((current) => [created, ...current])
          setToast({ type: 'success', message: 'Département créé avec succès.' })
        }
      }

      if (modal.type === 'position') {
        if (modal.mode === 'edit') {
          const updated = await updatePosition(modal.values.id, values)
          setPositions((current) => current.map((item) => (item.id === updated.id ? updated : item)))
          setToast({ type: 'success', message: 'Poste modifié avec succès.' })
        } else {
          const created = await createPosition(values)
          setPositions((current) => [created, ...current])
          setToast({ type: 'success', message: 'Poste créé avec succès.' })
        }
      }

      setModal(null)
    } catch {
      setToast({ type: 'error', message: 'Enregistrement impossible. Vérifiez les informations.' })
    } finally {
      setSaving(false)
    }
  }

  function requestDeleteDepartment(department) {
    const used = Number(department.employeeCount) > 0
    setConfirm({
      title: 'Supprimer le département',
      message: used
        ? `Le département "${department.name}" contient ${department.employeeCount} employé(s). La suppression peut impacter les dossiers existants.`
        : `Confirmer la suppression du département "${department.name}" ?`,
      dangerLabel: used ? 'Supprimer quand même' : 'Supprimer',
      strong: used,
      onConfirm: async () => {
        await deleteDepartment(department.id)
        setDepartments((current) => current.filter((item) => item.id !== department.id))
        setPositions((current) => current.filter((item) => Number(item.departmentId) !== Number(department.id)))
        setToast({ type: 'success', message: 'Département supprimé.' })
      },
    })
  }

  function requestDeletePosition(position) {
    setConfirm({
      title: 'Supprimer le poste',
      message: `Confirmer la suppression du poste "${position.name}" ?`,
      dangerLabel: 'Supprimer',
      onConfirm: async () => {
        await deletePosition(position.id)
        setPositions((current) => current.filter((item) => item.id !== position.id))
        setToast({ type: 'success', message: 'Poste supprimé.' })
      },
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Header />

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {loading ? (
          <StructureSkeleton />
        ) : (
          <>
            <Card>
              <SectionHeader
                icon={Building2}
                title="Départements"
                subtitle="Unités organisationnelles de l’entreprise."
                actionLabel="Ajouter"
                onAction={() => openDepartmentModal()}
              />
              <DepartmentTable
                departments={departments}
                onEdit={openDepartmentModal}
                onDelete={requestDeleteDepartment}
              />
            </Card>

            <Card>
              <SectionHeader
                icon={Building2}
                title="Postes"
                subtitle="Fonctions rattachées aux départements."
                actionLabel="Ajouter"
                onAction={() => openPositionModal()}
              >
                <select
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none transition-colors focus:border-blue-deep/30 focus:ring-4 focus:ring-blue-deep/10"
                  aria-label="Filtrer les postes par département"
                >
                  <option value="">Tous les départements</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </SectionHeader>
              <PositionTable
                positions={filteredPositions}
                departmentsById={departmentsById}
                onEdit={openPositionModal}
                onDelete={requestDeletePosition}
              />
            </Card>
          </>
        )}
      </div>

      {modal && (
        <ModalForm
          modal={modal}
          departments={departments}
          saving={saving}
          onClose={() => setModal(null)}
          onSubmit={handleModalSubmit}
        />
      )}

      {confirm && (
        <ConfirmDialog
          confirm={confirm}
          onClose={() => setConfirm(null)}
          onDone={() => setConfirm(null)}
          onError={() => setToast({ type: 'error', message: 'Suppression impossible.' })}
        />
      )}
    </AppLayout>
  )
}

function Header() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">Structure</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-950">Départements & Postes</h1>
      <p className="mt-1 text-sm text-slate-500">
        Organisez les équipes, les rattachements et les fonctions de l’entreprise.
      </p>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle, actionLabel, onAction, children }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-deep ring-1 ring-blue-100">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {children}
        <Button onClick={onAction}>
          <Plus size={16} />
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}

function DepartmentTable({ departments, onEdit, onDelete }) {
  return (
    <Table
      headers={['Département', 'Description', 'Employés', 'Actions']}
      emptyMessage="Aucun département créé."
      rows={departments.map((department) => [
        <span key="name" className="font-semibold text-slate-950">{department.name}</span>,
        department.description || '-',
        <Badge key="count" value={`${department.employeeCount} employé(s)`} />,
        <RowActions key="actions" onEdit={() => onEdit(department)} onDelete={() => onDelete(department)} />,
      ])}
    />
  )
}

function PositionTable({ positions, departmentsById, onEdit, onDelete }) {
  return (
    <Table
      headers={['Poste', 'Département associé', 'Actions']}
      emptyMessage="Aucun poste trouvé pour ce filtre."
      rows={positions.map((position) => [
        <span key="name" className="font-semibold text-slate-950">{position.name}</span>,
        departmentsById[position.departmentId]?.name ?? 'Département inconnu',
        <RowActions key="actions" onEdit={() => onEdit(position)} onDelete={() => onDelete(position)} />,
      ])}
    />
  )
}

function Table({ headers, rows, emptyMessage }) {
  if (!rows.length) {
    return <div className="p-8 text-center text-sm font-medium text-slate-500">{emptyMessage}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition-colors hover:bg-slate-50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-5 py-4 text-sm text-slate-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <IconButton label="Modifier" onClick={onEdit}>
        <Pencil size={16} />
      </IconButton>
      <IconButton label="Supprimer" danger onClick={onDelete}>
        <Trash2 size={16} />
      </IconButton>
    </div>
  )
}

function ModalForm({ modal, departments, saving, onClose, onSubmit }) {
  const [values, setValues] = useState(modal.values)
  const [errors, setErrors] = useState({})
  const isDepartment = modal.type === 'department'

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!values.name?.trim()) nextErrors.name = isDepartment ? 'Le nom du département est obligatoire.' : 'Le nom du poste est obligatoire.'
    if (!isDepartment && !values.departmentId) nextErrors.departmentId = 'Le département associé est obligatoire.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSubmit(values)
  }

  return (
    <Modal title={modal.title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <TextField
          label={isDepartment ? 'Nom du département' : 'Nom du poste'}
          value={values.name}
          error={errors.name}
          onChange={(value) => updateField('name', value)}
        />

        {isDepartment ? (
          <>
            <TextAreaField
              label="Description"
              value={values.description}
              onChange={(value) => updateField('description', value)}
            />
            <TextField
              label="Responsable"
              value={values.manager}
              onChange={(value) => updateField('manager', value)}
            />
          </>
        ) : (
          <SelectField
            label="Département associé"
            value={values.departmentId}
            error={errors.departmentId}
            onChange={(value) => updateField('departmentId', value)}
            options={[
              { value: '', label: 'Sélectionner un département' },
              ...departments.map((department) => ({ value: department.id, label: department.name })),
            ]}
          />
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ConfirmDialog({ confirm, onClose, onDone, onError }) {
  const [submitting, setSubmitting] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const canSubmit = !confirm.strong || confirmationText === 'SUPPRIMER'

  async function handleConfirm() {
    setSubmitting(true)
    try {
      await confirm.onConfirm()
      onDone()
    } catch {
      onError()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={confirm.title} onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex gap-3">
            <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">{confirm.message}</p>
          </div>
        </div>

        {confirm.strong && (
          <TextField
            label='Tapez "SUPPRIMER" pour confirmer'
            value={confirmationText}
            onChange={setConfirmationText}
          />
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="button" variant="danger" disabled={!canSubmit || submitting} onClick={handleConfirm}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {confirm.dangerLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function TextField({ label, value, error, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm outline-none transition-colors focus:bg-white focus:ring-4 ${
          error ? 'border-red-200 focus:ring-red-100' : 'border-slate-200 focus:border-blue-deep/30 focus:ring-blue-deep/10'
        }`}
      />
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </label>
  )
}

function TextAreaField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        value={value ?? ''}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors focus:border-blue-deep/30 focus:bg-white focus:ring-4 focus:ring-blue-deep/10"
      />
    </label>
  )
}

function SelectField({ label, value, options, error, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm outline-none transition-colors focus:bg-white focus:ring-4 ${
          error ? 'border-red-200 focus:ring-red-100' : 'border-slate-200 focus:border-blue-deep/30 focus:ring-blue-deep/10'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </label>
  )
}

function Button({ type = 'button', variant = 'primary', disabled = false, onClick, children }) {
  const variants = {
    primary: 'bg-blue-deep text-white hover:bg-blue-hover shadow-sm shadow-blue-deep/20',
    secondary: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/20',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]}`}
    >
      {children}
    </button>
  )
}

function IconButton({ label, danger = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
        danger
          ? 'border-red-100 text-red-500 hover:bg-red-50'
          : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      {children}
    </button>
  )
}

function Badge({ value }) {
  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
      {value}
    </span>
  )
}

function Toast({ type, message, onClose }) {
  const isSuccess = type === 'success'
  const Icon = isSuccess ? CheckCircle2 : XCircle

  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-sm ${
      isSuccess ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'
    }`}>
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <p className="text-sm font-semibold">{message}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Fermer" className="font-bold opacity-70 hover:opacity-100">×</button>
    </div>
  )
}

function Card({ children }) {
  return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{children}</section>
}

function StructureSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <Card key={sectionIndex}>
          <div className="border-b border-slate-100 p-5">
            <div className="h-5 w-48 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-3 h-3 w-72 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((__, rowIndex) => (
              <div key={rowIndex} className="grid gap-4 md:grid-cols-4">
                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
