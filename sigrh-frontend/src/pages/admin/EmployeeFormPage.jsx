import { useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  Save,
  UserRound,
  XCircle,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useEmployeeForm from '../../hooks/useEmployeeForm'

export default function EmployeeFormPage() {
  const { id } = useParams()
  const {
    mode,
    values,
    errors,
    departments,
    positions,
    loading,
    optionsLoading,
    submitting,
    toast,
    isValid,
    updateField,
    submit,
    clearToast,
    cancel,
  } = useEmployeeForm(id)

  const isEditMode = mode === 'EDIT'

  function handleSubmit(event) {
    event.preventDefault()
    submit()
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
              Retour à la liste
            </button>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">
              Dossier employé
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">
              {isEditMode ? 'Modifier un employé' : 'Créer un employé'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Renseignez les informations nécessaires au suivi administratif RH.
            </p>
          </div>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={clearToast} />}

        {loading ? (
          <FormSkeleton />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection
              icon={UserRound}
              title="Informations personnelles"
              description="Identité, coordonnées et informations civiles de l’employé."
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
                  label="Prénom"
                  name="prenom"
                  value={values.prenom}
                  error={errors.prenom}
                  required
                  onChange={updateField}
                />
                <SelectField
                  label="Sexe"
                  name="genre"
                  value={values.genre}
                  options={[
                    { value: '', label: 'Sélectionner' },
                    { value: 'MASCULIN', label: 'Male' },
                    { value: 'FEMININ', label: 'Female' },
                  ]}
                  onChange={updateField}
                />
                <TextField
                  label="Date de naissance"
                  name="dateNaissance"
                  type="date"
                  value={values.dateNaissance}
                  error={errors.dateNaissance}
                  onChange={updateField}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  error={errors.email}
                  required
                  onChange={updateField}
                />
                <TextField
                  label="Téléphone"
                  name="telephone"
                  type="tel"
                  value={values.telephone}
                  error={errors.telephone}
                  onChange={updateField}
                />
              </div>
            </FormSection>

            <FormSection
              icon={BriefcaseBusiness}
              title="Informations professionnelles"
              description="Affectation, poste, date d’embauche et rémunération."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Poste"
                  name="poste"
                  value={values.poste}
                  error={errors.poste}
                  required
                  loading={optionsLoading}
                  options={[
                    { value: '', label: optionsLoading ? 'Chargement des postes...' : 'Sélectionner un poste' },
                    ...positions.map((position) => ({ value: position.id, label: position.name })),
                  ]}
                  onChange={updateField}
                />
                <SelectField
                  label="Département"
                  name="departementId"
                  value={values.departementId}
                  error={errors.departementId}
                  required
                  loading={optionsLoading}
                  options={[
                    {
                      value: '',
                      label: optionsLoading ? 'Chargement des départements...' : 'Sélectionner un département',
                    },
                    ...departments.map((department) => ({ value: department.id, label: department.name })),
                  ]}
                  onChange={updateField}
                />
                <TextField
                  label="Date d’embauche"
                  name="dateEmbauche"
                  type="date"
                  value={values.dateEmbauche}
                  error={errors.dateEmbauche}
                  onChange={updateField}
                />
                <TextField
                  label="Salaire"
                  name="salaire"
                  type="number"
                  min="0"
                  value={values.salaire}
                  error={errors.salaire}
                  onChange={updateField}
                />
              </div>
              {!isEditMode && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <SelectField
                    label="Rôle utilisateur"
                    name="role"
                    value={values.role}
                    options={[
                      { value: 'EMPLOYE', label: 'Employé' },
                      { value: 'MANAGER', label: 'Manager' },
                      { value: 'SECRETAIRE', label: 'Secrétaire' },
                    ]}
                    onChange={updateField}
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    Le rôle détermine l'accès à l'interface de l'application.
                  </p>
                </div>
              )}
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
                  disabled={!isValid || submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-deep px-5 text-sm font-semibold text-white shadow-sm shadow-blue-deep/20 transition-colors hover:bg-blue-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                  {isEditMode ? 'Modifier' : 'Créer'}
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
  const inputId = `employee-${name}`

  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
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
        <p id={`${inputId}-error`} className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </label>
  )
}

function SelectField({ label, name, value, options, error, required = false, loading = false, onChange }) {
  const inputId = `employee-${name}`

  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <select
        id={inputId}
        name={name}
        value={value}
        required={required}
        disabled={loading}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        onChange={(event) => onChange(name, event.target.value)}
        className={`h-12 w-full rounded-2xl border bg-slate-50/80 px-4 text-sm font-medium text-slate-800 outline-none transition-colors focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
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
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </label>
  )
}

function Toast({ type, message, onClose }) {
  const isSuccess = type === 'success'
  const Icon = isSuccess ? CheckCircle2 : XCircle

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 shadow-sm ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <Icon size={19} className="mt-0.5 flex-shrink-0" />
        <p className="text-sm font-semibold">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-sm font-bold opacity-70 transition-opacity hover:opacity-100"
        aria-label="Fermer la notification"
      >
        ×
      </button>
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
