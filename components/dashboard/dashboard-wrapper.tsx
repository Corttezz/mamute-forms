'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'

type User = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string | null
  }
}

interface DashboardWrapperProps {
  children: React.ReactNode
  user: User
}

export function DashboardWrapper({ children, user }: DashboardWrapperProps) {
  const pathname = usePathname()
  const isFormsRoute = pathname?.startsWith('/forms')

  if (isFormsRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar user={user} />
      <main className="flex-1 ml-64 overflow-auto bg-white">
        {children}
      </main>
    </div>
  )
}





