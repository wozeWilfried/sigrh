import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Cog,
  Loader2,
  Package,
  Save,
  XCircle,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useAuth from '../../hooks/useAuth'
import { createEquipment, getCategories } from '../../api/materiel'
import { getDepartments } from '../../api/departments'

const STATUT_OPTIONS = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'ASSIGNE', label: 'Assigné' },
  { value: 'EN_MAINTENANCE', label: 'En maintenance' },
  { value: 'HORS_SERVICE', label: 'Hors service' },
]

export default function AjouterMateriel() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [values, setValues] = useState({
    nom: '',
    code: '',
    categorieId: '',
    numeroSerie: '',
    statut: 'DISPONIBLE',
    quantite: 1,
    dateAcquisition: '',
    valeurAchat: '',
    departementId: user?.departementId ? String(user.departementId) : '',
  })
  const [errors, setErrors] = useState({})
  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    Promise.all([getCategories(), getDepartments()])
      .then(([cats, depts]) => {
        setCategories(cats)
        const filtered = user?.departementId
          ? depts.filter((d) => d.id === user.departementId)
          : depts
        setDepartments(filtered)
      })
      .catch(() => setToast({ type: 'error', message: 'Impossible de charger les données.' }))
      .finally(() => setLoading(false))
  }, [user])

  function updateField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const next = {}
    if (!values.nom.trim()) next.nom = 'Le nom est obligatoire.'
    if (!values.code.trim()) next.code = 'Le code est obligatoire.'
    if (!values.categorieId) next.categorieId = 'La catégorie est obligatoire.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await createEquipment({
        nom: values.nom,
        code: values.code,
        categorieId: Number(values.categorieId),
        numeroSerie: values.numeroSerie || null,
        statut: values.statut,
        quantite: Number(values.quantite),
        dateAcquisition: values.dateAcquisition || null,
        valeurAchat: values.valeurAchat ? Number(values.valeurAchat) : null,
        departementId: values.departementId ? Number(values.departementId) : null,
      })
      setToast({ type: 'success', message: 'Matériel créé avec succès.' })
      setTimeout(() => navigate('/manager/materiel'), 1500)
    } catch {
      setToast({ type: 'error', message: 'Création impossible. Vérifiez les informations (code peut-être déjà utilisé).' })
    } finally {
      setSubmitting(false)
    }
  }

  function cancel() {
    navigate('/manager/materiel')
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              type="button"
              onClick={cancel}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
            >
              <ArrowLeft size={16} />
              Retour au tableau de bord
            </button>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">Matériel</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Ajouter un matériel</h1>
            <p className="mt-1 text-sm text-slate-500">
              Renseignez les informations pour enregistrer un nouvel équipement dans le parc.
            </p>
          </div>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {loading ? (
          <FormSkeleton />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection
              icon={Package}
              title="Informations générales"
              description="Identification, catégorie et référence de l’équipement."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="Nom"
                  name="nom"
                  value={values.nom}
                  error={errors.nom}
                  required
                  onChange={updateField}
                />
                <TextField
                  label="Code"
                  name="code"
                  value={values.code}
                  error={errors.code}
                  required
                  onChange={updateField}
                />
                <AutocompleteField
                  label="Catégorie"
                  name="categorieId"
                  value={values.categorieId}
                  options={categories.map((c) => ({ value: c.id, label: c.nom }))}
                  error={errors.categorieId}
                  required
                  onChange={updateField}
                />
                <TextField
                  label="Numéro de série"
                  name="numeroSerie"
                  value={values.numeroSerie}
                  onChange={updateField}
                />
              </div>
            </FormSection>

            <FormSection
              icon={Cog}
              title="Détails de l’équipement"
              description="Statut, quantité et informations d’acquisition."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Statut"
                  name="statut"
                  value={values.statut}
                  options={STATUT_OPTIONS}
                  onChange={updateField}
                />
                <TextField
                  label="Quantité"
                  name="quantite"
                  type="number"
                  min="1"
                  value={values.quantite}
                  onChange={updateField}
                />
                <TextField
                  label="Date d’acquisition"
                  name="dateAcquisition"
                  type="date"
                  value={values.dateAcquisition}
                  onChange={updateField}
                />
                <TextField
                  label="Valeur d’achat (FCFA)"
                  name="valeurAchat"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.valeurAchat}
                  onChange={updateField}
                />
                <SelectField
                  label="Département"
                  name="departementId"
                  value={values.departementId}
                  options={[
                    { value: '', label: 'Sélectionner un département' },
                    ...departments.map((d) => ({ value: d.id, label: d.name })),
                  ]}
                  onChange={updateField}
                />
              </div>
            </FormSection>

            <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="mx-auto flex max-w-6xl flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancel}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-deep px-5 text-sm font-semibold text-white shadow-sm shadow-blue-deep/20 transition-colors hover:bg-blue-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                  Enregistrer
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  )
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-deep ring-1 ring-blue-100">
          <Icon size={21} strokeWidth={1.9} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function TextField({ label, name, value, error, type = 'text', required = false, onChange, ...props }) {
  const inputId = `materiel-${name}`
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        id={inputId}
        name={name}
        type={type}
        value={value ?? ''}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        onChange={(event) => onChange(name, event.target.value)}
        className={`h-12 w-full rounded-2xl border bg-slate-50/80 px-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
          error
            ? 'border-red-200 focus:border-red-300 focus:ring-red-100'
            : 'border-slate-200 focus:border-blue-deep/30 focus:ring-blue-deep/10'
        }`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </label>
  )
}

function SelectField({ label, name, value, options, error, required = false, onChange }) {
  const inputId = `materiel-${name}`
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div style={{ colorScheme: 'light' }}>
        <select
          id={inputId}
          name={name}
          value={value ?? ''}
          required={required}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(name, event.target.value)}
          className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm font-medium outline-none transition-colors focus:ring-4 ${
            error
              ? 'border-red-200 focus:border-red-300 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-deep/30 focus:ring-blue-deep/10'
          }`}
        >
          {options.map((option) => (
            <option key={`${name}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </label>
  )
}

function AutocompleteField({ label, name, value, options, error, required, onChange }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label || ''
  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  useEffect(() => {
    if (!open && selectedLabel) setSearch(selectedLabel)
  }, [open, selectedLabel])

  function handleInput(event) {
    const val = event.target.value
    setSearch(val)
    setOpen(true)
    setHighlighted(-1)
    if (!val) onChange(name, '')
  }

  function handleSelect(option) {
    setSearch(option.label)
    onChange(name, option.value)
    setOpen(false)
  }

  function handleKeyDown(event) {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        setOpen(true)
        event.preventDefault()
      }
      return
    }
    if (event.key === 'ArrowDown') {
      setHighlighted((prev) => Math.min(prev + 1, filtered.length - 1))
      event.preventDefault()
    } else if (event.key === 'ArrowUp') {
      setHighlighted((prev) => Math.max(prev - 1, 0))
      event.preventDefault()
    } else if (event.key === 'Enter' && highlighted >= 0) {
      handleSelect(filtered[highlighted])
      event.preventDefault()
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const items = listRef.current.children
      if (items[highlighted]) items[highlighted].scrollIntoView({ block: 'nearest' })
    }
  }, [highlighted])

  const inputId = `materiel-${name}`

  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={search}
          required={required}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${inputId}-list`}
          placeholder="Rechercher une catégorie..."
          onChange={handleInput}
          onFocus={() => { if (!value) setSearch(''); setOpen(true) }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className={`h-12 w-full rounded-2xl border bg-slate-50/80 px-4 pr-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
            error
              ? 'border-red-200 focus:border-red-300 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-deep/30 focus:ring-blue-deep/10'
          }`}
        />
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {open && filtered.length > 0 && (
          <div
            ref={listRef}
            id={`${inputId}-list`}
            role="listbox"
            className="absolute z-20 mt-1 w-full rounded-2xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-950/10 max-h-48 overflow-y-auto"
          >
            {filtered.map((option, idx) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={String(option.value) === String(value)}
                onMouseDown={() => handleSelect(option)}
                onMouseEnter={() => setHighlighted(idx)}
                className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                  idx === highlighted
                    ? 'bg-blue-50 text-blue-700'
                    : String(option.value) === String(value)
                    ? 'bg-slate-50 font-semibold text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
        {open && filtered.length === 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-lg shadow-slate-950/10">
            Aucune catégorie trouvée.
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </label>
  )
}

function Toast({ type, message, onClose }) {
  const isSuccess = type === 'success'
  const Icon = isSuccess ? CheckCircle2 : XCircle
  return (
    <div className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 shadow-sm ${
      isSuccess
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-red-200 bg-red-50 text-red-800'
    }`} role="status">
      <div className="flex items-start gap-3">
        <Icon size={19} className="mt-0.5 flex-shrink-0" />
        <p className="text-sm font-semibold">{message}</p>
      </div>
      <button type="button" onClick={onClose} className="text-sm font-bold opacity-70 transition-opacity hover:opacity-100" aria-label="Fermer">×</button>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-100" />
            <div className="space-y-2">
              <div className="h-4 w-48 animate-pulse rounded-full bg-slate-100" />
              <div className="h-3 w-72 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((__, fieldIndex) => (
              <div key={fieldIndex} className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
                <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
