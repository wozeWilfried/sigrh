import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  RefreshCcw,
  Search,
  UserRound,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useEmployees from '../../hooks/useEmployees'

const PAGE_SIZE = 8

const departmentOptions = [
  { label: 'Tous les départements', value: '' },
  { label: 'Ressources humaines', value: 'Ressources humaines' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Informatique', value: 'Informatique' },
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Operations', value: 'Operations' },
]

const positionOptions = [
  { label: 'Tous les postes', value: '' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Développeur', value: 'Développeur' },
  { label: 'Comptable', value: 'Comptable' },
  { label: 'Assistant RH', value: 'Assistant RH' },
  { label: 'Commercial', value: 'Commercial' },
]

const statusOptions = [
  { label: 'Tous les statuts', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
]

const statusStyles = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  INACTIVE: 'bg-slate-100 text-slate-600 ring-slate-200',
  SUSPENDED: 'bg-red-50 text-red-700 ring-red-200',
}

export default function Employes() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [position, setPosition] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    setPage(0)
  }, [department, position, status])

  const { employees, pagination, loading, error, refetch, isManagerScoped } = useEmployees({
    page,
    size: PAGE_SIZE,
    search: debouncedSearch,
    department,
    position,
    status,
  })

  const activeFiltersCount = useMemo(
    () => [debouncedSearch, department, position, status].filter(Boolean).length,
    [debouncedSearch, department, position, status]
  )

  function resetFilters() {
    setSearch('')
    setDebouncedSearch('')
    setDepartment('')
    setPosition('')
    setStatus('')
    setPage(0)
  }

  const canGoPrevious = page > 0
  const canGoNext = page + 1 < pagination.totalPages

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          totalElements={pagination.totalElements}
          activeFiltersCount={activeFiltersCount}
          onResetFilters={resetFilters}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <EmployeeFilters
            search={search}
            department={department}
            position={position}
            status={status}
            isManagerScoped={isManagerScoped}
            onSearchChange={setSearch}
            onDepartmentChange={setDepartment}
            onPositionChange={setPosition}
            onStatusChange={setStatus}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Liste des employés</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Recherche, filtrage et consultation rapide du personnel.
              </p>
            </div>
            <button
              type="button"
              onClick={refetch}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              aria-label="Rafraîchir la liste des employés"
            >
              <RefreshCcw size={17} />
            </button>
          </div>

          {loading ? (
            <EmployeeTableSkeleton />
          ) : error ? (
            <EmployeeTableError onRetry={refetch} />
          ) : employees.length === 0 ? (
            <EmployeeEmptyState onResetFilters={resetFilters} />
          ) : (
            <EmployeeTable employees={employees} />
          )}

          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            totalElements={pagination.totalElements}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onPrevious={() => setPage((current) => Math.max(current - 1, 0))}
            onNext={() => setPage((current) => Math.min(current + 1, pagination.totalPages - 1))}
          />
        </section>
      </div>
    </AppLayout>
  )
}

function PageHeader({ totalElements, activeFiltersCount, onResetFilters }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">
          Administration RH
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Employés</h1>
        <p className="mt-1 text-sm text-slate-500">
          {totalElements} employé{totalElements > 1 ? 's' : ''} trouvé
          {totalElements > 1 ? 's' : ''}
        </p>
      </div>

      {activeFiltersCount > 0 && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  )
}

function EmployeeFilters({
  search,
  department,
  position,
  status,
  isManagerScoped,
  onSearchChange,
  onDepartmentChange,
  onPositionChange,
  onStatusChange,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_220px_220px_190px]">
      <label className="relative block">
        <span className="sr-only">Recherche employé</span>
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Rechercher par nom, prénom ou email..."
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-deep/30 focus:bg-white focus:ring-4 focus:ring-blue-deep/10"
        />
      </label>

      <FilterSelect
        label="Département"
        value={department}
        options={departmentOptions}
        disabled={isManagerScoped}
        onChange={onDepartmentChange}
      />
      <FilterSelect label="Poste" value={position} options={positionOptions} onChange={onPositionChange} />
      <FilterSelect label="Statut" value={status} options={statusOptions} onChange={onStatusChange} />
    </div>
  )
}

function FilterSelect({ label, value, options, disabled = false, onChange }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-deep/30 focus:bg-white focus:ring-4 focus:ring-blue-deep/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function EmployeeTable({ employees }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            {['Employé', 'Poste', 'Département', 'Statut', 'Actions'].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {employees.map((employee) => (
            <EmployeeRow key={employee.id ?? employee.email} employee={employee} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmployeeRow({ employee }) {
  const employeeId = employee.id ?? employee.employeId
  const fullName = `${employee.firstName ?? employee.prenom ?? ''} ${employee.lastName ?? employee.nom ?? ''}`.trim()
  const firstName = employee.firstName ?? employee.prenom ?? '-'
  const lastName = employee.lastName ?? employee.nom ?? '-'
  const email = employee.email ?? 'email non renseigné'
  const position = employee.position ?? employee.poste ?? '-'
  const department = employee.departmentName ?? employee.department?.name ?? employee.departement ?? '-'
  const status = employee.status ?? 'INACTIVE'

  return (
    <tr className="transition-colors hover:bg-slate-50/80">
      <td className="whitespace-nowrap px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar employee={employee} fallbackName={fullName || email} />
          <div>
            <p className="font-semibold text-slate-950">
              {firstName} {lastName}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">{email}</p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">{position}</td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{department}</td>
      <td className="whitespace-nowrap px-5 py-4">
        <StatusBadge status={status} />
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <div className="flex items-center gap-2">
          <ActionButton label="Voir" icon={Eye} />
          <ActionButton
            label="Modifier"
            icon={Pencil}
            to={employeeId ? `/admin/employes/${employeeId}/modifier` : undefined}
          />
          <ActionButton label="Changer statut" icon={MoreHorizontal} />
        </div>
      </td>
    </tr>
  )
}

function Avatar({ employee, fallbackName }) {
  const avatarUrl = employee.photoUrl ?? employee.avatar ?? employee.photo
  const initials = fallbackName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-11 w-11 rounded-2xl object-cover ring-1 ring-slate-200"
      />
    )
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-deep ring-1 ring-blue-100">
      {initials || <UserRound size={18} />}
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
        statusStyles[status] ?? statusStyles.INACTIVE
      }`}
    >
      {status}
    </span>
  )
}

function ActionButton({ label, icon: Icon, to }) {
  const className =
    'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-950'

  if (to) {
    return (
      <Link to={to} className={className} aria-label={label} title={label}>
        <Icon size={16} />
      </Link>
    )
  }

  return (
    <button type="button" className={className} aria-label={label} title={label}>
      <Icon size={16} />
    </button>
  )
}

function EmployeeTableSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <div key={index} className="grid grid-cols-[minmax(260px,1.5fr)_1fr_1fr_120px_140px] gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-100" />
            <div className="space-y-2">
              <div className="h-3 w-36 animate-pulse rounded-full bg-slate-100" />
              <div className="h-3 w-48 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="h-3 w-28 animate-pulse self-center rounded-full bg-slate-100" />
          <div className="h-3 w-32 animate-pulse self-center rounded-full bg-slate-100" />
          <div className="h-6 w-20 animate-pulse self-center rounded-full bg-slate-100" />
          <div className="h-9 w-28 animate-pulse self-center rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

function EmployeeTableError({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Impossible de charger les employés.
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl bg-blue-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-hover"
      >
        Réessayer
      </button>
    </div>
  )
}

function EmployeeEmptyState({ onResetFilters }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <UserRound size={22} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">Aucun employé trouvé</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Ajustez la recherche ou retirez certains filtres pour afficher plus de résultats.
      </p>
      <button
        type="button"
        onClick={onResetFilters}
        className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
      >
        Réinitialiser
      </button>
    </div>
  )
}

function Pagination({ page, totalPages, totalElements, canGoPrevious, canGoNext, onPrevious, onNext }) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-900">{Math.min(page + 1, totalPages)}</span> sur{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span> · {totalElements} résultat
        {totalElements > 1 ? 's' : ''}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft size={16} />
          Précédent
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Suivant
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
