import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'

const features = [
  {
    icon: (
      <path strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    ),
    title: 'Centralisation Intelligente',
    desc: 'Remplacez vos dossiers papiers par une base centralisée et sécurisée.',
  },
  {
    icon: (
      <path strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
    title: 'Prédiction XGBoost',
    desc: 'Anticipez absentéisme et turnover grâce à l\'IA.',
  },
  {
    icon: (
      <path strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
    title: 'Conformité Cameroun',
    desc: 'Rapports et documents conformes aux normes locales.',
  },
]

function FeatureRow({ icon, title, desc, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.12, duration: 0.5, ease: 'easeOut' }}
      className="group flex items-start gap-4"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-400 ring-1 ring-white/10 backdrop-blur transition-all duration-300 group-hover:bg-white/20 group-hover:ring-white/20">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        <p className="mt-0.5 text-sm text-white/60 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

function InputField({ label, error, rightElement, className, ...props }) {
  const [focused, setFocused] = useState(false)
  const id = props.id || props.name

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className={`relative rounded-xl border-2 bg-white transition-all duration-200 ${
        error
          ? 'border-red-400 bg-red-50/50'
          : focused
            ? 'border-blue-600 bg-white shadow-[0_0_0_3px_rgba(37,99,235,0.1)]'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
      }`}>
        <input
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="block w-full bg-transparent px-4 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1 text-xs font-semibold text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const usernameRef = useRef(null)

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role) {
      if (user.firstLogin && user.employeId) {
        navigate(`/employees/${user.employeId}`, { replace: true })
      } else if (user.firstLogin) {
        navigate('/auth/change-password', { replace: true })
      } else {
        const rolePath = user.role.toLowerCase().replace('_', '')
        navigate(`/${rolePath}`, { replace: true })
      }
    }
  }, [user, navigate])

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  useEffect(() => {
    const checkCaps = (e) => setCapsLock(e.getModifierState('CapsLock'))
    window.addEventListener('keydown', checkCaps)
    return () => window.removeEventListener('keydown', checkCaps)
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }, [errors])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const newErrors = {}
    if (!form.username.trim()) newErrors.username = 'Identifiant requis'
    if (!form.password) newErrors.password = 'Mot de passe requis'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const userData = await login(form)
      if (userData.firstLogin && userData.employeId) {
        navigate(`/employees/${userData.employeId}`, { replace: true })
      } else if (userData.firstLogin) {
        navigate('/auth/change-password', { replace: true })
      } else {
        const rolePath = userData.role.toLowerCase().replace('_', '')
        navigate(`/${rolePath}`, { replace: true })
      }
    } catch (err) {
      setServerError(
        err.response?.status === 401
          ? 'Identifiants incorrects'
          : 'Service momentanément indisponible'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* LEFT PANEL - BRANDING */}
      <div className="relative hidden w-[45%] lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)]" />

        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating orbs */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between p-14">
          {/* Logo & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg">
                <div className="h-5 w-5 rounded-md bg-gradient-to-br from-blue-700 to-indigo-600" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">SIGRH</span>
            </div>
            <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300" />
            <h2 className="text-[2rem] font-bold leading-[1.2] tracking-tight text-white max-w-xs">
              L'intelligence au service de l'humain.
            </h2>
          </motion.div>

          {/* Features */}
          <div className="space-y-6">
            {features.map((f, i) => (
              <FeatureRow key={f.title} icon={f.icon} title={f.title} desc={f.desc} index={i} />
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex items-center gap-3 text-[11px] font-medium text-white/30"
          >
            <span>SIGRH v2.5.0</span>
            <span className="text-white/10">•</span>
            <span>© {new Date().getFullYear()} Sigrh Technology</span>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex flex-1 items-center justify-center bg-white px-5 sm:px-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex items-center gap-2 lg:hidden mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 shadow">
                <div className="h-4 w-4 rounded bg-white/90" />
              </div>
              <span className="text-lg font-bold text-slate-900">SIGRH</span>
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
              Bienvenue
            </h1>
            <p className="text-sm text-slate-500">
              Connectez-vous pour accéder à votre espace
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants}>
              <InputField
                label="Nom d'utilisateur"
                name="username"
                type="text"
                ref={usernameRef}
                value={form.username}
                onChange={handleChange}
                error={errors.username}
                placeholder="ex: j.kouam"
                autoComplete="username"
                spellCheck={false}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <InputField
                label="Mot de passe"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <>
                          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </>
                      ) : (
                        <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                }
              />
            </motion.div>

            {/* Caps lock warning */}
            <AnimatePresence>
              {capsLock && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-700">
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verrouillage majuscule activé
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Options */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-slate-300 checked:border-blue-600 checked:bg-blue-600 transition-all"
                  />
                  <svg
                    className="absolute left-0.5 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                  Rester connecté
                </span>
              </label>
              <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                Mot de passe oublié ?
              </button>
            </motion.div>

            {/* Server error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={loading}
                className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-slate-400"
          >
            Besoin d'assistance ?{' '}
            <span className="font-semibold text-blue-600 cursor-pointer hover:text-blue-800 transition-colors">
              Contactez le support
            </span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
