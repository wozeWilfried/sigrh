import { useEffect, useState } from 'react'
import { CalendarCheck, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import useAuth from '../../hooks/useAuth'
import { createLeave } from '../../api/leaveCreate'
import { getLeaveBalance } from '../../api/leaveCreate'
import { countWorkingDays } from '../../utils/leaveUtils'

const TYPE_OPTIONS = [
  { value: 'ANNUEL', label: 'Annuel' },
  { value: 'MALADIE', label: 'Maladie' },
  { value: 'EXCEPTIONNEL', label: 'Exceptionnel' },
]

export default function LeaveRequestPage() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    type: 'ANNUEL',
    dateDebut: '',
    dateFin: '',
    motif: '',
  })

  useEffect(() => {
    if (!user?.employeId) return
    setLoadingBalance(true)
    getLeaveBalance(user.employeId)
      .then(setBalance)
      .catch(() => setToast({ type: 'error', message: 'Impossible de charger le solde de congés.' }))
      .finally(() => setLoadingBalance(false))
  }, [user?.employeId])

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: null }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.dateDebut) nextErrors.dateDebut = 'Date de début obligatoire.'
    if (!form.dateFin) nextErrors.dateFin = 'Date de fin obligatoire.'
    if (form.dateDebut && form.dateFin && form.dateDebut > form.dateFin) {
      nextErrors.dateFin = 'La date de fin doit être après la date de début.'
    }
    if (!form.type) nextErrors.type = 'Type de congé obligatoire.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const jours = countWorkingDays(new Date(form.dateDebut), new Date(form.dateFin))
      await createLeave({
        employeId: user.employeId,
        type: form.type,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
        motif: form.motif,
      })
      setToast({ type: 'success', message: 'Demande de congé soumise avec succès.' })
      setForm({ type: 'ANNUEL', dateDebut: '', dateFin: '', motif: '' })
      const updated = await getLeaveBalance(user.employeId)
      setBalance(updated)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Échec de la soumission.'
      setToast({ type: 'error', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-deep">Congés</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Nouvelle demande de congé</h1>
          <p className="mt-1 text-sm text-slate-500">Soumettez une demande de congé pour validation.</p>
        </div>

        {toast && (
          <div className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-sm ${
            toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <p className="text-sm font-semibold">{toast.message}</p>
            </div>
            <button type="button" onClick={() => setToast(null)} className="font-bold opacity-70 hover:opacity-100">×</button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h2 className="text-base font-bold text-slate-950">Informations de la demande</h2>
              </div>
              <div className="space-y-5 p-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Type de congé <span className="text-red-500">*</span></span>
                  <select
                    value={form.type}
                    onChange={(e) => updateField('type', e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-colors focus:ring-4 focus:border-blue-deep/30 focus:ring-blue-deep/10"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Date de début <span className="text-red-500">*</span></span>
                    <input
                      type="date"
                      value={form.dateDebut}
                      onChange={(e) => updateField('dateDebut', e.target.value)}
                      className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-colors focus:ring-4 ${
                        errors.dateDebut ? 'border-red-200 focus:ring-red-100' : 'border-slate-200 focus:border-blue-deep/30 focus:ring-blue-deep/10'
                      }`}
                    />
                    {errors.dateDebut && <p className="mt-2 text-sm font-medium text-red-600">{errors.dateDebut}</p>}
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Date de fin <span className="text-red-500">*</span></span>
                    <input
                      type="date"
                      value={form.dateFin}
                      onChange={(e) => updateField('dateFin', e.target.value)}
                      className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-colors focus:ring-4 ${
                        errors.dateFin ? 'border-red-200 focus:ring-red-100' : 'border-slate-200 focus:border-blue-deep/30 focus:ring-blue-deep/10'
                      }`}
                    />
                    {errors.dateFin && <p className="mt-2 text-sm font-medium text-red-600">{errors.dateFin}</p>}
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Motif</span>
                  <textarea
                    value={form.motif}
                    onChange={(e) => updateField('motif', e.target.value)}
                    rows={4}
                    placeholder="Raison de votre demande..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:ring-4 focus:border-blue-deep/30 focus:ring-blue-deep/10"
                  />
                </label>
              </div>
            </section>

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-deep px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-hover disabled:cursor-not-allowed disabled:opacity-55"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
                {submitting ? 'Envoi en cours...' : 'Soumettre la demande'}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-bold text-slate-950">Mon solde de congés</h3>
              </div>
              <div className="space-y-4 p-5">
                {loadingBalance ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                  </div>
                ) : balance ? (
                  <>
                    <div className="rounded-xl bg-blue-50 p-4 text-center">
                      <p className="text-3xl font-bold text-blue-deep">{balance.soldeDisponible}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">jours disponibles</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Acquis</span>
                        <span className="font-semibold text-slate-900">{balance.joursAcquis} j</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Consommés</span>
                        <span className="font-semibold text-slate-900">{balance.joursConsommes} j</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">En attente</span>
                        <span className="font-semibold text-amber-600">{balance.joursEnAttente} j</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="py-6 text-center text-sm text-slate-500">Indisponible</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}