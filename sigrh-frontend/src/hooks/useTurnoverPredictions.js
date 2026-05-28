import { useCallback, useEffect, useMemo, useState } from 'react'
import { getTurnoverPredictions, runTurnoverPrediction } from '../api/turnoverPredictions'

const INITIAL_FILTERS = { niveau: '', departement: '' }

export default function useTurnoverPredictions() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [toast, setToast] = useState(null)

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async (activeFilters = INITIAL_FILTERS) => {
    setLoading(true)
    setToast(null)
    try {
      const data = await getTurnoverPredictions(activeFilters)
      setPredictions(data)
    } catch {
      setToast({ type: 'error', message: 'Impossible de charger les prédictions.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(filters)
  }, [filters, load])

  // ── Filters ───────────────────────────────────────────────────────────────

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  // ── Run prediction ────────────────────────────────────────────────────────

  const runPrediction = useCallback(async () => {
    if (predicting) return
    setPredicting(true)
    setToast(null)
    try {
      const data = await runTurnoverPrediction()
      setPredictions(data)
      setFilters(INITIAL_FILTERS)
      setToast({ type: 'success', message: 'Prédiction IA mise à jour avec succès !' })
    } catch {
      setToast({ type: 'error', message: 'Erreur lors du calcul IA. Veuillez réessayer.' })
    } finally {
      setPredicting(false)
    }
  }, [predicting])

  // ── Computed KPIs ─────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const all = predictions
    const eleve = all.filter((p) => p.niveau === 'ELEVE')
    const moyen = all.filter((p) => p.niveau === 'MOYEN')
    const alertesActives = eleve.length + moyen.length
    const avgScore =
      all.length > 0
        ? Math.round(all.reduce((sum, p) => sum + p.scoreRisque, 0) / all.length)
        : 0

    return {
      total: all.length,
      eleve: eleve.length,
      moyen: moyen.length,
      faible: all.length - eleve.length - moyen.length,
      alertesActives,
      avgScore,
    }
  }, [predictions])

  // ── Departments list ──────────────────────────────────────────────────────

  const departments = useMemo(() => {
    return [...new Set(predictions.map((p) => p.departement).filter(Boolean))]
  }, [predictions])

  return {
    predictions,
    loading,
    predicting,
    filters,
    updateFilter,
    kpis,
    departments,
    runPrediction,
    toast,
    clearToast: () => setToast(null),
    reload: () => load(filters),
  }
}
