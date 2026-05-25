import { useCallback, useEffect, useMemo, useState } from 'react'
import { getEmployees } from '../api/employees'
import useAuth from './useAuth'

const DEFAULT_PAGE_SIZE = 8

function normalizeEmployeeResponse(data, fallbackPage, fallbackSize) {
  if (Array.isArray(data)) {
    return {
      employees: data,
      page: fallbackPage,
      size: fallbackSize,
      totalElements: data.length,
      totalPages: 1,
    }
  }

  return {
    employees: data?.content ?? data?.employees ?? data?.data ?? [],
    page: data?.number ?? data?.page ?? fallbackPage,
    size: data?.size ?? fallbackSize,
    totalElements: data?.totalElements ?? data?.total ?? data?.count ?? 0,
    totalPages: data?.totalPages ?? 1,
  }
}

function getManagerDepartment(user) {
  return user?.departmentId ?? user?.department?.id ?? user?.departmentName ?? user?.department ?? ''
}

export default function useEmployees({
  page,
  size = DEFAULT_PAGE_SIZE,
  search,
  department,
  position,
  status,
}) {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [pagination, setPagination] = useState({
    page: 0,
    size,
    totalElements: 0,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const queryParams = useMemo(() => {
    const managerDepartment = user?.role === 'MANAGER' ? getManagerDepartment(user) : ''

    return {
      page,
      size,
      search: search || undefined,
      department: managerDepartment || department || undefined,
      position: position || undefined,
      status: status || undefined,
    }
  }, [department, page, position, search, size, status, user])

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getEmployees(queryParams)
      const normalized = normalizeEmployeeResponse(data, page, size)

      setEmployees(normalized.employees)
      setPagination({
        page: normalized.page,
        size: normalized.size,
        totalElements: normalized.totalElements,
        totalPages: normalized.totalPages,
      })
    } catch (fetchError) {
      setError(fetchError)
      setEmployees([])
      setPagination((current) => ({ ...current, totalElements: 0, totalPages: 1 }))
    } finally {
      setLoading(false)
    }
  }, [page, queryParams, size])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  return {
    employees,
    pagination,
    loading,
    error,
    refetch: fetchEmployees,
    isManagerScoped: user?.role === 'MANAGER',
  }
}
