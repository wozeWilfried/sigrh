import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-24 text-center">
      <p className="text-base font-semibold leading-8 text-blue-600">404</p>
      <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
        Page non trouvée
      </h1>
      <p className="mt-6 text-base leading-7 text-slate-600 max-w-md">
        Désolé, nous ne trouvons pas la page que vous recherchez. Elle a peut-être été déplacée ou supprimée.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold leading-6 text-slate-900 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour en arrière
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-95"
        >
          <Home size={16} />
          Retour au Dashboard
        </button>
      </div>
    </div>
  )
}
