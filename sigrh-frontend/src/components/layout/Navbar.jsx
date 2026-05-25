import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  SlidersHorizontal,
  User,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'

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
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.035)] backdrop-blur sm:px-6">
      <div className="flex min-h-14 w-full items-center">
        <button
          type="button"
          onClick={onMobileToggle}
          className="mr-4 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu size={21} strokeWidth={1.9} />
        </button>

        <div className="relative hidden w-full max-w-2xl sm:block">
          <Search
            size={18}
            strokeWidth={1.9}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Rechercher un employé, un département, un rapport..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-12 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-deep/30 focus:bg-white focus:ring-4 focus:ring-blue-deep/10"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
            aria-label="Filtres de recherche"
          >
            <SlidersHorizontal size={16} strokeWidth={1.9} />
          </button>
        </div>

        <div className="ml-auto flex flex-shrink-0 items-center justify-end gap-3 pl-6">
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={1.9} />
            <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
              3
            </span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDropdown((current) => !current)}
              className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
              aria-expanded={showDropdown}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-deep text-sm font-bold text-white shadow-sm">
                {userInitial}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight text-slate-900">
                  {user?.username}
                </p>
                <p className="mt-0.5 text-xs leading-tight text-slate-500">
                  {roleDisplayName()}
                </p>
              </div>
              <ChevronDown
                size={15}
                strokeWidth={2}
                className={`hidden text-slate-400 transition-transform sm:block ${
                  showDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 ring-1 ring-black/5">
                <div className="border-b border-slate-100 px-3 py-3">
                  <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{roleDisplayName()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDropdown(false)}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                >
                  <User size={16} strokeWidth={1.9} />
                  Mon profil
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={16} strokeWidth={1.9} />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
