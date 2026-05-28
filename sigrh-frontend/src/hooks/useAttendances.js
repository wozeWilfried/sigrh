import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getActiveEmployees,
  getAttendancesByDate,
  saveAttendances,
  today,
} from '../api/attendanceEntry'

const defaultAttendance = {
  heureArrivee: '08:00',
  heureDepart: '17:00',
  statut: 'PRESENT',
  alreadySaved: false,
  dirty: false,
}

function buildRows(employees, attendances) {
  const attendanceByEmployee = attendances.reduce((map, attendance) => {
    map[attendance.employeId] = attendance
    return map
  }, {})

  return employees.map((employee) => {
    const existing = attendanceByEmployee[employee.id]

    return {
      employee,
      values: existing
        ? {
            heureArrivee: existing.heureArrivee || '08:00',
            heureDepart: existing.heureDepart || '17:00',
            statut: existing.statut || 'PRESENT',
            alreadySaved: true,
            dirty: false,
          }
        : { ...defaultAttendance },
      error: '',
    }
  })
}

function validateRow(values) {
  if (values.statut === 'ABSENT') return ''
  if (!values.heureArrivee || !values.heureDepart) return 'Les heures sont obligatoires.'
  if (values.heureDepart <= values.heureArrivee) return 'Le départ doit être après l’arrivée.'
  return ''
}

export default function useAttendances() {
  const [date, setDate] = useState(today())
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const loadRows = useCallback(async () => {
    setLoading(true)
    setToast(null)

    try {
      const [employees, attendances] = await Promise.all([
        getActiveEmployees(),
        getAttendancesByDate(date),
      ])
      setRows(buildRows(employees, attendances))
    } catch {
      setToast({ type: 'error', message: 'Impossible de charger les présences.' })
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    loadRows()
  }, [loadRows])

  const updateRow = useCallback((employeeId, field, value) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (Number(row.employee.id) !== Number(employeeId)) return row

        const nextValues = {
          ...row.values,
          [field]: value,
          dirty: true,
        }

        if (field === 'statut' && value === 'ABSENT') {
          nextValues.heureArrivee = ''
          nextValues.heureDepart = ''
        }

        if (field === 'statut' && value !== 'ABSENT' && row.values.statut === 'ABSENT') {
          nextValues.heureArrivee = '08:00'
          nextValues.heureDepart = '17:00'
        }

        return {
          ...row,
          values: nextValues,
          error: validateRow(nextValues),
        }
      })
    )
  }, [])

  const errorsCount = useMemo(() => rows.filter((row) => row.error).length, [rows])
  const dirtyCount = useMemo(() => rows.filter((row) => row.values.dirty).length, [rows])
  const canSave = rows.length > 0 && errorsCount === 0 && !saving

  const submitAll = useCallback(async () => {
    const validatedRows = rows.map((row) => ({
      ...row,
      error: validateRow(row.values),
    }))
    const hasErrors = validatedRows.some((row) => row.error)
    setRows(validatedRows)

    if (hasErrors) {
      setToast({ type: 'error', message: 'Corrigez les lignes en erreur avant l’enregistrement.' })
      return
    }

    setSaving(true)
    setToast(null)

    try {
      const payloads = rows.map((row) => ({
        employeId: row.employee.id,
        date,
        statut: row.values.statut,
        heureArrivee: row.values.statut === 'ABSENT' ? null : row.values.heureArrivee,
        heureDepart: row.values.statut === 'ABSENT' ? null : row.values.heureDepart,
      }))

      await saveAttendances(payloads)
      setRows((currentRows) =>
        currentRows.map((row) => ({
          ...row,
          values: {
            ...row.values,
            alreadySaved: true,
            dirty: false,
          },
        }))
      )
      setToast({ type: 'success', message: `${payloads.length} présence(s) enregistrée(s).` })
    } catch {
      setToast({ type: 'error', message: 'Enregistrement impossible.' })
    } finally {
      setSaving(false)
    }
  }, [date, rows])

  return {
    date,
    rows,
    loading,
    saving,
    toast,
    errorsCount,
    dirtyCount,
    canSave,
    setDate,
    updateRow,
    submitAll,
    clearToast: () => setToast(null),
  }
}
