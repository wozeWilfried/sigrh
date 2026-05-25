import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getAttendanceEmployees,
  getAttendanceHistory,
  getAttendanceStats,
} from '../api/attendanceAnalytics'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

const initialFilters = {
  employeeId: '',
  department: '',
  startDate: daysAgo(13),
  endDate: today(),
}

export default function useAttendanceAnalytics() {
  const [filters, setFilters] = useState(initialFilters)
  const [employeeQuery, setEmployeeQuery] = useState('')
  const [employees, setEmployees] = useState([])
  const [history, setHistory] = useState({ employees: [], days: [], records: [] })
  const [stats, setStats] = useState({
    globalPresenceRate: 0,
    topAbsentees: [],
    weeklyEvolution: [],
    totals: {},
  })
  const [loading, setLoading] = useState(true)
  const [employeesLoading, setEmployeesLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    async function loadEmployees() {
      setEmployeesLoading(true)
      try {
        const data = await getAttendanceEmployees()
        if (!ignore) setEmployees(data)
      } finally {
        if (!ignore) setEmployeesLoading(false)
      }
    }

    loadEmployees()
    return () => {
      ignore = true
    }
  }, [])

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [historyData, statsData] = await Promise.all([
        getAttendanceHistory(filters),
        getAttendanceStats(filters),
      ])
      setHistory(historyData)
      setStats(statsData)
    } catch {
      setError('Impossible de charger les statistiques de présence.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const departments = useMemo(() => {
    return employees
      .map((employee) => employee.departementNom)
      .filter(Boolean)
      .filter((department, index, list) => list.indexOf(department) === index)
  }, [employees])

  const employeeSuggestions = useMemo(() => {
    const query = employeeQuery.trim().toLowerCase()
    if (!query) return employees.slice(0, 6)

    return employees
      .filter((employee) => {
        const label = `${employee.prenom} ${employee.nom} ${employee.email}`.toLowerCase()
        return label.includes(query)
      })
      .slice(0, 6)
  }, [employeeQuery, employees])

  const selectedEmployee = useMemo(() => {
    return employees.find((employee) => Number(employee.id) === Number(filters.employeeId)) ?? null
  }, [employees, filters.employeeId])

  const activeFiltersCount = useMemo(() => {
    return [filters.employeeId, filters.department, filters.startDate, filters.endDate].filter(Boolean).length
  }, [filters])

  const updateFilter = useCallback((name, value) => {
    setFilters((current) => ({ ...current, [name]: value }))
  }, [])

  const selectEmployee = useCallback((employee) => {
    setFilters((current) => ({ ...current, employeeId: employee?.id ?? '' }))
    setEmployeeQuery(employee ? `${employee.prenom} ${employee.nom}` : '')
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    setEmployeeQuery('')
  }, [])

  return {
    filters,
    history,
    stats,
    loading,
    error,
    employeesLoading,
    departments,
    employeeQuery,
    employeeSuggestions,
    selectedEmployee,
    activeFiltersCount,
    updateFilter,
    setEmployeeQuery,
    selectEmployee,
    resetFilters,
    reload: loadAnalytics,
  }
}
