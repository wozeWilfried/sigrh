import { useCallback, useEffect, useRef, useState } from 'react'
import { createLeave, getLeaveBalance, searchEmployees } from '../api/leaveCreate'
import { countWorkingDays } from '../utils/leaveUtils'

const DEBOUNCE_MS = 300

const INITIAL_FORM = {
  employee: null,
  dateDebut: '',
  dateFin: '',
  type: 'ANNUEL',
  motif: '',
}

/**
 * Hook custom gérant toute la logique de création de demande de congé.
 * @param {{ onSuccess?: () => void }} options
 */
export default function useCreateLeave({ onSuccess } = {}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [employeeQuery, setEmployeeQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [balance, setBalance] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success' | 'error', message: string }

  const debounceTimer = useRef(null)
  const ignoreRef = useRef(false)

  // ── Computed ─────────────────────────────────────────────────────────────

  const workingDays = countWorkingDays(form.dateDebut, form.dateFin)

  const isBalanceInsufficient =
    balance !== null && form.type === 'ANNUEL' && workingDays > balance.soldeRestant

  const isFormValid =
    form.employee !== null &&
    form.dateDebut !== '' &&
    form.dateFin !== '' &&
    form.dateFin >= form.dateDebut &&
    workingDays > 0 &&
    !isBalanceInsufficient

  // ── Employee autocomplete ─────────────────────────────────────────────────

  const handleQueryChange = useCallback((value) => {
    setEmployeeQuery(value)
    setForm((prev) => ({ ...prev, employee: null }))
    setBalance(null)
    setSuggestions([])
    setShowSuggestions(true)

    clearTimeout(debounceTimer.current)

    if (!value.trim()) {
      setLoadingSuggestions(false)
      setShowSuggestions(false)
      return
    }

    setLoadingSuggestions(true)

    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchEmployees(value)
        setSuggestions(results)
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoadingSuggestions(false)
      }
    }, DEBOUNCE_MS)
  }, [])

  const selectEmployee = useCallback((employee) => {
    setForm((prev) => ({ ...prev, employee }))
    setEmployeeQuery(employee.nomComplet)
    setSuggestions([])
    setShowSuggestions(false)
  }, [])

  const clearEmployee = useCallback(() => {
    setForm((prev) => ({ ...prev, employee: null }))
    setEmployeeQuery('')
    setBalance(null)
    setSuggestions([])
    setShowSuggestions(false)
  }, [])

  // ── Fetch balance when employee changes ───────────────────────────────────

  useEffect(() => {
    if (!form.employee) {
      setBalance(null)
      return
    }

    ignoreRef.current = false
    setLoadingBalance(true)

    getLeaveBalance(form.employee.id)
      .then((data) => {
        if (!ignoreRef.current) setBalance(data)
      })
      .catch(() => {
        if (!ignoreRef.current) setBalance(null)
      })
      .finally(() => {
        if (!ignoreRef.current) setLoadingBalance(false)
      })

    return () => {
      ignoreRef.current = true
    }
  }, [form.employee])

  // ── Form field updates ────────────────────────────────────────────────────

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!isFormValid || submitting) return

    setSubmitting(true)
    setToast(null)

    try {
      await createLeave({
        employeId: form.employee.id,
        type: form.type,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
        motif: form.motif,
      })

      setToast({ type: 'success', message: 'Demande de congé créée avec succès !' })

      // Reset form
      setForm(INITIAL_FORM)
      setEmployeeQuery('')
      setBalance(null)

      // Callback parent (rafraîchir liste)
      setTimeout(() => {
        onSuccess?.()
      }, 900)
    } catch {
      setToast({ type: 'error', message: 'Impossible de créer la demande. Veuillez réessayer.' })
    } finally {
      setSubmitting(false)
    }
  }, [form, isFormValid, submitting, onSuccess])

  // ── Reset ─────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setForm(INITIAL_FORM)
    setEmployeeQuery('')
    setBalance(null)
    setSuggestions([])
    setShowSuggestions(false)
    setToast(null)
  }, [])

  return {
    // Form state
    form,
    employeeQuery,
    updateField,

    // Autocomplete
    suggestions,
    loadingSuggestions,
    showSuggestions,
    setShowSuggestions,
    handleQueryChange,
    selectEmployee,
    clearEmployee,

    // Balance
    balance,
    loadingBalance,

    // Computed
    workingDays,
    isBalanceInsufficient,
    isFormValid,

    // Submit
    submitting,
    handleSubmit,

    // Toast & reset
    toast,
    clearToast: () => setToast(null),
    reset,
  }
}
