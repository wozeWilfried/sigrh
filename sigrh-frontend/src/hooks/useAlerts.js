import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAlerts, getUnreadCount, markAllAsTreated, markAsTreated } from '../api/alerts'

const INITIAL_FILTERS = { type: '', departement: '', statut: '' }

export default function useAlerts(pollingInterval = 30000) {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [processingId, setProcessingId] = useState(null)
  const [toast, setToast] = useState(null)

  const isMounted = useRef(true)

  // ── Load Alerts ──────────────────────────────────────────────────────────

  const loadAlerts = useCallback(async (activeFilters = INITIAL_FILTERS) => {
    setLoading(true)
    try {
      const data = await getAlerts(activeFilters)
      if (isMounted.current) {
        setAlerts(data)
      }
    } catch {
      if (isMounted.current) setToast({ type: 'error', message: 'Impossible de charger les alertes.' })
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  // ── Update unread count ──────────────────────────────────────────────────

  const updateUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount()
      if (isMounted.current) setUnreadCount(count)
    } catch (e) {
      // silent fail for polling
    }
  }, [])

  // ── Init & Polling ───────────────────────────────────────────────────────

  useEffect(() => {
    isMounted.current = true
    loadAlerts(filters)
    updateUnreadCount()

    // Polling only for unread count if interval is provided and > 0
    let intervalId = null
    if (pollingInterval > 0) {
      intervalId = setInterval(updateUnreadCount, pollingInterval)
    }

    return () => {
      isMounted.current = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [filters, loadAlerts, updateUnreadCount, pollingInterval])

  // ── Filters ──────────────────────────────────────────────────────────────

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  // ── Actions ──────────────────────────────────────────────────────────────

  const treatAlert = useCallback(async (id) => {
    setProcessingId(id)
    try {
      await markAsTreated(id)
      if (!isMounted.current) return
      
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, statut: 'TRAITEE' } : a))
      )
      updateUnreadCount()
      setToast({ type: 'success', message: 'Alerte marquée comme traitée.' })
    } catch {
      if (isMounted.current) setToast({ type: 'error', message: 'Impossible de traiter cette alerte.' })
    } finally {
      if (isMounted.current) setProcessingId(null)
    }
  }, [updateUnreadCount])

  const treatAll = useCallback(async () => {
    try {
      await markAllAsTreated()
      if (!isMounted.current) return

      setAlerts((prev) => prev.map((a) => ({ ...a, statut: 'TRAITEE' })))
      updateUnreadCount()
      setToast({ type: 'success', message: 'Toutes les alertes ont été traitées.' })
    } catch {
      if (isMounted.current) setToast({ type: 'error', message: 'Impossible de traiter les alertes.' })
    }
  }, [updateUnreadCount])

  // ── Departments list ──────────────────────────────────────────────────────

  const departments = useMemo(() => {
    return [...new Set(alerts.map((a) => a.departement).filter(Boolean))]
  }, [alerts])

  return {
    alerts,
    unreadCount,
    loading,
    filters,
    processingId,
    toast,
    departments,
    updateFilter,
    treatAlert,
    treatAll,
    clearToast: () => setToast(null),
    reload: () => {
      loadAlerts(filters)
      updateUnreadCount()
    },
  }
}
