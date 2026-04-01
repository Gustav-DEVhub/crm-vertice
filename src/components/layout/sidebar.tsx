'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Building,
  Users,
  UserCircle,
  CalendarDays,
  Receipt,
  Coins,
  FolderOpen,
  Briefcase,
  Shield,
  Settings,
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const mainNav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/propiedades', label: 'Propiedades', icon: Building },
  { href: '/agentes', label: 'Agentes', icon: Users },
  { href: '/clientes', label: 'Clientes', icon: UserCircle },
  { href: '/actividad', label: 'Actividad', icon: CalendarDays },
]

const businessNav = [
  { href: '/transacciones', label: 'Transacciones', icon: Receipt },
  { href: '/comisiones', label: 'Comisiones', icon: Coins },
  { href: '/expedientes', label: 'Expedientes', icon: FolderOpen },
  { href: '/profesionales', label: 'Profesionales', icon: Briefcase },
]

const systemNav = [
  { href: '/auditoria', label: 'Auditoría', icon: Shield },
  { href: '/perfil', label: 'Configuración', icon: Settings },
  { href: '/privacidad', label: 'Privacidad RGPD', icon: Shield },
]

function NavGroup({
  title,
  items,
  collapsed,
  pathname,
}: {
  title: string
  items: typeof mainNav
  collapsed: boolean
  pathname: string
}) {
  return (
    <div className="mb-6">
      {!collapsed && (
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
          {title}
        </p>
      )}
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          const Icon = item.icon

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon
                className={cn(
                  'w-[18px] h-[18px] shrink-0 transition-colors',
                  isActive
                    ? 'text-orange-400'
                    : 'text-zinc-500 group-hover:text-zinc-300'
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
              )}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="bg-[#1a1a1a] text-white border-[#333]">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return <div key={item.href}>{linkContent}</div>
        })}
      </nav>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col border-r border-[#1e1e1e] bg-[#0f0f0f] transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Brand */}
      <div className="p-4 flex items-center gap-3 border-b border-[#1e1e1e]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-white leading-tight">
              Vértice
            </h1>
            <p className="text-[10px] text-zinc-500">Inmobiliaria CRM</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
        <NavGroup
          title="Principal"
          items={mainNav}
          collapsed={collapsed}
          pathname={pathname}
        />
        <NavGroup
          title="Negocio"
          items={businessNav}
          collapsed={collapsed}
          pathname={pathname}
        />
        <NavGroup
          title="Sistema"
          items={systemNav}
          collapsed={collapsed}
          pathname={pathname}
        />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#1e1e1e]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors mb-2"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Colapsar</span>
            </>
          )}
        </button>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer">
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>Cerrar Sesión</span>}
            </div>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="bg-[#1a1a1a] text-white border-[#333]">
              Cerrar Sesión
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  )
}
