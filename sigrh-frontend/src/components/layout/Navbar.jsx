import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  LogOut,
  Menu,
  Search,
  SlidersHorizontal,
  User,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import NotificationBell from './NotificationBell'

export default function Navbar({ onMobileToggle }) {
  const { user, logout, roleDisplayName } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  const userInitial = user?.username?.charAt(0).toUpperCase() || 'A'

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      <div className="flex min-h-14 w-full items-center gap-4">
        <button
          type="button"
          onClick={onMobileToggle}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 lg:hidden"
          aria-label="Menu"
        >
          <Menu size={21} strokeWidth={1.9} />
        </button>

        <div className="relative hidden w-full max-w-xl sm:block">
          <Search
            size={17}
            strokeWidth={2}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Rechercher un employé, département..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600/30 focus:bg-white focus:ring-3 focus:ring-blue-600/10"
          />
          <button
            type="button"
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
            aria-label="Filtres"
          >
            <SlidersHorizontal size={15} strokeWidth={1.9} />
          </button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <NotificationBell />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-white pl-2 pr-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
              aria-expanded={showDropdown}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-xs font-bold text-white">
                {userInitial}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight text-slate-900">
                  {user?.username}
                </p>
                <p className="text-[11px] leading-tight text-slate-500">
                  {roleDisplayName()}
                </p>
              </div>
              <ChevronDown
                size={14}
                strokeWidth={2.5}
                className={`hidden text-slate-400 transition-transform sm:block ${
                  showDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5"
                >
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                    <p className="text-xs text-slate-500">{roleDisplayName()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(false)}
                    className="mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <User size={15} strokeWidth={1.9} />
                    Mon profil
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={15} strokeWidth={1.9} />
                    Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
