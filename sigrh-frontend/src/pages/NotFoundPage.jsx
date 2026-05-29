import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md"
      >
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">404</p>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Page non trouvée
        </h1>
        <p className="mt-4 text-base text-slate-500 leading-relaxed">
          Désolé, nous ne trouvons pas la page que vous recherchez.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
          >
            <Home size={16} />
            Accueil
          </button>
        </div>
      </motion.div>
    </div>
  )
}
