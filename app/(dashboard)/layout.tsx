import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper'
import { mockUser } from '@/lib/mock-data'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardWrapper user={mockUser as any}>
      {children}
    </DashboardWrapper>
  )
}
