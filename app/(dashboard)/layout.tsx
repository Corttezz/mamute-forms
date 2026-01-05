import { createClient } from '@/lib/supabase/server'
import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Always allow access - no authentication required
  const mockUser = user || {
    id: 'mock-user-id',
    email: 'john@example.com',
    user_metadata: {
      full_name: 'John Doe',
      avatar_url: null,
    },
  }

  return (
    <DashboardWrapper user={mockUser as any}>
      {children}
    </DashboardWrapper>
  )
}
