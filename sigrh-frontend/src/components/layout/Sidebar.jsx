import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Network,
  Settings,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react'
import { getPendingCount } from '../../api/leaves'

const adminNavigation = [
  {
    section: 'Pilotage',
    items: [
      { label: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Gestion RH',
    items: [
      {
        label: 'Employés',
        icon: Users,
        children: [
          { label: 'Liste des employés', path: '/admin/employes' },
          { label: 'Ajouter un employé', path: '/admin/employes/ajouter' },
        ],
      },
      {
        label: 'Congés',
        icon: CalendarCheck,
        badgeKey: 'pendingLeaves',
        children: [
          { label: 'Gestion des congés', path: '/conges' },
        ],
      },
      {
        label: 'Présences',
        icon: ClipboardCheck,
        children: [
          { label: 'Vue générale', path: '/admin/presences' },
          { label: 'Saisie des présences', path: '/presences/saisie' },
          { label: 'Historique & Statistiques', path: '/presences/historique' },
        ],
      },
      {
        label: 'Paie',
        icon: FileText,
        children: [
          { label: 'Fiches de paie', path: '/admin/paie' },
          { label: 'Générer la paie', path: '/admin/paie/generer' },
        ],
      },
    ],
  },
  {
    section: 'Structure',
    items: [
      {
        label: 'Structure',
        icon: Network,
        children: [
          { label: 'Départements & Postes', path: '/departments' },
        ],
      },
    ],
  },
  {
    section: 'Rapports',
    items: [
      {
        label: 'Rapports',
        icon: BarChart3,
        children: [
          { label: 'Export RH global', path: '/admin/rapports' },
        ],
      },
    ],
  },
  {
    section: 'IA & Analytics',
    items: [
      {
        label: 'IA & Analytics',
        icon: BrainCircuit,
        children: [
          { label: 'Prédictions turnover', path: '/ia/predictions' },
        ],
      },
    ],
  },
  {
    section: 'Administration',
    items: [
      { label: 'Utilisateurs', path: '/admin/utilisateurs', icon: UserPlus },
      { label: 'Paramètres', path: '/admin/parametres', icon: Settings },
    ],
  },
]

function getInitialOpenMenus(pathname) {
  return adminNavigation.reduce((openGroups, section) => {
    section.items.forEach((item) => {
      if (item.children?.some((child) => pathname.startsWith(child.path))) {
        openGroups[item.label] = true
      }
    })
    return openGroups
  }, {})
}

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState(() => getInitialOpenMenus(location.pathname))
  const [pendingLeaves, setPendingLeaves] = useState(0)

  useEffect(() => {
    let ignore = false
    getPendingCount()
      .then((count) => { if (!ignore) setPendingLeaves(count) })
      .catch(() => { if (!ignore) setPendingLeaves(0) })
    return () => { ignore = true }
  }, [])

  function toggleMenu(label) {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside
      className={`flex h-screen flex-col border-r border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 ${
        collapsed ? 'w-[88px]' : 'w-[280px]'
      }`}
    >
      <SidebarHeader collapsed={collapsed} />
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {adminNavigation.map((section) => (
            <div key={section.section}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  {section.section}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.label}>
                    {item.children ? (
                      <SidebarGroup
                        item={item}
                        collapsed={collapsed}
                        currentPath={location.pathname}
                        isOpen={Boolean(openMenus[item.label])}
                        onToggle={() => toggleMenu(item.label)}
                        badgeValue={item.badgeKey === 'pendingLeaves' ? pendingLeaves : item.badge}
                      />
                    ) : (
                      <SidebarLink
                        item={item}
                        collapsed={collapsed}
                        badgeValue={item.badgeKey === 'pendingLeaves' ? pendingLeaves : item.badge}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
      <SidebarFooter collapsed={collapsed} onToggle={onToggle} />
    </aside>
  )
}

function SidebarHeader({ collapsed }) {
  return (
    <div className="border-b border-slate-100 px-4 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
          <ShieldCheck size={21} strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-950">SIGRH</p>
            <p className="truncate text-[11px] font-medium text-slate-500">Espace Admin RH</p>
          </div>
        )}
      </div>
      {!collapsed && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
            <Bell size={14} />
            3 demandes à traiter
          </div>
        </div>
      )}
    </div>
  )
}

function SidebarLink({ item, collapsed, badgeValue }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/admin'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-blue-700 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
        } ${collapsed ? 'justify-center' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            size={19}
            strokeWidth={1.8}
            className={isActive ? 'text-white' : 'text-slate-400 transition-colors group-hover:text-slate-700'}
          />
          {!collapsed && (
            <>
              <span className="truncate">{item.label}</span>
              <Badge value={badgeValue} active={isActive} />
            </>
          )}
          {collapsed && <CollapsedBadge value={badgeValue} />}
        </>
      )}
    </NavLink>
  )
}

function SidebarGroup({ item, collapsed, currentPath, isOpen, onToggle, badgeValue }) {
  const isActive = item.children.some((child) => currentPath.startsWith(child.path))

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? item.label : undefined}
        className={`group flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-blue-700 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
        } ${collapsed ? 'justify-center' : ''}`}
      >
        <item.icon
          size={19}
          strokeWidth={1.8}
          className={isActive ? 'text-white' : 'text-slate-400 transition-colors group-hover:text-slate-700'}
        />
        {!collapsed && (
          <>
            <span className="truncate">{item.label}</span>
            <Badge value={badgeValue} active={isActive} />
            <ChevronDown
              size={15}
              strokeWidth={2.5}
              className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
            />
          </>
        )}
      </button>
      {!collapsed && isOpen && (
        <ul className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
          {item.children.map((child) => (
            <li key={child.path}>
              <NavLink
                to={child.path}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-100 font-semibold text-slate-950'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SidebarFooter({ collapsed, onToggle }) {
  return (
    <div className="border-t border-slate-100 p-3">
      {!collapsed && (
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
            <UserCog size={18} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">Administrateur RH</p>
            <p className="truncate text-[11px] text-slate-500">Accès complet</p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
      >
        {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        {!collapsed && <span>Réduire</span>}
      </button>
    </div>
  )
}

function Badge({ value, active }) {
  if (value == null || value === 0) return null
  return (
    <span
      className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
        active ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
      }`}
    >
      {value}
    </span>
  )
}

function CollapsedBadge({ value }) {
  if (value == null || value === 0) return null
  return (
    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
      {value}
    </span>
  )
}
