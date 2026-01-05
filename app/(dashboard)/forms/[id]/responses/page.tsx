import { createClient } from '@/lib/supabase/server'
import { ResponsesDashboard } from '@/components/responses/responses-dashboard'
import { Form, Response } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

interface ResponsesPageProps {
  params: Promise<{ id: string }>
}

export default async function ResponsesPage({ params }: ResponsesPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Create mock form if not found
  const mockForm: Form = {
    id: id,
    user_id: user?.id || 'mock-user-id',
    title: 'Untitled Form',
    description: null,
    slug: 'untitled-form',
    status: 'published',
    theme: 'minimal',
    questions: [],
    thank_you_message: 'Thank you for your response!',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Try to get form, but use mock if not found
  const { data: formData } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single()

  const form = (formData as Form | null) || mockForm

  // Get responses (will be empty array from mock)
  const { data: responsesData } = await supabase
    .from('responses')
    .select('*')
    .eq('form_id', id)
    .order('submitted_at', { ascending: false })

  const responses = (responsesData || []) as Response[]

  return (
    <ResponsesDashboard 
      form={form} 
      responses={responses} 
    />
  )
}

