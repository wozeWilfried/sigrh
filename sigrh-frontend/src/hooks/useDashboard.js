import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getDashboardKpis,
  getAttendanceStats,
  getDepartmentDistribution,
  getRiskTrends,
  getRecentLeaves,
  getRecentAlerts,
} from '../api/dashboard'

export default function useDashboard(pollingInterval = 300000) { // 5 minutes par défaut
  const [data, setData] = useState({
    kpis: null,
    attendanceStats: [],
    departmentDistribution: [],
    riskTrends: [],
    recentLeaves: [],
    recentAlerts: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const isMounted = useRef(true)

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    setError(null)

    try {
      const [
        kpis,
        attendanceStats,
        departmentDistribution,
        riskTrends,
        recentLeaves,
        recentAlerts,
      ] = await Promise.all([
        getDashboardKpis(),
        getAttendanceStats(),
        getDepartmentDistribution(),
        getRiskTrends(),
        getRecentLeaves(),
        getRecentAlerts(),
      ])

      if (isMounted.current) {
        setData({
          kpis,
          attendanceStats,
          departmentDistribution,
          riskTrends,
          recentLeaves,
          recentAlerts,
        })
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Impossible de charger les données du tableau de bord.')
      }
    } finally {
      if (isMounted.current && !isSilent) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchDashboardData()

    let intervalId = null
    if (pollingInterval > 0) {
      intervalId = setInterval(() => fetchDashboardData(true), pollingInterval)
    }

    return () => {
      isMounted.current = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchDashboardData, pollingInterval])

  return {
    ...data,
    loading,
    error,
    refetch: () => fetchDashboardData(false)
  }
}
