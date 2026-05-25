import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'

// --- COMPOSANTS INTERNES POUR LE CLEAN CODE ---

const FeatureRow = ({ icon, title, desc }) => (
  <div className="flex items-start gap-4 group transition-transform hover:translate-x-1">
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-400 shadow-inner group-hover:bg-white/20 transition-colors">
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icon}
      </svg>
    </div>
    <div>
      <h3 className="font-bold text-white text-lg">{title}</h3>
      <p className="text-sm text-indigo-100/70 leading-relaxed">{desc}</p>
    </div>
  </div>
)

const InputField = ({ label, icon, error, rightElement, ...props }) => {
  const paddingRight = rightElement ? 'pr-16' : 'pr-4'

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-700 transition-colors">
          {icon}
        </span>
        <input
          {...props}
          className={`block w-full rounded-[1.25rem] border bg-slate-50/90 py-4 pl-14 ${paddingRight} text-sm text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:ring-4 ${
            error
              ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
              : 'border-slate-200 focus:border-blue-700 focus:ring-blue-100'
          }`}
        />
        {rightElement}
      </div>
      {error && <p className="mt-1 text-sm font-medium text-red-500 animate-pulse">{error}</p>}
    </div>
  )
}

const Icon = ({ name, size = 20, className = '' }) => {
  const icons = {
    'eye-outline': (
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
    'eye-off-outline': (
      <>
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </>
    ),
    'alert-circle-outline': (
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    check: (
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    ),
    'close-circle-outline': (
      <>
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </>
    ),
    'arrow-right': (
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {icons[name] || null}
    </svg>
  )
}

// --- COMPOSANT PRINCIPAL ---

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const emailRef = useRef(null)

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)

  // Redirection automatique basée sur le rôle
  useEffect(() => {
    if (user?.role) {
      const rolePath = user.role.toLowerCase().replace('_', '')
      navigate(`/${rolePath}`, { replace: true })
    }
  }, [user, navigate])

  useEffect(() => { emailRef.current?.focus() }, [])

  // Détection CapsLock
  useEffect(() => {
    const checkCaps = (e) => setCapsLock(e.getModifierState('CapsLock'))
    window.addEventListener('keydown', checkCaps)
    return () => window.removeEventListener('keydown', checkCaps)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => {
        const newErrs = {...prev};
        delete newErrs[name];
        return newErrs;
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    
    if (!form.username.trim() || !form.password) {
      setErrors({
        username: !form.username.trim() ? "Identifiant requis" : null,
        password: !form.password ? "Mot de passe requis" : null
      })
      return
    }

    setLoading(true)
    try {
      const userData = await login(form)
      const rolePath = userData.role.toLowerCase().replace('_', '')
      navigate(`/${rolePath}`, { replace: true })
    } catch (err) {
      setServerError(err.response?.status === 401 
        ? 'Identifiants incorrects' 
        : 'Service momentanément indisponible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      
      {/* PANNEAU GAUCHE - BRANDING */}
      <div className="relative hidden w-[45%] lg:block overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-900/95 via-indigo-900/80 to-[#1e3a8a]/90" />
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1974&auto=format&fit=crop"
          alt="Équipe RH"
        />
        
        <div className="relative z-20 flex h-full flex-col justify-between p-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  <div className="h-6 w-6 bg-blue-700 rounded-md rotate-45" />
               </div>
               <h1 className="text-3xl font-black text-white tracking-tighter italic">Digitrans RH</h1>
            </div>
            
            <div className="h-1 w-20 bg-emerald-400 rounded-full" />
            
            <h2 className="text-5xl font-extrabold text-white leading-tight">
              L'intelligence au service de l'humain.
            </h2>
          </div>
          
          <div className="space-y-10">
            <FeatureRow
              title="Centralisation Intelligente"
              desc="Remplacez vos dossiers papiers par une base de données centralisée et sécurisée."
              icon={<path strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
            />
            <FeatureRow
              title="Prédiction XGBoost"
              desc="Anticipez l'absentéisme et le turnover grâce à nos algorithmes d'analyse prédictive."
              icon={<path strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
            />
            <FeatureRow
              title="Conformité Cameroun"
              desc="Génération automatique des rapports et documents conformes aux normes locales."
              icon={<path strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
            />
          </div>

          <div className="flex items-center gap-4 text-indigo-200/60 text-xs font-medium">
             <span>SIGRH v2.5.0</span>
             <span>•</span>
             <span>© {new Date().getFullYear()} Digitrans Technology</span>
          </div>
        </div>
      </div>

      {/* PANNEAU DROIT - FORMULAIRE */}
      
      <div className="flex flex-1 items-center justify-center bg-white px-6 sm:px-12">
        <div className="w-full max-w-md space-y-10">
          
          <div className="text-center lg:text-left space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Connexion</h2>
            <p className="text-slate-500 font-medium">Accédez à votre tableau de bord RH</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <InputField
              label="Nom d'utilisateur"
              name="username"
              type="text"
              ref={emailRef}
              value={form.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Ex: j.kouam"
              icon={<path strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
            />

            <InputField
              label="Mot de passe"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              icon={<path strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-blue-700 transition-colors"
                >
                  <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} />
                </button>
              }
            />

            {capsLock && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 border border-amber-100">
                <Icon name="alert-circle-outline" size={16} />
                Attention : Verrouillage majuscule activé
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-2 group">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-200 checked:bg-blue-700 checked:border-blue-700 transition-all"
                    />
                    <Icon name="check" size={16} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Rester connecté</span>
              </label>
              <button type="button" className="text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors">
                Mot de passe oublié ?
              </button>
            </div>

            {serverError && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100">
                <Icon name="close-circle-outline" size={20} />
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`group relative flex w-full items-center justify-center overflow-hidden rounded-2xl py-4 text-sm font-black uppercase tracking-widest text-white transition-all ${
                loading ? 'bg-slate-400' : 'bg-blue-700 hover:bg-blue-800 shadow-xl shadow-blue-200 active:scale-95'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                   <LoadingSpinner size="sm" />
                   <span>Authentification...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <span>Se connecter</span>
                   <Icon name="arrow-right" size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <div className="pt-8 text-center">
             <p className="text-sm text-slate-500">
                Besoin d'assistance ? <span className="font-bold text-blue-700 cursor-pointer hover:underline">Contactez le support technique</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}