import { useCallback, useEffect, useMemo, useState } from 'react'
import { approveLeave, getLeaves, getPendingCount, rejectLeave } from '../api/leaves'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

const initialFilters = {
  status: '',
  department: '',
  month: currentMonth(),
}

export default function useLeaves() {
  const [filters, setFilters] = useState(initialFilters)
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [toast, setToast] = useState(null)

  const loadLeaves = useCallback(async () => {
    setLoading(true)
    setToast(null)

    try {
      const [leavesData, countData] = await Promise.all([
        getLeaves(filters),
        getPendingCount(),
      ])
      setLeaves(leavesData)
      setPendingCount(countData)
    } catch {
      setToast({ type: 'error', message: 'Impossible de charger les demandes de congé.' })
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadLeaves()
  }, [loadLeaves])

  const departments = useMemo(() => {
    return leaves
      .map((leave) => leave.departementNom)
      .filter(Boolean)
      .filter((department, index, list) => list.indexOf(department) === index)
  }, [leaves])

  const approvedLeaves = useMemo(() => {
    return leaves.filter((leave) => leave.statut === 'APPROUVE')
  }, [leaves])

  const updateFilter = useCallback((name, value) => {
    setFilters((current) => ({ ...current, [name]: value }))
  }, [])

  const processLeave = useCallback(async ({ id, action, comment }) => {
    setProcessingId(id)
    setToast(null)

    try {
      const updated = action === 'approve'
        ? await approveLeave(id, comment)
        : await rejectLeave(id, comment)

      setLeaves((current) => current.map((leave) => (leave.id === updated.id ? updated : leave)))
      const nextCount = await getPendingCount()
      setPendingCount(nextCount)
      setToast({
        type: 'success',
        message: action === 'approve' ? 'Demande approuvée avec succès.' : 'Demande refusée avec succès.',
      })
    } catch {
      setToast({ type: 'error', message: 'Action impossible pour cette demande.' })
    } finally {
      setProcessingId(null)
    }
  }, [])

  return {
    filters,
    leaves,
    departments,
    approvedLeaves,
    loading,
    processingId,
    pendingCount,
    toast,
    updateFilter,
    processLeave,
    clearToast: () => setToast(null),
    reload: loadLeaves,
  }
}
