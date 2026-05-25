import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEmployee, getEmployeeById, getEmployees, updateEmployee } from '../api/employees'
import { getDepartments } from '../api/departments'

const initialValues = {
  nom: '',
  prenom: '',
  genre: '',
  dateNaissance: '',
  email: '',
  telephone: '',
  poste: '',
  departementId: '',
  dateEmbauche: '',
  salaire: '',
  statut: 'ACTIF',
}

const requiredMessages = {
  nom: 'Le nom est obligatoire.',
  prenom: 'Le prénom est obligatoire.',
  email: 'L’email est obligatoire.',
  poste: 'Le poste est obligatoire.',
  departementId: 'Le département est obligatoire.',
}

function normalizeDepartments(data) {
  const departments = Array.isArray(data) ? data : data?.content ?? data?.departements ?? data?.data ?? []

  return departments.map((department) => ({
    id: String(department.id),
    name: department.nom ?? department.name ?? department.label ?? 'Département sans nom',
  }))
}

function normalizePositions(data) {
  const employees = Array.isArray(data) ? data : data?.content ?? data?.employees ?? data?.data ?? []
  const positions = employees
    .map((employee) => employee.poste ?? employee.position)
    .filter(Boolean)
    .filter((position, index, list) => list.indexOf(position) === index)

  return positions.map((position) => ({ id: position, name: position }))
}

function mapEmployeeToForm(employee) {
  return {
    nom: employee.nom ?? employee.lastName ?? '',
    prenom: employee.prenom ?? employee.firstName ?? '',
    genre: employee.genre ?? '',
    dateNaissance: employee.dateNaissance ?? '',
    email: employee.email ?? '',
    telephone: employee.telephone ?? employee.phone ?? '',
    poste: employee.poste ?? employee.position ?? '',
    departementId: employee.departementId ? String(employee.departementId) : '',
    dateEmbauche: employee.dateEmbauche ?? '',
    salaire: employee.salaire ?? '',
    statut: employee.statut ?? 'ACTIF',
  }
}

function buildEmployeePayload(values) {
  return {
    nom: values.nom.trim(),
    prenom: values.prenom.trim(),
    genre: values.genre || null,
    dateNaissance: values.dateNaissance || null,
    email: values.email.trim(),
    telephone: values.telephone.trim() || null,
    poste: values.poste,
    departementId: Number(values.departementId),
    dateEmbauche: values.dateEmbauche || null,
    salaire: values.salaire === '' ? null : Number(values.salaire),
    statut: values.statut || 'ACTIF',
  }
}

function validateField(name, value) {
  if (requiredMessages[name] && !String(value ?? '').trim()) {
    return requiredMessages[name]
  }

  if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Veuillez saisir une adresse email valide.'
  }

  if (name === 'salaire' && value !== '' && Number(value) < 0) {
    return 'Le salaire ne peut pas être négatif.'
  }

  return ''
}

function validateForm(values) {
  return Object.keys(values).reduce((errors, fieldName) => {
    const error = validateField(fieldName, values[fieldName])
    if (error) errors[fieldName] = error
    return errors
  }, {})
}

export default function useEmployeeForm(employeeId) {
  const navigate = useNavigate()
  const mode = employeeId ? 'EDIT' : 'CREATE'
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [departments, setDepartments] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(Boolean(employeeId))
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const isValid = useMemo(() => Object.keys(validateForm(values)).length === 0, [values])

  const loadFormData = useCallback(async () => {
    setOptionsLoading(true)
    setLoading(Boolean(employeeId))

    try {
      const [departmentsData, employeesData, employeeData] = await Promise.all([
        getDepartments(),
        getEmployees(),
        employeeId ? getEmployeeById(employeeId) : Promise.resolve(null),
      ])

      const nextDepartments = normalizeDepartments(departmentsData)
      const nextPositions = normalizePositions(employeesData)

      if (employeeData) {
        const nextValues = mapEmployeeToForm(employeeData)
        const hasCurrentPosition = nextPositions.some((position) => position.id === nextValues.poste)

        setValues(nextValues)
        setPositions(hasCurrentPosition || !nextValues.poste
          ? nextPositions
          : [{ id: nextValues.poste, name: nextValues.poste }, ...nextPositions])
      } else {
        setValues(initialValues)
        setPositions(nextPositions)
      }

      setDepartments(nextDepartments)
    } catch {
      setToast({
        type: 'error',
        message: 'Impossible de charger les données du formulaire.',
      })
    } finally {
      setLoading(false)
      setOptionsLoading(false)
    }
  }, [employeeId])

  useEffect(() => {
    loadFormData()
  }, [loadFormData])

  const updateField = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setTouched((current) => ({ ...current, [name]: true }))
    setErrors((current) => {
      const nextErrors = { ...current }
      const error = validateField(name, value)

      if (error) nextErrors[name] = error
      else delete nextErrors[name]

      return nextErrors
    })
  }, [])

  const submit = useCallback(async () => {
    const nextErrors = validateForm(values)
    setTouched(Object.keys(values).reduce((state, fieldName) => ({ ...state, [fieldName]: true }), {}))
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return false

    setSubmitting(true)
    setToast(null)

    try {
      const payload = buildEmployeePayload(values)

      if (mode === 'EDIT') {
        await updateEmployee(employeeId, payload)
      } else {
        await createEmployee(payload)
      }

      setToast({
        type: 'success',
        message: mode === 'EDIT' ? 'Employé modifié avec succès.' : 'Employé créé avec succès.',
      })

      setTimeout(() => navigate('/admin/employes'), 700)
      return true
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message ?? 'Une erreur est survenue pendant l’enregistrement.',
      })
      return false
    } finally {
      setSubmitting(false)
    }
  }, [employeeId, mode, navigate, values])

  const visibleErrors = useMemo(() => {
    return Object.keys(errors).reduce((currentErrors, fieldName) => {
      if (touched[fieldName]) currentErrors[fieldName] = errors[fieldName]
      return currentErrors
    }, {})
  }, [errors, touched])

  return {
    mode,
    values,
    errors: visibleErrors,
    departments,
    positions,
    loading,
    optionsLoading,
    submitting,
    toast,
    isValid,
    updateField,
    submit,
    clearToast: () => setToast(null),
    cancel: () => navigate('/admin/employes'),
  }
}
