import { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Toolbox,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/materiel'

const emptyCategory = { nom: '', description: '' }

export default function CategoriesMateriel() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch {
      setToast({ type: 'error', message: 'Impossible de charger les catégories.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function openModal(category = null) {
    setModal({
      mode: category ? 'edit' : 'create',
      title: category ? 'Modifier la catégorie' : 'Créer une catégorie',
      values: category ?? emptyCategory,
    })
  }

  async function handleModalSubmit(values) {
    setSaving(true)
    try {
      if (modal.mode === 'edit') {
        const updated = await updateCategory(modal.values.id, values)
        setCategories((current) => current.map((item) => (item.id === updated.id ? updated : item)))
        setToast({ type: 'success', message: 'Catégorie modifiée avec succès.' })
      } else {
        const created = await createCategory(values)
        setCategories((current) => [created, ...current])
        setToast({ type: 'success', message: 'Catégorie créée avec succès.' })
      }
      setModal(null)
    } catch {
      setToast({ type: 'error', message: 'Enregistrement impossible. Vérifiez les informations.' })
    } finally {
      setSaving(false)
    }
  }

  function requestDelete(category) {
    setConfirm({
      title: 'Supprimer la catégorie',
      message: `Confirmer la suppression de la catégorie "${category.nom}" ?`,
      dangerLabel: 'Supprimer',
      onConfirm: async () => {
        await deleteCategory(category.id)
        setCategories((current) => current.filter((item) => item.id !== category.id))
        setToast({ type: 'success', message: 'Catégorie supprimée.' })
      },
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Header />

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {loading ? (
          <Skeleton />
        ) : (
          <Card>
            <SectionHeader
              icon={Toolbox}
              title="Catégories de matériel"
              subtitle="Types d’équipements et de matériels utilisés dans l’entreprise."
              actionLabel="Ajouter"
              onAction={() => openModal()}
            />
            <CategoryTable
              categories={categories}
              onEdit={openModal}
              onDelete={requestDelete}
            />
          </Card>
        )}
      </div>

      {modal && (
        <ModalForm
          modal={modal}
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
        />
      )}
    </AppLayout>
  )
}

function Header() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">Matériel</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-950">Catégories de matériel</h1>
      <p className="mt-1 text-sm text-slate-500">
        Gérez les types d’équipements et de matériels de l’entreprise.
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

function CategoryTable({ categories, onEdit, onDelete }) {
  return (
    <Table
      headers={['Nom', 'Description', 'Actions']}
      emptyMessage="Aucune catégorie créée."
      rows={categories.map((category) => [
        <span key="name" className="font-semibold text-slate-950">{category.nom}</span>,
        category.description || '-',
        <RowActions key="actions" onEdit={() => onEdit(category)} onDelete={() => onDelete(category)} />,
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

function ModalForm({ modal, saving, onClose, onSubmit }) {
  const [values, setValues] = useState(modal.values)
  const [errors, setErrors] = useState({})

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!values.nom?.trim()) nextErrors.nom = 'Le nom de la catégorie est obligatoire.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSubmit(values)
  }

  return (
    <Modal title={modal.title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <TextField
          label="Nom de la catégorie"
          value={values.nom}
          error={errors.nom}
          onChange={(value) => updateField('nom', value)}
        />
        <TextAreaField
          label="Description"
          value={values.description}
          onChange={(value) => updateField('description', value)}
        />
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

function ConfirmDialog({ confirm, onClose, onDone }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [confirmationText, setConfirmationText] = useState('')
  const canSubmit = !confirm.strong || confirmationText === 'SUPPRIMER'

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      await confirm.onConfirm()
      onDone()
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.message
        || 'Action impossible.'
      setError(msg)
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

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
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

function Skeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="border-b border-slate-100 p-5">
          <div className="h-5 w-48 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-3 h-3 w-72 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((__, rowIndex) => (
            <div key={rowIndex} className="grid gap-4 md:grid-cols-3">
              <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
