'use client'

import { useSession } from 'next-auth/react'
import { Bell, User } from 'lucide-react'
import { GlobalSearch } from './global-search'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from 'next-auth/react'

export function Topbar() {
  const { data: session } = useSession()

  return (
    <header className="h-[60px] border-b border-[#1e1e1e] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      <GlobalSearch />

      <div className="flex items-center gap-3">
        {/* Notifications placeholder */}
        <button className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-zinc-300 hidden md:block">
                {session?.user?.name || 'Admin'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-[#1a1a1a] border-[#333] text-white"
          >
            <div className="px-2 py-1.5 text-xs text-zinc-500">
              {session?.user?.email}
            </div>
            <DropdownMenuSeparator className="bg-[#333]" />
            <DropdownMenuItem asChild>
              <Link
                href="/perfil"
                className="cursor-pointer text-zinc-300 focus:text-white focus:bg-white/5"
              >
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#333]" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/5"
            >
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
