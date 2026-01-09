'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { FileText, User, LayoutGrid, Settings, MoreVertical, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string | null
  }
}

interface SidebarProps {
  user: User
}

const menuItems = [
  { href: '/dashboard', label: 'Forms', icon: FileText },
  { href: '/contacts', label: 'Contacts', icon: User },
  { href: '/kanban', label: 'Kanban', icon: LayoutGrid },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const initials = user.email?.slice(0, 2).toUpperCase() || 'JD'
  const avatarUrl = user.user_metadata?.avatar_url || undefined
  const fullName = user.user_metadata?.full_name || 'John Doe'
  const email = user.email || 'john@example.com'

  const handleSignOut = async () => {
    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-64 bg-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-10 border-r border-slate-200">
      {/* Logo */}
      <div className="px-6 pt-5 pb-6 border-b border-slate-200">
        <Logo href="/dashboard" size="sm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px' }}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="bg-[#111827] text-white text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 text-sm font-medium truncate" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {fullName}
            </p>
            <p className="text-slate-500 text-xs truncate" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              {email}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

